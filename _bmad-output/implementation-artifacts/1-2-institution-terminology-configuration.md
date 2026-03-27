# Story 1.2: Institution Terminology Configuration

Status: ready-for-dev

## Story

As a Timetabler,
I want to rename SchediFlow's domain terms to match my school's language,
So that the platform feels native to how my institution operates.

## Acceptance Criteria

**Given** I navigate to Institution Settings → Terminology
**When** I view the page
**Then** I see editable fields for each configurable term: Period, Class, Term, Cycle, Bell Schedule, Room, Subject

**Given** I update a term (e.g., "Period" → "Lesson") and save
**When** any user in my institution views any page
**Then** the updated label appears everywhere in the interface — navigation, form labels, grid headers, reports — for all users in the institution

**Given** I clear a term label and save
**Then** the default SchediFlow term is restored for that concept

## Tasks / Subtasks

- [ ] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [ ] Implement feature module under `src/features/<area>/` per architecture tree.
- [ ] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [ ] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [ ] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 1 — API focus:** Auth: POST `/api/v1/auth/*`; Settings: GET/PUT `/api/v1/settings`, GET `/api/v1/settings/labels`; Users: `/api/v1/users` — see architecture §3.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `1-1-institution-registration-and-application-shell.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 1.2
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
