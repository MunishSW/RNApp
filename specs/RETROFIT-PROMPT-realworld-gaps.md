# Retrofit prompt v2: real-world and edge-case test results

Seven dry runs (fresh agents, read-only on the real repos, outputs in a sandbox) against real bank-app data: 6 real specs, 3 real QA files in 3 formats (xlsx step-per-row, md, csv) plus a clean xlsx. The v2 prompt passed on our two clean specs (002, 003). On real data it **breaks or silently produces meaningless output in 8 places** and needs 20 smaller clarifications.

## What was run

| Run | Spec (real) | QA input | In-scope / total cases | Existing suite |
|---|---|---|---|---|
| Step B stress | none (QA parsing only) | step-per-row xlsx (5 sheets), md, csv, clean xlsx | 935 rows -> 140 cases | n/a |
| Help & Support 068 | prose spec with its own TC table | Profile Section sheet | 9 / 186 | ran: 18 pass, 1 fail, 19 skipped |
| WebView 091 | tiny, no tasks, no plan, no FR ids | Personalise xlsx (wrong pairing on purpose) | 0 / 70 | cannot load |
| Customise Home 097 | sparse FR ids, spec only | Personalise xlsx | 29 / 70 | test file does not parse |
| Loan listing 103 | 44 KB prose, zero FR ids | Personalise xlsx | 3 / 70 | cannot load |
| Verify details 013 | FR-VD-001 ids, own TC table | User Registration sheet | 11 / 43 | ran: 48 pass, 5 stale fail |
| MPIN locked 017 | FR- and AC- ids, own TC table | User Login sheet | 2 / 32 | cannot load |

Across the 6 specs, **0 cases were verified by a passing run of their own tests** (4 suites cannot run, 2 run with failures unrelated to mapped cases). 5 of 6 had 59% to 100% of the QA sheet out of scope.

## P0: the prompt gives a wrong or meaningless result

| # | Gap | Evidence | Proposed fix |
|---|---|---|---|
| 1 | **No relevance gate.** A QA file for the wrong screen passes every check. | WebView run: 70/70 OUT-OF-SCOPE, full package built, every Step F check passed, coverage "0/0". | Step A: compare QA module and scenario names and a sample of descriptions against the spec title, summary and behaviours. If fewer than 20% overlap, STOP, write nothing, report "QA file does not belong to this spec". Step F: if OUT-OF-SCOPE exceeds 50% of cases, the run FAILS and the first line of the Step H report and of coverage-report.md reads "SUSPECT INPUT". Never print a percentage when the in-scope denominator is 0. |
| 2 | **QA wider than the spec; the rules contradict themselves.** "Every case maps to an FR and a real task" cannot hold for out-of-scope cases. | 5 of 6 runs: 177/186, 67/70, 41/70, 32/43, 30/32 out of scope. Agents wrote "none (out-of-scope)" in violation of Step F, or nearly invented dozens of FRs. | OUT-OF-SCOPE cases are imported, listed once, and exempt from the FR rule, the new-FR rule, the real-task-id check and the case->FR->task chain; Task(s) = "n/a". Excluded from the "total in scope" denominator. Add an optional input QA_SCOPE (module names or keywords). Step A: if more than 25% of cases fall outside the spec's scope, ask once. Print the in-scope id list with a one-line reason each. |
| 3 | **Step-per-row QA breaks Step B.** | 935 rows -> 140 cases; 302 -> 43; 264 -> 32. Id and name only on the first row. Step Description, Pre requisite, Step No dropped. Status per step. | Define the case: "a run of rows from one id-bearing row up to the next". Count and print "step rows N -> cases M"; the match check applies to cases. `expected` = step expected results as "Step N: <text>" lines (source step number, else position). Status roll-up: any Fail -> Fail; all Pass -> Pass; none -> Not Executed. A filled name with a blank id starts a new case: generate "<sheet code>-R<excel row>" and list it as generated. Read Test Steps when classifying even though they are not copied. |
| 4 | **Repeated ids across sheets.** "Suffix S2, S3" hides the sheet. | CM_01 on 5 sheets; CM_01..CM_22 on 3 to 5 sheets. | If ids repeat across sheets, prefix every id with a short sheet code (PRE-CM_01) and record the code table in `sources`. Use S2 only for repeats inside one sheet, and report each with source row numbers and both titles. |
| 5 | **Spec with zero FR ids.** Maps must hold an FR and "never none"; "add a NEW FR" is the only path. | Loan listing: 27 FRs invented to satisfy the rule, then tasks mapped to them: a circular audit. WebView: agent wrote "Maps: (no FR defined)", breaking the rule. | If spec.md defines no FR ids: STOP and ask once (a: derive FRs from numbered sections and acceptance criteria, each marked "[derived by retrofit - needs review]", with a report line "N FRs derived"; b: abort). Never mint FRs silently. State in the report that derived FRs make the chain check circular. |
| 6 | **Existing suite cannot run or is stale, and the prompt does not say what to do.** | Customise: unclosed `it(` block, parse error, 0 of 70 verified. Webview, mpin, loan: module or ESM load errors. Verify: 5 failing stale tests. Help: 1 unmapped failing test. | Run the existing suite first (Step A). If it cannot load, put the load error in T-ENV-001, leave it unchecked, add an unchecked environment-fix task, do not repair test files, and report first in Step H. Classify by quoted assertions but print the coverage line as "N statically mapped / 0 verified" and tick no [X]. List failing tests that no case maps to under "PRE-EXISTING FAILURES", separate from FAILING cases. If no test is mapped, skip the run. |
| 7 | **Weak and fake proofs.** | Loan: about 20 tests assert only `toBeTruthy()` on a tree. Customise: source-text greps, asserts on a constant the test defined, a test with no assertion, asserts on source strings that no longer exist. MPIN: asserts on a value the test itself mocks. | "A mount-only or toBeTruthy assertion, a source-text grep, an assertion on a constant defined in the test, or an assertion on a mock the test configured is not proof. Check what is mocked. List such tests as STALE-OR-WEAK (SCAFFOLD if a whole file)." |
| 8 | **Spec-vs-code drift with no QA case.** Rule 2 covers only QA vs spec. | Help: spec requires a 2000 ms shimmer, code has none, the spec's own table says PASS. WebView: spec says WebView flags true, code sets false. MPIN: syncLRConfig, BackHandler, Modal wrapper missing but tasks ticked [x]. | Step A: for each FR, check that the code does it. Report "SPEC-DRIFT FR-NNN" with file:line evidence and add an Open-item task. Never write a test that asserts unbuilt behaviour. If the spec is stale against both QA and code, class DIVERGENT with "spec stale". |

## P1: wrong, unclear or inconsistent, but not silently meaningless

| # | Gap | Proposed fix |
|---|---|---|
| 9 | **A spec's own TC table and ids** (6 of 6 specs; ids like TC-001, TC001, [BRD TC-001], [TC_BCK_002]; PASS statuses with no test behind them). The prompt calls them orphans and so discards the spec's only test contract. | Keep the table unchanged and label it "spec-derived TCs (not QA ids)". Report each as orphan and flag PASS statuses that no test carries as unverified. Legacy tag = any leading bracket tag that is not a QA id (regex `\[(?:[A-Z]+ )?TC-?[A-Z0-9_]+\]`). Rewrite only when the legacy id has a proven QA match; otherwise leave it. A title that already carries a QA id but means something else is MISLABELLED: no marker. If the QA file is irrelevant or empty, ask whether to use the spec's own TC table as QA_CASES. |
| 10 | **FR ids: flat with gaps, duplicates, non-numeric, placeholder.** E.0 is ambiguous. | Flat FR-NNN ids that are defined keep their number; gaps stay; new FRs take max+1. Non-flat defined ids (FR-VD-001, FR-4.1-01) take the next free numbers in order of first appearance. Same id defined twice with different text: renumber the later definitions, record both in the former-id table, report, mark UNVERIFIED where a reference is unclear. The literal placeholder "FR-NNN" is not renamed and is excluded from Step F greps. If all ids are already flat, skip E.0 and say so (Former id = "unchanged"). |
| 11 | **Two id families (FR- and AC-).** 27 AC ids were silently untraced. | Inventory AC ids in Step A. Maps and the chain use FR ids only. Add a table `\| AC \| FR \|`; ACs with no FR are UNVERIFIED. |
| 12 | **Missing tasks.md, plan.md, checklists, or Key Entities.** | tasks.md absent: create it with the Environment Gate, one ticked task per FR group naming the source file and lines (ticked only if the code exists), then the Retrofit phases; state that it was synthesized. Traceability anchor: before Key Entities, else right after the Functional Requirements section. Reuse front-matter `version:` for the Version line; extend an existing Input line instead of adding a second. |
| 13 | **Existing task format** (### headings, existing Maps/Accept holding "UI Contract", "—", ranges, phantom ids, filenames that do not exist). | "Task line" means heading plus body. Replace existing Maps/Accept values in place with one single-line form; keep old text as "(was: ...)"; expand ranges ("FR-001-FR-010") into explicit ids; do not add a second pair. Report task paths that do not exist (UNVERIFIED), do not fix. |
| 14 | **Existing coverage table with another shape.** | Rename it "Legacy ..." with a heading that does not contain the exact string "## TC -> Task coverage" (a grep then finds exactly one); keep its rows; arrow variants count for the Step A start check. |
| 15 | **FR-table derivation overstates** when a process task maps many FRs. | Derive each case's FRs from its own build and test tasks only; exclude Environment Gate, manual-verification and process tasks. Where a task maps many FRs, intersect with the FRs the case's expected result actually names. |
| 16 | **FR built but no task.** The "Open item" path says "not built", which is false. | Built FR: add it to the Maps of the task that builds it. Use the Open-item task only for unbuilt or unwired behaviour. |
| 17 | **Two source checkouts** (kmb and kmb-spec hold different copies of the same screen and tests; only one runs). | Use the checkout that contains SPEC_FOLDER; say which and whether its suite can load; report differences relevant to the feature. A reference to another spec folder inside a file is reported as a legacy reference and never opened. |
| 18 | **Unreachable units** (private functions, gesture worklets, mocked child components with no tests of their own). | A case needing a gesture callback or private unit that cannot be reached without changing production code is MANUAL (reason says so) or a Retrofit Gaps task "needs seam". Also look for tests of child components the screen mocks; if none, the child-owned part is PARTIAL blocked on the child. |
| 19 | **Partially in-scope cases and "blocked".** | Classify by the in-scope steps. "Blocked" covers any unproven remainder that is not built or belongs to another feature, whether or not that module exists. |
| 20 | **Several QA sources for the same cases; no expected column.** | Use the richer source; list others in `sources`; report status disagreements. If no expected-result column exists, set expected "" with a warning; those cases cannot be COVERED. For md or csv, "sheet" = top-level heading or Tab column. |

## P2: small clarifications

- Add `GAP` to the approach vocabulary: `unit-testable - gap: <what is missing>`.
- Trim leading and trailing whitespace on every field; keep internal line breaks and Unicode.
- Map only headed columns; ignore stray legend cells outside the header range and say so.
- If a separate scenario id exists, put "<scenario id> - <scenario>" in `scenario`.
- A spec cut off mid-sentence or with duplicate section headings: report and ask once.
- When the BRD is N/A, QA-SUSPECT is judged against the spec alone and also needs internal inconsistency (title vs steps); prefer DIVERGENT when the spec has a dated change record.
- When a case is part divergent, part provable: allow PARTIAL plus a divergent note, so the provable steps still get a test.
- Dry-run: allow a diff file instead of `git diff`.
- Allow the same assertion line to be quoted for several cases when each expected result is exactly asserted.
- Cap detailed proof at in-scope cases; one line for the whole out-of-scope group.

## What worked on real data

- Printing the header row, column mapping and counts before writing caught extra columns, legend cells and sheet differences.
- "Quote the assertion line" prevented false COVERED in every run: it exposed toBeTruthy scaffolds, mock-only tests, a mislabelled `[EDGE-004]`, and a shimmer test whose title promised more than it asserted.
- The DIVERGENT class and "never change the spec or code" produced correct, reviewable findings (App Version vs Report Fraud, WebView vs header-only, quit dialog vs goBack, Reset vs unlock).
- PARTIAL split (human remainder vs blocked) and the manual-verification key rule were easy to apply.
- Preserve-never-rewrite and "update in place" held on messy specs.
- Step F cross-checks caught real problems in three runs (unmapped FRs, "—" in Maps, a duplicate-heading collision).
- Running existing tests exposed failing and stale tests that no case maps to.

## Which of these a prompt can fix and which need code

- **Prompt wording is enough:** 1, 2 (rules), 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, all of P2.
- **Better as a script in the skill:** step-per-row grouping, id prefixing and carry-down (3, 4, 20); Counts and table consistency; relevance score (1); FR id inventory and rename (10, 11); the Step F greps. Agents drifted between runs on exactly these.
