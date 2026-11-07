#!/usr/bin/env node
/**
 * flatten-frs.js - Fast, deterministic FR-id flattener for Retrofit.
 * 
 * Renumbers hierarchical or alphanumeric FR IDs (e.g. FR-4.1-01, FR-VD-001)
 * to flat FR-001, FR-002... across all .md files in the spec folder and
 * test file comments in milliseconds.
 * 
 * Generates the Former id table in spec.md with exact compliance.
 * Handles specs with no FR IDs by deriving them from requirement statements.
 * 
 * Usage:
 *   node specs/tools/flatten-frs.js --spec <spec-folder> [--tests <test-dir-or-files>] [--dry-run]
 */
'use strict';
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { spec: null, tests: null, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--spec') args.spec = argv[++i];
    else if (t === '--tests') args.tests = argv[++i];
    else if (t === '--dry-run') args.dryRun = true;
  }
  return args;
}

function walk(dir, extFilter = null, out = []) {
  if (!fs.existsSync(dir)) return out;
  const st = fs.statSync(dir);
  if (st.isFile()) {
    if (!extFilter || extFilter.test(dir)) out.push(dir);
    return out;
  }
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git') continue;
    walk(path.join(dir, ent.name), extFilter, out);
  }
  return out;
}

function pad3(num) {
  return String(num).padStart(3, '0');
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.spec) {
    console.error('Usage: node flatten-frs.js --spec <spec-folder> [--tests <dirs>] [--dry-run]');
    process.exit(1);
  }

  const specDir = path.resolve(args.spec);
  const specMdPath = path.join(specDir, 'spec.md');
  if (!fs.existsSync(specMdPath)) {
    console.error(`Error: spec.md not found in ${specDir}`);
    process.exit(1);
  }

  const specMd = fs.readFileSync(specMdPath, 'utf8');

  // Find all defined FR IDs in spec.md
  // Definition forms:
  // - **FR-xxx**: description
  // ### FR-xxx
  // | FR-xxx |
  const defRegex = /^(?:[-*]\s*\*\*|#{2,4}\s*|\|\s*)?\*{0,2}(FR-[A-Za-z0-9_.-]+)\b/gm;
  const definedOldIds = [];
  const seenDefs = new Set();

  let m;
  while ((m = defRegex.exec(specMd)) !== null) {
    const id = m[1];
    if (id === 'FR-NNN') continue;
    if (!seenDefs.has(id)) {
      seenDefs.add(id);
      definedOldIds.push(id);
    }
  }

  // Check if no FRs exist (Scenario S06)
  if (definedOldIds.length === 0) {
    console.log('[flatten-frs] No FR IDs found in spec.md. Deriving requirements...');
    // Look for requirements statements: User Stories, Acceptance Criteria, Shall/Must
    const reqStatements = [];
    const lines = specMd.split(/\r?\n/);
    let inReqs = false;

    for (const line of lines) {
      if (/^#{1,3}\s.*(requirement|functional|user stor|acceptance)/i.test(line)) {
        inReqs = true;
        continue;
      }
      if (inReqs && /^#{1,2}\s/.test(line)) {
        inReqs = false;
      }
      if (inReqs) {
        const itemM = line.match(/^[-*]\s+(.*)/);
        if (itemM && itemM[1].trim().length > 10) {
          reqStatements.push(itemM[1].trim());
        }
      }
    }

    if (!reqStatements.length) {
      // General scan for shall/must/should
      for (const line of lines) {
        const match = line.match(/^[-*]\s+.*(?:shall|must|should|displays|renders|validates).*/i);
        if (match) reqStatements.push(match[0].replace(/^[-*]\s+/, '').trim());
      }
    }

    if (reqStatements.length) {
      const derivedBlock = [
        '',
        '## Derived Requirements',
        '',
        ...reqStatements.map((stmt, idx) => `- **FR-${pad3(idx + 1)}**: ${stmt} [derived by retrofit - needs review]`),
        ''
      ].join('\n');

      if (!args.dryRun) {
        fs.writeFileSync(specMdPath, specMd.trimEnd() + '\n' + derivedBlock, 'utf8');
      }
      console.log(`[flatten-frs] Derived ${reqStatements.length} FRs (FR-001 to FR-${pad3(reqStatements.length)})`);
      return;
    }
  }

  // Check if all are already flat
  const isAlreadyFlat = definedOldIds.every((id) => /^FR-\d{3}$/.test(id));
  if (isAlreadyFlat) {
    console.log(`[flatten-frs] All ${definedOldIds.length} FR IDs are already flat (FR-NNN). No renumbering required.`);
    return;
  }

  // Map non-flat IDs to flat IDs: FR-001, FR-002...
  const idMap = new Map();
  let nextNum = 1;

  for (const oldId of definedOldIds) {
    const newId = `FR-${pad3(nextNum++)}`;
    idMap.set(oldId, newId);
  }

  console.log(`[flatten-frs] Renumbering ${idMap.size} FR IDs to flat format...`);

  // Build Former id table
  const formerTableRows = [
    '### Test-case -> FR traceability',
    '',
    '| FR | Former id | BRD area |',
    '|---|---|---|'
  ];

  for (const [oldId, newId] of idMap.entries()) {
    // Former id without "FR-" prefix
    const formerId = oldId.replace(/^FR-/, '');
    // BRD area: e.g. 4.1 from 4.1-01
    const areaM = formerId.match(/^(\d+(?:\.\d+)?)/);
    const brdArea = areaM ? areaM[1] : 'n/a';
    formerTableRows.push(`| ${newId} | ${formerId} | ${brdArea} |`);
  }
  formerTableRows.push('');
  formerTableRows.push('Former ids are written without the FR- prefix so they are never read as requirement ids.');
  formerTableRows.push('');

  const formerTableStr = formerTableRows.join('\n');

  // Collect all .md files in spec folder
  const mdFiles = walk(specDir, /\.md$/);

  // Collect test files if specified
  const testFiles = [];
  if (args.tests) {
    const paths = args.tests.split(',').map((p) => path.resolve(p.trim()));
    for (const p of paths) {
      walk(p, /\.(test|spec)\.(ts|tsx|js|jsx)|_test\.dart|Tests?\.(kt|java|swift)$/, testFiles);
    }
  }

  // Sort replacements by longest oldId first to prevent substring collisions
  const sortedReplacements = [...idMap.entries()].sort((a, b) => b[0].length - a[0].length);

  // Update markdown files
  for (const f of mdFiles) {
    let content = fs.readFileSync(f, 'utf8');
    let changed = false;

    for (const [oldId, newId] of sortedReplacements) {
      const rx = new RegExp(oldId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
      if (rx.test(content)) {
        content = content.replace(rx, newId);
        changed = true;
      }
    }

    if (f === specMdPath) {
      // Insert or replace Former id table
      if (content.includes('### Test-case -> FR traceability')) {
        content = content.replace(/### Test-case -> FR traceability[\s\S]*?(?=\n#{2,3}\s|\n\s*$)/, formerTableStr.trim());
      } else {
        // Insert before "Key Entities" or at end of functional requirements
        const insPoint = content.indexOf('## Key Entities');
        if (insPoint >= 0) {
          content = content.slice(0, insPoint) + formerTableStr + '\n' + content.slice(insPoint);
        } else {
          content = content.trimEnd() + '\n\n' + formerTableStr;
        }
      }
      changed = true;
    }

    if (changed && !args.dryRun) {
      fs.writeFileSync(f, content, 'utf8');
      console.log(`  Updated ${path.basename(f)}`);
    }
  }

  // Update comment text in test files
  for (const f of testFiles) {
    let content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');
    let changed = false;

    const newLines = lines.map((line) => {
      // Only touch comment lines: // or /* ... */
      if (!line.includes('//') && !line.includes('/*')) return line;
      let newLine = line;
      for (const [oldId, newId] of sortedReplacements) {
        const rx = new RegExp(oldId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
        if (rx.test(newLine)) {
          newLine = newLine.replace(rx, newId);
          changed = true;
        }
      }
      return newLine;
    });

    if (changed && !args.dryRun) {
      fs.writeFileSync(f, newLines.join('\n'), 'utf8');
      console.log(`  Updated test comment in ${path.basename(f)}`);
    }
  }

  console.log(`[flatten-frs] Done! All FR IDs flattened to FR-001..FR-${pad3(idMap.size)}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
