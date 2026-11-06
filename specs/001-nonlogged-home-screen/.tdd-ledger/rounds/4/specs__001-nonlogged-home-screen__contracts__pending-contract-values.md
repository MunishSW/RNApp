# Pending Contract Values (TBC_CONTRACT_VALUE)

Values the BRD leaves open. They are NOT normative requirement text; requirements reference this file.

| ID | Item | Referenced by | Owner |
|---|---|---|---|
| O-05 | Pay Now WebView header and error state | FR-008 | Product / Mobile |
| O-09 | Per-environment base URLs (auth, API, version service) | FR-010, FR-011, FR-016 | Backend / DevOps |
| O-10 | `X-BHFL-Auth` required for fetch-faq | FR-011, FR-013 | Backend |
| O-11 | FAQ answer markup display rules | FR-013 | Product / Design |
| O-12 | Backend error code shape for token / FAQ / version | FR-014, FR-016 | Backend |
| O-13 | Tablet / wide-screen layout | FR-004 | Design |
| PERF-1 / PERF-4 / AVL-2 | Time-to-interactive, tap-to-navigate and availability targets | FR-020 | Product / Engineering |

Credentials (`NON_LOGGED_AUTH_USERNAME`, `NON_LOGGED_AUTH_PASSWORD`) come from per-environment build config and are never recorded here.

Resolved 2026-11-06 (no longer pending): O-03 (route stub), O-06 (dialer / mail / Branch Locator route), O-07 (Update + Skip). The encryption key and AAD are build-config secrets and are not recorded in any spec file.
