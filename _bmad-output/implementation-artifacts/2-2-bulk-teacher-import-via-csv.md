# Story 2.2: Bulk Teacher Import via CSV

Status: ready-for-dev

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
Build on patterns from `2-1-teacher-management-manual-entry.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 2.2
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
