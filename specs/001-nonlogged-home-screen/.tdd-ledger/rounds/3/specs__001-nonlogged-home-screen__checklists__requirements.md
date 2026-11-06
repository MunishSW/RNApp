# Requirements Checklist: Non-Logged-In Home Page

**Story**: BHFL-001 · **Spec**: [../spec.md](../spec.md)

## Content quality

- [x] CHK001 Spec is requirements-focused; no implementation file paths in `spec.md` requirements
- [x] CHK002 Every FR carries `[Story: BHFL-001]`
- [x] CHK003 Every in-scope QA case maps to ≥1 FR (traceability table) and ≥1 task (`## TC → Task coverage`)
- [x] CHK004 All 273 QA cases appear in the TC table; out-of-scope rows say why (FR-900)
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

- [x] CHK014 `qa-cases.json` written by `normalize-qa.js` (273 rows → 273 cases) with `approach` on every case
- [x] CHK015 `manual-verification.json` written (9 manual + 180 out-of-scope keyed by final ids)
- [x] CHK016 Sheet vs BRD conflicts resolved in favour of BRD: Chatbot, Branch Locator tile, "common popup" on token failure, accessibility shortcut
- [x] CHK017 Duplicate-looking ids across sheets (`HOME_ACTION_TC_001` etc.) kept unique by the tool's `Sheet<n> / ` prefix; tests use the final ids
- [ ] CHK018 Duplicate TC-ID gate against existing tests: skipped, repo has only the template `App.test.tsx` (no `[TC-…]` claims)

## Open items requiring owner input before related behaviour is coded

- [x] CHK020 Resolved by owner 2026-11-06: O-03 stub, O-06 dialer/mail/Branch Locator, O-07 Update + Skip, AES-128-GCM token-field encryption
- [ ] CHK019 O-05 Pay Now WebView header/error · O-13 tablet layout · PERF-1 target
