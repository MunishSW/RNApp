# BRD: FAQ Screen (Pre-Login)

**Version**: 1.0  **Date**: 6 November 2026  **Owner**: Digital Product (BHFL)  **Status**: Approved for build

Design: Figma file `8U75ofxf1zz5vVAzj1sqMU`, frame `FAQs`, node `2:2068` (360 x 778).

## 1. Purpose

The FAQ screen lets a visitor who is not signed in read answers to common loan questions. It is opened from the "FAQs" tile on the pre-login Home page. It reduces calls to customer care and branch visits.

| Goal | Measure |
|---|---|
| Visitors find answers without calling | Share of FAQ sessions with at least one question opened |
| No dead ends | 100% of FAQ opens end in a list, an empty message, or a clear error with retry |
| Accessible by default | Works with a screen reader and at text size 2x |

## 2. Scope

In scope:
- The FAQ screen as designed in Figma node 2:2068: action bar with back arrow and title, and a list of question cards.
- Expand and collapse of each answer (accordion).
- Rendering of answer content that may contain simple HTML.
- Loading the list (using the list already fetched by Home when present), refreshing it, and showing loading, empty and error states.
- Back navigation to the pre-login Home page.
- Accessibility of this screen.

Out of scope:
- The pre-login Home page, its FAQs tile, and the first fetch of the list (already built; the Home page fetches and caches the list before opening this screen).
- FAQ search, categories, feedback buttons ("was this helpful"), sharing.
- Logged-in FAQs and any Track Application content.
- Editing FAQ content (managed by the backend).

## 3. Users

Any visitor who is not signed in: prospects, applicants, existing customers who have not logged in on this launch.

## 4. Functional requirements

### 4.1 Screen shell
- 4.1.1 The page background is light blue `#E3ECF5`. The action bar is 48 high, brand blue `#035795`, full width.
- 4.1.2 The action bar shows a white back arrow (21 x 18) at 18 from the left and the title "FAQs" in Rubik Regular 14, white, 11 to the right of the arrow. It shows nothing else.
- 4.1.3 The list sits 12 below the action bar, 18 from each side (324 wide at 360), with 8 between cards. The page scrolls when content is taller than the screen.
- 4.1.4 All text on the screen is Rubik. Colours and sizes come from theme tokens, not from the screen code.

### 4.2 FAQ list (accordion)
- 4.2.1 Each FAQ is one white card, corner radius 4, inner padding 12. The card shows the question in Rubik Regular 12 with line height 18, black, and a 20 x 20 orange chevron (down) at the right.
- 4.2.2 The full question text is shown, wrapping onto as many lines as needed. A question is never cut off with an ellipsis. Card height grows with the text.
- 4.2.3 Tapping a card opens its answer directly below the question inside the same card. Tapping an open card closes it. Several cards may be open at the same time.
- 4.2.4 The chevron turns upside down while the card is open.
- 4.2.5 Rapid repeated taps on the same or on different cards must never freeze or crash the screen. Each tap flips only the tapped card.
- 4.2.6 When the list is shown again after leaving and returning, all cards start closed.

### 4.3 Answer content
- 4.3.1 An answer may be plain text or simple HTML. The screen shows bold, italic, underline, line breaks, paragraphs, bulleted and numbered lists, and links. Any other tag is dropped and its text is kept. Scripts and styles are removed and never run.
- 4.3.2 A link in an answer opens in the phone's browser. A link that fails to open does nothing and does not crash.
- 4.3.3 A long answer is shown in full inside the card. The page scrolls; the answer is never clipped or placed in a small inner scroll box.
- 4.3.4 An answer that is empty or missing shows the card as normal; opening it shows no text and no error.

### 4.4 Loading the list
- 4.4.1 When the Home page already holds a list, the screen shows it at once with no loader.
- 4.4.2 Every time the screen comes into view, including returning to it, it asks the FAQ service for a fresh list once, quietly. A successful non-empty answer replaces the list on screen and the stored list.
- 4.4.3 When there is no list yet, the screen shows a blocking loading indicator until the request ends, then shows the list, the empty message or the error state.
- 4.4.4 Only the FAQ service is used for this screen's content. No other service, such as Track Application, is called.
- 4.4.5 A response that is not a list is treated as an empty list. An item with no question text is left out.
- 4.4.6 The stored list is cleared when the visitor session is reset (for example after a logout); the next opening then loads a new list.

### 4.5 Empty and error states
- 4.5.1 An empty list shows the message "No FAQs are available right now." in the middle of the page. There is no error dialog.
- 4.5.2 If the request fails (network lost, timeout, server error) and a stored list exists, the stored list stays on screen and nothing else is shown.
- 4.5.3 If the request fails and there is no stored list, the page shows the message "Your request could not be processed at this moment. Request you to try again after sometime." and one "Retry" button. "Retry" repeats the request with the loading indicator.
- 4.5.4 The loading indicator and the error message are announced to screen readers.

### 4.6 Navigation
- 4.6.1 The back arrow and the Android hardware back button return to the pre-login Home page. The target is stated explicitly, not "go back one".
- 4.6.2 Rapid taps on the back arrow go back once.

### 4.7 Accessibility
- 4.7.1 Each question card is a button whose accessibility label is the question text and whose state says whether it is open or closed. The chevron is hidden from screen readers.
- 4.7.2 The back arrow is a button labelled "Back" with a touch area of at least 44 x 44. The title "FAQs" is a heading.
- 4.7.3 Every card is at least 44 high.
- 4.7.4 At text size up to 2x with wider spacing, no text is clipped or overlaps.

## 5. Business rules

| ID | Rule |
|---|---|
| BR-1 | The FAQ screen never blocks the visitor from going back. |
| BR-2 | FAQ content comes only from the FAQ service. |
| BR-3 | A failed refresh never removes a list the visitor can already read. |
| BR-4 | The loading indicator always ends, whether the request succeeds, fails or times out. |
| BR-5 | Answer HTML is treated as untrusted: it is never executed. |

## 6. Non-functional requirements

- Performance: a stored list is on screen within 300 ms of opening. No endless animation. The chevron turn is a single short animation.
- Offline: with no network the screen still shows a stored list; with none it shows the error state.
- Security: answer content is rendered as text styles only, never as web content.
- Compatibility: Android and iOS, 320 x 568 up to tablets (content centred, at most 360 wide on wide screens).

## 7. Scenarios

| ID | Scenario | Expected |
|---|---|---|
| P-01 | Open FAQs with a stored list | List shows at once, no loader, cards closed |
| P-02 | Tap a question | Its answer opens, chevron turns |
| P-03 | Tap an open question | Answer closes |
| P-04 | Answer contains bold text and a list | Formatted text shows |
| P-05 | Return to FAQs after leaving | Fresh list is requested; all cards closed |
| P-06 | Tap back arrow | Home opens |
| N-01 | No list stored, service succeeds | Loader, then list |
| N-02 | No list stored, service fails | Error message and Retry |
| N-03 | Retry after failure succeeds | Loader, then list |
| N-04 | List stored, refresh fails | Stored list stays, no message |
| N-05 | Service answers with an empty list | Empty message |
| N-06 | Service answers with something that is not a list | Empty message, no crash |
| N-07 | Visitor session reset, then FAQs opened | List is loaded again |
| E-01 | Very long question | Wraps fully, no ellipsis |
| E-02 | Very long answer | Shows in full, page scrolls |
| E-03 | Ten rapid taps across cards | No freeze, each card flips once per tap |
| E-04 | Screen reader on | Cards announce as buttons with open or closed state |
| E-05 | Text size 2x | No clipping |
| E-06 | No network | Stored list or error state as above |
| E-07 | Hardware back on Android | Home opens |
