TASK: Convert an existing vanilla-speckit spec folder into a TEST-CASE-DRIVEN spec package.
Feature is already built. (1) Extract QA contract via script, (2) map every in-scope QA case to proof in existing tests (quoted assertions), (3) write new unit tests only where no test proves a case, (4) flatten FR IDs and assemble traceability/coverage via scripts. Any stack (RN/JS-TS, Flutter, Angular, Android, iOS); only the test layer differs (A.1). Do NOT change production code.

INPUTS
- SPEC_FOLDER (convert in place): specs/<NNN-feature>
- QA_CASES (required, acceptance contract): <path(s) .xlsx/.csv/.json/.docx/.md/.txt, or pasted text>; sheet(s): <names or "all">
- QA_SCOPE (optional, user-confirmed scope: module names, id list or keywords; else A.4 decides)
- BRD (optional): <path or N/A>
Infer the rest (stack, runner, test files, command). No story id, Jira id, Figma link or constitution needed. Create no stories.json, ledger or "Stories" table.

BEFORE ANY EDIT: create and switch to branch retrofit/<feature>-tdd. Do not commit.

HIGH-SPEED DETERMINISTIC PIPELINE (Scripts + LLM Intelligence)
1. prep-qa.js (Replaces manual extraction in Step B):
   Parses .xlsx (merged cells, Step N: explosions, multi-sheet qualification, duplicate dedup, S2 clashes), .csv, .json, .md in <1s.
   Generates specs/<feature>/qa-cases.json with 100% schema perfection (exact 10 keys).
2. flatten-frs.js (Replaces mechanical renaming in Step E.0):
   Renumbers non-flat IDs (FR-4.1-01 -> FR-001) across all .md files and test comment lines in milliseconds.
   Generates Former id table in spec.md, or derives requirements under ## Derived Requirements if none exist.
3. assemble-retrofit.js (Replaces manual table building in Step E.2 & Step G):
   Deterministically builds ## TC -> Task coverage with guaranteed Counts arithmetic.
   Generates manual-verification.json with exact key parity.
   Generates/updates coverage-report.md and spec.md traceability table.

RULES
1. Preserve, never rewrite. Keep all spec content: BR/TV/PERF/scenario ids, clarifications, owner decisions, open items, contracts, research, data-model, quickstart, release notes, checklists, the spec's own TC tables, test-first task order, task states ([X]/[x] stays ticked). Add or re-shape only. Patch in place; no "-copy"/"-v2" files. Keep line endings and encoding byte for byte; report mojibake, do not fix.
2. QA cases are the contract. A case contradicting a recorded spec decision (timing target, dialog shown or not, WebView vs header-only): change neither spec nor code, write no test contradicting the code. Mark DIVERGENT, report.
3. Never invent a case id, expected result or mapping. Unprovable link = UNVERIFIED. Only allowed creation: a requirement id where the spec has none or no fit (E.0).
4. NO CODE CHANGES. Only exception: add a test identifier (testID / accessibilityIdentifier / contentDescription or test tag / data-testid / Semantics key) to an existing element when a NEW test needs a selector and none exists; list each with file:line in Step H. Do not fix bugs, comments, types, styles, strings, imports in production files. Do not repair test files that fail to load or are stale; report them. In an existing test file edit only: (a) the "// Covers:" marker, (b) a legacy bracket title tag, rewritten to a QA id only on a proven match (never add a tag to a test that has none), (c) a MISLABELLED tag renamed neutral, (d) a "Covers:" marker on a test proving no case, converted to a plain comment keeping its note, (e) imports a test you ADD needs. Never weaken, delete or rewrite an existing assertion.
5. No Red/Green/Refactor tasks, "Tags:" lines or "TESTS:" lines.
6. Re-run on an already converted folder: update each section in place; never append a second copy of any section, row, task or phase.
7. Only id change allowed: FR ids renamed to flat FR-NNN (E.0), in the spec folder and in comment text of test files (never production files). Reason: review tools read "FR-4.1-01" as "FR-4". BR, TV, PERF, P-/N-/E- scenarios, T### tasks, QA ids are never renamed.
8. Work only from SPEC_FOLDER, QA_CASES, BRD and source code. Never read or reuse any other folder under specs/, even if identical. A reference to another spec folder inside a spec/test file is listed as a legacy reference, never opened. Rebuild qa-cases.json from the QA source every run, never from an existing JSON.
9. Do the work yourself. No workflows, background jobs or sub-agents unless the user asks.
10. STOP AND ASK: write nothing, print the question with evidence (tables, counts, A.1 stack, A.2 test-file list), end the run. If you cannot ask, the run ends. Never continue on a guess.
11. Spec-vs-code drift is only reported: "SPEC-DRIFT FR-NNN" with file:line, plus an Open-item task. Never fix code or test unbuilt behaviour.
12. DO NOT RUN TEST RUNNERS OR CHECKER FOREGROUND/BACKGROUND. Never run npx jest, flutter test, ng test, gradlew, xcodebuild. Proof is established by static code analysis (quoting real assertion lines). Step H prints the test runner, coverage report generator, and checker commands for the user to run in their own terminal.
13. TEST RUNNER COMMAND MUST ONLY TARGET AFFECTED FILES. The test runner command output in Step H must list ONLY the test files affected by that spec (the new tests authored and existing test files modified), NEVER the entire suite or unrelated test files.

STEP A - Inventory (read only)
A.1 Detect stack (ask only if ambiguous, say what you found): RN/JS-TS = package.json + test runner (Jest); Flutter = pubspec.yaml; Angular = angular.json + test builder (Karma/Jasmine or Jest, never assume Karma); Android = build.gradle(.kts), no root package.json/pubspec; iOS = *.xcodeproj/*.xcworkspace/Package.swift/Podfile, no JS/Dart root. Use only declared test dependencies; a needed undeclared library goes under Gaps. If several checkouts contain SPEC_FOLDER, use the one the inputs name, else the one whose baseline suite loads; say which and why. Hash-compare spec, source and test files between checkouts; list differences that change a verdict. Tests only in the other checkout: "sibling-only", never edited.
    Test files: JS/TS "__tests__/<n>.test.<ext>" or "<n>.test.<ext>"; Flutter "<n>_test.dart"; Angular "<n>.spec.ts"; Android "src/test/**/<N>Test.kt|java" (+ "src/androidTest"); iOS "Tests/<Module>Tests/<N>Tests.swift".
A.2 Read the whole spec folder, BRD, and the feature's test files. Take test paths from tasks.md, plan.md, traceability file; confirm on disk. If none exist, search test dirs for the feature's source file names and screen name; also for "Covers:" markers or leading bracket tags for this feature, tests of child components the feature's tests mock, and tests of imported units a case depends on (e.g. a formatter). A shared test file outside the feature folder already carrying "Covers:" markers for another spec's QA ids = "shared, owned by another spec": not proof, not edited (except FR-id renames in comment text). Print final test list and stack/command. List: requirement ids and every id family (FR-, AC-, others), scenarios, tasks, markers, bracket tags, the spec's TC tables, manual-check docs.
A.3 Start check, STOP AND ASK whether to continue in place or stop, when (a) the feature's own test files already carry "Covers:" markers with QA ids from QA_CASES, (b) SPEC_FOLDER holds qa-cases.json or coverage-report.md, or (c) tasks.md has "## TC -> Task coverage" (ASCII arrow) or an older table whose first column holds QA ids from QA_CASES. A table of another shape, with Unicode "→", or a spec's own "Test Cases" table = LEGACY: keep (E.2), do not stop.
A.4 Relevance gate (before writing). If QA_SCOPE is given, apply it first; compute the gate on the rest.
    For each sheet/section compare Module and Scenario names and sample descriptions with the spec's title, summary, behaviours, source files. A case is IN SCOPE when some step's expected result is produced by files named in spec/plan/tasks or by the feature folder. A shared concept name (back, loader, session, title) is not enough. Decide whether child components count; print in-scope count with and without borderline cases.
    Print table: module (or scenario/id range if one module), cases, in-scope, one-line reason.
    - No case in scope, or <20% in scope (either count): STOP AND ASK for the right sheet or a QA_SCOPE filter, showing the table and best-overlap candidates. A wide sheet the user confirms continues, rest out of scope.
    - >25% out of scope but >=20% in scope: say so in Step H, continue.
A.5 Spec integrity: report spec.md cut off mid-sentence, duplicate headings, an id defined twice with different text, contradicting requirements, garbled text with editing remarks ("wait, ..."). Report test titles carrying another feature's task ids. Do not fix.
A.6 Static test inspection (do NOT run tests): parse each feature test file read-only (syntax / language parser, no execution). Detect obvious syntax errors (FILE blockers, e.g. unclosed blocks) or missing declared dependencies (ENV blockers). Repair nothing. All proofs are statically mapped from quoted assertions. In tasks.md, T-ENV-001 is the user's terminal gate to run the suite; if blockers were found, record each ENV and FILE blocker in T-ENV-001 text.
A.7 Spec vs code: for each requirement check the code does it. Record misses as SPEC-DRIFT (rule 11).

STEP B - Deterministic Extraction (prep-qa.js)
Run the fast extractor tool to build specs/<feature>/qa-cases.json:
  node specs/tools/prep-qa.js --qa <QA_CASES> [--qa-sheet <names>] [--qa-scope <filter>] --out specs/<feature>/qa-cases.json
- Automatically handles: custom column headers, merged cells, step-per-row rows (combining expected results into Step 1..N), missing row IDs (<prefix>-R<row>), duplicate rows (identical desc+expected deduplicated), and clashes (same ID, different desc/expected suffixed with S2, S3...).
- Guarantees exact 10-key schema required by Check C1: approach, category, desc, expected, id, module, scenario, source, status, type.
- FALLBACK: If prep-qa.js fails (or input is .docx / pasted text), write qa-cases.json yourself strictly adhering to the 10 keys above, B.2 step rollup, and B.3 duplicate/clash rules.

STEP C - Prove every in-scope case (Intelligence & Code)
Read qa-cases.json and the feature test files. For each in-scope case in qa-cases.json order:
1. Find candidate tests: search for the behaviour, then READ the test bodies.
2. A test PROVES a case only if you can quote the assertion line(s) (expect(...)) checking the expected result. Not the test name or nearby assertion.
   - NOT proof: mount-only/"tree is truthy", source-text grep, assertion on constant or mocked answer, no assertion, assertion on removed code. Mark STALE-OR-WEAK.
   - Vague expected ("works correctly"): mark PARTIAL unless the assertion names a concrete observable.
   - Title carrying a QA id but testing something else: MISLABELLED (proves nothing).
3. Classify:
   COVERED      every part of expected asserted by a quoted line in a test that can pass (statically mapped).
   PARTIAL      some parts asserted (state which)
   GAP          no test, or behaviour not built
   MANUAL       device, screen reader, real network, hardware, gesture feel, biometric, permissions, keychain, native-only.
   DIVERGENT    contradicts a recorded spec decision (never change spec/code).
   QA-SUSPECT   case disagrees with BOTH spec and BRD.
   OUT-OF-SCOPE not this feature (A.4).
4. Markers. Each test proving a case carries directly above it:
     // Covers: <QA-ID>[, <QA-ID>] - <short note>
   Plain hyphen with space each side. One bracket per id in test title: "[<QA-ID>]".
5. Set approach per case:
     COVERED / testable part: "unit-testable - <what the test asserts>"
     MANUAL:                  "manual - <why a unit test cannot prove it>"
     PARTIAL, human remainder:"unit-testable - partial: <asserted>; manual remainder: <what a person checks>"
     PARTIAL, blocked:        "unit-testable - partial: <asserted>; blocked: <feature>"
     PARTIAL, divergent:      "unit-testable - partial: <asserted>; divergent: <what>"
     GAP:                     "unit-testable - gap: <what is missing>"
     FAILING:                 "unit-testable - failing: <what the test asserts and why it fails>"
     DIVERGENT:               "unit-testable - divergent: <reason>"
     QA-SUSPECT:              "unit-testable - qa-suspect: <reason>"
     OUT-OF-SCOPE:            "out-of-scope - <reason>"
   Record verdicts in specs/<feature>/verdicts.json or update qa-cases.json approach fields.

STEP D - Author New Tests (GAP / PARTIAL only)
- Author tests only for unit-testable GAP and PARTIAL cases where behaviour is built.
- One test per case minimum. Assert the expected result exactly: strings, counts, calls, navigation, states.
- Mock only external boundaries (network, native modules, storage). Never mock the unit under test.
- Title "[<QA-ID>] <behaviour>" with "// Covers: <QA-ID> - <note>" marker above.
- Record affected test files (created or modified) for Step H.

STEP E - Flatten FRs & Structure Tasks
E.0 Run flatten-frs.js:
  node specs/tools/flatten-frs.js --spec specs/<feature> [--tests <affected-test-files>]
  - Flattens hierarchical/alphanumeric FR IDs (FR-4.1-01 -> FR-001) across spec folder and test comments.
  - Generates Former id table in spec.md under "### Test-case -> FR traceability".
  - If spec has no FRs, derives them systematically under "## Derived Requirements" with [derived by retrofit - needs review].
  - FALLBACK: If flatten-frs.js fails, renumber non-flat IDs to FR-001..FR-NNN yourself across spec files and test comments, replace wildcards (FR-4.1-xx -> BRD area 4.1), and add the Former id table in spec.md.
E.1 spec.md:
  - Ensure every in-scope case maps to an FR (or FR: none (manual)).
E.2 tasks.md:
  - Keep all existing tasks and checkboxes intact.
  - Ensure EVERY task has "**Maps**: FR-NNN · **Accept**: <condition>".
  - Add Environment Gate T-ENV-001 at top if absent.
  - Add tasks for new Step D tests under phase "Retrofit Tests".
  - Add unchecked tasks under "Retrofit Gaps" for unbuilt items / seams / spec drift.

STEP G - Deterministic Assembly (assemble-retrofit.js)
Run the assembler script to build remaining tables and files:
  node specs/tools/assemble-retrofit.js --spec specs/<feature> [--tests <affected-test-files>] [--verdicts specs/<feature>/verdicts.json]
- Generates ## TC -> Task coverage table in tasks.md with 100% arithmetic precision in the Counts line.
- Generates manual-verification.json with exact key parity (every manual case and manual remainder).
- Generates/updates coverage-report.md with Summary, Action needed, Input QA cases, Mapped tests, and Manual verification.
- Updates ### Test-case -> FR traceability in spec.md.
- FALLBACK: If assemble-retrofit.js fails, hand-write ## TC -> Task coverage in tasks.md with exact arithmetic in Counts line, create manual-verification.json for manual cases, and write coverage-report.md.

STEP F - Self-Check Verification
Verify all checks pass via mechanical checker (run manually or verify statically):
- Check C1, C2, C3: qa-cases.json schema, unique IDs, valid approach words.
- Check T1..T9: TC coverage table, Counts arithmetic, Maps and Accept on tasks, defined FR coverage.
- Check I1: No dotted/lettered FR IDs remain in spec folder.
- Check M1: manual-verification.json keys match manual approaches.
- Check K1..K3: Covers markers exact syntax, no orphan IDs.
- Check R1, R2: coverage-report.md sections and total count.
- Check Git Diff: 0 production code changes (only testID attributes if strictly needed).

STEP H - Final Reply
1. Files created/modified with counts: cases (in/out of scope), FRs, tasks touched/added, tests added, production test identifiers.
2. Counts: COVERED / PARTIAL / FAILING / GAP / MANUAL / DIVERGENT / QA-SUSPECT / OUT-OF-SCOPE, and steps proven/in scope.
3. Retrofit Findings (divergences, spec drift, qa-suspect, gaps, orphans).
4. Command block for user terminal execution (DO NOT execute test runners or checker yourself):
   Run feature tests to verify suite green (ONLY the test files affected by this spec):
     <stack test command, e.g. npx jest <affected-test-files> --watchAll=false>
   Generate / refresh coverage report and traceability:
     node specs/tools/assemble-retrofit.js --spec specs/<feature> --tests <affected-test-files>
   Run mechanical checker (exits 0 when all checks pass, 1 on any FAIL):
     node specs/RETROFIT-TEST/check-retrofit.js --spec specs/<feature> --tests <affected-test-files>
   CRITICAL: In the test runner command, list ONLY the test files affected by that spec (the new tests authored and any existing test files modified), NEVER the entire suite, all test directories, or unrelated test files.
