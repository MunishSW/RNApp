# Quickstart and Manual Checks: FAQ Screen

Run the automated tests: `npm test -- src/features/faq`.

## Manual checks (device or emulator)

Default: fresh install, network on, text 1x, light theme.

| # | Steps | Expected | Spec |
|---|---|---|---|
| M-1 | Open Home, tap "FAQs" | FAQ screen shows within 300 ms with a stored list | FR-016, NFR |
| M-2 | Turn on TalkBack and VoiceOver and swipe through | Title "FAQs", Back, then each question as a button with open or closed state; chevrons skipped | FR-028, FR-029 |
| M-3 | Set text size 2x and wide spacing | No clipped or overlapping text | FR-031 |
| M-4 | Open an answer with a link and tap it | Phone browser opens | FR-013 |
| M-5 | Turn the network off, open FAQs with no stored list | Error message and Retry | FR-024 |
| M-6 | Open the screen on a 320 x 568 phone and on a tablet | Scrolls on the phone; centred column on the tablet | FR-003, FR-005 |
| M-7 | Press Android back | Home opens | FR-026 |
