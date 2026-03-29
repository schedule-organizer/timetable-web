# Story 2.4: Subject Management with Difficulty Levels

Status: done

## Story

As a Timetabler,
I want to create subjects and assign each a difficulty level,
So that the scheduler can apply difficulty-based distribution rules when generating the timetable.

## Acceptance Criteria

**Given** I click "Add subject" and submit a subject name and difficulty level (Low / Medium / High)
**When** saved
**Then** the subject is created with the difficulty level stored and used by the constraint engine

**Given** I edit a subject's difficulty level and save
**Then** the updated level is applied on the next generator run

**Given** I view the subject list
**Then** each subject shows its name and difficulty level; the list is sortable and filterable by difficulty

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
Build on patterns from `2-3-class-management.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 2.4
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

_(filled by dev agent)_

### Debug Log References

- AC1/AC2 are backed by `useCreateSubject`/`useUpdateSubject` hitting `/api/v1/subjects` (`POST`/`PATCH`) while the `SubjectForm` overlay translates form values into trimmed payloads before the mutations fire.
- AC3 maps to `SubjectManagementPage`'s roster table plus filter/select controls and the `DifficultyBadge`, giving a sortable, filterable surface for the scheduler to view subjects and difficulty metadata; the `useSubjects` hook keeps the list fresh.
- The subject Zod schemas/DTOs define `difficulty` as `LOW|MEDIUM|HIGH`, the paginated envelope, and drive both the API hooks and the MSW `subjectHandlers`, which mirror the same contract and invalidate `SUBJECTS_QUERY_KEY` after mutations.
- Vitest coverage for `SubjectManagementPage` exercises the filter, add, and edit flows using mocked hooks so the page can be proven accessible while remaining firmly in the existing mock-first surface.

### Completion Notes List

- Added the subject management UI (list, filter, sort, add/edit form, difficulty badges) under `src/features/subjects`, wired to TanStack Query and Axios hooks so the scheduler can create and update difficulty-tagged subjects.
- Introduced Zod schemas, DTOs, React Query hooks, and MSW fixtures/handlers for `/api/v1/subjects`, plus the `setup.ts` polyfill import, so the mock server can serve the new resource with the same envelope and cache invalidation semantics.
- Wrote Vitest coverage (`SubjectManagementPage.test.tsx`) that mocks the hooks to prove filtering, creation, and editing flows and verifies the user messages, keeping the feature test-friendly while polyfills guard MSW interceptors.

### File List

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/2-4-subject-management-with-difficulty-levels.md`
- `src/api/hooks/useSubjects.ts`
- `src/features/subjects/components/SubjectForm.tsx`
- `src/features/subjects/components/DifficultyBadge.tsx`
- `src/features/subjects/pages/SubjectManagementPage.tsx`
- `src/features/subjects/pages/SubjectManagementPage.test.tsx`
- `src/mocks/fixtures/subjects.fixtures.ts`
- `src/mocks/handlers/subject.handlers.ts`
- `src/mocks/handlers/index.ts`
- `src/routes.tsx`
- `src/test/setup.ts`
- `src/types/subject.schemas.ts`
- `src/types/subject.types.ts`

### Change Log

- Added the subject management page (list, filters, sort controls, difficulty badges) and form wired to `useSubjects`/`useCreateSubject`/`useUpdateSubject` so AC1–AC3 can operate against the UI.
- Introduced subject Zod schemas, DTOs, React Query hooks, and MSW fixtures/handlers that expose `/api/v1/subjects` with the paginated envelope and cache invalidation pattern borrowed from the class feature.
- Expanded Vitest coverage for the page and ensured the global `Response` polyfill loads via `src/test/setup.ts` so MSW-based tests keep working.

---
**Story completion status:** done — Subject management CRUD UI, hooks, mocks, and tests cover the ACs; code review patches applied (filtered-empty copy, trimmed name validation, test setup).

### Review Findings

- [x] [Review][Patch] Roster empty copy conflates “no subjects” and “no matches for filter” [`src/features/subjects/pages/SubjectManagementPage.tsx` ~229–232]
- [x] [Review][Patch] Whitespace-only subject names pass client validation (`min(1)` before trim); trim or refine in `subjectFormSchema` / submit path [`src/types/subject.schemas.ts`, `SubjectManagementPage` `handleFormSubmit`]
- [x] [Review][Patch] Redundant `@/test/polyfills` import in page test now that `src/test/setup.ts` loads polyfills globally [`src/features/subjects/pages/SubjectManagementPage.test.tsx`]
