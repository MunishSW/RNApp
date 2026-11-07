---
name: spec-to-tdd
description: >-
  Convert an existing vanilla-speckit spec folder into a test-case-driven specification package.
  Maps QA test cases (.xlsx, .csv, .json, .md) to existing unit tests with quoted assertions, writes
  new unit tests for testable gaps, renumbers FR IDs to flat FR-NNN, and generates traceability tables,
  manual verification checklists, and coverage reports. Supports React Native (Jest), Flutter, Angular,
  Android, and iOS. Triggers: "spec-to-tdd", "retrofit spec", "convert spec to tdd", "map QA to spec".
version: 3.2.2
---

# spec-to-tdd

Convert an existing vanilla-speckit spec folder into a TEST-CASE-DRIVEN specification package.
The feature is already built. This skill:
1. Extracts the QA acceptance contract into `qa-cases.json` via deterministic tooling (< 1s).
2. Maps every in-scope QA case to proof in existing tests (quoted assertion lines).
3. Writes new unit tests only where no test proves a testable case.
4. Flattens requirement IDs to `FR-NNN` and assembles traceability, manual verification checklists, and coverage reports deterministically.
5. Verifies all 19 mechanical rules via `check-retrofit.js` (< 0.1s).
6. Produces a scoped terminal execution block targeting ONLY affected test files (runs in ~1-2s).

Does NOT change production code. Supports React Native (Jest), Flutter, Angular, Android, and iOS; only the test layer differs.

---

## Inputs

- **`SPEC_FOLDER`** (required, convert in place): `specs/<feature>`
- **`QA_CASES`** (required, acceptance contract): Path to `.xlsx`, `.xlsm`, `.csv`, `.json`, `.docx`, `.md`, `.txt`, or pasted text; sheet(s): `<names or "all">`
- **`QA_SCOPE`** (optional): User-confirmed scope (module names, ID list, or keywords; otherwise Step A.4 decides)
- **`BRD`** (optional): Path to BRD or `N/A`
- **`CONTINUE_IN_PLACE`** (optional, boolean, default `false`): Set to `true` (or pass `RERUN_MODE: continue`) to bypass Step A.3 STOP AND ASK when updating an already retrofitted spec.

Infer the rest (stack, runner, test files, commands). No story ID, Jira ID, Figma link, or constitution needed. Create no `stories.json`, ledger, or "Stories" table.

**BEFORE ANY EDIT**: Create and switch to branch `retrofit/<feature>-tdd`. Do not commit.

---

## High-Speed Deterministic Pipeline (Tools + LLM Intelligence)

This skill pairs lightweight deterministic Node scripts located in `<skill-dir>/tools/` (e.g. `.claude/skills/spec-to-tdd/tools` or `.agents/skills/spec-to-tdd/tools`) for mechanical tasks with LLM reasoning for test analysis:

```
[QA Source] ---> prep-qa.js (0 tokens, <0.2s) ---> qa-cases.json (100% schema compliance)
                                                            |
                                                            v
[Test Files] <--- LLM Intelligence (Step C & D) <-----------+
  * Quotes real assertion lines (expect(...))
  * Authors new tests for GAPs with // Covers: markers
                                |
                                v
[Spec Files] ---> flatten-frs.js (0 tokens, <50ms) ---> Flat FR-001..FR-NNN across all files
                                |
                                v
[Tasks.md] <---- Structure Tasks (Step E.2) -------> Finalize verdicts.json with Task IDs
                                                            |
                                                            v
[Spec & Tasks] <--- assemble-retrofit.js (0 tokens, <0.3s) <--+
  * Generates ## TC -> Task coverage table
  * Mathematical guarantee on Counts: line arithmetic
  * Generates manual-verification.json with 1:1 key parity
  * Generates coverage-report.md and spec.md traceability
                                |
                                v
[Self-Check] <---- check-retrofit.js (0 tokens, <0.1s) -------> Exits 0 on all 19 checks
```

`<skill-dir>` refers to the directory containing this `SKILL.md`.

---

## Rules

1. **Preserve, never rewrite**: Keep all existing spec content: business rules, scenarios, owner decisions, open items, contracts, research, data models, quickstarts, release notes, checklists, the spec's own TC tables, and task states (`[X]`/`[x]` stays ticked). Patch in place; no `-copy` or `-v2` files. Keep line endings (CRLF/LF) and encoding byte-for-byte; report mojibake, do not fix.
2. **QA cases are the contract**: A case contradicting a recorded spec decision (timing target, dialog shown or not, WebView vs native): change neither spec nor code; write no test contradicting the code. Classify as `DIVERGENT` and report in findings.
3. **Never invent a case ID, expected result, or mapping**: Unprovable link = `UNVERIFIED`. The only allowed requirement creation is when the spec has no fitting FR (Rule E.0).
4. **NO CODE CHANGES**: Only exception: add a test selector (`testID`, `accessibilityIdentifier`, `contentDescription`, `data-testid`, or Semantics key) to an existing element when a NEW test requires a selector and none exists. List each with `file:line` in Step H. Do not fix bugs, types, styles, or imports in production files. Do not repair test files that fail to load or are stale; report them. In existing test files, edit only:
   - (a) `// Covers:` markers
   - (b) legacy bracket title tags rewritten to QA ID on a single proven match (never add a tag to a test that has none)
   - (c) neutral rename of mislabelled tags
   - (d) convert an unproven `Covers:` marker to a plain comment keeping its note
   - (e) imports needed by tests you add.
   Never weaken, delete, or rewrite an existing assertion.
5. **No Red/Green/Refactor tasks, Tags: lines, or TESTS: lines**.
6. **Re-run on an already converted folder**: Update each section in place; never append a second copy of any section, row, task, or phase.
7. **Only ID change allowed**: FR IDs renamed to flat `FR-NNN` (Rule E.0) in the spec folder and in comment text of test files (never production files). Reason: review tools read `FR-4.1-01` as `FR-4`. BR, TV, PERF, scenarios, and T### tasks are never renamed.
8. **Spec Isolation**: Work ONLY from `SPEC_FOLDER`, `QA_CASES`, `BRD`, and feature source/test files. Never read or reuse any other folder under `specs/`, even if identical. References to other spec folders inside files are listed as legacy references, never opened. Rebuild `qa-cases.json` from the QA source every run, never from an existing JSON.
9. **Do the work yourself**: No workflows, background jobs, or sub-agents unless the user asks.
10. **STOP AND ASK Protocol**: Write nothing, print the question with evidence (tables, counts, A.1 stack, A.2 test-file list), and end the run. If you cannot ask, the run ends. Never continue on a guess.
11. **SPEC-DRIFT**: Spec-vs-code drift is only reported: `SPEC-DRIFT FR-NNN` with `file:line`, plus an Open-item task. Never fix code or test unbuilt behaviour.
12. **DO NOT run application test runners inside the prompt**: Never run `npx jest`, `flutter test`, `ng test`, `gradlew`, or `xcodebuild` foreground or background. Proof is established by static code analysis (quoting real assertion lines). (Note: Running the lightweight static script `node <skill-dir>/tools/check-retrofit.js` in Step G is permitted and required as it only checks file text without running code).
13. **TARGET ONLY AFFECTED TEST FILES**: The test command output in Step H must list ONLY the test files affected by that spec (new tests authored and existing test files modified), NEVER the entire test suite or unrelated directories.

---

## Step-by-Step Procedure

### STEP A — Inventory (Read-Only)

1. **A.1 Detect Stack & Runner** (ask only if ambiguous, state what you found):
   - React Native / JS-TS: `package.json` + Jest (`__tests__/<name>.test.<ext>` or `<name>.test.<ext>`)
   - Flutter: `pubspec.yaml` (`<name>_test.dart`)
   - Angular: `angular.json` + test builder (`<name>.spec.ts`; Karma/Jasmine or Jest, never assume Karma)
   - Android: `build.gradle(.kts)` (`src/test/**/<Name>Test.kt|java` + `src/androidTest`)
   - iOS: `*.xcodeproj` / `Package.swift` / `Podfile` (`Tests/<Module>Tests/<Name>Tests.swift`)
   Use only declared test dependencies; report undeclared dependencies under Gaps.
2. **A.2 Read Feature Spec & Test Files**:
   - Take test paths from `tasks.md`, `plan.md`, and traceability files; confirm on disk.
   - If none exist, search test dirs for feature source names, screen names, `Covers:` markers, or bracket tags.
   - A shared test file outside the feature folder already carrying `Covers:` markers for another spec's QA IDs is "shared, owned by another spec": not proof, not edited (except FR ID renames in comments).
   - Print final test list and stack/command. List: requirement IDs, scenarios, tasks, markers, bracket tags, spec TC tables, manual-check docs.
3. **A.3 Start Check (STOP AND ASK)**:
   Unless `CONTINUE_IN_PLACE: true` is provided (e.g. updating an already converted spec in place), stop and ask whether to continue in place or stop when ANY of the following 3 triggers are true:
   - (a) Feature's own test files already carry `Covers:` markers with QA IDs from `QA_CASES`
   - (b) `SPEC_FOLDER` holds `qa-cases.json` or `coverage-report.md`
   - (c) `tasks.md` has `## TC -> Task coverage` (ASCII arrow) or an older table whose first column holds QA IDs from `QA_CASES`.
   *(Note: A table of another shape, with Unicode "→", or a spec's own "Test Cases" table is LEGACY: keep it per E.2, do not stop).*
4. **A.4 Relevance Gate (Before Writing)**:
   - If `QA_SCOPE` is given, apply it first.
   - Compare module and scenario names with spec title, summary, behaviours, and source files. A case is IN SCOPE when some step's expected result is produced by files named in the spec or feature folder.
   - Decide whether child components count; compute in-scope count **with and without borderline cases**.
   - Print table: module (or scenario/id range), cases count, in-scope count, one-line reason.
   - If `< 20%` in scope (either count): **STOP AND ASK** for the right sheet or a `QA_SCOPE` filter, displaying candidate sheets.
   - If `> 25%` out of scope but `>= 20%` in scope: record note to print in Step H, continue.
   - If `> 50%` out-of-scope and no `QA_SCOPE` given: first line of Step H report and `coverage-report.md` must be:
     `SUSPECT INPUT: <n>% of the QA cases are out of scope`
   - If user confirmed sheet or gave `QA_SCOPE` with out-of-scope cases: first line must be:
     `CONFIRMED SCOPE: <n>% of the sheet is out of scope`
5. **A.5 Spec Integrity**:
   - Report `spec.md` cut off mid-sentence, duplicate headings, an ID defined twice with different text, contradicting requirements, or garbled text with editing remarks ("wait, ..."). Report test titles carrying another feature's task IDs. Do not fix.
6. **A.6 Static Test Inspection (No Execution)**:
   - Parse each feature test file read-only. Detect syntax errors (FILE blockers) or missing dependencies (ENV blockers).
   - In `tasks.md`, `T-ENV-001` is the user's terminal gate to run the suite; record any blockers in `T-ENV-001` text.
7. **A.7 Spec vs Code**:
   - Verify if live code implements each requirement. Record misses as `SPEC-DRIFT FR-NNN` with `file:line` (Rule 11).

---

### STEP B — Deterministic QA Extraction (`prep-qa.js`)

Run the fast extractor tool to build `<SPEC_FOLDER>/qa-cases.json`:

```bash
node <skill-dir>/tools/prep-qa.js --qa <QA_CASES> [--qa-sheet <names>] [--qa-scope <filter>] --out <SPEC_FOLDER>/qa-cases.json
```

- Handles: custom headers, merged cells, step-per-row rows (`Step 1: ...` and status rollup), missing row IDs (`<sheet code>-R<row>`), duplicate rows (identical desc+expected deduplicated), and clashes (same ID with different desc/expected suffixed `S2`, `S3...`).
- Cases with the same ID on several sheets are qualified as `<sheet> / <id>`.
- Guarantees exact 10 keys required by Check C1: `approach, category, desc, expected, id, module, scenario, source, status, type`.
- Track metrics for Step H: `step rows R -> cases C`, duplicates ignored, IDs suffixed/qualified, generated IDs.
- **FALLBACK**: If `prep-qa.js` fails or input is `.docx` / pasted text, write `qa-cases.json` manually adhering strictly to the 10 keys above, Step B.2 step rollup, and Step B.3 duplicate/clash rules.

---

### STEP C — Prove Every In-Scope Case (Intelligence & Code)

Read `<SPEC_FOLDER>/qa-cases.json` and the feature test files. For each in-scope case in `qa-cases.json` order:

1. **Find Candidate Tests**: Search for the behaviour, then READ test bodies.
2. **Quote Proof**: A test PROVES a case ONLY if you can quote the exact assertion line (`expect(...)`) checking the expected result.
   - *Not proof*: mount-only / truthy tree, source-text grep, assertions on constants or mocks, no assertion. Mark `STALE-OR-WEAK`.
   - *Vague expected*: mark `PARTIAL` unless assertion checks a concrete observable.
   - *Title carrying QA ID but testing something else*: `MISLABELLED` (proves nothing).
3. **Classify (Statically Mapped)**:
   - `COVERED`: every part of expected asserted by a quoted line in an existing test that can pass (statically mapped, not run).
   - `PARTIAL`: some parts asserted (quote assertion and state missing part).
   - `GAP`: no test exists, or behaviour not built.
   - `MANUAL`: device, screen reader, real network, hardware, gesture feel, biometric, permissions, native-only.
   - `DIVERGENT`: contradicts recorded spec decision (never change spec/code).
   - `QA-SUSPECT`: case disagrees with BOTH spec and BRD.
   - `OUT-OF-SCOPE`: not this feature (Step A.4).
   *(Note: `FAILING` is never declared on static analysis; it is reported only if pre-existing failure blockers were found or when the user shares terminal test run results).*
4. **Markers**: Place directly above each proving test:
   ```typescript
   // Covers: <QA-ID>[, <QA-ID>] - <short note>
   ```
   - **CRITICAL FORMAT RULE (Check K1)**: Exact syntax required: `// Covers: <QA-ID>[, <QA-ID>] - <note>` with a single space after `Covers:`, a hyphen with one space on each side (` - `), and a non-empty note.
   - **BANNED KEYWORDS (Check K1)**: NEVER write `// Supports:`, `// Verifies:`, or `// Related:`. Only `// Covers:` is permitted.
   - Add title tag `[<QA-ID>]` only on tests you author where the language permits.
   - If an existing test had a legacy bracket tag (e.g. `[TC-001]`), rewrite to the matching QA ID only on a proven match.
   - If an existing test had an unproven `Covers:` marker, convert to a plain comment keeping its note.
5. **Assign Approach Format**:
   - `COVERED`: `unit-testable - <what the test asserts>`
   - `MANUAL`: `manual - <why a unit test cannot prove it>`
   - `PARTIAL (human remainder)`: `unit-testable - partial: <asserted>; manual remainder: <what human checks>`
   - `PARTIAL (blocked)`: `unit-testable - partial: <asserted>; blocked: <feature>`
   - `PARTIAL (divergent)`: `unit-testable - partial: <asserted>; divergent: <what>`
   - `GAP`: `unit-testable - gap: <what is missing>`
   - `DIVERGENT`: `unit-testable - divergent: <reason>`
   - `QA-SUSPECT`: `unit-testable - qa-suspect: <reason>`
   - `OUT-OF-SCOPE`: `out-of-scope - <reason>`
6. **Approach Staging**:
   Keep track of each case's classification and approach string. Do not write `verdicts.json` yet; it will be finalized with exact task IDs in Step E.2 after tasks are authored.

---

### STEP D — Author New Tests (Unit-Testable GAP / PARTIAL Only)

- Author tests ONLY for unit-testable `GAP` and `PARTIAL` cases where the behaviour is built.
- Minimum one test per case. Assert the expected result precisely (strings, counts, navigation, states).
- Mock only external boundaries (network, native modules, storage). Never mock the unit under test.
- Title `[<QA-ID>] <behaviour>` with `// Covers: <QA-ID> - <note>` marker directly above.
- Record all affected test files (created or modified) as a comma-separated list without spaces (`--tests <file1>,<file2>`) for Step E, F, G, and H.

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
- If the spec has no FR IDs, systematically derives them under `## Derived Requirements` with `[derived by retrofit - needs review]`.
- **CRITICAL RULE (Check I1)**: No dotted or lettered FR IDs (`FR-4.1-01` or `FR-A`) may remain in ANY `.md` file in `SPEC_FOLDER`, except on lines containing `Former id`.
- **FALLBACK**: If `flatten-frs.js` fails, perform the renumbering, wildcard replacement, and Former ID table insertion manually.

#### E.1 Update `spec.md`
- Ensure every in-scope case maps to at least one FR (or `FR: none (manual)`). OUT-OF-SCOPE cases get no FR.
- A functional case with no matching FR: check BRD; if still none, add a NEW FR at the end of its section marked `[added by retrofit - needs review]` and report.
- Add `### Test-case -> FR traceability` before "Key Entities" (or right after Functional Requirements) with `| FR | QA cases |`.
- Update any success criteria counting tests with real numbers. Keep the spec's own TC table, labelled `spec-derived TCs (not QA ids)`.

#### E.2 Update `tasks.md` & Finalize `verdicts.json`
- Keep all existing tasks and checkbox states intact.
- Near the top, add/extend the specification file list and Environment Gate:
  ```markdown
  - [ ] T-ENV-001: Run <test command> - existing suite green.
  ```
  *(Unticked by default; user runs this in terminal. Include any blockers found in A.6).*
- Ensure EVERY task carries:
  ```markdown
  **Maps**: FR-NNN · **Accept**: <plain-language done condition>
  ```
  - **CRITICAL RULE (Check T7 & T8)**: `**Maps**:` must contain explicit comma-separated `FR-NNN` (e.g. `FR-001, FR-002`). It must NEVER contain ranges like `FR-001 - FR-005` or the word `none`. If reformatting an existing task with another layout or range, preserve the original text as `(was: ...)` (e.g. `**Maps**: FR-001, FR-002 (was: FR-1.1 to FR-1.2) · **Accept**: ...`).
  - **CRITICAL RULE (Check T9)**: Every FR defined in `spec.md` MUST appear in the `**Maps**:` of at least one task in `tasks.md`.
- Tasks for new Step D tests: add under phase `## Retrofit Tests` with `- [ ]` (unticked by default; will be ticked green after user runs the test command in Step H).
- Unchecked tasks under `## Retrofit Gaps` with `- [ ]` for: unbuilt GAP cases, blocked remainders, needs seam, environment fixes, and `SPEC-DRIFT` items.
- For an unbuilt FR with no task, add an unchecked Open-item task with explicit Maps and Accept:
  ```markdown
  - [ ] T###: Open item <FR-NNN>: <requirement summary>; not built, awaiting owner decision (<open item id> if any)
        **Maps**: FR-NNN · **Accept**: Awaiting owner decision / built in future milestone.
  ```
- An existing "TC -> Task coverage" table of another shape: retitle to `Legacy test-approach rows`.
- **Finalize `<SPEC_FOLDER>/verdicts.json`**:
  Now that all task IDs (existing build tasks and new `## Retrofit Tests` tasks) are known, write `<SPEC_FOLDER>/verdicts.json`. To prevent heuristic fallback in Step F, you MUST specify explicit task IDs in `tasks`:

  ```json
  {
    "FAQ_FUNC_TC_001": {
      "approach": "unit-testable - asserts question expands on click",
      "tasks": ["T034"]
    },
    "FAQ_FUNC_TC_008": {
      "approach": "manual - TalkBack screen reader announcement verification",
      "tasks": ["T035"]
    },
    "BILLING_TC_001": {
      "approach": "out-of-scope - billing module owned by spec 004",
      "tasks": ["n/a"]
    }
  }
  ```
  *(Note for Check T6: For all `out-of-scope` cases, `tasks` MUST be `["n/a"]`).*

#### E.3 Update `plan.md`
- If `plan.md` is absent, create it.
- Add/update `## Requirement -> File allocation` (`| FR | Files |`) and `## Dependency / Mock Strategy` based on actual implementation. Leave the rest intact.

#### E.4 Update `checklists/requirements.md`
- If absent, create it; otherwise append retrofit checklist items: in-scope cases mapped, no orphan IDs, every COVERED case has quoted assertion evidence, manual verification file present, divergences and spec drift recorded.

#### E.5 Write `orphans.txt`
- If any legacy test case IDs, unmapped references, or cross-spec references exist, record them with `file:line` in `<SPEC_FOLDER>/orphans.txt`.

---

### STEP F — Deterministic Assembly (`assemble-retrofit.js`)

Run the assembler tool to generate remaining artifacts:

```bash
node <skill-dir>/tools/assemble-retrofit.js --spec <SPEC_FOLDER> [--tests <affected-test-files>] [--verdicts <SPEC_FOLDER>/verdicts.json]
```

- Constructs `## TC -> Task coverage` in `tasks.md` with guaranteed arithmetic in the `Counts:` line:
  `Counts: <total> QA cases = <n> covered + <n> partial + <n> manual + <n> gap + <n> divergent + <n> qa-suspect + <n> out-of-scope + <n> failing (parts must add up to the total).`
- Generates `manual-verification.json` with exact 1:1 key parity for every manual case and manual remainder.
- Generates / updates `coverage-report.md` with Summary, Action Needed, Input QA cases, and Mapped tests (prefixed with `SUSPECT INPUT:` or `CONFIRMED SCOPE:` if triggered in Step A.4).
- Updates `### Test-case -> FR traceability` in `spec.md`.
- **FALLBACK**: If `assemble-retrofit.js` fails:
  - Hand-write `## TC -> Task coverage` in `tasks.md` ensuring the `Counts:` line matches exactly and out-of-scope rows read `| n/a |` (Check T6).
  - Create `manual-verification.json` ONLY if manual cases or manual remainders exist. If 0 manual cases, do NOT create it (Check M1).
  - Write `coverage-report.md` containing these EXACT 5 headings (Check R1):
    1. `## Summary`
    2. `## Action needed`
    3. `## 1. Input QA cases`
    4. `## 2. Tests mapped to cases`
    5. `## 3. Manual verification`

---

### STEP G — Mechanical Self-Check Verification (`check-retrofit.js`)

Execute the mechanical verification script inside the agent turn (it is a lightweight static checker, taking < 0.1s):

```bash
node <skill-dir>/tools/check-retrofit.js --spec <SPEC_FOLDER> --tests <affected-test-files>
```

Verify that all 19 checks pass:
- `C1, C2, C3`: `qa-cases.json` schema (exact 10 keys: `approach, category, desc, expected, id, module, scenario, source, status, type`), unique IDs, valid approach words (`unit-testable`, `manual`, `out-of-scope`).
- `T1..T9`: `## TC -> Task coverage` table format, single heading, exact rows/order as `qa-cases.json`, Counts line arithmetic, `**Maps**:` and `**Accept**:`, `n/a` for out-of-scope, every defined FR mapped in tasks.
- `I1`: Zero dotted or lettered FR IDs (`FR-4.1-01`) remain in any `.md` file in the spec folder.
- `M1`: `manual-verification.json` keys match manual approaches in both directions.
- `K1..K3`: `// Covers:` markers syntax, no foreign keywords, no orphan IDs, testable cases covered.
- `R1, R2`: `coverage-report.md` required sections and total count matching `qa-cases.json`.
- `Git Diff`: Verify zero production code changes (only `testID` attributes if strictly needed).

If any check fails, fix the issue immediately before completing.

---

### STEP H — Final Reply & User Command Block

1. **Header / Banner**:
   - If triggered in Step A.4, line 1 MUST be `SUSPECT INPUT: <n>% of the QA cases are out of scope` or `CONFIRMED SCOPE: <n>% of the sheet is out of scope`.
2. **Extraction & Scope Metrics**:
   - `step rows R -> cases C` line, duplicates ignored count, IDs suffixed/qualified count, generated IDs count.
   - Total `qa-cases.json` cases and schema validity.
   - In-scope case count **with and without borderline cases**.
   - Note if `> 25%` of cases are out of scope (even if `>= 20%` in scope).
3. **Summary**: Files created/modified, cases in/out of scope, FRs, tasks touched/added, tests added, production test selectors (`file:line`).
4. **Counts**: `COVERED / PARTIAL / FAILING / GAP / MANUAL / DIVERGENT / QA-SUSPECT / OUT-OF-SCOPE`, steps proven / in scope.
5. **Retrofit Findings**:
   - DIVERGENCES: case ID, expected, what spec/code does, who decides.
   - SPEC-DRIFT: requirement ID, `file:line`, Open-item task ID.
   - QA-SUSPECT; MISLABELLED; STALE-OR-WEAK tests.
   - PRE-EXISTING FAILURES / blockers.
   - GAPS: case ID, reason, task ID.
   - ORPHANS: count, full list in `<SPEC_FOLDER>/orphans.txt`.
6. **Command Block for User Terminal Execution** (DO NOT execute test runners yourself):

```bash
# 1. Run feature tests to verify suite green (ONLY the test files affected by this spec):
<stack test command, e.g. npx jest <affected-test-files> --watchAll=false>

# 2. Refresh coverage report and traceability:
node <skill-dir>/tools/assemble-retrofit.js --spec <SPEC_FOLDER> --tests <affected-test-files>

# 3. Run mechanical checker (exits 0 when all checks pass, 1 on any FAIL):
node <skill-dir>/tools/check-retrofit.js --spec <SPEC_FOLDER> --tests <affected-test-files>
```

**CRITICAL**: In the test runner command, list ONLY the test files affected by that spec (new tests authored and existing test files modified), NEVER the entire test suite, all test directories, or unrelated test files.
