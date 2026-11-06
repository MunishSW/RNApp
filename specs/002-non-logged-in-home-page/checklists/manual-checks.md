# Manual Checks: Non-Logged-In (Pre-Login) Home Page

**Purpose**: device checks that automated tests cannot prove (constitution Delivery Standards: steps, expected result, owner).
**Feature**: [spec.md](../spec.md) | **Run guide**: [quickstart.md](../quickstart.md)
**Status**: NOT RUN. These need a device or emulator. Results, owner names and dates are filled in by the person who runs them.

Default conditions: fresh install, no session, network available, text 1x, light theme.

## Accessibility (T065: BR-12, BRD 7.4)

| # | Steps | Expected | Spec | Owner | Result | Date |
|---|---|---|---|---|---|---|
| M-10 | Set text scale 1.5x, then 2x; with 2x also set 0.36em letter spacing and 2x line height. Open Home and scroll | Tiles stack in one full-width column; nothing clipped or overlapping; page scrolls; "Login" reachable | FR-4.2-03, FR-7.4-02; E-01, E-02 | QA lead (to assign) | not run | |
| M-11 | Turn on TalkBack (Android) and VoiceOver (iOS). Swipe through Home | Order: headline, Pay Now, Our Products, Track Application, FAQs, Offers, Contact Us, "Login". Icons and illustration are skipped. Each tile and "Login" announced as a button | FR-7.4-01; E-04 | QA lead (to assign) | not run | |
| M-11b | With a screen reader on, tap "Contact Us"; then close the popup | Focus moves into the popup and stays inside; on close, focus returns to the "Contact Us" tile | FR-4.6-02, FR-4.6-04; TC-607, TC-208 | QA lead (to assign) | not run | |
| M-11c | With a screen reader on, tap "FAQs" with the FAQ service blocked | The spinner and then the failure message are announced | FR-4.5-08 | QA lead (to assign) | not run | |
| M-12 | Turn on dark mode, then high contrast. Open Home | Colours follow the theme tokens; the illustration and the "Login" gradient stay unchanged. Remapped dark and high-contrast values are still an open Design item, so the sets currently match light | FR-4.1-06, FR-4.3-04, FR-7.4-03; E-03 | Design lead (to assign) | not run | |
| M-13 | Open Home on a 320 x 568 screen and on a tablet | Small screen: content scrolls and "Login" is reachable. Tablet: usable and centred; tablet layout rules are an open item (O-13) | FR-4.1-08; E-05, E-06 | QA lead (to assign) | not run | |
