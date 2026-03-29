# Story 2.1: Teacher Management (Manual Entry)

Status: done

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


### Previous story
Build on patterns from `1-7-role-management-rbac-and-subscription-tier-limits.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 2.1
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

GPT-5.4 (Codex mode) with local context configured for BMad story execution.

### Implementation Plan

- AC1 (teacher creation) maps to `POST /api/v1/teachers` driven by the new `useCreateTeacher` hook and the `TeacherForm` manual-entry component.
- AC2 (updates) maps to `PATCH /api/v1/teachers/:id` triggered by the same form opened in edit mode; inline validation is powered by `teacherFormSchema`.
- AC3 (delete) maps to `DELETE /api/v1/teachers/:id` with a confirmation banner that keeps the roster table accessible.
- AC4 (empty state) maps to the table wrapper that displays "No teachers yet. Import via CSV or add individually." along with Add/Import CTAs when the roster is empty.
- The teacher roster section and helpers share status badges with the existing invitation table, while the invites section still uses `InviteTeachersDialog`.

### Debug Log References

- Built `TeacherForm` (Zod + react-hook-form) and wired it into `TeacherListPage` to support add/edit/delete flows and success/error messaging.
- Added `useTeachers`/`useCreateTeacher`/`useUpdateTeacher`/`useDeleteTeacher`, plus MSW `teacherHandlers` that rely on `mockTeachers` fixtures to exercise `/api/v1/teachers`.
- Updated `_bmad-output/implementation-artifacts/sprint-status.yaml` to mark the story in-progress → review and captured vitest output for validation.

### Completion Notes List

- Manual teacher roster now loads via `/api/v1/teachers`, shows the required empty state message with two CTAs, and surfaces Add/Edit/Delete actions with inline confirmations.
- `TeacherForm` enforces required names/emails, exposes optional phone/subject qualifications, and reuses the same schema for create/update payloads.
- Vitest (`npm test -- TeacherListPage.test.tsx`) ran successfully (9 tests passing) after the new UI and mocks were wired.

### File List

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/api/hooks/useTeachers.ts`
- `src/features/teachers/components/TeacherForm.tsx`
- `src/features/teachers/pages/TeacherListPage.tsx`
- `src/features/teachers/pages/TeacherListPage.test.tsx`
- `src/mocks/fixtures/teachers.fixtures.ts`
- `src/mocks/handlers/teacher.handlers.ts`
- `src/mocks/handlers/index.ts`
- `src/types/teacher.schemas.ts`
- `src/types/teacher.types.ts`

### Change Log

- Implemented manual teacher roster CRUD (schema → hooks → UI) backed by MSW handlers and added vitest coverage; sprint status now reports `review`.

### Review Findings

- [x] [Review][Decision] AC3 — “existing schedule assignments flagged” on delete — **Resolved (1B):** After successful delete, the success `role="status"` banner now reminds timetablers to review the schedule if the teacher had assignments (placeholder until backend/API can flag conflicts explicitly).

- [x] [Review][Patch] Delete confirmation uses `fullName` on `TeacherDto` — **Fixed:** Confirmation and success copy use `formatName(...)`.

- [x] [Review][Defer] No test for manual roster `GET /api/v1/teachers` failure — Invitations section has error coverage; teacher roster fetch error is only shown in UI without a dedicated test. — deferred, low priority

---
**Story completion status:** done — Code review resolutions applied; manual teacher CRUD complete.
