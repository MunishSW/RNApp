# Test harness for the Retrofit prompt (v3.2)

Use this in a NEW session. Part 1 is the prompt to paste. Parts 2 to 6 are what the tester agent reads:
scenarios, fixtures, checks, determinism rules, report format. Files that go with it:

- The prompt under test: `specs/RETROFIT-PROMPT-v3.2.md`
- The mechanical checker: `specs/RETROFIT-TEST/check-retrofit.js` (usage in Part 4)
- The helper scripts: `specs/tools/prep-qa.js`, `specs/tools/flatten-frs.js`, `specs/tools/assemble-retrofit.js`

---

## PART 1 - Paste this into the new session

```text
You are a QA engineer testing a prompt, not using it. The prompt under test is
specs/RETROFIT-PROMPT-v3.2.md (the "retrofit prompt"): it converts a vanilla-speckit spec folder into a
test-case-driven package (qa-cases.json, TC -> Task table, manual-verification.json, coverage report,
markers in tests, new tests where proof is missing). The harness with scenarios, fixtures and checks is
specs/RETROFIT-TEST/RETROFIT-PROMPT-TEST-HARNESS.md. Read both files in full first.

YOUR JOB
1. For each scenario in the harness Part 2 that I select (default: all P0 scenarios, then P1), build the
   fixture from the recipe in Part 3, run the retrofit prompt on it, and judge the result against the
   scenario's EXPECTED behaviour and CHECKS.
2. Run the mechanical checker (Part 4) on every output; do not trust the agent that ran the prompt.
3. Do the manual judge checks of Part 4.2 on a sample.
4. Report in the format of Part 6. Quote evidence (file:line, command output). Do not fix the prompt
   unless I ask; propose wording for every defect.

HOW TO RUN A SCENARIO
- Use a fresh sub-agent per scenario (so it has no memory of the others) and give it ONLY: the prompt file
  path, the scenario's inputs (SPEC_FOLDER, QA_CASES, QA_SCOPE, BRD) and the run mode. Never give it the
  expected results.
- Run mode REAL: work in an isolated git worktree of the project at a clean commit (git worktree add
  --detach <dir> <commit>; link node_modules into it). The agent may edit inside that worktree only.
- Run mode DRY: the agent may not edit anything in the real repos; it writes outputs to a sandbox folder
  and test edits as diffs. Use DRY for any real project you do not own or cannot isolate.
- Tell the sub-agent: it cannot ask the user questions; where the prompt says STOP AND ASK it must stop
  as the prompt says.
- Do not let two scenarios write to the same folder. Keep every fixture under a scratch folder.
- Record wall time and whether the agent finished without being cut off. Rerun a cut-off one.

SAFETY
- Never run scenarios against a production branch. Never commit. Delete worktrees and scratch folders
  when done.
```

---

## PART 2 - Scenarios

Priority: **P0** = a failure blocks release of the prompt/skill. **P1** = fix before wide use. **P2** = nice to know.
"Base" below means a clean, matching spec + QA pair that passes the prompt (your own known-good case).

| ID | Pri | Scenario | Run mode | Expected behaviour (what the agent MUST do) | Checks |
|---|---|---|---|---|---|
| S01 | P0 | **Regression on a clean spec.** Base spec, matching QA sheet, tests with old markers. | REAL | Completes. No STOP. All classes assigned; new tests only for GAP/PARTIAL; no production file changed. | CK-ALL, J1-J5 |
| S02 | P0 | **Wrong QA file.** Base spec + QA of a different feature. | DRY | STOP AND ASK in A.4: relevance table, 0% (or < 20%) in scope, nothing written anywhere. | W1, W2 |
| S03 | P0 | **Wide sheet, no QA_SCOPE.** QA has 2-6 modules, 20-40% belong to the spec. | DRY | Passes the gate, report starts with SUSPECT INPUT if > 50% out of scope; out-of-scope rows `n/a`, exempt from FR/task rules. | CK-ALL, W3 |
| S04 | P0 | **Wide sheet below 20% in scope, no QA_SCOPE.** | DRY | STOP AND ASK; table shows best-overlap modules; no files written. | W1, W2 |
| S05 | P0 | **Same as S04 but QA_SCOPE given** (ids or modules). | DRY | Continues on the scoped cases; banner "CONFIRMED SCOPE", not SUSPECT INPUT. | CK-ALL, W4 |
| S06 | P0 | **Spec with no FR ids.** | DRY or REAL | Derives FR-NNN under "Derived Requirements", each cited and marked; report says "N FRs derived" and calls the chain check a consistency check. | CK-ALL, F1-F3 |
| S07 | P0 | **Step-per-row QA workbook** (id only on first row, step rows blank, repeated ids across sheets, one same-sheet clash, an id-less case-start row, stray legend cells, a serial-number column). | DRY | step rows R -> cases C line; steps appended as "Step N:"; clash suffixed S2; identical repeat ignored; cross-sheet ids qualified "<sheet> / <id>"; id-less start row gets a generated id; legend cells ignored; serial number never an id. | CK-ALL, Q1-Q7 |
| S08 | P0 | **Suite cannot load.** Break the feature test file (unclosed block) and/or remove a declared dependency. | DRY or REAL | A.6 records every blocker (ENV vs FILE), repairs nothing, T-ENV-001 unchecked and names them, coverage line "N statically mapped / 0 verified", no [X] ticks, new tests go to a new file. | CK-ALL, L1-L5 |
| S09 | P0 | **No code changes.** Spec says X, code does not (drift); a new test needs a selector that exists / does not exist. | REAL | SPEC-DRIFT reported with file:line, Open-item task, no test asserting unbuilt behaviour; production diff is empty or only test identifiers listed with file:line. | CK-ALL, N1-N3 |
| S10 | P0 | **Already-converted folder.** Run the prompt twice on the same folder. | REAL | Second run: A.3 STOP AND ASK (continue in place or stop); if told to continue, sections are updated in place, no duplicate heading/table/task/phase. | R1-R4 |
| S11 | P1 | **Flat FR ids with gaps** (001, 002, 010, 011, 020). | DRY | Flat ids kept, "unchanged" in former-id column, new FRs max+1, renaming skipped and said so. | CK-ALL, F4 |
| S12 | P1 | **Non-flat and odd FR ids:** FR-4.1-01 style, FR-VD-001, the literal placeholder "FR-NNN", the same id defined twice with different text, ranges ("FR-4.2-06 to FR-4.2-10"). | DRY | Numbering by order of definition; duplicate definition renumbered and reported; placeholder untouched; ranges become explicit lists; no dotted/lettered ids remain outside the former-id table. | CK-ALL, F5-F8 |
| S13 | P1 | **Two id families** (FR- and AC-). | DRY | AC ids inventoried; "| AC | FR |" table; ACs without FR UNVERIFIED; Maps use FR only. | CK-ALL, F9 |
| S14 | P1 | **Spec has its own TC table** (TC-001..) with PASS statuses nobody tests, and tests tagged `[TC-001]`, `[TC001]`, `[BRD TC-N006]`. | DRY or REAL | Own table kept and labelled "spec-derived TCs (not QA ids)"; legacy tags rewritten only on a proven single QA match, else left and listed; unverified PASS statuses reported; A.3 does not stop on it. | CK-ALL, G1-G4 |
| S15 | P1 | **Missing tasks.md / plan.md / checklists** (spec only). | DRY | tasks.md synthesized (Environment Gate, one ticked-if-built task per FR group, Retrofit phases) and says so; plan.md and requirements.md created. | CK-ALL, M2-M3 |
| S16 | P1 | **Existing task formats:** `### [x] T1` blocks, Maps already holding "UI Contract" / "—" / "FR-001-FR-010" / nonexistent task ids, a "TC → Task coverage" table of another shape. | DRY | Maps/Accept merged in place with "(was: ...)", ranges expanded, old table retitled "Legacy test-approach rows", exactly one new "## TC -> Task coverage" heading. | CK-ALL, M4-M6 |
| S17 | P1 | **md and csv QA sources**, md with `## CM_01 - title` headings, csv with no expected column; and the same cases in xlsx + md + csv together. | DRY | "sheet" = heading / Tab column; richest source used, others only in `sources`; status disagreements reported; no expected column -> expected "" with warning and no COVERED for those cases. | CK-ALL, Q8-Q10 |
| S18 | P1 | **Weak existing tests:** a scaffold file (`expect(tree).toBeTruthy()`), assertions on constants the test defines or on mocks it configured, a test with no assertion, a source-text grep, a title that carries a QA id but tests something else. | DRY | None of these counted as proof; STALE-OR-WEAK / SCAFFOLD / MISLABELLED reported; those cases PARTIAL or GAP with a new test where testable. | CK-ALL, P1-P4 |
| S19 | P1 | **Divergence.** QA expects X; spec records not-X; and QA-suspect (title vs steps inconsistent), BRD N/A. | DRY | DIVERGENT / QA-SUSPECT classes with reasons; no spec/code change; no test written for them; the existing test that asserts the spec may carry the id with "divergent, not claimed as covered". | CK-ALL, D1-D3 |
| S20 | P1 | **Two checkouts** of the project containing the same spec (differing source), one with a runnable suite. | DRY | A.1 picks per rule (user's choice, else the one whose baseline loads), says why, lists differences, tests found only in the other are "sibling-only" and not edited. | CK-ALL, X1-X2 |
| S21 | P1 | **Shared test file owned by another spec** carrying `// Covers:` for the same QA ids. | REAL | A.3 does not stop on it; the file is listed "shared, owned by another spec", not used as proof, not edited except FR-id renames in comments. | CK-ALL, X3 |
| S22 | P1 | **Case needing a person/device** (screen reader, timing, memory, gesture, CMS copy). | DRY | MANUAL or PARTIAL with manual remainder; correct keys in manual-verification.json; PARTIAL blocked-by-module NOT listed there. | CK-ALL, M7 |
| S23 | P1 | **Other stacks.** Flutter, Angular (Jest and Karma), native Android, native iOS. | DRY (desk) if no project | A.1 detects the stack; markers use `// Covers:` and title tags only where the language allows; run command per stack; iOS no runtime mocking -> "needs seam" gap; native-only categories -> MANUAL. | ST1-ST6 |
| S24 | P2 | **Encoding and line endings:** CRLF files, mojibake, curly quotes, a trailing-space module value. | REAL | Line endings and encoding preserved byte for byte; mojibake reported, not fixed; trimmed fields in JSON; no whole-file diff from EOL change. | E1-E3 |
| S25 | P2 | **Scale:** 200+ cases. | DRY | Works in groups of 10-15; in-scope proof only; out-of-scope as one line; finishes. | CK-ALL, T-time |
| S26 | P0 | **Determinism.** Run S01 (or S06/S07) twice from scratch. | any | Mechanical outputs identical; class counts within tolerance (Part 5). | DT1-DT3 |

---

## PART 3 - Fixture recipes

Create all fixtures under a scratch folder. Always start from a clean base copy.

### 3.1 QA fixtures (Python + openpyxl; `pip install openpyxl`)

```python
import openpyxl, copy, random

def load(p): return openpyxl.load_workbook(p)

# W: wrong file: use a QA workbook that belongs to another feature (no edit needed).

# Wide sheet: append rows of another module to the base sheet
def widen(base, other, out, take=40):
    wb = load(base); ws = wb.active
    wo = load(other).active
    for r in list(wo.iter_rows(min_row=2, values_only=True))[:take]:
        ws.append(list(r))
    wb.save(out)

# Step-per-row: explode each case's expected result into step rows
# columns assumed: id, name, step, expected (adapt to your sheet)
def to_step_rows(base, out, id_col, name_col, exp_col):
    wb = load(base); ws = wb.active
    hdr = [c.value for c in ws[1]]
    i_id, i_nm, i_ex = hdr.index(id_col), hdr.index(name_col), hdr.index(exp_col)
    rows = list(ws.iter_rows(min_row=2, values_only=True))
    ws.delete_rows(2, ws.max_row)
    ws.cell(1, len(hdr) + 1, 'Step No')
    for r in rows:
        parts = [p for p in str(r[i_ex] or '').replace('. ', '.\n').split('\n') if p.strip()] or ['']
        for n, p in enumerate(parts, 1):
            row = list(r) + [f'Step {n}']
            if n > 1: row[i_id] = None; row[i_nm] = None
            row[i_ex] = p
            ws.append(row)
    wb.save(out)

# Repeated id, same content (must be IGNORED) and repeated id, different content (must be SUFFIXED S2)
def add_duplicates(base, out, id_col):
    wb = load(base); ws = wb.active
    hdr = [c.value for c in ws[1]]; i = hdr.index(id_col)
    rows = list(ws.iter_rows(min_row=2, values_only=True))
    ws.append(list(rows[0]))                       # identical repeat
    clash = list(rows[1]); clash[hdr.index('Test Case Description')] = 'A different case with the same id'
    ws.append(clash)
    wb.save(out)

# Same ids on a second sheet (cross-sheet repeat): copy the sheet
def second_sheet(base, out, name='Sheet B'):
    wb = load(base); ws = wb.active
    c = wb.copy_worksheet(ws); c.title = name
    wb.save(out)

# Id-less case start row, stray legend cell, serial-number column, trailing spaces
def messy(base, out, desc_col='Test Case Description', id_col='Test Case ID'):
    wb = load(base); ws = wb.active
    hdr = [c.value for c in ws[1]]
    ws.insert_cols(1); ws.cell(1, 1, 'S No')
    for r in range(2, ws.max_row + 1): ws.cell(r, 1, r - 1)       # serial numbers
    ws.cell(5, 1 + hdr.index(id_col) + 1).value = None              # id-less case start: name stays filled
    ws.cell(2, ws.max_column + 2, 'Pass / Fail / On Hold')          # stray legend outside the header
    ws.cell(3, 1 + hdr.index(desc_col) + 1).value = str(ws.cell(3, 1 + hdr.index(desc_col) + 1).value) + '   '
    wb.save(out)

# No expected column
def drop_col(base, out, name):
    wb = load(base); ws = wb.active
    hdr = [c.value for c in ws[1]]; ws.delete_cols(hdr.index(name) + 1); wb.save(out)
```

Markdown and CSV variants: write each case as `## <id> - <name>` plus a `| Step | Expected Result |` table (md), or `Tab,TC ID,Test Case Name,Steps,QA Status` (csv, no expected column). Make a file set that holds the SAME cases as the xlsx for S17.

### 3.2 Spec mutations (work on a COPY of the base spec folder)

| Mutation | How |
|---|---|
| No FR ids (S06) | `sed -E 's/\*\*FR-[0-9.A-Za-z-]+\*\*//; s/FR-[0-9.A-Za-z-]+//g'` on spec.md, plan.md, tasks.md |
| Flat ids with gaps (S11) | renumber FR-001..FR-009 to 001, 002, 010, 011, 020, 021, 030... |
| Odd ids (S12) | rename two FRs to `FR-VD-001`, `FR-VD-002`; paste the text `FR-NNN` into a template line; define one id twice with different text; add a range line "FR-4.2-06 to FR-4.2-10" |
| AC family (S13) | add 10 lines `AC-001 ...` under the requirements, not referenced anywhere else |
| Spec's own TC table (S14) | append `## Test Cases` with rows `TC-001 ... Status PASS` tied to FR ids; tag 3 existing tests `[TC-001]`, `[TC001]`, `[BRD TC-N006]` |
| Missing files (S15) | delete tasks.md, plan.md, checklists/ |
| Old task shapes (S16) | rewrite tasks as `### [x] T1 - title` blocks with `**Maps**: UI Contract`, `**Maps**: -`, `**Maps**: FR-001-FR-010`, separate `**Accept**:` lines; add a 3-row `## TC → Task coverage` table with the Unicode arrow |
| Truncated spec (A.5) | cut the last line of spec.md mid-sentence; duplicate one section heading |
| Garbled requirement | insert `MUST call X - wait, it does NOT call X` into one FR |
| Drift (S09) | change the spec to require behaviour the code does not have (for example a 2000 ms timer) |

### 3.3 Test-file mutations (REAL mode, in the worktree)

| Mutation | How |
|---|---|
| Unclosed block (S08) | append `describe('x', () => {` with no closing to the feature test file |
| Missing dependency (S08) | make a mocked/declared module unresolvable (rename it in `node_modules` of the worktree copy only, or add an import of a nonexistent module to a setup mock) |
| Scaffold (S18) | a file of `it('[TC-001] renders', () => { expect(tree).toBeTruthy(); })` |
| Mock-only / constant-only / no assertion / source grep (S18) | write one of each, titled with a real QA id |
| Mislabelled tag (S18) | title `[<REAL QA ID>]` on a test that checks something else |
| Shared marker file (S21) | copy a shared test file that already carries `// Covers: <same QA ids> — note` (em dash) |
| CRLF (S24) | `unix2dos` or `sed -i 's/$/\r/'` on the spec folder and test files; add a mojibake string |

### 3.4 Other stacks (S23)

If a sample project exists for a stack, use it. Otherwise run the harness DESK mode: give the sub-agent
only a directory listing and the manifest (pubspec.yaml / angular.json + package.json / build.gradle.kts /
Package.swift) and ask it to emit what Step A.1, Step C.4, Step D and Step G.1 of the prompt would produce:
detected stack, test file path convention, marker syntax, a sample new test skeleton, the run command, and
which cases it would class MANUAL for native-only behaviour. Judge against ST1-ST6.

---

## PART 4 - Checks

### 4.1 Mechanical checker (run on every output)

```bash
# 1. Run feature tests (affected test files only):
npx jest <affected-test-files> --watchAll=false

# 2. Generate / refresh coverage report and traceability:
node specs/tools/assemble-retrofit.js --spec <spec-folder> --tests <feature-test-dir-or-files>

# 3. Run mechanical checker:
node specs/RETROFIT-TEST/check-retrofit.js --spec <spec-folder> --tests <feature-test-dir-or-files>
```

It re-derives the prompt's own Step F checks from the files: qa-cases.json schema and unique ids; approach
verdict words; one "## TC -> Task coverage" heading; table rows equal cases in the same order; Counts line
adds up and agrees with the approaches (manual, out-of-scope); out-of-scope rows read n/a; every task has
Accept and an explicit FR-NNN in Maps (no range, no "none"); every FR defined in spec.md is in some Maps; no
dotted or lettered FR ids; manual-verification.json keys equal the manual approaches in both directions;
`// Covers:` markers match the exact form, no foreign keywords, no orphan ids; coverage-report.md has its
sections and the right case total. Exit code 1 on any FAIL. Pass the dirs of the feature's own tests; shared
test files owned by another spec are expected to appear only as warnings. Add your own scratch tests to
verify the checker itself before trusting it (see Part 5, DT0).

Also run the independent verifier if the project has one (for example `tdd-verify --spec-audit <copy of
spec folder>`). Spec-audit rules should all be met.

CK-ALL = every checker line PASS (K3 is a warning, review it).

### 4.2 Manual judge checks (sample, do not skip)

| ID | Check | How |
|---|---|---|
| J1 | **Proof is real.** Pick 5 COVERED cases at random. For each, open the quoted assertion line in coverage-report.md: does that line exist at file:line, and does it assert the case's expected result (not a mock, constant or truthy)? | open the file |
| J2 | **No code changed.** `git diff` limited to the feature: every changed production line is a test identifier; every changed test line is a marker, a legacy-tag rewrite, an import for an added test, or inside an added test. | `git diff -- <paths>` |
| J3 | **New tests are honest.** Read 3 new tests: exact expected values, no snapshot-only, no assertion-free, mocks only at boundaries. Temporarily break the production behaviour in the worktree and confirm the new test fails (revert after). | mutate, run, revert |
| J4 | **Classes are defensible.** Read 5 PARTIAL/MANUAL/DIVERGENT cases: is the remainder really human-only / blocked / contradicting? | read case + reason |
| J5 | **Nothing was invented.** Sample 3 derived or added FRs: each cites a real spec sentence. Sample 3 generated ids: each has a real source row. | compare to source |
| W1 | **STOP means stop.** After a STOP AND ASK, no file in the spec folder, tests or sandbox changed. | `git status`, folder diff |
| W2 | The stop message has: relevance table, in-scope count and %, candidate sheets/modules, the A.1 stack, the A.2 test list, the question. | read |
| W3 | Report line 1 is "SUSPECT INPUT: n%" when > 50% out of scope and scope not confirmed. | read |
| W4 | With QA_SCOPE the banner reads "CONFIRMED SCOPE" and the 20% rule was computed after scoping. | read |
| F1-F3 | Derived FRs live under "## Derived Requirements", each cited, marked "[derived by retrofit - needs review]"; report says "N FRs derived"; the chain is called a consistency check. | read |
| F4-F9 | Flat ids unchanged and "unchanged" in the former-id column; numbering by definition; duplicate definition renumbered and reported; placeholder untouched; ranges expanded; AC table present. | read spec.md, former-id table |
| Q1-Q7 | "step rows R -> cases C" printed; step lines "Step N:" including one-row cases; identical repeat ignored (listed); clash suffixed S2 with both rows in `source`; cross-sheet ids qualified even if one sheet read; id-less start row got "<sheet code>-R<row>"; legend cells and serial numbers not used. | compare qa-cases.json with fixture |
| Q8-Q10 | md/csv: id from heading / Tab; richest source chosen, others in `sources`; status disagreement reported; empty expected -> "" + warning + no COVERED. | read |
| L1-L5 | Every blocker recorded and classed ENV or FILE; nothing repaired; T-ENV-001 unchecked with all blockers; coverage line "N statically mapped / 0 verified", no percentage; new tests in a new file; Retrofit Tests unticked. | read tasks.md, report |
| N1-N3 | SPEC-DRIFT lists file:line; Open-item task exists; no test asserts unbuilt behaviour; any production edit is a listed test identifier. | grep, diff |
| R1-R4 | Second run asks first; in-place update; no second copy of any heading/table row/task/phase; counts unchanged on an unchanged input. | diff run1 vs run2 |
| G1-G4 | Own TC table untouched and labelled; PASS statuses with no test reported; legacy tags: rewritten only on proven unique match, otherwise left + listed; A.3 did not stop. | read |
| M2-M7 | Created files say "synthesized"; Maps/Accept merged in place with "(was: ...)"; legacy table retitled; exactly one new TC heading; manual keys correct; blocked partials not in the JSON. | read |
| P1-P4 | Weak tests listed STALE-OR-WEAK / SCAFFOLD / MISLABELLED and not used as proof; affected cases PARTIAL/GAP. | read findings |
| D1-D3 | DIVERGENT/QA-SUSPECT correct; no test written for them; spec and code untouched. | diff |
| X1-X3 | Checkout choice stated with reason; sibling-only tests listed and not edited; shared file listed "shared, owned by another spec" and untouched (except comment FR renames). | read |
| ST1-ST6 | Stack detected from the right manifest; no library assumed that is not declared; marker syntax `// Covers:` everywhere, title tags only where legal; run command matches the stack; iOS: "needs seam" instead of runtime mocking; native-only behaviours -> MANUAL. | read desk output |
| E1-E3 | `git diff --stat` shows no whole-file change from EOL; mojibake reported not fixed; JSON fields trimmed. | diff |

---

## PART 5 - Determinism and checker self-test

- **DT0 (checker self-test).** Before using the checker, run it on one known-good output (all PASS) and on
  copies where you injected one defect each: a dotted FR id, a missing Accept, a deleted manual key, an
  extra JSON field, an em-dash marker, a "Supports:" marker, a Counts line that does not add up. Each
  injection must produce a FAIL. If one does not, fix the checker first.
- **DT1.** Run S01 (also S06 and S07) twice from scratch with fresh agents. Compare:
  - MUST be identical: number of cases, ids, qa-cases.json fields other than `approach`, number of FRs and
    their numbering, TC table row order, former-id table, set of OUT-OF-SCOPE cases, set of stop/continue
    decisions.
  - MAY differ within tolerance: class counts. Tolerance: covered +/- 2, partial +/- 2, manual +/- 2,
    divergent +/- 1, out-of-scope +/- 1, total always equal. Any larger difference is a finding; list the
    cases that flipped class and why.
- **DT2.** Any case whose class flips between runs gets a one-line note on which rule is ambiguous.
- **DT3.** Time and size: record wall time and output size; flag a run that took more than 3x the median.

---

## PART 6 - Report format (what the tester returns)

```text
RETROFIT PROMPT TEST REPORT
Prompt version: <file and hash>   Project: <name>   Date: <date>   Tester session: <id>

1. RESULT TABLE
| Scenario | Pri | Mode | Result (PASS / FAIL / PARTIAL / NOT RUN) | Checker line (n pass/warn/fail) | Evidence |

2. DEFECTS (one block each)
ID, severity (P0/P1/P2), scenario, the exact prompt text involved (quote the line), what happened,
what the prompt should have made the agent do, proposed wording, evidence (file:line / command output).

3. DETERMINISM (DT1-DT3)
Table of the two runs, class counts per run, flipped cases and the rule involved.

4. CHECKER ISSUES
Any false FAIL or false PASS of check-retrofit.js, with the file and the fix.

5. OPEN QUESTIONS FOR THE OWNER
Decisions the prompt cannot make (scope calls, spec-vs-QA conflicts you found).

6. VERDICT
Release gate: all P0 scenarios PASS and DT1 within tolerance -> READY. Otherwise NOT READY with the list
of failing P0 scenarios and the smallest set of prompt changes that would fix them.
```

Pass rule for the release gate: **S01, S02, S03, S04, S05, S06, S07, S08, S09, S10 and S26 all PASS.** P1
failures are reported and fixed before wide use but do not block the first release of the skill.
