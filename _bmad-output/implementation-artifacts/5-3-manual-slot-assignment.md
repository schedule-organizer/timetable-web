# Story 5.3: Manual Slot Assignment

Status: ready-for-dev

## Story

As a Timetabler,
I want to manually assign a lesson to a specific slot,
So that I can override the generator's choices and place lessons exactly where I need them.

## Acceptance Criteria

**Given** I right-click (or press Shift+F10 on) a slot cell
**When** the context menu opens
**Then** I see options: "Assign lesson", "Pin", "Clear", "View detail" (UX-DR16)

**Given** I select "Assign lesson" and choose a teacher, class, subject, and room
**When** I confirm
**Then** the lesson is placed in the slot; the MiniSlot renders immediately; the operation completes within 500ms (NFR3)

**Given** I drag a MiniSlot from one cell to another and drop it
**Then** the lesson moves to the target slot; if the source slot is pinned the move is blocked with a clear message

**Given** I press Enter on a focused slot
**When** the edit Sheet opens
**Then** it slides in from the right (360px) with fields for teacher, class, subject, and room; "Back to grid" is always visible (UX-DR13)

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
Build on patterns from `5-2-slot-pinning.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 5.3
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
