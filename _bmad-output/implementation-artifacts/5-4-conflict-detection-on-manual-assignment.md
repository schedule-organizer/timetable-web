# Story 5.4: Conflict Detection on Manual Assignment

Status: done

## Story

As a Timetabler,
I want the system to detect conflicts when I manually assign a lesson and suggest valid alternatives,
So that I can resolve scheduling problems without guessing.

## Acceptance Criteria

**Given** I manually assign a lesson to a slot that creates a conflict (e.g., teacher double-booked, room already in use)
**When** the assignment is submitted
**Then** a conflict popover appears showing the specific conflict reason and 2–3 alternative valid slots (FR24)

**Given** alternative slots are suggested and I click one
**Then** the lesson moves to that slot; the conflict is resolved; the original slot is cleared

**Given** I dismiss the conflict suggestion and keep the conflicting assignment
**When** saved
**Then** the SlotCell renders in conflict state (red top border + conflict icon) and is flagged in the ConflictExplainer if the generator re-runs

**Given** a manual assignment creates no conflict
**When** confirmed
**Then** no conflict UI is shown; the slot renders in standard filled state

## Tasks / Subtasks

- [x] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [x] Implement feature module under `src/features/<area>/` per architecture tree.
- [x] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [x] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [x] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 5 — API focus:** Timetable: GET `/api/v1/timetables/{id}/lessons`, PATCH `/api/v1/lessons/{id}`, POST/DELETE pin, swap; WS `/topic/timetable/{timetableId}`.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `5-3-manual-slot-assignment.md` (previous story in sequence).

### AC3 / ConflictExplainer (deferred)
AC3’s “flagged in the ConflictExplainer **if the generator re-runs**” is **out of scope for this story**: `LessonDto.hasConflict` is persisted and `SlotCell` shows conflict state; wiring manual placements into `EnginePage` / `ConflictExplainer` requires engine job output and a regeneration story (e.g. partial re-gen / epic alignment).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 5.4
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Debug Log References

### Completion Notes List

- **API contract:** `409` with `code: SCHEDULING_CONFLICT` and `details` (reason, optional `conflictingLessonId`, `alternatives`). Optional `acceptConflict: true` on PATCH/POST create body to persist a flagged placement (`hasConflict: true` on `LessonDto`).
- **MSW:** `patchLessonInMock` / `createLessonInMock` detect class / teacher / room clashes; suggest up to three alternative slots (strict scan, relaxed class-free fallback, then synthetic last resort). Handlers parse `lessonPatchApiBodySchema` and `createLessonApiBodySchema`.
- **UI:** `AssignmentConflictPopover` (modal portal) on save conflict; alternatives apply `cycleDayIndex` + `periodId`; “Keep conflicting placement” sends `acceptConflict`. `SlotCell` uses `AlertTriangle` + `sr-only` “Conflict” + `title` for non-colour-only indication.
- **Hooks:** `useUpdateLesson` / `useCreateLesson` accept optional `acceptConflict`.
- **Tests:** Mock conflict + acceptConflict; `parseSchedulingConflictDetails`; grid test updated for new conflict affordance.
- **Revise (post–code review):** `AssignmentConflictPopover` — Escape dismiss, `aria-describedby`, initial focus on Cancel (`useLayoutEffect`); `TimetablePage` — `toastAfterConflictParseFailure` for unreadable 409 bodies, `toastApiErrorMessageOrFallback` for keep-conflicting failures; component tests in `assignment-conflict-popover.test.tsx`.

### File List

- `src/types/timetable.schemas.ts`
- `src/types/timetable.types.ts`
- `src/lib/timetable-conflict.ts`
- `src/lib/timetable-conflict.test.ts`
- `src/api/hooks/useTimetable.ts`
- `src/mocks/pages/timetable-page.mock.ts`
- `src/mocks/handlers/timetable.handlers.ts`
- `src/mocks/pages/timetable-page.mock.test.ts`
- `src/features/timetable/components/assignment-conflict-popover.tsx`
- `src/features/timetable/components/slot-edit-sheet.tsx`
- `src/features/timetable/pages/TimetablePage.tsx`
- `src/features/timetable/pages/TimetablePage.test.tsx`
- `src/components/timetable/slot-cell.tsx`
- `src/components/timetable/timetable-grid.test.tsx`
- `src/features/timetable/components/assignment-conflict-popover.test.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-04-01: Story 5.4 — conflict detection on manual assignment (409 + popover, alternatives, acceptConflict, mock + hooks + tests).
- 2026-04-01: Revise — review follow-ups: Escape + `aria-describedby` + initial focus; clearer 409/keep-conflict toasts; AC3 ConflictExplainer clause documented as deferred (see Dev Notes).

### Review Findings

- [x] [Review][Decision] ConflictExplainer vs AC3 — **Resolved:** deferred to engine/regeneration integration; documented under Dev Notes (“AC3 / ConflictExplainer”).

- [x] [Review][Patch] Escape dismisses `AssignmentConflictPopover` — **Done** (`document` keydown `Escape`).

- [x] [Review][Patch] `aria-describedby` + initial focus — **Done** (`assignment-conflict-description`, Cancel ref + `useLayoutEffect`).

- [x] [Review][Patch] `handleKeepConflicting` surfaces API message when present — **Done** (`toastApiErrorMessageOrFallback`).

- [x] [Review][Patch] Unreadable 409 body — **Done** (`toastAfterConflictParseFailure`).

- [x] [Review][Defer] Drag `moveLesson` vs popover — unchanged deferral.

- [x] [Review][Defer] ConflictExplainer on re-run — unchanged deferral (see Dev Notes).

- [x] [Review][Patch] Trap tab focus inside the conflict dialog (or mark the rest of the page `inert`) so keyboard users cannot tab into the timetable behind the overlay — **Done** (`#root.inert` while popover open; test in `assignment-conflict-popover.test.tsx`).

---
**Story completion status:** done — Conflict UI complete; focus trap (`#root.inert`) applied; sprint synced.
