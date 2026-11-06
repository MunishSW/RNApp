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

## QA retrofit checks (test-case-driven conversion)

- [x] All 71 QA cases mapped to FRs and tasks (`tasks.md` TC -> Task coverage, `spec.md` Test-case -> FR traceability)
- [x] No orphan ids: every id in a `// Covers:` marker or test title exists in `qa-cases.json`
- [x] Every COVERED case has quoted assertion evidence (`coverage-report.md` section 1)
- [x] `manual-verification.json` present (3 manual cases HOME_NET_TC_009, HOME_NET_TC_010, HOME_NET_TC_011, plus 4 partial cases whose remaining part needs a device: HOME_CONTACT_TC_003, HOME_CONTACT_TC_004, HOME_FAQ_TC_004, HOME_NET_TC_007)
- [ ] Divergences (5) and partial cases (6) reviewed by the owners named below
- [x] qa-suspect cases reviewed: none found

## Retrofit Findings

**DIVERGENCES** (case, what it expects, what spec/code does, who decides)

- `HOME_ACTION_TC_001`: expects a WebView opening the payment portal URL with title Pay Now; spec (plan-stage decision, O-05, FR-014) and code open a header-and-back-button screen, no WebView. Decide: QA to rewrite the case, or Product to reverse the decision (BRD change request T072). Owner: Product / Design (QA lead updates the sheet).
- `HOME_ACTION_TC_010`: expects return to Home after closing the Pay Now WebView; spec/code have no WebView (back button on the Pay Now screen returns to Home, asserted). Same decision as HOME_ACTION_TC_001. Owner: Product / Design (QA lead updates the sheet).
- `HOME_NEG_TC_002`: expects a WebView error or fallback when the payment URL is missing; spec/code have no URL and no WebView, so the state cannot occur. Same decision as HOME_ACTION_TC_001. Owner: Product / Design (QA lead updates the sheet).
- `HOME_VER_TC_008`: expects the server message with an Okay button and logout on Okay for a version-service 401; spec FR-055 (owner decision) and code show no popup and clear the logged-in token silently. Decide: QA to rewrite the case, or Product to reverse the decision (BRD change request T072). Owner: Product / Design (QA lead updates the sheet).
- `HOME_NET_TC_003`: expects a WebView error state with no network; spec N-10 says Pay Now still opens with no network content. Same decision as HOME_ACTION_TC_001. Owner: Product / Design (QA lead updates the sheet).

**QA-SUSPECT**: none.

**FAILING (code defect)**: none. All 253 tests in the 41 suites run passed.

**GAPS** (no test and not built): none left. Three GAPs found in the audit (HOME_NET_TC_008, HOME_BACK_TC_005, HOME_CONTACT_TC_006) were closed with new tests.

**PARTIAL** (asserted part passes; remainder cannot be proven by a unit test in this repo)

- `HOME_RESET_TC_003`: Register CIF field is in another module; task T083
- `HOME_RESET_TC_004`: Offers failure screen is in another module; task T084
- `HOME_CONTACT_TC_003`: real screen-reader focus; task T085
- `HOME_CONTACT_TC_004`: visual clipping at 2x text; task T085
- `HOME_FAQ_TC_004`: touch blocking is native; task T085
- `HOME_NET_TC_007`: visual clipping on device; task T085

**ORPHAN legacy ids** (not in the QA sheet; no marker was kept for them)

- `TC-101` to `TC-109`, `TC-201` to `TC-208`, `TC-301` to `TC-308`, `TC-401` to `TC-413`, `TC-501` to `TC-506`, `TC-601` to `TC-607`, `TC-701`, `TC-702`, `TC-703`, `TC-802` to `TC-804`: BRD-numbered ids cited in old tasks, tests and checklists. They are not defined in the QA sheet. Their `// Covers:` lines and title brackets were removed or replaced by the matching QA id; the task text and traceability tables still cite them as history.
- `NLMISC_TC_001`, `NLMISC_TC_022` (in `authService.test.ts`, `httpClient.test.ts`): ids from a different QA sheet; markers removed.
- Scenario ids used as title brackets (`[E-14]`, `[N-11]`): scenario ids are not QA ids; brackets removed.

**UNVERIFIED mappings**: none. Every mapped test has a quoted assertion line, checked against the file.

**FRs added by retrofit** (needs review): FR-070 (PERF-1, HOME_NET_TC_009), FR-071 (PERF-5, HOME_NET_TC_010), FR-072 (platform parity, HOME_NET_TC_011).

**FRs with no task**: FR-009 (screen-view analytics event; BRD open item O-08). Only the traceability task T073 lists it in Maps; no task implements it and no QA case covers it.

**Other notes**: the QA sheet was converted in this folder (`specs/002-non-logged-in-home-page-tdd-trial2/`). The feature's test files already carried `// Covers:` markers and the 25 retrofit tests from an earlier conversion run of an identical folder (`specs/002-non-logged-in-home-page-tdd-trial/`); this run re-verified every quoted assertion line against the files (183 of 183 match), re-ran the 41 suites (253 pass, 0 fail), and re-applied the flat FR-NNN ids, the former-id table without the FR- prefix, and the Maps and Accept fields on every task. No test file or production file was edited in this run.
