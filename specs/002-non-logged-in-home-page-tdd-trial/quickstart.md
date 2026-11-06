# Quickstart: Non-Logged-In Home Page

Run and validation guide. Contracts: [contracts/](contracts/). State: [data-model.md](data-model.md). Requirements: [spec.md](spec.md).

## Prerequisites

- Node >= 22.11, project dependencies installed (`npm install`).
- A `.env` copied from `.env.example` with per-environment values: `API_URL`, `AUTH_API_URL`, `API_BASE_URL`, `NON_LOGGED_AUTH_USERNAME`, `NON_LOGGED_AUTH_PASSWORD`, `FIELD_ENCRYPTION_KEY`, `FIELD_ENCRYPTION_AAD`, `STORAGE_ENCRYPTION_KEY`, `REQUEST_TIMEOUT_MS`. Never commit it. Values are provided by the owners (O-09, O-16).
- Fonts: `Rubik-SemiBold.ttf` and `Rubik-Bold.ttf` are already in `src/assets/fonts/` (copied from `the Downloads/Rubik folder`); the page itself uses Regular and Medium. After adding fonts, rebuild the native app so they are linked.
- Default test conditions: fresh install, no session, network available, text 1x, light theme.

## Automated checks

```text
npm run lint
npx tsc --noEmit
npm test
npm test -- src/features/nonLoggedInHome
```

Expected: typecheck and lint clean; all existing tests still pass (zero regressions); new Home tests pass. Test groups and the spec items they prove:

| Group | Proves |
|---|---|
| Layout and content (screen, constants) | BRD area 4.1, FR-010, FR-020; P-01; exact label text |
| Tiles and navigation (hooks, screen) | BRD area 4.2, FR-021; P-02 to P-06, P-14, E-14 |
| FAQ flow | BRD area 4.5; P-07, P-08, N-02 to N-05 |
| Token and shared client | BRD area 4.4; P-09, N-01, E-13 |
| Version gate | BRD area 4.7; P-10, N-06 to N-09, E-08, E-09, E-12 |
| Exit confirmation | BRD area 4.8; P-11, P-12, E-11 |
| Focus reset | BRD area 4.9; P-13, E-10 |
| Accessibility | BRD area 7.4; E-01 to E-04 |

## Run the app

```text
npm start
npm run android      # or: npm run ios
```

## Manual validation scenarios

Each has steps, expected result and owner (constitution Delivery Standards). Owner is the QA lead unless stated.

| # | Steps | Expected | Spec |
|---|---|---|---|
| M-1 | Launch with no session; compare with Figma node 2:937 | `#035795` page, illustration, headline on three lines, 3 + 3 tiles, orange "Login" pill; light status bar; no Register Now, chatbot or accessibility icon | P-01 |
| M-2 | Tap "Login" | Login screen opens | P-02 |
| M-3 | Tap each tile | Pay Now: screen with header "Pay Now" and a back button (back returns to Home); Our Products, Offers, Track Application: destination opens; FAQs: per M-5; Contact Us: popup | P-03 to P-06, P-14 |
| M-4 | Open Contact Us, tap each row, close | dialer, mail app, Branch locator; popup closes after each; focus returns to the tile | P-06 |
| M-5 | Clear FAQ cache; tap "FAQs"; then tap again after back | spinner then FAQ list; second time opens at once, no request | P-07, P-08; QA HOME_FAQ_TC_004 |
| M-6 | Block the FAQ service; tap "FAQs" | dialog "Your request could not be processed at this moment. Request you to try again after sometime." with "Okay" | N-02 |
| M-7 | Mock version answers: maintenance, mandatory, optional, 401, failure | dialogs per `contracts/force-update.md`; 401 and failure show nothing | N-06 to N-09 |
| M-8 | On Android press back; "CANCEL"; again "Okay"; with the popup open press back twice | exit dialog; stays; app exits; popup closes first then exit dialog | P-11, P-12, E-11 |
| M-9 | Enter data in Offers, return Home, reopen Offers | fields empty, no offer selected | P-13 |
| M-10 | Set text scale 1.5x, then 2x with 0.36em spacing and 2x line height | tiles stack, nothing clipped, page scrolls | E-01, E-02 |
| M-11 | TalkBack and VoiceOver swipe | headline, six tiles in order, "Login"; icons skipped; buttons announced | E-04 |
| M-12 | Dark mode and high contrast | colours remap per tokens; illustration and "Login" unchanged. Remapped values are an open Design item | E-03 |
| M-13 | 320 x 568 and a tablet | scrolls, "Login" reachable; tablet rules open (O-13) | E-05, E-06 |
| M-14 | Throttle the token service by 15 s | Home draws at once; token call aborts at 10 s | N-01 |
| M-15 | Cold start on a mid-range device; time from splash end to a tappable Home | within 2 seconds (PERF-1) | QA HOME_NET_TC_009 |
| M-16 | Open and close tiles 50 times with a memory profiler | memory stable; no crash | QA HOME_NET_TC_010 |
| M-17 | Android and iOS side by side | same layout and flows except hardware back and the Android-only Exit button | QA HOME_NET_TC_011 |

PERF-1 (Home interactive within 2 seconds of splash end) and PERF-4 (tap-to-navigate under 200 ms) are pass or fail checks. AVL-2, log retention and minimum OS versions still have no target (O-14), so they are not checked.

## Done when

- Automated checks green, no skipped tests.
- Manual scenarios M-1 to M-14 run and recorded with the owner's name.
- Every open item in the spec "Open Clarifications" table is either closed or listed in the release notes.
