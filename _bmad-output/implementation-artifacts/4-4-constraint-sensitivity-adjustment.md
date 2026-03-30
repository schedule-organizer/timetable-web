# Story 4.4: Constraint Sensitivity Adjustment

Status: done

## Story

As a Timetabler,
I want to downgrade specific hard constraints to soft preferences at runtime,
So that I can break a deadlock without permanently changing my constraint configuration.

## Acceptance Criteria

**Given** I click "Relax constraint" from the ConflictExplainer
**When** the SensitivityPanel opens
**Then** I see the conflicting constraint with a hard/soft toggle and (when set to soft) a weight slider (1–10); the original constraint definition is unchanged in the main configuration (FR20)

**Given** I hover or focus the relaxation option before committing
**When** the impact preview is shown
**Then** a chip displays what will change (e.g., "If relaxed: 1 Friday PM slot may be assigned to Teacher A") (UX-DR11)

**Given** I set a hard constraint to soft with a weight and click "Apply and re-run"
**When** the generator runs
**Then** it treats the relaxed constraint as a soft preference with the specified weight; the original constraint remains hard in the saved configuration

**Given** the re-run after sensitivity adjustment produces a valid schedule
**When** the result is shown
**Then** the satisfaction report clearly indicates which formerly-hard constraint was relaxed and how it was handled

---

## Epic 5: Iterative Schedule Workspace

A Timetabler can work interactively with the generated draft — viewing the full grid (by class / teacher / room), pinning slots to lock them, manually assigning lessons with real-time conflict detection and alternative suggestions, and re-running the generator on unpinned slots only.

**FRs covered:** FR21, FR22, FR23, FR24, FR25, FR26

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
Build on patterns from `4-3-conflict-detection-and-plain-language-explanation.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 4.4
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- **API surface mapping:** `POST /api/v1/engine/run` extended with optional `relaxations: [{constraintId, constraintName, weight}]`; `GET /api/v1/engine/jobs/{id}` returns `constraintReport.relaxedConstraints` array when constraints were relaxed for the run.
- **Zod schemas (`engine.schemas.ts`):** Added `constraintRelaxationSchema`, `relaxedConstraintSummarySchema`; updated `engineRunRequestSchema` with optional `relaxations`; updated `constraintSatisfactionReportSchema` with optional `relaxedConstraints`.
- **Types (`engine.types.ts`):** Added `ConstraintRelaxation`, `RelaxedConstraintSummary` types inferred from new schemas.
- **MSW handler (`engine.handlers.ts`):** `JobRecord` now stores relaxations; POST /run stores relaxations on the job; GET job includes `relaxedConstraints` in constraint report; when a job has relaxations, mock engine treats it as success even in failure mode (simulating deadlock resolution).
- **`SensitivityPanel` component (`src/components/domain/sensitivity-panel.tsx`):** Right-side modal drawer via `ModalPortal`. Hard/soft toggle (radio group), weight slider (1–10, default 5, only shown when Soft), impact preview chip (UX-DR11, shown when Soft with amber styling), note that original config is unchanged. "Apply and re-run" disabled when Hard selected (no change to make), enabled when Soft. Escape closes. Focus management on open. 3 Storybook stories.
- **`ConstraintSatisfactionSummary` updated:** Shows "Relaxed for this run" section above hard constraints when `report.relaxedConstraints` is present; each item uses amber styling and an `ArrowDownCircle` icon.
- **`EnginePage.tsx` updated:** `selectedConflict` state tracks which conflict triggered the panel; `onRelaxConstraint` now finds the conflict from `job.conflictReport.conflicts` by id and opens SensitivityPanel; `onApplyAndReRun` closes panel + explainer and calls `runEngine.mutate` with relaxations; `onGenerate` now accepts optional relaxations parameter.
- **Tests:** 15 new tests in `sensitivity-panel.test.tsx` — render, open/closed state, toggle behaviour, slider visibility/range, impact chip visibility, apply-and-rerun enabled/disabled/payload, cancel/Escape, config-unchanged note. All pass. 0 regressions in engine-related tests.

### File List

- `src/types/engine.schemas.ts` (modified)
- `src/types/engine.types.ts` (modified)
- `src/mocks/handlers/engine.handlers.ts` (modified)
- `src/components/domain/sensitivity-panel.tsx` (new)
- `src/components/domain/sensitivity-panel.test.tsx` (new)
- `src/components/domain/sensitivity-panel.stories.tsx` (new)
- `src/components/domain/constraint-satisfaction-summary.tsx` (modified)
- `src/features/engine/pages/EnginePage.tsx` (modified)
- `src/lib/relaxation-impact-preview.ts` (new)
- `src/lib/relaxation-impact-preview.test.ts` (new)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

## Change Log

- 2026-03-31: Story 4.4 — constraint sensitivity adjustment: SensitivityPanel right-drawer, hard/soft toggle, weight slider, impact preview chip, relaxation schemas, MSW relaxation handling, ConstraintSatisfactionSummary relaxed-constraints section, EnginePage wiring.
- 2026-03-31: Code review follow-up — Zod dedupe; `buildRelaxationImpactPreviewLine` + optional `impactPreviewLine` on SensitivityPanel (UX-DR11); tests for helper and chip with concrete line.

### Review Findings

- [x] [Review][Decision] UX-DR11 impact copy — concrete vs generic — Resolved: `buildRelaxationImpactPreviewLine` derives a concrete line from the first affected slot + teacher/class + day/period labels; `SensitivityPanel` falls back to generic copy when no slots exist.

- [x] [Review][Patch] Deduplicate relaxation shape in Zod — `constraintRelaxationSchema` is defined first; `engineRunRequestSchema` uses `z.array(constraintRelaxationSchema).optional()`.

- [x] [Review][Patch] `SelectedConflict` removed — `EnginePage` holds `ConflictExplanationDto | null` so conflict data is used for impact preview without dead fields.

- [x] [Review][Defer] `onRelaxConstraint` no-op when conflict missing — `EnginePage.tsx` — deferred, pre-existing edge (stale job / race): if `find` returns undefined, the user gets no feedback.

- [x] [Review][Defer] Focus return after closing SensitivityPanel — deferred, pre-existing modal pattern gap: focus moves to Cancel on open but does not restore focus to the control that opened the panel.

---
**Story completion status:** done — Story 4.4 implemented; code review findings addressed.
