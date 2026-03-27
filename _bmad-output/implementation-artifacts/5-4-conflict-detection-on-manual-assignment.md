# Story 5.4: Conflict Detection on Manual Assignment

Status: ready-for-dev

## Story

As a Timetabler,
I want the system to detect conflicts when I manually assign a lesson and suggest valid alternatives,
So that I can resolve scheduling problems without guessing.

## Acceptance Criteria

**Given** I manually assign a lesson to a slot that creates a conflict (e.g., teacher double-booked, room already in use)
**When** the assignment is submitted
**Then** a conflict popover appears showing the specific conflict reason and 2–3 alternative valid slots (FR24)

**Given** alternative slots are suggested and I click one
**Then** the lesson moves to that slot; the conflict is resolved; the original slot is cleared

**Given** I dismiss the conflict suggestion and keep the conflicting assignment
**When** saved
**Then** the SlotCell renders in conflict state (red top border + conflict icon) and is flagged in the ConflictExplainer if the generator re-runs

**Given** a manual assignment creates no conflict
**When** confirmed
**Then** no conflict UI is shown; the slot renders in standard filled state

## Tasks / Subtasks

- [ ] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [ ] Implement feature module under `src/features/<area>/` per architecture tree.
- [ ] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [ ] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [ ] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 5 — API focus:** Timetable: GET `/api/v1/timetables/{id}/lessons`, PATCH `/api/v1/lessons/{id}`, POST/DELETE pin, swap; WS `/topic/timetable/{timetableId}`.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `5-3-manual-slot-assignment.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 5.4
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
