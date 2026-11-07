#!/usr/bin/env node
/*
 * check-retrofit.js - independent checker for the output of RETROFIT-PROMPT-v3.1.
 * Does not trust the agent: re-derives the mechanical Step F checks from the files.
 *
 * usage: node check-retrofit.js --spec <spec-folder> [--tests <dir-or-file>[,<dir-or-file>...]]
 * exit code: 0 = all checks pass (warnings allowed), 1 = at least one FAIL
 */
const fs = require('fs');
const path = require('path');

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i].startsWith('--')) args[process.argv[i].slice(2)] = process.argv[++i];
}
if (!args.spec) { console.error('usage: node check-retrofit.js --spec <spec-folder> [--tests <dirs>]'); process.exit(2); }
const spec = path.resolve(args.spec);
const results = [];
const ok = (id, msg) => results.push(['PASS', id, msg]);
const bad = (id, msg) => results.push(['FAIL', id, msg]);
const warn = (id, msg) => results.push(['WARN', id, msg]);
// CRLF-safe: files in the wild use Windows line endings; normalise before matching.
const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8').replace(/\r\n?/g, '\n') : null);

function walk(p, out = []) {
  if (!fs.existsSync(p)) return out;
  const st = fs.statSync(p);
  if (st.isFile()) { out.push(p); return out; }
  for (const e of fs.readdirSync(p, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    walk(path.join(p, e.name), out);
  }
  return out;
}

// ---- C1 qa-cases.json
const qaRaw = read(path.join(spec, 'qa-cases.json'));
let cases = [];
if (!qaRaw) bad('C1', 'qa-cases.json missing');
else {
  let qa; try { qa = JSON.parse(qaRaw); } catch (e) { bad('C1', 'qa-cases.json is not valid JSON'); }
  if (qa) {
    cases = qa.cases || [];
    const top = Object.keys(qa).sort().join(',');
    if (top !== 'cases,generated,sources') bad('C1', 'top-level keys must be generated, sources, cases; got ' + top);
    const want = 'approach,category,desc,expected,id,module,scenario,source,status,type';
    const badKeys = cases.filter((c) => Object.keys(c).sort().join(',') !== want).map((c) => c.id);
    if (badKeys.length) bad('C1', cases.length + ' cases; schema differs for: ' + badKeys.slice(0, 5).join(', '));
    else ok('C1', cases.length + ' cases, exact schema');
    const ids = cases.map((c) => c.id);
    const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
    dup.length ? bad('C2', 'duplicate ids: ' + [...new Set(dup)].join(', ')) : ok('C2', 'ids unique');
    const verdict = (c) => (c.approach || '').split(/ - /)[0].trim();
    const badVerdict = cases.filter((c) => !['unit-testable', 'manual', 'out-of-scope'].includes(verdict(c)));
    badVerdict.length ? bad('C3', 'approach must start unit-testable|manual|out-of-scope: ' + badVerdict.slice(0, 5).map((c) => c.id).join(', ')) : ok('C3', 'approach verdict words valid');
    const blankExp = cases.filter((c) => !c.expected).length;
    if (blankExp) warn('C3', blankExp + ' case(s) have an empty expected result (cannot be COVERED)');
  }
}

// ---- tasks.md
const tasks = read(path.join(spec, 'tasks.md'));
if (!tasks) bad('T0', 'tasks.md missing');
else {
  const tableAt = tasks.lastIndexOf('## TC -> Task coverage');
  const headingCount = (tasks.match(/^## TC -> Task coverage/gm) || []).length;
  headingCount === 1 ? ok('T1', 'heading "## TC -> Task coverage" appears exactly once') : bad('T1', 'heading "## TC -> Task coverage" appears ' + headingCount + ' times');
  if (tableAt >= 0) {
    const tail = tasks.slice(tableAt);
    const rows = tail.split('\n').filter((l) => /^\|/.test(l) && !/^\|[-| ]+\|$/.test(l) && !/^\| TC \(id/.test(l));
    const rowIds = rows.map((r) => r.split('|')[1].trim().split(/ - /)[0].trim());
    const ids = cases.map((c) => c.id);
    rows.length === ids.length && rowIds.every((x, i) => x === ids[i])
      ? ok('T2', 'TC table has ' + rows.length + ' rows, same ids and order as qa-cases.json')
      : bad('T2', 'TC table rows (' + rows.length + ') do not match qa-cases.json (' + ids.length + ') in ids/order');
    const m = tail.match(/Counts:[^\n]*/);
    if (!m) bad('T3', 'no Counts line');
    else {
      const nums = [...m[0].matchAll(/(\d+) (covered|partial|manual|gap|divergent|qa-suspect|out-of-scope|failing)/g)];
      const total = parseInt((m[0].match(/Counts:\s*(\d+)/) || [])[1], 10);
      const sum = nums.reduce((a, x) => a + parseInt(x[1], 10), 0);
      total === cases.length && sum === total ? ok('T3', 'Counts line adds up (' + sum + ' = ' + total + ')') : bad('T3', 'Counts line: parts ' + sum + ', stated total ' + total + ', cases ' + cases.length);
      const get = (k) => { const x = nums.find((n) => n[2] === k); return x ? parseInt(x[1], 10) : 0; };
      const oos = cases.filter((c) => /^out-of-scope/.test(c.approach)).length;
      oos === get('out-of-scope') ? ok('T4', 'out-of-scope count matches approaches (' + oos + ')') : bad('T4', 'out-of-scope: approaches ' + oos + ' vs Counts ' + get('out-of-scope'));
      const manualAppr = cases.filter((c) => /^manual/.test(c.approach)).length;
      manualAppr === get('manual') ? ok('T5', 'manual count matches approaches (' + manualAppr + ')') : bad('T5', 'manual: approaches ' + manualAppr + ' vs Counts ' + get('manual'));
    }
    const oosRowsBad = rows.filter((r, i) => cases[i] && /^out-of-scope/.test(cases[i].approach) && !/\|\s*n\/a\s*\|/i.test(r));
    oosRowsBad.length ? bad('T6', 'out-of-scope rows must read n/a in Task(s): ' + oosRowsBad.length) : ok('T6', 'out-of-scope rows read n/a');
  }
  // task lines: "- [x] T12 ..." or "### [x] T1 ..." blocks
  const taskLines = tasks.split('\n').filter((l) => /^(- \[[ xX]\]|#{2,4} \[[ xX]\]|#{2,4}) .*\bT[0-9A-Z-]*\d+\b/.test(l) || /^- \[[ xX]\] T-ENV/.test(l));
  let badMaps = [], badAccept = [];
  taskLines.forEach((l, idx) => {
    const blockEnd = tasks.indexOf('\n', tasks.indexOf(l));
    let body = l;
    // include following lines until next task line / heading for multi-line tasks
    const start = tasks.indexOf(l);
    const rest = tasks.slice(start + l.length).split('\n');
    for (const r of rest.slice(1)) { if (/^(- \[|#{2,4} )/.test(r)) break; body += '\n' + r; }
    const mapsPart = (body.match(/\*\*Maps\*\*:\s*([^\n·]*)/) || [])[1] || '';
    const before = mapsPart.split('(was:')[0];
    if (!/FR-\d{3}/.test(before) || /\bnone\b/i.test(before) || /FR-\d{3}\s*[–-]\s*FR-\d{3}/.test(before)) badMaps.push(l.slice(0, 40));
    if (!/\*\*Accept\*\*:/.test(body)) badAccept.push(l.slice(0, 40));
  });
  taskLines.length ? null : warn('T7', 'no task lines recognised');
  badMaps.length ? bad('T7', badMaps.length + '/' + taskLines.length + ' tasks lack an explicit FR-NNN in Maps (e.g. ' + badMaps.slice(0, 2).join(' | ') + ')') : ok('T7', taskLines.length + ' tasks all carry FR-NNN in Maps (no range, no none)');
  badAccept.length ? bad('T8', badAccept.length + ' tasks lack Accept (e.g. ' + badAccept.slice(0, 2).join(' | ') + ')') : ok('T8', 'every task has Accept');
  // every FR defined in spec.md appears in some Maps
  const specMd = read(path.join(spec, 'spec.md')) || '';
  const defined = new Set([...specMd.matchAll(/^(?:[-*] \*\*|#{2,4} |\| )?\*{0,2}(FR-\d{3})\b/gm)].map((m) => m[1]));
  const mapped = new Set([...tasks.matchAll(/\*\*Maps\*\*:\s*([^\n]*)/g)].flatMap((m) => m[1].match(/FR-\d{3}/g) || []));
  const unmapped = [...defined].filter((f) => !mapped.has(f));
  unmapped.length ? bad('T9', 'FRs defined in spec.md but in no task Maps: ' + unmapped.join(', ')) : ok('T9', defined.size + ' FRs defined, all appear in some Maps');
}

// ---- spec folder: ids
const mdFiles = walk(spec).filter((f) => /\.md$/.test(f));
const dotted = [];
for (const f of mdFiles) {
  read(f).split('\n').forEach((l, i) => {
    const m = l.match(/FR-\d+\.\d|FR-[A-Za-z](?!NN\b)/);
    if (m && !/Former id/i.test(l) && !/RETROFIT-PROMPT/.test(f)) dotted.push(path.basename(f) + ':' + (i + 1));
  });
}
dotted.length ? bad('I1', 'old-style FR ids remain at ' + dotted.slice(0, 5).join(', ')) : ok('I1', 'no dotted or lettered FR ids in the spec folder');

// ---- manual keys
const mvRaw = read(path.join(spec, 'manual-verification.json'));
const expectManual = new Set(cases.filter((c) => /^manual/.test(c.approach) || /manual remainder/.test(c.approach)).map((c) => c.id));
if (!mvRaw) expectManual.size ? bad('M1', 'manual-verification.json missing but ' + expectManual.size + ' cases need a human') : ok('M1', 'no manual cases, no manual file needed');
else {
  const keys = Object.keys(JSON.parse(mvRaw));
  const missing = [...expectManual].filter((x) => !keys.includes(x));
  const extra = keys.filter((x) => !expectManual.has(x));
  missing.length || extra.length ? bad('M1', 'manual keys differ. missing: ' + missing.join(',') + ' extra: ' + extra.join(',')) : ok('M1', 'manual keys match approaches in both directions (' + keys.length + ')');
}

// ---- markers in test files
const testPaths = (args.tests || '').split(',').filter(Boolean);
if (testPaths.length) {
  const files = testPaths.flatMap((p) => walk(path.resolve(p))).filter((f) => /\.(test|spec)\.|_test\.dart|Tests?\.(kt|java|swift)$/.test(f));
  const ids = new Set(cases.map((c) => c.id));
  const rx = /^\s*\/\/ Covers: [^,\n]+(, [^,\n]+)* - .+$/;
  const badLines = [], orphans = new Set(); let markers = 0;
  for (const f of files) {
    read(f).split('\n').forEach((l, i) => {
      if (!/Covers:/.test(l)) return;
      markers++;
      if (!rx.test(l)) { badLines.push(path.basename(f) + ':' + (i + 1)); return; }
      const idl = l.split('Covers:')[1].split(' - ')[0].split(',').map((s) => s.trim());
      idl.forEach((x) => { if (!ids.has(x)) orphans.add(x); });
    });
    if (/\/\/ (Supports|Verifies|Related):/.test(read(f))) badLines.push(path.basename(f) + ': foreign marker keyword');
  }
  badLines.length ? bad('K1', 'malformed markers: ' + badLines.slice(0, 5).join(', ')) : ok('K1', markers + ' markers in ' + files.length + ' files all match the exact form');
  orphans.size ? warn('K2', 'marker ids not in qa-cases.json (shared files of another spec?): ' + [...orphans].slice(0, 6).join(', ')) : ok('K2', 'no orphan marker ids');
  const unit = cases.filter((c) => /^unit-testable/.test(c.approach) && !/divergent:|qa-suspect:|gap: not built|blocked:/.test(c.approach));
  const allText = files.map(read).join('\n');
  const noMarker = unit.filter((c) => !allText.includes(c.id)).map((c) => c.id);
  noMarker.length ? warn('K3', noMarker.length + ' unit-testable case(s) with no marker anywhere: ' + noMarker.slice(0, 6).join(', ')) : ok('K3', 'every unit-testable in-scope case is carried by a marker');
} else warn('K0', 'no --tests given: marker checks skipped');

// ---- coverage report
const cr = read(path.join(spec, 'coverage-report.md'));
if (!cr) bad('R1', 'coverage-report.md missing');
else {
  ['## Summary', '## Action needed', '## 1. Input QA cases', '## 2. Tests mapped to cases', '## 3. Manual verification'].every((h) => cr.includes(h))
    ? ok('R1', 'coverage-report.md has the required sections') : bad('R1', 'coverage-report.md is missing a required section');
  const n = (cr.match(/QA cases \(acceptance contract\)\s*\|\s*(\d+)/) || [])[1];
  n && +n === cases.length ? ok('R2', 'report case total matches qa-cases.json') : bad('R2', 'report case total ' + n + ' vs qa-cases ' + cases.length);
}

// ---- output
let fails = 0;
for (const [st, id, msg] of results) { if (st === 'FAIL') fails++; console.log(st.padEnd(4) + '  ' + id.padEnd(3) + '  ' + msg); }
console.log('\n' + results.filter((r) => r[0] === 'PASS').length + ' pass, ' + results.filter((r) => r[0] === 'WARN').length + ' warn, ' + fails + ' fail');
process.exit(fails ? 1 : 0);
