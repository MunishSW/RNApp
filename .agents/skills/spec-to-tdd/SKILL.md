---
name: spec-to-tdd
description: >-
  Convert an existing vanilla-speckit spec folder into a test-case-driven specification package.
  Maps QA test cases (.xlsx, .csv, .json, .md) to existing unit tests with quoted assertions, writes
  new unit tests for testable gaps, renumbers FR IDs to flat FR-NNN, and generates traceability tables,
  manual verification checklists, and coverage reports. Supports React Native (Jest), Flutter, Angular,
  Android, and iOS. Triggers: "spec-to-tdd", "retrofit spec", "convert spec to tdd", "map QA to spec".
version: 1.0.0
---

# spec-to-tdd

Convert an existing vanilla-speckit spec folder into a TEST-CASE-DRIVEN specification package.
The feature is already built. This skill:
1. Extracts the QA acceptance contract into `qa-cases.json` via deterministic tooling (< 1s).
2. Maps every in-scope QA case to proof in existing tests (quoted assertion lines).
3. Writes new unit tests only where no test proves a testable case.
4. Flattens requirement IDs to `FR-NNN` and assembles traceability, manual verification checklists, and coverage reports deterministically.
5. Produces a scoped terminal execution block targeting ONLY affected test files (runs in ~1-2s).

Does NOT change production code. Supports React Native (Jest), Flutter, Angular, Android, and iOS.

---

## Inputs

- **`SPEC_FOLDER`** (required, convert in place): `specs/<feature>`
- **`QA_CASES`** (required, acceptance contract): Path to `.xlsx`, `.xlsm`, `.csv`, `.json`, `.docx`, `.md`, `.txt`, or pasted text; sheet(s): `<names or "all">`
- **`QA_SCOPE`** (optional): User-confirmed scope (module names, ID list, or keywords; otherwise Step A.4 decides)
- **`BRD`** (optional): Path to BRD or `N/A`

Infer stack, test runner, test files, and commands. No story ID, Jira ID, or Figma link needed.

---

## High-Speed Deterministic Pipeline (Tools + LLM Intelligence)

This skill pairs lightweight deterministic Node scripts located in `<skill-dir>/tools/` for mechanical tasks with LLM reasoning for test analysis:

```
[QA Source] ---> prep-qa.js (0 tokens, <0.2s) ---> qa-cases.json (100% schema compliance)
                                                            |
                                                            v
[Test Files] <--- LLM Intelligence (Step C & D) <-----------+
  * Quotes real assertion lines (expect(...))
  * Authors new tests for GAPs with // Covers: markers
  * Emits concise verdicts
                               |
                               v
[Spec Files] ---> flatten-frs.js (0 tokens, <50ms) ---> Flat FR-001..FR-NNN across all files
                                                              |
                                                              v
[Spec & Tasks] <--- assemble-retrofit.js (0 tokens, <0.3s) <--+
  * Generates ## TC -> Task coverage table
  * Mathematical guarantee on Counts: line arithmetic
  * Generates manual-verification.json with 1:1 key parity
  * Generates coverage-report.md and spec.md traceability
```

`<skill-dir>` refers to the directory containing this `SKILL.md`.

---

## Rules

1. **Preserve, never rewrite**: Keep all existing spec content: business rules, scenarios, owner decisions, open items, contracts, research, data models, quickstarts, release notes, checklists, the spec's own TC tables, and task states (`[X]`/`[x]` stays ticked). Patch in place. Keep line endings (CRLF/LF) and encoding byte-for-byte.
2. **QA cases are the contract**: A case contradicting a recorded spec decision: change neither spec nor code; write no test contradicting the code. Classify as `DIVERGENT` and report in findings.
3. **Never invent a case ID, expected result, or mapping**: Unprovable link = `UNVERIFIED`.
4. **NO CODE CHANGES**: Only exception: add a test selector (`testID`, `accessibilityIdentifier`, `data-testid`) to an existing element when a NEW test requires a selector and none exists. Do not fix bugs, types, styles, or imports in production files. In existing test files, edit only: (a) `// Covers:` markers, (b) legacy bracket title tags rewritten to QA ID on a single proven match, (c) neutral rename of mislabelled tags, (d) convert unproven marker to a comment, (e) imports needed by tests you add.
5. **Only ID change allowed**: FR IDs renamed to flat `FR-NNN` (Rule E.0) in the spec folder and in comment text of test files (never production files).
6. **DO NOT run test runners or checker inside the prompt**: Never run `npx jest`, `flutter test`, `ng test`, `gradlew`, or `xcodebuild` foreground or background. Proof is established by static code analysis (quoting real assertion lines). Step H prints the commands for terminal execution.
7. **TARGET ONLY AFFECTED TEST FILES**: The test command output in Step H must list ONLY the test files affected by that spec (new tests authored and existing test files modified), NEVER the entire test suite or unrelated directories.

---

## Step-by-Step Procedure

### STEP A — Inventory (Read-Only)

1. **Detect Stack**:
   - React Native / JS-TS: `package.json` + Jest (`__tests__/<name>.test.<ext>`)
   - Flutter: `pubspec.yaml` (`<name>_test.dart`)
   - Angular: `angular.json` (`<name>.spec.ts`)
   - Android: `build.gradle(.kts)` (`src/test/**/<Name>Test.kt|java`)
   - iOS: `*.xcodeproj` / `Package.swift` (`Tests/<Module>Tests/<Name>Tests.swift`)
2. **Find Feature Test Files**: Search tasks, plan, or test directories for the feature source and screen names. Note shared test files owned by other specs (do not edit them except comment FR renames).
3. **Check Pre-existing State**: If test files already carry `// Covers:` markers matching `QA_CASES` or `qa-cases.json` exists, confirm whether to continue in place.
4. **Relevance Gate**: Compare module and scenario names with the spec's scope. If `< 20%` in scope, stop and ask for the right sheet or `QA_SCOPE` filter.

---

### STEP B — Deterministic QA Extraction (`prep-qa.js`)

Run the fast extractor tool to build `<SPEC_FOLDER>/qa-cases.json`:

```bash
node <skill-dir>/tools/prep-qa.js --qa <QA_CASES> [--qa-sheet <names>] [--qa-scope <filter>] --out <SPEC_FOLDER>/qa-cases.json
```

- Handles: custom headers, merged cells, step-per-row rows (`Step 1: ...` and status rollup), missing row IDs (`<prefix>-R<row>`), duplicate rows (deduplicated), and clashes (suffixed with `S2`, `S3...`).
- Outputs exact 10 keys required by Check C1: `approach, category, desc, expected, id, module, scenario, source, status, type`.
- **FALLBACK**: If `prep-qa.js` fails or input is `.docx` / pasted text, write `qa-cases.json` manually adhering strictly to the 10 keys above, Step B.2 step rollup, and Step B.3 duplicate/clash rules.

---

### STEP C — Prove Every In-Scope Case (Intelligence & Code)

Read `<SPEC_FOLDER>/qa-cases.json` and the feature test files. For each in-scope case in order:

1. **Find candidate tests**: Search for the behaviour, then READ test bodies.
2. **Quote proof**: A test proves a case ONLY if you can quote the exact assertion line (`expect(...)`) verifying the expected result.
   - *Not proof*: mount-only / truthy tree, source-text grep, assertions on constants or mocks, no assertion.
   - *Vague expected*: mark `PARTIAL` unless assertion checks a concrete observable.
3. **Classify**:
   - `COVERED`: every part of expected asserted by a quoted line in a passing test.
   - `PARTIAL`: some parts asserted (quote assertion and state missing part).
   - `GAP`: no test exists, or behaviour not built.
   - `MANUAL`: device, screen reader, real network, hardware, biometric, native-only.
   - `DIVERGENT`: contradicts recorded spec decision (never change spec/code).
   - `QA-SUSPECT`: contradicts both spec and BRD.
   - `OUT-OF-SCOPE`: not this feature.
4. **Markers**: Place directly above each proving test:
   ```typescript
   // Covers: <QA-ID>[, <QA-ID>] - <short note>
   ```
   Plain hyphen with space on each side. Add title tag `[<QA-ID>]` only on tests you author where the language permits.
5. **Assign Approach**:
   - `unit-testable - <what the test asserts>`
   - `manual - <why a unit test cannot prove it>`
   - `unit-testable - partial: <asserted>; manual remainder: <what human checks>`
   - `unit-testable - partial: <asserted>; blocked: <feature>`
   - `unit-testable - partial: <asserted>; divergent: <what>`
   - `unit-testable - gap: <what is missing>`
   - `unit-testable - failing: <what the test asserts and why it fails>`
   - `unit-testable - divergent: <reason>`
   - `unit-testable - qa-suspect: <reason>`
   - `out-of-scope - <reason>`
6. Record verdicts in `<SPEC_FOLDER>/verdicts.json` or update `qa-cases.json` `approach` fields.

---

### STEP D — Author New Tests (Unit-Testable GAP / PARTIAL Only)

- Write tests only for unit-testable `GAP` and `PARTIAL` cases where the behaviour is built.
- Minimum one test per case. Assert the expected result precisely (strings, counts, states, parameters).
- Mock only external boundaries (network, native modules, storage). Never mock the unit under test.
- Title `[<QA-ID>] <behaviour>` with `// Covers: <QA-ID> - <note>` marker above.
- Record all affected test files (created or modified) for Step H.

---

### STEP E — Flatten FRs & Structure Tasks

#### E.0 Flatten FR IDs (`flatten-frs.js`)
Run the flattener tool:

```bash
node <skill-dir>/tools/flatten-frs.js --spec <SPEC_FOLDER> [--tests <affected-test-files>]
```

- Renumbers non-flat hierarchical IDs (`FR-4.1-01` -> `FR-001`) across all spec files and test comments.
- Handles wildcard and range references (`FR-4.1-xx to FR-4.9-xx` -> `BRD area 4.1 to 4.9`).
- Generates Former ID table under `### Test-case -> FR traceability` in `spec.md`.
- If the spec has no FR IDs, systematically derives them under `## Derived Requirements`.
- **FALLBACK**: If `flatten-frs.js` fails, perform the renumbering and Former ID table insertion manually.

#### E.1 Update `spec.md`
- Ensure every in-scope case maps to at least one FR (or `FR: none (manual)`).

#### E.2 Update `tasks.md`
- Keep all existing tasks and checkbox states intact.
- Ensure EVERY task carries `**Maps**: FR-NNN · **Accept**: <condition>`.
- Add Environment Gate `T-ENV-001` near top if absent.
- Add tasks for new Step D tests under phase `## Retrofit Tests` with `[X]`.
- Add unchecked tasks under `## Retrofit Gaps` for unbuilt items / seams / spec drift.

---

### STEP G — Deterministic Assembly (`assemble-retrofit.js`)

Run the assembler tool to generate remaining artifacts:

```bash
node <skill-dir>/tools/assemble-retrofit.js --spec <SPEC_FOLDER> [--tests <affected-test-files>] [--verdicts <SPEC_FOLDER>/verdicts.json]
```

- Constructs `## TC -> Task coverage` in `tasks.md` with guaranteed arithmetic in the `Counts:` line.
- Generates `manual-verification.json` with 1:1 key parity for every manual and manual-remainder case.
- Generates / updates `coverage-report.md` with Summary, Action Needed, Input QA cases, and Mapped tests.
- Updates `### Test-case -> FR traceability` in `spec.md`.
- **FALLBACK**: If `assemble-retrofit.js` fails, hand-write the table, `manual-verification.json`, and `coverage-report.md` manually with strict arithmetic reconciliation.

---

### STEP F — Self-Check Verification

Verify that all checks pass:
- `C1, C2, C3`: `qa-cases.json` schema (10 keys), unique IDs, valid approach words.
- `T1..T9`: `## TC -> Task coverage` table format, Counts line arithmetic, `**Maps**:` and `**Accept**:`, defined FRs mapped.
- `I1`: Zero dotted or lettered FR IDs (`FR-4.1-01`) remain in the spec folder.
- `M1`: `manual-verification.json` keys match manual approaches in both directions.
- `K1..K3`: `// Covers:` markers syntax, no orphan IDs, testable cases covered.
- `R1, R2`: `coverage-report.md` required sections and total count.
- `Git Diff`: Zero production code changes (only `testID` attributes if strictly needed).

---

### STEP H — Final Reply & Command Block

1. **Summary**: Files created/modified, cases in/out of scope, FRs, tasks touched/added, tests added, production test selectors.
2. **Counts**: `COVERED / PARTIAL / FAILING / GAP / MANUAL / DIVERGENT / QA-SUSPECT / OUT-OF-SCOPE`, steps proven / in scope.
3. **Retrofit Findings**: Divergences, spec drift, gaps, orphans.
4. **Command Block for User Terminal Execution** (DO NOT execute test runners or checker yourself):

```bash
# 1. Run feature tests to verify suite green (ONLY the test files affected by this spec):
<stack test command, e.g. npx jest <affected-test-files> --watchAll=false>

# 2. Generate / refresh coverage report and traceability:
node <skill-dir>/tools/assemble-retrofit.js --spec <SPEC_FOLDER> --tests <affected-test-files>

# 3. Run mechanical checker (exits 0 when all checks pass, 1 on any FAIL):
node <skill-dir>/tools/check-retrofit.js --spec <SPEC_FOLDER> --tests <affected-test-files>
```

**CRITICAL**: In the test runner command, list ONLY the test files affected by that spec (new tests authored and existing test files modified), NEVER the entire test suite, all test directories, or unrelated test files.
