# Retrofit prompt v3: re-test results

Five runs by fresh agents on v3. Four were dry runs (read-only on the real repos, outputs in a sandbox) on real messy specs and QA files. One was a real run on the clean 002 spec in an isolated git worktree.

## Did v3 do what it promises?

| Test | Input | Expected | Result |
|---|---|---|---|
| Wrong QA file | WebView spec 091 + Personalise workbook | Stop and ask, write nothing | **Pass.** 0 of 70 in scope, relevance table and question printed, nothing written |
| Spec with no FR ids | Loan listing 103, QA_SCOPE of 3 ids | Derive FRs with sources, exempt out-of-scope cases | **Pass.** 24 FRs derived, each cited and marked; 67 out-of-scope rows `n/a`; "statically mapped / 0 verified" line |
| Step-per-row QA | Verify details 013, 'User Registration' | Group rows, handle duplicates, FR-VD ids | **Pass.** 302 rows -> 43 cases; CM_32 clash suffixed `CM_32S2`; FR-VD-001/002 renumbered; placeholder untouched; 2 own mistakes caught by Step F |
| Suite that cannot load | Customise Home 097 | No repairs, report load errors, synthesize tasks | **Pass.** Two stacked blockers found and left unrepaired; T-ENV-001 unchecked; tasks.md synthesized; 17 tests drafted |
| Clean spec regression | 002 (real run in worktree) | No regression vs trial5 | **Pass.** tdd-verify COVERED, 71/71, 8/8 rules; 55 covered / 7 partial / 3 manual / 5 divergent / 1 out-of-scope (trial5: 56/7/2/0/5/0/1); 19 new tests; no production file changed |

I re-checked the 002 regression myself: tdd-verify COVERED 71/71 and 8/8, no dotted FR ids, every task has an FR in Maps, manual keys match in both directions, schema exact, production untouched, and 159 tests pass in the three feature suites I re-ran.

## Contradictions inside v3 (fix first)

| # | Where | Problem | Proposed fix |
|---|---|---|---|
| 1 | A.3 vs E.2 vs shared tests | The start check stops on any older "TC -> Task coverage" table, but E.2 says to keep and retitle such a table. It also fires on shared test files that carry another spec's QA markers. | A.3 stops only when the table's first column holds QA ids from QA_CASES, or the ASCII heading already exists. A different shape or the Unicode arrow is a legacy table (E.2). A shared test file outside the feature folder that carries another spec's markers is listed as "shared, owned by another spec", not used as proof, not edited (except FR-id renames in comments). |
| 2 | F vs C.4 | F says no orphan ids in bracket titles, C.4 leaves legacy tags in place. The legacy regex misses `[E-14]`, `[N-11]`, `[T001]`. | F checks bracket titles only for QA-id-shaped tags; legacy tags are exempt and listed. Legacy tag = any leading bracket tag that is not a QA id. |
| 3 | F vs C.6 | F wants a test for every unit-testable case, C.6 forbids tests for unbuilt behaviour. | Exempt GAP cases whose behaviour is not built, and the blocked part of PARTIAL. |
| 4 | D vs rule 4 | D says put new tests in the existing file; rule 4 forbids repairing a file that does not load. | If the existing file does not load or its mocks are stale, create a new file next to it. |
| 5 | C vs G vs A.6 | COVERED needs "a test that can pass" and "every test passed", but nothing may be able to run. | When no suite can run, classify by quoted assertions, label it "statically mapped, not run", print no covered percentage, tick no [X]. A workaround config is reported separately, never counted as verified. A test file outside the repo root does not count as run. |
| 6 | A.4 vs Step F vs QA_SCOPE | A user-confirmed scope trips the 20% stop and the SUSPECT INPUT banner. | Compute the 20% rule after applying QA_SCOPE. For a confirmed sheet print "CONFIRMED SCOPE: n% out of scope" instead of SUSPECT INPUT. |
| 7 | B.3 vs B.5 | "Keep the original id in a note" but "only these fields". | Put it in `source` ("row 285; id CM_32 clashes with row 164"). |
| 8 | E.0 vs former-id table | "Replace in every file" vs the table that must keep old ids. | "except inside the former-id table, written without the FR- prefix". Grep wording: "FR-, a digit, a dot, another digit". F also greps `FR-[A-Za-z]`, ignoring the placeholder `FR-NNN`. |
| 9 | F counts | Approaches only start manual / out-of-scope / unit-testable. | unit-testable = covered + partial + gap + divergent + qa-suspect + failing. |

## Gaps that real data exposed

**Step B (QA parsing)**
- A filled name or description starts a new case: say "case-level name column only, never a per-step description". A serial-number column is never an id. In step-per-row data use "Step N:" lines for every case including one-row cases. Do not renumber to close gaps in step numbers; report the gap.
- Qualify an id with its sheet name if the workbook repeats it on any other sheet, even when only one sheet is read.
- Title tag for a test with several ids: one bracket per id, "[CM_17] [CM_18]".

**Step A (inventory and scope)**
- Two checkouts: if several contain SPEC_FOLDER, use the one the user names, else the one whose baseline loads; hash-compare spec and feature files and list differences that change a verdict. Tests found only in the other checkout are listed as sibling-only and never edited.
- No tasks.md or plan.md: find tests by searching for the feature's source file names and screen name. Also include tests of units the feature imports when a case depends on them (for example a formatter).
- In scope: a case counts if a step is produced by files named in the spec, plan or tasks, or by the feature folder; a shared concept name (back, loader, session) is not enough. Say whether rendered child components count; print the in-scope count with and without borderline cases and stop if either side crosses 20%. When Module has one value, table by scenario or id range.
- A.6: load failures stack. After the first error, parse each feature test file read-only and list every further blocker, classified ENV (dependency, config) or FILE (syntax). T-ENV-001 names all of them.
- A.5: also report text that contradicts another requirement, garbled requirement text with editing remarks, and test titles that carry another feature's task ids (MISLABELLED).
- When stopping at A.4, also print the A.1 stack and the A.2 test-file list.

**Step C and markers**
- An existing `Covers:` marker on a test that proves no case becomes a plain comment keeping the note and renamed FR ids. A marker is all-proof or all-divergent. Title tags in existing tests are rewritten, never added.
- A legacy tag that proves several QA ids, or is reused for different tests, is left alone and gets a marker only. A MISLABELLED QA-id tag may be renamed to a neutral tag. The orphan list goes to a file; Step H prints the count.
- Exact copy supplied by CMS or backend is MANUAL or PARTIAL-human. Vague expected results ("should be able to...") are PARTIAL, not COVERED, unless the assertion names a concrete observable.
- Add the approach form "unit-testable - partial: <asserted>; divergent: <what>".

**Step E (files)**
- E.0 numbers by order of definition, not first mention. A range between two defined ids of one area becomes an explicit list.
- A PERF/AVL case may map to its NFR row instead of a new FR. Manual or device cases may show "FR: none (manual)" and are exempt from the chain check. Open-item text: "awaiting owner decision (id if the spec has one)".
- No requirements section: insert "Derived Requirements" before the first non-narrative section and say which. Skip the former-id table and the "no task before retrofit" bullet when every FR is derived.
- Existing task format: extend an existing Input line; extra lines between Maps and Accept are kept; `(was: ...)` may hold a range (the no-range check covers text before it); lowercase `[x]` counts; T-ENV-001 gets Maps and Accept; task ids continue the existing format even if non-contiguous.
- Delete the "seed manual-verification.json from the quickstart" sentence (the file is a flat id -> reason map).
- Preserve existing line endings and encoding byte for byte; report mojibake, do not fix.

**Step order and reporting**
- Run the tests (G) after Step D and before Step F; write the report after F.
- Print "steps proven / in-scope steps" per case and in total, so PARTIAL and COVERED do not hide how little is proven (a case marked COVERED on one vague step of eleven).
- Label the case -> FR -> task check a consistency check, because the retrofit chooses both ends. State that Retrofit Tests stay unticked when they cannot run.

## What worked on every run
- The relevance gate, the quote-the-assertion rule, the DIVERGENT class and rule 4 (no code changes) held up on real data.
- Step F self-checks were scriptable and caught the agents' own mistakes in three runs.
- Rule 8 kept agents out of other spec folders that were referenced inside test and spec files.
- The manual-verification key rule, the Counts line and the marker format were mechanically checkable.

## Remaining limits
- Four of five runs were dry runs: new tests drafted there were not run. Only the 002 regression ran its new tests (19, all pass).
- Class counts still move a little between runs (covered 56 vs 55, manual 2 vs 3 on 002). Scripts in the skill should pin the mechanical parts.
- v3 is long; the 21 fixes above will lengthen it. Consider moving Steps B and F into the skill's scripts.
