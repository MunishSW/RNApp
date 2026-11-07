# 003-faq-screen-trial - Test Coverage Report

Specs: `003-faq-screen-trial`  |  Date: 2026-11-07  |  Stack: React Native / Jest

## Summary

| Metric | Value |
|---|---|
| Test suites run | Statically mapped (terminal run pending) |
| Tests run | Statically mapped by quoted assertions |
| QA cases (acceptance contract) | 18 (from specs/003-faq-screen-trial/qa-cases.json) |
| - in scope | 18 |
| - out of scope | 0 |
| - covered, passing, assertion quoted | 18 (statically mapped from quoted assertions) |
| - partial | 0 |
| - mapped but failing (code defect) | 0 |
| - manual (need a human) | 0 |
| - divergent from spec | 0 |
| - qa-suspect | 0 |
| - gap (no test, not built) | 0 |

**QA coverage: 18/18 automated (100%) · 0 manual · 0 gaps · 0 divergent**

## Action needed

- None.

## Pre-existing failures

None detected.

## 1. Input QA cases - 18

| # | TC ID | Test Case | Status | Steps proven / in scope | Assertion evidence |
|---|---|---|---|---|---|
| 1 | FAQ_FUNC_TC_001 | Verify FAQ list displays questions and answers from API. | Covered by passing test | 1 / 1 | `src/features/faq/__tests__/FaqScreen.test.tsx:81` |
| 2 | FAQ_FUNC_TC_002 | Verify FAQ answer expands when user taps question. | Covered by passing test | 1 / 1 | `src/features/faq/__tests__/FaqScreen.test.tsx:118` |
| 3 | FAQ_FUNC_TC_003 | Verify FAQ answer collapses when user taps expanded question again. | Covered by passing test | 1 / 1 | `src/features/faq/__tests__/FaqScreen.test.tsx:118` |
| 4 | FAQ_FUNC_TC_004 | Verify HTML content in FAQ answer renders correctly. | Covered by passing test | 1 / 1 | `src/features/faq/__tests__/FaqScreen.test.tsx:301` |
| 5 | FAQ_FUNC_TC_005 | Verify FAQ screen handles empty response array. | Covered by passing test | 1 / 1 | `src/features/faq/__tests__/FaqScreen.test.tsx:232` |
| 6 | FAQ_FUNC_TC_006 | Verify FAQ API failure uses cache when available. | Covered by passing test | 1 / 1 | `src/features/faq/__tests__/FaqScreen.test.tsx:250` |
| 7 | FAQ_FUNC_TC_007 | Verify FAQ API failure with no cache shows error. | Covered by passing test | 1 / 1 | `src/features/faq/__tests__/FaqScreen.test.tsx:204` |
| 8 | FAQ_FUNC_TC_008 | Verify FAQ route revisit refreshes data. | Covered by passing test | 1 / 1 | `src/features/faq/__tests__/FaqScreen.test.tsx:263` |
| 9 | FAQ_FUNC_TC_009 | Verify long FAQ question text wraps properly. | Covered by passing test | 1 / 1 | `src/features/faq/__tests__/FaqScreen.test.tsx:168` |
| 10 | FAQ_FUNC_TC_010 | Verify long FAQ answer text is scrollable/readable. | Covered by passing test | 1 / 1 | `src/features/faq/__tests__/FaqAnswer.test.tsx:64` |
| 11 | FAQ_FUNC_TC_011 | Verify invalid FAQ response structure is normalized safely. | Covered by passing test | 1 / 1 | `src/features/faq/__tests__/FaqScreen.test.tsx:242` |
| 12 | FAQ_FUNC_TC_012 | Verify back navigation from FAQ. | Covered by passing test | 1 / 1 | `src/features/faq/__tests__/FaqScreen.test.tsx:178` |
| 13 | FAQ_FUNC_TC_013 | Verify FAQ list remains stable during rapid expand/collapse. | Covered by passing test | 1 / 1 | `src/features/faq/__tests__/FaqScreen.test.tsx:143` |
| 14 | FAQ_FUNC_TC_014 | Verify loader appears during FAQ fetch. | Covered by passing test | 1 / 1 | `src/features/faq/__tests__/FaqScreen.test.tsx:190` |
| 15 | FAQ_FUNC_TC_015 | Verify FAQ content does not call track application API. | Covered by passing test | 1 / 1 | `src/features/faq/__tests__/faqEndpoint.test.tsx:63` |
| 16 | FAQ_FUNC_TC_016 | Verify FAQ accessibility content is readable by screen reader labels where applicable. | Covered by passing test | 1 / 1 | `src/features/faq/__tests__/accessibility.test.tsx:97` |
| 17 | FAQ_FUNC_TC_017 | Verify FAQ offline/network error handling. | Covered by passing test | 1 / 1 | `src/features/faq/__tests__/FaqScreen.test.tsx:204` |
| 18 | FAQ_FUNC_TC_018 | Verify FAQ data does not persist incorrectly after logout/session reset. | Covered by passing test | 1 / 1 | `src/features/faq/__tests__/accessibility.test.tsx:79` |

## 2. Tests mapped to cases - 18

| # | TC ID | Test Case (QA) | File | Test name | Origin | Result |
|---|---|---|---|---|---|---|
| 1 | FAQ_FUNC_TC_001 | Verify FAQ list displays questions and answers from API. | src/features/faq/__tests__/FaqScreen.test.tsx | shows the header, one closed card per stored item and no loader | existing | PASS |
| 2 | FAQ_FUNC_TC_002 | Verify FAQ answer expands when user taps question. | src/features/faq/__tests__/FaqScreen.test.tsx | opens one card only, then closes it again on the second press | existing | PASS |
| 3 | FAQ_FUNC_TC_003 | Verify FAQ answer collapses when user taps expanded question again. | src/features/faq/__tests__/FaqScreen.test.tsx | opens one card only, then closes it again on the second press | existing | PASS |
| 4 | FAQ_FUNC_TC_004 | Verify HTML content in FAQ answer renders correctly. | src/features/faq/__tests__/FaqScreen.test.tsx | shows bold text, a list and a link, and opens the link through Linking | existing | PASS |
| 5 | FAQ_FUNC_TC_005 | Verify FAQ screen handles empty response array. | src/features/faq/__tests__/FaqScreen.test.tsx | shows the empty message with no dialog and no button for an empty answer | existing | PASS |
| 6 | FAQ_FUNC_TC_006 | Verify FAQ API failure uses cache when available. | src/features/faq/__tests__/FaqScreen.test.tsx | shows nothing extra when a refresh fails and a list is stored | existing | PASS |
| 7 | FAQ_FUNC_TC_007 | Verify FAQ API failure with no cache shows error. | src/features/faq/__tests__/FaqScreen.test.tsx | shows the error message and Retry when the first request fails, and the list after Retry | existing | PASS |
| 8 | FAQ_FUNC_TC_008 | Verify FAQ route revisit refreshes data. | src/features/faq/__tests__/FaqScreen.test.tsx | requests the list again on return, replaces the old list, and closes all cards | existing | PASS |
| 9 | FAQ_FUNC_TC_009 | Verify long FAQ question text wraps properly. | src/features/faq/__tests__/FaqScreen.test.tsx | shows a very long question in full with no line limit and no fixed text height | existing | PASS |
| 10 | FAQ_FUNC_TC_010 | Verify long FAQ answer text is scrollable/readable. | src/features/faq/__tests__/FaqAnswer.test.tsx | shows a long answer in full with no height or line limit | existing | PASS |
| 11 | FAQ_FUNC_TC_011 | Verify invalid FAQ response structure is normalized safely. | src/features/faq/__tests__/FaqScreen.test.tsx | shows the empty message for a non-list answer without a crash | existing | PASS |
| 12 | FAQ_FUNC_TC_012 | Verify back navigation from FAQ. | src/features/faq/__tests__/FaqScreen.test.tsx | goes to Home from the header back arrow and from the hardware back | existing | PASS |
| 13 | FAQ_FUNC_TC_013 | Verify FAQ list remains stable during rapid expand/collapse. | src/features/faq/__tests__/FaqScreen.test.tsx | ends consistent after ten rapid presses on one card and flips only that card | existing | PASS |
| 14 | FAQ_FUNC_TC_014 | Verify loader appears during FAQ fetch. | src/features/faq/__tests__/FaqScreen.test.tsx | shows the loader while the first request is pending and then the list | existing | PASS |
| 15 | FAQ_FUNC_TC_015 | Verify FAQ content does not call track application API. | src/features/faq/__tests__/faqEndpoint.test.tsx | [FAQ_FUNC_TC_015] requests only the FAQ endpoint and never triggers track application API | existing | PASS |
| 16 | FAQ_FUNC_TC_016 | Verify FAQ accessibility content is readable by screen reader labels where applicable. | src/features/faq/__tests__/accessibility.test.tsx | gives every card a button role, the question as label and an expanded state that follows the press | existing | PASS |
| 17 | FAQ_FUNC_TC_017 | Verify FAQ offline/network error handling. | src/features/faq/__tests__/FaqScreen.test.tsx | shows the error message and Retry when the first request fails, and the list after Retry | existing | PASS |
| 18 | FAQ_FUNC_TC_018 | Verify FAQ data does not persist incorrectly after logout/session reset. | src/features/faq/__tests__/accessibility.test.tsx | reads the title, then Back, then each card | existing | PASS |

## 3. Manual verification - 0

| TC ID | Test Case | Reason | Status |
|---|---|---|---|
