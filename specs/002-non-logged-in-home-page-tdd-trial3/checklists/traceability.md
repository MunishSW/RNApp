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

Source: `qa-cases.json` (71 cases). Tasks in `tasks.md`; the authoritative per-case table is `## TC -> Task coverage` there.

| QA case | FR | Task(s) | Test file(s) | Status |
|---|---|---|---|---|
| HOME_LAYOUT_TC_001 | FR-001 to FR-025 | T074, T021, T025, T031, T034, T033 | `NonLoggedInHomeScreen.test.tsx`, `QuickLinkGrid.test.tsx` | COVERED |
| HOME_LAYOUT_TC_002 | FR-001 to FR-025 | T021, T025, T031, T034, T033 | `NonLoggedInHomeScreen.test.tsx`, `QuickLinkGrid.test.tsx` | COVERED |
| HOME_LAYOUT_TC_003 | FR-001 to FR-056 | T075, T038, T025, T041, T034, T033 | `NonLoggedInHomeScreen.test.tsx`, `useHomeBootstrap.test.tsx` | COVERED |
| HOME_ACTION_TC_001 | FR-014 | T053, T055 | manual / none | DIVERGENT |
| HOME_ACTION_TC_002 | FR-015, FR-016, FR-017, FR-018, FR-019, FR-021 | T024, T032 | `useHomeActions.test.tsx` | COVERED |
| HOME_ACTION_TC_003 | FR-015, FR-016, FR-017, FR-018, FR-019, FR-021 | T024, T032 | `useHomeActions.test.tsx` | COVERED |
| HOME_ACTION_TC_004 | FR-035 to FR-041 | T044, T046 | `useFaqFlow.test.tsx` | COVERED |
| HOME_ACTION_TC_005 | FR-015, FR-016, FR-017, FR-018, FR-019, FR-021 | T024, T032 | `useHomeActions.test.tsx` | COVERED |
| HOME_ACTION_TC_006 | FR-001 to FR-025 | T025, T034, T033 | `NonLoggedInHomeScreen.test.tsx` | COVERED |
| HOME_ACTION_TC_007 | FR-001 to FR-025 | T025, T034, T033 | `NonLoggedInHomeScreen.test.tsx` | COVERED |
| HOME_ACTION_TC_008 | FR-001 to FR-041 | T044, T025, T046, T034, T033 | `NonLoggedInHomeScreen.test.tsx`, `useFaqFlow.test.tsx` | COVERED |
| HOME_ACTION_TC_009 | FR-035 to FR-041 | T044, T046 | `useFaqFlow.test.tsx` | COVERED |
| HOME_ACTION_TC_010 | FR-014 | T051, T053 | manual / none | DIVERGENT |
| HOME_NEG_TC_001 | FR-001 to FR-041 | T044, T025, T046, T034, T033 | `NonLoggedInHomeScreen.test.tsx`, `useFaqFlow.test.tsx` | COVERED |
| HOME_NEG_TC_002 | FR-014 | T053 | manual / none | DIVERGENT |
| HOME_STATE_TC_001 | FR-062, FR-063, FR-064, FR-065 | T052, T054 | `useFocusReset.test.tsx` | COVERED |
| HOME_STATE_TC_002 | FR-001 to FR-025 | T076, T024, T025, T032, T034, T033 | `NonLoggedInHomeScreen.test.tsx`, `useHomeActions.test.tsx` | COVERED |
| HOME_STATE_TC_003 | FR-001 to FR-056 | T038, T025, T041, T034, T033 | `NonLoggedInHomeScreen.test.tsx`, `useHomeBootstrap.test.tsx` | COVERED |
| HOME_VER_TC_001 | FR-025 to FR-057 | T014, T016 | `Svc versionService.test.ts` | COVERED |
| HOME_VER_TC_002 | FR-025 to FR-057 | T014, T037, T016, T040 | `Svc versionService.test.ts`, `VersionDialog.test.tsx` | COVERED |
| HOME_VER_TC_003 | FR-025 to FR-057 | T014, T037, T016, T040 | `Svc versionService.test.ts`, `VersionDialog.test.tsx` | COVERED |
| HOME_VER_TC_004 | FR-048 to FR-056 | T038, T037, T041, T040 | `VersionDialog.test.tsx`, `useHomeBootstrap.test.tsx` | COVERED |
| HOME_VER_TC_005 | FR-025 to FR-057 | T038, T014, T037, T041, T016, T040 | `Svc versionService.test.ts`, `VersionDialog.test.tsx`, `useHomeBootstrap.test.tsx` | COVERED |
| HOME_VER_TC_006 | FR-025 to FR-057 | T014, T016 | `Svc versionService.test.ts` | COVERED |
| HOME_VER_TC_007 | FR-025 to FR-057 | T014, T016 | `Svc versionService.test.ts` | COVERED |
| HOME_VER_TC_008 | FR-048, FR-049, FR-055, FR-056 | T038, T041 | manual / none | DIVERGENT |
| HOME_VER_TC_009 | FR-025 to FR-057 | T038, T014, T041, T016 | `Svc versionService.test.ts`, `useHomeBootstrap.test.tsx` | COVERED |
| HOME_VER_TC_010 | FR-025 to FR-057 | T014, T016 | `Svc versionService.test.ts` | COVERED |
| HOME_VER_TC_011 | FR-052, FR-053, FR-054 | T037, T040 | `VersionDialog.test.tsx` | COVERED |
| HOME_VER_TC_012 | FR-052 to FR-061 | T077, T058, T037, T060, T040 | `VersionDialog.test.tsx`, `useExitConfirm.test.tsx` | COVERED |
| HOME_BACK_TC_001 | FR-001 to FR-059 | T057, T025, T059, T034, T033 | `ExitConfirmDialog.test.tsx`, `NonLoggedInHomeScreen.test.tsx` | COVERED |
| HOME_BACK_TC_002 | FR-001 to FR-061 | T058, T025, T060, T034, T033 | `NonLoggedInHomeScreen.test.tsx`, `useExitConfirm.test.tsx` | COVERED |
| HOME_BACK_TC_003 | FR-001 to FR-061 | T058, T025, T060, T034, T033 | `NonLoggedInHomeScreen.test.tsx`, `useExitConfirm.test.tsx` | COVERED |
| HOME_BACK_TC_004 | FR-001 to FR-025 | T025, T034, T033 | `NonLoggedInHomeScreen.test.tsx` | COVERED |
| HOME_BACK_TC_005 | FR-035 to FR-041 | T046, T071 | manual / none | MANUAL |
| HOME_RESET_TC_001 | FR-062, FR-063, FR-064, FR-065 | T052, T054 | `useFocusReset.test.tsx` | COVERED |
| HOME_RESET_TC_002 | FR-001 to FR-065 | T052, T025, T054, T034, T033 | `NonLoggedInHomeScreen.test.tsx`, `useFocusReset.test.tsx` | COVERED |
| HOME_RESET_TC_003 | FR-062, FR-063, FR-064, FR-065 | T052, T054 | `useFocusReset.test.tsx` | COVERED |
| HOME_RESET_TC_004 | FR-062, FR-063, FR-064, FR-065 | T052, T054, T088 | `useFocusReset.test.tsx` | PARTIAL |
| HOME_RESET_TC_005 | FR-035 to FR-065 | T044, T052, T046, T054 | `useFaqFlow.test.tsx`, `useFocusReset.test.tsx` | COVERED |
| HOME_CONTACT_TC_001 | FR-017, FR-043, FR-044, FR-045, FR-046, FR-047 | T048, T049 | `CustomerCarePopup.test.tsx` | COVERED |
| HOME_CONTACT_TC_002 | FR-001 to FR-047 | T048, T025, T049, T034, T033 | `CustomerCarePopup.test.tsx`, `NonLoggedInHomeScreen.test.tsx` | COVERED |
| HOME_CONTACT_TC_003 | FR-017, FR-043, FR-044, FR-045, FR-046, FR-047 | T048, T050, T071 | `useCustomerCare.test.tsx` | MANUAL |
| HOME_CONTACT_TC_004 | FR-017, FR-043, FR-044, FR-045, FR-046, FR-047 | T048, T049, T071 | `CustomerCarePopup.test.tsx` | MANUAL |
| HOME_CONTACT_TC_005 | FR-017, FR-043, FR-044, FR-045, FR-046, FR-047 | T048, T050, T071 | `useCustomerCare.test.tsx` | PARTIAL |
| HOME_CONTACT_TC_006 | FR-001 to FR-047 | T078, T048, T025, T050, T034, T033 | `NonLoggedInHomeScreen.test.tsx`, `useCustomerCare.test.tsx` | COVERED |
| HOME_TOKEN_TC_001 | FR-028, FR-032 | T011, T011 | `Svc httpClient.test.ts` | COVERED |
| HOME_TOKEN_TC_002 | FR-001 to FR-057 | T038, T013, T025, T041, T016, T034, T033 | `NonLoggedInHomeScreen.test.tsx`, `Svc authService.test.ts`, `useHomeBootstrap.test.tsx` | COVERED |
| HOME_TOKEN_TC_003 | FR-025 to FR-057 | T013, T011, T016, T011 | `Svc authService.test.ts`, `Svc httpClient.test.ts` | COVERED |
| HOME_TOKEN_TC_004 | FR-025 to FR-057 | T013, T016 | `Svc authService.test.ts` | COVERED |
| HOME_TOKEN_TC_005 | FR-025 to FR-057 | T079, T044, T015, T046, T016 | `Svc faqService.test.ts`, `useFaqFlow.test.tsx` | COVERED |
| HOME_TOKEN_TC_006 | FR-025 to FR-057 | T080, T013, T016 | `Svc authService.test.ts` | COVERED |
| HOME_TOKEN_TC_007 | FR-025 to FR-057 | T081, T013, T016 | `Svc authService.test.ts`, `Svc secureStorage.test.ts` | COVERED |
| HOME_FAQ_TC_001 | FR-035 to FR-041 | T044, T046 | `useFaqFlow.test.tsx` | COVERED |
| HOME_FAQ_TC_002 | FR-025 to FR-057 | T044, T015, T046, T016 | `Svc faqService.test.ts`, `useFaqFlow.test.tsx` | COVERED |
| HOME_FAQ_TC_003 | FR-035 to FR-041 | T044, T046 | `useFaqFlow.test.tsx` | COVERED |
| HOME_FAQ_TC_004 | FR-001 to FR-042 | T082, T043, T025, T045, T034, T033, T089 | `LoadingOverlay.test.tsx`, `NonLoggedInHomeScreen.test.tsx` | FAILING |
| HOME_FAQ_TC_005 | FR-035 to FR-041 | T044, T046 | `useFaqFlow.test.tsx` | COVERED |
| HOME_FAQ_TC_006 | FR-001 to FR-041 | T083, T044, T025, T046, T034, T033 | `NonLoggedInHomeScreen.test.tsx`, `useFaqFlow.test.tsx` | COVERED |
| HOME_FAQ_TC_007 | FR-028 to FR-041 | T044, T011, T046, T011 | `Svc httpClient.test.ts`, `useFaqFlow.test.tsx` | COVERED |
| HOME_NET_TC_001 | FR-001 to FR-030 | T084, T025, T034, T033 | `NonLoggedInHomeScreen.test.tsx` | COVERED |
| HOME_NET_TC_002 | FR-035 to FR-041 | T085, T044, T046 | `useFaqFlow.test.tsx` | COVERED |
| HOME_NET_TC_003 | FR-014 | T053 | manual / none | DIVERGENT |
| HOME_NET_TC_004 | FR-035 to FR-041 | T086, T044, T046 | `useFaqFlow.test.tsx` | COVERED |
| HOME_NET_TC_005 | FR-001 to FR-025 | T023, T025, T027, T034, T033 | `NonLoggedInHomeScreen.test.tsx`, `useGuardedNavigate.test.tsx` | COVERED |
| HOME_NET_TC_006 | FR-019 | T023, T027 | `useGuardedNavigate.test.tsx` | COVERED |
| HOME_NET_TC_007 | FR-001 to FR-025 | T087, T025, T034, T033, T071 | `NonLoggedInHomeScreen.test.tsx` | PARTIAL |
| HOME_NET_TC_008 | FR-001 to FR-020 | T034, T071 | manual / none | OUT-OF-SCOPE |
| HOME_NET_TC_009 | n/a (manual) | T071 | manual / none | MANUAL |
| HOME_NET_TC_010 | FR-019 to FR-062 | T069, T071 | manual / none | MANUAL |
| HOME_NET_TC_011 | n/a (manual) | T071 | manual / none | MANUAL |
