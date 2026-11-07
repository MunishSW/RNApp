TASK: Convert an existing vanilla-speckit spec folder into a TEST-CASE-DRIVEN spec package.
Feature is already built. (1) Map every in-scope QA case to proof in existing tests, (2) write new unit tests only where no test proves a case, (3) add traceability files and a coverage report. Any stack (RN/JS-TS, Flutter, Angular, Android, iOS); only the test layer differs (A.1). Do NOT change production code.

INPUTS
- SPEC_FOLDER (convert in place): specs/<NNN-feature>
- QA_CASES (required, the acceptance contract): <path(s) .xlsx/.csv/.json/.docx/.md/.txt, or pasted text>; sheet(s): <names or "all">
- QA_SCOPE (optional, user-confirmed scope: module names, id list or keywords; else A.4 decides)
- BRD (optional): <path or N/A>
Infer the rest (stack, runner, test files, command). No story id, Jira id, Figma link or constitution needed. Create no stories.json, ledger or "Stories" table.

BEFORE ANY EDIT: create and switch to branch retrofit/<feature>-tdd. Do not commit.

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
12. DO NOT RUN TEST COMMANDS, JEST OR THE CHECKER SCRIPT. Never run npx jest, flutter test, ng test, gradlew, xcodebuild, or any test runner foreground or background. No polling, no background tasks. Proof is established by static code analysis (quoting real assertion lines). Step H prints the test runner and checker commands for the user to run in their own terminal.

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
Ask-once questions (unreadable column, which column is id, unlabelled status column) go in ONE message; if you cannot ask, take the most conservative choice and state it.

STEP B - Build qa-cases.json
B.1 Before writing, print per sheet (md: per top-level heading; csv: per Tab/Group value): header row, column -> field mapping, ignored headed columns, data in UNHEADED columns (legends, stray values: ignored, mention), row count. Map only headed columns. Handle merged cells (carry down), multi-line cells (keep breaks), hidden columns. Trim every field; keep internal breaks and Unicode. With a separate scenario id, put "<scenario id> - <scenario>" in "scenario". Headerless md with headings ("## CM_01 - title" + table): id = the heading's id token, title = desc.
B.2 A case is a row with an id. A serial-number column ("S No", "Sr.No") is never an id.
    - Blank id + blank case-level name = step row of the previous case: append its expected result to "expected" as "Step N: <text>" lines in order (N = source step number if any, else position; never renumber to close gaps, report gaps). No new case; do not copy step actions, prerequisites, dates, defect ids. Every step-per-row case, even one row, uses "Step N:" lines.
    - Blank id + filled case-level name (Test Case Name/Title column; never a per-step description/action) = NEW case: id "<sheet code>-R<excel row>", list as generated.
    - Status: copy verbatim; blank = "Not Executed". Per-step status rolls up: any Fail -> Fail; all Pass -> Pass; none -> Not Executed; else "Mixed". Status never classifies a case (Step C).
    - Print "step rows R -> cases C". "Numbers match" applies to cases, not step rows. Explain differences.
B.3 Duplicates (tdd-spec rule):
    - Same id, same description and expected (after trim and whitespace collapse): duplicate. Ignore the repeat; list under "duplicates ignored" with source row.
    - Same id, different description or expected: different case. Suffix S2, S3... (TC-02 -> TC-02S2); report both rows and titles; record original id and rows in "source" ("... row 285; id CM_32 clashes with row 164").
    - Same id on several sheets: qualify every such case "<sheet> / <id>" after the duplicate check, even if only one sheet is read; record in "sources". Write the qualified id exactly in markers and titles.
    - No id at all: dedup by normalised scenario/description text; the rest get generated ids (B.2).
B.4 Several QA sources describing the same cases (xlsx + md + csv): use the richest (has expected results); others only in "sources"; report status disagreements. Never put both in "cases".
B.5 Write specs/<feature>/qa-cases.json with ONLY these fields:
{ "generated": "<YYYY-MM-DD>", "sources": ["<file> [sheet: <name>]"],
  "cases": [ { "id": "<QA id, qualified/suffixed per B.3>", "desc": "<verbatim>", "expected": "<verbatim; step lines per B.2>",
    "scenario": "<or \"\">", "module": "<or \"\">", "category": "<or \"\">", "status": "<per B.2>",
    "type": "<Positive|Negative|Edge|... as given, or \"\">", "approach": "<Step C.5>", "source": "<file [sheet/section]; notes per B.3>" } ] }
    Test Steps and Test Data are not copied but READ in Step C. No expected-result column: expected "" and warn; such cases can never be COVERED.
B.6 No case dropped, merged (except B.2 step rows, B.3 duplicates), reworded or reordered. Print the A.4 in-scope list again, with ids.

STEP C - Prove every in-scope case (10-15 at a time; do not skim)
Out-of-scope (A.4): class OUT-OF-SCOPE, approach "out-of-scope - <reason>", one line per group in the report. For each in-scope case in qa-cases.json order:
1. Find candidate tests: grep for the behaviour, then READ the bodies.
2. A test PROVES a case only if you can quote the assertion line(s) checking the expected result. Not the test name, a nearby assertion, or "exercises the same screen".
   - NOT proof, whatever the title: mount-only/"tree is truthy", source-text grep, assertion on a constant or value the test defines or mocks (check what is mocked), no assertion, assertion on a mock configured to return the answer, assertion on source text that no longer exists. List as STALE-OR-WEAK (SCAFFOLD for a whole file of them).
   - One assertion line may serve several cases only if it exactly asserts each one's expected result. Near-duplicates do not share proof otherwise.
   - Partial assertion: quote it and state what is missing.
   - Vague expected ("should be able to...", "works correctly") is PARTIAL unless the assertion names a concrete observable.
   - A title carrying a QA id but meaning something else is MISLABELLED: proves nothing.
   - Count "steps in scope" and "steps proven" (one-step case = 1); report both per case and in total.
3. Classify:
   COVERED      every part of expected asserted by a quoted line in a test that can pass. No suite can run: still COVERED but "statically mapped, not run", never "verified".
   PARTIAL      some parts asserted (state which)
   GAP          no test, or behaviour not built
   MANUAL       cannot be proven by a unit test: device, screen reader, real network, hardware, device timing/memory, visual match, CMS/backend-supplied copy, gesture callbacks or private units unreachable without changing production code, native-only behaviour (lifecycle, permissions, deep links, Keystore/Keychain, biometrics, cert pinning, screenshot block, root/jailbreak, OS matrix)
   DIVERGENT    contradicts a recorded spec decision, or spec stale against both QA and code ("spec stale")
   QA-SUSPECT   case disagrees with BOTH spec and BRD. BRD N/A: judged against spec alone and also needs an inconsistency inside the case (title vs steps); prefer DIVERGENT where the spec has a dated change record.
   OUT-OF-SCOPE not this feature (A.4), or its rules are still open
   Partly in-scope case: classify by in-scope steps. Split by what the unproven part needs, per case:
   - MANUAL: WHOLE case checkable only by person/device. Listed in manual-verification.json.
   - PARTIAL, remainder needs person/device: PARTIAL. Listed in manual-verification.json.
   - PARTIAL, remainder not built or another feature/module's: PARTIAL "blocked: <feature>". NOT in manual-verification.json; gets an unchecked Retrofit Gaps task; no test written.
   - Mixed (part divergent, part provable): PARTIAL + divergent note; provable steps still get a test.
4. Markers. Each test proving a case carries, on the line directly above it, EXACTLY:
     // Covers: <QA-ID>[, <QA-ID>] - <short note>
   Same syntax on every stack. Title tag "[<QA-ID>]" (one bracket per id: "[CM_17] [CM_18]") only on tests you write, where the language allows (JS/TS, Dart, Kotlin backtick names); Java/Swift: marker alone.
   - Separator before the note: plain hyphen, space each side; never em dash, en dash or colon. Ids separated by ", ". An id may contain a sheet qualifier or S2 suffix and any character except a comma.
   - No other marker type ("Supports:", "Related:", "Verifies:"). A test proving no case gets no marker; an existing one becomes a plain comment (4d).
   - A marker is all-proof or all-divergent: a test asserting the spec's behaviour for a DIVERGENT case carries only that id, note "divergent, not claimed as covered".
   - FR/scenario ids go in the note text, never the id list.
   - Legacy tag = any leading bracket tag not a QA id of qa-cases.json ([TC-001], [BRD TC-N006], [E-14], [T064]...). Rewrite to "[<QA-ID>]" only when it proves exactly one QA case and is unique in the file. If it proves several, or is reused for different tests: leave it, marker only, list under ORPHANS with file:line. A QA-id-shaped tag meaning something else is MISLABELLED (4c).
5. "approach" = verdict word + reason; the word MUST match the class:
     COVERED / testable part     "unit-testable - <what the test asserts>"
     MANUAL                      "manual - <why a unit test cannot prove it>"
     PARTIAL, human remainder    "unit-testable - partial: <asserted>; manual remainder: <what a person checks>"
     PARTIAL, blocked            "unit-testable - partial: <asserted>; blocked: <feature>"
     PARTIAL, divergent note     "unit-testable - partial: <asserted>; divergent: <what>"
     GAP                         "unit-testable - gap: <what is missing>"
     FAILING                     "unit-testable - failing: <what the test asserts and why it fails>"
     DIVERGENT                   "unit-testable - divergent: <reason>"
     QA-SUSPECT                  "unit-testable - qa-suspect: <reason>"
     OUT-OF-SCOPE                "out-of-scope - <reason>"
   Never "manual - ..." for a non-MANUAL class, never "out-of-scope - ..." for an in-scope class. Class is final after Step D; a GAP case that gets a new test is reclassified COVERED (statically mapped).
6. Every unit-testable GAP and PARTIAL case gets a NEW TEST (Step D). None for MANUAL, DIVERGENT, QA-SUSPECT, OUT-OF-SCOPE or unbuilt behaviour.

STEP D - New tests (unit-testable GAP / PARTIAL only)
- Use only declared test libraries. Put the test in the unit's existing test file if it loads (match imports, helpers, mocks, style). If that file does not load or its mocks are stale, create a new file next to it and leave the broken one; else create a new file next to the code, per stack convention.
- One test per case minimum. Assert the expected result exactly: strings, counts, order, call arguments, navigation targets, analytics payloads, states; cover the boundary/negative value the case names. No snapshot-only, assertion-free, "expect(true)", or assertions on mocks set to return the answer.
- Mock only external boundaries (network, native modules, timers, navigation, storage) as plan.md "Dependency / Mock Strategy" or neighbouring tests do. Never mock the unit under test.
- Unit unreachable (private function, gesture worklet, native class needing a protocol seam, no runtime mocking on iOS): no production change, no mock-everything test. Add Retrofit Gaps task "needs seam: <what>"; class MANUAL or PARTIAL blocked.
- A selector problem is the only reason to touch production code (rule 4).
- Title "[<QA-ID>] <behaviour>" where allowed; marker above (C.4).
- Author honest, precise tests. If the behaviour is not built in code, do not write a test; keep as GAP (unbuilt) or SPEC-DRIFT (rule 11).
- Record every new test in Step E as a task in the Retrofit Tests phase.

STEP G.1 - DO NOT RUN TESTS (terminal hand-over model)
Do NOT run Jest, Flutter, Angular/Karma, Gradle or Xcodebuild foreground or background. Never poll or launch background tasks. All proofs are statically established by quoting real assertion lines. Test execution is handed over to the user's terminal in Step H. Proceed directly to Step E.

STEP E - Add missing files, re-shape existing
0. Requirement ids (first, mechanically)
   - Inventory every id family (FR-, AC-, others). Maps and the case -> FR -> task chain use FR ids only.
   - Flat FR-NNN defined in spec.md keep their number; gaps stay; new FRs = max+1; Former id column "unchanged". All flat already: skip renaming, say so.
   - Non-flat defined ids (FR-4.1-01, FR-VD-001) take next free numbers in order of DEFINITION (the line starting the requirement), not first mention. Same id defined twice with different text: renumber later definitions in order, record both in the table, report, mark unresolvable references UNVERIFIED. Mentions with no definition, and the placeholder "FR-NNN", are not renamed; list undefined mentions in findings.
   - Replace old ids in EVERY spec-folder file (spec, plan, tasks, checklists, contracts, research, data-model, quickstart, release notes, traceability) and in comment text of the feature's test files (notes after " - " in "// Covers:" lines and other comments only; never code or production files), except inside the former-id table. Longest ids first.
   - Wildcard/range references naming no single requirement ("FR-4.1-xx", "FR-4.1 to FR-4.9", bare "FR-7.4") become the BRD area in words ("BRD area 4.1") or an explicit id list. A range between two defined ids of one area becomes an explicit comma list.
   - Former-id table in spec.md under "### Test-case -> FR traceability": | FR | Former id | BRD area |, former id WITHOUT "FR-" (| FR-014 | 4.5-03 | 4.5 |), "n/a (no BRD)" if none, plus the line "Former ids are written without the FR- prefix so they are never read as requirement ids." No spec-folder or test-file text may contain "FR-" + digit + dot + digit, nor "FR-" + letter (except "FR-NNN"). Skip this table and the "no task before retrofit" finding when every FR was derived here; say so in one line.
   - SPEC HAS NO FR IDS: derive them. Walk requirement statements in order (numbered sections, tables, acceptance criteria, shall/MUST/must sentences, user stories); one FR-NNN per distinct statement under new section "## Derived Requirements" at the end of the requirements (or, with no requirements section, right before the first non-narrative section; state which). Each line ends "[derived by retrofit - needs review]" and cites its source. Invent no behaviour. Every in-scope case must map to at least one FR (E.1). Report "N FRs derived" and that the case -> FR -> task check is then a consistency check only.
   - Re-read three renamed requirements and their tasks; confirm they still mean the same.
1. spec.md
   - "**Input**: <QA file, sheet, BRD>": extend an existing Input line, never add a second. Version: reuse "**Version**" line or front-matter "version:", else "1.0.0".
   - Every IN-SCOPE case maps to at least one FR. A case mapping only to a non-functional row (PERF-n, AVL-n) maps to that row; a MANUAL/device case may show "FR: none (manual)". A functional case with no FR: check BRD; if still none, add a NEW FR at the end of its section marked "[added by retrofit - needs review]" and report. OUT-OF-SCOPE cases get no FR. Never change an existing FR's meaning.
   - Add "### Test-case -> FR traceability" before "Key Entities" (absent: right after Functional Requirements). One row per FR: | FR | QA cases | with `CASE_1`, `CASE_2`. Derive each case's FRs from its own build and test tasks only (not Environment Gate, process or manual tasks); where one task maps many FRs, keep only FRs the case's expected result names. FR with no case: "none", plus the line "Any FR shown as `none` is a non-functional or process requirement verified through its tasks and manual checks, or a requirement not covered by any QA case; see Retrofit Findings." If AC ids exist, add "| AC | FR |" (one FR each; no FR = UNVERIFIED).
   - Add: "The authoritative per-case table is `## TC -> Task coverage` in `tasks.md`."
   - Update any success criterion counting tests with real numbers. Keep the spec's own "Test Cases" table, labelled "spec-derived TCs (not QA ids)".
2. tasks.md
   - Keep every existing task, text, checkbox and order. "Task line" = heading + body.
   - No tasks.md: create it: Environment Gate, one task per FR group naming source files and lines (ticked only if built), then the Retrofit phases; state it was synthesized by retrofit.
   - EVERY task (including T-ENV-001) gets "**Maps**: FR-..., FR-... · **Accept**: <plain-language done condition>". Maps holds at least one FR-NNN, no range, never "none". A process/polish task maps to the FR(s) whose files or behaviour it checks. A task with Maps/Accept in another layout (separate lines, "UI Contract", "—", range "FR-001-FR-010", nonexistent task ids, extra lines between): edit in place into the one-line form, keep other lines, keep old text as "(was: ...)" (a range may stay inside it), expand ranges into explicit ids, no second pair. Nonexistent task paths = UNVERIFIED, not fixed. New task ids continue the existing format.
   - Near the top, if absent (or extend an existing Input line): "specs/<feature>/ (spec.md, plan.md, qa-cases.json" + ", manual-verification.json" only if that file exists + ")", and an Environment Gate "- [ ] T-ENV-001: Run <real test command> - existing suite green." (Unchecked by default; user runs this in terminal to confirm baseline suite; include any blockers found in A.6 in task text).
   - New Step D tests: final phase "Retrofit Tests", each with Maps and Accept, [X] for tests written by retrofit.
   - Unchecked "Retrofit Gaps" tasks with Maps and Accept for: GAP cases not unit-testable or not built; PARTIAL blocked remainders; "needs seam" items; environment fixes (suite not loading, stale/failing existing tests, one task each); SPEC-DRIFT items. Implement none.
   - Every FR is in the Maps of at least one task. A BUILT FR with no task goes into the Maps of the task that builds it. An unbuilt FR gets an unchecked task "Open item <FR-NNN>: <requirement in a few words>; not built, awaiting owner decision (<open item id> if any)" with Maps and Accept.
   - An existing "TC -> Task coverage" table of another shape: keep, retitle "Legacy test-approach rows" ("## TC -> Task coverage" must appear exactly once).
   - Append at the very end:

       ## TC -> Task coverage

       Counts: <total> QA cases = <n> covered + <n> partial + <n> manual + <n> gap + <n> divergent + <n> qa-suspect + <n> out-of-scope + <n> failing (parts must add up to the total).

       | TC (id + short description) | Task(s) | Test approach |
       |---|---|---|
       | <ID> - <description>. | T0xx, T0yy | unit-testable - <what the test asserts> |

     One row per case, qa-cases.json order, none omitted. Task(s): the test-writing task first, then the building task; OUT-OF-SCOPE = "n/a". Escape "|" as "\|" and replace line breaks with a space in cells. "Test approach" = your reasoned verdict.
3. plan.md - create if absent; add "## Requirement -> File allocation" (| FR | Files |) and "## Dependency / Mock Strategy" from what code and tests actually do. Leave the rest.
4. manual-verification.json - REQUIRED when any case is manual or has a human-only part; omit only if none. Flat object keyed by QA id: { "<QA-ID>": "manual - <reason a human must check>" }. Keys are EXACTLY: every case whose approach starts "manual", plus every PARTIAL case whose approach says "manual remainder" (reason starts "manual (remaining part) - "). Never OUT-OF-SCOPE, DIVERGENT, FAILING, or PARTIAL-blocked.
5. checklists/requirements.md - create if absent; else keep; append items: in-scope cases mapped; no orphan ids; every COVERED case has quoted assertion evidence; manual file present; divergences, spec drift, qa-suspects reviewed.
6. Traceability document (if any) - keep; add "QA case -> FR -> task -> test file".

STEP F - Self-check (print results; fix failures). Consistency checks only: the retrofit chooses both ends of the chain. An independent script re-checks the mechanical items (Step H).
- Every case appears exactly once in the TC -> Task table; in-scope rows have a real task id; out-of-scope rows "n/a".
- Counts line adds up and matches table, spec.md and coverage report.
- Every FR has a case or "none" + standard note, and appears in some task's Maps. Every task has "**Accept**:" and a Maps with at least one FR-NNN (no range, no "none"; check text before "(was: ...)").
- FR ids flat: grep spec folder and the feature's test files for "FR-[0-9]+\.[0-9]", "FR-[A-Za-z]" (ignore "FR-NNN"), and bare "FR-[0-9]" not 3-digit; no match except inside the former-id table. Every FR-NNN used in tasks/plan/traceability is defined in spec.md; each former-id row maps to exactly one FR-NNN.
- Chain: for every IN-SCOPE functional case, at least one of its tasks has in Maps an FR the case is listed under. Else add that FR to the Maps of the task that really verifies it (only if true), or report UNVERIFIED. Manual "FR: none (manual)" exempt. List the cases checked.
- Every "Covers:" marker in files you edited or created matches exactly "// Covers: <ID>[, <ID>] - <note>" (plain hyphen, ids only in the list); grep other separators and keywords; none allowed. Untouched shared files exempt.
- No orphan ids: every marker id and QA-id-shaped title tag exists in qa-cases.json (legacy tags exempt, listed as ORPHANS).
- Every COVERED case has a quoted assertion; every unit-testable in-scope case has a test carrying its id, except DIVERGENT, QA-SUSPECT, unbuilt GAP, and the blocked part of PARTIAL.
- manual-verification.json keys = cases with approach "manual..." + PARTIAL "manual remainder"; nothing else (check both ways). Approach words agree with classes: "manual" count = manual (+ manual-remainder partials); "out-of-scope" = out-of-scope; "unit-testable" = covered + partial + gap + divergent + qa-suspect + failing less those manual-remainder partials.
- qa-cases.json cases have exactly the schema fields.
- Relevance: >=1 in-scope case. OUT-OF-SCOPE >50% and no QA_SCOPE given: first line of the Step H report and coverage-report.md is "SUSPECT INPUT: <n>% of the QA cases are out of scope". User confirmed sheet or gave QA_SCOPE: "CONFIRMED SCOPE: <n>% of the sheet is out of scope".
- No production file changed except listed test identifiers; existing test files changed only per rule 4 plus added tests. Show `git diff --stat` and `git diff` limited to the feature's files (ignore unrelated changes): every changed production line is a test identifier; every changed test line is a marker, tag, import for an added test, marker-to-comment conversion, or part of an added test.
- Line endings and encoding of changed files unchanged (no whole-file diff from line-ending change).

STEP G.2 - Coverage report (after F): write specs/<feature>/coverage-report.md

  # <feature> - Test Coverage Report
  [first line "SUSPECT INPUT: ..." or "CONFIRMED SCOPE: ..." when Step F says so]
  Specs: `<feature>`  |  Date: <date>  |  Stack: <stack, runner>  |  Checkout: <path>
  ## Summary
  | Metric | Value |
  | Test suites run | Statically mapped (terminal run pending) |
  | Tests run | Statically mapped by quoted assertions |
  | New tests added by retrofit | <n> |
  | QA cases (acceptance contract) | <n> (from specs/<feature>/qa-cases.json) |
  | - in scope | <n> |
  | - out of scope | <n> |
  | - covered, passing, assertion quoted | <n> (statically mapped from quoted assertions) |
  | - partial | <n> |
  | - mapped but failing (code defect) | <n> |
  | - manual (need a human) | <n> |
  | - divergent from spec | <n> |
  | - qa-suspect | <n> |
  | - gap (no test, not built) | <n> |
  | Steps proven / steps in scope | <n> / <n> |
  **QA coverage: <covered>/<in scope> automated (<pct>%) · <n> manual · <n> gaps · <n> divergent**
  (Statically mapped; run verification executed via Step H commands in terminal)
  ## Action needed   (manual cases; failing cases; gaps with task ids; divergences, spec drift, suspects to decide)
  ## Pre-existing failures   (existing tests failing or not loading that no case maps to; every ENV and FILE blocker)
  ## 1. Input QA cases - <n>
  | # | TC ID | Test Case | Status | Steps proven / in scope | Assertion evidence |
    (Status e.g. "Covered by 3 passing tests (section 2)", "Manual (section 3)", "GAP - T0xx", "DIVERGENT - <why>", "OUT-OF-SCOPE"; evidence = quoted line, file:line, for COVERED)
  ## 2. Tests mapped to cases - <n>
  | # | TC ID | Test Case (QA) | File | Test name | Origin (existing / new) | Result |
  ## 3. Manual verification - <n>
  | TC ID | Test Case | Reason | Status |   (Status "NOT RUN" until a human fills it in)

STEP H - Final reply
1. Files created/modified with counts: cases (in/out of scope), FRs (derived, added), tasks touched, tasks added, tests added, production test identifiers (file:line).
2. "step rows -> cases" line, duplicates ignored, ids suffixed/qualified, generated ids; stack, command, checkout, test files used (shared and sibling-only listed separately).
3. Counts: COVERED / PARTIAL / FAILING / GAP / MANUAL / DIVERGENT / QA-SUSPECT / OUT-OF-SCOPE, and steps proven / in scope.
4. "Retrofit Findings" (also append to checklists/requirements.md):
   - DIVERGENCES: case id, expected, what spec/code does, who decides.
   - SPEC-DRIFT: requirement, file:line.
   - QA-SUSPECT; MISLABELLED; STALE-OR-WEAK / SCAFFOLD.
   - FAILING; PRE-EXISTING FAILURES; suites that cannot load, every blocker.
   - GAPS: case id, reason, task id; "needs seam" items.
   - ORPHAN legacy ids: count here, full list with file:line in specs/<feature>/orphans.txt; legacy references to other spec folders (file:line); the spec's own TC table and PASS statuses no test carries.
   - UNVERIFIED mappings; FRs derived/added; FRs with no task before retrofit and how handled.
5. Print the command block for the user to run in their own terminal (do NOT run them yourself):
   Run feature tests to verify suite green:
     <stack test command, e.g. npx jest <files> --watchAll=false>
   Run mechanical checker (exits 0 when all checks pass, 1 on any FAIL):
     node specs/RETROFIT-TEST/check-retrofit.js --spec specs/<feature> --tests <test-dir-or-file>[,<test-dir-or-file>]
6. Nothing else. Do not commit.
