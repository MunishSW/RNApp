<!--
Sync Impact Report
- Version change: (blank template) → 1.0.0
- Modified principles: none renamed; all 9 principles newly defined
- Added sections: Core Principles I–IX, Constitution Check Gates, Delivery Standards, Governance
- Removed sections: none
- Deferred TODOs: none. Project name taken from repo folder (RNApp); rename via PATCH if wrong.
-->

# RNApp BFSI Mobile App Constitution

React Native (TypeScript) mobile app for BFSI, targeting Android and iOS. Every rule below is
a testable MUST. A rule that cannot be checked by a test, lint rule, or review checklist item
is defective and MUST be amended.

## Core Principles

### I. Requirements Are the Source of Truth
- Every business rule MUST trace: requirement ID → scenario → test case → code. A rule missing
  any link is incomplete.
- Screens, fields, APIs, error codes and text MUST NOT be invented. Anything not in an approved
  requirement is TBD, recorded as an open item, and MUST NOT be coded as if decided.
- All on-screen text MUST come from central label files. Literal user-facing strings in
  components are a defect.

Rationale: BFSI behaviour is audited; unrequested behaviour is a compliance risk.

### II. Design Fidelity
- The approved design is the visual reference.
- Styling MUST use theme tokens only. Raw hex/rgb colour values outside the token definition
  files are forbidden.
- The default look (standard font size, light theme) MUST match the approved design exactly;
  deviations require a design-approved change.

### III. Accessibility Is Mandatory (WCAG 2.1 AA, IS 17802)
- Every interactive element MUST have an accessibility role, label and state.
- Dynamic changes (errors, loading, results) MUST be announced to screen readers.
- Large font and spacing settings MUST render without clipping or overlap.
- Touch targets MUST be at least 44x44.
- Dark mode and high contrast MUST work through tokens, not per-screen overrides.
- Every screen MUST have accessibility tests.

### IV. Security
- All network traffic MUST use TLS.
- Secrets MUST come only from per-environment build config, MUST NOT be committed, and MUST
  NOT be logged.
- Sensitive fields MUST be encrypted at rest and in transit.
- Tokens MUST live in memory plus encrypted storage only.
- Root/jailbreak and anti-tamper checks MUST run at startup.
- Logs and analytics MUST NOT contain personal data.

### V. API Layer
- All calls MUST go through one shared HTTP client providing auth token injection, standard
  headers and timeouts. Direct `fetch`/axios use in features is forbidden.
- Background call failures MUST fail open and silently.
- User-initiated call failures MUST show the standard error dialog with a next action.
- Request/response contracts MUST be typed. Malformed responses MUST be treated as empty,
  never crash.

### VI. Code Quality
- TypeScript strict mode MUST be on; `any` needs a justified suppression.
- Code MUST be organised in feature-folder modules with small stores.
- Components MUST contain no business logic; logic lives in hooks/services/stores.
- Navigation MUST declare explicit back targets and MUST NOT push a duplicate of the current
  screen.
- Code MUST be Hermes-safe: no unsupported language/runtime features without a verified
  polyfill.

### VII. Quality Gates
- Typecheck, lint and affected tests MUST pass before merge.
- Zero regressions: no previously passing test may be broken or skipped to pass.
- Every requirement test case MUST map to an automated test or a documented manual check.

### VIII. Performance and Reliability
- Screens MUST render without waiting on background calls.
- Loaders MUST always clear, on success, failure and cancel.
- Subscriptions, timers and listeners MUST be cleaned up; no memory growth across repeated
  navigation.

### IX. Change Control
- Scope changes MUST go through a change request and a version bump.
- Commits MUST follow Conventional Commits.
- Every PR MUST cite the requirement IDs it implements.

## Constitution Check Gates

A gate failure blocks progression unless a justified, approved exception is logged in the
plan's Complexity Tracking section.

| Gate | Stage | Pass criteria |
|------|-------|---------------|
| G1 Spec | Before `/speckit-plan` | No invented items; unknowns listed as open items; each rule has scenario + test case (I) |
| G2 Design | Before `/speckit-tasks` | Design link present; tokens mapped; accessibility notes per screen (II, III) |
| G3 Plan | Before tasks | Security, API-layer, navigation and performance impacts addressed (IV, V, VI, VIII) |
| G4 Tasks | Before implement | Each task cites requirement ID; each test case mapped to automated test or manual check (I, VII) |
| G5 PR | Before merge | Typecheck, lint, affected tests green; a11y tests present; no raw hex, literal strings, or direct HTTP calls; PR cites IDs (all) |

## Delivery Standards

- Targets: Android and iOS from one TypeScript codebase on Hermes.
- Environment config (endpoints, keys) is per-environment build config only.
- Open items stay in a tracked list until resolved; resolved items update spec, tests and
  labels in the same change.
- Manual checks MUST be documented with steps, expected result and owner.

## Governance

- This constitution supersedes other practices. Conflicts resolve in its favour.
- **Amendment**: propose via change request stating the rule, rationale and migration impact;
  approval by project owner and tech lead; update this file and bump the version in the same
  PR; update affected specs/plans in follow-up tasks.
- **Versioning** (semantic): MAJOR = principle removed or redefined incompatibly; MINOR =
  principle/section added or materially expanded; PATCH = wording/clarification only.
- **Compliance review**: every PR review verifies Gate G5; constitution compliance is audited
  at each release. Unjustified violations block merge.
- **Exceptions**: time-boxed, logged with rationale, approver and expiry.

**Version**: 1.0.0 | **Ratified**: 2026-11-06 | **Last Amended**: 2026-11-06
