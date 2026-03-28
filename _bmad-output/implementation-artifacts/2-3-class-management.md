# Story 2.3: Class Management

Status: done

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

- [x] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [x] Implement feature module under `src/features/<area>/` per architecture tree.
- [x] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [x] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [x] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 2 — API focus:** CRUD: `/api/v1/teachers`, `/api/v1/classes`, `/api/v1/subjects`, `/api/v1/rooms` — paginated envelope; teacher qualifications as multi-subject.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.

**AC2 / AC3 (code review):** Full “reflected everywhere” and server-side orphan slot flagging are deferred until scheduling, constraints, and reports consume class IDs; this increment delivers CRUD, cache invalidation for the class list, and user-facing copy for propagation and orphaned slots.

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

- AC1 (Add class) flows through `ClassForm` → `useCreateClass` → `POST /api/v1/classes`, invalidating the `CLASSES_QUERY_KEY` cache and surfacing the success toast.
- AC2 (Edit) and AC3 (Delete) reuse the row actions with `useUpdateClass`/`useDeleteClass` hitting `/api/v1/classes/:id`, updating metadata and warning about orphaned slots.
- AC4 (Filter by year group) is implemented client-side via a memoized `yearGroup` dropdown and filtered rows.
- Tests: `npm test -- src/features/classes/pages/ClassManagementPage.test.tsx` validates roster render, filter, create, edit, and delete flows through mocked hooks.

### Completion Notes List

- Implemented `ClassForm`, the roster page, and accessible table/filter/delete interactions under `src/features/classes`.
- Added Zod schemas/DTOs, React Query hooks, and MSW fixtures/handlers so `/api/v1/classes` mirrors the resource envelope and cache invalidation patterns.
- Added Vitest coverage mocking the hooks to cover filtering plus the add/edit/delete flows with success/orphan messaging (command above).

### File List

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/2-3-class-management.md`
- `src/api/hooks/useClasses.ts`
- `src/features/classes/components/ClassForm.tsx`
- `src/features/classes/pages/ClassManagementPage.tsx`
- `src/features/classes/pages/ClassManagementPage.test.tsx`
- `src/mocks/fixtures/classes.fixtures.ts`
- `src/mocks/handlers/class.handlers.ts`
- `src/routes.tsx`
- `src/test/polyfills.ts`
- `src/test/setup.ts`
- `src/test/test-utils.tsx`
- `src/types/class.schemas.ts`
- `src/types/class.types.ts`

### Change Log

- Added the class management UI, including the form, table, filter, and deletion confirmation for `/classes`.
- Introduced the class schemas, hooks, and mocks that match `/api/v1/classes` plus the router entry and navigation wiring.
- Extended the test suite with mocked React Query hooks to exercise the roster, filter, add, edit, and delete flows (`npm test -- src/features/classes/pages/ClassManagementPage.test.tsx`).
- Code review (2026-03-29): Resolved AC2/AC3 as phased delivery (see Dev Notes); added edit-flow test and `ClassForm` `reset` on `initialValues` change.

---
**Story completion status:** done — Class CRUD UI, hooks, mocks, and tests cover ACs 1–4 for this increment; AC2/AC3 cross-surface behavior deferred per Dev Notes.

### Review Findings

- [x] [Review][Decision] AC2/AC3 vs phased delivery — **Resolved:** Satisfied for this increment with UI copy + class-list cache invalidation; grid/constraints/reports and server-side orphan flags land with scheduling work. Documented under Dev Notes.

- [x] [Review][Patch] Missing edit-flow test — Addressed: `updates a class via the edit form` in [`ClassManagementPage.test.tsx`](src/features/classes/pages/ClassManagementPage.test.tsx).

- [x] [Review][Patch] `ClassForm` stale values when `initialValues` change without remount — Addressed: `reset` in [`ClassForm.tsx`](src/features/classes/components/ClassForm.tsx) when `initialValues` changes.
