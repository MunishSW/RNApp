# Implementation Plan: FAQ Screen (Pre-Login)

**Branch**: `003-faq-screen` | **Date**: 2026-11-06 | **Spec**: [spec.md](spec.md)

**Input**: `specs/003-faq-screen/spec.md`, BRD `docs/BRD_FAQ_Screen.md`, Figma node `2:2068`.

## Summary

Build the FAQ screen under `src/features/faq/`: blue action bar with back arrow and title, light-blue page, accordion cards, answer HTML shown as styled text, loader, empty and error states. It replaces the `Faq` route stub. It reuses the shared FAQ service, FAQ store and HTTP client from the Home work and adds only feature-level files, a few theme tokens and two local SVG assets.

## Technical Context

**Language/Version**: TypeScript (strict), React 19.3, React Native 0.88.1, Hermes
**Primary Dependencies** (installed): `@react-navigation/native` + `native-stack`, `@reduxjs/toolkit` + `react-redux`, `react-native-svg`, `react-native-safe-area-context`. No new dependency.
**Storage**: Redux `faq` slice (in memory). Nothing persisted.
**Testing**: Jest 29 with `@react-native/jest-preset`, React Native Testing Library; manual checks in `quickstart.md`.
**Target Platform**: Android and iOS; 360 x 778 reference frame.
**Constraints**: no raw hex outside `src/theme/tokens.ts`; no literal user text in components; no endless animation; no direct axios or fetch; no WebView.

## Constitution Check

| Principle | Plan response |
|---|---|
| I Requirements are the source of truth | Every task cites FR ids; strings live in `faqConstants.ts` |
| II Design fidelity | Figma numbers copied into tokens and styles; assets taken from Figma |
| III Accessibility | roles, labels, state, announcements, 44 touch targets, text scale; accessibility tests |
| V API layer | Only the shared service; failures handled in the hook |
| VI Code quality | logic in a hook and a parser; components render only; explicit back target |
| VII Quality gates | typecheck, lint, affected tests |
| VIII Performance | stored list paints first; refresh does not block; loader cleared in `finally` |

## Gaps against the request

| # | Need | Current repo | Plan |
|---|---|---|---|
| G-1 | FAQ screen | `Faq` route is a `StubScreen` | New `FaqScreen`, route wired in `RootNavigator.tsx` |
| G-2 | Fresh list on every return | `useFaqFlow` only fetches on tap | New `useFaqData` hook on screen focus |
| G-3 | HTML answers | no HTML library, no WebView | Small parser `parseAnswerHtml.ts` to blocks, rendered as styled `Text` |
| G-4 | Back arrow and chevron art | not in project | Two SVG files copied from Figma to `src/assets/faq/`, drawn with `react-native-svg` |
| G-5 | Page colour and chevron colour tokens | not in `tokens.ts` | Add `faqPageBackground` `#E3ECF5`, `faqChevron` `#FF5101` (additive) |

## Project Structure

```text
specs/003-faq-screen/
├── spec.md  plan.md  tasks.md  quickstart.md
├── contracts/faq-api.md
└── checklists/requirements.md

src/
├── assets/faq/{back-arrow.svg, chevron-down.svg, index.ts}
├── navigation/RootNavigator.tsx                  (changed: Faq route uses FaqScreen)
├── theme/tokens.ts                                (changed: additive tokens)
└── features/faq/
    ├── FaqScreen.tsx
    ├── faqConstants.ts
    ├── parseAnswerHtml.ts
    ├── components/{FaqHeader.tsx, FaqCard.tsx, FaqAnswer.tsx, FaqStateView.tsx}
    ├── hooks/{useFaqData.ts, useFaqBack.ts}
    └── __tests__/*.test.ts(x)
```

## Dependency / Mock Strategy

- `faqService.fetchFaq` is mocked at the service boundary in hook and screen tests.
- Navigation is mocked with a `navigate` function and a focus-listener stub; `BackHandler`, `Linking` are spied.
- Redux tests use the real store from `src/store`.
- Fake timers for animation and tap bursts. No real network.
- `__tests__/faqEndpoint.test.tsx` uses the real `fetchFaq` and replaces only the axios adapter of the shared `apiClient` (the network boundary) to capture request URLs.

## Requirement -> File allocation

Paths are under `src/features/faq/` unless they start with `assets/`, `theme/`, `store/` or `navigation/` (under `src/`).

| FR | Files |
|---|---|
| FR-001 | FaqScreen.tsx, components/FaqHeader.tsx, theme/tokens.ts |
| FR-002 | components/FaqHeader.tsx, assets/faq/back-arrow.svg, assets/faq/index.ts |
| FR-003 | FaqScreen.tsx |
| FR-004 | faqConstants.ts, theme/tokens.ts |
| FR-005 | FaqScreen.tsx |
| FR-006 | components/FaqCard.tsx, assets/faq/chevron-down.svg, assets/faq/index.ts |
| FR-007 | components/FaqCard.tsx |
| FR-008 | components/FaqCard.tsx, FaqScreen.tsx |
| FR-009 | components/FaqCard.tsx |
| FR-010 | FaqScreen.tsx |
| FR-011 | FaqScreen.tsx |
| FR-012 | parseAnswerHtml.ts, components/FaqAnswer.tsx |
| FR-013 | components/FaqAnswer.tsx |
| FR-014 | components/FaqAnswer.tsx, components/FaqCard.tsx, FaqScreen.tsx |
| FR-015 | parseAnswerHtml.ts, components/FaqAnswer.tsx, hooks/useFaqData.ts |
| FR-016 | hooks/useFaqData.ts |
| FR-017 | hooks/useFaqData.ts |
| FR-018 | hooks/useFaqData.ts, components/FaqStateView.tsx, FaqScreen.tsx |
| FR-019 | hooks/useFaqData.ts (only `fetchFaq`) |
| FR-020 | hooks/useFaqData.ts |
| FR-021 | hooks/useFaqData.ts, store/faqSlice.ts (`clearFaq`, existing; no logout code calls it yet) |
| FR-022 | components/FaqStateView.tsx, faqConstants.ts |
| FR-023 | hooks/useFaqData.ts |
| FR-024 | components/FaqStateView.tsx, hooks/useFaqData.ts |
| FR-025 | components/FaqStateView.tsx |
| FR-026 | hooks/useFaqBack.ts, components/FaqHeader.tsx, navigation/RootNavigator.tsx |
| FR-027 | hooks/useFaqBack.ts (via `useGuardedNavigate`) |
| FR-028 | components/FaqCard.tsx |
| FR-029 | components/FaqHeader.tsx |
| FR-030 | components/FaqCard.tsx |
| FR-031 | components/FaqCard.tsx, components/FaqAnswer.tsx, FaqScreen.tsx (no fixed text heights) |

## Phases

1. Setup: tokens, assets, constants, route.
2. Parser and state hook (pure logic, tested first).
3. Components: header, card, answer, state view.
4. Screen wiring: list, refresh on focus, empty and error, back.
5. Accessibility pass and verification.
