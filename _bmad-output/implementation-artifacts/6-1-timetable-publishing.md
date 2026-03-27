# Story 6.1: Timetable Publishing

Status: ready-for-dev

## Story

As a Timetabler,
I want to publish the timetable so it becomes visible to all authorised users,
So that the finished schedule is officially released and the school can act on it.

## Acceptance Criteria

**Given** I have a completed draft timetable and click "Publish"
**When** I confirm the AlertDialog ("Publish this timetable? Teachers will be notified.")
**Then** the timetable is marked as published, becomes visible to all authorised roles, and a success toast appears ("Timetable published — teachers notified") (UX-DR20)

**Given** the timetable is published and I make subsequent changes
**When** changes are saved
**Then** the timetable remains in published state; affected teachers receive a change notification email (FR28)

**Given** I attempt to publish with unresolved conflicts or empty required slots
**When** I click Publish
**Then** a warning identifies the issue; I can choose to proceed or resolve first

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
Build on patterns from `5-5-partial-re-generation-on-unpinned-slots.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 6.1
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
