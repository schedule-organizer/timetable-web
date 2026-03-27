# Story 1.3: Bell Schedule Definition

Status: ready-for-dev

## Story

As a Timetabler,
I want to define my school's Bell Schedule (named periods and their times),
So that the scheduler knows the time structure of each school day.

## Acceptance Criteria

**Given** I navigate to Institution Setup → Bell Schedule
**When** I add a period with a name, start time, and end time
**Then** the period is saved and appears in the ordered Bell Schedule list

**Given** I have multiple periods
**When** I reorder them
**Then** the order is saved and used as the time axis in the timetable grid, availability grid, and all reports

**Given** I submit overlapping period time ranges
**When** I save
**Then** a specific validation error identifies the overlapping periods and the Bell Schedule is not saved

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
Build on patterns from `1-2-institution-terminology-configuration.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 1.3
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
