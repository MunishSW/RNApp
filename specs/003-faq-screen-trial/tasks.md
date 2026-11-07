---

description: "Task list for the FAQ Screen (Pre-Login)"
---

# Tasks: FAQ Screen (Pre-Login)

**Input**: specs/003-faq-screen/ (spec.md, plan.md, qa-cases.json, contracts/, quickstart.md)

**QA source**: `docs/BHFL_FAQ_Test_Cases.xlsx` [sheet: FAQ Test Cases], 18 cases. manual-verification.json is not used: no case needs a human check beyond the quickstart M-1 to M-7 run in T030.

**Prerequisites**: plan.md, spec.md.

**Tests**: Included. Unit tests are written first for each story and must fail before the code exists.

**Organization**: grouped by user story. Phase order: setup, state and parser, list and accordion, loading and states, navigation and back, accessibility, polish.

## Format: `- [ ] T### [P?] [Story?] Description with file path (IDs)`

- **[P]**: can run in parallel (different files).
- **[USn]**: user story label.
- IDs in brackets are spec requirement ids (FR-, BR-) and scenarios (P-, N-, E-).

## Story map

| Story | Priority | Delivers |
|---|---|---|
| US1 | P1 | Page shell, cards, open and close (Journey A) |
| US2 | P1 | Loading, empty and error states (Journey B) |
| US3 | P2 | Refresh on return (Journey C) |
| US4 | P2 | Formatted answers (Journey D) |
| US5 | P2 | Back navigation (Journey E) |

## Path conventions

New code is under `src/features/faq/`. Tests sit in `__tests__/` next to the code. Strings only from `faqConstants.ts`; raw colours only in `src/theme/tokens.ts`.

---

## Environment Gate

- [ ] T-ENV-001: Run `npm test` - existing suite green. **Maps**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019, FR-020, FR-021, FR-022, FR-023, FR-024, FR-025, FR-026, FR-027, FR-028, FR-029, FR-030, FR-031 · **Accept**: the whole project suite passes before and after this retrofit (not run by the retrofit, which ran only the FAQ files)

---

## Phase 1: Setup

- [X] T001 Add `faqPageBackground: '#E3ECF5'` and `faqChevron: '#FF5101'` to `src/theme/tokens.ts` (additive) and extend `src/theme/__tests__/tokens.test.ts` for both values (FR-001, FR-006) **Maps**: FR-001, FR-006 · **Accept**: the two FAQ colour tokens exist with the Figma values and the token test asserts both
- [X] T002 [P] Add `src/assets/faq/index.ts` exporting the SVG markup of `back-arrow.svg` (21 x 18) and `chevron-down.svg` (20 x 20) already in that folder, and a test that both strings contain an `<svg` root with those sizes (FR-002, FR-006) **Maps**: FR-002, FR-006 · **Accept**: both SVG markups are exported with their Figma sizes and the asset test passes
- [X] T003 [P] Create `src/features/faq/faqConstants.ts` with every on-screen string exactly as the spec quotes it: title "FAQs", "Back", "No FAQs are available right now.", "Your request could not be processed at this moment. Request you to try again after sometime.", "Retry", accessibility labels and state words; and `__tests__/faqConstants.test.ts` asserting each string (FR-002, FR-022, FR-024, FR-028) **Maps**: FR-002, FR-004, FR-022, FR-024, FR-028 · **Accept**: every on-screen string lives in faqConstants.ts exactly as the spec quotes it and its test passes
- [X] T004 Replace the `Faq` stub in `src/navigation/RootNavigator.tsx` with `FaqScreen`, leaving every other route unchanged (FR-026) **Maps**: FR-026 · **Accept**: the Faq route renders FaqScreen and no other route changed

**Checkpoint**: tokens, assets, constants, route exist.

---

## Phase 2: Foundational - answer parser and data hook

- [X] T005 [P] Write `src/features/faq/__tests__/parseAnswerHtml.test.ts`: plain text gives one paragraph; `<b>`, `<strong>`, `<i>`, `<em>`, `<u>` set style flags; `<br>` and `<p>` split lines; `<ul>`, `<ol>`, `<li>` give list items with bullets or numbers; `<a href>` gives a link run; unknown tags are dropped and their text kept; `<script>` and `<style>` content is removed; empty, null and undefined give no blocks; entities `&amp; &lt; &gt; &nbsp;` decode (FR-012, FR-015; BR-5; P-04) **Maps**: FR-012, FR-015 · **Accept**: the parser test file exists, covers every tag and entity rule, and failed before the parser existed
- [X] T006 Create `src/features/faq/parseAnswerHtml.ts` exporting `parseAnswerHtml(html?: string | null): AnswerBlock[]` (FR-012; BR-5). Depends on T005. **Maps**: FR-012 · **Accept**: parseAnswerHtml returns styled blocks for simple HTML and the parser tests pass
- [X] T007 [P] Write `src/features/faq/__tests__/useFaqData.test.tsx`: stored list gives state `list` at once with no loader and no wait for the request; no stored list gives `loading` then `list` on success; failure with no list gives `error`; failure with a stored list keeps `list`; empty array gives `empty`; non-array gives `empty`; item without question is dropped; `retry()` repeats the request with `loading`; focus triggers one quiet refresh and a non-empty answer replaces the stored list; two focuses give two requests; the loader clears on success, failure and timeout; only `fetchFaq` is called (FR-016 to FR-020, FR-022 to FR-024; BR-2, BR-3, BR-4; P-01, P-05, N-01 to N-06) **Maps**: FR-016, FR-017, FR-018, FR-019, FR-020, FR-022, FR-023, FR-024 · **Accept**: the hook test file covers stored list, loading, error, empty, retry, focus refresh and FAQ-service-only calls
- [X] T008 Create `src/features/faq/hooks/useFaqData.ts` returning `{ state, items, retry }` using the store `faq` slice and `fetchFaq`, refreshing on navigation focus (FR-016 to FR-021; BR-2, BR-3, BR-4). Depends on T007. **Maps**: FR-016, FR-017, FR-018, FR-019, FR-020, FR-021 · **Accept**: useFaqData returns state, items and retry as specified and its tests pass
- [X] T009 [P] Add to `useFaqData.test.tsx` a case: after `clearFaq` the next open loads a new list (FR-021; N-07) **Maps**: FR-021 · **Accept**: a test shows a new list is loaded after the stored list is cleared

**Checkpoint**: `npm test -- src/features/faq` green for parser and hook.

---

## Phase 3: User Story 1 - Cards and accordion (Priority: P1) 🎯 MVP

**Goal**: page shell, header, cards, open and close.

### Tests for User Story 1

- [X] T010 [P] [US1] `__tests__/FaqHeader.test.tsx`: title "FAQs" with heading role, back button labelled "Back", back arrow 21 x 18, touch area at least 44 x 44, press calls the handler, bar 48 high from tokens (FR-002, FR-029; P-06) **Maps**: FR-002, FR-029 · **Accept**: the header test proves title, heading role, Back button, 21 x 18 arrow, 44 x 44 touch area and 48 high bar
- [X] T011 [P] [US1] `__tests__/FaqCard.test.tsx`: question text is shown in full with no line limit; role button; accessibility label equals the question; state expanded false then true after press; answer area appears when open and is gone when closed; chevron is hidden from accessibility and turned when open; minimum height 44; empty answer opens to an empty area (FR-006 to FR-009, FR-015, FR-028, FR-030; P-02, P-03, E-01) **Maps**: FR-006, FR-007, FR-008, FR-009, FR-015, FR-028, FR-030 · **Accept**: the card test proves full question, button role, label, state, answer area, chevron and 44 minimum height
- [X] T012 [P] [US1] `__tests__/FaqAnswer.test.tsx`: renders blocks from the parser: bold and italic styles, bullet and number markers, link press calls `Linking.openURL` once, a rejected `openURL` does not throw, long text is not height-limited (FR-012 to FR-014; BR-5; P-04, E-02) **Maps**: FR-012, FR-013, FR-014 · **Accept**: the answer test proves styles, list markers, link press through Linking, a rejected openURL and no height limit
- [X] T013 [US1] `__tests__/FaqScreen.test.tsx`: with a stored list shows header, one card per item, all closed, no loader; press opens one card only; press again closes it; two cards can be open; ten rapid presses end in a consistent state without error; reopening the screen starts all cards closed; page colour is the token; content column at most 360 on a wide window; text scale 2x does not clip (renders without fixed text heights) (FR-001, FR-003, FR-005, FR-008, FR-010, FR-011, FR-031; P-01 to P-03, E-03, E-05). Depends on T010 to T012. **Maps**: FR-001, FR-003, FR-005, FR-008, FR-010, FR-011, FR-031 · **Accept**: the screen test proves the stored list, single and multiple open cards, rapid presses, reset on return and the column limit

### Implementation for User Story 1

- [X] T014 [P] [US1] Create `components/FaqHeader.tsx` (48 high bar, back arrow SVG, title Rubik 14, tokens only) (FR-001, FR-002, FR-029) **Maps**: FR-001, FR-002, FR-029 · **Accept**: FaqHeader renders the 48 high bar, back arrow and title from tokens and its tests pass
- [X] T015 [P] [US1] Create `components/FaqAnswer.tsx` rendering `AnswerBlock[]` as nested `Text` with styles, list markers and link runs (FR-012 to FR-014; BR-5) **Maps**: FR-012, FR-013, FR-014 · **Accept**: FaqAnswer renders parsed blocks as nested text and its tests pass
- [X] T016 [US1] Create `components/FaqCard.tsx`: white card radius 4 padding 12, question Rubik 12 / 18, chevron SVG 20 x 20 with a single short rotate animation, role button, label, state, min height 44 (FR-006 to FR-009, FR-028, FR-030). Depends on T015. **Maps**: FR-006, FR-007, FR-008, FR-009, FR-028, FR-030 · **Accept**: FaqCard renders the card, one short chevron animation, role, label, state and minimum height and its tests pass
- [X] T017 [US1] Create `FaqScreen.tsx`: action bar, `ScrollView` with the list (18 sides, 12 top, 8 gap), open-card set in local state reset on focus, centred column up to 360 (FR-003, FR-005, FR-010, FR-011). Depends on T014, T016, T008. **Maps**: FR-003, FR-005, FR-010, FR-011 · **Accept**: FaqScreen shows header, scrolling list, open-card state reset on focus and a centred column, and its tests pass

**Checkpoint**: US1 works alone; `npm test -- src/features/faq`.

---

## Phase 4: User Story 2 - Loading, empty and error (Priority: P1)

### Tests for User Story 2

- [X] T018 [P] [US2] `__tests__/FaqStateView.test.tsx`: loading shows an indicator announced to screen readers; empty shows "No FAQs are available right now." with no button; error shows the exact message and one "Retry" button whose press calls the handler; error message announced (FR-022, FR-024, FR-025; E-04) **Maps**: FR-022, FR-024, FR-025 · **Accept**: the state view test proves loading, empty and error variants, the Retry press and the announcements
- [X] T019 [US2] Add to `FaqScreen.test.tsx`: no stored list and a pending request shows the loader and blocks touches; success then shows the list; failure shows error and Retry; Retry then success shows the list; empty answer shows the empty message; refresh failure with a stored list shows no message (FR-018, FR-022 to FR-024; BR-3, BR-4; N-01 to N-05) **Maps**: FR-018, FR-020, FR-022, FR-023, FR-024 · **Accept**: screen tests prove loader, list after success, error with Retry, empty message and a silent failed refresh

### Implementation for User Story 2

- [X] T020 [US2] Create `components/FaqStateView.tsx` (loading, empty, error variants) (FR-022, FR-024, FR-025) **Maps**: FR-022, FR-024, FR-025 · **Accept**: FaqStateView renders the three variants and its tests pass
- [X] T021 [US2] Wire the state view into `FaqScreen.tsx` for `loading`, `empty` and `error`, with Retry bound to `retry` (FR-018, FR-022 to FR-024). Depends on T020. **Maps**: FR-018, FR-022, FR-023, FR-024 · **Accept**: the screen shows loading, empty and error through FaqStateView with Retry bound to retry and the tests pass

---

## Phase 5: User Story 3 - Refresh on return (Priority: P2)

- [X] T022 [US3] Add to `FaqScreen.test.tsx`: leaving and returning requests the list again once and the new list replaces the old; all cards are closed after return; no request other than the FAQ service is made (FR-011, FR-017, FR-019; P-05) **Maps**: FR-011, FR-017, FR-019 · **Accept**: a screen test proves a second request on return, the new list replacing the old, closed cards and no non-FAQ request
- [X] T023 [US3] Confirm `useFaqData` refresh runs on every focus and not on re-render; adjust only if T022 fails (FR-017) **Maps**: FR-017 · **Accept**: the refresh runs on every focus and not on re-render, confirmed by the passing tests

---

## Phase 6: User Story 4 - Formatted answers (Priority: P2)

- [X] T024 [US4] Add to `FaqScreen.test.tsx`: an item whose answer has bold text, a list and a link shows formatted text and the link opens through `Linking` (FR-012, FR-013; P-04) **Maps**: FR-012, FR-013 · **Accept**: a screen test shows bold text, list markers and a link opened through Linking

---

## Phase 7: User Story 5 - Back (Priority: P2)

- [X] T025 [P] [US5] `__tests__/useFaqBack.test.tsx`: header back and Android hardware back both navigate to the Home route once; two rapid presses navigate once; the hardware back subscription is removed on blur and unmount (FR-026, FR-027; BR-1; P-06, E-07) **Maps**: FR-026, FR-027 · **Accept**: the back test proves header and hardware back go to Home once, a rapid press goes once and the subscription is removed
- [X] T026 [US5] Create `hooks/useFaqBack.ts` and wire it in `FaqScreen.tsx` and `FaqHeader.tsx` (FR-026, FR-027). Depends on T025. **Maps**: FR-026, FR-027 · **Accept**: useFaqBack is wired in the screen and header and its tests pass

---

## Phase 8: Accessibility and polish

- [X] T027 [P] `__tests__/accessibility.test.tsx`: reading order title, Back, cards; every card button has label and state; chevron hidden; touch targets at least 44; loader and error announced; no fixed text height at scale 2 (FR-010, FR-025, FR-028 to FR-031; E-04, E-05) **Maps**: FR-010, FR-025, FR-028, FR-029, FR-030, FR-031 · **Accept**: the accessibility test proves reading order, labels, state, hidden chevrons, 44 targets, announcements and no fixed text height
- [X] T028 Run `npx tsc --noEmit`, `npm run lint` and `npm test -- src/features/faq src/theme src/assets/faq`; fix findings in this feature's files (all FR) **Maps**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019, FR-020, FR-021, FR-022, FR-023, FR-024, FR-025, FR-026, FR-027, FR-028, FR-029, FR-030, FR-031 · **Accept**: typecheck and lint report no errors and the affected tests pass
- [X] T029 Scope check: no raw hex outside `src/theme/tokens.ts`, no literal strings outside `faqConstants.ts`, no direct axios or fetch, no import from `src/features/nonLoggedInHome` or `src/features/nonLoggedHome` (FR-004; BR-2) **Maps**: FR-004, FR-019 · **Accept**: no raw hex, no literal text, no direct network call and no Home import in the feature, as the isolation test proves
- [ ] T030 Run the manual checks M-1 to M-7 in `quickstart.md` on a device and record results (FR-016, FR-028 to FR-031) **Maps**: FR-016, FR-028, FR-029, FR-030, FR-031 · **Accept**: M-1 to M-7 in quickstart.md are run on a device and each result is recorded; stays open until a person does it

---

## Phase 9: Retrofit Tests

- [X] T031 Add `src/features/faq/__tests__/faqEndpoint.test.tsx`: with the real `fetchFaq` and a stubbed HTTP transport, opening the screen and returning to it send only the `FormBasedQuery/Services/v1/fetch-faq` request and none to a track URL (QA FAQ_FUNC_TC_015; BR-2; P-05) **Maps**: FR-019 · **Accept**: the test is written and passes, asserting two requests to the FAQ endpoint and none matching "track"

---

## Phase 10: Retrofit Gaps

- [ ] T032 Session reset does not clear the stored FAQ list: `src/services/sessionService.ts` `logout()` does not dispatch `clearFaq` and nothing else in the app does (QA FAQ_FUNC_TC_018; N-07). Not built, awaiting the logout / session-reset module. **Maps**: FR-021 · **Accept**: a session reset clears the stored FAQ list, the next open of FAQs shows the loader and loads a new list, and a test proves the clear is triggered by the reset

---

## Dependencies and execution order

Setup (T001 to T004) → T005, T007 → T006, T008, T009 → US1 tests T010 to T013 → US1 code T014 to T017 → US2 T018 to T021 → US3 T022, T023 → US4 T024 → US5 T025, T026 → T027 → T028 → T029 → T030 → retrofit T031 (test written after the build) and T032 (open gap).

## Notes

- T030 needs a person and a device; it stays unchecked until run.
- Spec scenarios P-, N-, E- are proved by the tests named in each task.
- Home route: the Home route constant used as the back target is `ROUTES.NonLoggedInHome` (the screen that opens FAQs and the one PayNow returns to).
- T004 was done after the FaqScreen file existed (the import needs it); the route swap itself is the only change in `RootNavigator.tsx`.
- Extra tokens added besides `faqPageBackground` and `faqChevron`: `faqCardBackground`, `faqText`, `faqLink`, `faqActionBar`, `faqActionBarText` and a `faqLayout` object (Figma numbers).
- Reading order: the title is first in the header tree and the Back button second (both placed absolutely) so screen readers read title, Back, cards as M-2 and T027 require, while the arrow stays visually left of the title.
- The chevron animation uses the JS driver (`useNativeDriver: false`) so the 150 ms rotation can be verified in Jest.
- The back arrow markup keeps its Figma fill `#F8FAFF` (near white); the file does have a fill attribute.
- `src/features/faq/__tests__/isolation.test.ts` automates the T029 scope check.

---

## TC -> Task coverage

Counts: 18 QA cases = 17 covered + 0 partial + 0 manual + 1 gap + 0 divergent + 0 qa-suspect + 0 out-of-scope + 0 failing (parts must add up to the total).

| TC (id + short description) | Task(s) | Test approach |
|---|---|---|
| FAQ_FUNC_TC_001 - Verify FAQ list displays questions and answers from API. | T013 | unit-testable - FAQ accordion list displays all questions |
| FAQ_FUNC_TC_002 - Verify FAQ answer expands when user taps question. | T013 | unit-testable - corresponding answer expands on question tap |
| FAQ_FUNC_TC_003 - Verify FAQ answer collapses when user taps expanded question again. | T013 | unit-testable - answer collapses on tapping expanded question again |
| FAQ_FUNC_TC_004 - Verify HTML content in FAQ answer renders correctly. | T024 | unit-testable - formatted HTML content in answer renders with styles and list markers |
| FAQ_FUNC_TC_005 - Verify FAQ screen handles empty response array. | T019 | unit-testable - empty response array displays empty state without crash |
| FAQ_FUNC_TC_006 - Verify FAQ API failure uses cache when available. | T019 | unit-testable - API failure uses stored/cached list when available |
| FAQ_FUNC_TC_007 - Verify FAQ API failure with no cache shows error. | T019 | unit-testable - in-page error message and retry button display on API failure with no cache |
| FAQ_FUNC_TC_008 - Verify FAQ route revisit refreshes data. | T022 | unit-testable - route revisit on focus requests fresh data and updates list |
| FAQ_FUNC_TC_009 - Verify long FAQ question text wraps properly. | T013 | unit-testable - long question text wraps with no numberOfLines limit or fixed height |
| FAQ_FUNC_TC_010 - Verify long FAQ answer text is scrollable/readable. | T012 | unit-testable - long answer text renders in full without height limit within scrollable page |
| FAQ_FUNC_TC_011 - Verify invalid FAQ response structure is normalized safely. | T019 | unit-testable - non-array/invalid response normalized safely to empty state without crash |
| FAQ_FUNC_TC_012 - Verify back navigation from FAQ. | T013, T025 | unit-testable - back arrow and hardware back navigate to NonLoggedInHome |
| FAQ_FUNC_TC_013 - Verify FAQ list remains stable during rapid expand/collapse. | T013 | unit-testable - rapid taps toggle state consistently without freeze or crash |
| FAQ_FUNC_TC_014 - Verify loader appears during FAQ fetch. | T019 | unit-testable - loader displays while request is pending and hides upon response |
| FAQ_FUNC_TC_015 - Verify FAQ content does not call track application API. | T031 | unit-testable - only FAQ endpoint is requested and track application API is never called |
| FAQ_FUNC_TC_016 - Verify FAQ accessibility content is readable by screen reader labels where applicable. | T027 | unit-testable - controls have accessible roles, labels, states, and screen reader announcements |
| FAQ_FUNC_TC_017 - Verify FAQ offline/network error handling. | T019 | unit-testable - network/offline error displays error message, retry button, and alert role |
| FAQ_FUNC_TC_018 - Verify FAQ data does not persist incorrectly after logout/session reset. | T032 | unit-testable - gap: not built: session reset does not dispatch clearFaq to clear stored FAQ data |
