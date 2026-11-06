# Manual Checks: Non-Logged-In (Pre-Login) Home Page

**Purpose**: device checks that automated tests cannot prove (constitution Delivery Standards: steps, expected result, owner).
**Feature**: [spec.md](../spec.md) | **Run guide**: [quickstart.md](../quickstart.md)
**Status**: NOT RUN. These need a device or emulator. Results, owner names and dates are filled in by the person who runs them.

Default conditions: fresh install, no session, network available, text 1x, light theme.

## Accessibility (T065: BR-12, BRD 7.4)

| # | Steps | Expected | Spec | Owner | Result | Date |
|---|---|---|---|---|---|---|
| M-10 | Set text scale 1.5x, then 2x; with 2x also set 0.36em letter spacing and 2x line height. Open Home and scroll | Tiles stack in one full-width column; nothing clipped or overlapping; page scrolls; "Login" reachable | FR-012, FR-067; E-01, E-02 | QA lead (to assign) | not run | |
| M-11 | Turn on TalkBack (Android) and VoiceOver (iOS). Swipe through Home | Order: headline, Pay Now, Our Products, Track Application, FAQs, Offers, Contact Us, "Login". Icons and illustration are skipped. Each tile and "Login" announced as a button | FR-066; E-04 | QA lead (to assign) | not run | |
| M-11b | With a screen reader on, tap "Contact Us"; then close the popup | Focus moves into the popup and stays inside; on close, focus returns to the "Contact Us" tile | FR-044, FR-046; TC-607, TC-208 | QA lead (to assign) | not run | |
| M-11c | With a screen reader on, tap "FAQs" with the FAQ service blocked | The spinner and then the failure message are announced | FR-042 | QA lead (to assign) | not run | |
| M-12 | Turn on dark mode, then high contrast. Open Home | Colours follow the theme tokens; the illustration and the "Login" gradient stay unchanged. Remapped dark and high-contrast values are still an open Design item, so the sets currently match light | FR-006, FR-023, FR-068; E-03 | Design lead (to assign) | not run | |
| M-13 | Open Home on a 320 x 568 screen and on a tablet | Small screen: content scrolls and "Login" is reachable. Tablet: usable and centred; tablet layout rules are an open item (O-13) | FR-008; E-05, E-06 | QA lead (to assign) | not run | |

## QA cases that need a human (from manual-verification.json)

| QA case | Test case | Linked check | Reason | Owner | Status |
|---|---|---|---|---|---|
| HOME_BACK_TC_005 | Verify FAQ back returns to Home. | M-5 | manual - Needs the real navigator and FAQ destination screen; stack pop behaviour is not exercised by unit tests. | QA lead (to assign) | NOT RUN |
| HOME_CONTACT_TC_003 | Verify focus returns to Contact Us tile after closing popup. | M-11b | manual - Needs a real screen reader on device to confirm focus lands on the Contact Us tile | QA lead (to assign) | NOT RUN |
| HOME_CONTACT_TC_004 | Verify popup scrolls at large text sizes. | M-10 | manual - Visual clipping at maximum OS text settings needs a real device | QA lead (to assign) | NOT RUN |
| HOME_CONTACT_TC_005 | Verify Call, Email and Find Us tap behaviour. | M-4 | manual (remaining part) - dialer, mail app and Branch locator really opening on a device (BRD O-06, behaviour pending) | QA lead (to assign) | NOT RUN |
| HOME_NET_TC_007 | Verify layout on small screen 320 x 568. | M-13 | manual (remaining part) - visual check on a 320 x 568 device that nothing is clipped | QA lead (to assign) | NOT RUN |
| HOME_NET_TC_009 | Verify cold start time to interactive. | PERF-1 (quickstart) | manual - Real-device timing. | QA lead (to assign) | NOT RUN |
| HOME_NET_TC_010 | Verify no memory growth when opening and closing tiles repeatedly. | PERF-5 (new) | manual - Device memory profiling. | QA lead (to assign) | NOT RUN |
| HOME_NET_TC_011 | Verify Android and iOS parity. | M-1 to M-14 on both platforms | manual - Real-device visual comparison. | QA lead (to assign) | NOT RUN |
