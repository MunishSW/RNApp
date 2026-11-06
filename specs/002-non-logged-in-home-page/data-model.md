# Data Model: Non-Logged-In Home Page

Entities come from the spec "Key Entities". Shapes match the existing Redux slices in `src/store/`. No personal data is stored.

## Entities

### NonLoggedToken (slice `token`)

| Field | Type | Rule |
|---|---|---|
| `nonLoggedToken` | string or null | Set only when the response `token` is a non-empty string (TV-1). Mirrored to encrypted storage key `auth_token_Nonlogged` |
| `loggedInToken` | string or null | Memory only, never persisted, never used as the non-logged token (FR-4.4-05) |

Transitions: `null` -> set on token success; set -> replaced on refresh (auth-failure retry or next mount); cleared on clear action. Failure leaves the previous value; no UI.

### FaqCache (slice `faq`)

| Field | Type | Rule |
|---|---|---|
| `items` | `FaqItem[]` or null | null = nothing cached. Set only for a non-empty array. Not cleared by Home (FR-4.9-04) |

`FaqItem`: `question: string`, `answer: string` (answer format open, O-11).

Transitions: null -> items on non-empty success; items -> null only by `clearFaq` (for example logout).

### OffersFormState and SelectedOffer (slice `offers`)

| Field | Type | Reset value |
|---|---|---|
| `form.fullName` | string | "" |
| `form.mobileNo` | string | "" |
| `form.tncAccepted` | boolean | false |
| `selectedOffer` | object or null | null |

Reset on every Home focus (FR-4.9-01, FR-4.9-02).

### SessionFlags (slice `sessionFlags`)

| Field | Type | Rule |
|---|---|---|
| `isNonLoggedUser` | boolean | Set true when Contact Us opens (FR-4.2-08) |
| `faqsFromNonLogin` | boolean | Set true on every FAQs tap (FR-4.5-01) |
| `registerNowReturnScreen` | string or null | Set to null on every Home focus (FR-4.9-03) |

### VersionOutcome (not stored; per-mount result)

Discriminated union from the version service:

| Kind | Fields | Home shows |
|---|---|---|
| `none` | none | nothing |
| `maintenance` | `message` | blocking dialog, "Exit" on Android |
| `mandatory` | `targetUrl` | blocking dialog, "Update" and "Exit" (Android) |
| `optional` | `targetUrl` | dismissable dialog, "Update" and "Skip" |
| `sessionExpired` | `message` | nothing: no popup, no dialog; logged-in token cleared silently (FR-4.7-08) |
| `error` | `message` | message with "Okay" (generic text if empty) |

Classification rules: TV-3 (numeric dotted compare, missing parts 0), TV-4 (only when `status` is "Active"), TV-5 (platform name "Android" or "iOS").

### QuickLinkTile (static, in the label file)

| Field | Type | Rule |
|---|---|---|
| `id` | `payNow` \| `products` \| `trackApplication` \| `faqs` \| `offers` \| `contactUs` | fixed order |
| `label` | string | exact text from spec |
| `icon` | image asset | decorative |
| `linkName` | string | `pay_now`, `products`, `track_application` (open, O-03), `faq`, `offers`, `contact_us` |
| `action` | navigate / faq flow / open popup | per `contracts/ui-and-navigation.md` |

### HomeUiState (screen-local, not global)

| Field | Type | Rule |
|---|---|---|
| `contactPopupVisible` | boolean | popup is not a route |
| `faqLoading` | boolean | blocking overlay; also guards double tap |
| `faqErrorVisible` | boolean | failure dialog |
| `versionOutcome` | `VersionOutcome` | from the once-per-mount check |
| `exitDialogVisible` | boolean | Android only |
| `stacked` | boolean | font scale >= 1.5 |

Back precedence: any of popup / dialogs open closes first; exit dialog only when none is open.

## State transitions: FAQ flow

```text
idle --tap FAQs--> (set faqsFromNonLogin)
  cache has items --> navigate Faq                         [P-07]
  cache empty --> loading --success non-empty--> store + navigate Faq   [P-08]
                          --success empty / non-list--> idle, no dialog [N-03, N-04]
                          --failure--> error dialog --Okay--> idle      [N-02]
loading: further FAQs taps ignored                                      [N-05]
```

## Validation rules

| Rule | Where applied |
|---|---|
| TV-1 token non-empty string | token service, before store write |
| TV-2 FAQ array only | FAQ service |
| TV-3 / TV-4 / TV-5 | version service (pure classifier) |
| No text inputs on this screen | no field validation |
