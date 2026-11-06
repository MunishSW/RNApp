# Tasks: Non-Logged-In Home Page

**Input**: `specs/001-nonlogged-home-screen/` (spec.md, plan.md, qa-cases.json, manual-verification.json)
**Story**: BHFL-001
**Tests**: Unit tests are written together with the code each task edits (no Red-Green-Refactor phases). Every test carries `// Covers: <TC-ID>`.

## Environment Gate

- [ ] T-ENV-001: Run `npm test` — existing suite green before new tests.
- [ ] T-ENV-002: Run `mkdir -p contracts/ checklists/`.

## Phase 1: Shared Prerequisites

- [ ] T001 [P] Add `src/theme/tokens.ts`: page blue `#035795`, white, CTA gradient stops (`#FF512F` 5.6%, `#F09819` 94.4%, 133.8 deg), font family/size/line-height tokens, spacing for Figma numbers (tile 96, gap 18, grid 331, CTA 307 x 40, radius 82). Raw hex lives only here; add dark/high-contrast token sets with brand banner and CTA exempt.
  **Maps**: FR-001, FR-002, FR-005, FR-021 · **Accept**: tokens file is the only place with hex; light values match Figma; dark set exists. · **Story**: BHFL-001
- [ ] T002 Export Figma assets via Figma MCP (`get_design_context` + `download_assets` on node 2:937, file `8U75ofxf1zz5vVAzj1sqMU`) into `src/assets/nonLoggedHome/`: illustration (node 2:941), six tile icons (2:947, 2:951, 2:954, 2:958, 2:961, 2:964), and read the CTA gradient from 2:967 to confirm T001 values. Add `assets/index.ts` typed exports. Test: each asset module resolves.
  **Maps**: FR-001, FR-002, FR-005, FR-022 · **Accept**: real Figma art on screen, no placeholders; FAQs icon is question mark although layer is `Branch_locator`. · **Story**: BHFL-001
- [ ] T003 [P] Add `src/features/nonLoggedHome/nonLoggedHomeConstants.ts`: headline (3 lines), six tile labels, link names, CTA label, FAQ error text and "Okay", contact popup heading and rows, exit dialog text, update/maintenance texts, a11y labels. Test: exact strings and order.
  **Maps**: FR-001, FR-002, FR-013..FR-018, FR-021 · **Accept**: strings match BRD verbatim. · **Story**: BHFL-001
- [ ] T004 Add `src/config/env.ts` (typed build config with keys `authApiUrl`, `apiBaseUrl`, `apiUrl`, `PORTAL_BASE_URL`, no URL values in the repo) and `src/services/httpClient.ts` (axios instance: Bearer injection when no Authorization, `app-version`/`platform`/`device-details` headers, timeouts, waits for in-flight token promise, typed responses, malformed → empty) plus `deviceInfo.ts` seam. Tests with axios mocked.
  **Maps**: FR-011 · **Accept**: headers present; request waits for token; no feature uses axios directly. · **Story**: BHFL-001
- [ ] T005 Add `src/services/authService.ts` (generatetoken, 10 s timeout, `body.token` non-empty check, shared promise), `encryption.ts` and `secureStorage.ts` seams, `src/store/tokenSlice.ts` (memory token + mirror to key `auth_token_Nonlogged`; logged-in token memory-only and never used as non-logged). Tests with fake timers and fakes.
  **Maps**: FR-010, FR-012 · **Accept**: timeout aborts at 10 s silently; username/password each encrypted AES-128-GCM per FR-012 (known-answer test of the `base64url(IV):base64url(ct+tag)` format, fresh IV each call, key/AAD from env only); creds never logged; stale logged-in token not used. · **Story**: BHFL-001
- [ ] T006 [P] Add `src/services/analytics.ts` wrapper with typed events `quick_link_clicked`, `contact_us_clicked`, `cta_clicked`, `dialog_shown`. Test: payload shapes, no personal data.
  **Maps**: FR-006, FR-007, FR-014, FR-015 · **Accept**: event names/properties per BRD 4.2.9, 4.3.9. · **Story**: BHFL-001
- [ ] T007 Add `src/navigation/{routes.ts,RootNavigator.tsx,useGuardedNavigate.ts}` and route stubs (`LoginScreen`, `Products`, `Offers`, `Faq`, `PayNowWebView`, `TrackApplication`, `BranchLocator`), wire `App.tsx` (SafeAreaProvider, Redux Provider, light status bar) and update `__tests__/App.test.tsx` to the new root. `useGuardedNavigate` ignores re-entry while a navigation is in progress; explicit back targets.
  **Maps**: FR-009 · **Accept**: rapid taps open one destination; Home is initial route; old template test replaced, not skipped. · **Story**: BHFL-001
- [ ] T008 [P] Add `src/store/{index.ts,faqSlice.ts,offersSlice.ts,sessionFlagsSlice.ts}`: FAQ cache (list, loading), offers (fullName, mobileNo, tncAccepted), selected offer, `registerNowReturnScreen`, `isNonLoggedUser`, `faqsFromNonLogin`; reset actions. Tests per slice.
  **Maps**: FR-013, FR-015, FR-019 · **Accept**: reset actions restore initial state; FAQ cache survives offers reset. · **Story**: BHFL-001

**Checkpoint**: tokens, assets, config, HTTP client, navigation and stores ready.

## Phase 2: User Story 1 — Land on Home and reach Login (P1) MVP

- [ ] T010 [US1] Add `components/QuickLinkTile.tsx` and `components/LoginButton.tsx` (SVG gradient pill, white Rubik Medium 14, role button, label, ≥44 x 44, pressed feedback, icon hidden from SR). Tests: render, press, a11y props.
  **Maps**: FR-002, FR-003, FR-005 · **Accept**: matches Figma sizes; never disabled. · **Story**: BHFL-001
- [ ] T011 [US1] Add `NonLoggedHomeScreen.tsx` and `hooks/useTextScaleLayout.ts`: ScrollView on `#035795` token, illustration, 3-line headline, 3 + 3 grid (Track Application tile 108 high), stacked column at font scale ≥ 1.5, content centred in a column of at most 360 wide on wide screens, Login at bottom, no loader, no Register Now/chatbot/accessibility icon. Tests: structure, order, no-loader with pending calls, no-network render, stacked mode.
  **Maps**: FR-001, FR-002, FR-004, FR-005, FR-020 · **Accept**: default look equals Figma; page scrolls; Login reachable at 320 x 568. · **Story**: BHFL-001
- [ ] T012 [US1] Wire handlers in the screen: Login → `cta_clicked` + `LoginScreen`; tiles → `quick_link_clicked` first, then guarded navigate (Products, Offers, Track Application stub, Pay Now via T013, FAQs via T021, Contact Us via T030). Tests: each tile's destination and analytics payload; rapid taps open once.
  **Maps**: FR-006, FR-007, FR-009 · **Accept**: analytics before navigation; one destination per burst of taps. · **Story**: BHFL-001
- [ ] T013 [US1] Pay Now hand-off: navigate to `PayNowWebView` (stub screen shows header "Pay Now" with back arrow; failure state with Back is the later WebView module, O-05) with title "Pay Now", loader off, URL from `env.PORTAL_BASE_URL + '/#/payments/paynow'`; missing URL handled without throw; return lands on Home. Tests with mocked env.
  **Maps**: FR-008 · **Accept**: params correct; no crash on missing URL. · **Story**: BHFL-001

## Phase 3: User Story 2 — Token and FAQ flow (P1)

- [ ] T020 [US2] Add `hooks/useNonLoggedToken.ts`: request the token once on Home mount (plus the app-start call), never block drawing, swallow errors. Tests: render with pending call, rejection silent, no extra calls.
  **Maps**: FR-010, FR-020 · **Accept**: exactly the defined start + mount calls. · **Story**: BHFL-001
- [ ] T021 [US2] Add `services/faqService.ts`, `hooks/useFaqFlow.ts`, `components/LoadingOverlay.tsx`, `components/CommonMessageDialog.tsx`: cache-first, in-flight guard, `faqsFromNonLogin = true`, array check, error dialog with exact text + "Okay", `dialog_shown`, announce to SR, spinner cleared in `finally`. Tests: cache hit, success, empty, non-array, 500, network loss, double tap, retry.
  **Maps**: FR-013, FR-014 · **Accept**: matches BRD 4.5 states; FAQ back returns to Home. · **Story**: BHFL-001

## Phase 4: User Story 3 — Version gate (P1)

- [ ] T040 [US3] Add `services/versionService.ts` + pure `classifyVersion`: POST `{version, user_agent}` (`Android`/`iOS`), numeric part-by-part compare, `status === 'Active'` rule, outcomes none/maintenance/mandatory/optional/sessionExpired/error, fail open on null/failure/empty. Tests for each outcome and 1.8.10 vs 1.8.9.
  **Maps**: FR-016 · **Accept**: never throws; never blocks. · **Story**: BHFL-001
- [ ] T041 [US3] Add `hooks/useVersionGate.ts` and `components/VersionDialog.tsx`: once per Home mount; maintenance/mandatory non-dismissable (Android back blocked), Exit Android-only, Update opens `target_url` via `Linking`, optional dismissable, 401 shows message then logout action. Tests with `Platform`, `BackHandler`, `Linking` mocked.
  **Maps**: FR-016, FR-017 · **Accept**: iOS shows no Exit; optional dialog has exactly Update and Skip (O-07). · **Story**: BHFL-001

## Phase 5: User Story 4 — Contact Us popup (P2)

- [ ] T030 [US4] Add `components/CustomerCarePopup.tsx`: modal (`accessibilityViewIsModal`), heading + three rows from constants, close control, height cap (window − insets − 64) with inner scroll, single instance, sets non-login flag and `contact_us_clicked`, focus returns to tile on close. Row taps (O-06): Call → `Linking.openURL(tel:…)`, Email → `Linking.openURL(mailto:…)`, Find Us → guarded navigate to `BranchLocator` stub; open failures caught. Tests: content, close, cap, single instance, each row action with `Linking`/navigate mocked.
  **Maps**: FR-015 · **Accept**: popup is not a route; Home stays underneath. · **Story**: BHFL-001

## Phase 6: User Story 5 — Exit and reset (P2)

- [ ] T050 [US5] Add `hooks/useExitConfirm.ts` + `components/ExitConfirmDialog.tsx`: Android-only `BackHandler` interception while focused; popup/dialog open → close it first; CANCEL stays, Okay `exitApp`; subscription removed on blur/unmount. Tests with `BackHandler` mocked.
  **Maps**: FR-018 · **Accept**: second back after popup shows exit dialog. · **Story**: BHFL-001
- [ ] T051 [US5] Add `hooks/useFocusReset.ts`: on every focus reset offers, selected offer, `registerNowReturnScreen = null`; keep FAQ cache and token. Tests with a fake focus emitter.
  **Maps**: FR-019 · **Accept**: runs on each focus including returns from Offers/FAQ. · **Story**: BHFL-001

## Phase 7: Polish and Verification

- [ ] T090 [P] Accessibility tests for the screen (roles, labels, focus order, hidden icons, touch targets ≥ 44, modal popup, announced spinner/dialog, token-only colours scan for raw hex) and write steps for performance / memory manual checks in `manual-verification.json` notes.
  **Maps**: FR-003, FR-020, FR-021 · **Accept**: constitution III and G5 satisfied. · **Story**: BHFL-001
- [ ] T091 Run `npx tsc --noEmit`, `npm run lint`, `npm test` (human runs coverage command at hand-over); fix findings.
  **Maps**: FR-001..FR-022 · **Accept**: typecheck, lint, affected tests green. · **Story**: BHFL-001
- [ ] T092 Verify no literal strings or raw hex in components, no direct axios/fetch outside `httpClient`, no `Tags:`/`TESTS:` lines. Record results in the PR description with FR/TC ids.
  **Maps**: FR-021, FR-011 · **Accept**: grep checks clean. · **Story**: BHFL-001
- [ ] T095 Scope boundary: confirm no code or routes beyond stubs exist for out-of-scope modules (Splash, Products, FAQ screen, Branch Locator, Track Application, Chatbot, accessibility shortcut); list open items O-01…O-13 in the PR.
  **Maps**: FR-021 · **Accept**: no code beyond route stubs for modules outside the BRD. · **Story**: BHFL-001

## Dependencies & Execution Order

T-ENV → T001, T003, T006, T008 (parallel) → T002 → T004 → T005 → T007 → T010 → T011 → T012/T013 → T020 → T021 → T040 → T041 → T030 → T050 → T051 → T090 → T091 → T092 → T095. T030 is needed by T012's Contact Us handler (stub until T030 lands).

## TC → Task coverage

Counts: 71 QA cases (Sheet2, module "Non-Logged Home Screen") · 65 unit-testable · 6 manual. Sheet1 of the workbook (202 cases, other modules) is excluded by owner decision.

| TC (id + short description) | Task(s) | Test approach | Story |
|---|---|---|---|
| HOME_LAYOUT_TC_001 - Home screen shows illustration, headline, six tiles and Login button. | T002, T010, T011 | unit-testable — render test of screen against Figma structure, real exported assets resolve | BHFL-001 |
| HOME_LAYOUT_TC_002 - tile labels and order. | T003, T011 | unit-testable — label/order assertion | BHFL-001 |
| HOME_LAYOUT_TC_003 - Home screen loads without waiting for background calls. | T011, T020 | unit-testable — render with pending mocked calls, no loader | BHFL-001 |
| HOME_ACTION_TC_001 - Pay Now action opens the payment portal. | T012, T013 | unit-testable — navigate mock, PayNow route params | BHFL-001 |
| HOME_ACTION_TC_002 - Our Products action routes to Products. | T012 | unit-testable — navigate mock | BHFL-001 |
| HOME_ACTION_TC_003 - Track Application action routes to its destination. | T012 | unit-testable — navigate mock; destination TBC (O-03) so route stub only | BHFL-001 |
| HOME_ACTION_TC_004 - FAQs action opens FAQ screen. | T012, T021 | unit-testable — FAQ flow with mocked service | BHFL-001 |
| HOME_ACTION_TC_005 - Offers action routes to non-logged Offers. | T012 | unit-testable — navigate mock | BHFL-001 |
| HOME_ACTION_TC_006 - Contact Us action opens the Customer Care popup. | T012, T030 | unit-testable — popup visibility state | BHFL-001 |
| HOME_ACTION_TC_007 - Login button routes to Login screen. | T012 | unit-testable — navigate mock | BHFL-001 |
| HOME_ACTION_TC_008 - FAQ action fetches content when cache is not available. | T021 | unit-testable — mocked faqService, spinner state | BHFL-001 |
| HOME_ACTION_TC_009 - FAQ action uses cached content when available. | T021 | unit-testable — cache hit, service not called | BHFL-001 |
| HOME_ACTION_TC_010 - user returns to Home after closing the Pay Now WebView. | T013 | unit-testable — back navigation mock to Home | BHFL-001 |
| HOME_NEG_TC_001 - FAQ API failure with no cache shows error. | T021 | unit-testable — mocked 500, exact error message | BHFL-001 |
| HOME_NEG_TC_002 - Pay Now URL unavailable is handled. | T013 | unit-testable — missing URL config handled, no throw | BHFL-001 |
| HOME_STATE_TC_001 - stale session flags are reset on Home entry. | T051 | unit-testable — focus reset invoked on entry | BHFL-001 |
| HOME_STATE_TC_002 - Home works when non-logged token generation succeeds. | T020, T012 | unit-testable — token success mock, tiles enabled | BHFL-001 |
| HOME_STATE_TC_003 - token generation failure is handled silently. | T020 | unit-testable — token rejection swallowed, no dialog | BHFL-001 |
| HOME_VER_TC_001 - no dialog when app version is up to date. | T040, T041 | unit-testable — versionService mock equal version | BHFL-001 |
| HOME_VER_TC_002 - maintenance dialog is shown. | T040, T041 | unit-testable — maintenance_flag Y, Exit Android only | BHFL-001 |
| HOME_VER_TC_003 - mandatory update dialog. | T040, T041 | unit-testable — mandatory classification and dialog buttons | BHFL-001 |
| HOME_VER_TC_004 - Update button opens the store link. | T041 | unit-testable — Linking.openURL mock with target_url | BHFL-001 |
| HOME_VER_TC_005 - optional update dialog can be dismissed. | T040, T041 | unit-testable — optional dialog dismissable | BHFL-001 |
| HOME_VER_TC_006 - update is not enforced when status is not Active. | T040 | unit-testable — status not Active, no enforcement | BHFL-001 |
| HOME_VER_TC_007 - version 1.8.10 is treated newer than 1.8.9. | T040 | unit-testable — numeric compare 1.8.10 vs 1.8.9 | BHFL-001 |
| HOME_VER_TC_008 - 401 from version service shows message and logs out. | T040, T041 | unit-testable — returnCode 401, Okay triggers logout mock | BHFL-001 |
| HOME_VER_TC_009 - version call failure or empty body fails open. | T040 | unit-testable — null/failed call fails open | BHFL-001 |
| HOME_VER_TC_010 - version request sends capitalised platform value. | T040 | unit-testable — request payload user_agent capitalised | BHFL-001 |
| HOME_VER_TC_011 - iOS has no Exit button on blocking dialogs. | T041 | unit-testable — Platform.OS mock ios, no Exit | BHFL-001 |
| HOME_VER_TC_012 - blocking dialog cannot be dismissed by Android back. | T041 | unit-testable — BackHandler mock, dialog stays | BHFL-001 |
| HOME_BACK_TC_001 - exit confirmation shows on Android back. | T050 | unit-testable — BackHandler mock, dialog text | BHFL-001 |
| HOME_BACK_TC_002 - Okay on exit dialog closes the app. | T050 | unit-testable — Okay calls BackHandler.exitApp mock | BHFL-001 |
| HOME_BACK_TC_003 - CANCEL on exit dialog keeps user on Home. | T050 | unit-testable — CANCEL closes dialog | BHFL-001 |
| HOME_BACK_TC_004 - back closes Contact Us popup before exit dialog. | T030, T050 | unit-testable — popup open, first back closes popup only | BHFL-001 |
| HOME_BACK_TC_005 - FAQ back returns to Home. | T021 | unit-testable — faqsFromNonLogin flag and back target | BHFL-001 |
| HOME_RESET_TC_001 - offers form data is cleared on return to Home. | T008, T051 | unit-testable — offersStore reset on focus | BHFL-001 |
| HOME_RESET_TC_002 - selected pre-approved offer is cleared on return to Home. | T008, T051 | unit-testable — selected offer cleared on focus | BHFL-001 |
| HOME_RESET_TC_003 - register return flag is cleared on return to Home. | T008, T051 | unit-testable — registerNowReturnScreen null on focus | BHFL-001 |
| HOME_RESET_TC_004 - Offers fail screen Ok returns to Home with reset state. | T051 | unit-testable — focus event after Offers fail Ok | BHFL-001 |
| HOME_RESET_TC_005 - focus reset does not clear FAQ cache or token. | T051 | unit-testable — faq cache and token untouched by reset | BHFL-001 |
| HOME_CONTACT_TC_001 - popup heading and three rows. | T030 | unit-testable — popup heading and three rows from constants | BHFL-001 |
| HOME_CONTACT_TC_002 - popup closes with its close control. | T030 | unit-testable — close control hides popup | BHFL-001 |
| HOME_CONTACT_TC_003 - focus returns to Contact Us tile after closing popup. | T030 | manual — needs screen reader / device to verify focus return to tile | BHFL-001 |
| HOME_CONTACT_TC_004 - popup scrolls at large text sizes. | T030 | unit-testable — maxHeight capped, scrollable content | BHFL-001 |
| HOME_CONTACT_TC_005 - Call, Email and Find Us tap behaviour. | T030 | unit-testable — Linking and navigate mocked for Call, Email, Find Us (O-06 resolved) | BHFL-001 |
| HOME_CONTACT_TC_006 - popup opens only once on rapid taps. | T030, T012 | unit-testable — rapid taps open one popup | BHFL-001 |
| HOME_TOKEN_TC_001 - Bearer token is sent on FAQ request. | T004, T021 | unit-testable — request headers include Bearer, app-version, platform, device-details | BHFL-001 |
| HOME_TOKEN_TC_002 - token request times out after 10 seconds. | T005 | unit-testable — fake timers, timeout 10 s | BHFL-001 |
| HOME_TOKEN_TC_003 - early FAQ tap waits for in-flight token. | T004, T005 | unit-testable — request awaits shared token promise | BHFL-001 |
| HOME_TOKEN_TC_004 - relaunch after 15 minutes uses a fresh non-logged token. | T005 | unit-testable — logged-in token memory-only, fresh non-logged token requested | BHFL-001 |
| HOME_TOKEN_TC_005 - FAQ shows error after token failure. | T005, T021 | unit-testable — token failure then FAQ failure dialog | BHFL-001 |
| HOME_TOKEN_TC_006 - token request body fields are encrypted. | T005 | unit-testable — encrypt seam called, no credential logging | BHFL-001 |
| HOME_TOKEN_TC_007 - token is stored after success. | T005 | unit-testable — store plus secure-storage seam key auth_token_Nonlogged | BHFL-001 |
| HOME_FAQ_TC_001 - empty FAQ list keeps user on Home with no dialog. | T021 | unit-testable — empty array, no dialog | BHFL-001 |
| HOME_FAQ_TC_002 - non-array FAQ response does not crash. | T021 | unit-testable — non-array treated empty | BHFL-001 |
| HOME_FAQ_TC_003 - double tap on FAQs sends one request. | T021 | unit-testable — in-flight guard, one request | BHFL-001 |
| HOME_FAQ_TC_004 - spinner blocks other touches while FAQ loads. | T021 | unit-testable — overlay rendered while loading | BHFL-001 |
| HOME_FAQ_TC_005 - retry after FAQ failure succeeds. | T021 | unit-testable — fail then succeed | BHFL-001 |
| HOME_FAQ_TC_006 - Okay on FAQ error dialog keeps user on Home. | T021 | unit-testable — Okay closes error dialog | BHFL-001 |
| HOME_FAQ_TC_007 - spinner always clears on FAQ failure or timeout. | T021 | unit-testable — spinner cleared in finally | BHFL-001 |
| HOME_NET_TC_001 - Home renders with no network. | T011, T020 | unit-testable — render with network calls rejected | BHFL-001 |
| HOME_NET_TC_002 - FAQs with no network shows error. | T021 | unit-testable — network error mock, dialog and spinner clear | BHFL-001 |
| HOME_NET_TC_003 - Pay Now with no network shows WebView error. | T013 | manual — WebView error state belongs to shared WebView module; only route hand-off here | BHFL-001 |
| HOME_NET_TC_004 - network lost mid FAQ fetch. | T021 | unit-testable — request rejects mid-flight | BHFL-001 |
| HOME_NET_TC_005 - rapid taps on different tiles open one destination. | T007, T012 | unit-testable — navigation guard, single destination | BHFL-001 |
| HOME_NET_TC_006 - rapid taps on the same tile do not duplicate screens. | T007, T012 | unit-testable — duplicate push guard for same tile | BHFL-001 |
| HOME_NET_TC_007 - layout on small screen 320 x 568. | T011 | manual — visual check on 320x568 device/emulator (ScrollView reachability unit-checked in T011) | BHFL-001 |
| HOME_NET_TC_008 - layout on tablet or wide screen. | T011 | unit-testable — style assertion: centred, maxWidth 360, tiles not stretched (O-13 resolved) | BHFL-001 |
| HOME_NET_TC_009 - cold start time to interactive. | T090 | manual — device performance measurement, target 2 s after splash on a mid-range device (PERF-1) | BHFL-001 |
| HOME_NET_TC_010 - no memory growth when opening and closing tiles repeatedly. | T090 | manual — memory profiling on device | BHFL-001 |
| HOME_NET_TC_011 - Android and iOS parity. | T011, T050 | manual — needs both platforms side by side | BHFL-001 |
