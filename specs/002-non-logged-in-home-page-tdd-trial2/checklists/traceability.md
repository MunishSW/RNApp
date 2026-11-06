# Traceability: requirement to task to test

Chain (constitution I): requirement ID, scenario, test, code. Test paths are under `src/features/nonLoggedInHome/__tests__/` unless a full path is given. "Svc" = `src/services/__tests__/`, "Store" = `src/store/__tests__/`.

## Functional requirements

| Requirement | Scenarios | Tasks | Code | Tests |
|---|---|---|---|---|
| FR-001 to FR-004 page shell, headline, fonts | P-01 | T001, T004, T034 | `NonLoggedInHomeScreen.tsx`, `nonLoggedInHomeConstants.ts`, `src/theme/tokens.ts` | `NonLoggedInHomeScreen.test.tsx`, `constants.test.ts`, `src/theme/__tests__/tokens.test.ts` |
| FR-005 scroll | E-01, E-02, E-05, E-06 | T034 | `NonLoggedInHomeScreen.tsx` | `NonLoggedInHomeScreen.test.tsx`, `accessibility.test.tsx` |
| FR-006 dark and high contrast | E-03 | T064 | `src/theme/tokens.ts` | `src/theme/__tests__/tokens.test.ts` (values for dark and high contrast are an open Design item) |
| FR-007 draws without waiting | P-01, N-01 | T033, T034 | `hooks/useHomeBootstrap.ts` | `NonLoggedInHomeScreen.test.tsx`, `useHomeBootstrap.test.tsx` |
| FR-008, FR-009 small screen, tablet, screen_view | E-05, E-06 | none (O-13, O-08 open) | n/a | manual M-13 |
| FR-010 tile order and labels | P-01 | T004, T029, T031 | `QuickLinkGrid.tsx`, `QuickLinkTile.tsx` | `QuickLinkGrid.test.tsx`, `constants.test.ts` |
| FR-011 tile role, label, target | E-04 | T029 | `QuickLinkTile.tsx` | `QuickLinkTile.test.tsx`, `accessibility.test.tsx` |
| FR-012 stacking at scale >= 1.5 | E-01, E-02 | T028, T031 | `useTextScaleLayout.ts`, `QuickLinkGrid.tsx` | `useTextScaleLayout.test.ts`, `QuickLinkGrid.test.tsx`, `accessibility.test.tsx` |
| FR-013 Track Application wrap | E-07 | T029 | `QuickLinkTile.tsx` | `QuickLinkTile.test.tsx` |
| FR-014 Pay Now screen | P-03, N-10, N-11 | T053, T055 | `PayNowScreen.tsx`, `RootNavigator.tsx` | `PayNowScreen.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |
| FR-015, FR-016 Products, Offers, Track Application | P-04, P-05, P-14 | T032 | `hooks/useHomeActions.ts` | `useHomeActions.test.tsx` |
| FR-017 Contact Us opens popup | P-06 | T032, T050 | `useHomeActions.ts`, `useCustomerCare.ts` | `useHomeActions.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |
| FR-018 analytics | P-03 to P-06, P-14 | T032 | `useHomeActions.ts` | `useHomeActions.test.tsx` |
| FR-019 one destination per burst | E-14 | T027 | `hooks/useGuardedNavigate.ts` | `useGuardedNavigate.test.tsx`, `useHomeActions.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |
| FR-020 to FR-023 Login | P-02 | T030, T032 | `LoginButton.tsx`, `useHomeActions.ts` | `LoginButton.test.tsx`, `useHomeActions.test.tsx` |
| FR-024 no Register Now, chatbot, accessibility icon | P-01, P-02 | T007 | n/a | `constants.test.ts`, `NonLoggedInHomeScreen.test.tsx` |
| FR-025 token request | P-09, N-01 | T033 | `useHomeBootstrap.ts` | `useHomeBootstrap.test.tsx`, Svc `generatetokenContract.test.ts` |
| FR-026, FR-027, FR-029, FR-030 | P-09, N-01, E-13 | T013 | `src/services/authService.ts` | Svc `generatetokenContract.test.ts`, `authService.test.ts` |
| FR-028, FR-032 auth header, one retry | P-08, P-09, N-01, N-02 | T009 to T012 | `src/services/authRetry.ts`, `httpClient.ts` | Svc `authRetry.test.ts`, `httpClient.test.ts` |
| FR-034 no X-BHFL-Auth | P-08 | T012, T013 to T015 | n/a | Svc `authRetry.test.ts`, `faqContract.test.ts`, `versionContract.test.ts`, `isolation.test.ts` |
| FR-033 per-call error contract | N-02, N-08, N-09 | T008, T013 to T015 | `src/services/apiErrors.ts` | Svc `apiErrors.test.ts`, contract tests |
| FR-035 to FR-041 FAQ flow | P-07, P-08, N-02 to N-05, N-10 | T045 to T047 | `hooks/useFaqFlow.ts` | `useFaqFlow.test.tsx`, `NonLoggedInHomeScreen.test.tsx`, Svc `faqContract.test.ts` |
| FR-042 announcements | E-04 | T043, T045 | `LoadingOverlay.tsx`, `CommonMessageDialog.tsx` | `LoadingOverlay.test.tsx`, `CommonMessageDialog.test.tsx`, `accessibility.test.tsx` |
| FR-043 to FR-047 Customer Care popup | P-06, E-11 | T049, T050 | `CustomerCarePopup.tsx`, `useCustomerCare.ts` | `CustomerCarePopup.test.tsx`, `useCustomerCare.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |
| FR-048 to FR-056 version gate | P-10, N-06 to N-09, E-08, E-09, E-12 | T040 to T042 | `useHomeBootstrap.ts`, `VersionDialog.tsx` | `useHomeBootstrap.test.tsx`, `VersionDialog.test.tsx`, Svc `versionContract.test.ts` |
| FR-057 installed version for the footer | P-10 | none (`getAppVersion()` already exists) | `src/services/deviceInfo.ts` | n/a |
| FR-058 to FR-061 exit confirmation | P-11, P-12, E-11 | T059 to T061 | `useExitConfirm.ts`, `ExitConfirmDialog.tsx` | `useExitConfirm.test.tsx`, `ExitConfirmDialog.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |
| FR-062 to FR-065 focus reset | P-13, E-10 | T054, T056 | `hooks/useFocusReset.ts` | `useFocusReset.test.tsx`, Store `nonLoggedInHomeState.test.ts`, `NonLoggedInHomeScreen.test.tsx` |
| FR-066 to FR-069 accessibility | E-01 to E-04 | T062, T064, T065 | components | `accessibility.test.tsx`, manual M-10 to M-13 |

## Business rules and validations

| Rule | Realised by | Tests |
|---|---|---|
| BR-1 | BRD area 4.1 | `NonLoggedInHomeScreen.test.tsx` |
| BR-2, BR-3 | BRD area 4.4 | `useHomeBootstrap.test.tsx`, Svc `authRetry.test.ts`, `generatetokenContract.test.ts` |
| BR-4 | FR-010 to FR-013 | `QuickLinkGrid.test.tsx`, `QuickLinkTile.test.tsx`, `useTextScaleLayout.test.ts` |
| BR-5 | FR-014 | `PayNowScreen.test.tsx` |
| BR-6 | BRD area 4.5 | `useFaqFlow.test.tsx` |
| BR-7 | BRD area 4.6 | `CustomerCarePopup.test.tsx`, `useCustomerCare.test.tsx` |
| BR-8 | BRD area 4.3 | `LoginButton.test.tsx`, `useHomeActions.test.tsx` |
| BR-9 | BRD area 4.7 | `useHomeBootstrap.test.tsx`, `VersionDialog.test.tsx`, Svc `versionContract.test.ts` |
| BR-10 | BRD area 4.8 | `useExitConfirm.test.tsx` |
| BR-11 | BRD area 4.9 | `useFocusReset.test.tsx` |
| BR-12 | BRD area 7.4 | `accessibility.test.tsx` |
| TV-1 | FR-027 | Svc `generatetokenContract.test.ts`, `authService.test.ts` |
| TV-2 | FR-039 | Svc `faqContract.test.ts`, `useFaqFlow.test.tsx` |
| TV-3, TV-4, TV-5 | FR-048, FR-050, FR-051 | Svc `versionContract.test.ts`, `versionService.test.ts` |
| PERF-2 | FR-030 | Svc `authService.test.ts` (10 s timeout) |
| PERF-3 | FR-040 | `useFaqFlow.test.tsx` (spinner always clears) |
| PERF-5 | cleanup | `lifecycle.test.tsx`, `useGuardedNavigate.test.tsx`, `useFocusReset.test.tsx` |
| PERF-1 (2 s), PERF-4 (200 ms) | n/a | manual: quickstart M-1, M-2 (device timing, not run) |
| AVL-1 | offline render | `NonLoggedInHomeScreen.test.tsx` (token and version calls fail, Home still renders) |

## Scenarios

| Scenario | Proved by |
|---|---|
| P-01 | `NonLoggedInHomeScreen.test.tsx` |
| P-02 | `useHomeActions.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |
| P-03 | `PayNowScreen.test.tsx`, `useHomeActions.test.tsx` |
| P-04, P-05, P-14 | `useHomeActions.test.tsx` |
| P-06 | `CustomerCarePopup.test.tsx`, `useCustomerCare.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |
| P-07, P-08 | `useFaqFlow.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |
| P-09 | Svc `generatetokenContract.test.ts`, `useHomeBootstrap.test.tsx` |
| P-10 | `useHomeBootstrap.test.tsx`, Svc `versionContract.test.ts` |
| P-11, P-12 | `useExitConfirm.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |
| P-13 | `useFocusReset.test.tsx`, `NonLoggedInHomeScreen.test.tsx`, Store `nonLoggedInHomeState.test.ts` |
| N-01 | `NonLoggedInHomeScreen.test.tsx`, `useHomeBootstrap.test.tsx`, Svc `generatetokenContract.test.ts` |
| N-02 to N-05 | `useFaqFlow.test.tsx`, Svc `faqContract.test.ts` |
| N-06, N-07 | `VersionDialog.test.tsx`, `useHomeBootstrap.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |
| N-08, N-09 | `useHomeBootstrap.test.tsx`, `VersionDialog.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |
| N-10 | `useFaqFlow.test.tsx`, `PayNowScreen.test.tsx` |
| N-11 | `PayNowScreen.test.tsx` |
| E-01, E-02 | `accessibility.test.tsx`, `QuickLinkGrid.test.tsx`, manual M-10 |
| E-03 | `src/theme/__tests__/tokens.test.ts`, manual M-12 |
| E-04 | `accessibility.test.tsx`, manual M-11 |
| E-05, E-06 | manual M-13 (O-13 open) |
| E-07 | `QuickLinkTile.test.tsx` |
| E-08, E-09 | Svc `versionContract.test.ts` |
| E-10 | `useFocusReset.test.tsx` |
| E-11 | `useExitConfirm.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |
| E-12 | `VersionDialog.test.tsx` |
| E-13 | Svc `generatetokenContract.test.ts`, `authRetry.test.ts` |
| E-14 | `useGuardedNavigate.test.tsx`, `useHomeActions.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |

## QA case -> FR -> task -> test file

| QA case | FR | Task(s) | Test file(s) |
|---|---|---|---|
| HOME_LAYOUT_TC_001 | FR-001, FR-002, FR-003, FR-010, FR-020, FR-024 | T074, T025, T021, T064, T034, T031, T001 | `NonLoggedInHomeScreen.test.tsx`, `QuickLinkGrid.test.tsx`, `tokens.test.ts` |
| HOME_LAYOUT_TC_002 | FR-010 | T025, T021, T007, T034, T031, T004 | `NonLoggedInHomeScreen.test.tsx`, `QuickLinkGrid.test.tsx`, `constants.test.ts` |
| HOME_LAYOUT_TC_003 | FR-007, FR-049 | T074, T025, T038, T034, T041, T042 | `NonLoggedInHomeScreen.test.tsx`, `useHomeBootstrap.test.tsx` |
| HOME_ACTION_TC_001 | FR-014 | T025, T051, T034, T053, T055, T072 | `NonLoggedInHomeScreen.test.tsx (decided behaviour only)`, `PayNowScreen.test.tsx (decided behaviour only)` |
| HOME_ACTION_TC_002 | FR-015, FR-018 | T024, T032 | `useHomeActions.test.tsx` |
| HOME_ACTION_TC_003 | FR-016, FR-018 | T024, T032 | `useHomeActions.test.tsx` |
| HOME_ACTION_TC_004 | FR-036, FR-037, FR-038 | T025, T044, T034, T046, T047 | `NonLoggedInHomeScreen.test.tsx`, `useFaqFlow.test.tsx` |
| HOME_ACTION_TC_005 | FR-015, FR-018 | T024, T032 | `useHomeActions.test.tsx` |
| HOME_ACTION_TC_006 | FR-017, FR-043 | T025, T034, T049, T050, T032 | `NonLoggedInHomeScreen.test.tsx` |
| HOME_ACTION_TC_007 | FR-021 | T025, T024, T034, T032 | `NonLoggedInHomeScreen.test.tsx`, `useHomeActions.test.tsx` |
| HOME_ACTION_TC_008 | FR-037, FR-038 | T025, T044, T034, T046, T047 | `NonLoggedInHomeScreen.test.tsx`, `useFaqFlow.test.tsx` |
| HOME_ACTION_TC_009 | FR-036 | T044, T046, T047 | `useFaqFlow.test.tsx` |
| HOME_ACTION_TC_010 | FR-014 | T051, T053, T055, T072 | `PayNowScreen.test.tsx (decided behaviour only)` |
| HOME_NEG_TC_001 | FR-040 | T025, T044, T034, T046, T047 | `NonLoggedInHomeScreen.test.tsx`, `useFaqFlow.test.tsx` |
| HOME_NEG_TC_002 | FR-014 | T051, T053, T055, T072 | `PayNowScreen.test.tsx (decided behaviour only)` |
| HOME_STATE_TC_001 | FR-062, FR-063, FR-064, FR-065 | T079, T052, T054, T056 | `useFocusReset.test.tsx` |
| HOME_STATE_TC_002 | FR-025, FR-027 | T074, T025, T034 | `NonLoggedInHomeScreen.test.tsx` |
| HOME_STATE_TC_003 | FR-030 | T025, T038, T013, T034, T041, T016 | `NonLoggedInHomeScreen.test.tsx`, `authService.test.ts`, `useHomeBootstrap.test.tsx` |
| HOME_VER_TC_001 | FR-056 | T037, T014, T040, T016, T041, T042 | `VersionDialog.test.tsx`, `versionService.test.ts` |
| HOME_VER_TC_002 | FR-052 | T037, T038, T014, T040, T041, T016, T042 | `VersionDialog.test.tsx`, `useHomeBootstrap.test.tsx`, `versionService.test.ts` |
| HOME_VER_TC_003 | FR-053 | T037, T014, T040, T016, T041, T042 | `VersionDialog.test.tsx`, `versionService.test.ts` |
| HOME_VER_TC_004 | FR-053 | T037, T038, T040, T041, T042 | `VersionDialog.test.tsx`, `useHomeBootstrap.test.tsx` |
| HOME_VER_TC_005 | FR-054 | T037, T038, T014, T040, T041, T016, T042 | `VersionDialog.test.tsx`, `useHomeBootstrap.test.tsx`, `versionService.test.ts` |
| HOME_VER_TC_006 | FR-051 | T014, T016, T041, T042 | `versionContract.test.ts`, `versionService.test.ts` |
| HOME_VER_TC_007 | FR-050, FR-051 | T014, T016, T041, T042 | `versionService.test.ts` |
| HOME_VER_TC_008 | FR-055 | T038, T025, T037, T014, T041, T034, T040, T016, T042, T072 | `NonLoggedInHomeScreen.test.tsx (decided behaviour only)`, `VersionDialog.test.tsx (decided behaviour only)`, `useHomeBootstrap.test.tsx (decided behaviour only)`, `versionService.test.ts (decided behaviour only)` |
| HOME_VER_TC_009 | FR-056 | T038, T014, T041, T016, T042 | `useHomeBootstrap.test.tsx`, `versionContract.test.ts`, `versionService.test.ts` |
| HOME_VER_TC_010 | FR-048 | T014, T016, T041, T042 | `versionContract.test.ts`, `versionService.test.ts` |
| HOME_VER_TC_011 | FR-053 | T037, T040, T041, T042 | `VersionDialog.test.tsx` |
| HOME_VER_TC_012 | FR-052, FR-053 | T074, T037, T058, T034, T040, T060, T041, T042 | `NonLoggedInHomeScreen.test.tsx`, `VersionDialog.test.tsx`, `useExitConfirm.test.tsx` |
| HOME_BACK_TC_001 | FR-058 | T057, T025, T058, T059, T034, T060, T061 | `ExitConfirmDialog.test.tsx`, `NonLoggedInHomeScreen.test.tsx`, `useExitConfirm.test.tsx` |
| HOME_BACK_TC_002 | FR-059 | T057, T025, T058, T059, T034, T060, T061 | `ExitConfirmDialog.test.tsx`, `NonLoggedInHomeScreen.test.tsx`, `useExitConfirm.test.tsx` |
| HOME_BACK_TC_003 | FR-059 | T057, T025, T058, T059, T034, T060, T061 | `ExitConfirmDialog.test.tsx`, `NonLoggedInHomeScreen.test.tsx`, `useExitConfirm.test.tsx` |
| HOME_BACK_TC_004 | FR-060 | T025, T058, T034, T060, T061 | `NonLoggedInHomeScreen.test.tsx`, `useExitConfirm.test.tsx` |
| HOME_BACK_TC_005 | FR-035 | T082, T027, T046, T047 | `guardedStack.test.tsx` |
| HOME_RESET_TC_001 | FR-062 | T052, T017, T054, T018, T056 | `slices.test.ts`, `useFocusReset.test.tsx` |
| HOME_RESET_TC_002 | FR-063 | T025, T052, T034, T054, T056 | `NonLoggedInHomeScreen.test.tsx`, `useFocusReset.test.tsx` |
| HOME_RESET_TC_003 | FR-064 | T025, T052, T034, T054, T056, T083 | `NonLoggedInHomeScreen.test.tsx`, `useFocusReset.test.tsx` |
| HOME_RESET_TC_004 | FR-065 | T074, T052, T034, T054, T056, T084 | `NonLoggedInHomeScreen.test.tsx`, `useFocusReset.test.tsx` |
| HOME_RESET_TC_005 | FR-065 | T044, T052, T013, T046, T054, T016, T056 | `authService.test.ts`, `useFaqFlow.test.tsx`, `useFocusReset.test.tsx` |
| HOME_CONTACT_TC_001 | FR-043 | T048, T049, T050 | `CustomerCarePopup.test.tsx` |
| HOME_CONTACT_TC_002 | FR-046 | T048, T025, T049, T034, T050 | `CustomerCarePopup.test.tsx`, `NonLoggedInHomeScreen.test.tsx`, `useCustomerCare.test.tsx` |
| HOME_CONTACT_TC_003 | FR-046 | T074, T048, T034, T049, T050, T085 | `NonLoggedInHomeScreen.test.tsx`, `useCustomerCare.test.tsx` |
| HOME_CONTACT_TC_004 | FR-047 | T078, T048, T049, T050, T085 | `CustomerCarePopup.test.tsx` |
| HOME_CONTACT_TC_005 | FR-045 | T048, T049, T050 | `useCustomerCare.test.tsx` |
| HOME_CONTACT_TC_006 | FR-043 | T074, T034, T049, T050 | `NonLoggedInHomeScreen.test.tsx` |
| HOME_TOKEN_TC_001 | FR-028, FR-034 | T015, T012, T016, T011 | `faqContract.test.ts`, `httpClient.test.ts` |
| HOME_TOKEN_TC_002 | FR-030 | T025, T013, T034, T016 | `NonLoggedInHomeScreen.test.tsx`, `authService.test.ts` |
| HOME_TOKEN_TC_003 | FR-028 | T080, T013, T012, T016, T011 | `authService.test.ts`, `httpClient.test.ts` |
| HOME_TOKEN_TC_004 | FR-029 | T080, T013, T016 | `authService.test.ts` |
| HOME_TOKEN_TC_005 | FR-040 | T074, T044, T010, T034, T046, T009, T047 | `NonLoggedInHomeScreen.test.tsx`, `authRetry.test.ts`, `useFaqFlow.test.tsx` |
| HOME_TOKEN_TC_006 | FR-026 | T080, T013, T016 | `authService.test.ts`, `encryption.test.ts` |
| HOME_TOKEN_TC_007 | FR-027 | T081, T013, T016 | `authService.test.ts`, `secureStorage.test.ts` |
| HOME_FAQ_TC_001 | FR-039 | T044, T015, T046, T016, T047 | `faqService.test.ts`, `useFaqFlow.test.tsx` |
| HOME_FAQ_TC_002 | FR-039 | T044, T015, T046, T016, T047 | `faqService.test.ts`, `useFaqFlow.test.tsx` |
| HOME_FAQ_TC_003 | FR-037 | T044, T046, T047 | `useFaqFlow.test.tsx` |
| HOME_FAQ_TC_004 | FR-037 | T075, T043, T025, T045, T034, T046, T047, T085 | `LoadingOverlay.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |
| HOME_FAQ_TC_005 | FR-041 | T044, T046, T047 | `useFaqFlow.test.tsx` |
| HOME_FAQ_TC_006 | FR-040 | T074, T025, T044, T034, T046, T047 | `NonLoggedInHomeScreen.test.tsx`, `useFaqFlow.test.tsx` |
| HOME_FAQ_TC_007 | FR-040 | T076, T077, T044, T046, T016, T047 | `faqContract.test.ts`, `useFaqFlow.test.tsx` |
| HOME_NET_TC_001 | FR-007 | T074, T025, T038, T034, T041 | `NonLoggedInHomeScreen.test.tsx`, `useHomeBootstrap.test.tsx` |
| HOME_NET_TC_002 | FR-040 | T044, T046, T047 | `useFaqFlow.test.tsx` |
| HOME_NET_TC_003 | FR-014 | T051, T053, T055, T072 | `PayNowScreen.test.tsx (decided behaviour only)` |
| HOME_NET_TC_004 | FR-040 | T076, T044, T046, T047 | `useFaqFlow.test.tsx` |
| HOME_NET_TC_005 | FR-019 | T025, T068, T034, T027, T032 | `NonLoggedInHomeScreen.test.tsx`, `useGuardedNavigate.test.tsx` |
| HOME_NET_TC_006 | FR-019 | T082, T068, T027, T032 | `guardedStack.test.tsx`, `useGuardedNavigate.test.tsx` |
| HOME_NET_TC_007 | FR-005, FR-008 | T074, T025, T062, T034, T063, T085 | `NonLoggedInHomeScreen.test.tsx`, `accessibility.test.tsx` |
| HOME_NET_TC_008 | FR-008 | T074, T034 | `NonLoggedInHomeScreen.test.tsx` |
| HOME_NET_TC_009 | FR-070 | T071, T034 | manual (no unit test) |
| HOME_NET_TC_010 | FR-071 | T071, T069 | manual (no unit test) |
| HOME_NET_TC_011 | FR-072 | T071, T034 | manual (no unit test) |
