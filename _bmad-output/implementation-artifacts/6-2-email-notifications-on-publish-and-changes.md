# Story 6.2: Email Notifications on Publish & Changes

Status: ready-for-dev

## Story

As a Teacher,
I want to be notified by email when a timetable is published or when changes affect my schedule,
So that I always know when my schedule is ready or has been updated.

## Acceptance Criteria

**Given** a Timetabler publishes a timetable
**When** publication is confirmed
**Then** every teacher in the institution receives an email with a direct deep-link to their personal timetable (UX-DR15)

**Given** a Timetabler makes changes to a published timetable affecting specific teachers
**When** changes are saved
**Then** only the affected teacher(s) receive a change notification email identifying which slots changed

**Given** an email notification is sent
**When** the teacher receives it
**Then** the email contains: institution name, term name, a summary of what changed or "your timetable is ready", and a direct deep-link to their personal timetable

**Given** an email delivery fails
**When** the failure is detected
**Then** the failure is logged and surfaced to the Timetabler; the timetable publish is not rolled back

## Tasks / Subtasks

- [ ] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [ ] Implement feature module under `src/features/<area>/` per architecture tree.
- [ ] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [ ] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [ ] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 6 — API focus:** Publish POST `/api/v1/timetables/{id}/publish`; export PDF GET `/api/v1/timetables/{id}/export/pdf`; notifications patterns per UX.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `6-1-timetable-publishing.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 6.2
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
