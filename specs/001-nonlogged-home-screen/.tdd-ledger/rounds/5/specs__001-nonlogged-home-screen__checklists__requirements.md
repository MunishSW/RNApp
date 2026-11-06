# Requirements Checklist: Non-Logged-In Home Page

**Story**: BHFL-001 · **Spec**: [../spec.md](../spec.md)

## Content quality

- [x] CHK001 Spec is requirements-focused; no implementation file paths in `spec.md` requirements
- [x] CHK002 Every FR carries `[Story: BHFL-001]`
- [x] CHK003 Every in-scope QA case maps to ≥1 FR (traceability table) and ≥1 task (`## TC → Task coverage`)
- [x] CHK004 All 71 Sheet2 QA cases appear in the TC table; Sheet1 (202 cases) excluded by owner decision
- [x] CHK005 No `Tags:` / `TESTS:` lines, no RED/GREEN/REFACTOR tasks

## Constitution gates

- [x] CHK006 G1 Spec: no invented screens/fields/APIs; unknowns listed as open items O-01…O-13 and `[NEEDS CLARIFICATION]` markers (FR-015, FR-017, FR-020)
- [x] CHK007 G2 Design: Figma link present (file `8U75ofxf1zz5vVAzj1sqMU`, node `2:937`); tokens mapped (T001); accessibility notes per FR-003/FR-004
- [x] CHK008 G3 Plan: security (FR-010..012), API layer (FR-011), navigation (FR-009), performance (FR-020) addressed in `plan.md`
- [x] CHK009 G4 Tasks: each task cites FR ids; each TC mapped to automated test or documented manual check
- [ ] CHK010 G5 PR (at implementation): typecheck, lint, affected tests green; a11y tests; no raw hex / literal strings / direct HTTP; PR cites FR/TC ids

## Design and assets

- [x] CHK011 Figma numbers captured: 360 x 812, grid 331, tile 96, row gap 18, CTA 307 x 40 radius 82, gradient 133.8 deg `#FF512F` 5.6% → `#F09819` 94.4%
- [x] CHK012 Asset export planned via Figma MCP for illustration (2:941), six tile icons, CTA gradient (T002)
- [x] CHK013 Layer-name mismatch noted: `Branch_locator` layer is the FAQs tile; label wins

## Data and conflicts

- [x] CHK014 `qa-cases.json` written by `normalize-qa.js` (`--qa-sheet Sheet2`: 71 rows → 71 cases) with `approach` on every case
- [x] CHK015 `manual-verification.json` written (6 manual cases keyed by ids)
- [x] CHK016 Sheet2 agrees with the BRD; the Sheet1 conflicts (Chatbot, Branch Locator tile, "common popup", accessibility shortcut) no longer apply
- [x] CHK017 Ids are unique and plain (`HOME_*_TC_nnn`); no sheet prefixes needed
- [ ] CHK018 Duplicate TC-ID gate against existing tests: skipped, repo has only the template `App.test.tsx` (no `[TC-…]` claims)

## Open items requiring owner input before related behaviour is coded

- [x] CHK020 Resolved by owner 2026-11-06: O-03 stub, O-06 dialer/mail/Branch Locator, O-07 Update + Skip, AES-128-GCM token-field encryption
- [x] CHK021 Resolved by owner 2026-11-06: O-05, O-08, O-10, O-11, O-12, O-13, PERF-1 (2 s), AES-GCM library react-native-quick-crypto
- [ ] CHK019 Still open: O-09 base URLs · PERF-4 / AVL-2 · FAQ 401 refresh-and-retry note (conflicts with BRD 10.3)
