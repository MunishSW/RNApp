#!/usr/bin/env node
/**
 * test-tools.js - Comprehensive self-test for retrofit helper scripts:
 * - prep-qa.js
 * - flatten-frs.js
 * - assemble-retrofit.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const tempDir = path.resolve('specs/tools/.test-tmp');
if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
fs.mkdirSync(tempDir, { recursive: true });

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  PASS: ${message}`);
    passed++;
  } else {
    console.error(`  FAIL: ${message}`);
    failed++;
  }
}

console.log('=== 1. Testing prep-qa.js ===');

// Test 1.1: Real Excel file
const faqXlsx = path.resolve('docs/BHFL_FAQ_Test_Cases.xlsx');
const outJson = path.join(tempDir, 'qa-cases.json');
execSync(`node specs/tools/prep-qa.js --qa "${faqXlsx}" --out "${outJson}"`, { stdio: 'pipe' });

assert(fs.existsSync(outJson), 'qa-cases.json created from xlsx');
const qaData = JSON.parse(fs.readFileSync(outJson, 'utf8'));
assert(qaData.cases && qaData.cases.length === 18, `Extracted 18 cases (got ${qaData.cases?.length})`);

// Check C1 schema exactness
const wantKeys = 'approach,category,desc,expected,id,module,scenario,source,status,type';
const badSchema = qaData.cases.filter((c) => Object.keys(c).sort().join(',') !== wantKeys);
assert(badSchema.length === 0, 'Every case has exact 10 required schema keys');

// Test 1.2: CSV parsing with duplicate and clash
const csvFixture = path.join(tempDir, 'test-clash.csv');
fs.writeFileSync(csvFixture, [
  'Test Case ID,Test Description,Expected Result,Status',
  'TC-01,Login with valid credentials,User is logged in,Pass',
  'TC-01,Login with valid credentials,User is logged in,Pass', // duplicate -> ignored
  'TC-01,Login with invalid password,Error displayed,Fail',      // clash -> TC-01S2
  'TC-02,Forgot password link,Opens recovery flow,Pass'
].join('\n'), 'utf8');

const outClashJson = path.join(tempDir, 'qa-clash.json');
execSync(`node specs/tools/prep-qa.js --qa "${csvFixture}" --out "${outClashJson}"`, { stdio: 'pipe' });
const clashData = JSON.parse(fs.readFileSync(outClashJson, 'utf8'));
assert(clashData.cases.length === 3, `Deduplicated and handled clash (expected 3 cases, got ${clashData.cases.length})`);
assert(clashData.cases.some((c) => c.id === 'TC-01S2'), 'Clashing case suffixed as TC-01S2');

console.log('\n=== 2. Testing flatten-frs.js ===');
const mockSpecDir = path.join(tempDir, 'mock-spec');
fs.mkdirSync(mockSpecDir, { recursive: true });
fs.writeFileSync(path.join(mockSpecDir, 'spec.md'), [
  '# Feature Spec',
  '',
  '## Functional Requirements',
  '- **FR-4.1-01**: The system shall allow user login.',
  '- **FR-4.1-02**: The system shall display error on bad password.',
  '- **FR-VD-001**: The system shall validate token format.',
  ''
].join('\n'), 'utf8');

fs.writeFileSync(path.join(mockSpecDir, 'tasks.md'), [
  '# Tasks',
  '- [x] T001: Implement login. **Maps**: FR-4.1-01 · **Accept**: User logs in.',
  '- [x] T002: Implement error. **Maps**: FR-4.1-02 · **Accept**: Shows error.',
  '- [x] T003: Token validate. **Maps**: FR-VD-001 · **Accept**: Validates.'
].join('\n'), 'utf8');

execSync(`node specs/tools/flatten-frs.js --spec "${mockSpecDir}"`, { stdio: 'pipe' });

const updatedSpec = fs.readFileSync(path.join(mockSpecDir, 'spec.md'), 'utf8');
const updatedTasks = fs.readFileSync(path.join(mockSpecDir, 'tasks.md'), 'utf8');

assert(updatedSpec.includes('FR-001') && updatedSpec.includes('FR-002') && updatedSpec.includes('FR-003'), 'Renumbered to FR-001, FR-002, FR-003');
assert(!updatedSpec.includes('FR-4.1-01') && !updatedTasks.includes('FR-4.1-01'), 'Old hierarchical IDs replaced');
assert(updatedSpec.includes('### Test-case -> FR traceability'), 'Former id table generated in spec.md');
assert(updatedSpec.includes('| FR-001 | 4.1-01 | 4.1 |'), 'Former id row correctly formatted without FR- prefix');

console.log('\n=== 3. Testing assemble-retrofit.js ===');
// Populate mock verdicts
const mockVerdicts = path.join(mockSpecDir, 'verdicts.json');
fs.writeFileSync(mockVerdicts, JSON.stringify([
  { id: 'FAQ_FUNC_TC_001', approach: 'unit-testable - asserts questions display', tasks: 'T001' },
  { id: 'FAQ_FUNC_TC_002', approach: 'manual - requires physical biometrics', tasks: 'T002' },
  { id: 'FAQ_FUNC_TC_003', approach: 'unit-testable - partial: asserts collapse; manual remainder: physical gesture feel', tasks: 'T003' }
], null, 2), 'utf8');

// Copy mock cases
fs.copyFileSync(outJson, path.join(mockSpecDir, 'qa-cases.json'));

execSync(`node specs/tools/assemble-retrofit.js --spec "${mockSpecDir}" --verdicts "${mockVerdicts}"`, { stdio: 'pipe' });

const mockTasksResult = fs.readFileSync(path.join(mockSpecDir, 'tasks.md'), 'utf8');
const mockMvResult = path.join(mockSpecDir, 'manual-verification.json');
assert(fs.existsSync(mockMvResult), 'manual-verification.json generated');
const mvObj = JSON.parse(fs.readFileSync(mockMvResult, 'utf8'));
assert(mvObj['FAQ_FUNC_TC_002'] && mvObj['FAQ_FUNC_TC_003'], 'manual-verification.json contains both manual and manual-remainder keys');

assert(mockTasksResult.includes('## TC -> Task coverage'), 'tasks.md updated with ## TC -> Task coverage');
assert(mockTasksResult.includes('Counts: 18 QA cases ='), 'tasks.md contains Counts line with exact total');

// Cleanup
fs.rmSync(tempDir, { recursive: true, force: true });

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
process.exit(failed ? 1 : 0);
