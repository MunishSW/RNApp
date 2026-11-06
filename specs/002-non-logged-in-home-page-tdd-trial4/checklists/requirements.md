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

- [x] BRD 4.1 to 4.9 covered (FR-001 to FR-065)
- [x] BR-1 to BR-12 mapped to FRs and scenarios
- [x] TV-1 to TV-5 mapped to FRs and scenarios
- [x] PERF-1 to PERF-5, AVL-1 to AVL-3 listed
- [x] Every P-/N-/E- scenario maps to at least one FR
- [x] On-screen text quoted exactly from BRD and Figma
- [x] Layout values taken from Figma node 2:937

## Notes

- The one unchecked item is by design. Close O-01 to O-16 with the owners in BRD 12.2, then run `/speckit-clarify` before `/speckit-plan`.
- Spec 001 (`specs/001-nonlogged-home-screen`) and `src/features/nonLoggedHome/` already exist for this same BRD. This spec (002) is a separate, independent one by request.

## Retrofit (QA case package)

- [x] All 71 QA cases mapped (see `## TC -> Task coverage` in tasks.md)
- [x] No orphan ids in `// Covers:` markers or test titles (legacy TC ids and NLMISC ids removed or replaced)
- [x] Every COVERED case has quoted assertion evidence (coverage-report.md section 1)
- [x] manual-verification.json present; keys equal the manual cases and the partial cases with a manual remainder
- [ ] Divergences and qa-suspects reviewed by their owners (5 divergences, 0 qa-suspects; decisions pending)

### Retrofit Findings

**DIVERGENCES** (the case contradicts a recorded decision; spec and code unchanged; Product / Design must decide whether the QA case or the spec changes)

- `HOME_ACTION_TC_001`: expects WebView opens the payment portal URL titled Pay Now; spec and code do: no WebView; Pay Now screen with header and back button only (plan-stage decision 2, O-05).
- `HOME_ACTION_TC_010`: expects return to Home after closing the Pay Now WebView; spec and code do: no WebView; back button on the Pay Now screen returns to Home (this is tested, PayNowScreen.test.tsx).
- `HOME_NEG_TC_002`: expects WebView error or fallback when the Pay Now URL is unavailable; spec and code do: no WebView and no URL; the screen has no network content.
- `HOME_VER_TC_008`: expects server message with Okay on a 401; on Okay the logout call runs; spec and code do: a 401 shows no popup and the logged-in token is cleared silently (plan-stage decision 3).
- `HOME_NET_TC_003`: expects WebView error state when Pay Now is opened with no network; spec and code do: no WebView; the Pay Now screen opens with no network content (spec N-10).

**QA-SUSPECT**: none.

**FAILING**: none. All 218 tests in the 33 suites run passed.

**GAPS** (partial cases blocked by a module that is not in this repo, plus an open item)

- `HOME_RESET_TC_004` (T089): Offers failure screen "Ok" return is owned by the Offers module (stub route).
- `HOME_RESET_TC_003` (T090): Register Now CIF field is owned by the Register Now module (not in this repo).
- `HOME_BACK_TC_005` (T091): FAQ back is owned by the FAQ screen (stub route).
- `HOME_NET_TC_008` (T092): out of scope until O-13 is decided (also the open item for FR-008).

**ORPHAN legacy ids**

- `TC-101` to `TC-109`, `TC-201` to `TC-208`, `TC-301` to `TC-308`, `TC-401` to `TC-413`, `TC-501` to `TC-506`, `TC-601` to `TC-607`, `TC-701`, `TC-702`, `TC-703`, `TC-801` to `TC-804`: cited in tasks.md, traceability.md, manual-checks.md and the old test titles. None is defined in the QA sheet. In the test files every such title tag and marker was replaced with a QA id where the test proves a case, or removed where it proves none. The wording in the spec documents is kept as written (history).
- `NLMISC_TC_001`, `NLMISC_TC_022`: found in `authService.test.ts` and `httpClient.test.ts` markers; not in this QA sheet. Marker lines removed, tests kept.
- Titles `[T001]`, `[T064]` (task ids), `[E-10]`, `[E-14]`, `[N-11]` (scenario ids): removed from test titles.

**UNVERIFIED mappings**: none.

**FRs added by retrofit**: none.

**FRs with no task** (each now has an unchecked Open item task): none

**Notes**

- 15 tests were added by this retrofit (T074 to T088). No production file was changed.
- `src/navigation/__tests__/useGuardedNavigate.test.tsx` belongs to the shared navigation hook of the older `nonLoggedHome` feature, not this feature (which has its own copy). It still carries `HOME_NET_TC_005` / `HOME_NET_TC_006` markers from before; it was not edited and is not counted here.
