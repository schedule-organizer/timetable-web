# Story 2.3: Class Management

Status: ready-for-dev

## Story

As a Timetabler,
I want to create and manage class records (student groups),
So that the scheduler knows which groups need lessons assigned.

## Acceptance Criteria

**Given** I click "Add class" and submit a class name and optional year group
**When** saved
**Then** the class appears in the class list and is available for scheduling assignment

**Given** I edit a class name or year group and save
**Then** the updated details are reflected everywhere the class is referenced (constraints, grid, reports)

**Given** I delete a class and confirm
**Then** the class is removed; any schedule slots assigned to it are flagged as orphaned

**Given** classes with different year groups exist
**When** I view the class list
**Then** classes are filterable by year group

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
Build on patterns from `2-2-bulk-teacher-import-via-csv.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 2.3
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
