# 003-faq-screen - Test Coverage Report

Specs: `003-faq-screen`  |  Date: 2026-11-06

## Summary

| Metric | Value |
|---|---|
| Test suites run | 14 |
| Tests run | 110 (110 pass, 0 fail) |
| New tests added by retrofit | 1 |
| QA cases (acceptance contract) | 18 (from specs/003-faq-screen/qa-cases.json) |
| - covered, passing, assertion quoted | 16 |
| - partial | 1 |
| - mapped but failing (code defect) | 0 |
| - manual (need a human) | 0 |
| - divergent from spec | 1 |
| - qa-suspect | 0 |
| - gap (no test, not built) | 0 |
| - out of scope | 0 |

**QA coverage: 16/18 automated (89%) · 0 manual · 0 gaps · 1 divergent** (plus 1 partial, blocked by the logout module)

Run: `npx jest src/features/faq src/assets/faq src/theme/__tests__/tokens.test.ts --watchAll=false --coverage=false`. The 14 suites are the 11 FAQ test files (including the new `faqEndpoint.test.tsx`), `src/assets/faq/__tests__/assets.test.ts` and `src/theme/__tests__/tokens.test.ts`.

## Action needed

- DIVERGENT: `FAQ_FUNC_TC_007` expects "Server error popup or empty fallback". The recorded plan decision 3 (owner, 2026-11-06) shows the error inside the page with a Retry button and no dialog. Product owner and QA must decide: accept the in-page error state as the fallback, change the case, or change the spec.
- PARTIAL: `FAQ_FUNC_TC_018` - the screen reloads after the stored list is cleared, but no logout or session-reset code dispatches `clearFaq` (`sessionService.logout()` only clears the logged-in token). Open task T032.
- Manual: no QA case is classed manual. The device checks M-1 to M-7 in `quickstart.md` (task T030) are still to be run by a person; they back `FAQ_FUNC_TC_016` and `FAQ_FUNC_TC_017` on real devices.
- Failing: none. Gaps: none.

## 1. Input QA cases - 18

| # | TC ID | Test Case | Status | Assertion evidence |
|---|---|---|---|---|
| 1 | FAQ_FUNC_TC_001 | Verify FAQ list displays questions and answers from API. | Covered by 2 passing tests (section 2) | `expect(screen.getByText(B.question)).toBeTruthy();` (FaqScreen.test.tsx:200) |
| 2 | FAQ_FUNC_TC_002 | Verify FAQ answer expands when user taps question. | Covered by 2 passing tests (section 2) | `expect(screen.getByText(A.answer)).toBeTruthy();` (FaqScreen.test.tsx:125) |
| 3 | FAQ_FUNC_TC_003 | Verify FAQ answer collapses when user taps expanded question again. | Covered by 2 passing tests (section 2) | `expect(screen.queryByText(A.answer)).toBeNull();` (FaqScreen.test.tsx:129) |
| 4 | FAQ_FUNC_TC_004 | Verify HTML content in FAQ answer renders correctly. | Covered by 3 passing tests (section 2) | `expect(bold.fontWeight).toBe('bold');` (FaqScreen.test.tsx:314) |
| 5 | FAQ_FUNC_TC_005 | Verify FAQ screen handles empty response array. | Covered by 2 passing tests (section 2) | `expect(screen.getByText('No FAQs are available right now.')).toBeTruthy();` (FaqScreen.test.tsx:237) |
| 6 | FAQ_FUNC_TC_006 | Verify FAQ API failure uses cache when available. | Covered by 1 passing test (section 2) | `expect(screen.getByText(A.question)).toBeTruthy();` (FaqScreen.test.tsx:255) |
| 7 | FAQ_FUNC_TC_007 | Verify FAQ API failure with no cache shows error. | DIVERGENT - error shown in page with Retry, case expects popup or empty fallback (section 2) | No popup assertion exists. `expect(screen.getByText(ERROR)).toBeTruthy();` asserts the in-page message (FaqScreen.test.tsx) |
| 8 | FAQ_FUNC_TC_008 | Verify FAQ route revisit refreshes data. | Covered by 1 passing test (section 2) | `expect(screen.getByText(C.question)).toBeTruthy();` (FaqScreen.test.tsx:276) |
| 9 | FAQ_FUNC_TC_009 | Verify long FAQ question text wraps properly. | Covered by 2 passing tests (section 2) | `expect(text.props.numberOfLines).toBeUndefined();` (FaqScreen.test.tsx:174) |
| 10 | FAQ_FUNC_TC_010 | Verify long FAQ answer text is scrollable/readable. | Covered by 1 passing test (section 2) | `expect(text.props.numberOfLines).toBeUndefined();` (FaqAnswer.test.tsx:71) |
| 11 | FAQ_FUNC_TC_011 | Verify invalid FAQ response structure is normalized safely. | Covered by 2 passing tests (section 2) | `expect(screen.getByText('No FAQs are available right now.')).toBeTruthy();` (FaqScreen.test.tsx:247) |
| 12 | FAQ_FUNC_TC_012 | Verify back navigation from FAQ. | Covered by 2 passing tests (section 2) | `expect(navigation.navigate).toHaveBeenCalledWith('NonLoggedInHome', undefined);` (FaqScreen.test.tsx:184) |
| 13 | FAQ_FUNC_TC_013 | Verify FAQ list remains stable during rapid expand/collapse. | Covered by 1 passing test (section 2) | `expect(isOpen(B.question)).toBe(false);` (FaqScreen.test.tsx:151) |
| 14 | FAQ_FUNC_TC_014 | Verify loader appears during FAQ fetch. | Covered by 1 passing test (section 2) | `expect(screen.queryByTestId('faq-loader')).toBeNull();` (FaqScreen.test.tsx:198) |
| 15 | FAQ_FUNC_TC_015 | Verify FAQ content does not call track application API. | Covered by 1 passing test (section 2) | `expect(urls).toEqual([FAQ_URL, FAQ_URL]);` (faqEndpoint.test.tsx:69) |
| 16 | FAQ_FUNC_TC_016 | Verify FAQ accessibility content is readable by screen reader labels where applicable. | Covered by 2 passing tests (section 2) | `expect(card.props.accessibilityLabel).toBe(item.question);` (accessibility.test.tsx:103) |
| 17 | FAQ_FUNC_TC_017 | Verify FAQ offline/network error handling. | Covered by 2 passing tests (section 2) | `expect(screen.getByText(ERROR)).toBeTruthy();` (FaqScreen.test.tsx:210) |
| 18 | FAQ_FUNC_TC_018 | Verify FAQ data does not persist incorrectly after logout/session reset. | PARTIAL - T032 (logout does not clear the list); screen part covered by 1 passing test (section 2) | `expect(result.current.items).toEqual([B]);` (useFaqData.test.tsx:221) |

## 2. Tests mapped to cases - 30

| # | TC ID | Test Case (QA) | File | Test name | Origin (existing / new) | Result |
|---|---|---|---|---|---|---|
| 1 | FAQ_FUNC_TC_001 | Verify FAQ list displays questions and answers from API. | src/features/faq/__tests__/FaqScreen.test.tsx:82 | shows the header, one closed card per stored item and no loader | existing | pass |
| 2 | FAQ_FUNC_TC_001 | Verify FAQ list displays questions and answers from API. | src/features/faq/__tests__/FaqScreen.test.tsx:191 | shows the loader while the first request is pending and then the list | existing | pass |
| 3 | FAQ_FUNC_TC_002 | Verify FAQ answer expands when user taps question. | src/features/faq/__tests__/FaqCard.test.tsx:74 | shows the answer area only while open | existing | pass |
| 4 | FAQ_FUNC_TC_002 | Verify FAQ answer expands when user taps question. | src/features/faq/__tests__/FaqScreen.test.tsx:119 | opens one card only, then closes it again on the second press | existing | pass |
| 5 | FAQ_FUNC_TC_003 | Verify FAQ answer collapses when user taps expanded question again. | src/features/faq/__tests__/FaqCard.test.tsx:74 | shows the answer area only while open | existing | pass |
| 6 | FAQ_FUNC_TC_003 | Verify FAQ answer collapses when user taps expanded question again. | src/features/faq/__tests__/FaqScreen.test.tsx:119 | opens one card only, then closes it again on the second press | existing | pass |
| 7 | FAQ_FUNC_TC_004 | Verify HTML content in FAQ answer renders correctly. | src/features/faq/__tests__/FaqAnswer.test.tsx:17 | renders bold and italic runs with the matching font styles | existing | pass |
| 8 | FAQ_FUNC_TC_004 | Verify HTML content in FAQ answer renders correctly. | src/features/faq/__tests__/FaqAnswer.test.tsx:28 | renders bullet and number markers for lists | existing | pass |
| 9 | FAQ_FUNC_TC_004 | Verify HTML content in FAQ answer renders correctly. | src/features/faq/__tests__/FaqScreen.test.tsx:302 | shows bold text, a list and a link, and opens the link through Linking | existing | pass |
| 10 | FAQ_FUNC_TC_005 | Verify FAQ screen handles empty response array. | src/features/faq/__tests__/FaqScreen.test.tsx:233 | shows the empty message with no dialog and no button for an empty answer | existing | pass |
| 11 | FAQ_FUNC_TC_005 | Verify FAQ screen handles empty response array. | src/features/faq/__tests__/useFaqData.test.tsx:109 | gives the empty state for an empty array when nothing is stored | existing | pass |
| 12 | FAQ_FUNC_TC_006 | Verify FAQ API failure uses cache when available. | src/features/faq/__tests__/FaqScreen.test.tsx:251 | shows nothing extra when a refresh fails and a list is stored | existing | pass |
| 13 | FAQ_FUNC_TC_007 | Verify FAQ API failure with no cache shows error. | src/features/faq/__tests__/FaqScreen.test.tsx:205 | shows the error message and Retry when the first request fails, and the list after Retry | existing | pass |
| 14 | FAQ_FUNC_TC_007 | Verify FAQ API failure with no cache shows error. | src/features/faq/__tests__/FaqStateView.test.tsx:36 | shows the exact error message and one Retry button that calls the handler | existing | pass |
| 15 | FAQ_FUNC_TC_008 | Verify FAQ route revisit refreshes data. | src/features/faq/__tests__/FaqScreen.test.tsx:264 | requests the list again on return, replaces the old list, and closes all cards | existing | pass |
| 16 | FAQ_FUNC_TC_009 | Verify long FAQ question text wraps properly. | src/features/faq/__tests__/FaqCard.test.tsx:39 | shows the full question with no line limit | existing | pass |
| 17 | FAQ_FUNC_TC_009 | Verify long FAQ question text wraps properly. | src/features/faq/__tests__/FaqScreen.test.tsx:169 | shows a very long question in full with no line limit and no fixed text height | existing | pass |
| 18 | FAQ_FUNC_TC_010 | Verify long FAQ answer text is scrollable/readable. | src/features/faq/__tests__/FaqAnswer.test.tsx:67 | shows a long answer in full with no height or line limit | existing | pass |
| 19 | FAQ_FUNC_TC_011 | Verify invalid FAQ response structure is normalized safely. | src/features/faq/__tests__/FaqScreen.test.tsx:243 | shows the empty message for a non-list answer without a crash | existing | pass |
| 20 | FAQ_FUNC_TC_011 | Verify invalid FAQ response structure is normalized safely. | src/features/faq/__tests__/useFaqData.test.tsx:117 | gives the empty state for a non-array answer when nothing is stored | existing | pass |
| 21 | FAQ_FUNC_TC_012 | Verify back navigation from FAQ. | src/features/faq/__tests__/FaqScreen.test.tsx:179 | goes to Home from the header back arrow and from the hardware back | existing | pass |
| 22 | FAQ_FUNC_TC_012 | Verify back navigation from FAQ. | src/features/faq/__tests__/useFaqBack.test.tsx:49 | opens the Home route explicitly from the header back | existing | pass |
| 23 | FAQ_FUNC_TC_013 | Verify FAQ list remains stable during rapid expand/collapse. | src/features/faq/__tests__/FaqScreen.test.tsx:144 | ends consistent after ten rapid presses on one card and flips only that card | existing | pass |
| 24 | FAQ_FUNC_TC_014 | Verify loader appears during FAQ fetch. | src/features/faq/__tests__/FaqScreen.test.tsx:191 | shows the loader while the first request is pending and then the list | existing | pass |
| 25 | FAQ_FUNC_TC_015 | Verify FAQ content does not call track application API. | src/features/faq/__tests__/faqEndpoint.test.tsx:44 | [FAQ_FUNC_TC_015] sends only the fetch-faq request on open and on return, and nothing to Track Application | new | pass |
| 26 | FAQ_FUNC_TC_016 | Verify FAQ accessibility content is readable by screen reader labels where applicable. | src/features/faq/__tests__/accessibility.test.tsx:80 | reads the title, then Back, then each card | existing | pass |
| 27 | FAQ_FUNC_TC_016 | Verify FAQ accessibility content is readable by screen reader labels where applicable. | src/features/faq/__tests__/accessibility.test.tsx:98 | gives every card a button role, the question as label and an expanded state that follows the press | existing | pass |
| 28 | FAQ_FUNC_TC_017 | Verify FAQ offline/network error handling. | src/features/faq/__tests__/FaqScreen.test.tsx:205 | shows the error message and Retry when the first request fails, and the list after Retry | existing | pass |
| 29 | FAQ_FUNC_TC_017 | Verify FAQ offline/network error handling. | src/features/faq/__tests__/FaqStateView.test.tsx:36 | shows the exact error message and one Retry button that calls the handler | existing | pass |
| 30 | FAQ_FUNC_TC_018 | Verify FAQ data does not persist incorrectly after logout/session reset. | src/features/faq/__tests__/useFaqData.test.tsx:207 | loads a new list on the next open after the stored list was cleared | existing | pass |

## 3. Manual verification - 0

| TC ID | Test Case | Reason | Status |
|---|---|---|---|

No QA case needs a human check on its own, so `manual-verification.json` is not created.
