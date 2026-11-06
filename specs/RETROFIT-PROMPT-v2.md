TASK: Convert an existing vanilla-speckit spec folder into a TEST-CASE-DRIVEN spec package.

The feature is already built. You will (1) map every QA case to proof in the existing tests,
(2) write new unit tests only where no existing test proves a case, and (3) add the traceability
files and a coverage report. You will NOT change production code.

INPUTS
- SPEC_FOLDER (convert in place): specs/<NNN-feature>
- QA_CASES (required, the acceptance contract): <path(s) to .xlsx / .csv / .json / .docx / .md / .txt, or pasted text>
    sheet(s) in scope: <name(s) or "all">
- BRD (optional): <path or N/A>

Infer everything else. Test files: read SPEC_FOLDER (tasks.md, plan.md, any traceability/checklist
file) for test file paths, confirm each exists on disk, then search the source tree for tests that
carry "Covers:" markers or "[TC-" in titles for this feature. Print the final list. No story id, Jira
id, Figma link or constitution is needed. Do not create stories.json, a ledger or a "Stories" table.

BEFORE ANY EDIT: create and switch to a branch named retrofit/<feature>-tdd. Do not commit.

GROUND RULES
1. Preserve, never rewrite. Keep all existing spec content: BR/TV/PERF/scenario ids, clarifications,
   owner decisions, open items, contracts, research, data-model, quickstart, release notes, checklists, test-first task structure, and
   completed task states ([X] stays [X]). Only add, or re-shape around what exists. Patch in place;
   no "-copy" or "-v2" files.
2. The QA cases are the contract. If a case contradicts a decision recorded in the spec (a timing
   target, a dialog shown or not, a WebView vs header-only screen), do NOT change the spec or the
   code and do NOT write a test that contradicts the code. Mark the case DIVERGENT and report it.
3. Never invent a case id, an expected result, or a mapping. If you cannot prove a link, mark it
   UNVERIFIED.
4. Never change production code. You may add tests, and edit existing tests only for markers and
   titles (Step C.4). Never weaken, delete or rewrite an existing assertion.
5. Do not add Red/Green/Refactor tasks, "Tags:" lines or "TESTS:" lines.
6. If this prompt is run on a folder that is already converted, update each section in place. Never
   append a second copy of any section, table row, task or phase.
9. Do the work yourself in this session. Do not start workflows, background jobs or sub-agents unless
   the user asks for them.
8. Work only from SPEC_FOLDER, QA_CASES, BRD and the source code. Never read, copy or reuse anything
   from any other folder under specs/, even if it looks identical to this one. Rebuild
   qa-cases.json from the QA source on every run, never from an existing JSON file.
7. The one allowed id change: FR ids are renamed to the flat form FR-NNN (Step E.0). Reason: review
   tools read an id like "FR-4.1-01" as "FR-4" and then cannot tell requirements apart. No other
   id (BR, TV, PERF, P-/N-/E- scenarios, T### tasks, QA ids) is renamed.

STEP A - Inventory (read only), then ask once
Start check: if the feature's test files already carry "Covers:" markers with QA ids from QA_CASES,
or SPEC_FOLDER already holds qa-cases.json, tasks with a "TC -> Task coverage" table, or a
coverage-report.md, say so in your ask-once message and ask whether to continue in place (update
sections, never duplicate) or stop. Do not continue silently.
Read the whole spec folder, the BRD if given, and the inferred test files. List: FRs, scenarios,
tasks, existing "Covers:" markers and "[TC-xxx]" titles, the project's test command (package.json)
and test conventions (runner, helper utilities, how neighbouring tests mock things). Find LEGACY ids:
TC ids cited in tasks/tests/specs that are not defined in QA_CASES. If something is unreadable or
ambiguous (which sheet is in scope, which column is the id), ask ONE message and wait. Otherwise
continue.

STEP B - Build qa-cases.json
1. Before writing, print: the detected header row, the column -> field mapping you will use, and the
   row count per sheet (rows with an id or a description). If the mapping is ambiguous, ask.
   Handle merged cells (carry the value down), multi-line cells (keep the line breaks in the JSON),
   hidden columns, and ids with stray whitespace or different letter case (trim; keep case).
2. Write specs/<feature>/qa-cases.json:

{
  "generated": "<YYYY-MM-DD>",
  "sources": ["<file> [sheet: <name>]"],
  "cases": [
    { "id": "<QA id as given; generate stable ids only if the source has none>",
      "desc": "<title/description, verbatim>",
      "expected": "<expected result, verbatim>",
      "scenario": "<scenario/group if present, else \"\">",
      "module": "<module if present, else \"\">",
      "category": "<category if present, else \"\">",
      "status": "<status if present, else \"Not Executed\">",
      "type": "<Positive | Negative | Edge | ... as given, else \"\">",
      "approach": "<filled in Step C.5>",
      "source": "<file [sheet]>" }
  ]
}

   These are the ONLY fields. Do not add any other field (no steps, data, priority, owner, expected
   result columns beyond "expected"). Extra source columns are not copied.

3. No row dropped, merged, reworded or reordered. Duplicate ids: keep the first, suffix the others
   "S2", "S3" and report them. Skip fully blank rows. Print "rows read -> cases written" and confirm the
   two numbers match the row count from step 1 (explain any difference).

STEP C - Prove every case (process 10-15 cases at a time; do not skim)
For each case, in qa-cases.json order:

1. Find candidate tests: grep the inferred test files for the behaviour, then READ the test bodies.
2. A test PROVES a case only if you can quote the assertion line(s) that check the case's expected
   result. Not the test name, not a nearby assertion, not "the test exercises the same screen".
   - If one test is claimed for several cases, each case needs its own quoted assertion line.
     Near-duplicate cases do not share proof unless each expected result is asserted.
   - If the test asserts only part of the expected result, quote what it asserts and state what is
     missing.
3. Classify:
   COVERED        every part of the expected result is asserted by a quoted line in a passing-capable test
   PARTIAL        some parts asserted, some not (state which)
   GAP            no test, or the behaviour is not built
   MANUAL         cannot be proven by a unit test (device, screen reader, real network, hardware,
                  device timing/memory, visual match on real devices)
   DIVERGENT      contradicts a recorded spec decision
   QA-SUSPECT     the QA case disagrees with BOTH the spec and the BRD (if given); map it, do not
                  count it as a gap, report it
   OUT-OF-SCOPE   not part of this feature, or its rules are still open (an open BRD item); nothing
                  to test yet
   How to split MANUAL, PARTIAL and blocked cases (apply the same way for every case):
   - MANUAL: the WHOLE case can only be checked by a person or device. Listed in manual-verification.json.
   - PARTIAL, remainder needs a person or device: the unit test proves part, a person must check the
     rest. Class PARTIAL. Listed in manual-verification.json.
   - PARTIAL, remainder is blocked by another module that does not exist in this repo: class PARTIAL.
     NOT listed in manual-verification.json; it gets an unchecked Retrofit Gaps task.
   - Decide per case from what the unproven part needs, not from how similar cases were treated.
4. Markers. Each test that proves a case carries, on the line directly above it, EXACTLY this form:
     // Covers: <QA-ID>[, <QA-ID>] - <short note>
   - Separator before the note is a plain hyphen with a space on each side (" - "). Never an em dash,
     en dash or colon.
   - Do not invent any other marker type (no "Supports:", "Related:", "Verifies:" and the like). A
     test that proves no QA case gets no marker.
   - FR / scenario ids may appear in the note text, never in the id list.
   - If a test title uses "[TC-xxx]", change that to "[<QA-ID>]". Legacy ids that map to a QA case are
     replaced. Legacy ids with NO matching QA case are ORPHANS: report them, do not put them in
     qa-cases.json.
   - Edit only these comments and titles in existing tests.
5. Write each case's "approach" in qa-cases.json: a leading verdict plus the reason. The verdict word
   MUST match the class from step 3:
     COVERED / PARTIAL-testable part  "unit-testable - <what the test asserts>"
     MANUAL                           "manual - <why a unit test cannot prove it>"
     PARTIAL with a human remainder   "unit-testable - partial: <what is asserted>; manual remainder: <what a person checks>"
     PARTIAL blocked by a module      "unit-testable - partial: <what is asserted>; blocked: <module>"
     FAILING                          "unit-testable - failing: <what the test asserts and why it fails>"
     DIVERGENT                        "unit-testable - divergent: <reason>"
     QA-SUSPECT                       "unit-testable - qa-suspect: <reason>"
     OUT-OF-SCOPE                     "out-of-scope - <reason>"
   Never write "manual - ..." for a case whose class is not MANUAL, and never write "out-of-scope - ..."
   for a case you classified otherwise.
6. For every GAP and PARTIAL case that is unit-testable, WRITE THE NEW TEST (Step D). Do not write
   tests for MANUAL, DIVERGENT, QA-SUSPECT or OUT-OF-SCOPE cases.

STEP D - Write new tests (only for unit-testable GAP / PARTIAL cases)
- Place the test in the existing test file for that unit if one exists (match its imports, helpers,
  mocks, setup and style from Step A); otherwise create a new test file next to the code it covers,
  named like its neighbours.
- One test per case minimum. The assertions must check the case's expected result exactly: exact
  strings, counts, order, call arguments, navigation targets, analytics payloads, states. Cover the
  boundary or negative value the case names. No snapshot-only tests, no assertion-free tests, no
  "expect(true)", no assertions on mocks you set up to return the answer.
- Mock only external boundaries (network, native modules, timers, navigation, storage) the way the
  project's plan.md "Dependency / Mock Strategy" or neighbouring tests do. Do not mock the unit under test.
- Title: "[<QA-ID>] <behavioural description>". Marker on the line above, in the exact Step C.4 form:
    // Covers: <QA-ID> - <short note>
- Never modify production code to make a test pass. If a new test fails, re-check your test once
  (wrong selector, missing await, wrong mock). If it still fails, the code does not meet the case:
  keep the test, mark the case FAILING (code defect), report it with the failing assertion and error.
  Do not delete it, skip it, or loosen it.
- Record every new test in Step E as a task.

STEP E - Add the missing files and re-shape the existing ones
0. FR id normalisation (do this first, mechanically, before anything else in Step E)
   - Collect every functional requirement id defined in spec.md in order of appearance (ids like
     FR-4.1-01, FR-4.5-03, FR-7.4-02, or any FR id that is not already a flat FR-NNN). Assign
     FR-001, FR-002, ... in that order (3 digits; more if there are over 999). Same id = same number
     everywhere.
   - Replace the old id with the new id in EVERY file in the spec folder (spec.md, plan.md, tasks.md,
     checklists, contracts, research, data-model, quickstart, release notes, traceability), and in
     comment text of the feature's test files (notes after the " - " in "// Covers:" lines and other
     comments only; never code). Replace longest ids first so one id is never half-replaced.
   - Wildcard and range references that name no single requirement (for example "FR-4.1-xx",
     "FR-4.1 to FR-4.9", a bare "FR-7.4" or "FR-4" meaning a BRD section) are rewritten as the BRD area
     in words ("BRD area 4.1", "BRD 7.4") or as an explicit range of new ids ("FR-001 to FR-009").
     After this step no text in the folder may match FR-<digit>.<digit> or a bare FR-<digit> that is
     not a full FR-NNN.
   - Keep the old numbering searchable: in spec.md, right under "### Test-case -> FR traceability"
     add a table  | FR | Former id | BRD area |  with one row per requirement. Write the former id
     WITHOUT the "FR-" prefix, for example | FR-014 | 4.5-03 | 4.5 |, plus the line "Former ids are
     written without the FR- prefix so they are never read as requirement ids." No text anywhere in the
     folder, this table included, may contain "FR-" followed by a digit and a dot.
   - BR, TV, PERF, P-/N-/E- scenario ids, T### ids and QA ids are NOT renamed.
   - The renamed folder must still read correctly: re-read three renamed requirements and their tasks
     and confirm they still refer to the same requirement.
1. spec.md
   - Add "**Input**: <QA file, sheet, BRD if any>" and "**Version**: <keep existing, else 1.0.0>" lines.
   - Every QA case must map to at least one FR. If none fits, check the BRD (if given). Only if still
     none, add a NEW FR at the end of its section, marked "[added by retrofit - needs review]", and
     report it. Never change the meaning of an existing FR.
   - Add "### Test-case -> FR traceability" before Key Entities, one row per FR, derived from the
     TC -> Task table below (TC -> task -> that task's Maps FR):
       | FR | QA cases |
       |---|---|
       | FR-x | `CASE_1`, `CASE_2` |
     FRs with no case: "none", plus under the table: "Any FR shown as `none` is a non-functional or
     process requirement verified through its tasks and manual checks, not a QA case."
   - Add: "The authoritative per-case table is `## TC -> Task coverage` in `tasks.md`."
   - Update any success criterion that counts tests with the real numbers.
2. tasks.md
   - Keep every existing task, its text, its checkbox and its test-first ordering.
   - EVERY task line gets both fields appended, with no exceptions, including process, polish and
     checklist tasks (run typecheck, run the suite, re-run a checklist, build a table):
       **Maps**: FR-..., FR-... · **Accept**: <plain-language condition for "done">
     "**Maps**:" must list at least one FR-NNN on every task. Never write "none". A process or
     polish task (typecheck, lint, run the suite, re-run a checklist, build a table, fix-if-failing)
     maps to the FR(s) whose files or behaviour it checks or guards: the FRs of the task(s) it
     depends on or verifies. A task covering the whole feature maps to the FRs of its phase. A task
     with only one of the two fields, or with no FR-NNN in Maps, is incomplete.
   - Add near the top if absent: "**Input**: specs/<feature>/ (spec.md, plan.md, qa-cases.json,
     manual-verification.json)", and an Environment Gate with
     "- [ ] T-ENV-001: Run <the project's real test command> - existing suite green."
     Do not add any statement about when tests are written; keep the folder's own structure.
   - New tests from Step D go in a final phase "Retrofit Tests", continuing the T### numbers, each
     with Maps and Accept, checked [X] only if the test was written and passed in Step G.
   - GAP cases that are not unit-testable or whose behaviour is not built get unchecked tasks in a
     "Retrofit Gaps" phase with Maps and Accept. Do not implement them.
   - Every FR must be named in the Maps of at least one task. For an FR that no task covers (for
     example an open BRD item that was never built), add an unchecked task in "Retrofit Gaps":
     "Open item <FR-NNN>: <requirement in a few words>; not built, awaiting <the open item id>",
     with **Maps**: <FR-NNN> and an **Accept**: line saying what "done" will mean once decided.
   - Append the mandatory table at the very end:

       ## TC -> Task coverage

       Counts: <total> QA cases = <n> covered + <n> partial + <n> manual + <n> gap + <n> divergent + <n> qa-suspect + <n> out-of-scope (the parts must add up to the total).

       | TC (id + short description) | Task(s) | Test approach |
       |---|---|---|
       | <ID> - <description>. | T0xx, T0yy | unit-testable - <what the test asserts> |

     One row per case, in qa-cases.json order, none omitted. Task(s) lists BOTH the task that writes
     the test (test task first) and the task that builds the behaviour. In table cells escape "|" as
     "\|" and replace line breaks with a space (keep originals in the JSON). "Test approach" is your
     reasoned verdict with the reason.
3. plan.md - if absent add "## Requirement -> File allocation" (| FR | Files |) and
   "## Dependency / Mock Strategy", built from what the code and tests actually do. Leave the rest.
4. manual-verification.json - REQUIRED when at least one case is manual or has a part that only a
   human can check. Flat object keyed by QA id:
     { "<QA-ID>": "manual - <reason a human must check>" }
   The keys are EXACTLY: every case whose approach starts "manual", plus every PARTIAL case whose
   approach says "manual remainder". For a PARTIAL case start the reason with
   "manual (remaining part) - ". Never list OUT-OF-SCOPE, DIVERGENT, FAILING, or PARTIAL-blocked cases. Seed it from the folder's manual-check /
   quickstart documents; add the QA ids to their rows. Omit the file only if no case needs a human.
5. checklists/requirements.md - keep; append items: all cases mapped; no orphan ids; every COVERED
   case has quoted assertion evidence; manual file present; divergences and qa-suspects reviewed.
6. Traceability document (if the folder has one) - keep; add "QA case -> FR -> task -> test file".

STEP F - Self-check (print results; fix failures; then continue)
- Every case in qa-cases.json appears exactly once in the TC -> Task table with a real task id.
- Counts line parts add up to the total and match the table and spec.md.
- Every FR has at least one case, or "none" with the standard note.
- FR ids are flat: grep the whole spec folder and the feature's test files for "FR-[0-9]+\.[0-9]" and
  for any bare "FR-[0-9]" that is not a 3-digit FR-NNN; there must be no match. Every FR-NNN used in
  tasks.md, plan.md or the traceability tables is defined in spec.md, and every row of the former-id
  table maps to exactly one FR-NNN.
- Every FR-NNN defined in spec.md appears in the Maps line of at least one task. An FR with no task
  gets an "Open item" task as described in Step E.2 (and is still listed in Retrofit Findings).
- Every task line in tasks.md contains "**Accept**:" and a "**Maps**:" that holds at least one FR-NNN
  (list any that do not and fix them; the word "none" is never allowed in Maps).
- No FR-NNN appears in tasks.md or plan.md unless it is defined in spec.md, and the text "FR-" followed
  by a digit and a dot appears nowhere in the folder.
- Case -> FR -> task chain: for every case, at least one of its tasks (in the TC -> Task table) has,
  in its Maps line, at least one of the FRs the case is listed under in the Test-case -> FR table. If
  not, add that FR to the Maps of the task that really verifies the case (only if true); otherwise
  report it as UNVERIFIED. List the cases you checked and the result.
- Every "Covers:" marker in EVERY test file you used or edited (the full Step A list, including files
  outside the feature folder such as __tests__/App.test.tsx) matches exactly
    // Covers: <ID>[, <ID>] - <note>
  (plain hyphen, ids only in the id list). Grep for "Covers:" lines that use another separator and for
  any other marker keyword (e.g. "Supports:"); there must be none.
- No orphan ids: every id in a "// Covers:" marker or "[...]" title exists in qa-cases.json.
- Every COVERED case has a quoted assertion line; every unit-testable case has at least one test
  carrying its id.
- manual-verification.json keys = every case whose approach starts "manual" + every PARTIAL case whose
  approach says "manual remainder"; nothing else. Check both directions by listing the keys next to
  the approach column.
- Class and approach agree for all cases: count approaches that start "manual", "out-of-scope" and
  "unit-testable"; the manual and out-of-scope counts equal the Counts line.
- qa-cases.json cases have exactly the schema fields and no others.
- No production file changed; existing test files changed only in markers/titles plus added tests
  (show `git diff --stat` and `git diff` for existing test files, markers/titles only).

STEP G - Run and write the coverage report
Run only the test files from Step A plus any you created, with the project's runner, e.g.
  npx jest <files> --watchAll=false --coverage=false --json --outputFile=<temp file>
Timeout 5 minutes. Do not re-run silently to get a different result. If a test fails, report its name
and error; the case is "mapped, failing", not covered. If the run cannot finish, say so and use
"not run" in the Result column. Never fabricate results. A case is covered only if every test mapped
to it passed. Fix a failing NEW test only if the failure is a defect in the test itself (max 2
attempts); never touch production code.

Write specs/<feature>/coverage-report.md:

  # <feature> - Test Coverage Report
  Specs: `<feature>`  |  Date: <date>
  ## Summary
  | Metric | Value |
  | Test suites run | <n> |
  | Tests run | <n> (<n> pass, <n> fail) |
  | New tests added by retrofit | <n> |
  | QA cases (acceptance contract) | <n> (from specs/<feature>/qa-cases.json) |
  | - covered, passing, assertion quoted | <n> |
  | - partial | <n> |
  | - mapped but failing (code defect) | <n> |
  | - manual (need a human) | <n> |
  | - divergent from spec | <n> |
  | - qa-suspect | <n> |
  | - gap (no test, not built) | <n> |
  | - out of scope | <n> |
  **QA coverage: <covered>/<total in scope> automated (<pct>%) · <n> manual · <n> gaps · <n> divergent**
  ## Action needed   (manual cases to verify; failing cases; gaps with task ids; divergences/suspects to decide)
  ## 1. Input QA cases - <n>
  | # | TC ID | Test Case | Status | Assertion evidence |
    (Status e.g. "Covered by 3 passing tests (section 2)", "Manual (section 3)", "GAP - T0xx",
     "DIVERGENT - <why>"; Assertion evidence = the quoted assertion line, file:line, for COVERED)
  ## 2. Tests mapped to cases - <n>
  | # | TC ID | Test Case (QA) | File | Test name | Origin (existing / new) | Result |
  ## 3. Manual verification - <n>
  | TC ID | Test Case | Reason | Status |   (Status "NOT RUN" until a human fills it in)

STEP H - Final reply
1. Files created / modified, with counts: cases, FRs, tasks touched, tasks added, tests added.
2. The "rows read -> cases written" line, duplicate-id notes, and the test files used.
3. Counts: COVERED / PARTIAL / FAILING / GAP / MANUAL / DIVERGENT / QA-SUSPECT / OUT-OF-SCOPE.
4. "Retrofit Findings" (also append it to checklists/requirements.md):
   - DIVERGENCES: case id, what the case expects, what spec/code does, who must decide.
   - QA-SUSPECT cases.
   - FAILING cases: test, assertion, error, likely defect.
   - GAPS: case id, reason, task id.
   - ORPHAN legacy ids and how each was handled.
   - UNVERIFIED mappings.
   - FRs added by retrofit.
   - FRs with no task.
5. Nothing else. Do not commit.
