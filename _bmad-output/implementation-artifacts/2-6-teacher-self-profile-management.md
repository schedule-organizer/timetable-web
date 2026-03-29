# Story 2.6: Teacher Self-Profile Management

Status: done

## Story

As a Teacher,
I want to update my own profile including name, contact details, and subject qualifications,
So that the timetabler has accurate information about my teaching capabilities.

## Acceptance Criteria

**Given** I am logged in as a Teacher and navigate to My Profile
**When** I update my name or contact details and save
**Then** the changes are reflected in my profile and in timetabler-facing teacher views

**Given** I manage my subject qualifications (add or remove primary / secondary subjects)
**When** I save
**Then** the change is stored and visible to the Timetabler in the teacher management view

**Given** I attempt to edit another teacher's profile
**When** the request reaches the server
**Then** it is denied with a 403 (NFR8)

---

## Epic 3: Teacher Availability & Constraint Configuration

A Timetabler can define all scheduling rules — hard constraints the engine must not violate, soft preferences with configurable weights, and subject-level scheduling rules. Teachers can submit their availability via the three-state availability grid (forbidden slots + preferred slots).

**FRs covered:** FR12, FR13, FR14, FR15, FR16

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
Build on patterns from `2-5-room-management.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 2.6
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- AC1/AC2 are backed by `useMyProfile` (GET `/api/v1/teachers/me`) and `useUpdateMyProfile` (PATCH `/api/v1/teachers/me`); the `MyProfilePage` pre-fills `TeacherForm` with current profile data and submits trimmed payloads including subjectQualifications as an array.
- AC3 (403 on editing another teacher's profile) is enforced by the backend; the frontend only exposes the `/me` endpoint so there is no UI surface for editing a different teacher's profile. The 403 error path is tested by mocking `useUpdateMyProfile` to return a 403-shaped error and asserting the alert is rendered.
- `MOCK_CURRENT_TEACHER_ID = 'teacher-roster-1'` convention in `teacher.handlers.ts` identifies the "logged-in teacher" for GET/PATCH `/api/v1/teachers/me`; `/me` handlers are registered before `/:id` handlers to avoid wildcard capture.
- Reused existing `TeacherForm` component with `key={profile.id}` to ensure stable form reset when profile loads.

### Completion Notes List

- Added `useMyProfile` and `useUpdateMyProfile` hooks to `src/api/hooks/useTeachers.ts`; hooks use `/api/v1/teachers/me` and on successful update invalidate `MY_PROFILE_QUERY_KEY` and `TEACHERS_QUERY_KEY` so the roster stays in sync for timetablers.
- Added `GET /api/v1/teachers/me` and `PATCH /api/v1/teachers/me` MSW handlers to `teacher.handlers.ts` (registered before `/:id` to avoid wildcard match); introduced `MOCK_CURRENT_TEACHER_ID` export.
- Created `MyProfilePage` under `src/features/teachers/pages/` — always-visible profile form, loading state, load-error state, success banner, and 403 error alert.
- Wired `/profile` route in `src/routes.tsx` within the protected app shell; added **My Profile** nav item in `Sidebar.tsx` (md+ sidebar; mobile tab bar unchanged).
- Wrote 7 Vitest tests covering: profile data display, loading state, load error, AC1 (update name/contact), AC2 (update subject qualifications), AC3 (403 error alert), and pending/disabled button state.

### File List

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/2-6-teacher-self-profile-management.md`
- `src/api/hooks/useTeachers.ts`
- `src/mocks/handlers/teacher.handlers.ts`
- `src/features/teachers/pages/MyProfilePage.tsx`
- `src/features/teachers/pages/MyProfilePage.test.tsx`
- `src/routes.tsx`
- `src/components/layout/Sidebar.tsx`

### Change Log

- Added `useMyProfile` and `useUpdateMyProfile` hooks to `useTeachers.ts` using `/api/v1/teachers/me` endpoints; successful PATCH invalidates `MY_PROFILE_QUERY_KEY` and `TEACHERS_QUERY_KEY`.
- Extended `teacher.handlers.ts` with `GET /api/v1/teachers/me` and `PATCH /api/v1/teachers/me` MSW handlers (registered before `/:id`); exported `MOCK_CURRENT_TEACHER_ID`.
- Created `MyProfilePage` at `/profile` route for teachers to update their own name, contact details, and subject qualifications (AC1, AC2); 403 error surfaces via alert (AC3).
- Wrote 7 Vitest/RTL tests for `MyProfilePage` covering all three ACs, loading state, and error handling.

---
**Story completion status:** done — Teacher self-profile management implemented and tested; My Profile linked from sidebar; review findings addressed or deferred.

### Review Findings

- [x] [Review][Decision] Expose “My Profile” in app navigation — Added `My Profile` → `/profile` in `Sidebar.tsx` main nav (before Settings), with `UserCircle` icon. Mobile bottom bar still shows the first five items only; profile is available on md+ sidebar and via direct URL.

- [x] [Review][Patch] Dev notes — completion bullets updated to state that `useUpdateMyProfile` invalidates both `MY_PROFILE_QUERY_KEY` and `TEACHERS_QUERY_KEY` (re-review 2026-03-29).

- [x] [Review][Patch] Invalidate teacher roster after self-profile save — `useUpdateMyProfile` now invalidates `TEACHERS_QUERY_KEY` on success in addition to `MY_PROFILE_QUERY_KEY`. [`src/api/hooks/useTeachers.ts`]

- [x] [Review][Defer] Role-only route guard for `/profile` — [`src/routes.tsx`] — deferred, pre-existing: `ProtectedRoute` is auth-only; RBAC for TEACHER vs timetabler is not applied elsewhere in shell routes; backend remains source of truth for `/me`.

- [x] [Review][Defer] AC3 component test could assert 403 message text — [`src/features/teachers/pages/MyProfilePage.test.tsx`] — deferred: test checks `role="alert"` only; optional hardening to match `getApiErrorMessage` output.
