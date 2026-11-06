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
- [ ] T004 Add `src/config/env.ts` (typed build config) and `src/services/httpClient.ts` (axios instance: Bearer injection when no Authorization, `app-version`/`platform`/`device-details` headers, timeouts, waits for in-flight token promise, typed responses, malformed → empty) plus `deviceInfo.ts` seam. Tests with axios mocked.
  **Maps**: FR-011 · **Accept**: headers present; request waits for token; no feature uses axios directly. · **Story**: BHFL-001
- [ ] T005 Add `src/services/authService.ts` (generatetoken, 10 s timeout, `body.token` non-empty check, shared promise), `encryption.ts` and `secureStorage.ts` seams, `src/store/tokenSlice.ts` (memory token + mirror to key `auth_token_Nonlogged`; logged-in token memory-only and never used as non-logged). Tests with fake timers and fakes.
  **Maps**: FR-010, FR-012 · **Accept**: timeout aborts at 10 s silently; creds encrypted and never logged; stale logged-in token not used. · **Story**: BHFL-001
- [ ] T006 [P] Add `src/services/analytics.ts` wrapper with typed events `quick_link_clicked`, `contact_us_clicked`, `cta_clicked`, `dialog_shown`. Test: payload shapes, no personal data.
  **Maps**: FR-006, FR-007, FR-014, FR-015 · **Accept**: event names/properties per BRD 4.2.9, 4.3.9. · **Story**: BHFL-001
- [ ] T007 Add `src/navigation/{routes.ts,RootNavigator.tsx,useGuardedNavigate.ts}` and route stubs (`LoginScreen`, `Products`, `Offers`, `Faq`, `PayNowWebView`, `TrackApplication`), wire `App.tsx` (SafeAreaProvider, Redux Provider, light status bar) and update `__tests__/App.test.tsx` to the new root. `useGuardedNavigate` ignores re-entry while a navigation is in progress; explicit back targets.
  **Maps**: FR-009 · **Accept**: rapid taps open one destination; Home is initial route; old template test replaced, not skipped. · **Story**: BHFL-001
- [ ] T008 [P] Add `src/store/{index.ts,faqSlice.ts,offersSlice.ts,sessionFlagsSlice.ts}`: FAQ cache (list, loading), offers (fullName, mobileNo, tncAccepted), selected offer, `registerNowReturnScreen`, `isNonLoggedUser`, `faqsFromNonLogin`; reset actions. Tests per slice.
  **Maps**: FR-013, FR-015, FR-019 · **Accept**: reset actions restore initial state; FAQ cache survives offers reset. · **Story**: BHFL-001

**Checkpoint**: tokens, assets, config, HTTP client, navigation and stores ready.

## Phase 2: User Story 1 — Land on Home and reach Login (P1) MVP

- [ ] T010 [US1] Add `components/QuickLinkTile.tsx` and `components/LoginButton.tsx` (SVG gradient pill, white Rubik Medium 14, role button, label, ≥44 x 44, pressed feedback, icon hidden from SR). Tests: render, press, a11y props.
  **Maps**: FR-002, FR-003, FR-005 · **Accept**: matches Figma sizes; never disabled. · **Story**: BHFL-001
- [ ] T011 [US1] Add `NonLoggedHomeScreen.tsx` and `hooks/useTextScaleLayout.ts`: ScrollView on `#035795` token, illustration, 3-line headline, 3 + 3 grid (Track Application tile 108 high), stacked column at font scale ≥ 1.5, Login at bottom, no loader, no Register Now/chatbot/accessibility icon. Tests: structure, order, no-loader with pending calls, no-network render, stacked mode.
  **Maps**: FR-001, FR-002, FR-004, FR-005, FR-020 · **Accept**: default look equals Figma; page scrolls; Login reachable at 320 x 568. · **Story**: BHFL-001
- [ ] T012 [US1] Wire handlers in the screen: Login → `cta_clicked` + `LoginScreen`; tiles → `quick_link_clicked` first, then guarded navigate (Products, Offers, Track Application stub, Pay Now via T013, FAQs via T021, Contact Us via T030). Tests: each tile's destination and analytics payload; rapid taps open once.
  **Maps**: FR-006, FR-007, FR-009 · **Accept**: analytics before navigation; one destination per burst of taps. · **Story**: BHFL-001
- [ ] T013 [US1] Pay Now hand-off: navigate to `PayNowWebView` with title "Pay Now", loader off, URL from `env.PORTAL_BASE_URL + '/#/payments/paynow'`; missing URL handled without throw; return lands on Home. Tests with mocked env.
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
  **Maps**: FR-016, FR-017 · **Accept**: iOS shows no Exit; optional button set left per O-07. · **Story**: BHFL-001

## Phase 5: User Story 4 — Contact Us popup (P2)

- [ ] T030 [US4] Add `components/CustomerCarePopup.tsx`: modal (`accessibilityViewIsModal`), heading + three rows from constants, close control, height cap (window − insets − 64) with inner scroll, single instance, sets non-login flag and `contact_us_clicked`, focus returns to tile on close. Row taps: no behaviour (O-06). Tests: content, close, cap, single instance.
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
  **Maps**: FR-900 · **Accept**: out-of-scope TCs remain unassigned to code. · **Story**: BHFL-001

## Dependencies & Execution Order

T-ENV → T001, T003, T006, T008 (parallel) → T002 → T004 → T005 → T007 → T010 → T011 → T012/T013 → T020 → T021 → T040 → T041 → T030 → T050 → T051 → T090 → T091 → T092 → T095. T030 is needed by T012's Contact Us handler (stub until T030 lands).

## TC → Task coverage

Counts: 273 QA cases · 83 unit-testable · 10 manual · 180 out-of-scope (other modules, or conflicting with BRD; see spec Scope Note and FR-900).

| TC (id + short description) | Task(s) | Test approach | Story |
|---|---|---|---|
| SPL_CONSENTCHECKBOX_TC_001 (Splash & Consent Screen) - Consent checkbox accepts valid input in splash consent flow. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| SPL_CONSENTCHECKBOX_TC_002 (Splash & Consent Screen) - mandatory validation when Consent checkbox is blank in splash consent flow. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| SPL_CONSENTCHECKBOX_TC_003 (Splash & Consent Screen) - invalid value is not accepted for Consent checkbox in splash consent flow. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| SPL_BIOMETRICTOGGLE_TC_001 (Splash & Consent Screen) - Biometric toggle accepts valid input in splash consent flow. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| SPL_BIOMETRICTOGGLE_TC_002 (Splash & Consent Screen) - mandatory validation when Biometric toggle is blank in splash consent flow. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| SPL_PRIVACYPOLICYLINK_TC_001 (Splash & Consent Screen) - Privacy Policy link accepts valid input in splash consent flow. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| SPL_PRIVACYPOLICYLINK_TC_002 (Splash & Consent Screen) - mandatory validation when Privacy Policy link is blank in splash consent flow. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| SPL_TERMSOFUSELINK_TC_001 (Splash & Consent Screen) - Terms of Use link accepts valid input in splash consent flow. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| SPL_TERMSOFUSELINK_TC_002 (Splash & Consent Screen) - mandatory validation when Terms of Use link is blank in splash consent flow. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| SPL_FLOW_TC_001 (Splash & Consent Screen) - splash screen routes to non-logged home after valid consent. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| SPL_FLOW_TC_002 (Splash & Consent Screen) - user remains blocked without accepting consent. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| SPL_FLOW_TC_003 (Splash & Consent Screen) - mandatory force update popup blocks app usage. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| SPL_FLOW_TC_004 (Splash & Consent Screen) - optional update popup allows skip/continue if configured. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| SPL_FLOW_TC_005 (Splash & Consent Screen) - notification permission request appears on first launch. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| SPL_FLOW_TC_006 (Splash & Consent Screen) - server error during launch checks is handled. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| SPL_FLOW_TC_007 (Splash & Consent Screen) - biometric preference persists after toggle change. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| SPL_FLOW_TC_008 (Splash & Consent Screen) - Privacy Policy URL failure does not crash app. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| SPL_FLOW_TC_009 (Splash & Consent Screen) - Terms of Use URL failure does not crash app. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| SPL_FLOW_TC_010 (Splash & Consent Screen) - back/exit behavior on splash screen. | T095 | out-of-scope — Splash/Consent module has its own BRD/spec | BHFL-001 |
| Sheet1 / HOME_ACTION_TC_001 (Non-Logged Home Dashboard) - Pay Now action routes/opens correct destination. | T012, T013 | unit-testable — navigate mock | BHFL-001 |
| Sheet1 / HOME_ACTION_TC_002 (Non-Logged Home Dashboard) - Our Products action routes/opens correct destination. | T012 | unit-testable — navigate mock | BHFL-001 |
| Sheet1 / HOME_ACTION_TC_003 (Non-Logged Home Dashboard) - Track Application action routes/opens correct destination. | T012 | unit-testable — navigate mock; destination TBC (O-03) | BHFL-001 |
| Sheet1 / HOME_ACTION_TC_004 (Non-Logged Home Dashboard) - FAQs action routes/opens correct destination. | T012, T021 | unit-testable — FAQ flow with mocked service | BHFL-001 |
| Sheet1 / HOME_ACTION_TC_005 (Non-Logged Home Dashboard) - Offers action routes/opens correct destination. | T012 | unit-testable — navigate mock | BHFL-001 |
| Sheet1 / HOME_ACTION_TC_006 (Non-Logged Home Dashboard) - Contact Us action routes/opens correct destination. | T012, T030 | unit-testable — popup visibility state | BHFL-001 |
| Sheet1 / HOME_ACTION_TC_007 (Non-Logged Home Dashboard) - Register / Login action routes/opens correct destination. | T012 | unit-testable — Login navigate mock; no Register Now per BRD O-01 | BHFL-001 |
| Sheet1 / HOME_ACTION_TC_008 (Non-Logged Home Dashboard) - Chatbot action routes/opens correct destination. | T095 | out-of-scope — Chatbot not on this page (BRD O-02, TC-108) | BHFL-001 |
| Sheet1 / HOME_ACTION_TC_009 (Non-Logged Home Dashboard) - Branch Locator action routes/opens correct destination. | T095 | out-of-scope — Branch Locator tile not on this page; FAQs tile per Figma (BRD 4.2.3) | BHFL-001 |
| Sheet1 / HOME_ACTION_TC_010 (Non-Logged Home Dashboard) - FAQ action fetches content when cache is not available. | T021 | unit-testable — mocked faqService, spinner state | BHFL-001 |
| HOME_ACTION_TC_011 (Non-Logged Home Dashboard) - FAQ action uses cached content when available. | T021 | unit-testable — cache hit, service not called | BHFL-001 |
| Sheet1 / HOME_NEG_TC_001 (Non-Logged Home Dashboard) - FAQ API failure with no cache shows error. | T021 | unit-testable — mocked 500, exact BRD message | BHFL-001 |
| Sheet1 / HOME_NEG_TC_002 (Non-Logged Home Dashboard) - external Pay Now URL unavailable handling. | T013 | unit-testable — missing URL config handled | BHFL-001 |
| HOME_NEG_TC_003 (Non-Logged Home Dashboard) - chatbot URL unavailable handling. | T095 | out-of-scope — Chatbot not on this page (BRD O-02) | BHFL-001 |
| Sheet1 / HOME_STATE_TC_001 (Non-Logged Home Dashboard) - stale logged-in/session flags are reset on home entry. | T051 | unit-testable — focus reset invoked on entry | BHFL-001 |
| Sheet1 / HOME_STATE_TC_002 (Non-Logged Home Dashboard) - home loads when non-logged token generation succeeds. | T020, T012 | unit-testable — token success mock, tiles enabled | BHFL-001 |
| Sheet1 / HOME_STATE_TC_003 (Non-Logged Home Dashboard) - token generation failure is handled. | T020 | unit-testable — token failure silent per BRD NLH-E01; sheet text "common popup" conflicts, BRD wins | BHFL-001 |
| HOME_UI_SKIP_TC_001 (Non-Logged Home Dashboard) - user can return to home after external browser close. | T013 | manual — external browser round trip needs a device | BHFL-001 |
| PROD_REDIRECT_TC_001 (Our Products) - Home Loan product card opens mapped external URL. | T095 | out-of-scope — Products module has its own BRD/spec | BHFL-001 |
| PROD_REDIRECT_TC_002 (Our Products) - Home Loan handles missing URL configuration. | T095 | out-of-scope — Products module has its own BRD/spec | BHFL-001 |
| PROD_REDIRECT_TC_003 (Our Products) - Loan Against Property product card opens mapped external URL. | T095 | out-of-scope — Products module has its own BRD/spec | BHFL-001 |
| PROD_REDIRECT_TC_004 (Our Products) - Loan Against Property handles missing URL configuration. | T095 | out-of-scope — Products module has its own BRD/spec | BHFL-001 |
| PROD_REDIRECT_TC_005 (Our Products) - Home Loan Balance Transfer product card opens mapped external URL. | T095 | out-of-scope — Products module has its own BRD/spec | BHFL-001 |
| PROD_REDIRECT_TC_006 (Our Products) - Home Loan Balance Transfer handles missing URL configuration. | T095 | out-of-scope — Products module has its own BRD/spec | BHFL-001 |
| PROD_REDIRECT_TC_007 (Our Products) - Top-up Loan product card opens mapped external URL. | T095 | out-of-scope — Products module has its own BRD/spec | BHFL-001 |
| PROD_REDIRECT_TC_008 (Our Products) - Top-up Loan handles missing URL configuration. | T095 | out-of-scope — Products module has its own BRD/spec | BHFL-001 |
| PROD_NAV_TC_001 (Our Products) - back navigation from Our Products screen. | T095 | out-of-scope — Products module has its own BRD/spec | BHFL-001 |
| PROD_NAV_TC_002 (Our Products) - rapid tapping product card does not open duplicate browsers. | T095 | out-of-scope — Products module has its own BRD/spec | BHFL-001 |
| PROD_NAV_TC_003 (Our Products) - product page external browser close returns to app. | T095 | out-of-scope — Products module has its own BRD/spec | BHFL-001 |
| FAQ_FUNC_TC_001 (FAQ) - FAQ list displays questions and answers from API. | T095 | out-of-scope — FAQ module has its own BRD/spec | BHFL-001 |
| FAQ_FUNC_TC_002 (FAQ) - FAQ answer expands when user taps question. | T095 | out-of-scope — FAQ module has its own BRD/spec | BHFL-001 |
| FAQ_FUNC_TC_003 (FAQ) - FAQ answer collapses when user taps expanded question again. | T095 | out-of-scope — FAQ module has its own BRD/spec | BHFL-001 |
| FAQ_FUNC_TC_004 (FAQ) - HTML content in FAQ answer renders correctly. | T095 | out-of-scope — FAQ module has its own BRD/spec | BHFL-001 |
| FAQ_FUNC_TC_005 (FAQ) - FAQ screen handles empty response array. | T095 | out-of-scope — FAQ module has its own BRD/spec | BHFL-001 |
| FAQ_FUNC_TC_006 (FAQ) - FAQ API failure uses cache when available. | T095 | out-of-scope — FAQ module has its own BRD/spec | BHFL-001 |
| FAQ_FUNC_TC_007 (FAQ) - FAQ API failure with no cache shows error. | T095 | out-of-scope — FAQ module has its own BRD/spec | BHFL-001 |
| FAQ_FUNC_TC_008 (FAQ) - FAQ route revisit refreshes data. | T095 | out-of-scope — FAQ module has its own BRD/spec | BHFL-001 |
| FAQ_FUNC_TC_009 (FAQ) - long FAQ question text wraps properly. | T095 | out-of-scope — FAQ module has its own BRD/spec | BHFL-001 |
| FAQ_FUNC_TC_010 (FAQ) - long FAQ answer text is scrollable/readable. | T095 | out-of-scope — FAQ module has its own BRD/spec | BHFL-001 |
| FAQ_FUNC_TC_011 (FAQ) - invalid FAQ response structure is normalized safely. | T095 | out-of-scope — FAQ module has its own BRD/spec | BHFL-001 |
| FAQ_FUNC_TC_012 (FAQ) - back navigation from FAQ. | T095 | out-of-scope — FAQ module has its own BRD/spec | BHFL-001 |
| FAQ_FUNC_TC_013 (FAQ) - FAQ list remains stable during rapid expand/collapse. | T095 | out-of-scope — FAQ module has its own BRD/spec | BHFL-001 |
| FAQ_FUNC_TC_014 (FAQ) - loader appears during FAQ fetch. | T095 | out-of-scope — FAQ module has its own BRD/spec | BHFL-001 |
| FAQ_FUNC_TC_015 (FAQ) - FAQ content does not call track application API. | T095 | out-of-scope — FAQ module has its own BRD/spec | BHFL-001 |
| FAQ_FUNC_TC_016 (FAQ) - FAQ accessibility content is readable by screen reader labels where applicable. | T095 | out-of-scope — FAQ module has its own BRD/spec | BHFL-001 |
| FAQ_FUNC_TC_017 (FAQ) - FAQ offline/network error handling. | T095 | out-of-scope — FAQ module has its own BRD/spec | BHFL-001 |
| FAQ_FUNC_TC_018 (FAQ) - FAQ data does not persist incorrectly after logout/session reset. | T095 | out-of-scope — FAQ module has its own BRD/spec | BHFL-001 |
| BL_SEARCHLOCATION_TC_001 (Branch Locator) - Search Location accepts valid input in branch locator. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_SEARCHLOCATION_TC_002 (Branch Locator) - mandatory validation when Search Location is blank in branch locator. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_SEARCHLOCATION_TC_003 (Branch Locator) - invalid value is not accepted for Search Location in branch locator. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_SEARCHLOCATION_TC_004 (Branch Locator) - invalid value is not accepted for Search Location in branch locator. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_SEARCHLOCATION_TC_005 (Branch Locator) - invalid value is not accepted for Search Location in branch locator. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_FUNC_TC_001 (Branch Locator) - branch list loads successfully from API. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_FUNC_TC_002 (Branch Locator) - branch API failure shows popup. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_FUNC_TC_003 (Branch Locator) - search filters by branch name. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_FUNC_TC_004 (Branch Locator) - search filters by city. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_FUNC_TC_005 (Branch Locator) - search filters by state. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_FUNC_TC_006 (Branch Locator) - search filters by address keyword. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_FUNC_TC_007 (Branch Locator) - search is case insensitive. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_FUNC_TC_008 (Branch Locator) - special characters are sanitized from search input. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_FUNC_TC_009 (Branch Locator) - no-result message is shown for unmatched keyword. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_FUNC_TC_010 (Branch Locator) - Directions opens Google Maps with valid coordinates. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_FUNC_TC_011 (Branch Locator) - Directions handles missing coordinates. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_FUNC_TC_012 (Branch Locator) - branch card displays complete address. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_FUNC_TC_013 (Branch Locator) - debounce prevents filtering on every keystroke immediately. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_FUNC_TC_014 (Branch Locator) - blank search shows full branch list. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_FUNC_TC_015 (Branch Locator) - long search input does not crash screen. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| BL_FUNC_TC_016 (Branch Locator) - back navigation from Branch Locator. | T095 | out-of-scope — Branch Locator module has its own BRD/spec | BHFL-001 |
| TA_ID_MOBILENUMBER_TC_001 (Track Application - Identifier Entry) - Mobile Number accepts valid input in track application identifier step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_MOBILENUMBER_TC_002 (Track Application - Identifier Entry) - mandatory validation when Mobile Number is blank in track application identifier step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_MOBILENUMBER_TC_003 (Track Application - Identifier Entry) - invalid value is not accepted for Mobile Number in track application identifier step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_MOBILENUMBER_TC_004 (Track Application - Identifier Entry) - invalid value is not accepted for Mobile Number in track application identifier step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_MOBILENUMBER_TC_005 (Track Application - Identifier Entry) - invalid value is not accepted for Mobile Number in track application identifier step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_MOBILENUMBER_TC_006 (Track Application - Identifier Entry) - invalid value is not accepted for Mobile Number in track application identifier step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_LOANREFERENCENUMBER_TC_001 (Track Application - Identifier Entry) - Loan Reference Number accepts valid input in track application identifier step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_LOANREFERENCENUMBER_TC_002 (Track Application - Identifier Entry) - mandatory validation when Loan Reference Number is blank in track application identifier step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_LOANREFERENCENUMBER_TC_003 (Track Application - Identifier Entry) - invalid value is not accepted for Loan Reference Number in track application identifier step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_LOANREFERENCENUMBER_TC_004 (Track Application - Identifier Entry) - invalid value is not accepted for Loan Reference Number in track application identifier step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_LOANREFERENCENUMBER_TC_005 (Track Application - Identifier Entry) - invalid value is not accepted for Loan Reference Number in track application identifier step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_FLOW_TC_001 (Track Application - Identifier Entry) - user can proceed with mobile number only. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_FLOW_TC_002 (Track Application - Identifier Entry) - user can proceed with loan reference only. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_FLOW_TC_003 (Track Application - Identifier Entry) - user can proceed with both mobile and loan reference. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_FLOW_TC_004 (Track Application - Identifier Entry) - at least one identifier validation when both fields blank. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_FLOW_TC_005 (Track Application - Identifier Entry) - invalid mobile blocks progression. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_FLOW_TC_006 (Track Application - Identifier Entry) - invalid LAN blocks progression. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_FLOW_TC_007 (Track Application - Identifier Entry) - OR logic clears other field error when one valid field is entered. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_FLOW_TC_008 (Track Application - Identifier Entry) - request object is seeded with blank PAN/DOB after first step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_FLOW_TC_009 (Track Application - Identifier Entry) - Next button disabled/enabled behavior for identifier form. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_FLOW_TC_010 (Track Application - Identifier Entry) - leading/trailing spaces in mobile are handled. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_FLOW_TC_011 (Track Application - Identifier Entry) - maximum LAN length boundary is enforced. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_ID_FLOW_TC_012 (Track Application - Identifier Entry) - back navigation from identifier step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_PANNUMBER_TC_001 (Track Application - PAN/DOB Verification) - PAN Number accepts valid input in PAN/DOB verification step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_PANNUMBER_TC_002 (Track Application - PAN/DOB Verification) - mandatory validation when PAN Number is blank in PAN/DOB verification step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_PANNUMBER_TC_003 (Track Application - PAN/DOB Verification) - invalid value is not accepted for PAN Number in PAN/DOB verification step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_PANNUMBER_TC_004 (Track Application - PAN/DOB Verification) - invalid value is not accepted for PAN Number in PAN/DOB verification step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_PANNUMBER_TC_005 (Track Application - PAN/DOB Verification) - invalid value is not accepted for PAN Number in PAN/DOB verification step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_PANNUMBER_TC_006 (Track Application - PAN/DOB Verification) - invalid value is not accepted for PAN Number in PAN/DOB verification step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_PANNUMBER_TC_007 (Track Application - PAN/DOB Verification) - invalid value is not accepted for PAN Number in PAN/DOB verification step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_DATEOFBIRTH_TC_001 (Track Application - PAN/DOB Verification) - Date of Birth accepts valid input in PAN/DOB verification step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_DATEOFBIRTH_TC_002 (Track Application - PAN/DOB Verification) - mandatory validation when Date of Birth is blank in PAN/DOB verification step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_DATEOFBIRTH_TC_003 (Track Application - PAN/DOB Verification) - invalid value is not accepted for Date of Birth in PAN/DOB verification step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_DATEOFBIRTH_TC_004 (Track Application - PAN/DOB Verification) - invalid value is not accepted for Date of Birth in PAN/DOB verification step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_DATEOFBIRTH_TC_005 (Track Application - PAN/DOB Verification) - invalid value is not accepted for Date of Birth in PAN/DOB verification step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_DATEOFBIRTH_TC_006 (Track Application - PAN/DOB Verification) - invalid value is not accepted for Date of Birth in PAN/DOB verification step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_FLOW_TC_001 (Track Application - PAN/DOB Verification) - PAN is converted to uppercase before API submission. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_FLOW_TC_002 (Track Application - PAN/DOB Verification) - valid PAN and DOB calls TrackApplication API. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_FLOW_TC_003 (Track Application - PAN/DOB Verification) - TrackApplication success with reportData navigates to details screen. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_FLOW_TC_004 (Track Application - PAN/DOB Verification) - TrackApplication empty reportData shows NoActiveLoans popup. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_FLOW_TC_005 (Track Application - PAN/DOB Verification) - TrackApplication API failure shows server popup. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_FLOW_TC_006 (Track Application - PAN/DOB Verification) - DOB picker max date restricts under-18 DOB. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_FLOW_TC_007 (Track Application - PAN/DOB Verification) - DOB formatted as MM-DD-YYYY in request. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_FLOW_TC_008 (Track Application - PAN/DOB Verification) - PAN max length of 10 characters is enforced. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_FLOW_TC_009 (Track Application - PAN/DOB Verification) - blank PAN and DOB blocks API call. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_FLOW_TC_010 (Track Application - PAN/DOB Verification) - previously entered identifier values are retained in final request. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_PD_FLOW_TC_011 (Track Application - PAN/DOB Verification) - back navigation from PAN/DOB step. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_001 (Track Application - Application Summary) - application cards display product name, status, LAN and amount. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_002 (Track Application - Application Summary) - approved/disbursed stage card shows Back to Home/Login action. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_003 (Track Application - Application Summary) - qdp done stage card shows Back to Home/Login action. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_004 (Track Application - Application Summary) - in-process stage card shows View Details action. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_005 (Track Application - Application Summary) - View Details stores selected row and opens status screen. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_006 (Track Application - Application Summary) - Back to Home/Login action routes correctly for type 0 card. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_007 (Track Application - Application Summary) - empty reportData is not rendered as blank broken UI. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_008 (Track Application - Application Summary) - multiple application cards are displayed. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_009 (Track Application - Application Summary) - amount formatting displays currency correctly. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_010 (Track Application - Application Summary) - rejected application status style is displayed. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_011 (Track Application - Application Summary) - approved application status style is displayed. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_012 (Track Application - Application Summary) - missing optional amount does not crash card. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_013 (Track Application - Application Summary) - missing LAN does not crash card. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_014 (Track Application - Application Summary) - long product name wraps properly. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_015 (Track Application - Application Summary) - trackBy LAN handles duplicate/blank LAN safely. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_016 (Track Application - Application Summary) - back navigation from application summary. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_017 (Track Application - Application Summary) - details action is not available for disbursed/qdp done records. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_018 (Track Application - Application Summary) - user can view status for rejected in-process record if type permits. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_019 (Track Application - Application Summary) - summary uses latest TrackApplication response. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_SUM_TC_020 (Track Application - Application Summary) - summary handles API response missing reportData key. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_TC_001 (Track Application - Application Status) - status timeline displays correct progression for stage Login. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_TC_002 (Track Application - Application Status) - status timeline displays correct progression for stage Financial Approval. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_TC_003 (Track Application - Application Status) - status timeline displays correct progression for stage Property Approval. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_TC_004 (Track Application - Application Status) - status timeline displays correct progression for stage Sent for Disbursal. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_TC_005 (Track Application - Application Status) - status timeline displays correct progression for stage Rejected. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_001 (Track Application - Application Status) - rejected stage shows rejected node only. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_002 (Track Application - Application Status) - financial details accordion opens and displays values. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_003 (Track Application - Application Status) - fees and charges accordion opens and displays fee breakup. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_004 (Track Application - Application Status) - customer_text message displays on status screen. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_005 (Track Application - Application Status) - missing customer_text is handled safely. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_006 (Track Application - Application Status) - fee array missing values does not crash screen. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_007 (Track Application - Application Status) - financial values format correctly. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_008 (Track Application - Application Status) - Home action routes to non-logged home. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_009 (Track Application - Application Status) - no selected application session data handling. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_010 (Track Application - Application Status) - stage string case variation is handled. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_011 (Track Application - Application Status) - unknown stage is handled safely. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_012 (Track Application - Application Status) - only applicable completed/pending labels display. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_013 (Track Application - Application Status) - details accordions collapse properly. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_014 (Track Application - Application Status) - long customer message wraps properly. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_015 (Track Application - Application Status) - rejected path hides financial approval timeline if not applicable. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_016 (Track Application - Application Status) - status screen back navigation. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_017 (Track Application - Application Status) - duplicate fee names display correctly. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_018 (Track Application - Application Status) - null numeric values display safely. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_019 (Track Application - Application Status) - very large amount values are formatted safely. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_020 (Track Application - Application Status) - status screen does not call TrackApplication API again. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| TA_STATUS_FUNC_TC_021 (Track Application - Application Status) - status screen preserves selected application after accordion actions. | T095 | out-of-scope — Track Application module has its own BRD/spec | BHFL-001 |
| NLMISC_TC_001 (Non-Logged Cross Module) - non-logged token generation occurs before protected non-logged APIs. | T004, T005 | unit-testable — token available before secured calls | BHFL-001 |
| NLMISC_TC_002 (Non-Logged Cross Module) - sensitive PAN/DOB values are not displayed on later screens unnecessarily. | T095 | out-of-scope — covered by another module spec (Cross-module, security and platform) | BHFL-001 |
| NLMISC_TC_003 (Non-Logged Cross Module) - network unavailable on branch locator shows graceful error. | T095 | out-of-scope — covered by another module spec (Cross-module, security and platform) | BHFL-001 |
| NLMISC_TC_004 (Non-Logged Cross Module) - network unavailable on track application submit shows graceful error. | T095 | out-of-scope — covered by another module spec (Cross-module, security and platform) | BHFL-001 |
| NLMISC_TC_005 (Non-Logged Cross Module) - app does not crash during rapid navigation between non-logged modules. | T007 | manual — cross-module rapid navigation, other modules not built here; Home guard unit-tested in T007 | BHFL-001 |
| NLMISC_TC_006 (Non-Logged Cross Module) - Android external browser opens product URL. | T095 | out-of-scope — covered by another module spec (Cross-module, security and platform) | BHFL-001 |
| NLMISC_TC_007 (Non-Logged Cross Module) - iOS external browser opens product URL. | T095 | out-of-scope — covered by another module spec (Cross-module, security and platform) | BHFL-001 |
| NLMISC_TC_008 (Non-Logged Cross Module) - Android BillDesk callback works. | T095 | out-of-scope — covered by another module spec (Cross-module, security and platform) | BHFL-001 |
| NLMISC_TC_009 (Non-Logged Cross Module) - iOS BillDesk callback works. | T095 | out-of-scope — covered by another module spec (Cross-module, security and platform) | BHFL-001 |
| NLMISC_TC_010 (Non-Logged Cross Module) - Android notification permission path does not block home navigation after consent. | T095 | out-of-scope — covered by another module spec (Cross-module, security and platform) | BHFL-001 |
| NLMISC_TC_011 (Non-Logged Cross Module) - iOS notification permission path does not block home navigation after consent. | T095 | out-of-scope — covered by another module spec (Cross-module, security and platform) | BHFL-001 |
| NLMISC_TC_012 (Non-Logged Cross Module) - FAQ load performance placeholder. | T095 | out-of-scope — covered by another module spec (Cross-module, security and platform) | BHFL-001 |
| NLMISC_TC_013 (Non-Logged Cross Module) - Branch Locator load performance placeholder. | T095 | out-of-scope — covered by another module spec (Cross-module, security and platform) | BHFL-001 |
| NLMISC_TC_014 (Non-Logged Cross Module) - Track Application API round-trip performance placeholder. | T095 | out-of-scope — covered by another module spec (Cross-module, security and platform) | BHFL-001 |
| NLMISC_TC_015 (Non-Logged Cross Module) - mandatory update blocks all non-logged modules. | T041 | unit-testable — mandatory gate on Home only; other modules out of this spec | BHFL-001 |
| NLMISC_TC_016 (Non-Logged Cross Module) - optional update allows non-logged module access after skip. | T041 | unit-testable — optional update skip leaves Home usable | BHFL-001 |
| NLMISC_TC_017 (Non-Logged Cross Module) - external URL missing for Offers handles safely. | T095 | out-of-scope — covered by another module spec (Cross-module, security and platform) | BHFL-001 |
| NLMISC_TC_018 (Non-Logged Cross Module) - Contact Us popup opens from non-logged home. | T030 | unit-testable — Contact Us popup opens | BHFL-001 |
| NLMISC_TC_019 (Non-Logged Cross Module) - Contact Us popup closes correctly. | T030 | unit-testable — popup closes, stays on Home | BHFL-001 |
| NLMISC_TC_020 (Non-Logged Cross Module) - accessibility shortcut launch from non-logged home where configured. | T095 | out-of-scope — no accessibility icon on this page (BRD O-04, TC-109) | BHFL-001 |
| NLMISC_TC_021 (Non-Logged Cross Module) - stale track application response is cleared when restarting flow. | T095 | out-of-scope — covered by another module spec (Cross-module, security and platform) | BHFL-001 |
| NLMISC_TC_022 (Non-Logged Cross Module) - route refresh does not duplicate API calls excessively. | T020, T004 | unit-testable — token request not duplicated beyond start + mount | BHFL-001 |
| HOME_LAYOUT_TC_001 (Non-Logged Home Screen) - Home screen shows illustration, headline, six tiles and Login button. | T010, T011 | unit-testable — render test of screen against Figma structure | BHFL-001 |
| HOME_LAYOUT_TC_002 (Non-Logged Home Screen) - tile labels and order. | T003, T011 | unit-testable — label/order assertion | BHFL-001 |
| HOME_LAYOUT_TC_003 (Non-Logged Home Screen) - Home screen loads without waiting for background calls. | T011, T020 | unit-testable — render with pending mocked calls, no loader | BHFL-001 |
| Sheet2 / HOME_ACTION_TC_001 (Non-Logged Home Screen) - Pay Now action opens the payment portal. | T012, T013 | unit-testable — navigate mock, PayNow route params | BHFL-001 |
| Sheet2 / HOME_ACTION_TC_002 (Non-Logged Home Screen) - Our Products action routes to Products. | T012 | unit-testable — navigate mock | BHFL-001 |
| Sheet2 / HOME_ACTION_TC_003 (Non-Logged Home Screen) - Track Application action routes to its destination. | T012 | unit-testable — navigate mock; destination TBC (O-03) so route stub only | BHFL-001 |
| Sheet2 / HOME_ACTION_TC_004 (Non-Logged Home Screen) - FAQs action opens FAQ screen. | T012, T021 | unit-testable — FAQ flow with mocked service | BHFL-001 |
| Sheet2 / HOME_ACTION_TC_005 (Non-Logged Home Screen) - Offers action routes to non-logged Offers. | T012 | unit-testable — navigate mock | BHFL-001 |
| Sheet2 / HOME_ACTION_TC_006 (Non-Logged Home Screen) - Contact Us action opens the Customer Care popup. | T012, T030 | unit-testable — popup visibility state | BHFL-001 |
| Sheet2 / HOME_ACTION_TC_007 (Non-Logged Home Screen) - Login button routes to Login screen. | T012 | unit-testable — navigate mock | BHFL-001 |
| Sheet2 / HOME_ACTION_TC_008 (Non-Logged Home Screen) - FAQ action fetches content when cache is not available. | T021 | unit-testable — mocked faqService, spinner state | BHFL-001 |
| Sheet2 / HOME_ACTION_TC_009 (Non-Logged Home Screen) - FAQ action uses cached content when available. | T021 | unit-testable — cache hit, service not called | BHFL-001 |
| Sheet2 / HOME_ACTION_TC_010 (Non-Logged Home Screen) - user returns to Home after closing the Pay Now WebView. | T013 | unit-testable — back navigation mock to Home | BHFL-001 |
| Sheet2 / HOME_NEG_TC_001 (Non-Logged Home Screen) - FAQ API failure with no cache shows error. | T021 | unit-testable — mocked 500, exact error message | BHFL-001 |
| Sheet2 / HOME_NEG_TC_002 (Non-Logged Home Screen) - Pay Now URL unavailable is handled. | T013 | unit-testable — missing URL config handled, no throw | BHFL-001 |
| Sheet2 / HOME_STATE_TC_001 (Non-Logged Home Screen) - stale session flags are reset on Home entry. | T051 | unit-testable — focus reset invoked on entry | BHFL-001 |
| Sheet2 / HOME_STATE_TC_002 (Non-Logged Home Screen) - Home works when non-logged token generation succeeds. | T020, T012 | unit-testable — token success mock, tiles enabled | BHFL-001 |
| Sheet2 / HOME_STATE_TC_003 (Non-Logged Home Screen) - token generation failure is handled silently. | T020 | unit-testable — token rejection swallowed, no dialog | BHFL-001 |
| HOME_VER_TC_001 (Non-Logged Home Screen) - no dialog when app version is up to date. | T040, T041 | unit-testable — versionService mock equal version | BHFL-001 |
| HOME_VER_TC_002 (Non-Logged Home Screen) - maintenance dialog is shown. | T040, T041 | unit-testable — maintenance_flag Y, Exit Android only | BHFL-001 |
| HOME_VER_TC_003 (Non-Logged Home Screen) - mandatory update dialog. | T040, T041 | unit-testable — mandatory classification and dialog buttons | BHFL-001 |
| HOME_VER_TC_004 (Non-Logged Home Screen) - Update button opens the store link. | T041 | unit-testable — Linking.openURL mock with target_url | BHFL-001 |
| HOME_VER_TC_005 (Non-Logged Home Screen) - optional update dialog can be dismissed. | T040, T041 | unit-testable — optional dialog dismissable | BHFL-001 |
| HOME_VER_TC_006 (Non-Logged Home Screen) - update is not enforced when status is not Active. | T040 | unit-testable — status not Active, no enforcement | BHFL-001 |
| HOME_VER_TC_007 (Non-Logged Home Screen) - version 1.8.10 is treated newer than 1.8.9. | T040 | unit-testable — numeric compare 1.8.10 vs 1.8.9 | BHFL-001 |
| HOME_VER_TC_008 (Non-Logged Home Screen) - 401 from version service shows message and logs out. | T040, T041 | unit-testable — returnCode 401, Okay triggers logout mock | BHFL-001 |
| HOME_VER_TC_009 (Non-Logged Home Screen) - version call failure or empty body fails open. | T040 | unit-testable — null/failed call fails open | BHFL-001 |
| HOME_VER_TC_010 (Non-Logged Home Screen) - version request sends capitalised platform value. | T040 | unit-testable — request payload user_agent capitalised | BHFL-001 |
| HOME_VER_TC_011 (Non-Logged Home Screen) - iOS has no Exit button on blocking dialogs. | T041 | unit-testable — Platform.OS mock ios, no Exit | BHFL-001 |
| HOME_VER_TC_012 (Non-Logged Home Screen) - blocking dialog cannot be dismissed by Android back. | T041 | unit-testable — BackHandler mock, dialog stays | BHFL-001 |
| HOME_BACK_TC_001 (Non-Logged Home Screen) - exit confirmation shows on Android back. | T050 | unit-testable — BackHandler mock, dialog text | BHFL-001 |
| HOME_BACK_TC_002 (Non-Logged Home Screen) - Okay on exit dialog closes the app. | T050 | unit-testable — Okay calls BackHandler.exitApp mock | BHFL-001 |
| HOME_BACK_TC_003 (Non-Logged Home Screen) - CANCEL on exit dialog keeps user on Home. | T050 | unit-testable — CANCEL closes dialog | BHFL-001 |
| HOME_BACK_TC_004 (Non-Logged Home Screen) - back closes Contact Us popup before exit dialog. | T030, T050 | unit-testable — popup open, first back closes popup only | BHFL-001 |
| HOME_BACK_TC_005 (Non-Logged Home Screen) - FAQ back returns to Home. | T021 | unit-testable — faqsFromNonLogin flag and back target | BHFL-001 |
| HOME_RESET_TC_001 (Non-Logged Home Screen) - offers form data is cleared on return to Home. | T008, T051 | unit-testable — offersStore reset on focus | BHFL-001 |
| HOME_RESET_TC_002 (Non-Logged Home Screen) - selected pre-approved offer is cleared on return to Home. | T008, T051 | unit-testable — selected offer cleared on focus | BHFL-001 |
| HOME_RESET_TC_003 (Non-Logged Home Screen) - register return flag is cleared on return to Home. | T008, T051 | unit-testable — registerNowReturnScreen null on focus | BHFL-001 |
| HOME_RESET_TC_004 (Non-Logged Home Screen) - Offers fail screen Ok returns to Home with reset state. | T051 | unit-testable — focus event after Offers fail Ok | BHFL-001 |
| HOME_RESET_TC_005 (Non-Logged Home Screen) - focus reset does not clear FAQ cache or token. | T051 | unit-testable — faq cache and token untouched by reset | BHFL-001 |
| HOME_CONTACT_TC_001 (Non-Logged Home Screen) - popup heading and three rows. | T030 | unit-testable — popup heading and three rows from constants | BHFL-001 |
| HOME_CONTACT_TC_002 (Non-Logged Home Screen) - popup closes with its close control. | T030 | unit-testable — close control hides popup | BHFL-001 |
| HOME_CONTACT_TC_003 (Non-Logged Home Screen) - focus returns to Contact Us tile after closing popup. | T030 | manual — needs screen reader / device to verify focus return to tile | BHFL-001 |
| HOME_CONTACT_TC_004 (Non-Logged Home Screen) - popup scrolls at large text sizes. | T030 | unit-testable — maxHeight capped, scrollable content | BHFL-001 |
| HOME_CONTACT_TC_005 (Non-Logged Home Screen) - Call, Email and Find Us tap behaviour. | T030 | manual — Call/Email/Find Us behaviour not defined (BRD O-06); rows render only | BHFL-001 |
| HOME_CONTACT_TC_006 (Non-Logged Home Screen) - popup opens only once on rapid taps. | T030, T012 | unit-testable — rapid taps open one popup | BHFL-001 |
| HOME_TOKEN_TC_001 (Non-Logged Home Screen) - Bearer token is sent on FAQ request. | T004, T021 | unit-testable — request headers include Bearer, app-version, platform, device-details | BHFL-001 |
| HOME_TOKEN_TC_002 (Non-Logged Home Screen) - token request times out after 10 seconds. | T005 | unit-testable — fake timers, timeout 10 s | BHFL-001 |
| HOME_TOKEN_TC_003 (Non-Logged Home Screen) - early FAQ tap waits for in-flight token. | T004, T005 | unit-testable — request awaits shared token promise | BHFL-001 |
| HOME_TOKEN_TC_004 (Non-Logged Home Screen) - relaunch after 15 minutes uses a fresh non-logged token. | T005 | unit-testable — logged-in token memory-only, fresh non-logged token requested | BHFL-001 |
| HOME_TOKEN_TC_005 (Non-Logged Home Screen) - FAQ shows error after token failure. | T005, T021 | unit-testable — token failure then FAQ failure dialog | BHFL-001 |
| HOME_TOKEN_TC_006 (Non-Logged Home Screen) - token request body fields are encrypted. | T005 | unit-testable — encrypt seam called, no credential logging | BHFL-001 |
| HOME_TOKEN_TC_007 (Non-Logged Home Screen) - token is stored after success. | T005 | unit-testable — store plus secure-storage seam key auth_token_Nonlogged | BHFL-001 |
| HOME_FAQ_TC_001 (Non-Logged Home Screen) - empty FAQ list keeps user on Home with no dialog. | T021 | unit-testable — empty array, no dialog | BHFL-001 |
| HOME_FAQ_TC_002 (Non-Logged Home Screen) - non-array FAQ response does not crash. | T021 | unit-testable — non-array treated empty | BHFL-001 |
| HOME_FAQ_TC_003 (Non-Logged Home Screen) - double tap on FAQs sends one request. | T021 | unit-testable — in-flight guard, one request | BHFL-001 |
| HOME_FAQ_TC_004 (Non-Logged Home Screen) - spinner blocks other touches while FAQ loads. | T021 | unit-testable — overlay rendered while loading | BHFL-001 |
| HOME_FAQ_TC_005 (Non-Logged Home Screen) - retry after FAQ failure succeeds. | T021 | unit-testable — fail then succeed | BHFL-001 |
| HOME_FAQ_TC_006 (Non-Logged Home Screen) - Okay on FAQ error dialog keeps user on Home. | T021 | unit-testable — Okay closes error dialog | BHFL-001 |
| HOME_FAQ_TC_007 (Non-Logged Home Screen) - spinner always clears on FAQ failure or timeout. | T021 | unit-testable — spinner cleared in finally | BHFL-001 |
| HOME_NET_TC_001 (Non-Logged Home Screen) - Home renders with no network. | T011, T020 | unit-testable — render with network calls rejected | BHFL-001 |
| HOME_NET_TC_002 (Non-Logged Home Screen) - FAQs with no network shows error. | T021 | unit-testable — network error mock, dialog and spinner clear | BHFL-001 |
| HOME_NET_TC_003 (Non-Logged Home Screen) - Pay Now with no network shows WebView error. | T013 | manual — WebView error state belongs to shared WebView module; only route hand-off here | BHFL-001 |
| HOME_NET_TC_004 (Non-Logged Home Screen) - network lost mid FAQ fetch. | T021 | unit-testable — request rejects mid-flight | BHFL-001 |
| HOME_NET_TC_005 (Non-Logged Home Screen) - rapid taps on different tiles open one destination. | T007, T012 | unit-testable — navigation guard, single destination | BHFL-001 |
| HOME_NET_TC_006 (Non-Logged Home Screen) - rapid taps on the same tile do not duplicate screens. | T007, T012 | unit-testable — duplicate push guard for same tile | BHFL-001 |
| HOME_NET_TC_007 (Non-Logged Home Screen) - layout on small screen 320 x 568. | T011 | manual — visual check on 320x568 device/emulator (ScrollView reachability unit-checked in T011) | BHFL-001 |
| HOME_NET_TC_008 (Non-Logged Home Screen) - layout on tablet or wide screen. | T011 | manual — wide-screen layout pending design decision (O-13) | BHFL-001 |
| HOME_NET_TC_009 (Non-Logged Home Screen) - cold start time to interactive. | T090 | manual — device performance measurement, target TBD (PERF-1) | BHFL-001 |
| HOME_NET_TC_010 (Non-Logged Home Screen) - no memory growth when opening and closing tiles repeatedly. | T090 | manual — memory profiling on device | BHFL-001 |
| HOME_NET_TC_011 (Non-Logged Home Screen) - Android and iOS parity. | T011, T050 | manual — needs both platforms side by side | BHFL-001 |
