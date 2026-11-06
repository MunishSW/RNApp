# Feature Specification: Non-Logged-In (Pre-Login) Home Page

**Feature Branch**: `002-non-logged-in-home-page` (spec folder only; no git branch created)

**Created**: 2026-11-06

**Status**: Draft

**Version**: 1.0.0

**Input**: BRD `BRD_NonLoggedIn_Home_Page.docx` v1.0 (6 November 2026), sections 1-7 and 9; Figma file `8U75ofxf1zz5vVAzj1sqMU`, frame `BHFL_prelogin`, node `2:937` (360 x 812); QA cases `BHFL_Non_Logged_Home_Screen_Test_Cases.xlsx` [sheet: Non Logged Home Screen] (71 cases, `qa-cases.json`). Feature folder: `src/features/nonLoggedInHome/`.

**Reading rules for this spec**

- Every functional requirement carries its BRD area ID (4.1 to 4.9), the BRD rule IDs it enforces (BR-, TV-, PERF-, AVL-), and the scenario IDs (P-, N-, E-) that prove it.
- Text in `"double quotes"` is on-screen text, quoted exactly as in the BRD and Figma.
- Layout values (colour, font, size, gradient, spacing) come from Figma node 2:937 only. Where Figma and BRD word the same thing differently, the difference is listed in "Design Source Notes".
- Anything the BRD marks TBD, or lists in BRD section 12.2, is a `[NEEDS CLARIFICATION]` marker. Nothing in those areas is decided here. All markers are indexed in "Open Clarifications".
- This page has **no Register Now button, no chatbot entry point and no accessibility icon**.

## Clarifications

### Session 2026-11-06

- Q: When the app is older than the latest version but the update is optional, which buttons should the dismissable update dialog show? (O-07) → A: Option A. "Update" and "Skip"; "Skip" closes the dialog and it is shown again on the next fresh Home mount (no snooze).
- Q: Until Backend issues an error specification, which error behaviour should the spec treat as agreed for the token, FAQ and version services? (O-12) → A: Owner-supplied contract: shared envelope `returnStatus.returnCode` / `returnMessage`; auth failure = HTTP 401, HTTP 400 with "401" or "API_3000", or HTTP 200 with returnCode "401"; with no logged-in session, regenerate the token and retry once, else pass the original error on; "0000" generic success, "9999" processing difficulty; token service has no error contract; FAQ failure body not read; version services succeed on returnMessage "success", 401 shown as session expired, other non-success shows returnMessage or the generic server-error text.
- Implement-stage answers (owner, 2026-11-06): PERF-1 = Home interactive within 2 seconds of splash end; PERF-4 = tap-to-navigate under 200 ms; Track Application `link_name` = `track_application`.
- Plan-stage decisions (owner, 2026-11-06): (1) No WebView is used. (2) Pay Now opens a screen with a header titled "Pay Now" and a back button only (O-05 resolved; overrides BRD 4.2.6/4.2.7/7.3 WebView wording). (3) A version-service 401 shows no popup (overrides BRD 4.7.4 / 8.4.2 "Okay" dialog); the app-wide session-expired popup is also not shown. (4) `X-BHFL-Auth` is not needed on any call, FAQ or version (closes the version-service part of O-10). (5) Rubik Regular, Medium, SemiBold and Bold font files are taken from `C:\Users\MunishVira\Downloads\Rubik`.
- Q: Should the app keep sending the extra `X-BHFL-Auth` key with the FAQ request? (O-10) → A: Option B. Stop sending the key. If the FAQ service rejects the call without it, Backend and InfoSec decide a replacement before release.
- Q: When a visitor taps "Call Us", "Email Us" or "Find Us" in the Contact Us popup, what should happen? (O-06) → A: Option A. "Call Us" opens the phone dialer with 022-45297300; "Email Us" opens the mail app addressed to bhflwecare@bajajhousing.co.in; "Find Us" opens the Branch locator; the popup closes after each tap. Contact values still need Customer Care confirmation before release.
- Q: When a visitor taps the "Track Application" tile, where should the app take them? (O-03) → A: Option A. Open a non-logged Track Application flow owned by its own BRD. Home specifies only the tap hand-off and the return to Home; that flow's API and result screen are out of scope here.

---

## 1. Purpose

The Non-Logged-In Home page is the first screen a customer sees after the splash screen when nobody is signed in. Its job:

1. Move the visitor to Login quickly. The headline sells the reason: "Login to download account statements, make payments, and manage your account, on the go!".
2. Let the visitor do a few high-value things without logging in: pay an EMI, browse products, check an application, read FAQs, see pre-approved offers, reach customer care.
3. Quietly make sure the app is allowed to talk to pre-login services, and that outdated or under-maintenance builds are stopped.

**Why it matters (business drivers)**

| Driver | Why |
|---|---|
| Drive customers to log in | Login unlocks statements, payments and account management and reduces branch and call-centre load |
| Self-service without login | Pay Now, FAQs, Offers and Contact Us answer common needs with no friction |
| Lead generation | Our Products, Offers and Track Application bring prospects and applicants into the funnel |
| Security from the first screen | Pre-login calls are still authenticated at app level; mandatory updates and maintenance windows are enforced |
| Inclusive access | The first screen must work for screen-reader, large-text and high-contrast users (WCAG 2.1 AA, IS 17802) |

**Business goals** (BRD 2.3)

| Goal | Measure | Target |
|---|---|---|
| Visitors reach Login | Share of Home sessions that tap Login | [NEEDS CLARIFICATION: target is "TBD (baseline from analytics)" in BRD 2.3] |
| Tiles are discoverable and used | Tap-through rate per tile | [NEEDS CLARIFICATION: target is "TBD" in BRD 2.3] |
| Page is fast | Time to interactive on a mid-range device | Interactive within 2 seconds of splash end (PERF-1) |
| No dead ends | Share of FAQ taps that reach the FAQ list or a clear error | 100% (no silent failure for a genuine service failure) |
| Accessible by default | Pass at text 1x to 2x with 0.36em spacing and 2x line height, with TalkBack and VoiceOver | 100% of the accessibility checks in section 7.4 |

## 2. Scope and Out-of-Scope

### In scope

- The Home screen as designed in Figma node 2:937: illustration, headline, six quick-link tiles (Pay Now, Our Products, Track Application, FAQs, Offers, Contact Us) and the Login button.
- Hand-off from each tile and from the Login button to its destination (the destination screens are separate modules).
- Background pre-login token acquisition and its use on later pre-login calls.
- FAQ fetch-and-cache behaviour triggered by the FAQs tile, with its loading overlay and failure dialog.
- Contact Us popup (Call Us, Email Us, Find Us).
- App force-update and maintenance check that runs when this screen opens.
- Android hardware back: exit confirmation.
- Resetting leftover pre-login state (offers, selected offer, register return screen) whenever the screen regains focus.
- Accessibility (screen reader, large text, dark mode, high contrast, touch targets) for this screen.

### Out of scope

- Login (mobile / email / CIF / mPIN) screens and OTP flow: separate BRD.
- Register Now flow: its own module. There is no Register Now button on this page; registration is reached from the Login screen.
- Destination screens: Our Products, Offers (non-logged), FAQ list, Track Application result. (The Pay Now screen is a header and back button only; no payment content is built here.) Only the entry hand-off is specified here.
- Chatbot: not part of this page.
- Accessibility settings icon and panel: not shown on this page in this release.
- Any logged-in dashboard behaviour.
- Calculators: not part of this release.

## 3. Roles and Permissions

| Role | Description | What they can do here |
|---|---|---|
| Visitor (non-logged-in) | Anyone who opened the app and is not signed in: customers who have not logged in yet, prospects, applicants | View the page; use all six tiles and Login. No account data is shown |
| Existing customer (signed out) | A customer who logged out, whose session expired, or who has not logged in on this launch | Same as Visitor. After Login they move to the logged-in experience |
| Screen-reader / large-text user | Customer using TalkBack, VoiceOver, enlarged text or spacing, dark mode or high contrast | Same functions; layout and labels adapt (BRD 7.4) |

| Action | Visitor | Existing customer (signed out) |
|---|---|---|
| View Home page | Yes | Yes |
| Tap any of the six tiles | Yes | Yes |
| Tap Login | Yes | Yes |
| See account balances or personal data | No | No |
| Use FAQs, Offers, Contact Us | Yes | Yes |

Stakeholders with a stake in this spec: Business Owner (Digital), Product Manager, Design, Mobile Engineering, Backend / API, QA, InfoSec / Compliance, Customer Care, Customer / Visitor.

---

## 4. User Journeys *(BRD section 5)*

### Journey A - Visitor logs in (Priority: P1)

1. User opens the app and passes the splash screen.
2. Home appears; the token and version checks run quietly.
3. User reads the headline and taps "Login".
4. The Login screen opens; the user continues with mobile / email / CIF.

**Why P1**: Reaching Login is the page's primary goal (BR-8).
**Independent test**: Open Home, tap "Login", confirm Login opens. Delivers the whole business purpose on its own.
**Scenarios**: P-01, P-02.

1. **Given** no active session, **When** the app passes splash, **Then** Home shows the illustration, headline, six tiles and "Login" (P-01).
2. **Given** Home is shown, **When** the user taps "Login", **Then** the Login screen opens and a cta_clicked event is recorded (P-02).

### Journey G - Mandatory update (Priority: P1)

1. User opens an old build; Home appears.
2. The version check answers "mandatory"; a blocking dialog opens.
3. User taps "Update" (store opens) or "Exit" (Android only).

**Why P1**: Outdated builds must not continue (BR-9, security driver).
**Independent test**: Make the version service answer mandatory; confirm the blocking dialog and its two buttons.
**Scenarios**: N-07, E-12, E-08.

1. **Given** an older installed version and mandatory update enabled and status "Active", **When** the version answer arrives, **Then** a non-dismissable dialog shows "Update your app to experience all the latest features." with "Update" and "Exit" (N-07).
2. **Given** the same dialog on iOS, **When** it is shown, **Then** there is no "Exit" button and the dialog cannot be dismissed (E-12).

### Journey B - First-time FAQs (Priority: P2)

1. User taps "FAQs"; the FAQ cache is empty.
2. A blocking spinner appears; the app fetches the list.
3. The list returns; the spinner closes; the FAQ screen opens.
4. User taps back; Home appears again (state reset runs).

**Why P2**: High-volume self-service; avoids an empty FAQ screen (BR-6).
**Independent test**: Clear the cache, tap "FAQs", observe spinner then list; press back and land on Home.
**Scenarios**: P-07, P-08, P-13.

1. **Given** the FAQ list is already stored, **When** the user taps "FAQs", **Then** the FAQ screen opens at once with no spinner and no new request (P-07).
2. **Given** nothing is stored, **When** the user taps "FAQs" and the request succeeds with a non-empty list, **Then** the spinner closes and the FAQ screen opens (P-08).

### Journey F - FAQ failure and retry (Priority: P2)

1. User taps "FAQs" on a poor connection.
2. The request fails; the spinner closes; an error dialog appears.
3. User taps "Okay" and taps "FAQs" again; this time the fetch succeeds and the FAQ screen opens.

**Why P2**: No dead ends: a real failure must always be visible and recoverable.
**Independent test**: Fail the FAQ request once, then succeed.
**Scenarios**: N-02, N-10.

1. **Given** the FAQ request fails, **When** the failure is known, **Then** the spinner closes and a dialog shows "Your request could not be processed at this moment. Request you to try again after sometime." with one "Okay" button (N-02).

### Journey C - Pay Now (Priority: P2)

1. User taps "Pay Now".
2. The Pay Now screen opens with a header titled "Pay Now" and a back button.
3. User pays or backs out; Home is still behind.

**Scenarios**: P-03, N-10, N-11.

1. **Given** Home is shown, **When** the user taps "Pay Now", **Then** the Pay Now screen opens with a header titled "Pay Now" and a back button; the back button returns to Home (P-03).

### Journey D - Offers (Priority: P3)

1. User taps "Offers"; Offers (non-logged) opens.
2. User returns via back or "Ok"; Home resets the offers state.

**Scenarios**: P-05, P-13, E-10.

1. **Given** Home is shown, **When** the user taps "Offers", **Then** the non-logged Offers screen opens (P-05).
2. **Given** the user entered details in Offers, **When** they return to Home and reopen Offers, **Then** every field is empty and no offer is selected (P-13).

### Journey E - Contact Us (Priority: P3)

1. User taps "Contact Us"; a popup opens.
2. User picks Call, Email or Find Us (each hands off to the device app or Branch locator, FR-045) or closes the popup.

**Scenarios**: P-06, E-11.

1. **Given** Home is shown, **When** the user taps "Contact Us", **Then** a centred popup titled "We are here to help!" shows "Call Us", "Email Us" and "Find Us" over a dimmed Home (P-06).

### Journey H - Exit (Priority: P3)

1. On Android the user presses back on Home.
2. The dialog "Are you sure you want to exit!" appears.
3. User taps "Okay" to leave or "CANCEL" to stay.

**Scenarios**: P-11, P-12, E-11.

1. **Given** Home with no popup or dialog open on Android, **When** the user presses hardware back, **Then** the exit dialog shows (P-11, P-12).

### Process flow (BRD 5.9, plain steps)

1. Start: app launched, splash done, no session.
2. Show Home; start the token request and the version check without blocking the screen.
3. Version result: none -> continue; maintenance or mandatory -> blocking dialog; optional -> dismissable dialog.
4. User action: Login -> Login. Pay Now -> Pay Now screen. Our Products -> Products. Track Application -> non-logged Track Application flow. Offers -> Offers. Contact Us -> popup. FAQs -> step 5. Android back -> step 8.
5. FAQs: cache has items -> open FAQ. No -> spinner and fetch.
6. Fetch result: non-empty -> open FAQ. Empty -> stay on Home. Failed -> error dialog.
7. On any return to Home: reset offers state, selected offer and register return flag.
8. Exit dialog: "Okay" -> app closes. "CANCEL" -> back to step 4.

---

## 5. Functional Requirements

Each requirement lists: **BRD** area; **Rules** it enforces; **Scenarios** that prove it. A requirement with no scenario would be incomplete; none are left without one.

### 4.1 Landing Page Shell

*Purpose: a blue page with a friendly picture and one sentence telling the visitor why to log in.*

- **FR-001** The page MUST fill the whole screen with a solid brand-blue background `#035795`, with light-content status bar text. *Rules*: BR-1. *Scenarios*: P-01.
- **FR-002** The page MUST show a decorative illustration block 311 wide x 310 high (top padding 22, bottom padding 14) containing a 172 x 140 illustration (person with a phone showing a green tick), centred. The illustration is purely decorative: hidden from screen readers and exempt from dark-mode recolouring. *Rules*: BR-12. *Scenarios*: P-01, E-03, E-04.
- **FR-003** Below the illustration (28 gap) the page MUST show the headline, white, Rubik Regular 16 with line height 22, centred, reading exactly: "Login to download account statements, make payments, and manage your account, on the go!" shown on three lines: "Login to download account statements," / "make payments, and manage your" / "account, on the go!". The three-line break MUST be kept at default text size so it matches the approved design. *Rules*: BR-1. *Scenarios*: P-01.
- **FR-004** The page MUST use the Rubik font only (Regular for headline and tile labels, Medium for the Login label). Text MUST NOT fall back to a system font. *Scenarios*: P-01.
- **FR-005** The page MUST scroll when content is taller than the screen so enlarged text is never cut off; scroll indicators are hidden. Tapping the illustration or headline does nothing. *Rules*: BR-12. *Scenarios*: E-01, E-02, E-05, E-06.
- **FR-006** When the visitor's theme is dark or high contrast, the page colour MUST remap through theme tokens; the illustration stays unchanged. At default text size and light theme the look MUST be identical to Figma. *Rules*: BR-12. *Scenarios*: E-03.
- **FR-007** The page MUST be fully usable while background token and version calls are in flight: no visible loader, nothing blocks drawing. *Rules*: BR-2, BR-9. *Scenarios*: P-01, N-01.
- **FR-008** On small screens (320 x 568) content MUST scroll and Login MUST stay reachable; on tablet / wide screens the layout is [NEEDS CLARIFICATION: tablet and wide-screen layout rules are TBD, O-13; BRD scenario E-06 says "Content centred; no stretched tiles (TBD, O-13)"]. *Rules*: BR-12. *Scenarios*: E-05, E-06.
- **FR-009** Whether Home records a screen-view analytics event is [NEEDS CLARIFICATION: O-08, "Is a screen_view analytics event required for Home?"]. *Scenarios*: P-01.

### 4.2 Quick-Link Tile Grid

*Purpose: six icon buttons in two rows of three; each opens a pre-login service.*

Layout (Figma 2:943 / 2:944 / 2:945 / 2:956):

| Item | Value |
|---|---|
| Gap between illustration block and tile grid | 18 |
| Grid | 331 wide; two rows; 18 gap between rows; each row spreads its three tiles with space between |
| Tile | 96 wide; padding 12 horizontal, 16 vertical; radius 4; fully transparent white background; icon above label with 8 gap |
| Icon | white outline, height 40; widths: Pay Now 40, Our Products 43.636, Track Application 40 (height 40.234), FAQs 39.767, Offers 42.222, Contact Us 42.609 |
| Label | white, Rubik Regular 11.889, centred; label box widths: Pay Now 63, Our Products 74, Track Application 63, FAQs 82, Offers 63, Contact Us 63 |
| Row 1 | "Pay Now", "Our Products", "Track Application" (label wraps to two lines: "Track" / "Application") |
| Row 2 | "FAQs", "Offers", "Contact Us" |
| Content frame | 360 wide, 548 high, from the top of the page; grid and illustration centred in it |

| # | Tile | Icon (Figma) | Opens |
|---|---|---|---|
| 1 | "Pay Now" | Rupee-in-circle | Pay Now screen: header "Pay Now" and back button only |
| 2 | "Our Products" | Box | Products screen |
| 3 | "Track Application" | Info-in-circle | Separate non-logged Track Application flow (its own BRD; its API and result screen are out of scope here) |
| 4 | "FAQs" | Question-mark in circle | FAQ flow (4.5). The Figma layer is named Branch_locator but the label "FAQs" wins [NEEDS CLARIFICATION: O-15, Figma layer name to be renamed by Design] |
| 5 | "Offers" | Percent badge | Non-logged Offers screen |
| 6 | "Contact Us" | Headset | Customer Care popup (4.6) |

- **FR-010** The grid MUST show exactly six tiles in the fixed order "Pay Now", "Our Products", "Track Application", "FAQs", "Offers", "Contact Us" in a 3 + 3 layout, with exact label capitalisation. *Rules*: BR-4. *Scenarios*: P-01.
- **FR-011** The whole tile MUST be tappable, with a touch area of at least 44 x 44, role button, and accessibility label equal to the tile label. Tile icons are decorative and hidden from screen readers. Pressing gives standard pressed feedback with no layout shift. *Rules*: BR-4, BR-12. *Scenarios*: E-04.
- **FR-012** At text scale 1.5x or more the tiles MUST stack to one full-width column, icon aligned to the first text line, nothing clipped, page scrolling. At default settings the grid MUST be exactly the Figma layout. *Rules*: BR-4, BR-12. *Scenarios*: E-01, E-02.
- **FR-013** The "Track Application" label MUST wrap to two lines and the row heights MUST align with Figma (tile 108 high). *Rules*: BR-4. *Scenarios*: E-07.
- **FR-014** Tapping "Pay Now" MUST open the Pay Now screen: a header titled "Pay Now" and a back button, nothing else. The back button returns to Home. No web content, loader or error state is shown (no WebView is used). *Rules*: BR-5. *Scenarios*: P-03, N-11.
- **FR-015** Tapping "Our Products" MUST open Products; tapping "Offers" MUST open Offers (non-logged). *Rules*: BR-4. *Scenarios*: P-04, P-05.
- **FR-016** Tapping "Track Application" MUST open the non-logged Track Application flow defined in its own BRD, and returning from it MUST land on Home. Home does not call any Track Application service or show its result. *Rules*: BR-4, BR-11. *Scenarios*: P-14.
- **FR-017** Tapping "Contact Us" MUST mark the visitor as a non-logged user and open the Customer Care popup on top of Home (FR-043). It does not change screen. *Rules*: BR-7. *Scenarios*: P-06.
- **FR-018** Every tile tap MUST record a quick_link_clicked event first, then navigate, so a failed navigation is still counted. Properties: link_name (pay_now, products, faq, offers, contact_us; track_application), location = non_logged_home, logged_in = false. Contact Us also records contact_us_clicked with channel = non_logged_home. *Rules*: BR-4. *Scenarios*: P-03, P-04, P-05, P-06, P-14.
- **FR-019** Rapid taps on different tiles MUST open only one destination (no duplicate stack entries). *Rules*: BR-4. *Scenarios*: E-14.

### 4.3 Login Button

*Purpose: one big orange button that takes the visitor to Login.*

Layout (Figma 2:966 / 2:967): button frame 360 wide at y 588; button 307 x 40, centred; radius 82 (pill); padding 10 horizontal, 11.5 vertical; linear gradient at 133.83 degrees from `#FF512F` (5.56%) to `#F09819` (94.44%); label "Login" white, Rubik Medium 14, single line. Figma names the shared button component CTA (node 2:173).

- **FR-020** The page MUST show one primary button labelled exactly "Login", styled as above; its accessibility label equals its visible text. *Rules*: BR-8. *Scenarios*: P-01, P-02.
- **FR-021** Tapping "Login" MUST record cta_clicked (cta_name = login, screen = non_logged_home) and open the Login screen. No service is called on tap. *Rules*: BR-8. *Scenarios*: P-02.
- **FR-022** "Login" MUST never be disabled so a visitor can never be stuck on this page. Pressing gives standard pressed feedback. *Rules*: BR-8. *Scenarios*: P-02.
- **FR-023** The gradient and white label MUST be exempt from dark-mode remapping. At large text the button scrolls with content and stays reachable; touch area at least 44 x 44. *Rules*: BR-8, BR-12. *Scenarios*: E-03, E-05.
- **FR-024** The page MUST NOT show a Register Now button, a chatbot icon, or an accessibility icon. Registration is reached from the Login screen [NEEDS CLARIFICATION: O-01, confirm Register Now stays reachable from Login]. A pre-login chatbot entry is [NEEDS CLARIFICATION: O-02, confirm none is needed]. The accessibility settings entry point is [NEEDS CLARIFICATION: O-04, confirm where it lives]. *Rules*: BR-8. *Scenarios*: P-01, P-02.

### 4.4 Non-Logged Token Generation *(background, no UI)*

*Purpose: without asking the user, the app gets a short-lived "app pass" so the few pre-login services will answer it.*

- **FR-025** The app MUST request an app-level (non-logged) token without any user action: once at app start and once more when Home opens. *Rules*: BR-2. *Scenarios*: P-09, N-01.
- **FR-026** The app-level credentials MUST come from per-environment build configuration, be encrypted field by field before sending, and never be displayed or logged in release builds. *Rules*: BR-2; BRD 6.4. *Scenarios*: P-09. [NEEDS CLARIFICATION: O-16, static shared key and fixed associated data need an agreed rotation plan or a per-session exchange with Backend and InfoSec]
- **FR-027** A token response MUST be accepted only if its token is a non-empty string; it is kept in memory and mirrored to encrypted device storage. *Rules*: TV-1. *Scenarios*: P-09.
- **FR-028** Any later request without an Authorization header MUST get the token added automatically, and requests made while the token request is in flight MUST wait for it so an early call cannot fail for lack of a token. *Rules*: BR-3. *Scenarios*: P-09, N-01.
- **FR-029** A stale logged-in token MUST never be used as the non-logged token. The logged-in token is memory only and cleared on relaunch; after relaunch the old token is not used and a fresh non-logged token is obtained. *Rules*: BR-3; BRD 4.4.5. *Scenarios*: E-13.
- **FR-030** The token request MUST give up after 10 seconds. Any failure (network, timeout, client or server error) MUST be swallowed with no UI; Home stays usable and the next app start or Home mount tries again. *Rules*: BR-2, PERF-2. *Scenarios*: N-01.
- **FR-031** Service base addresses for the token, FAQ and version services are [NEEDS CLARIFICATION: O-09 base URLs per environment]. *Scenarios*: P-09, N-01.
- **FR-032** Backend responses carry a shared envelope `returnStatus.returnCode` / `returnStatus.returnMessage`. A call MUST be treated as an auth or session failure when: the HTTP status is 401; or the HTTP status is 400 and the body `statusCode` or `returnStatus.returnCode` is "401" or "API_3000"; or the HTTP status is 200 and the body `returnStatus.returnCode` is "401". With no logged-in session, an auth failure MUST regenerate the non-logged token and retry the call once; if the retry fails, the original error is passed on and no session-expired popup is shown. Return code "0000" is generic success; "9999" means the backend had difficulty processing the request. *Rules*: BR-2, BR-3. *Scenarios*: N-01, N-02, N-08.
- **FR-033** Per-call error contract: the token service reads only a non-empty `token` on success and has no error contract (every failure is swallowed, FR-030); the FAQ service reads a list of `question` / `answer` items on success and its failure body is not read (any failed call gives the FAQ error dialog, FR-040); the version services judge success by `returnStatus.returnMessage` equal to "success" and then read `maintenance_flag`, `maintenance_msg`, `version`, `force_update_flag`, `optional_update`, `status`, `target_url`. *Rules*: BR-2, BR-6, BR-9, TV-1, TV-2. *Scenarios*: P-09, N-02, N-08, N-09.
- **FR-034** No request on this page (FAQ or version) MUST carry the fixed `X-BHFL-Auth` key; each is authenticated by the app-level token only. No static key is shipped for these calls. *Rules*: BR-3. *Scenarios*: P-08, P-09, N-02.

### 4.5 FAQ Fetch and Navigation

*Purpose: avoid opening an empty FAQ screen and give clear feedback on failure.*

On-screen text: error message "Your request could not be processed at this moment. Request you to try again after sometime." with a single button "Okay" and no close icon. Blocking activity indicator while loading.

- **FR-035** Tapping "FAQs" MUST always mark that the FAQ was opened from this page so FAQ back returns to Home. *Rules*: BR-6. *Scenarios*: P-07, P-08.
- **FR-036** If an FAQ list is already stored, tapping "FAQs" MUST open the FAQ screen at once with no spinner and no new request. *Rules*: BR-6. *Scenarios*: P-07.
- **FR-037** If nothing is stored, the app MUST request the list (even if the token is missing; there is no pre-check) and show a blocking spinner; further FAQs taps are ignored until it ends. *Rules*: BR-6. *Scenarios*: P-08, N-05, N-10.
- **FR-038** A non-empty list MUST close the spinner, be stored for the session, and open the FAQ screen. *Rules*: BR-6. *Scenarios*: P-08.
- **FR-039** A successful but empty response MUST close the spinner, stay on Home and show no dialog. A response that is not a list MUST be treated as empty and never crash. *Rules*: BR-6, TV-2. *Scenarios*: N-03, N-04.
- **FR-040** A failed request MUST close the spinner, show the error dialog above, and record dialog_shown (dialog_name = faq_error, screen = non_logged_home, kind = error). "Okay" closes the dialog; the user stays on Home and may retry. The spinner MUST always clear. *Rules*: BR-6, PERF-3. *Scenarios*: N-02, N-10.
- **FR-041** There is no automatic retry of the FAQ request; the user retries by tapping "FAQs" again. The stored FAQ list is not cleared by Home. FAQ answer content format is [NEEDS CLARIFICATION: O-11, plain text or HTML]. *Rules*: BR-6. *Scenarios*: P-08, N-02.
- **FR-042** The loading spinner and the failure dialog MUST be announced to screen readers. *Rules*: BR-12. *Scenarios*: E-04.

### 4.6 Customer Care Popup

*Purpose: three contact routes without leaving the app unnecessarily.*

On-screen text (exact): heading "We are here to help!"; "Call Us" with "022-45297300"; "Email Us" with "bhflwecare@bajajhousing.co.in"; "Find Us" with "Branch locator". Contact values MUST be confirmed current by Customer Care before release [NEEDS CLARIFICATION: O-06, confirm contact values].

- **FR-043** The popup MUST be a centred popup over a dimmed Home, not a separate screen, showing the heading and three rows above. It is the same popup used on the login screens, in its pre-login variant. *Rules*: BR-7. *Scenarios*: P-06.
- **FR-044** The popup MUST be modal for screen readers (focus moves in and is held inside). *Rules*: BR-7, BR-12. *Scenarios*: P-06, E-04.
- **FR-045** Tapping "Call Us" MUST open the phone dialer with "022-45297300"; tapping "Email Us" MUST open the mail app addressed to "bhflwecare@bajajhousing.co.in"; tapping "Find Us" MUST open the Branch locator. The popup closes after each tap. *Rules*: BR-7. *Scenarios*: P-06.
- **FR-046** The popup MUST close on its close control, an outside tap, or Android back; on close, focus returns to the "Contact Us" tile. *Rules*: BR-7. *Scenarios*: P-06, E-11.
- **FR-047** At large text the popup height MUST be capped at window height minus insets minus 64 and scroll inside. No service is called. *Rules*: BR-7, BR-12. *Scenarios*: E-01, E-02.

### 4.7 Force-Update and Maintenance Gate

*Purpose: stop outdated or unsupported builds and show planned downtime. Runs when Home opens, once per fresh Home mount.*

On-screen text (exact): mandatory dialog "Update your app to experience all the latest features." with "Update" and "Exit"; maintenance dialog shows the message supplied by the server with a single "Exit" button (Android only); session and error dialogs show the server message with "Okay". The optional-update dialog uses the same message "Update your app to experience all the latest features." with the buttons "Update" and "Skip".

- **FR-048** On each fresh Home mount the app MUST ask the version service with the installed version and the platform name exactly "Android" or "iOS" (capitalised, never lowercase). *Rules*: BR-9, TV-5. *Scenarios*: P-10, E-09.
- **FR-049** The check MUST never block navigation or drawing; a dialog appears on top of Home after the answer arrives. *Rules*: BR-9. *Scenarios*: P-10, N-06.
- **FR-050** Installed and published versions MUST be compared by splitting on dots and comparing each part numerically; missing parts count as 0 (1.8.10 is newer than 1.8.9). *Rules*: TV-3. *Scenarios*: E-08.
- **FR-051** An update MUST be enforced only when the installed version is older and status equals "Active". *Rules*: TV-4. *Scenarios*: N-07, E-08.
- **FR-052** Maintenance flag "Y" MUST show a blocking maintenance dialog (not dismissable, no close icon) with "Exit" on Android. *Rules*: BR-9; AVL-3. *Scenarios*: N-06.
- **FR-053** A mandatory update (older version, mandatory flag "Y", status "Active") MUST show a blocking, non-dismissable dialog; "Update" opens the store link for the platform; "Exit" (Android only) closes the app. On iOS "Exit" is hidden and the dialog stays until the user updates or leaves via the app switcher. *Rules*: BR-9, TV-4. *Scenarios*: N-07, E-12.
- **FR-054** An optional update (older version, optional flag "Y", status "Active") MUST show a dismissable dialog with "Update" (opens the store link for the platform) and "Skip" (closes the dialog). There is no snooze: the dialog is shown again on the next fresh Home mount. *Rules*: BR-9, TV-4. *Scenarios*: N-07, E-08.
- **FR-055** A 401 session-expired answer MUST show no popup and no dialog; Home stays usable, and the logged-in token is cleared silently. Any other non-success MUST show the server message with "Okay", or the generic server-error text when the message is empty. *Rules*: BR-9. *Scenarios*: N-08.
- **FR-056** A failed call, an empty or null answer, or an up-to-date version MUST show nothing (fail open) so customers are never locked out by a server glitch. *Rules*: BR-9. *Scenarios*: P-10, N-09.
- **FR-057** The installed version MUST be remembered for the "App version" footer shown on other screens. The version-service contract (success marker, fields) is FR-033. *Rules*: BR-9. *Scenarios*: P-10.

### 4.8 Exit Confirmation

*Purpose: Android back on Home asks before leaving instead of doing nothing. iOS has no hardware back.*

On-screen text (exact, including the exclamation mark): "Are you sure you want to exit!" with buttons "CANCEL" and "Okay".

- **FR-058** On Android, hardware back on Home with no popup or dialog open MUST show the exit dialog. *Rules*: BR-10. *Scenarios*: P-11, P-12.
- **FR-059** "CANCEL" MUST close the dialog and keep the user on Home; "Okay" MUST close the app. *Rules*: BR-10. *Scenarios*: P-11, P-12.
- **FR-060** If the Contact Us popup or any other dialog is open, back MUST close that first; a second back then shows the exit dialog. *Rules*: BR-10. *Scenarios*: E-11.
- **FR-061** This behaviour applies to Home only; normal back behaviour MUST return when the user leaves the page. *Rules*: BR-10. *Scenarios*: P-11.

### 4.9 State Reset on Focus *(background, no UI)*

*Purpose: Home stays underneath pushed screens, so on every return it forgets half-finished offers or register steps.*

- **FR-062** Every time Home gains focus, the offers form (full name, mobile number, terms-accepted) MUST be reset to empty. *Rules*: BR-11. *Scenarios*: P-13, E-10.
- **FR-063** On the same event, the selected pre-approved offer MUST be cleared. *Rules*: BR-11. *Scenarios*: P-13, E-10.
- **FR-064** On the same event, the register-now return-screen flag MUST be set to none so a stale origin never locks the CIF field in Register Now. *Rules*: BR-11. *Scenarios*: P-13, E-10.
- **FR-065** The reset MUST run on every return including from Offers back, the Offers failure screen's "Ok", and FAQ back. It MUST NOT clear the stored FAQ list or the non-logged token, and MUST NOT call any service. *Rules*: BR-11. *Scenarios*: P-13, E-10, P-07.

### 7.4 Accessibility *(enforced by BR-12 across the areas above)*

- **FR-066** Screen reader order MUST be: headline, tiles in reading order (row 1 then row 2), "Login". Each tile and "Login" announces as a button with its label; illustration and tile icons are skipped. *Rules*: BR-12. *Scenarios*: E-04.
- **FR-067** At the maximum settings (text 2x, letter spacing 0.36em, line height 2x) all text MUST be readable with no clipping or overlap; no text may sit in a fixed-height box. *Rules*: BR-12. *Scenarios*: E-02.
- **FR-068** Colours MUST remap for dark mode and high contrast; the brand illustration and the "Login" gradient are exempt; meaning is never conveyed by colour alone. *Rules*: BR-12. *Scenarios*: E-03.
- **FR-069** All touch targets MUST be at least 44 x 44. *Rules*: BR-12. *Scenarios*: E-01, E-04.

### 7.1 / 7.5 Performance and compatibility *(added by retrofit: QA cases with no matching requirement)*

- **FR-070** Home MUST be interactive within 2 seconds of splash end on a mid-range device and MUST NOT wait for the token call. *Rules*: PERF-1. *Scenarios*: P-01. [added by retrofit - needs review]
- **FR-071** Home MUST NOT leak memory or listeners when tiles, popups and dialogs are opened and closed repeatedly, and MUST run no endless animation loops. *Rules*: PERF-5. *Scenarios*: E-14. [added by retrofit - needs review]
- **FR-072** Home MUST show the same layout and flows on Android and iOS, except the Android hardware back handling (FR-058) and the Android-only "Exit" button (FR-052, FR-053). *Rules*: BR-10. *Scenarios*: P-01. [added by retrofit - needs review]

---

## 6. Business Rules *(BR-1 to BR-12)*

| ID | Rule | Realised by | Scenarios |
|---|---|---|---|
| BR-1 | Home is shown only when there is no active logged-in session; no login is needed to view it | FR-001, FR-003 | P-01 |
| BR-2 | A non-logged token is requested on app start and on Home mount; failure is silent | FR-025, FR-026, FR-030, FR-007 | P-09, N-01 |
| BR-3 | Any later request without an Authorization header gets the token added automatically; calls wait for an in-flight token request | FR-028, FR-029 | P-09, E-13 |
| BR-4 | Six tiles in the fixed Figma order; the grid stacks to one column at text scale 1.5x or more | FR-010 to FR-013, FR-015, FR-016, FR-018, FR-019 | P-01, P-04, P-05, P-14, E-01, E-07, E-14 |
| BR-5 | Pay Now opens the Pay Now screen (header "Pay Now" and back button only; no WebView) | FR-014 | P-03, N-10, N-11 |
| BR-6 | FAQs: cache first; otherwise fetch; empty gives no dialog; failure gives the server-error dialog; double tap ignored while loading | FR-035 to FR-041 | P-07, P-08, N-02, N-03, N-04, N-05 |
| BR-7 | Contact Us is a popup, not a route | FR-017, FR-043 to FR-047 | P-06, E-11 |
| BR-8 | Login button is always enabled and goes to the Login screen | FR-020 to FR-024 | P-02 |
| BR-9 | Version check runs once per Home mount, never blocks navigation, and fails open | FR-048 to FR-057 | P-10, N-06 to N-09, E-08, E-09, E-12 |
| BR-10 | Android back on Home shows the exit confirmation; with a popup open, back closes the popup | FR-058 to FR-061 | P-11, P-12, E-11 |
| BR-11 | On every Home focus: reset offers state, selected offer and register return flag | FR-062 to FR-065 | P-13, E-10 |
| BR-12 | All interactive elements meet the accessibility rules in section 7.4 | FR-066 to FR-069, FR-002, FR-005, FR-006, FR-011, FR-012, FR-042, FR-044 | E-01 to E-06 |

### Input validations

This screen has no text input fields, so there are no field validations. The only inputs are taps. Validations for Login, OTP and Register Now are in their own BRDs.

### Token and response validations *(TV-1 to TV-5)*

| ID | Rule | User sees on failure | Realised by | Scenarios |
|---|---|---|---|---|
| TV-1 | A token response is accepted only if its token is a non-empty string | Nothing; later calls may fail with their own message | FR-027 | P-09, N-01 |
| TV-2 | An FAQ response is accepted only if it is a list; otherwise treated as empty | Nothing (stays on Home) | FR-039 | N-04 |
| TV-3 | Version comparison splits on dots and compares each part numerically; missing parts count as 0 | n/a | FR-050 | E-08 |
| TV-4 | Update is enforced only when status equals "Active" | n/a | FR-051, FR-053, FR-054 | N-07, E-08 |
| TV-5 | Version request platform name must be exactly "Android" or "iOS" | n/a | FR-048 | E-09 |

### Session and security rules (BRD 6.4)

- All calls travel over encrypted transport; the app credentials in the token request are encrypted field by field.
- Credentials come from per-environment build configuration, are never written into documents, and never logged in release builds.
- The non-logged token lives in memory and encrypted storage; the logged-in token is memory only and never leaks into a new launch.
- No personal data is collected or shown on this screen; screenshots are allowed.

## 7. Non-Functional Requirements

### 7.1 Performance

| ID | Requirement |
|---|---|
| PERF-1 | Home is interactive within 2 seconds of splash end on a mid-range device; it must not wait for the token call |
| PERF-2 | The token request gives up at 10 seconds |
| PERF-3 | The FAQ request uses the shared client timeout; the spinner must always clear |
| PERF-4 | Tap-to-navigate for local tiles (Products, Offers, Login) is under 200 ms |
| PERF-5 | Home must not leak memory; no endless animation loops |

### 7.2 Availability

| ID | Requirement |
|---|---|
| AVL-1 | Home must render fully with no network; only service-backed actions degrade |
| AVL-2 | Server availability target for the token, FAQ and version services: [NEEDS CLARIFICATION: TBD, O-14] |
| AVL-3 | Maintenance mode is announced through the version service maintenance flag |

### 7.3 Security

- Encrypted transport for every call; field encryption as in "Session and security rules".
- App integrity gates (root / jailbreak detection, anti-tamper, suspicious-app checks) run at app start before Home; hardening follows the VAPT report.
- No credentials in logs; crash and analytics payloads carry no personal data.
- No in-app web view is used on this page, so no host allow-list applies.

### 7.4 Usability and Accessibility

Standard: WCAG 2.1 AA and IS 17802. Covered by FR-066 to FR-069 and BR-12. The default look at text 1x and light theme MUST stay identical to Figma.

### 7.5 Compatibility

| Platform | Minimum version |
|---|---|
| Android | [NEEDS CLARIFICATION: TBD, project minimum, O-14] |
| iOS | [NEEDS CLARIFICATION: TBD, project deployment target, O-14] |
| Screen sizes | 360 x 812 reference; works from small phones to tablets with scrolling (tablet rules: O-13) |

### 7.6 Auditability and Logging

- Analytics events: quick_link_clicked, contact_us_clicked, cta_clicked, dialog_shown (properties as in FR-018, FR-021, FR-040).
- Service calls are logged with status and latency in debug builds only; release logs carry status codes only.
- Log retention: [NEEDS CLARIFICATION: TBD, O-14].

### 7.7 Localisation

English only in this release. All on-screen strings are held in one central label file so they can be translated later.

---

## 8. Scenarios *(BRD section 9)*

Every scenario maps to at least one functional requirement.

### 8.1 Positive (P-)

| ID | Scenario | Expected outcome | Requirement(s) |
|---|---|---|---|
| P-01 | Open app with no session | Home shows illustration, headline, six tiles, "Login" | FR-001 to FR-004, FR-007, FR-009, FR-010, FR-020, FR-024 |
| P-02 | Tap "Login" | Login screen opens; cta_clicked recorded | FR-020, FR-021, FR-022, FR-024 |
| P-03 | Tap "Pay Now" | Pay Now screen opens with header "Pay Now" and a back button; back returns to Home | FR-014, FR-018 |
| P-04 | Tap "Our Products" | Products opens | FR-015, FR-018 |
| P-05 | Tap "Offers" | Offers (non-logged) opens | FR-015, FR-018 |
| P-06 | Tap "Contact Us" | Popup shows Call Us, Email Us, Find Us | FR-017, FR-018, FR-043 to FR-046 |
| P-07 | Tap "FAQs" with stored list | FAQ opens immediately, no service call | FR-035, FR-036, FR-065 |
| P-08 | Tap "FAQs" without stored list, service succeeds | Spinner, then FAQ list | FR-035, FR-037, FR-038, FR-041 |
| P-09 | Token request succeeds | Token stored; later FAQ request carries it | FR-025 to FR-028, FR-031, FR-033 |
| P-10 | Version up to date | No dialog | FR-048, FR-049, FR-056, FR-057 |
| P-11 | Android back, then "Okay" | App exits | FR-058, FR-059, FR-061 |
| P-12 | Android back, then "CANCEL" | Stay on Home | FR-058, FR-059 |
| P-13 | Return from Offers | Offers state reset | FR-062 to FR-065 |
| P-14 | Tap "Track Application" | Opens the non-logged Track Application flow (own BRD); back returns to Home | FR-016, FR-018 |

### 8.2 Negative (N-)

| ID | Scenario | Expected outcome | Requirement(s) |
|---|---|---|---|
| N-01 | Token request fails or times out at 10 s | No UI; Home usable; a later FAQs tap shows the error dialog if it fails | FR-025, FR-028, FR-030, FR-031, FR-032, FR-007 |
| N-02 | FAQ service returns a server error | Spinner closes; dialog with exact message; dialog_shown recorded | FR-040, FR-041 |
| N-03 | FAQ service returns an empty list | Stay on Home; no dialog | FR-039 |
| N-04 | FAQ service returns a non-list | Treated as empty; no crash | FR-039 |
| N-05 | "FAQs" double-tapped while loading | Only one request | FR-037 |
| N-06 | Version answer has maintenance flag "Y" | Blocking maintenance dialog; "Exit" on Android | FR-049, FR-052 |
| N-07 | Version answer is mandatory update | Blocking dialog with "Update" and "Exit" | FR-051, FR-053, FR-054 |
| N-08 | Version answer is 401 | No popup; Home usable; logged-in token cleared silently | FR-055 |
| N-09 | Version call fails or body empty | No dialog (fail open) | FR-056 |
| N-10 | No network | Home renders; the Pay Now screen still opens (no network content); FAQs shows the error dialog | FR-014, FR-037, FR-040 |
| N-11 | Back button pressed on the Pay Now screen | Returns to Home; state reset runs on focus | FR-014, FR-065 |

### 8.3 Edge cases (E-)

| ID | Scenario | Expected outcome | Requirement(s) |
|---|---|---|---|
| E-01 | Text scale 1.5x or more | Tiles stack one per row; nothing clipped; page scrolls | FR-005, FR-012, FR-047, FR-069 |
| E-02 | Text 2x + spacing 0.36em + line height 2x | All text readable, no overlap | FR-005, FR-012, FR-047, FR-067 |
| E-03 | Dark mode and high contrast | Colours remap; illustration and "Login" unchanged | FR-002, FR-006, FR-023, FR-068 |
| E-04 | TalkBack / VoiceOver traversal | Headline, tiles row-wise, "Login"; icons skipped; roles announced | FR-002, FR-011, FR-042, FR-044, FR-066, FR-069 |
| E-05 | Small screen 320 x 568 | Content scrolls; "Login" reachable | FR-005, FR-008, FR-023 |
| E-06 | Tablet / wide screen | Content centred; no stretched tiles [NEEDS CLARIFICATION: O-13] | FR-005, FR-008 |
| E-07 | "Track Application" label wraps to 2 lines | Row heights align with Figma (tile 108 high) | FR-013 |
| E-08 | Version 1.8.10 versus 1.8.9 | Compared numerically; update offered correctly | FR-050, FR-051, FR-054 |
| E-09 | Platform name sent lowercase | Must not occur; always "Android" or "iOS" | FR-048 |
| E-10 | Return to Home from the Offers failure screen | State reset runs on focus | FR-062 to FR-065 |
| E-11 | Open "Contact Us" then press Android back | Popup closes first; second back shows the exit dialog | FR-046, FR-060 |
| E-12 | iOS mandatory update | No "Exit" button; dialog cannot be dismissed | FR-053 |
| E-13 | Relaunch after more than 15 min | Fresh non-logged token; old logged-in token not used | FR-029 |
| E-14 | Rapid taps on different tiles | Only one destination opens | FR-019 |

---

### Test-case -> FR traceability

| FR | Former id | BRD area |
|---|---|---|
| FR-001 | FR-4.1-01 | 4.1 |
| FR-002 | FR-4.1-02 | 4.1 |
| FR-003 | FR-4.1-03 | 4.1 |
| FR-004 | FR-4.1-04 | 4.1 |
| FR-005 | FR-4.1-05 | 4.1 |
| FR-006 | FR-4.1-06 | 4.1 |
| FR-007 | FR-4.1-07 | 4.1 |
| FR-008 | FR-4.1-08 | 4.1 |
| FR-009 | FR-4.1-09 | 4.1 |
| FR-010 | FR-4.2-01 | 4.2 |
| FR-011 | FR-4.2-02 | 4.2 |
| FR-012 | FR-4.2-03 | 4.2 |
| FR-013 | FR-4.2-04 | 4.2 |
| FR-014 | FR-4.2-05 | 4.2 |
| FR-015 | FR-4.2-06 | 4.2 |
| FR-016 | FR-4.2-07 | 4.2 |
| FR-017 | FR-4.2-08 | 4.2 |
| FR-018 | FR-4.2-09 | 4.2 |
| FR-019 | FR-4.2-10 | 4.2 |
| FR-020 | FR-4.3-01 | 4.3 |
| FR-021 | FR-4.3-02 | 4.3 |
| FR-022 | FR-4.3-03 | 4.3 |
| FR-023 | FR-4.3-04 | 4.3 |
| FR-024 | FR-4.3-05 | 4.3 |
| FR-025 | FR-4.4-01 | 4.4 |
| FR-026 | FR-4.4-02 | 4.4 |
| FR-027 | FR-4.4-03 | 4.4 |
| FR-028 | FR-4.4-04 | 4.4 |
| FR-029 | FR-4.4-05 | 4.4 |
| FR-030 | FR-4.4-06 | 4.4 |
| FR-031 | FR-4.4-07 | 4.4 |
| FR-032 | FR-4.4-09 | 4.4 |
| FR-033 | FR-4.4-10 | 4.4 |
| FR-034 | FR-4.4-08 | 4.4 |
| FR-035 | FR-4.5-01 | 4.5 |
| FR-036 | FR-4.5-02 | 4.5 |
| FR-037 | FR-4.5-03 | 4.5 |
| FR-038 | FR-4.5-04 | 4.5 |
| FR-039 | FR-4.5-05 | 4.5 |
| FR-040 | FR-4.5-06 | 4.5 |
| FR-041 | FR-4.5-07 | 4.5 |
| FR-042 | FR-4.5-08 | 4.5 |
| FR-043 | FR-4.6-01 | 4.6 |
| FR-044 | FR-4.6-02 | 4.6 |
| FR-045 | FR-4.6-03 | 4.6 |
| FR-046 | FR-4.6-04 | 4.6 |
| FR-047 | FR-4.6-05 | 4.6 |
| FR-048 | FR-4.7-01 | 4.7 |
| FR-049 | FR-4.7-02 | 4.7 |
| FR-050 | FR-4.7-03 | 4.7 |
| FR-051 | FR-4.7-04 | 4.7 |
| FR-052 | FR-4.7-05 | 4.7 |
| FR-053 | FR-4.7-06 | 4.7 |
| FR-054 | FR-4.7-07 | 4.7 |
| FR-055 | FR-4.7-08 | 4.7 |
| FR-056 | FR-4.7-09 | 4.7 |
| FR-057 | FR-4.7-10 | 4.7 |
| FR-058 | FR-4.8-01 | 4.8 |
| FR-059 | FR-4.8-02 | 4.8 |
| FR-060 | FR-4.8-03 | 4.8 |
| FR-061 | FR-4.8-04 | 4.8 |
| FR-062 | FR-4.9-01 | 4.9 |
| FR-063 | FR-4.9-02 | 4.9 |
| FR-064 | FR-4.9-03 | 4.9 |
| FR-065 | FR-4.9-04 | 4.9 |
| FR-066 | FR-7.4-01 | 7.4 |
| FR-067 | FR-7.4-02 | 7.4 |
| FR-068 | FR-7.4-03 | 7.4 |
| FR-069 | FR-7.4-04 | 7.4 |
| FR-070 | (new, added by retrofit) | 7.1 |
| FR-071 | (new, added by retrofit) | 7.1 |
| FR-072 | (new, added by retrofit) | 7.5 |

Former ids are kept only in this table.

| FR | QA cases |
|---|---|
| FR-001 | `HOME_LAYOUT_TC_001` |
| FR-002 | `HOME_LAYOUT_TC_001` |
| FR-003 | `HOME_LAYOUT_TC_001` |
| FR-004 | none |
| FR-005 | `HOME_NET_TC_007` |
| FR-006 | none |
| FR-007 | `HOME_LAYOUT_TC_003`, `HOME_NET_TC_001` |
| FR-008 | `HOME_NET_TC_007`, `HOME_NET_TC_008` |
| FR-009 | none |
| FR-010 | `HOME_LAYOUT_TC_001`, `HOME_LAYOUT_TC_002` |
| FR-011 | none |
| FR-012 | none |
| FR-013 | none |
| FR-014 | `HOME_ACTION_TC_001`, `HOME_ACTION_TC_010`, `HOME_NEG_TC_002`, `HOME_NET_TC_003` |
| FR-015 | `HOME_ACTION_TC_002`, `HOME_ACTION_TC_005` |
| FR-016 | `HOME_ACTION_TC_003` |
| FR-017 | `HOME_ACTION_TC_006` |
| FR-018 | `HOME_ACTION_TC_002`, `HOME_ACTION_TC_003`, `HOME_ACTION_TC_005` |
| FR-019 | `HOME_NET_TC_005`, `HOME_NET_TC_006` |
| FR-020 | `HOME_LAYOUT_TC_001` |
| FR-021 | `HOME_ACTION_TC_007` |
| FR-022 | none |
| FR-023 | none |
| FR-024 | `HOME_LAYOUT_TC_001` |
| FR-025 | `HOME_STATE_TC_002` |
| FR-026 | `HOME_TOKEN_TC_006` |
| FR-027 | `HOME_STATE_TC_002`, `HOME_TOKEN_TC_007` |
| FR-028 | `HOME_TOKEN_TC_001`, `HOME_TOKEN_TC_003` |
| FR-029 | `HOME_TOKEN_TC_004` |
| FR-030 | `HOME_STATE_TC_003`, `HOME_TOKEN_TC_002` |
| FR-031 | none |
| FR-032 | none |
| FR-033 | none |
| FR-034 | `HOME_TOKEN_TC_001` |
| FR-035 | `HOME_BACK_TC_005` |
| FR-036 | `HOME_ACTION_TC_004`, `HOME_ACTION_TC_009` |
| FR-037 | `HOME_ACTION_TC_004`, `HOME_ACTION_TC_008`, `HOME_FAQ_TC_003`, `HOME_FAQ_TC_004` |
| FR-038 | `HOME_ACTION_TC_004`, `HOME_ACTION_TC_008` |
| FR-039 | `HOME_FAQ_TC_001`, `HOME_FAQ_TC_002` |
| FR-040 | `HOME_NEG_TC_001`, `HOME_TOKEN_TC_005`, `HOME_FAQ_TC_006`, `HOME_FAQ_TC_007`, `HOME_NET_TC_002`, `HOME_NET_TC_004` |
| FR-041 | `HOME_FAQ_TC_005` |
| FR-042 | none |
| FR-043 | `HOME_ACTION_TC_006`, `HOME_CONTACT_TC_001`, `HOME_CONTACT_TC_006` |
| FR-044 | none |
| FR-045 | `HOME_CONTACT_TC_005` |
| FR-046 | `HOME_CONTACT_TC_002`, `HOME_CONTACT_TC_003` |
| FR-047 | `HOME_CONTACT_TC_004` |
| FR-048 | `HOME_VER_TC_010` |
| FR-049 | `HOME_LAYOUT_TC_003` |
| FR-050 | `HOME_VER_TC_007` |
| FR-051 | `HOME_VER_TC_006`, `HOME_VER_TC_007` |
| FR-052 | `HOME_VER_TC_002`, `HOME_VER_TC_012` |
| FR-053 | `HOME_VER_TC_003`, `HOME_VER_TC_004`, `HOME_VER_TC_011`, `HOME_VER_TC_012` |
| FR-054 | `HOME_VER_TC_005` |
| FR-055 | `HOME_VER_TC_008` |
| FR-056 | `HOME_VER_TC_001`, `HOME_VER_TC_009` |
| FR-057 | none |
| FR-058 | `HOME_BACK_TC_001` |
| FR-059 | `HOME_BACK_TC_002`, `HOME_BACK_TC_003` |
| FR-060 | `HOME_BACK_TC_004` |
| FR-061 | none |
| FR-062 | `HOME_STATE_TC_001`, `HOME_RESET_TC_001` |
| FR-063 | `HOME_STATE_TC_001`, `HOME_RESET_TC_002` |
| FR-064 | `HOME_STATE_TC_001`, `HOME_RESET_TC_003` |
| FR-065 | `HOME_STATE_TC_001`, `HOME_RESET_TC_004`, `HOME_RESET_TC_005` |
| FR-066 | none |
| FR-067 | none |
| FR-068 | none |
| FR-069 | none |
| FR-070 | `HOME_NET_TC_009` |
| FR-071 | `HOME_NET_TC_010` |
| FR-072 | `HOME_NET_TC_011` |

Any FR shown as `none` is a non-functional or process requirement verified through its tasks and manual checks, not a QA case.

The authoritative per-case table is `## TC -> Task coverage` in `tasks.md`.

## Key Entities

- **Visitor session state**: no signed-in customer; drives whether Home is shown (BR-1).
- **App-level token**: short-lived pass for pre-login calls; held in memory and encrypted storage; never the logged-in token.
- **FAQ list**: ordered question and answer pairs, stored for the session; cleared outside Home (for example on logout).
- **Offers form state**: full name, mobile number, terms-accepted; plus the selected pre-approved offer; reset on every Home focus.
- **Register return flag**: remembers where Register Now was entered from; reset to none on every Home focus.
- **Version status**: installed version, published version, status, maintenance flag and message, mandatory and optional flags, store link.
- **Quick-link tile**: label, icon, destination, analytics link name.

## Success Criteria

- **SC-001**: 100% of Home opens with no session show the illustration, headline, six tiles in the fixed order, and "Login", matching Figma node 2:937 at default settings.
- **SC-002**: A visitor reaches the Login screen with one tap from Home, 100% of the time, including when every background call has failed.
- **SC-003**: 100% of FAQs taps end in one of three clear outcomes: FAQ list opens, nothing changes (empty list, no dialog), or the error dialog appears. The spinner never stays on screen.
- **SC-004**: With the version, token and FAQ services unavailable, Home still draws fully and is usable (no lock-out, no blank page).
- **SC-005**: Home passes 100% of the accessibility checks at text 1x to 2x with 0.36em spacing and 2x line height, with TalkBack and VoiceOver, in dark mode and high contrast.
- **SC-006**: 100% of tile taps and Login taps are recorded as analytics events with the correct names and properties and no personal data.
- **SC-007**: Returning to Home from any screen leaves no previous offers entry, selected offer or register origin visible in 100% of cases.
- **SC-008**: Home becomes usable within 2 seconds after splash on a mid-range device.

## Assumptions

- The visitor has no valid logged-in session when this screen is shown.
- Tile labels and headline wording, including its three-line break, are final copy; Figma layer names are not copy.
- Pre-login credentials are supplied per environment through build configuration.
- Destination screens (Products, Offers, FAQ, Login) exist or are delivered by their own BRDs.
- Colour tokens and icons come from the design system; tile icons are exported from Figma.
- Environment-specific values (hosts, store links) are controlled through build flavours.
- English only in this release.
- iOS offers no supported way for an app to close itself, so the update dialog "Exit" button is Android only.

## Design Source Notes

- **Headline line breaks**: Figma node 2:942 holds the headline as one string that wraps inside the 311-wide block; the BRD fixes the three-line break. Both produce the same three lines at default size. This spec follows the BRD for the break.
- **Our Products tile height**: Figma gives this tile a fixed height of 94 with icon and label spaced apart; the other tiles size to content. The BRD gives 108 for the "Track Application" tile (two-line label). Row alignment is the rule (FR-013).
- **Colour token**: Figma lists "B&W/White" as `#FFFFFF`; the "Primory CTA Colour" variable has no value in Figma, so the CTA gradient values above come from the node itself.
- **Layer naming**: the FAQs tile layer is named Branch_locator (see O-15).

## Open Clarifications

None of these are guessed anywhere in this spec.

| Marker | Item | Owner (BRD 12.2) | Affects |
|---|---|---|---|
| O-01 | Confirm Register Now stays reachable from the Login screen | Product | FR-024 |
| O-02 | Confirm no pre-login chatbot entry point is needed | Product | FR-024 |
| O-03 | Track Application: destination resolved (separate non-logged flow, own BRD); analytics link name resolved as `track_application` | Product / Analytics | FR-018 |
| O-04 | Where the accessibility settings entry point lives | Design | FR-024 |
| O-05 | Pay Now view: resolved (no WebView; header "Pay Now" and back button only) | Design / Mobile | FR-014, N-11 |
| O-06 | Customer Care popup: tap actions resolved (device dialer, mail app, Branch locator). Still open: Customer Care to confirm contact values are current | Customer Care | FR-043 |
| O-07 | Optional update dialog: resolved ("Update" and "Skip"; no snooze, shown again on next fresh Home mount) | Product | FR-054 |
| O-08 | Is a screen-view analytics event required for Home | Analytics | FR-009 |
| O-09 | Base URLs for auth, FAQ, version services per environment (the payment portal URL is no longer used) | Backend / DevOps | FR-031 |
| O-10 | Extra auth header: resolved, not sent on FAQ or version calls (FR-034) | Backend / InfoSec | FR-034 |
| O-11 | FAQ answer content format (plain text or HTML) | Backend | FR-041 |
| O-12 | Error schema: resolved using the owner-supplied contract (FR-032, FR-033). Still open: Backend has issued no separate error specification, so it must confirm the shape before release | Backend | FR-032, FR-033 |
| O-13 | Tablet and wide-screen layout rules | Design | FR-008, E-06 |
| O-14 | Numeric targets: PERF-1 (2 s) and PERF-4 (200 ms) resolved. Still open: AVL-2, log retention, minimum OS versions, business goal targets in section 1 | Product / Engineering | AVL-2, 7.5, 7.6 |
| O-15 | Figma layer name Branch_locator on the FAQs tile | Design | Tile 4 |
| O-16 | Static shared key and fixed associated data: rotation plan or per-session exchange | Backend / InfoSec | FR-026 |
