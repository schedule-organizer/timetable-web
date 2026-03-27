# Story 4.4: Constraint Sensitivity Adjustment

Status: ready-for-dev

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

- [ ] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [ ] Implement feature module under `src/features/<area>/` per architecture tree.
- [ ] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [ ] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [ ] Tests: unit/component for core logic; a11y queries by role/label.

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

_(filled by dev agent)_

### Debug Log References

### Completion Notes List

### File List

---
**Story completion status:** ready-for-dev — Batch story context generated from epics.md
