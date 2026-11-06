# Pending Contract Values (TBC_CONTRACT_VALUE)

Values the BRD leaves open. They are NOT normative requirement text; requirements reference this file.

| ID | Item | Referenced by | Owner |
|---|---|---|---|
| O-09 | Per-environment base URLs (auth, API, version service) | FR-010, FR-011, FR-016 | Backend / DevOps |
| PERF-4 / AVL-2 | Tap-to-navigate and service availability targets | FR-020 | Product / Engineering |
| FAQ-401 | Owner note: FAQ 401 "token refresh and retry". Conflicts with BRD 10.3 (no automatic retry on FAQ). Not coded until confirmed | FR-013, FR-014 | Product / Backend |

Resolved 2026-11-06 (no longer pending): O-03, O-05, O-06, O-07, O-08, O-10, O-11, O-12, O-13, PERF-1 (2 s). The encryption key and AAD are build-config secrets and are not recorded in any spec file. Credentials (`NON_LOGGED_AUTH_USERNAME`, `NON_LOGGED_AUTH_PASSWORD`) come from per-environment build config and are never recorded here.
