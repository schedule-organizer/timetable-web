# Story 2.5: Room Management

Status: ready-for-dev

## Story

As a Timetabler,
I want to create and manage room records,
So that the scheduler can assign lessons to appropriate rooms and avoid double-booking.

## Acceptance Criteria

**Given** I click "Add room" and submit a room name, capacity, and room type (e.g., classroom, lab, sports hall)
**When** saved
**Then** the room is created and available for scheduling assignment

**Given** I edit a room's capacity or type and save
**Then** the updated details are used by the constraint engine for room suitability checks on the next generator run

**Given** I delete a room and confirm
**Then** the room is removed; any schedule slots assigned to it are flagged

## Tasks / Subtasks

- [ ] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [ ] Implement feature module under `src/features/<area>/` per architecture tree.
- [ ] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [ ] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [ ] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 2 — API focus:** CRUD: `/api/v1/teachers`, `/api/v1/classes`, `/api/v1/subjects`, `/api/v1/rooms` — paginated envelope; teacher qualifications as multi-subject.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `2-4-subject-management-with-difficulty-levels.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 2.5
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
