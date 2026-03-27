# Story 4.2: Constraint Satisfaction Report

Status: ready-for-dev

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
Build on patterns from `4-1-schedule-generator-run.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 4.2
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
