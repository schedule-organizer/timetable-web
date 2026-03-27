# Story 3.1: Hard Constraint Definition

Status: ready-for-dev

## Story

As a Timetabler,
I want to define hard constraints that the scheduler must never violate,
So that fundamental scheduling rules are always respected in every generated timetable.

## Acceptance Criteria

**Given** I navigate to Constraints → Hard Constraints and create a new constraint (e.g., "Teacher cannot be double-booked", "Room capacity must not be exceeded")
**When** saved
**Then** the constraint is applied by the generator on every subsequent run

**Given** hard constraints are defined and the generator runs
**Then** no generated schedule violates any hard constraint; if satisfaction is impossible, a conflict report is returned instead of a partial schedule

**Given** I edit or delete an existing hard constraint and save
**Then** the change takes effect on the next generator run; previously generated schedules are not retroactively affected

## Tasks / Subtasks

- [ ] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [ ] Implement feature module under `src/features/<area>/` per architecture tree.
- [ ] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [ ] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [ ] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 3 — API focus:** Constraints, forbidden slots, availability: `/api/v1/forbidden-slots`, teacher availability GET/PUT `/api/v1/teachers/{id}/availability`, teaching-groups, option-blocks per architecture.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `2-6-teacher-self-profile-management.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 3.1
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
