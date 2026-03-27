# Story 6.4: Teacher Full-School Read-Only Grid View

Status: ready-for-dev

## Story

As a Teacher,
I want to view the full school timetable grid in read-only mode,
So that I can see colleagues' schedules and understand the full picture.

## Acceptance Criteria

**Given** I am logged in as a Teacher and navigate to the School Timetable
**When** I view it
**Then** the TimetableGrid renders in `readOnly` mode — no pin, assign, drag, or context menu actions are available

**Given** I switch view pivot (Full School / By Teacher / By Room)
**Then** all pivot views are available and functional; the year-group filter is also available

**Given** I click a slot in read-only mode
**When** the interaction occurs
**Then** a read-only detail popover shows subject, teacher, room, and period — no editing action occurs

## Tasks / Subtasks

- [ ] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [ ] Implement feature module under `src/features/<area>/` per architecture tree.
- [ ] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [ ] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [ ] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 6 — API focus:** Publish POST `/api/v1/timetables/{id}/publish`; export PDF GET `/api/v1/timetables/{id}/export/pdf`; notifications patterns per UX.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `6-3-teacher-personal-timetable-view.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 6.4
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
