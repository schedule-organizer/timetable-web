# Story 1.4: Cycle & Academic Term Configuration

Status: ready-for-dev

## Story

As a Timetabler,
I want to define my school's Cycle and create Academic Terms,
So that the scheduler knows the repeating day structure and the active scheduling period.

## Acceptance Criteria

**Given** I navigate to Institution Setup → Cycle
**When** I configure the cycle
**Then** I can set the number of days (e.g., 5, 10) and optionally name each cycle day (e.g., "Day A", "Monday")

**Given** I create a new term with a name, start date, and end date
**When** I submit
**Then** the term is saved and appears in the list ordered chronologically with a status indicator (upcoming / active / past)

**Given** I submit a term with an end date before the start date
**Then** a specific validation error is shown and the term is not saved

**Given** at least one term and one cycle are defined
**When** the schedule generator is invoked
**Then** it uses the active term's date range and the cycle definition to compute total schedulable slots

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
Build on patterns from `1-3-bell-schedule-definition.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 1.4
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
