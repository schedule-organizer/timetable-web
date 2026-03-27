# Story 5.2: Slot Pinning

Status: ready-for-dev

## Story

As a Timetabler,
I want to pin specific slots to lock them from future generator runs,
So that I can preserve the parts of the schedule I'm happy with while continuing to refine the rest.

## Acceptance Criteria

**Given** I click a filled slot and select "Pin" (or press Space with the slot focused)
**When** pinned
**Then** a 2px blue ring appears on the MiniSlot and a pin icon is shown; no confirmation dialog; the change reflects within 500ms (NFR3)

**Given** a slot is pinned and I re-run the generator
**Then** the pinned slot is preserved exactly as-is; only unpinned slots are filled

**Given** I click a pinned slot and select "Unpin" (FR26)
**When** unpinned
**Then** the slot returns to standard filled state with no ring or pin icon; it is included in the next generator run

**Given** I have pinned multiple slots
**When** I view the GeneratorStatusBar
**Then** it shows "X unpinned slots will be solved" so I know the scope of the next re-run (UX-DR9)

## Tasks / Subtasks

- [ ] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [ ] Implement feature module under `src/features/<area>/` per architecture tree.
- [ ] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [ ] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [ ] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 5 — API focus:** Timetable: GET `/api/v1/timetables/{id}/lessons`, PATCH `/api/v1/lessons/{id}`, POST/DELETE pin, swap; WS `/topic/timetable/{timetableId}`.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `5-1-timetable-grid-view.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 5.2
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
