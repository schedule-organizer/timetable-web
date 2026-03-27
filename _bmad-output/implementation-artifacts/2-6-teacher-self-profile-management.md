# Story 2.6: Teacher Self-Profile Management

Status: ready-for-dev

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
Build on patterns from `2-5-room-management.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 2.6
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
