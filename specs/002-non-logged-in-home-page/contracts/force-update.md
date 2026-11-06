# Contract: forceUpdate/Secured and forceUpdatev1/Secured (BRD 4.7, 8.1, 8.3.2, 8.4.2)

Purpose: version and maintenance gate on each fresh Home mount. Spec: FR-4.7-01 to FR-4.7-10, TV-3, TV-4, TV-5, BR-9.

| Item | forceUpdate/Secured | forceUpdatev1/Secured |
|---|---|---|
| Method | POST | POST |
| Base | default API client base `ENV.apiUrl` (confirm per environment, O-09) | same |
| Auth | Bearer non-logged token | same |
| Used for | all visitors on Home | "same, v1 variant for allow-listed users" (BRD 4.7.7: two allow-listed test CIFs). Home does not call it: a visitor has no CIF and the list is not in the BRD. Selection rule is an open item (research.md item 10) |
| Headers | `Authorization`, `app-version`, `platform`, `device-details`. No `X-BHFL-Auth` (owner: not needed) | same |
| Timeout | `ENV.requestTimeoutMs` | same |

## Request

| Field | Type | Rule |
|---|---|---|
| `version` | string | installed app version |
| `user_agent` | string | exactly `Android` or `iOS` (capitalised; the server matches case-sensitively, TV-5) |

## Response fields

| Field | Type | Meaning |
|---|---|---|
| `returnStatus.returnCode` | string | `401` = session expired |
| `returnStatus.returnMessage` | string | success is judged by this equal to `success` |
| `maintenance_flag` | `Y` or `N` | `Y` shows the maintenance dialog |
| `maintenance_msg` | string | text for the maintenance dialog |
| `version` | string | latest published version |
| `force_update_flag` | `Y` or `N` | mandatory update |
| `optional_update` | `Y` or `N` | optional update |
| `status` | string | `Active` to enforce (TV-4) |
| `target_url` | string | store link for "Update" |

## Classification (in order)

1. Null, empty or malformed body: **none** (fail open, NLH-E04).
2. `returnStatus.returnCode` is `401`: **sessionExpired** (shown as nothing).
3. `returnStatus.returnMessage` is not `success`: **error** with `returnMessage`, or the generic server-error text when empty.
4. `maintenance_flag` is `Y`: **maintenance** with `maintenance_msg`.
5. Installed version older than `version` (dotted numeric compare, missing parts 0, TV-3), `status` is `Active` and `target_url` present: `force_update_flag` `Y` gives **mandatory**; else `optional_update` `Y` gives **optional**.
6. Otherwise **none**.

## UI mapping

| Outcome | Dialog | Buttons |
|---|---|---|
| maintenance | server message | "Exit" (Android only); not dismissable |
| mandatory | "Update your app to experience all the latest features." | "Update" (opens `target_url`), "Exit" (Android only); not dismissable. On iOS no "Exit"; stays until the user updates or leaves via the app switcher |
| optional | same message | "Update", "Skip" (closes; shown again on next fresh Home mount) |
| sessionExpired | none: no popup, no dialog (owner decision 2026-11-06, overrides BRD 4.7.4) | none; logged-in token cleared silently |
| error | server message or generic text | "Okay" |

Rules: runs once per fresh Home mount; never blocks navigation or drawing; fails open on any failure; the installed version is also stored for the "App version" footer elsewhere.

## Tests (contract level)

- 1.8.10 versus 1.8.9 is newer; missing parts count as 0.
- `status` other than `Active` never enforces an update.
- `user_agent` is `Android` or `iOS` on each platform, never lowercase.
- Null, empty body and thrown request give **none**.
- Each classification step has one case.
