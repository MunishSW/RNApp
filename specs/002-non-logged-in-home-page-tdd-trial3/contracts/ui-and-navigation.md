# Contract: UI, navigation and events

Spec: BRD area 4.1 to BRD area 4.3, BRD area 4.6 to BRD area 4.9, BRD area 7.4. Route names come from `src/navigation/routes.ts`.

## Navigation targets

| Trigger | Target | Params / note | Spec |
|---|---|---|---|
| "Login" | `LoginScreen` | none; no service call | FR-021 |
| "Pay Now" | `NonLoggedInPayNow` (new route) | `{ title: 'Pay Now' }`. Screen has a header titled "Pay Now" and a back button only; no WebView, no content. Back returns to Home | FR-014 |
| "Our Products" | `Products` | none | FR-015 |
| "Track Application" | `TrackApplication` | none; own BRD; back returns to Home | FR-016 |
| "FAQs" | `Faq` | only after the FAQ flow succeeds or the cache hits | BRD area 4.5 |
| "Offers" | `Offers` | none | FR-015 |
| "Contact Us" | popup over Home (no route) | sets `isNonLoggedUser` true | FR-017, FR-043 |
| Popup "Find Us" | `BranchLocator` | popup closes first | FR-045 |
| Popup "Call Us" | phone dialer, `022-45297300` | popup closes | FR-045 |
| Popup "Email Us" | mail app to `bhflwecare@bajajhousing.co.in` | popup closes | FR-045 |
| Update dialog "Update" | store URL `target_url` via the system | | FR-053 |
| Android back on Home | popup or dialog first, else exit dialog | | BRD area 4.8 |

Navigation goes through `useGuardedNavigate` (one destination per tap burst, lock released on focus). Every destination other than Home is owned by its own module (stubs today). Every destination pops back to Home (explicit back target).

## Back and exit

| Situation (Android) | Result |
|---|---|
| Popup or any dialog open | back closes it; a second back shows the exit dialog (E-11) |
| Nothing open | exit dialog "Are you sure you want to exit!" with "CANCEL" and "Okay" |
| "CANCEL" | close dialog, stay |
| "Okay" | close the app |
| iOS | no hardware back; no exit dialog |

The handler is registered only while Home is focused and removed on blur.

## Analytics events (typed, no personal data)

| Event | Trigger | Properties |
|---|---|---|
| `quick_link_clicked` | any tile tap, before navigating | `link_name` (`pay_now`, `products`, `faq`, `offers`, `contact_us`, `track_application` pending O-03), `location: non_logged_home`, `logged_in: false` |
| `contact_us_clicked` | Contact Us tap | `channel: non_logged_home` |
| `cta_clicked` | Login tap | `cta_name: login`, `screen: non_logged_home` |
| `dialog_shown` | FAQ failure dialog shown | `dialog_name: faq_error`, `screen: non_logged_home`, `kind: error` |

Whether a `screen_view` event is needed is open (O-08); none is added.

## Component contracts

| Component | Props (summary) | Must |
|---|---|---|
| `QuickLinkTile` | `label`, `icon`, `onPress`, `stacked` | role `button`, label = tile label, icon hidden from accessibility, min 44 x 44, pressed feedback with no layout shift |
| `QuickLinkGrid` | tile list, `stacked` | 3 + 3 per Figma at default; one full-width column when `stacked` |
| `LoginButton` | `onPress` | role `button`, label "Login", never disabled, gradient from tokens, exempt from dark remap |
| `CustomerCarePopup` | `visible`, `onClose`, three row handlers | modal for screen readers, focus in, return focus to the tile on close, max height = window - insets - 64 and scrolls |
| `CommonMessageDialog` | `message`, `buttonLabel`, `onPress` | one button, no close icon, announced |
| `VersionDialog` | `outcome`, `platform`, handlers | non-dismissable for maintenance and mandatory; "Exit" only on Android; "Skip" only for optional |
| `ExitConfirmDialog` | `visible`, `onCancel`, `onConfirm` | buttons "CANCEL" and "Okay" |
| `LoadingOverlay` | `visible` | blocks touches, announced |

All text comes from `nonLoggedInHomeConstants.ts`; no literal strings in components.

## Accessibility contract (BRD 7.4, BR-12)

| Rule | Check |
|---|---|
| Reading order | headline, tiles row 1 then row 2, "Login" |
| Roles and labels | six tiles and "Login": role `button`, label = visible text |
| Hidden | illustration and tile icons not in the accessibility tree |
| Large text | font scale >= 1.5 stacks tiles; at 2x with 0.36em spacing and 2x line height nothing clips or overlaps; no fixed-height text boxes; page scrolls |
| Touch targets | at least 44 x 44 for tiles, "Login", popup rows |
| Announcements | FAQ spinner and failure dialog announced |
| Theme | colours via tokens; illustration and CTA gradient exempt |
| Default look | text 1x, light theme equals Figma node 2:937 |
