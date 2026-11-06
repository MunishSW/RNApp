# Manual Checks: Non-Logged-In (Pre-Login) Home Page

**Purpose**: device checks that automated tests cannot prove (constitution Delivery Standards: steps, expected result, owner).
**Feature**: [spec.md](../spec.md) | **Run guide**: [quickstart.md](../quickstart.md)
**Status**: NOT RUN. These need a device or emulator. Results, owner names and dates are filled in by the person who runs them.

Default conditions: fresh install, no session, network available, text 1x, light theme.

## Accessibility (T065: BR-12, BRD 7.4)

| # | Steps | Expected | Spec | Owner | Result | Date |
|---|---|---|---|---|---|---|
| M-10 | Set text scale 1.5x, then 2x; with 2x also set 0.36em letter spacing and 2x line height. Open Home and scroll | Tiles stack in one full-width column; nothing clipped or overlapping; page scrolls; "Login" reachable | FR-012, FR-067; E-01, E-02; HOME_CONTACT_TC_004 | QA lead (to assign) | not run | |
| M-11 | Turn on TalkBack (Android) and VoiceOver (iOS). Swipe through Home | Order: headline, Pay Now, Our Products, Track Application, FAQs, Offers, Contact Us, "Login". Icons and illustration are skipped. Each tile and "Login" announced as a button | FR-066; E-04 | QA lead (to assign) | not run | |
| M-11b | With a screen reader on, tap "Contact Us"; then close the popup | Focus moves into the popup and stays inside; on close, focus returns to the "Contact Us" tile | FR-044, FR-046; HOME_CONTACT_TC_003 | QA lead (to assign) | not run | |
| M-11c | With a screen reader on, tap "FAQs" with the FAQ service blocked | The spinner and then the failure message are announced | FR-042 | QA lead (to assign) | not run | |
| M-12 | Turn on dark mode, then high contrast. Open Home | Colours follow the theme tokens; the illustration and the "Login" gradient stay unchanged. Remapped dark and high-contrast values are still an open Design item, so the sets currently match light | FR-006, FR-023, FR-068; E-03 | Design lead (to assign) | not run | |
| M-13 | Open Home on a 320 x 568 screen and on a tablet | Small screen: content scrolls and "Login" is reachable. Tablet: usable and centred; tablet layout rules are an open item (O-13) | FR-008; E-05, E-06; HOME_NET_TC_007 | QA lead (to assign) | not run | |

## QA manual cases (retrofit, listed in manual-verification.json)

| # | Steps | Expected | Spec | Owner | Result | Date |
|---|---|---|---|---|---|---|
| M-15 | Cold-start the app on a mid-range device, no session; time from the end of the splash screen to a tappable Home | Within 2 seconds (PERF-1) | FR-070; HOME_NET_TC_009 | QA lead (to assign) | not run | |
| M-16 | Open and close tiles and the Contact Us popup repeatedly (about 50 times) with a memory profiler attached | Memory stays stable; no crash | FR-071; HOME_NET_TC_010 | QA lead (to assign) | not run | |
| M-17 | Run the same flows on Android and iOS | Same layout and flows, except hardware back and the update-dialog "Exit" button (Android only) | FR-072; HOME_NET_TC_011 | QA lead (to assign) | not run | |
| M-18 | Tap "FAQs" with the FAQ service slowed, then try tapping other tiles while the spinner shows | Touches outside the spinner are blocked until it closes | FR-037; HOME_FAQ_TC_004 | QA lead (to assign) | not run | |

