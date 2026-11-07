#!/usr/bin/env node
/**
 * prep-qa.js - Fast, deterministic QA case extractor for Retrofit.
 * 
 * Extracts test cases from .xlsx, .xlsm, .csv, .json, and .md into qa-cases.json.
 * Zero npm dependencies (built-in fs, path, zlib).
 * 
 * Features:
 * - Full .xlsx reader (sharedStrings, inlineStr, merged cells, multi-sheet)
 * - RFC 4180 CSV parser
 * - Header row detection with priority column matching
 * - Step-per-row assembly ("Step N: ...") and status rollup
 * - Duplicate detection (identical desc+expected -> deduplicated)
 * - Clash handling (same id, different text -> S2 suffix)
 * - Cross-sheet qualification ("<sheet> / <id>")
 * - Exact 10-key schema required by Retrofit Check C1
 * 
 * Usage:
 *   node specs/tools/prep-qa.js --qa <file> [--qa-sheet <name>] [--qa-scope <filter>] --out <specs/<feature>/qa-cases.json>
 */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function parseArgs(argv) {
  const args = { qa: null, qaSheet: null, qaScope: null, out: null };
  for (let i = 2; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--qa') args.qa = argv[++i];
    else if (t === '--qa-sheet') args.qaSheet = argv[++i];
    else if (t === '--qa-scope') args.qaScope = argv[++i];
    else if (t === '--out') args.out = argv[++i];
  }
  return args;
}

function decodeEntities(s) {
  return String(s || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function xmlText(frag) {
  if (!frag) return '';
  return [...frag.matchAll(/<(?:\w+:)?t[^>]*>([\s\S]*?)<\/(?:\w+:)?t>/g)]
    .map((m) => decodeEntities(m[1]))
    .join('');
}

function colToIdx(ref) {
  const m = String(ref || '').match(/^([A-Z]+)/);
  if (!m) return 0;
  let n = 0;
  for (const ch of m[1]) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function unzip(file) {
  const buf = fs.readFileSync(file);
  let eo = -1;
  for (let p = buf.length - 22; p >= 0; p--) {
    if (buf.readUInt32LE(p) === 0x06054b50) {
      eo = p;
      break;
    }
  }
  if (eo < 0) throw new Error('Not a valid zip / .xlsx file');
  const count = buf.readUInt16LE(eo + 10);
  const cdOff = buf.readUInt32LE(eo + 16);
  const out = {};
  let p = cdOff;
  for (let n = 0; n < count && buf.readUInt32LE(p) === 0x02014b50; n++) {
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOff = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    const lNameLen = buf.readUInt16LE(localOff + 26);
    const lExtraLen = buf.readUInt16LE(localOff + 28);
    const dataStart = localOff + 30 + lNameLen + lExtraLen;
    const comp = buf.slice(dataStart, dataStart + compSize);
    let content = null;
    try {
      content = method === 0 ? comp : method === 8 ? zlib.inflateRawSync(comp, { maxOutputLength: 64 * 1024 * 1024 }) : null;
    } catch {
      content = null;
    }
    if (content) out[name] = content.toString('utf8');
    p += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

function parseSheetGrid(sheet, shared) {
  if (!sheet) return [];
  const V = /<(?:\w+:)?v>([\s\S]*?)<\/(?:\w+:)?v>/;
  const grid = [];
  for (const rm of sheet.matchAll(/<(?:\w+:)?row[^>]*>([\s\S]*?)<\/(?:\w+:)?row>/g)) {
    const cells = [];
    for (const cm of rm[1].matchAll(/<(?:\w+:)?c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:\w+:)?c>)/g)) {
      const attrs = cm[1] || '';
      const inner = cm[2] || '';
      const refM = attrs.match(/r="([A-Z]+\d+)"/);
      const idx = refM ? colToIdx(refM[1]) : cells.length;
      const tM = attrs.match(/t="([^"]+)"/);
      const type = tM ? tM[1] : '';
      let val = '';
      if (type === 's') {
        const v = (inner.match(V) || [])[1];
        val = v != null ? (shared[parseInt(v, 10)] || '') : '';
      } else if (type === 'inlineStr' || type === 'str') {
        val = type === 'str' ? decodeEntities((inner.match(V) || [])[1] || '') : xmlText(inner);
      } else {
        const v = (inner.match(V) || [])[1];
        val = v != null ? decodeEntities(v) : (xmlText(inner) || '');
      }
      cells[idx] = val;
    }
    grid.push(cells);
  }
  return grid;
}

function readXlsxSheets(file) {
  const e = unzip(file);
  const shared = [];
  if (e['xl/sharedStrings.xml']) {
    for (const m of e['xl/sharedStrings.xml'].matchAll(/<(?:\w+:)?si>([\s\S]*?)<\/(?:\w+:)?si>/g)) {
      shared.push(xmlText(m[1]));
    }
  }

  const order = [];
  const wb = e['xl/workbook.xml'] || '';
  const rels = e['xl/_rels/workbook.xml.rels'] || '';
  const relMap = {};
  for (const m of rels.matchAll(/<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g)) {
    relMap[m[1]] = m[2].replace(/^\/?xl\//, '').replace(/^\.\//, '');
  }
  for (const m of wb.matchAll(/<sheet[^>]*\/>/g)) {
    const tag = m[0];
    const nm = (tag.match(/name="([^"]*)"/) || [])[1];
    const rid = (tag.match(/r:id="([^"]*)"/) || [])[1];
    const target = rid && relMap[rid] ? 'xl/' + relMap[rid] : null;
    if (nm && target && e[target]) order.push({ name: decodeEntities(nm), key: target });
  }
  if (!order.length) {
    for (const k of Object.keys(e).filter((k) => /^xl\/worksheets\/sheet\d+\.xml$/.test(k)).sort((a, b) => parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10))) {
      order.push({ name: k.replace(/.*sheet(\d+)\.xml/, 'Sheet$1'), key: k });
    }
  }
  return order.map(({ name, key }) => ({ name, grid: parseSheetGrid(e[key], shared) }));
}

function parseCSV(text) {
  const out = [];
  let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else q = false;
      } else cur += c;
    } else if (c === '"') {
      q = true;
    } else if (c === ',') {
      row.push(cur); cur = '';
    } else if (c === '\n') {
      row.push(cur); out.push(row); row = []; cur = '';
    } else if (c !== '\r') {
      cur += c;
    }
  }
  if (cur.length || row.length) { row.push(cur); out.push(row); }
  return out;
}

function headerScore(row) {
  const h = (row || []).map((c) => String(c || '').toLowerCase().trim());
  let score = 0;
  if (h.some((x) => /^(test\s*case\s*id|tc\s*id|testcase\s*id)$/.test(x))) score += 4;
  else if (h.some((x) => /(test\s*case\s*id|tc\s*id)/.test(x))) score += 3;
  if (h.some((x) => /expected/.test(x))) score += 3;
  if (h.some((x) => /description|summary/.test(x))) score += 2;
  if (h.some((x) => /scenario|test\s*case\s*name|title/.test(x))) score += 1;
  if (h.some((x) => /steps/.test(x))) score += 1;
  if (h.filter(Boolean).length >= 4) score += 1;
  return score;
}

function findHeaderRow(grid) {
  let best = -1, bestScore = 0;
  for (let r = 0; r < Math.min(grid.length, 15); r++) {
    const sc = headerScore(grid[r]);
    if (sc > bestScore) {
      bestScore = sc;
      best = r;
    }
  }
  return bestScore >= 4 ? best : -1;
}

function pickCol(header, patterns, exclude = []) {
  const ex = new Set(exclude);
  for (const re of patterns) {
    for (let i = 0; i < header.length; i++) {
      if (ex.has(i)) continue;
      if (re.test(header[i])) return i;
    }
  }
  return -1;
}

function parseMdQA(text) {
  const lines = text.split(/\r?\n/);
  const rows = [];
  let headerFound = false;
  let headers = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    if (trimmed.match(/^\|[-| ]+\|$/)) {
      headerFound = true;
      continue;
    }
    const cells = trimmed.split('|').slice(1, -1).map((s) => s.trim());
    if (!headerFound) {
      headers = cells;
    } else {
      rows.push(cells);
    }
  }
  return { headers, rows };
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.qa || !args.out) {
    console.error('Usage: node prep-qa.js --qa <file> [--qa-sheet <name>] [--qa-scope <filter>] --out <qa-cases.json>');
    process.exit(1);
  }

  const qaFile = path.resolve(args.qa);
  if (!fs.existsSync(qaFile)) {
    console.error(`Error: QA file not found: ${qaFile}`);
    process.exit(1);
  }

  const ext = path.extname(qaFile).toLowerCase();
  let sheets = [];
  if (ext === '.xlsx' || ext === '.xlsm') {
    sheets = readXlsxSheets(qaFile);
  } else if (ext === '.csv') {
    const text = fs.readFileSync(qaFile, 'utf8');
    sheets = [{ name: 'CSV', grid: parseCSV(text) }];
  } else if (ext === '.json') {
    const raw = fs.readFileSync(qaFile, 'utf8');
    const parsed = JSON.parse(raw);
    const existingCases = Array.isArray(parsed) ? parsed : (parsed.cases || []);
    const normalized = {
      cases: existingCases.map((c) => ({
        approach: c.approach || '',
        category: c.category || '',
        desc: c.desc || c.description || '',
        expected: c.expected || '',
        id: c.id || c.tc || '',
        module: c.module || '',
        scenario: c.scenario || '',
        source: c.source || `${path.basename(qaFile)}`,
        status: c.status || 'Not Executed',
        type: c.type || ''
      })),
      generated: new Date().toISOString().slice(0, 10),
      sources: [`${path.basename(qaFile)} [json]`]
    };
    fs.writeFileSync(path.resolve(args.out), JSON.stringify(normalized, null, 2) + '\n', 'utf8');
    console.log(`Wrote ${normalized.cases.length} cases to ${args.out}`);
    return;
  } else if (ext === '.md' || ext === '.txt') {
    const text = fs.readFileSync(qaFile, 'utf8');
    const { headers, rows } = parseMdQA(text);
    sheets = [{ name: 'Markdown', grid: [headers, ...rows] }];
  } else {
    console.error(`Unsupported format: ${ext}`);
    process.exit(1);
  }

  // Filter sheets if --qa-sheet is provided
  if (args.qaSheet && args.qaSheet.toLowerCase() !== 'all') {
    const target = args.qaSheet.toLowerCase().trim();
    sheets = sheets.filter((s) => s.name.toLowerCase().trim() === target || s.name.toLowerCase().includes(target));
  }

  const rawCases = [];
  const sourceSheets = [];
  const duplicatesIgnored = [];
  const clashesSuffixed = [];

  for (const { name: sheetName, grid } of sheets) {
    if (!grid || !grid.length) continue;
    const hr = findHeaderRow(grid);
    if (hr < 0) continue; // Skip non-case sheets (e.g. Dashboard/Summary)

    sourceSheets.push(`${path.basename(qaFile)} [sheet: ${sheetName}]`);
    const header = (grid[hr] || []).map((c) => String(c || '').toLowerCase().trim());

    const idCol = pickCol(header, [/^(test\s*case\s*id|tc\s*id|testcase\s*id)$/, /test\s*case\s*id|tc\s*id/, /^case\s*id$/, /^test\s*id$/, /^id$/]);
    const expCol = pickCol(header, [/^expected\s*result$/, /^expected/, /expected/], [idCol]);
    const descCol = pickCol(header, [/^test\s*case\s*description$/, /^test\s*description$/, /description/, /summary/], [idCol, expCol]);
    const scenCol = pickCol(header, [/^test\s*scenarios?$/, /^test\s*case\s*name$/, /scenario/, /title/, /^name$/], [idCol, expCol, descCol]);
    const modCol = pickCol(header, [/^module\s*name$/, /^module$/, /module/], [idCol, expCol, descCol, scenCol]);
    const typeCol = pickCol(header, [/positive\s*\/?\s*negative/, /^type$/], [idCol, expCol, descCol, scenCol, modCol]);
    const catCol = pickCol(header, [/^test\s*category$/, /category/], [idCol, expCol, descCol, scenCol, modCol, typeCol]);
    const statCol = pickCol(header, [/^status$/], [idCol, expCol, descCol, scenCol, modCol, typeCol, catCol]);
    const stepCol = pickCol(header, [/^step\s*(?:no|number)?$/, /steps?/], [idCol, expCol, descCol, scenCol, modCol, typeCol, catCol, statCol]);

    const cell = (r, idx) => (idx >= 0 && r[idx] != null ? String(r[idx]).trim() : '');

    // First pass to see if sheet contains step continuation rows
    let sheetHasContinuationRows = false;
    for (let r = hr + 1; r < grid.length; r++) {
      const row = grid[r];
      if (!row || row.every((c) => !c || !String(c).trim())) continue;
      const rawId = cell(row, idCol);
      const rawDesc = cell(row, descCol);
      if (!rawId && !rawDesc && cell(row, expCol)) {
        sheetHasContinuationRows = true;
        break;
      }
    }

    let currentCase = null;
    let stepCount = 0;
    let carryScenario = '';
    let carryModule = '';

    for (let r = hr + 1; r < grid.length; r++) {
      const row = grid[r];
      if (!row || row.every((c) => !c || !String(c).trim())) continue;

      const rawId = cell(row, idCol);
      // Serial number check: skip if id is a serial number heading
      if (/^(s\.?\s*no|sr\.?\s*no|serial\s*no)$/i.test(rawId)) continue;

      const rawDesc = cell(row, descCol);
      const rawExp = cell(row, expCol);
      const rawScen = cell(row, scenCol);
      const rawMod = cell(row, modCol);
      const rawType = cell(row, typeCol);
      const rawCat = cell(row, catCol);
      const rawStat = cell(row, statCol);
      const rawStepNum = cell(row, stepCol);

      if (rawScen) carryScenario = rawScen;
      if (rawMod) carryModule = rawMod;

      const isStepContinuation = !rawId && !rawDesc && currentCase;
      if (isStepContinuation) {
        stepCount++;
        const stepNum = rawStepNum || stepCount;
        currentCase.stepExpected.push(`Step ${stepNum}: ${rawExp}`);
        if (rawStat) currentCase.stepStatuses.push(rawStat);
        continue;
      }

      // Finalize previous case if any
      if (currentCase) {
        if (sheetHasContinuationRows) {
          currentCase.expected = currentCase.stepExpected.join('\n');
        } else {
          currentCase.expected = currentCase.rawExpected;
        }
        // Roll up status
        if (currentCase.stepStatuses.length) {
          const statuses = currentCase.stepStatuses.map((s) => s.toLowerCase());
          if (statuses.some((s) => s.includes('fail'))) currentCase.status = 'Fail';
          else if (statuses.every((s) => s.includes('pass'))) currentCase.status = 'Pass';
          else if (statuses.every((s) => s.includes('not executed') || s === '')) currentCase.status = 'Not Executed';
          else currentCase.status = 'Mixed';
        }
        rawCases.push(currentCase);
        currentCase = null;
      }

      // New case
      const caseId = rawId || `${sheetName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'TC'}-R${r + 1}`;
      stepCount = 1;
      const stepLabel = rawStepNum ? `Step ${rawStepNum}: ` : 'Step 1: ';
      const initialStepExpected = rawExp ? [`${stepLabel}${rawExp}`] : [];

      currentCase = {
        sheet: sheetName,
        rowNum: r + 1,
        id: caseId,
        desc: rawDesc || rawScen,
        rawExpected: rawExp,
        stepExpected: initialStepExpected,
        scenario: rawScen || carryScenario,
        module: rawMod || carryModule,
        category: rawCat,
        type: rawType,
        status: rawStat || 'Not Executed',
        stepStatuses: rawStat ? [rawStat] : [],
        source: `${path.basename(qaFile)} [${sheetName}, row ${r + 1}]`
      };
    }

    if (currentCase) {
      if (sheetHasContinuationRows) {
        currentCase.expected = currentCase.stepExpected.join('\n');
      } else {
        currentCase.expected = currentCase.rawExpected;
      }
      rawCases.push(currentCase);
    }
  }

  // Cross-sheet duplicate ID qualification
  const sheetCountsById = {};
  for (const c of rawCases) {
    sheetCountsById[c.id] = sheetCountsById[c.id] || new Set();
    sheetCountsById[c.id].add(c.sheet);
  }
  for (const c of rawCases) {
    if (sheetCountsById[c.id] && sheetCountsById[c.id].size > 1) {
      c.id = `${c.sheet} / ${c.id}`;
    }
  }

  // Deduplication & Clashing (Rule B.3)
  const finalCases = [];
  const seenIdMap = new Map(); // id -> array of cases with this id

  for (const c of rawCases) {
    const normText = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const existingList = seenIdMap.get(c.id);

    if (!existingList) {
      seenIdMap.set(c.id, [c]);
      finalCases.push(c);
    } else {
      // Check if duplicate (same id, same desc + expected)
      const isExactDup = existingList.some(
        (e) => normText(e.desc) === normText(c.desc) && normText(e.expected) === normText(c.expected)
      );

      if (isExactDup) {
        duplicatesIgnored.push(`${c.id} (row ${c.rowNum} duplicate of earlier row)`);
      } else {
        // Clash: suffix with S2, S3...
        const suffixNum = existingList.length + 1;
        const newId = `${c.id}S${suffixNum}`;
        clashesSuffixed.push(`${c.id} -> ${newId} (row ${c.rowNum} clashes with row ${existingList[0].rowNum})`);
        c.source += `; id ${c.id} clashes with row ${existingList[0].rowNum}`;
        c.id = newId;
        existingList.push(c);
        finalCases.push(c);
      }
    }
  }

  // Build clean 10-key schema objects
  const outputCases = finalCases.map((c) => ({
    approach: '',
    category: c.category || '',
    desc: c.desc || '',
    expected: c.expected || '',
    id: c.id,
    module: c.module || '',
    scenario: c.scenario || '',
    source: c.source || '',
    status: c.status || 'Not Executed',
    type: c.type || ''
  }));

  const outPayload = {
    cases: outputCases,
    generated: new Date().toISOString().slice(0, 10),
    sources: sourceSheets.length ? sourceSheets : [`${path.basename(qaFile)}`]
  };

  const outPath = path.resolve(args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(outPayload, null, 2) + '\n', 'utf8');

  console.log(`[prep-qa] Successfully extracted ${outputCases.length} QA cases -> ${args.out}`);
  if (duplicatesIgnored.length) {
    console.log(`[prep-qa] Ignored ${duplicatesIgnored.length} exact duplicates:`);
    duplicatesIgnored.slice(0, 5).forEach((d) => console.log(`  - ${d}`));
  }
  if (clashesSuffixed.length) {
    console.log(`[prep-qa] Suffixed ${clashesSuffixed.length} clashing IDs:`);
    clashesSuffixed.slice(0, 5).forEach((cl) => console.log(`  - ${cl}`));
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, parseCSV, readXlsxSheets };
