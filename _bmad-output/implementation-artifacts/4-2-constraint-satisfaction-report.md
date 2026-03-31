# Story 4.2: Constraint Satisfaction Report

Status: done

## Story

As a Timetabler,
I want to see a constraint satisfaction report after each generator run,
So that I immediately understand how well the schedule honours soft preferences and which went unmet.

## Acceptance Criteria

**Given** the generator completes (fully or partially)
**When** the result is displayed
**Then** a satisfaction banner appears showing: overall satisfaction percentage, count of soft preferences fully satisfied, partially satisfied, and not satisfied

**Given** I open the full constraint satisfaction summary
**When** I view it
**Then** each soft preference is listed with its satisfaction status and weight; hard constraints show as satisfied or as the cause of any conflict

**Given** all hard constraints are satisfied and soft preferences are ≥85% satisfied
**When** the banner is shown
**Then** the visual treatment frames the result positively (green banner, e.g., "94% of preferences satisfied") — not as a failure report

## Tasks / Subtasks

- [x] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [x] Implement feature module under `src/features/<area>/` per architecture tree.
- [x] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [x] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [x] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 4 — API focus:** Engine: POST `/api/v1/engine/run`, GET `/api/v1/engine/jobs/{id}`, cancel job; WebSocket `/topic/solver/{jobId}/*`.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `4-1-schedule-generator-run.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 4.2
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Extended `engine.schemas.ts` with `softPreferenceSatisfactionDtoSchema`, `hardConstraintStatusDtoSchema`, and `constraintSatisfactionReportSchema`; updated `engineJobDtoSchema` to include optional `constraintReport` field.
- Added matching types to `engine.types.ts`: `SoftPreferenceSatisfactionDto`, `HardConstraintStatusDto`, `ConstraintSatisfactionReport`.
- Updated MSW `engine.handlers.ts` to include `MOCK_CONSTRAINT_REPORT` (11 soft prefs, 5 hard constraints, 94% overall) in the succeeded job response.
- `SatisfactionBanner` domain component: role=status banner with %, fully/partially/unmet counts, green treatment at ≥85% with no hard constraint violations (amber otherwise), "View details" trigger button. Storybook stories: HighSatisfaction, BelowThreshold, WithHardConflict, ExactThreshold.
- `ConstraintSatisfactionSummary` domain component: modal dialog (via existing `ModalPortal`) listing hard constraints first then soft preferences, each with status badge + weight. Keyboard-accessible (Escape closes, focus on close button on open). Storybook stories: Default, WithHardConflict, Loading.
- `EnginePage.tsx` updated: renders `SatisfactionBanner` between header and workspace when `job.status === 'succeeded' && job.constraintReport`; opens `ConstraintSatisfactionSummary` modal on "View details" click.
- 15 new tests: 7 for `SatisfactionBanner` (rendering, counts, green/amber thresholds, interaction) and 8 for `ConstraintSatisfactionSummary` (dialog role, content, Escape/close). All pass. 0 regressions introduced.

### File List

- `src/types/engine.schemas.ts` (modified)
- `src/types/engine.types.ts` (modified)
- `src/mocks/handlers/engine.handlers.ts` (modified)
- `src/components/domain/satisfaction-banner.tsx` (new)
- `src/components/domain/satisfaction-banner.test.tsx` (new)
- `src/components/domain/satisfaction-banner.stories.tsx` (new)
- `src/components/domain/constraint-satisfaction-summary.tsx` (new)
- `src/components/domain/constraint-satisfaction-summary.test.tsx` (new)
- `src/components/domain/constraint-satisfaction-summary.stories.tsx` (new)
- `src/features/engine/pages/EnginePage.tsx` (modified)

## Change Log

- 2026-03-31: Story 4.2 — constraint satisfaction report: SatisfactionBanner + ConstraintSatisfactionSummary components, Zod schemas for ConstraintSatisfactionReport DTO, MSW mock, EnginePage integration.
- 2026-03-31: Patch review findings — data-variant attribute on SatisfactionBanner (stable tests); useCallback for all EnginePage handlers.

### Review Findings

- [x] [Review][Decision] AC3 threshold uses `overallPercentage` — **Resolved:** `overallPercentage` is the backend’s weighted soft-preference satisfaction score; hard constraints are tracked separately and already checked explicitly (`hardConstraints.some(hc => !hc.satisfied)`). The current banner logic (positive when `overallPercentage >= 85 && no hard violations`) correctly implements AC3 as stated. No code change needed.

- [x] [Review][Patch] Brittle tests tied to Tailwind class substrings — **Resolved:** Added `data-variant=”positive” | “warning”` to `SatisfactionBanner` root element. Tests now assert `toHaveAttribute(‘data-variant’, ‘positive’/’warning’)` instead of checking class name substrings.

- [x] [Review][Patch] Unstable `onClose` / `onViewDetails` callbacks — **Resolved:** Extracted `onOpenSatisfactionSummary` and `onCloseSatisfactionSummary` as `useCallback`-memoised handlers in `EnginePage`. Also wrapped `onGenerate` in `useCallback` for consistency.

- [x] [Review][Defer] Custom modal lacks focus trap — `constraint-satisfaction-summary.tsx` uses `ModalPortal` without roving tabindex / focus containment; deferred, pre-existing pattern for lightweight dialogs unless WCAG scope expands.

- [x] [Review][Defer] Aggregate vs list consistency — `softFullySatisfied` / partial / unmet counts could theoretically diverge from `softPreferences.length`; no client-side guard. Deferred pending API contract or Zod refinement.

---
**Story completion status:** done
