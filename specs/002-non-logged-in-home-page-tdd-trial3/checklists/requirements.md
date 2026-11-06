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

## Retrofit checks (test-case-driven package)

- [x] All 71 QA cases are mapped: each has a row in `## TC -> Task coverage` and a class in `qa-cases.json` (`approach`)
- [x] No orphan ids: every id in a `// Covers:` marker or `[HOME_...]` test title exists in `qa-cases.json`; legacy ids with no QA case are listed below
- [x] Every COVERED case has quoted assertion evidence (`coverage-report.md`, section 1)
- [x] `manual-verification.json` is present and lists every MANUAL case plus the two PARTIAL cases with a device-only remainder
- [x] Divergences and qa-suspects reviewed: 5 divergent, 0 qa-suspect (see Retrofit Findings; decisions are the owner's)
- [ ] 1 mapped-but-failing case (HOME_FAQ_TC_004) needs an owner decision (T089)

## Retrofit Findings

**DIVERGENCES** (QA case contradicts a recorded spec decision; spec and code unchanged; owner decides):
- HOME_ACTION_TC_001: expects "WebView opens the configured payment portal URL with title Pay Now". Spec (plan-stage decision 1 and 2, FR-014): no WebView; Pay Now is a header "Pay Now" and a back button only. Decide: Product / Design.
- HOME_ACTION_TC_010: expects return from the Pay Now WebView. Spec: no WebView; the back button returns to Home (asserted by the PayNowScreen tests under the Pay Now journey). Decide: Product / Design.
- HOME_NEG_TC_002: expects a WebView error or fallback when the Pay Now URL is unavailable. Spec: no WebView, no URL, no error state (FR-014). Decide: Product / Design.
- HOME_NET_TC_003: expects a WebView error state with no network. Spec N-10: the Pay Now screen still opens with no network content. Decide: Product / Design.
- HOME_VER_TC_008: expects the server message with "Okay" and a logout call on a version-service 401. Spec (plan-stage decision 3, FR-055): no popup; the logged-in token is cleared silently. Decide: Product / Backend.

**QA-SUSPECT**: none.

**FAILING** (mapped, test kept, production not changed):
- HOME_FAQ_TC_004: test `[HOME_FAQ_TC_004] does not open another tile while the FAQ spinner is showing` in `NonLoggedInHomeScreen.test.tsx`; assertion `expect(navigate).not.toHaveBeenCalled()` failed with "Expected number of calls: 0, Received: 1 (\"Offers\", undefined)". Likely defect: no loading guard on the other tiles (or the touch is blocked natively by the Modal on a real device, which `fireEvent` bypasses). Task T089.

**GAPS**: none with "not built". Blocked by another module: HOME_RESET_TC_004 (Offers fail-screen "Ok" navigation lives in the Offers feature) - task T088.

**ORPHAN legacy ids** (cited in tests before the retrofit, no matching QA case, not added to `qa-cases.json`): TC-104, TC-105, TC-106, TC-202, TC-207, TC-401, TC-404, TC-410, TC-412, TC-413, TC-601, TC-602, TC-603, TC-605, TC-606, TC-607, TC-703. Handling: the `[TC-xxx]` title tags were dropped (or replaced by the QA id the test proves) and the `Covers:` lines now carry QA ids only.

**UNVERIFIED mappings**: none. Line numbers in the proof pass were matched to the files by test title.

**FRs added by retrofit**: none.

**FRs with no task**: FR-009 (screen_view analytics for Home; open item O-08, nothing built or tested).

**Other notes**:
- Production files still carry old FR ids in comments (for example `CommonMessageDialog.tsx`); production code was not touched by instruction.
- `src/store/__tests__/slices.test.ts` (shared, not part of this feature) still has legacy `// Covers:` lines with an em dash; left alone.
- Counts use an extra "failing" part because one mapped test fails.
