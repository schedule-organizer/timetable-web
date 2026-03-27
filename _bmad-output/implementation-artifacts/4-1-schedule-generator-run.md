# Story 4.1: Schedule Generator Run

Status: ready-for-dev

## Story

As a Timetabler,
I want to run the schedule generator for a term,
So that a complete draft timetable is produced automatically from my configured constraints and data.

## Acceptance Criteria

**Given** I have at least one teacher, class, subject, room, Bell Schedule, Cycle, and active Term configured
**When** I click "Generate"
**Then** the generator runs and produces a complete draft timetable for the active term

**Given** the generator is running
**When** I view the workspace
**Then** the GeneratorStatusBar shows a spinner with real-time status text (e.g., "Placing 340 lessons…"); the rest of the UI remains interactive (UX-DR9)

**Given** the generator completes successfully
**When** the result is returned
**Then** the status bar transitions to green "Done"; the timetable grid is populated with the generated schedule within 30 seconds for up to 100 teachers, 60 classes, 5-day cycle (NFR1)

**Given** the generator runs a second time on the same term
**When** it completes
**Then** the previous draft is replaced with the new result; no previously generated data persists unless explicitly pinned

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
Build on patterns from `3-5-timetabler-availability-overview-and-override.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 4.1
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
