# Specification Quality Checklist: Non-Logged-In (Pre-Login) Home Page

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-11-06
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs) - storage, browser view, encryption are described by behaviour only; no library or framework named
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [ ] No [NEEDS CLARIFICATION] markers remain - **intentionally open**: the remaining markers are BRD "TBD" or section 12.2 items (O-01 to O-16); O-05 and O-10 are now closed and several others narrowed after clarification. None are guessed. See "Open Clarifications" in spec.md
- [x] Requirements are testable and unambiguous (apart from the open items above)
- [x] Success criteria are measurable (SC-008 waits on PERF-1 / O-14)
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined (P-01..14, N-01..11, E-01..14, each mapped to FR IDs)
- [x] Edge cases are identified
- [x] Scope is clearly bounded (in scope / out of scope, no Register Now, chatbot or accessibility icon)
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria (every FR lists BRD area, rules, scenarios)
- [x] User scenarios cover primary flows (Journeys A to H)
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Traceability

- [x] BRD 4.1 to 4.9 covered (BRD area 4.1 to BRD area 4.9)
- [x] BR-1 to BR-12 mapped to FRs and scenarios
- [x] TV-1 to TV-5 mapped to FRs and scenarios
- [x] PERF-1 to PERF-5, AVL-1 to AVL-3 listed
- [x] Every P-/N-/E- scenario maps to at least one FR
- [x] On-screen text quoted exactly from BRD and Figma
- [x] Layout values taken from Figma node 2:937

## Notes

- The one unchecked item is by design. Close O-01 to O-16 with the owners in BRD 12.2, then run `/speckit-clarify` before `/speckit-plan`.
- Spec 001 (`specs/001-nonlogged-home-screen`) and `src/features/nonLoggedHome/` already exist for this same BRD. This spec (002) is a separate, independent one by request.

## Retrofit (test-case-driven package)

- [x] All 71 QA cases are mapped: each appears once in `## TC -> Task coverage` in `tasks.md` and has at least one FR
- [x] No orphan ids: every id in a `// Covers:` marker exists in `qa-cases.json`
- [x] Every COVERED case has quoted assertion evidence (`coverage-report.md`, section 1)
- [x] `manual-verification.json` is present with 7 entries
- [ ] Divergences reviewed by the owner: HOME_ACTION_TC_001, HOME_ACTION_TC_010, HOME_NEG_TC_002, HOME_VER_TC_008, HOME_NET_TC_003
- [x] QA-suspect cases: none

## Retrofit Findings

- **DIVERGENCES** (5): HOME_ACTION_TC_001, HOME_ACTION_TC_010, HOME_NEG_TC_002, HOME_NET_TC_003 expect a Pay Now WebView; the owner decision (O-05) is a header "Pay Now" and back button only. HOME_VER_TC_008 expects the server message with "Okay" and a logout on Okay for a 401; spec FR-055 shows no popup and clears the token silently. Owner / Product decides whether the QA sheet or the spec changes. Neither was changed.
- **QA-SUSPECT**: none.
- **FAILING**: none. All 236 tests in the 36 suites passed.
- **GAPS (no test, not built)**: none. Blocked partials: HOME_BACK_TC_005 (T089, FAQ screen module) and HOME_RESET_TC_003 (T090, Register Now module). Out of scope: HOME_NET_TC_008 (T091, O-13).
- **ORPHAN legacy ids**: BRD-style `TC-101` to `TC-808` (feature tests and tasks.md text) are not defined in the QA sheet; titles and markers were rewritten to QA ids where a test proves a QA case and the legacy id dropped otherwise (the task text in tasks.md keeps them as history). `NLMISC_TC_001` and `NLMISC_TC_022` (shared `authService.test.ts`, `httpClient.test.ts`) belong to another QA sheet; those marker lines were removed.
- **UNVERIFIED mappings**: none.
- **FRs added by retrofit**: FR-070 (PERF-1 interactive within 2 s), FR-071 (PERF-5 no leaks), FR-072 (Android and iOS parity). Marked "[added by retrofit - needs review]" in spec.md.
- **FRs with no task**: FR-009 (O-08) and FR-031 (O-09) had none; open-item tasks T092 and T093 were added.
- Production code was not changed. Production comments still hold the former dotted FR ids; the Former id table in spec.md keeps them searchable.

