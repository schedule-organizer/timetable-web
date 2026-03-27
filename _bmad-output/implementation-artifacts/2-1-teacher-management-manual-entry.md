# Story 2.1: Teacher Management (Manual Entry)

Status: ready-for-dev

## Story

As a Timetabler,
I want to create and manage individual teacher records,
So that I have a complete roster of staff available for scheduling.

## Acceptance Criteria

**Given** I navigate to People → Teachers and click "Add teacher"
**When** I submit a teacher's name and contact details
**Then** the teacher record is created and appears in the teacher list

**Given** I open an existing teacher record and update any field
**When** I save
**Then** the changes are reflected immediately in the teacher list and any views that display teacher data

**Given** I delete a teacher record and confirm
**When** deletion is processed
**Then** the teacher is removed and can no longer be assigned to lessons; any existing schedule assignments for that teacher are flagged

**Given** the teacher list is empty
**When** I view the page
**Then** an empty state reads "No teachers yet. Import via CSV or add individually." with two CTAs

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
Build on patterns from `1-7-role-management-rbac-and-subscription-tier-limits.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 2.1
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
