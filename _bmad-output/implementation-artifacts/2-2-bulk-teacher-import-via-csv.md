# Story 2.2: Bulk Teacher Import via CSV

Status: done

## Story

As a Timetabler,
I want to import teacher records from a CSV file,
So that I can set up a large roster in seconds without manual data entry.

## Acceptance Criteria

**Given** I upload a CSV file with valid teacher data (name, email columns at minimum)
**When** the file is parsed
**Then** a preview list shows all found records with a count before committing

**Given** I review the preview and confirm import
**When** the import is committed
**Then** all valid records are created; records already existing (matched by email) are skipped with a note

**Given** the CSV contains rows with missing required fields
**When** the preview is shown
**Then** invalid rows are highlighted with specific error messages; I can import only valid rows or cancel

**Given** the import would push teacher count over my subscription tier limit
**When** I try to commit
**Then** the import is blocked server-side with a message showing how many records can still be added

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
Build on patterns from `2-1-teacher-management-manual-entry.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 2.2
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

GPT-5.4 (Codex mode) with the BMAD story workflow and import-focused context.

### Implementation Plan

- AC1 (preview before commit) is satisfied by the CSV parser (`parseTeacherCsv`) paired with the import panel summary that counts ready/duplicate/invalid rows and surfaces the per-row status.
- AC2 (commit creates valid records and skips existing ones) is covered by `useImportTeachers` → `/api/v1/teachers/import`, which deduplicates by email before hitting the mock server and invalidates the teacher query cache on success.
- AC3 (invalid rows highlighted) is handled by the parser marking rows with missing names/emails plus the roster UI drawing red rows and inline messages next to each invalid entry.
- AC4 (subscription limit) is enforced server-side in `teacher.handlers` by comparing the new batch size against the 30-teacher ceiling and returning a descriptive 400 response that the UI renders with `getApiErrorMessage`.
- Tests cover both the UI (`TeacherListPage.test.tsx`) and the parser helper (`parse-teacher-csv.test.ts`), ensuring the new flows behave under nominal, duplicate, and limit-failure scenarios.

### Debug Log References

- Added `parseTeacherCsv` (and unit tests) to produce preview rows with validation states and normalized name/email segments before import submission.
- Extended `TeacherListPage` with the CSV import panel, import preview table, alert handling, and wiring for `useImportTeachers`, plus `importFeedback` messaging.
- Added `useImportTeachers`, new schemas/types for bulk import, and MSW `teacherHandlers` support to simulate duplicate filtering, limit enforcement, and remaining-quota reporting.
- Ran `npm test -- TeacherListPage.test.tsx`, `npm test -- src/features/teachers/utils/parse-teacher-csv.test.ts`, and the full `npm test` suite (noting the existing LoginPage AggregateError noise).

### Completion Notes List

- The import panel now validates CSV rows up front, highlights issues per row, and keeps duplicates/invalid rows visible while only committing valid records via `Import valid rows`.
- Backend mocks enforce the 30-teacher ceiling, skip duplicate emails, and return the remaining quota to drive user messaging; React Query hooks refresh the roster post-import.
- Parser logic ensures both first+last names or a name column are present, enforces email validation, and marks duplicates; the UI mirrors that state with color, badges, and error text.

### File List

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/2-2-bulk-teacher-import-via-csv.md`
- `src/api/hooks/useTeachers.ts`
- `src/features/teachers/pages/TeacherListPage.tsx`
- `src/features/teachers/pages/TeacherListPage.test.tsx`
- `src/features/teachers/utils/parse-teacher-csv.test.ts`
- `src/features/teachers/utils/parse-teacher-csv.ts`
- `src/mocks/handlers/teacher.handlers.ts`
- `src/mocks/handlers/index.ts`
- `src/types/teacher.schemas.ts`
- `src/types/teacher.types.ts`

### Change Log

- Added a CSV parser, import preview UI, and dedicated API hook/handler that create valid teachers, skips duplicates, and respects the 30-teacher limit, while unit and integration tests now cover the new parser and import experience (full `npm test` suite passing, ignoring the existing jsdom AggregateError noise).

---
---
**Story completion status:** done — Bulk teacher import CRUD, parser, tests, and review follow-ups (Name column rules + long-row truncation) complete.

### Review Findings

- [x] [Review][Patch] Rows with more comma-separated cells than the header — Addressed: truncate parsed row values to the header column count in [`parse-teacher-csv.ts`](src/features/teachers/utils/parse-teacher-csv.ts); unit test in [`parse-teacher-csv.test.ts`](src/features/teachers/utils/parse-teacher-csv.test.ts).

- [x] [Review][Decision] Single-token `Name` values (e.g. mononyms) — **Resolved (option 2):** Keep parser behavior; document that a single `Name` cell must contain at least two words (first + last), and that one-word names must use separate First name / Last name columns. UI copy updated in [`TeacherListPage.tsx`](src/features/teachers/pages/TeacherListPage.tsx).

- [x] [Review][Patch] Import success copy when nothing was skipped — Addressed: conditional `skippedPhrase` in [`TeacherListPage.tsx`](src/features/teachers/pages/TeacherListPage.tsx).

- [x] [Review][Patch] Duplicate accessible name “Import via CSV” — Addressed: distinct `aria-label` on roster vs empty-state buttons in [`TeacherListPage.tsx`](src/features/teachers/pages/TeacherListPage.tsx).

- [x] [Review][Patch] UTF-8 BOM — Addressed: strip `\uFEFF` at start of text in [`parse-teacher-csv.ts`](src/features/teachers/utils/parse-teacher-csv.ts).

- [x] [Review][Patch] `sprint-status.yaml` `last_updated` — Addressed: forward timestamp in [`sprint-status.yaml`](./sprint-status.yaml).

- [x] [Review][Defer] `engines.node` upper bound — Addressed: `>=20` in [`package.json`](package.json) and [`package-lock.json`](package-lock.json).

- [x] [Review][Defer] `vite.config.ts` crypto polyfill — Addressed: documented why it must load before Vitest `setupFiles` (config resolution); kept in [`vite.config.ts`](vite.config.ts).

- [x] [Review][Defer] CSV file size cap — Addressed: `MAX_TEACHER_CSV_BYTES` (2 MB) in [`TeacherListPage.tsx`](src/features/teachers/pages/TeacherListPage.tsx).

- [x] [Review][Defer] Client-side email shape in preview — Addressed: Zod `email()` check in [`parse-teacher-csv.ts`](src/features/teachers/utils/parse-teacher-csv.ts).

- [x] [Review][Defer] Ragged CSV rows — Addressed: pad row values to header length in [`parse-teacher-csv.ts`](src/features/teachers/utils/parse-teacher-csv.ts).
