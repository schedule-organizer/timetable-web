# Story 5.3: Manual Slot Assignment

Status: done

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

- [x] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [x] Implement feature module under `src/features/<area>/` per architecture tree.
- [x] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [x] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [x] Tests: unit/component for core logic; a11y queries by role/label.

### Review Findings

- [x] [Review][Patch] Context menu mount uses `onPinSlot && onUnpinSlot` but `menuEnabled` is true when only `onSlotMenu` is set — a consumer with assign/clear/detail only never mounts `SlotContextMenu` even after Shift+F10 or right-click opens state. Align the render guard with `menuEnabled` and supply no-op pin handlers when pin APIs are absent. [`timetable-grid.tsx` ~573]

- [x] [Review][Patch] `handleDragEnd` can call `onLessonMove` when `rows.findIndex` / `columns.findIndex` yields `-1` (e.g. lesson present in `lessons` but filtered out of visible rows), producing an inconsistent move. Return early when source row or column index is invalid. [`timetable-grid.tsx` ~383–396]

- [x] [Review][Defer] Optimistic `useUpdateLesson` applies `{ ...l, ...patch } as LessonDto` — denormalized display fields can be wrong until `invalidateQueries` refetches; same class of risk as other optimistic merges. [`useTimetable.ts`] — deferred, pre-existing pattern

- [x] [Review][Defer] `moveLessonInMock` swaps with an occupied target without checking whether the target lesson is pinned — may diverge from future backend rules. [`timetable-page.mock.ts` `moveLessonInMock`] — deferred, contract TBD

- [x] [Review][Defer] NFR3 (500ms) is not asserted in tests or telemetry — deferred, align when NFRs are enforced app-wide

- [x] [Review][Defer] Drag-and-drop move has no keyboard-only equivalent — deferred, broader a11y pass

#### Re-review (2026-04-01)

- [x] [Review][Patch] When only `onSlotMenu` is passed (no `onPinSlot` / `onUnpinSlot`), Pin/Unpin stay enabled for filled slots but `onPinSlot?.` / `onUnpinSlot?.` no-op — menu still closes, so the user may believe pin toggled. Disable Pin/Unpin (or hide) when pin handlers are absent. [`timetable-grid.tsx` → `SlotContextMenu`]

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

Composer (dev-story workflow)

### Debug Log References

### Completion Notes List

- **API:** `PATCH /api/v1/lessons/{id}`, `DELETE /api/v1/lessons/{id}`, `POST /api/v1/timetables/{id}/lessons`, `POST /api/v1/lessons/{id}/move` with `useUpdateLesson`, `useDeleteLesson`, `useCreateLesson`, `useMoveLesson` in `src/api/hooks/useTimetable.ts`; optimistic cache updates for PATCH/DELETE where applicable; invalidate on settle.
- **MSW:** Mutable `liveLessons` extended with `patchLessonInMock`, `deleteLessonFromMock`, `createLessonInMock`, `moveLessonInMock` (swap when target occupied); 422 on pinned move for toast messaging.
- **UI:** `SlotContextMenu` — Assign lesson, Pin/Unpin, Clear, View detail; `Shift+F10` opens menu at cell; Enter opens `SlotEditSheet` (filled or empty); 360px right sheet with class/subject/teacher/room selects and “Back to grid”; `DraggableMiniSlot` + droppable cells via `@dnd-kit/core`; pinned lessons not draggable; toast on pinned move API error.
- **Tests:** Timetable grid/page tests updated; mock test for `moveLessonInMock` pinned rejection.
- **Revise (post-review):** `SlotContextMenu` mounts whenever `menuEnabled` (not only when pin handlers exist); `onPinSlot` / `onUnpinSlot` optional-chained. `menuEnabled` hoisted for `Shift+F10` guard. `handleDragEnd` returns early if source row/col index is `-1`. Test: context menu with `onSlotMenu` only.

### File List

- `src/types/timetable.schemas.ts`
- `src/types/timetable.types.ts`
- `src/api/hooks/useTimetable.ts`
- `src/mocks/pages/timetable-page.mock.ts`
- `src/mocks/handlers/timetable.handlers.ts`
- `src/mocks/pages/timetable-page.mock.test.ts`
- `src/components/timetable/slot-context-menu.tsx`
- `src/components/timetable/slot-cell.tsx`
- `src/components/timetable/draggable-mini-slot.tsx`
- `src/components/timetable/timetable-grid.tsx`
- `src/components/timetable/timetable-grid.test.tsx`
- `src/components/timetable/timetable-grid.stories.tsx`
- `src/features/timetable/components/slot-edit-sheet.tsx`
- `src/features/timetable/pages/TimetablePage.tsx`
- `src/features/timetable/pages/TimetablePage.test.tsx`
- `src/App.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-04-01: Implemented manual slot assignment (context menu, sheet, drag-move, MSW + hooks).
- 2026-04-01: Revise — code review patches (context menu guard + drag source bounds).
- 2026-04-01: Revise — `SlotContextMenu` `pinActionsAvailable`; Pin/Unpin disabled when parent omits pin handlers.

---
**Story completion status:** done — Code review complete
