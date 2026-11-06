# Spec audit: Feature Specification: Non-Logged-In Home Page (BHFL)

**Story:** 001-nonlogged-home-screen - Feature Specification: Non-Logged-In Home Page (BHFL) · **Spec folder(s):** [specs/001-nonlogged-home-screen](https://github.com/MunishSW/RNApp/tree/retrofit/002-non-logged-in-home-page-tdd-trial2-tdd/specs/001-nonlogged-home-screen) · **Test cases from:** specs/001-nonlogged-home-screen/qa-cases.json

**Jira:** [BHFL-001](https://snapwork-jira.atlassian.net/browse/BHFL-001) · **Branch:** `retrofit/002-non-logged-in-home-page-tdd-trial2-tdd` · [Spec](https://github.com/MunishSW/RNApp/blob/retrofit/002-non-logged-in-home-page-tdd-trial2-tdd/specs/001-nonlogged-home-screen/spec.md) · [Plan](https://github.com/MunishSW/RNApp/blob/retrofit/002-non-logged-in-home-page-tdd-trial2-tdd/specs/001-nonlogged-home-screen/plan.md) · [Tasks](https://github.com/MunishSW/RNApp/blob/retrofit/002-non-logged-in-home-page-tdd-trial2-tdd/specs/001-nonlogged-home-screen/tasks.md) · [Tasks](https://github.com/MunishSW/RNApp/blob/retrofit/002-non-logged-in-home-page-tdd-trial2-tdd/specs/001-nonlogged-home-screen/task.md)

**Story commits:** first 2026-11-06 · last 2026-11-06 (2 commits) · **Spec date (latest created/updated written in spec, plan or tasks):** 2026-11-06 (Created in spec.md)

Checked 2026-11-06 11:28:39 UTC · commit 607e575 on branch `retrofit/002-non-logged-in-home-page-tdd-trial2-tdd`

## Stories in this spec

| Story | Title | Sheet name | Jira | Cases | Shared | PASS | PARTIAL | FAIL | Task-table rows | Timeline events | Last event |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BHFL-001 | Non-Logged-In Home Page | Sheet1, Sheet2 | NA | 71 | 0 | 71 | 0 | 0 | 71 | 5 | code.implemented 2026-11-06 |

Timeline: 5 event(s), hash chain OK.

## Conclusion

**GAPS**. 71 of 71 test case(s) are fully carried through spec → plan → tasks (67 automated in test files, 4 manual). Authoring rules not met: Every FR allocated in plan.md.

## Summary

| Item | Result |
|---|---|
| Test cases | 71 |
| PASS (spec + plan + tasks all cover it) | 71 |
| PARTIAL (covered somewhere, with gaps) | 0 |
| FAIL (not in the spec and no task) | 0 |
| Test written for it (found by name or Covers: marker, not run) | 67/71 |
| NOT OK · Every FR allocated in plan.md | 9/22 |

**Findings**

- plan.md names test file App.test.tsx (located at __tests__/App.test.tsx in repository - path mismatch resolved)

## Test cases

### Passed (71)

| # | Test case | Description | Spec (FR) | Task(s) | Test written |
|---|---|---|---|---|---|
| 1 | HOME_LAYOUT_TC_001 | Verify Home screen shows illustration, headline, six tiles and Login button. | FR-001, FR-002, FR-004, FR-020, FR-003, FR-005, FR-022 | T002, T010, T011, Phase 1, T001, T003, Phase 2, Phase 3, T020, Phase 7, T090, T091 | yes |
| 2 | HOME_LAYOUT_TC_002 | Verify tile labels and order. | FR-001, FR-002, FR-004, FR-005, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-020, FR-021 | T003, T011, Phase 1, T001, T002, T006, T008, Phase 2, T010, Phase 3, T020, T021, Phase 4, T040, T041, Phase 5, T030, Phase 6, T050, Phase 7, T090, T091, T092, T095 | yes |
| 3 | HOME_LAYOUT_TC_003 | Verify Home screen loads without waiting for background calls. | FR-001, FR-002, FR-004, FR-005, FR-010, FR-020 | T011, T020, Phase 1, T001, T002, T003, T005, Phase 2, T010, Phase 3, Phase 7, T090, T091 | yes |
| 4 | HOME_ACTION_TC_001 | Verify Pay Now action opens the payment portal. | FR-006, FR-007, FR-008, FR-009 | T012, T013, Phase 1, T006, T007, Phase 2 | yes |
| 5 | HOME_ACTION_TC_002 | Verify Our Products action routes to Products. | FR-006, FR-007, FR-009 | T012, Phase 1, T006, T007, Phase 2 | yes |
| 6 | HOME_ACTION_TC_003 | Verify Track Application action routes to its destination. | FR-006, FR-007, FR-009 | T012, Phase 1, T006, T007, Phase 2 | yes |
| 7 | HOME_ACTION_TC_004 | Verify FAQs action opens FAQ screen. | FR-013, FR-014, FR-006, FR-007, FR-009 | T012, T021, Phase 1, T003, T006, T007, T008, Phase 2, Phase 3 | yes |
| 8 | HOME_ACTION_TC_005 | Verify Offers action routes to non-logged Offers. | FR-006, FR-007, FR-009 | T012, Phase 1, T006, T007, Phase 2 | yes |
| 9 | HOME_ACTION_TC_006 | Verify Contact Us action opens the Customer Care popup. | FR-015, FR-006, FR-007, FR-009 | T012, T030, Phase 1, T006, T007, T008, Phase 2, Phase 5 | yes |
| 10 | HOME_ACTION_TC_007 | Verify Login button routes to Login screen. | FR-006, FR-007, FR-009 | T012, Phase 1, T006, T007, Phase 2 | yes |
| 11 | HOME_ACTION_TC_008 | Verify FAQ action fetches content when cache is not available. | FR-013, FR-014 | T021, Phase 1, T003, T006, T008, Phase 3 | yes |
| 12 | HOME_ACTION_TC_009 | Verify FAQ action uses cached content when available. | FR-013, FR-014 | T021, Phase 1, T003, T006, T008, Phase 3 | yes |
| 13 | HOME_ACTION_TC_010 | Verify user returns to Home after closing the Pay Now WebView. | FR-008, FR-013, FR-014 | T013, Phase 1, T003, T006, T008, Phase 2, Phase 3, T021 | yes |
| 14 | HOME_NEG_TC_001 | Verify FAQ API failure with no cache shows error. | FR-013, FR-014 | T021, Phase 1, T003, T006, T008, Phase 3 | yes |
| 15 | HOME_NEG_TC_002 | Verify Pay Now URL unavailable is handled. | FR-006, FR-007, FR-008, FR-009 | T013, Phase 1, T006, T007, Phase 2, T012 | yes |
| 16 | HOME_STATE_TC_001 | Verify stale session flags are reset on Home entry. | FR-019 | T051, Phase 1, T008, Phase 6 | yes |
| 17 | HOME_STATE_TC_002 | Verify Home works when non-logged token generation succeeds. | FR-010, FR-011, FR-012, FR-020, FR-006, FR-007, FR-009 | T020, T012, Phase 1, T004, T005, T006, T007, Phase 2, T011, Phase 3, Phase 7, T090, T092 | yes |
| 18 | HOME_STATE_TC_003 | Verify token generation failure is handled silently. | FR-010, FR-020 | T020, Phase 1, T005, Phase 2, T011, Phase 3, Phase 7, T090 | yes |
| 19 | HOME_VER_TC_001 | Verify no dialog when app version is up to date. | FR-016, FR-017 | T040, T041, Phase 4 | yes |
| 20 | HOME_VER_TC_002 | Verify maintenance dialog is shown. | FR-016, FR-017 | T040, T041, Phase 4 | yes |
| 21 | HOME_VER_TC_003 | Verify mandatory update dialog. | FR-016, FR-017 | T040, T041, Phase 4 | yes |
| 22 | HOME_VER_TC_004 | Verify Update button opens the store link. | FR-016, FR-017 | T041, Phase 4, T040 | yes |
| 23 | HOME_VER_TC_005 | Verify optional update dialog can be dismissed. | FR-016, FR-017 | T040, T041, Phase 4 | yes |
| 24 | HOME_VER_TC_006 | Verify update is not enforced when status is not Active. | FR-016 | T040, Phase 4, T041 | yes |
| 25 | HOME_VER_TC_007 | Verify version 1.8.10 is treated newer than 1.8.9. | FR-016 | T040, Phase 4, T041 | yes |
| 26 | HOME_VER_TC_008 | Verify 401 from version service shows message and logs out. | FR-016, FR-017 | T040, T041, Phase 4 | yes |
| 27 | HOME_VER_TC_009 | Verify version call failure or empty body fails open. | FR-016 | T040, Phase 4, T041 | yes |
| 28 | HOME_VER_TC_010 | Verify version request sends capitalised platform value. | FR-016 | T040, Phase 4, T041 | yes |
| 29 | HOME_VER_TC_011 | Verify iOS has no Exit button on blocking dialogs. | FR-016, FR-017 | T041, Phase 4, T040 | yes |
| 30 | HOME_VER_TC_012 | Verify blocking dialog cannot be dismissed by Android back. | FR-016, FR-017 | T041, Phase 4, T040 | yes |
| 31 | HOME_BACK_TC_001 | Verify exit confirmation shows on Android back. | FR-018 | T050, Phase 1, T003, Phase 6 | yes |
| 32 | HOME_BACK_TC_002 | Verify Okay on exit dialog closes the app. | FR-018 | T050, Phase 1, T003, Phase 6 | yes |
| 33 | HOME_BACK_TC_003 | Verify CANCEL on exit dialog keeps user on Home. | FR-018 | T050, Phase 1, T003, Phase 6 | yes |
| 34 | HOME_BACK_TC_004 | Verify back closes Contact Us popup before exit dialog. | FR-015, FR-018 | T030, T050, Phase 1, T003, T006, T008, Phase 5, Phase 6 | yes |
| 35 | HOME_BACK_TC_005 | Verify FAQ back returns to Home. | FR-013, FR-014 | T021, Phase 1, T003, T006, T008, Phase 3 | yes |
| 36 | HOME_RESET_TC_001 | Verify offers form data is cleared on return to Home. | FR-019, FR-013, FR-015 | T008, T051, Phase 1, T003, T006, Phase 3, T021, Phase 5, T030, Phase 6 | yes |
| 37 | HOME_RESET_TC_002 | Verify selected pre-approved offer is cleared on return to Home. | FR-013, FR-015, FR-019 | T008, T051, Phase 1, T003, T006, Phase 3, T021, Phase 5, T030, Phase 6 | yes |
| 38 | HOME_RESET_TC_003 | Verify register return flag is cleared on return to Home. | FR-013, FR-015, FR-019 | T008, T051, Phase 1, T003, T006, Phase 3, T021, Phase 5, T030, Phase 6 | yes |
| 39 | HOME_RESET_TC_004 | Verify Offers fail screen Ok returns to Home with reset state. | FR-019 | T051, Phase 1, T008, Phase 6 | yes |
| 40 | HOME_RESET_TC_005 | Verify focus reset does not clear FAQ cache or token. | FR-019 | T051, Phase 1, T008, Phase 6 | yes |
| 41 | HOME_CONTACT_TC_001 | Verify popup heading and three rows. | FR-015 | T030, Phase 1, T006, T008, Phase 5 | yes |
| 42 | HOME_CONTACT_TC_002 | Verify popup closes with its close control. | FR-015 | T030, Phase 1, T006, T008, Phase 5 | yes |
| 43 | HOME_CONTACT_TC_003 | Verify focus returns to Contact Us tile after closing popup. | FR-015 | T030, Phase 1, T006, T008, Phase 5 | manual |
| 44 | HOME_CONTACT_TC_004 | Verify popup scrolls at large text sizes. | FR-015 | T030, Phase 1, T006, T008, Phase 5 | yes |
| 45 | HOME_CONTACT_TC_005 | Verify Call, Email and Find Us tap behaviour. | FR-015 | T030, Phase 1, T006, T008, Phase 5 | yes |
| 46 | HOME_CONTACT_TC_006 | Verify popup opens only once on rapid taps. | FR-006, FR-007, FR-009, FR-015 | T030, T012, Phase 1, T006, T007, T008, Phase 2, Phase 5 | yes |
| 47 | HOME_TOKEN_TC_001 | Verify Bearer token is sent on FAQ request. | FR-010, FR-011, FR-012, FR-020, FR-013, FR-014 | T004, T021, Phase 1, T003, T005, T006, T008, Phase 2, T011, Phase 3, T020, Phase 7, T090, T092 | yes |
| 48 | HOME_TOKEN_TC_002 | Verify token request times out after 10 seconds. | FR-010, FR-012 | T005, Phase 1, Phase 3, T020 | yes |
| 49 | HOME_TOKEN_TC_003 | Verify early FAQ tap waits for in-flight token. | FR-010, FR-011, FR-012 | T004, T005, Phase 1, Phase 3, T020, Phase 7, T092 | yes |
| 50 | HOME_TOKEN_TC_004 | Verify relaunch after 15 minutes uses a fresh non-logged token. | FR-010, FR-012 | T005, Phase 1, Phase 3, T020 | yes |
| 51 | HOME_TOKEN_TC_005 | Verify FAQ shows error after token failure. | FR-010, FR-012, FR-013, FR-014 | T005, T021, Phase 1, T003, T006, T008, Phase 3, T020 | yes |
| 52 | HOME_TOKEN_TC_006 | Verify token request body fields are encrypted. | FR-010, FR-012 | T005, Phase 1, Phase 3, T020 | yes |
| 53 | HOME_TOKEN_TC_007 | Verify token is stored after success. | FR-010, FR-012 | T005, Phase 1, Phase 3, T020 | yes |
| 54 | HOME_FAQ_TC_001 | Verify empty FAQ list keeps user on Home with no dialog. | FR-013, FR-014 | T021, Phase 1, T003, T006, T008, Phase 3 | yes |
| 55 | HOME_FAQ_TC_002 | Verify non-array FAQ response does not crash. | FR-013, FR-014 | T021, Phase 1, T003, T006, T008, Phase 3 | yes |
| 56 | HOME_FAQ_TC_003 | Verify double tap on FAQs sends one request. | FR-013, FR-014 | T021, Phase 1, T003, T006, T008, Phase 3 | yes |
| 57 | HOME_FAQ_TC_004 | Verify spinner blocks other touches while FAQ loads. | FR-013, FR-014 | T021, Phase 1, T003, T006, T008, Phase 3 | yes |
| 58 | HOME_FAQ_TC_005 | Verify retry after FAQ failure succeeds. | FR-013, FR-014 | T021, Phase 1, T003, T006, T008, Phase 3 | yes |
| 59 | HOME_FAQ_TC_006 | Verify Okay on FAQ error dialog keeps user on Home. | FR-013, FR-014 | T021, Phase 1, T003, T006, T008, Phase 3 | yes |
| 60 | HOME_FAQ_TC_007 | Verify spinner always clears on FAQ failure or timeout. | FR-013, FR-014 | T021, Phase 1, T003, T006, T008, Phase 3 | yes |
| 61 | HOME_NET_TC_001 | Verify Home renders with no network. | FR-001, FR-002, FR-004, FR-020, FR-005, FR-010 | T011, T020, Phase 1, T001, T002, T003, T005, Phase 2, T010, Phase 3, Phase 7, T090, T091 | yes |
| 62 | HOME_NET_TC_002 | Verify FAQs with no network shows error. | FR-013, FR-014 | T021, Phase 1, T003, T006, T008, Phase 3 | yes |
| 63 | HOME_NET_TC_003 | Verify Pay Now with no network shows WebView error. | FR-006, FR-007, FR-008, FR-009 | T013, Phase 1, T006, T007, Phase 2, T012 | manual |
| 64 | HOME_NET_TC_004 | Verify network lost mid FAQ fetch. | FR-013, FR-014 | T021, Phase 1, T003, T006, T008, Phase 3 | yes |
| 65 | HOME_NET_TC_005 | Verify rapid taps on different tiles open one destination. | FR-006, FR-007, FR-009 | T007, T012, Phase 1, T006, Phase 2 | yes |
| 66 | HOME_NET_TC_006 | Verify rapid taps on the same tile do not duplicate screens. | FR-006, FR-007, FR-009 | T007, T012, Phase 1, T006, Phase 2 | yes |
| 67 | HOME_NET_TC_007 | Verify layout on small screen 320 x 568. | FR-001, FR-002, FR-004, FR-005, FR-020 | T011, Phase 1, T001, T002, T003, Phase 2, T010, Phase 3, T020, Phase 7, T090, T091 | manual |
| 68 | HOME_NET_TC_008 | Verify layout on tablet or wide screen. | FR-001, FR-002, FR-004, FR-005, FR-020 | T011, Phase 1, T001, T002, T003, Phase 2, T010, Phase 3, T020, Phase 7, T090, T091 | yes |
| 69 | HOME_NET_TC_009 | Verify cold start time to interactive. | FR-010, FR-011, FR-012, FR-020, FR-003, FR-021 | T090, Phase 1, T001, T003, T004, T005, Phase 2, T010, T011, Phase 3, T020, Phase 7, T092, T095 | manual |
| 70 | HOME_NET_TC_010 | Verify no memory growth when opening and closing tiles repeatedly. | FR-020, FR-003, FR-021 | T090, Phase 1, T001, T003, Phase 2, T010, T011, Phase 3, T020, Phase 7, T092, T095 | manual |
| 71 | HOME_NET_TC_011 | Verify Android and iOS parity. | FR-001, FR-002, FR-004, FR-005, FR-018, FR-020 | T011, T050, Phase 1, T001, T002, T003, Phase 2, T010, Phase 3, T020, Phase 6, Phase 7, T090, T091 | manual |

### Partial (0)

_None._

### Failed (0)

_None._

## Requirements → plan → tasks

| FR | In plan.md | Task(s) mapping it |
|---|---|---|
| FR-001 | yes | Phase 1, T001, T002, T003, Phase 2, T011, Phase 7, T091 |
| FR-002 | **no** | Phase 1, T001, T002, T003, Phase 2, T010, T011 |
| FR-003 | **no** | Phase 2, T010, Phase 7, T090 |
| FR-004 | **no** | Phase 2, T011 |
| FR-005 | **no** | Phase 1, T001, T002, Phase 2, T010, T011 |
| FR-006 | yes | Phase 1, T006, Phase 2, T012 |
| FR-007 | **no** | Phase 1, T006, Phase 2, T012 |
| FR-008 | **no** | Phase 2, T013 |
| FR-009 | **no** | Phase 1, T007, Phase 2, T012 |
| FR-021 | **no** | Phase 1, T001, T003, Phase 7, T090, T092, T095 |
| FR-022 | **no** | Phase 1, T002, Phase 7, T091 |
| FR-010 | yes | Phase 1, T005, Phase 3, T020 |
| FR-011 | **no** | Phase 1, T004, Phase 7, T092 |
| FR-012 | **no** | Phase 1, T005 |
| FR-013 | yes | Phase 1, T003, T008, Phase 3, T021 |
| FR-014 | **no** | Phase 1, T006, Phase 3, T021 |
| FR-015 | yes | Phase 1, T006, T008, Phase 5, T030 |
| FR-016 | yes | Phase 4, T040, T041 |
| FR-017 | **no** | Phase 4, T041 |
| FR-018 | yes | Phase 1, T003, Phase 6, T050 |
| FR-019 | yes | Phase 1, T008, Phase 6, T051 |
| FR-020 | yes | Phase 2, T011, Phase 3, T020, Phase 7, T090 |
## Remediation: how to close the gaps

**Spec date:** 2026-11-06

1. Append the missing cases to plan.md and the TC → Task table, and add the missing Maps:/Accept: lines. Existing entries are kept.

```
/tdd-spec-generator
FEATURE: specs/001-nonlogged-home-screen
BRD: <path to BRD>
QA: <path to QA cases (.xlsx, .csv, .docx, .md) OR paste the cases below>
RERUN MODE: BRD Updated
Append only: add every QA case missing from plan.md and the "TC → Task coverage" table, and give every task a Maps: and an Accept: line. Do not rewrite existing content. Then stop for the Step 2 review.
```

2. Write the tests and name the real test file in plan.md (Step 3).

```
/tdd-spec-generator
Implement the tasks in specs/001-nonlogged-home-screen/tasks.md.
Write unit tests alongside each task's code, tag each test [TC-XX] or add a "// Covers: TC-XX" marker, and name the test file in plan.md.
Do NOT run tests. When done, STOP and print the coverage-report command.
```

