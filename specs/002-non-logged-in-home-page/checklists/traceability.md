# Traceability: requirement to task to test

Chain (constitution I): requirement ID, scenario, test, code. Test paths are under `src/features/nonLoggedInHome/__tests__/` unless a full path is given. "Svc" = `src/services/__tests__/`, "Store" = `src/store/__tests__/`.

## Functional requirements

| Requirement | Scenarios | Tasks | Code | Tests |
|---|---|---|---|---|
| FR-4.1-01 to FR-4.1-04 page shell, headline, fonts | P-01 | T001, T004, T034 | `NonLoggedInHomeScreen.tsx`, `nonLoggedInHomeConstants.ts`, `src/theme/tokens.ts` | `NonLoggedInHomeScreen.test.tsx`, `constants.test.ts`, `src/theme/__tests__/tokens.test.ts` |
| FR-4.1-05 scroll | E-01, E-02, E-05, E-06 | T034 | `NonLoggedInHomeScreen.tsx` | `NonLoggedInHomeScreen.test.tsx`, `accessibility.test.tsx` |
| FR-4.1-06 dark and high contrast | E-03 | T064 | `src/theme/tokens.ts` | `src/theme/__tests__/tokens.test.ts` (values for dark and high contrast are an open Design item) |
| FR-4.1-07 draws without waiting | P-01, N-01 | T033, T034 | `hooks/useHomeBootstrap.ts` | `NonLoggedInHomeScreen.test.tsx`, `useHomeBootstrap.test.tsx` |
| FR-4.1-08, FR-4.1-09 small screen, tablet, screen_view | E-05, E-06 | none (O-13, O-08 open) | n/a | manual M-13 |
| FR-4.2-01 tile order and labels | P-01 | T004, T029, T031 | `QuickLinkGrid.tsx`, `QuickLinkTile.tsx` | `QuickLinkGrid.test.tsx`, `constants.test.ts` |
| FR-4.2-02 tile role, label, target | E-04 | T029 | `QuickLinkTile.tsx` | `QuickLinkTile.test.tsx`, `accessibility.test.tsx` |
| FR-4.2-03 stacking at scale >= 1.5 | E-01, E-02 | T028, T031 | `useTextScaleLayout.ts`, `QuickLinkGrid.tsx` | `useTextScaleLayout.test.ts`, `QuickLinkGrid.test.tsx`, `accessibility.test.tsx` |
| FR-4.2-04 Track Application wrap | E-07 | T029 | `QuickLinkTile.tsx` | `QuickLinkTile.test.tsx` |
| FR-4.2-05 Pay Now screen | P-03, N-10, N-11 | T053, T055 | `PayNowScreen.tsx`, `RootNavigator.tsx` | `PayNowScreen.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |
| FR-4.2-06, FR-4.2-07 Products, Offers, Track Application | P-04, P-05, P-14 | T032 | `hooks/useHomeActions.ts` | `useHomeActions.test.tsx` |
| FR-4.2-08 Contact Us opens popup | P-06 | T032, T050 | `useHomeActions.ts`, `useCustomerCare.ts` | `useHomeActions.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |
| FR-4.2-09 analytics | P-03 to P-06, P-14 | T032 | `useHomeActions.ts` | `useHomeActions.test.tsx` |
| FR-4.2-10 one destination per burst | E-14 | T027 | `hooks/useGuardedNavigate.ts` | `useGuardedNavigate.test.tsx`, `useHomeActions.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |
| FR-4.3-01 to FR-4.3-04 Login | P-02 | T030, T032 | `LoginButton.tsx`, `useHomeActions.ts` | `LoginButton.test.tsx`, `useHomeActions.test.tsx` |
| FR-4.3-05 no Register Now, chatbot, accessibility icon | P-01, P-02 | T007 | n/a | `constants.test.ts`, `NonLoggedInHomeScreen.test.tsx` |
| FR-4.4-01 token request | P-09, N-01 | T033 | `useHomeBootstrap.ts` | `useHomeBootstrap.test.tsx`, Svc `generatetokenContract.test.ts` |
| FR-4.4-02, FR-4.4-03, FR-4.4-05, FR-4.4-06 | P-09, N-01, E-13 | T013 | `src/services/authService.ts` | Svc `generatetokenContract.test.ts`, `authService.test.ts` |
| FR-4.4-04, FR-4.4-09 auth header, one retry | P-08, P-09, N-01, N-02 | T009 to T012 | `src/services/authRetry.ts`, `httpClient.ts` | Svc `authRetry.test.ts`, `httpClient.test.ts` |
| FR-4.4-08 no X-BHFL-Auth | P-08 | T012, T013 to T015 | n/a | Svc `authRetry.test.ts`, `faqContract.test.ts`, `versionContract.test.ts`, `isolation.test.ts` |
| FR-4.4-10 per-call error contract | N-02, N-08, N-09 | T008, T013 to T015 | `src/services/apiErrors.ts` | Svc `apiErrors.test.ts`, contract tests |
| FR-4.5-01 to FR-4.5-07 FAQ flow | P-07, P-08, N-02 to N-05, N-10 | T045 to T047 | `hooks/useFaqFlow.ts` | `useFaqFlow.test.tsx`, `NonLoggedInHomeScreen.test.tsx`, Svc `faqContract.test.ts` |
| FR-4.5-08 announcements | E-04 | T043, T045 | `LoadingOverlay.tsx`, `CommonMessageDialog.tsx` | `LoadingOverlay.test.tsx`, `CommonMessageDialog.test.tsx`, `accessibility.test.tsx` |
| FR-4.6-01 to FR-4.6-05 Customer Care popup | P-06, E-11 | T049, T050 | `CustomerCarePopup.tsx`, `useCustomerCare.ts` | `CustomerCarePopup.test.tsx`, `useCustomerCare.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |
| FR-4.7-01 to FR-4.7-09 version gate | P-10, N-06 to N-09, E-08, E-09, E-12 | T040 to T042 | `useHomeBootstrap.ts`, `VersionDialog.tsx` | `useHomeBootstrap.test.tsx`, `VersionDialog.test.tsx`, Svc `versionContract.test.ts` |
| FR-4.7-10 installed version for the footer | P-10 | none (`getAppVersion()` already exists) | `src/services/deviceInfo.ts` | n/a |
| FR-4.8-01 to FR-4.8-04 exit confirmation | P-11, P-12, E-11 | T059 to T061 | `useExitConfirm.ts`, `ExitConfirmDialog.tsx` | `useExitConfirm.test.tsx`, `ExitConfirmDialog.test.tsx`, `NonLoggedInHomeScreen.test.tsx` |
| FR-4.9-01 to FR-4.9-04 focus reset | P-13, E-10 | T054, T056 | `hooks/useFocusReset.ts` | `useFocusReset.test.tsx`, Store `nonLoggedInHomeState.test.ts`, `NonLoggedInHomeScreen.test.tsx` |
| FR-7.4-01 to FR-7.4-04 accessibility | E-01 to E-04 | T062, T064, T065 | components | `accessibility.test.tsx`, manual M-10 to M-13 |

## Business rules and validations

| Rule | Realised by | Tests |
|---|---|---|
| BR-1 | FR-4.1-xx | `NonLoggedInHomeScreen.test.tsx` |
| BR-2, BR-3 | FR-4.4-xx | `useHomeBootstrap.test.tsx`, Svc `authRetry.test.ts`, `generatetokenContract.test.ts` |
| BR-4 | FR-4.2-01 to FR-4.2-04 | `QuickLinkGrid.test.tsx`, `QuickLinkTile.test.tsx`, `useTextScaleLayout.test.ts` |
| BR-5 | FR-4.2-05 | `PayNowScreen.test.tsx` |
| BR-6 | FR-4.5-xx | `useFaqFlow.test.tsx` |
| BR-7 | FR-4.6-xx | `CustomerCarePopup.test.tsx`, `useCustomerCare.test.tsx` |
| BR-8 | FR-4.3-xx | `LoginButton.test.tsx`, `useHomeActions.test.tsx` |
| BR-9 | FR-4.7-xx | `useHomeBootstrap.test.tsx`, `VersionDialog.test.tsx`, Svc `versionContract.test.ts` |
| BR-10 | FR-4.8-xx | `useExitConfirm.test.tsx` |
| BR-11 | FR-4.9-xx | `useFocusReset.test.tsx` |
| BR-12 | FR-7.4-xx | `accessibility.test.tsx` |
| TV-1 | FR-4.4-03 | Svc `generatetokenContract.test.ts`, `authService.test.ts` |
| TV-2 | FR-4.5-05 | Svc `faqContract.test.ts`, `useFaqFlow.test.tsx` |
| TV-3, TV-4, TV-5 | FR-4.7-01, FR-4.7-03, FR-4.7-04 | Svc `versionContract.test.ts`, `versionService.test.ts` |
| PERF-2 | FR-4.4-06 | Svc `authService.test.ts` (10 s timeout) |
| PERF-3 | FR-4.5-06 | `useFaqFlow.test.tsx` (spinner always clears) |
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
