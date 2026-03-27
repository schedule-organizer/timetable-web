# Story 6.3: Teacher Personal Timetable View

Status: ready-for-dev

## Story

As a Teacher,
I want to view my personal timetable showing all my assigned lessons,
So that I know exactly what I'm teaching, when, and where.

## Acceptance Criteria

**Given** I am logged in as a Teacher and navigate to My Timetable
**When** I view it
**Then** I see all my assigned lessons for the active term: subject, class, room, and period per slot; free periods are clearly indicated

**Given** I am on a mobile device (<768px)
**When** I view my timetable
**Then** the layout renders as a card-list view with day tabs for navigation; each card shows subject, class, room, and time (UX-DR14)

**Given** I click the deep-link from my notification email
**When** I land on my personal timetable
**Then** the correct term's timetable is shown directly without requiring further navigation (UX-DR15)

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
Build on patterns from `6-2-email-notifications-on-publish-and-changes.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 6.3
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
