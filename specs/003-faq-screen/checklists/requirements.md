# Specification Quality Checklist: FAQ Screen (Pre-Login)

**Purpose**: validate the spec before implementation.
**Feature**: [spec.md](../spec.md)

- [x] No implementation detail in requirements beyond named files in the plan
- [x] Every requirement is testable and has a scenario
- [x] Every scenario P-, N-, E- maps to a requirement
- [x] Business rules BR-1 to BR-5 map to requirements
- [x] On-screen text is quoted exactly
- [x] Scope and out-of-scope are stated
- [x] Open clarifications are listed, none blocks the build
- [x] No new dependency is added
- [x] All 18 QA cases are mapped (qa-cases.json, `## TC -> Task coverage` in tasks.md)
- [x] No orphan QA ids: every id in a `// Covers:` marker or `[...]` test title exists in qa-cases.json
- [x] Every COVERED case has a quoted assertion line (coverage-report.md, section 1)
- [x] manual-verification.json is not needed: no case is manual and none has a human-only remainder; quickstart M-1 to M-7 (T030) stay open
- [ ] Divergence reviewed by the owner: FAQ_FUNC_TC_007 (popup or empty fallback expected; the spec shows an in-page error with Retry)
- [x] QA-suspect cases reviewed: none

## Retrofit Findings

- DIVERGENCES: `FAQ_FUNC_TC_007` expects "Server error popup or empty fallback"; the spec (plan decision 3, owner, 2026-11-06) and the code show an in-page error message with a Retry button and no dialog. Decision owner: product owner with QA.
- QA-SUSPECT: none.
- FAILING: none. All 110 tests in the 14 suites run passed.
- GAPS: `FAQ_FUNC_TC_018` is PARTIAL, blocked by the logout / session-reset module: nothing dispatches `clearFaq` on a session reset (`src/services/sessionService.ts` `logout()` only clears the logged-in token). Task T032 (unchecked).
- ORPHAN legacy ids: none found (the folder and the FAQ tests cited no TC ids).
- UNVERIFIED mappings: none.
- FRs added by retrofit: none (all 31 FRs were renumbered to FR-001 to FR-031; see the former-id table in spec.md).
- FRs with no task: none.
