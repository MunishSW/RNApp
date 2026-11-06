# Release Notes: Non-Logged-In (Pre-Login) Home Page (spec 002)

## Status

Implemented in `src/features/nonLoggedInHome/` with its own route `NonLoggedInHome`. Spec 001's feature and routes are untouched, and 002 imports nothing from them. `NonLoggedInHome` is registered but the app's initial route is still the 001 screen.

Verified: `npx tsc --noEmit` clean; `npx eslint .` 0 errors; `npx jest` 44 suites, 298 tests passing. Device checks (manual M-1 to M-14, including PERF-1 and PERF-4 timing) have **not** been run.

## Owner decisions that override the BRD

These need a BRD change request so the document matches the build (constitution IX):

| BRD text | Decision (2026-11-06) |
|---|---|
| 4.2.6, 4.2.7, 7.3: Pay Now opens the payment portal in a WebView with a host allow-list | No WebView. "Pay Now" opens a screen with a header "Pay Now" and a back button only |
| 4.7.4, 8.4.2: version-service 401 shows the server message with "Okay", then logout | No popup. The logged-in token is cleared silently |
| 8.1.1: `X-BHFL-Auth` on endpoints that require it | Not sent on any call |
| 2.3 targets: PERF-1 and PERF-4 TBD | PERF-1 = 2 s, PERF-4 = 200 ms |
| 4.2.9: link name for Track Application TBD | `track_application` |
| 4.2.3 / O-03: Track Application destination TBD | Separate non-logged Track Application flow (own BRD) |
| 4.6.6 / O-06: Customer Care tap actions TBD | Dialer, mail app, Branch locator; popup closes after each tap |
| O-07: optional update buttons | "Update" and "Skip"; no snooze |

## Open items still carried

O-01, O-02, O-04, O-08, O-09, O-11, O-13, O-14 (AVL-2, log retention, minimum OS versions), O-15, O-16, the narrowed O-06 (Customer Care to confirm contact values) and O-12 (Backend to confirm the error shape), and the `forceUpdatev1/Secured` selection rule (Home calls `forceUpdate/Secured` only).

Dark-mode and high-contrast token values are still aliases of the light set until Design supplies them.

## Changes outside the feature folder

| File | Change |
|---|---|
| `src/services/authRetry.ts`, `src/services/apiErrors.ts` | New: one retry after token refresh on an auth failure; client-derived error fields |
| `src/services/httpClient.ts` | Response step that replays an auth-failed call once |
| `src/services/authService.ts` | `registerTokenProvider()` also registers the token refresher |
| `src/theme/tokens.ts` | Added `fontFamilySemiBold`, `fontFamilyBold` |
| `src/navigation/routes.ts`, `RootNavigator.tsx` | Added routes `NonLoggedInHome`, `NonLoggedInPayNow` |
| `src/assets/fonts/` | Added `Rubik-SemiBold.ttf`, `Rubik-Bold.ttf` |
| `src/assets/nonLoggedInHome/` | Own copies of the illustration and six tile icons |
| `ios/RNApp/Info.plist`, `ios/RNApp.xcodeproj/project.pbxproj`, `android/app/src/main/assets/fonts/`, `ios/link-assets-manifest.json`, `android/link-assets-manifest.json` | Font linking by `react-native-asset`. It also rewrote `<string></string>` as `<string/>` in `Info.plist`; the original comment was restored. The app needs a native rebuild to pick up the fonts |
| `jest.config.js` | Transform the ES-module-only state and navigation libraries, and ignore `.claude/` and `specs/`, so suites that import the store can run. Before this change 5 existing suites could not run |
