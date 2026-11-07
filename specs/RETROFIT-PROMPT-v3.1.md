TASK: Convert an existing vanilla-speckit spec folder into a TEST-CASE-DRIVEN spec package.

The feature is already built. You will (1) map every in-scope QA case to proof in the existing tests,
(2) write new unit tests only where no existing test proves a case, and (3) add the traceability
files and a coverage report. This works for any front-end stack (React Native / JS-TS, Flutter,
Angular, native Android, native iOS): only the test layer differs (Step A.1). You will NOT change
production code.

INPUTS
- SPEC_FOLDER (convert in place): specs/<NNN-feature>
- QA_CASES (required, the acceptance contract): <path(s) to .xlsx / .csv / .json / .docx / .md / .txt, or pasted text>
    sheet(s) in scope: <name(s) or "all">
- QA_SCOPE (optional; the user's confirmation of which cases belong to this spec): <module names, id
    list or keywords; else decided in Step A.4>
- BRD (optional): <path or N/A>

Infer everything else (stack, test runner, test files, test command). No story id, Jira id, Figma link
or constitution is needed. Do not create stories.json, a ledger or a "Stories" table.

BEFORE ANY EDIT: create and switch to a branch named retrofit/<feature>-tdd. Do not commit.

GROUND RULES
1. Preserve, never rewrite. Keep all existing spec content: BR/TV/PERF/scenario ids, clarifications,
   owner decisions, open items, contracts, research, data-model, quickstart, release notes,
   checklists, the spec's own test-case tables, test-first task structure, and completed task states
   ([X] or [x] stays ticked). Only add, or re-shape around what exists. Patch in place; no "-copy" or
   "-v2" files. Preserve existing line endings and text encoding byte for byte; report damaged
   characters (mojibake), do not fix them.
2. The QA cases are the contract. If a case contradicts a decision recorded in the spec (a timing
   target, a dialog shown or not, a WebView vs header-only screen), do NOT change the spec or the code
   and do NOT write a test that contradicts the code. Mark the case DIVERGENT and report it.
3. Never invent a case id, an expected result, or a mapping. If you cannot prove a link, mark it
   UNVERIFIED. The one allowed creation is a requirement id where the spec has none or no fit (Step E.0).
4. DO NOT CHANGE ANY CODE. Production code stays exactly as it is. The only exception is adding a test
   identifier attribute (testID / accessibilityIdentifier / contentDescription or test tag / data-testid
   / Semantics key) to an existing element, and only when a NEW test needs a selector and none exists;
   list each such addition with file:line in Step H. Do not fix bugs, comments, ids in comments, types,
   styles, strings or imports in production files. Do not repair test files that fail to load or
   whose tests fail or are stale; report them. In an existing test file edit only: (a) the "// Covers:"
   marker, (b) a legacy bracket tag in a title, rewritten to a QA id only on a proven match (never add a
   title tag to a test that has none), (c) a MISLABELLED title tag renamed to a neutral tag, (d) a
   "Covers:" marker on a test that proves no case, converted to a plain comment that keeps its note,
   (e) import lines that a test you ADD needs. Never weaken, delete or rewrite an existing assertion.
5. Do not add Red/Green/Refactor tasks, "Tags:" lines or "TESTS:" lines.
6. If this prompt is run on a folder that is already converted, update each section in place. Never
   append a second copy of any section, table row, task or phase.
7. The one allowed id change: FR ids are renamed to the flat form FR-NNN (Step E.0), in the spec folder
   and in comment text of test files only (never production files). Reason: review tools read an id
   like "FR-4.1-01" as "FR-4" and then cannot tell requirements apart. No other id (BR, TV, PERF,
   P-/N-/E- scenarios, T### tasks, QA ids) is renamed.
8. Work only from SPEC_FOLDER, QA_CASES, BRD and the source code. Never read, copy or reuse anything
   from any other folder under specs/, even if it looks identical to this one. A reference to another
   spec folder found inside a spec or test file is listed as a legacy reference and never opened.
   Rebuild qa-cases.json from the QA source on every run, never from an existing JSON file.
9. Do the work yourself in this session. Do not start workflows, background jobs or sub-agents unless
   the user asks for them.
10. STOP AND ASK rule. Where this prompt says STOP AND ASK, write nothing, print the question with the
    evidence (tables, counts, and the A.1 stack and A.2 test-file list) and end the run. In a run where
    you cannot ask, that is the end of the run. Do not continue on a guess.
11. Spec-vs-code drift is only reported. If the spec says the code does X and it does not, write
    "SPEC-DRIFT FR-NNN" with file:line evidence in the findings and add an Open-item task. Do not
    fix the code, and never write a test that asserts behaviour that is not built.

STEP A - Inventory (read only)

A.1 Detect the stack from the repo (ask only if genuinely ambiguous, saying what you found):
    React Native / JS-TS = package.json with a test runner (Jest signals); Flutter = pubspec.yaml;
    Angular = angular.json plus the test builder (Karma/Jasmine or Jest; never assume Karma);
    native Android = build.gradle(.kts) with no root package.json/pubspec.yaml; native iOS =
    *.xcodeproj / *.xcworkspace / Package.swift / Podfile with no JS/Dart root. Read the declared test
    dependencies and use only those; if a library you would need is not declared, list it under Gaps,
    never assume it. If several checkouts of the project contain SPEC_FOLDER, use the one the user's
    inputs name; else the one whose baseline suite loads (A.6); say which and why. Hash-compare the
    spec and the feature's source and test files between the checkouts and list differences that
    change a verdict. Tests that exist only in the other checkout are listed as "sibling-only", never
    edited, and the report says that the chosen checkout has no such test.
    Test file locations by stack: JS/TS "<dir>/__tests__/<name>.test.<ext>" or "<name>.test.<ext>";
    Flutter "<name>_test.dart"; Angular "<name>.spec.ts"; Android "src/test/**/<Name>Test.kt|java"
    (and "src/androidTest" for instrumented); iOS "Tests/<Module>Tests/<Name>Tests.swift".
A.2 Read the whole spec folder, the BRD if given, and the feature's test files. Test files: take paths
    from tasks.md, plan.md and any traceability file and confirm each exists on disk. If none of those
    files exist or name a test, search the test directories for the feature's source file names (from
    the spec) and the screen name. Also search for tests carrying "Covers:" markers or a leading
    bracket tag for this feature, for tests of child components the feature's tests mock, and for tests
    of units the feature imports when a case's expected result depends on them (for example a
    formatter). A shared test file outside the feature folder that already carries "Covers:" markers
    for another spec's QA ids is listed as "shared, owned by another spec": it is not used as proof and
    not edited (except FR-id renames in comment text). Print the final list and the stack/test command.
    List: requirement ids and every id family (FR-, AC-, others), scenarios, tasks, existing markers and
    bracket tags, the spec's own test-case tables, manual-check documents.
A.3 Start check: STOP AND ASK whether to continue in place (update sections, never duplicate) or stop,
    when (a) the feature's own test files (inside the feature folder, or created for this spec) already
    carry "Covers:" markers with QA ids from QA_CASES, or (b) SPEC_FOLDER already holds qa-cases.json or
    a coverage-report.md, or (c) tasks.md already has the heading "## TC -> Task coverage" written with
    the ASCII arrow, or an older table whose first column holds QA ids found in QA_CASES. A table of
    another shape, or with the Unicode arrow "→", or a spec's own "Test Cases" table is a LEGACY table:
    keep it (Step E.2), do not stop.
A.4 Relevance gate (before anything is written). If QA_SCOPE is given, the cases it names are in scope
    and the gate below is computed on the cases left after applying it.
    For every sheet or section of QA_CASES compare the Module and Scenario names and a sample of
    descriptions with the spec's title, summary, behaviours and source files. A case is IN SCOPE when
    some step's expected result is produced by the files named in the spec, plan or tasks, or by the
    feature folder. A shared concept name (back, loader, session, title) is not enough: the case's own
    screen must be this spec's screen or call its source files. Decide whether child components the
    screen renders count, say so, and print the in-scope count with and without the borderline cases.
    Print a table: module (or scenario / id range when there is only one module), cases, in-scope
    cases, one-line reason.
    - If NO case is in scope, or fewer than 20% of the cases are in scope (on either side of the
      with/without-borderline count): STOP AND ASK for the correct QA sheet, or for a QA_SCOPE filter,
      showing the table and the candidate sheets/modules with the best overlap. A wide sheet that the
      user confirms continues with the rest out of scope.
    - If more than 25% of the cases are out of scope but at least 20% are in scope, say so in the Step H
      report and continue.
A.5 Integrity of the spec: report a spec.md that is cut off mid-sentence, has duplicate section
    headings, defines the same id twice with different text, contains text that contradicts another
    requirement, or has garbled requirement text with editing remarks ("wait, ..."). Report test titles
    that carry another feature's task ids. Do not fix; use Step E.0 rules for ids.
A.6 Baseline run: run the existing tests of the feature (stack command, no coverage) before any edit.
    Record: suites that fail to load (with the load error), failing tests (name and error), counts.
    Load failures can stack: after the first error, parse each feature test file read-only (a language
    parser, no run) and list every further blocker in order, each classed ENV (dependency, config) or
    FILE (syntax). Do not repair anything. If the suite cannot load at all, no case can be "verified by
    run": classify by quoted assertions only (Step C) and label such cases "statically mapped, not run".
    A run through a workaround config or a test file outside the repo root is reported separately and
    is never counted as verified.
A.7 Spec vs code: for each requirement, check that the code does it. Record each miss as SPEC-DRIFT
    (rule 11).
Ask-once questions that are not STOP AND ASK (an unreadable column, which column is the id, an
unlabelled status column) go in ONE message; if you cannot ask, take the most conservative choice and
state it.

STEP B - Build qa-cases.json
B.1 Before writing, print per sheet (md: per top-level heading; csv: per Tab/Group value): the detected
    header row, the column -> field mapping, the headed columns you ignore, data found in UNHEADED
    columns (legends, stray values: ignored, mention them), and the row count. Map only columns that
    have a header. Handle merged cells (carry the value down), multi-line cells (keep the line breaks),
    hidden columns. Trim leading and trailing whitespace on every field; keep internal line breaks and
    Unicode as they are. Where a separate scenario id exists, put "<scenario id> - <scenario>" in
    "scenario". If a source has no header and uses headings (md: "## CM_01 - title" plus a table), the
    id is the id token of the heading and the title is desc.
B.2 What is a case. A case is a row that carries an id. A serial-number column ("S No", "Sr.No") is
    never an id.
    - A row with a blank id and a blank case-level name continues the previous case (a step row):
      append its expected result to that case's "expected" as "Step N: <text>" lines in order (N = the
      source step number if it has one, else the position; do not renumber to close gaps, report them).
      No new case; do not copy step actions, prerequisites, dates or defect ids. For every case that
      came from step-per-row data, including a one-row case, use "Step N:" lines.
    - A row with a blank id but a filled case-level name (the Test Case Name / Title column; never a
      per-step description or step action) starts a NEW case: generate the id "<sheet code>-R<excel
      row>" and list it as generated.
    - Status: copy verbatim; blank = "Not Executed". If status is given per step, roll up: any Fail ->
      Fail; all Pass -> Pass; none -> Not Executed; otherwise "Mixed". Status is never used to classify
      a case in Step C.
    - Print "step rows R -> cases C". The check "the numbers match" applies to cases (rows that start
      a case), not step rows. Explain any difference.
B.3 Duplicates (same rule as the tdd-spec skill: ignore a true duplicate, suffix a clash):
    - The same id seen again with the same description and expected result (compared after trimming and
      collapsing whitespace): a duplicate. Ignore the repeat and list it under "duplicates ignored"
      with its source row.
    - The same id seen again with a different description or expected result: a different case. Add it
      with the suffix S2, S3, ... (TC-02 becomes TC-02S2) and report it with both source rows and both
      titles. Record the original id and rows in that case's "source" ("... row 285; id CM_32 clashes
      with row 164").
    - The same id on more than one sheet of the workbook: qualify every such case with its sheet name
      as "<sheet> / <id>" (as the tdd-spec reader does), after the duplicate check above, and do so even
      when only one of those sheets is read. Record the qualification in "sources". Write the qualified
      id exactly in markers and titles.
    - Cases with no id at all: dedup by the normalised scenario/description text; cases left get
      generated ids (B.2).
B.4 Several QA sources that describe the same cases (xlsx + md + csv of the same list): use the richest
    one (the one with expected results); list the others in "sources" only; report status disagreements
    between them. Never put both into "cases".
B.5 Write specs/<feature>/qa-cases.json. These are the ONLY fields; no others:

{
  "generated": "<YYYY-MM-DD>",
  "sources": ["<file> [sheet: <name>]", "..."],
  "cases": [
    { "id": "<QA id as given, qualified or suffixed per B.3>",
      "desc": "<title/description, verbatim>",
      "expected": "<expected result, verbatim; step lines per B.2>",
      "scenario": "<scenario/group if present, else \"\">",
      "module": "<module if present, else \"\">",
      "category": "<category if present, else \"\">",
      "status": "<per B.2>",
      "type": "<Positive | Negative | Edge | ... as given, else \"\">",
      "approach": "<filled in Step C.5>",
      "source": "<file [sheet / section]; notes per B.3>" }
  ]
}

    Test Steps and Test Data are not copied, but READ them in Step C when classifying (they carry the
    role and the flow). If there is no expected-result column, set expected to "" and print a warning:
    such cases can never be COVERED.
B.6 No case dropped, merged (other than B.2 step rows and B.3 duplicates), reworded or reordered.
    Print the in-scope list from A.4 again here, with ids.

STEP C - Prove every in-scope case (10-15 cases at a time; do not skim)
Out-of-scope cases (A.4) are not proved: class OUT-OF-SCOPE, approach "out-of-scope - <reason>", one line
for the group in the report. For each in-scope case, in qa-cases.json order:

1. Find candidate tests: grep the test files for the behaviour, then READ the test bodies.
2. A test PROVES a case only if you can quote the assertion line(s) that check the case's expected
   result. Not the test name, not a nearby assertion, not "the test exercises the same screen".
   - NOT proof, whatever the title says: a mount-only or "tree is truthy" assertion, a source-text
     grep, an assertion on a constant or value the test itself defines or mocks (check what is mocked),
     a test with no assertion, an assertion on a mock the test configured to return the answer, an
     assertion on source text that no longer exists. List such tests as STALE-OR-WEAK (SCAFFOLD for a
     whole file of them) in the findings.
   - One assertion line may be quoted for several cases if each case's expected result is exactly
     asserted by it. Near-duplicate cases do not share proof otherwise.
   - If the test asserts only part of the expected result, quote what it asserts and state what is missing.
   - A vague expected result ("should be able to...", "works correctly") is PARTIAL, not COVERED,
     unless the assertion names a concrete observable.
   - A title that carries a QA id but means something else is MISLABELLED: it proves nothing.
   - Count the case's steps: "steps in scope" and "steps proven" (a one-step case has 1); the report
     prints both per case and in total.
3. Classify:
   COVERED        every part of the expected result is asserted by a quoted line in a test that can
                  pass. When no suite can run, such a case is still COVERED but labelled "statically
                  mapped, not run"; the report never calls it verified.
   PARTIAL        some parts asserted, some not (state which)
   GAP            no test, or the behaviour is not built
   MANUAL         cannot be proven by a unit test (device, screen reader, real network, hardware,
                  device timing/memory, visual match, exact copy supplied by CMS or backend, gesture
                  callbacks or private units that cannot be reached without changing production code,
                  native-only behaviour such as lifecycle, permissions, deep links, Keystore/Keychain,
                  biometrics, certificate pinning, screenshot block, root/jailbreak checks, OS-version
                  matrix)
   DIVERGENT      contradicts a recorded spec decision, or the spec is stale against both QA and code
                  ("spec stale")
   QA-SUSPECT     the QA case disagrees with BOTH the spec and the BRD (if given). When the BRD is N/A
                  it is judged against the spec alone and also needs an inconsistency inside the case
                  (title vs steps); prefer DIVERGENT where the spec has a dated change record.
   OUT-OF-SCOPE   not part of this feature (A.4), or its rules are still open; nothing to test yet
   A case that is partly in scope: classify by the in-scope steps.
   How to split MANUAL, PARTIAL and blocked cases (the same way for every case):
   - MANUAL: the WHOLE case can only be checked by a person or device. Listed in manual-verification.json.
   - PARTIAL, remainder needs a person or device: class PARTIAL. Listed in manual-verification.json.
   - PARTIAL, remainder is not built or belongs to another feature or module (it may exist in the repo):
     class PARTIAL "blocked: <feature>". NOT listed in manual-verification.json; it gets an unchecked
     Retrofit Gaps task and no test is written here for it.
   - A mixed case (part divergent, part provable): PARTIAL plus a divergent note, so the provable
     steps still get a test.
   - Decide per case from what the unproven part needs, not from how similar cases were treated.
4. Markers. Each test that proves a case carries, on the line directly above it, EXACTLY this form:
     // Covers: <QA-ID>[, <QA-ID>] - <short note>
   Same syntax on every stack (TS, Dart, Kotlin, Java, Swift). A title tag "[<QA-ID>]" (one bracket per
   id for several ids: "[CM_17] [CM_18]") is added only to tests you write, and only where the language
   allows it in a test name (JS/TS, Dart, Kotlin backtick names); where it does not (Java, Swift method
   names) the marker alone carries the id.
   - The separator before the note is a plain hyphen with a space on each side. Never an em dash,
     en dash or colon. Ids are separated by ", ". An id may contain a sheet qualifier or an S2 suffix
     (B.3) and any character except a comma.
   - No other marker type (no "Supports:", "Related:", "Verifies:"). A test that proves no case gets no
     marker; an existing marker on such a test becomes a plain comment (rule 4d).
   - A marker is all-proof or all-divergent: a test that asserts the spec's behaviour for a DIVERGENT
     case carries only that id, with the note "divergent, not claimed as covered".
   - FR / scenario ids may appear in the note text, never in the id list.
   - A legacy tag is any leading bracket tag in a title that is not a QA id of qa-cases.json (for
     example [TC-001], [TC001], [BRD TC-N006], [E-14], [N-11], [T064]). Rewrite it to "[<QA-ID>]" only
     when the legacy id proves exactly one QA case and is unique in the file. If it proves several QA
     ids, or is reused for different tests, leave it, add the marker only, and list it under ORPHANS
     with file:line. A QA-id-shaped tag that means something else is MISLABELLED (rule 4c).
5. "approach" in qa-cases.json: a leading verdict plus the reason. The verdict word MUST match the class:
     COVERED / testable part       "unit-testable - <what the test asserts>"
     MANUAL                        "manual - <why a unit test cannot prove it>"
     PARTIAL, human remainder      "unit-testable - partial: <what is asserted>; manual remainder: <what a person checks>"
     PARTIAL, blocked              "unit-testable - partial: <what is asserted>; blocked: <feature>"
     PARTIAL, divergent note       "unit-testable - partial: <what is asserted>; divergent: <what>"
     GAP                           "unit-testable - gap: <what is missing>"
     FAILING                       "unit-testable - failing: <what the test asserts and why it fails>"
     DIVERGENT                     "unit-testable - divergent: <reason>"
     QA-SUSPECT                    "unit-testable - qa-suspect: <reason>"
     OUT-OF-SCOPE                  "out-of-scope - <reason>"
   Never write "manual - ..." for a case whose class is not MANUAL, and never "out-of-scope - ..." for
   a case classified otherwise. The class is final after Step D and the run (G.1): a GAP case that
   receives a new test is reclassified.
6. For every GAP and PARTIAL case that is unit-testable, WRITE THE NEW TEST (Step D). Do not write
   tests for MANUAL, DIVERGENT, QA-SUSPECT or OUT-OF-SCOPE cases, or for behaviour that is not built.

STEP D - Write new tests (only for unit-testable GAP / PARTIAL cases)
- Use only test libraries the project declares (A.1). Place the test in the existing test file for that
  unit if one exists and it loads (match its imports, helpers, mocks, setup and style). If that file
  does not load or its mocks are stale, create a new file next to it and do not edit the broken one;
  otherwise create a new test file next to the code it covers, named by the stack's convention.
- One test per case minimum. The assertions must check the case's expected result exactly: exact
  strings, counts, order, call arguments, navigation targets, analytics payloads, states. Cover the
  boundary or negative value the case names. No snapshot-only tests, no assertion-free tests, no
  "expect(true)", no assertions on mocks you set up to return the answer.
- Mock only external boundaries (network, native modules, timers, navigation, storage) the way the
  project's plan.md "Dependency / Mock Strategy" or neighbouring tests do. Do not mock the unit under test.
- If the unit is not reachable (private function, gesture worklet, a native class that needs a protocol
  seam, no runtime mocking on iOS) do not change production code and do not write a mock-everything
  test: add a Retrofit Gaps task "needs seam: <what>" and classify the case MANUAL or PARTIAL blocked.
- A selector problem is the only reason to touch production code: add a test identifier (rule 4).
- Title "[<QA-ID>] <behavioural description>" where the language allows; marker above, exact C.4 form.
- If a new test fails, re-check your test once (wrong selector, missing await, wrong mock). If it still
  fails, the code does not meet the case: keep the test, mark the case FAILING (code defect), report it
  with the failing assertion and error. Do not delete, skip or loosen it.
- Record every new test in Step E as a task.

STEP G.1 - Run the tests (do this right after Step D, before Step E; the report is written after Step F)
Run only the feature's test files from A.2 plus any you created, with the stack's runner, no coverage:
  - JS/TS Jest: npx jest <files> --watchAll=false --coverage=false --json --outputFile=<temp file>
  - Flutter: flutter test --reporter json <files>
  - Angular on Jest: the same as Jest; on Karma/Jasmine: npx ng test --watch=false --include <files>
    (per-test results only if a JUnit/JSON reporter is configured; else "not run" and print the command)
  - Android: ./gradlew :<module>:testDebugUnitTest --tests <Class>   (JUnit XML in build/test-results)
  - iOS: xcodebuild test -scheme <S> -destination <dest> -only-testing:<Target>/<Class>
Timeout 5 minutes. If no case maps to a test, skip the run. Do not re-run silently to get a different
result. If a test fails, report its name and error; the case is "mapped, failing", not covered. If the run
cannot finish or the suite cannot load, say so and use "not run"; never fabricate results. A case is
covered only if every test mapped to it passed. Fix a failing NEW test only if the failure is a defect in
the test itself (max 2 attempts); never touch production code. New tests that could not run stay unticked
in Retrofit Tests.

STEP E - Add the missing files and re-shape the existing ones
0. Requirement ids (do this first, mechanically, before anything else in Step E)
   - Inventory every id family the spec defines (FR-, AC-, other prefixes). Maps and the case -> FR ->
     task chain use FR ids only.
   - Flat FR-NNN ids that are defined in spec.md keep their number; gaps stay; new FRs take max+1; write
     "unchanged" in the Former id column. If every FR id is already flat, skip the renaming and say so.
   - Non-flat defined ids (FR-4.1-01, FR-VD-001) take the next free numbers in order of DEFINITION (the
     line that starts the requirement), not of first mention. The same id defined twice with different
     text: renumber the later definitions in order of definition, record both in the former-id table,
     report, and mark references that cannot be resolved UNVERIFIED. A mention with no definition, and
     the literal placeholder text "FR-NNN", are not renamed; list undefined mentions in the findings.
   - Replace old ids with the new ids in EVERY file of the spec folder (spec.md, plan.md, tasks.md,
     checklists, contracts, research, data-model, quickstart, release notes, traceability) and in
     comment text of the feature's test files (notes after the " - " in "// Covers:" lines and other
     comments only; never code, never production files), except inside the former-id table. Replace
     longest ids first.
   - Wildcard and range references that name no single requirement ("FR-4.1-xx", "FR-4.1 to FR-4.9",
     bare "FR-7.4") become the BRD area in words ("BRD area 4.1") or an explicit list of new ids. A range
     between two defined ids of one area ("FR-4.2-06 to FR-4.2-10") becomes an explicit comma list.
   - Former-id table in spec.md, under "### Test-case -> FR traceability":
     | FR | Former id | BRD area |, former id WITHOUT the "FR-" prefix (for example | FR-014 | 4.5-03 | 4.5 |),
     "n/a (no BRD)" where there is none, and the line "Former ids are written without the FR- prefix so
     they are never read as requirement ids." No text in the spec folder or the test files may contain
     "FR-" followed by a digit, a dot and another digit, nor "FR-" followed by a letter (except the
     placeholder "FR-NNN"). Skip this table, and the "no task before retrofit" finding, when every FR
     was derived here; say so in one line.
   - SPEC HAS NO FR IDS: create them. Walk the spec's requirement statements in order (numbered
     requirement sections, requirement tables, acceptance criteria, "shall/MUST/must" sentences, user
     stories) and write one FR-NNN per distinct statement, under a new section "## Derived Requirements"
     placed at the end of the requirements, or, if there is no requirements section, immediately before
     the first section that is not narrative (state which). Each line ends "[derived by retrofit - needs
     review]" and cites its source (section or line). Do not invent behaviour the spec does not state.
     Then every QA case in scope must map to at least one FR (E.1). The report says "N FRs derived" and
     that, because the FRs were derived here, the case -> FR -> task check is a consistency check only.
   - BR, TV, PERF, P-/N-/E- scenario ids, T### ids and QA ids are NOT renamed.
   - Re-read three renamed requirements and their tasks and confirm they still refer to the same requirement.
1. spec.md
   - "**Input**: <QA file, sheet, BRD if any>": extend an existing Input line, do not add a second. Version:
     reuse an existing "**Version**" line or front-matter "version:", else "1.0.0".
   - Every IN-SCOPE QA case must map to at least one FR. A case that maps only to a non-functional row
     (PERF-n, AVL-n) maps to that row instead of a new FR; a MANUAL or device case may show
     "FR: none (manual)". If a functional case fits no FR, check the BRD (if given); only if still none,
     add a NEW FR at the end of its section marked "[added by retrofit - needs review]" and report it.
     OUT-OF-SCOPE cases never get an FR. Never change the meaning of an existing FR.
   - Add "### Test-case -> FR traceability": before "Key Entities"; if that section is absent, right after
     the Functional Requirements section. One row per FR:
       | FR | QA cases |
       | FR-x | `CASE_1`, `CASE_2` |
     Derive each case's FRs from its own build and test tasks only (not from Environment Gate, process
     or manual-verification tasks); where one task maps many FRs, keep only the FRs the case's expected
     result actually names. FRs with no case: "none", plus the line "Any FR shown as `none` is a
     non-functional or process requirement verified through its tasks and manual checks, or a
     requirement not covered by any QA case; see Retrofit Findings." If AC ids exist, add a table
     "| AC | FR |" mapping each AC to one FR; an AC with no FR is UNVERIFIED.
   - Add: "The authoritative per-case table is `## TC -> Task coverage` in `tasks.md`."
   - Update any success criterion that counts tests with the real numbers. Keep the spec's own
     "Test Cases" table unchanged and label it "spec-derived TCs (not QA ids)".
2. tasks.md
   - Keep every existing task, its text, its checkbox and its test-first ordering. "Task line" means the
     task's heading and its body.
   - If tasks.md does not exist, create it: Environment Gate, then one task per group of FRs naming the
     source files and lines (ticked only if that code exists and the group is built), then the Retrofit
     phases. State in the file that it was synthesized by the retrofit.
   - EVERY task gets "**Maps**: FR-..., FR-... · **Accept**: <plain-language condition for done>",
     including T-ENV-001. "Maps" must hold at least one FR-NNN, with no range and never "none". A
     process or polish task maps to the FR(s) whose files or behaviour it checks or guards. A task that
     already has Maps/Accept lines in another layout (separate lines, values such as "UI Contract" or
     "—", a range "FR-001-FR-010", task ids that do not exist, extra lines between Maps and Accept):
     edit those lines in place into the one-line form, keep every other line, keep the old text as
     "(was: ...)" (a range may stay inside it), expand ranges into explicit ids, do not add a second
     pair. Task paths that do not exist on disk are reported UNVERIFIED, not fixed. New task ids
     continue the existing id format, even if it is not contiguous.
   - Add near the top if absent, or extend an existing Input line with: "specs/<feature>/ (spec.md,
     plan.md, qa-cases.json" plus ", manual-verification.json" only when that file exists, then ")",
     and an Environment Gate with
     "- [ ] T-ENV-001: Run <the project's real test command> - existing suite green." Leave it unchecked
     when A.6 found a load error or failures; put every load blocker (ENV and FILE) or the failing test
     names in the task text. Do not add any statement about when tests are written.
   - New tests from Step D go in a final phase "Retrofit Tests", each with Maps and Accept, checked [X] only
     if the test was written and passed in G.1.
   - Unchecked tasks in "Retrofit Gaps" with Maps and Accept for: GAP cases that are not unit-testable or
     not built; PARTIAL blocked remainders; "needs seam" items; environment fixes (a suite that does not
     load, stale or failing existing tests, each one task); SPEC-DRIFT items. Do not implement any.
   - Every FR must be named in the Maps of at least one task. An FR that is BUILT but has no task goes
     into the Maps of the task that builds it. An FR that is NOT built gets an unchecked Open-item task:
     "Open item <FR-NNN>: <requirement in a few words>; not built, awaiting owner decision (<the open
     item id> if the spec has one)", with **Maps**: <FR-NNN> and an **Accept**: line.
   - An existing "TC -> Task coverage" table of another shape: keep it, retitle it "Legacy test-approach
     rows" (the new heading text "## TC -> Task coverage" must appear exactly once in the file).
   - Append the mandatory table at the very end:

       ## TC -> Task coverage

       Counts: <total> QA cases = <n> covered + <n> partial + <n> manual + <n> gap + <n> divergent + <n> qa-suspect + <n> out-of-scope + <n> failing (the parts must add up to the total).

       | TC (id + short description) | Task(s) | Test approach |
       |---|---|---|
       | <ID> - <description>. | T0xx, T0yy | unit-testable - <what the test asserts> |

     One row per case, in qa-cases.json order, none omitted. Task(s) lists BOTH the task that writes the
     test (test task first) and the task that builds the behaviour; for OUT-OF-SCOPE cases it reads
     "n/a". In table cells escape "|" as "\|" and replace line breaks with a space (keep originals in the
     JSON). "Test approach" is your reasoned verdict with the reason.
3. plan.md - if absent create it; add "## Requirement -> File allocation" (| FR | Files |) and
   "## Dependency / Mock Strategy", built from what the code and tests actually do. Leave the rest.
4. manual-verification.json - REQUIRED when at least one case is manual or has a part that only a human
   can check. Flat object keyed by QA id:  { "<QA-ID>": "manual - <reason a human must check>" }
   The keys are EXACTLY: every case whose approach starts "manual", plus every PARTIAL case whose approach
   says "manual remainder" (reason starts "manual (remaining part) - "). Never list OUT-OF-SCOPE,
   DIVERGENT, FAILING, or PARTIAL-blocked cases. Omit the file only if no case needs a human.
5. checklists/requirements.md - create if absent; keep otherwise; append items: all in-scope cases
   mapped; no orphan ids; every COVERED case has quoted assertion evidence; manual file present;
   divergences, spec drift and qa-suspects reviewed.
6. Traceability document (if the folder has one) - keep; add "QA case -> FR -> task -> test file".

STEP F - Self-check (print results; fix failures; then continue). These are consistency checks: the
retrofit chooses both ends of the case -> FR -> task chain.
- Every case in qa-cases.json appears exactly once in the TC -> Task table; every in-scope row has a real
  task id; out-of-scope rows read "n/a".
- Counts line parts add up to the total and match the table, spec.md and the coverage report.
- Every FR has at least one case, or "none" with the standard note.
- FR ids are flat: grep the spec folder and the feature's test files for "FR-[0-9]+\.[0-9]" and
  "FR-[A-Za-z]" (ignore the placeholder text "FR-NNN") and for any bare "FR-[0-9]" that is not a 3-digit
  FR-NNN; no match, except inside the former-id table where the prefix is not written. Every FR-NNN
  used in tasks.md, plan.md or the traceability tables is defined in spec.md, and every row of the
  former-id table maps to exactly one FR-NNN.
- Every FR-NNN defined in spec.md appears in the Maps line of at least one task.
- Every task in tasks.md contains "**Accept**:" and a "**Maps**:" that holds at least one FR-NNN, no
  range and no "none" (the check applies to the text before any "(was: ...)").
- Case -> FR -> task chain, for every IN-SCOPE functional case: at least one of its tasks has, in its
  Maps, at least one FR the case is listed under. If not, add that FR to the Maps of the task that
  really verifies the case (only if true); otherwise report UNVERIFIED. MANUAL/device cases with
  "FR: none (manual)" are exempt. List the cases you checked.
- Every "Covers:" marker in every test file you edited or created matches exactly
  "// Covers: <ID>[, <ID>] - <note>" (plain hyphen, ids only in the id list); grep for other separators and
  for any other marker keyword; there must be none. Shared test files that you neither used nor edited
  are exempt.
- No orphan ids: every id in a "// Covers:" marker, and every QA-id-shaped bracket title tag, exists in
  qa-cases.json. Legacy tags (C.4) are exempt and listed as ORPHANS.
- Every COVERED case has a quoted assertion line; every unit-testable in-scope case has at least one test
  carrying its id, except DIVERGENT and QA-SUSPECT cases, GAP cases whose behaviour is not built, and
  the blocked part of a PARTIAL case.
- manual-verification.json keys = every case whose approach starts "manual" + every PARTIAL case whose
  approach says "manual remainder"; nothing else. Check both directions.
- Class and approach agree for all cases: the number of approaches starting "manual" equals the manual
  count (+ the "manual remainder" partials), "out-of-scope" equals the out-of-scope count, and
  "unit-testable" equals covered + partial + gap + divergent + qa-suspect + failing less those
  manual-remainder partials counted above.
- qa-cases.json cases have exactly the schema fields and no others.
- Relevance: at least one in-scope case exists. If OUT-OF-SCOPE is more than 50% of the cases and the
  scope was NOT confirmed by the user (no QA_SCOPE), the first line of the Step H report and of
  coverage-report.md is "SUSPECT INPUT: <n>% of the QA cases are out of scope". If the user confirmed
  the sheet or gave QA_SCOPE, print "CONFIRMED SCOPE: <n>% of the sheet is out of scope" instead.
- No production file changed, except test identifier additions listed with file:line; existing test files
  changed only as rule 4 allows, plus added tests. Show `git diff --stat` and `git diff` limited to the
  feature's files (the working tree may hold unrelated changes; ignore those): every changed production
  line is a test identifier; every changed test line is a marker, a tag, an import for an added test, a
  marker-to-comment conversion, or part of an added test.
- Line endings and encoding of every file you changed are as before (no whole-file diff caused by a
  line-ending change).

STEP G.2 - Write the coverage report (after Step F, using the results of G.1)
Write specs/<feature>/coverage-report.md:

  # <feature> - Test Coverage Report
  [first line "SUSPECT INPUT: ..." or "CONFIRMED SCOPE: ..." when Step F says so]
  Specs: `<feature>`  |  Date: <date>  |  Stack: <stack, runner>  |  Checkout: <path>
  ## Summary
  | Metric | Value |
  | Test suites run | <n> or "not run: <reason>" |
  | Tests run | <n> (<n> pass, <n> fail) |
  | New tests added by retrofit | <n> |
  | QA cases (acceptance contract) | <n> (from specs/<feature>/qa-cases.json) |
  | - in scope | <n> |
  | - out of scope | <n> |
  | - covered, passing, assertion quoted | <n> (or "statically mapped, not run") |
  | - partial | <n> |
  | - mapped but failing (code defect) | <n> |
  | - manual (need a human) | <n> |
  | - divergent from spec | <n> |
  | - qa-suspect | <n> |
  | - gap (no test, not built) | <n> |
  | Steps proven / steps in scope | <n> / <n> |
  **QA coverage: <covered>/<in scope> automated (<pct>%) · <n> manual · <n> gaps · <n> divergent**
  (when no suite could run: "<n> statically mapped / 0 verified" and no percentage; when in scope is 0
  print no percentage)
  ## Action needed   (manual cases; failing cases; gaps with task ids; divergences, spec drift and suspects to decide)
  ## Pre-existing failures   (existing tests that fail or cannot load and that no case maps to; every load blocker, ENV and FILE)
  ## 1. Input QA cases - <n>
  | # | TC ID | Test Case | Status | Steps proven / in scope | Assertion evidence |
    (Status e.g. "Covered by 3 passing tests (section 2)", "Manual (section 3)", "GAP - T0xx",
     "DIVERGENT - <why>", "OUT-OF-SCOPE"; Assertion evidence = the quoted line, file:line, for COVERED)
  ## 2. Tests mapped to cases - <n>
  | # | TC ID | Test Case (QA) | File | Test name | Origin (existing / new) | Result |
  ## 3. Manual verification - <n>
  | TC ID | Test Case | Reason | Status |   (Status "NOT RUN" until a human fills it in)

STEP H - Final reply
1. Files created / modified, with counts: cases (in scope, out of scope), FRs (derived, added), tasks
   touched, tasks added, tests added, test identifiers added to production (file:line).
2. The "step rows -> cases" line, duplicates ignored, ids suffixed or qualified, generated ids, and the
   stack, command, checkout and test files used (shared and sibling-only files listed separately).
3. Counts: COVERED / PARTIAL / FAILING / GAP / MANUAL / DIVERGENT / QA-SUSPECT / OUT-OF-SCOPE, and the
   steps proven / steps in scope total.
4. "Retrofit Findings" (also append it to checklists/requirements.md):
   - DIVERGENCES: case id, what the case expects, what spec/code does, who must decide.
   - SPEC-DRIFT: requirement, evidence file:line.
   - QA-SUSPECT cases; MISLABELLED titles; STALE-OR-WEAK / SCAFFOLD tests.
   - FAILING cases; PRE-EXISTING FAILURES; suites that cannot load and every blocker.
   - GAPS: case id, reason, task id; "needs seam" items.
   - ORPHAN legacy ids: the count here, the full list with file:line in specs/<feature>/orphans.txt; legacy
     references to other spec folders (file:line); the spec's own TC table and any PASS statuses no test
     carries.
   - UNVERIFIED mappings.
   - FRs derived or added by retrofit.
   - FRs with no task before retrofit and how each was handled.
5. Nothing else. Do not commit.
