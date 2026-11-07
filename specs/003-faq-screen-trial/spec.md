# Feature Specification: FAQ Screen (Pre-Login)

**Feature Branch**: `003-faq-screen` (spec folder only; no git branch created)

**Created**: 2026-11-06

**Version**: 1.0.0

**Status**: Draft

**Input**: QA cases `docs/BHFL_FAQ_Test_Cases.xlsx` [sheet: FAQ Test Cases] (18 cases, `qa-cases.json`); BRD `docs/BRD_FAQ_Screen.md` v1.0 (6 November 2026); Figma file `8U75ofxf1zz5vVAzj1sqMU`, frame `FAQs`, node `2:2068` (360 x 778). Feature folder: `src/features/faq/`.

**Reading rules for this spec**

- Every functional requirement carries its BRD area ID (4.1 to 4.7), the BRD rules it enforces (BR-), and the scenario IDs (P-, N-, E-) that prove it.
- Text in `"double quotes"` is on-screen text, quoted exactly as in the BRD.
- Layout values (colour, font, size, spacing) come from Figma node 2:2068 only.
- This screen has no search, no categories, no feedback buttons and no share button.

## Clarifications

### Session 2026-11-06

- Q: Can several FAQ answers be open at once? → A: Yes. Each card toggles on its own.
- Q: What happens on a refresh failure when a stored list exists? → A: The stored list stays and nothing is shown (BR-3).
- Q: Which HTML is shown? → A: bold, italic, underline, line breaks, paragraphs, bulleted and numbered lists and links. Everything else is dropped and its text kept (BR-5).
- Plan-stage decisions (owner, 2026-11-06): (1) No WebView and no HTML library is added; answer HTML is converted to styled text by a small parser in the feature. (2) The shared FAQ service and FAQ store from the Home work are reused as they are. (3) The error state is part of the page, not a dialog. (4) Chevron and back arrow are the two SVGs from Figma, kept as local files and drawn with `react-native-svg`.

---

## 1. Purpose

The FAQ screen answers common loan questions for a visitor who is not signed in. It reduces calls and branch visits and must never leave the visitor at a dead end.

## 2. Scope and Out-of-Scope

### In scope
- The screen in Figma node 2:2068: action bar and question cards.
- Open and close of answers, answer rendering, loading, refresh, empty and error states, back navigation, accessibility.

### Out of scope
- The Home page FAQs tile and its first fetch (built earlier; it fills the stored list and opens this screen).
- Search, categories, feedback, sharing; logged-in FAQs; Track Application content; editing FAQ content.

## 3. Roles and Permissions

| Role | What they can do here |
|---|---|
| Visitor (not signed in) | Read FAQs, open and close answers, go back. No account data is shown. |

## 4. User Journeys

### Journey A - Read an answer (Priority: P1)

1. The visitor taps "FAQs" on Home; the FAQ screen shows the stored list.
2. The visitor taps a question; the answer opens under it.
3. The visitor taps it again; the answer closes.

**Independent test**: Render the screen with a stored list; press a card twice; assert open then closed.
**Scenarios**: P-01, P-02, P-03.

### Journey B - First load and failure (Priority: P1)

1. No list is stored; the screen shows a loader and requests the list.
2. On success the list appears. On failure the error message and "Retry" appear.

**Independent test**: Mock the service to resolve, then to reject.
**Scenarios**: N-01, N-02, N-03.

### Journey C - Refresh on return (Priority: P2)

1. The visitor leaves the screen and returns; a fresh list is requested quietly.
2. If the refresh fails the stored list stays.

**Scenarios**: P-05, N-04.

### Journey D - Formatted answers (Priority: P2)
The answer shows bold text, lists and links. **Scenarios**: P-04.

### Journey E - Back (Priority: P2)
Back arrow or hardware back opens Home. **Scenarios**: P-06, E-07.

## 5. Functional Requirements

### 4.1 Screen Shell
- **FR-001** The page MUST have a light-blue background `#E3ECF5`. The action bar MUST be 48 high, `#035795`, full width. *Rules*: BR-1. *Scenarios*: P-01.
- **FR-002** The action bar MUST show a white back arrow (21 x 18) 18 from the left and the title "FAQs" in Rubik Regular 14, white, 11 to the right of the arrow, and nothing else. *Scenarios*: P-01.
- **FR-003** The list MUST start 12 below the action bar, 18 from each side (324 wide at 360), with 8 between cards, and the page MUST scroll when the content is taller than the screen. *Scenarios*: P-01, E-02.
- **FR-004** All text MUST use Rubik; colours, sizes and spacing MUST come from theme tokens and all on-screen text from `faqConstants.ts`. *Scenarios*: P-01.
- **FR-005** On wide screens the content MUST stay centred in a column at most 360 wide. *Scenarios*: E-05.

### 4.2 FAQ List (Accordion)
- **FR-006** Each FAQ MUST be one white card, radius 4, padding 12, with the question in Rubik Regular 12 / line height 18, black, and a 20 x 20 orange chevron on the right. *Scenarios*: P-01.
- **FR-007** The full question MUST be shown, wrapping over as many lines as needed, never cut with an ellipsis; card height MUST follow the text. *Scenarios*: E-01.
- **FR-008** Tapping a card MUST open its answer under the question inside the same card; tapping an open card MUST close it; several cards MAY be open together. *Scenarios*: P-02, P-03.
- **FR-009** The chevron MUST be turned upside down while its card is open, with one short non-looping animation. *Scenarios*: P-02.
- **FR-010** Rapid repeated taps MUST never freeze or crash the screen and each tap MUST flip only the tapped card. *Scenarios*: E-03.
- **FR-011** Every time the screen is opened or returned to, all cards MUST start closed. *Scenarios*: P-05.

### 4.3 Answer Content
- **FR-012** An answer MUST show bold, italic, underline, line breaks, paragraphs, bulleted and numbered lists and links; every other tag is dropped and its text kept; script and style content is removed and never run. *Rules*: BR-5. *Scenarios*: P-04.
- **FR-013** A link MUST open in the phone browser; a link that cannot be opened MUST do nothing and MUST NOT crash. *Scenarios*: P-04.
- **FR-014** A long answer MUST show in full inside the card; the page scrolls; there is no inner scroll box. *Scenarios*: E-02.
- **FR-015** An empty or missing answer MUST open to an empty area without an error. *Scenarios*: P-02.

### 4.4 Loading the List
- **FR-016** When a list is stored the screen MUST show it at once with no loader. *Rules*: BR-3. *Scenarios*: P-01.
- **FR-017** Every time the screen comes into view the app MUST request a fresh list once, quietly; a non-empty answer replaces the list on screen and the stored list. *Scenarios*: P-05.
- **FR-018** When no list is stored the screen MUST show a blocking loader until the request ends, then the list, the empty message or the error state; the loader MUST always clear. *Rules*: BR-4. *Scenarios*: N-01, N-02.
- **FR-019** Only the FAQ service MUST be called for this screen's content. *Rules*: BR-2. *Scenarios*: P-05, N-01.
- **FR-020** A response that is not a list MUST be treated as empty; an item without question text MUST be left out. *Scenarios*: N-06.
- **FR-021** The stored list MUST be cleared when the visitor session is reset; the next open then loads a new list. *Scenarios*: N-07.

### 4.5 Empty and Error States
- **FR-022** An empty list MUST show "No FAQs are available right now." in the middle of the page with no dialog. *Scenarios*: N-05, N-06.
- **FR-023** When a refresh fails and a list is stored, the stored list MUST stay and nothing else is shown. *Rules*: BR-3. *Scenarios*: N-04, E-06.
- **FR-024** When the request fails and no list is stored the page MUST show "Your request could not be processed at this moment. Request you to try again after sometime." and one "Retry" button that repeats the request with the loader. *Scenarios*: N-02, N-03, E-06.
- **FR-025** The loader and the error message MUST be announced to screen readers. *Scenarios*: E-04.

### 4.6 Navigation
- **FR-026** The back arrow and the Android hardware back button MUST open the pre-login Home page with an explicit target. *Rules*: BR-1. *Scenarios*: P-06, E-07.
- **FR-027** Rapid taps on the back arrow MUST go back once. *Scenarios*: P-06.

### 4.7 Accessibility
- **FR-028** Each card MUST be a button labelled with the question text and a state of open or closed; the chevron MUST be hidden from screen readers. *Scenarios*: E-04.
- **FR-029** The back arrow MUST be a button labelled "Back" with a touch area of at least 44 x 44; the title MUST be a heading. *Scenarios*: E-04.
- **FR-030** Every card MUST be at least 44 high. *Scenarios*: E-04.
- **FR-031** At text scale up to 2x no text may be clipped or overlap. *Scenarios*: E-05.

## 6. Business Rules

| ID | Rule | Realised by |
|---|---|---|
| BR-1 | The screen never blocks going back | FR-026, FR-001 |
| BR-2 | Content comes only from the FAQ service | FR-019 |
| BR-3 | A failed refresh never removes a readable list | FR-016, FR-023 |
| BR-4 | The loader always ends | FR-018 |
| BR-5 | Answer HTML is untrusted and never executed | FR-012 |

## 7. Non-Functional Requirements

- Performance: a stored list is on screen within 300 ms of opening; no endless animation; listeners and timers cleaned up.
- Offline: handled as a failed request (FR-023, FR-024).
- Security: answers are rendered as styled text only.
- Compatibility: Android and iOS, 320 x 568 up to tablets.

## 8. Scenarios

### 8.1 Positive (P-)

| ID | Scenario | Expected outcome | Requirement(s) |
|---|---|---|---|
| P-01 | Open FAQs with a stored list | List shows at once, no loader, cards closed | FR-001 to FR-004, FR-006, FR-016 |
| P-02 | Tap a question | Answer opens, chevron turns | FR-008, FR-009, FR-015 |
| P-03 | Tap an open question | Answer closes | FR-008 |
| P-04 | Answer has bold text, a list and a link | Formatted text shows; link opens browser | FR-012, FR-013 |
| P-05 | Return after leaving | Fresh list requested; cards closed | FR-011, FR-017, FR-019 |
| P-06 | Tap back arrow | Home opens | FR-026, FR-027 |

### 8.2 Negative (N-)

| ID | Scenario | Expected outcome | Requirement(s) |
|---|---|---|---|
| N-01 | No list, service succeeds | Loader, then list | FR-018, FR-019 |
| N-02 | No list, service fails | Error message and Retry | FR-018, FR-024 |
| N-03 | Retry succeeds | Loader, then list | FR-024 |
| N-04 | List stored, refresh fails | List stays, nothing shown | FR-023 |
| N-05 | Service answers with an empty list | Empty message | FR-022 |
| N-06 | Service answers with a non-list | Empty message, no crash | FR-020, FR-022 |
| N-07 | Session reset, then FAQs opened | List loaded again | FR-021 |

### 8.3 Edge cases (E-)

| ID | Scenario | Expected outcome | Requirement(s) |
|---|---|---|---|
| E-01 | Very long question | Wraps fully, no ellipsis | FR-007 |
| E-02 | Very long answer | Shows in full, page scrolls | FR-003, FR-014 |
| E-03 | Ten rapid taps | No freeze; one flip per tap | FR-010 |
| E-04 | Screen reader on | Cards announce as buttons with state | FR-025, FR-028 to FR-030 |
| E-05 | Text size 2x; wide screen | No clipping; centred column | FR-005, FR-031 |
| E-06 | No network | Stored list, or error state | FR-023, FR-024 |
| E-07 | Android hardware back | Home opens | FR-026 |

## Key Entities

- **FaqItem**: `{question, answer}`; shared type from the FAQ store; the answer may contain simple HTML.
- **AnswerBlock**: a parsed piece of an answer: paragraph, list item or link run, with style flags.
- **FaqScreenState**: `loading | list | empty | error`, plus the set of open card keys.

## Success Criteria

- **SC-001**: At text 1x the screen matches Figma node 2:2068 for structure, order, text and token colours.
- **SC-002**: Every scenario P-, N-, E- has an automated test or a documented manual check.
- **SC-003**: 100% of failed first loads end in the error state with the loader cleared.
- **SC-004**: With a stored list the first paint does not wait for the refresh request.

## Assumptions

- The Home page fetches and stores the list before opening this screen (spec 002); the shared FAQ service and store are reused unchanged.
- The Rubik font and theme tokens already exist in the project.
- No new dependency is added.

## Open Clarifications

- [NEEDS CLARIFICATION: O-01] Should FAQ answers support images? Not in this release.
- [NEEDS CLARIFICATION: O-02] Should the list refresh show a pull-to-refresh control? Not in this release.
