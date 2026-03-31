# Story 5.2: Slot Pinning

Status: done

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
Build on patterns from `5-1-timetable-grid-view.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 5.2
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Debug Log References

### Completion Notes List

- **API:** `POST /api/v1/lessons/{id}/pin`, `DELETE /api/v1/lessons/{id}/pin` with `usePinLesson` / `useUnpinLesson` in `src/api/hooks/useTimetable.ts`; optimistic cache updates + invalidate on settle for NFR3 responsiveness.
- **MSW:** Mutable `liveLessons` in `timetable-page.mock.ts`; GET lessons returns snapshot; mock-only `POST /api/v1/timetables/:id/regenerate-unpinned` calls `regenerateUnpinnedMockLessons()` so pinned rows stay unchanged while unpinned are mutated (tests prove AC for re-run behaviour in mock layer).
- **UI:** MiniSlot gets 2px blue inset ring (`#4a78d3`) + existing pin icon; SlotCell no longer draws pin outline (ring on MiniSlot per AC). Right-click context menu (`SlotContextMenu`) for Pin/Unpin; Space still toggles pin via `onSlotPin`.
- **GeneratorStatusBar:** Timetable page shows `"{count} unpinned slots will be solved"` using `countUnpinnedSlotsForSolver` (grid rows × columns minus cells where `findLesson` returns a pinned lesson, so year-group filter and pivot stay consistent).
- **Tests:** Vitest coverage for mock regenerate, grid count helper, context menu pin, MiniSlot ring, TimetablePage status strip.

### File List

- `src/api/hooks/useTimetable.ts`
- `src/mocks/pages/timetable-page.mock.ts`
- `src/mocks/handlers/timetable.handlers.ts`
- `src/components/timetable/mini-slot.tsx`
- `src/components/timetable/slot-cell.tsx`
- `src/components/timetable/slot-context-menu.tsx` (new)
- `src/components/timetable/timetable-grid.tsx`
- `src/components/timetable/mini-slot.test.tsx`
- `src/components/timetable/timetable-grid.test.tsx`
- `src/features/timetable/pages/TimetablePage.tsx`
- `src/features/timetable/pages/TimetablePage.test.tsx`
- `src/mocks/pages/timetable-page.mock.test.ts` (new)
- `_bmad-output/implementation-artifacts/5-2-slot-pinning.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

---
## Change Log

- 2026-04-01: Implemented Story 5.2 — slot pinning (API hooks, MSW, MiniSlot ring, context menu, GeneratorStatusBar unpinned count, mock regenerate-unpinned). Targeted Vitest suite passes (timetable + mock tests).
- 2026-04-01: Revise — fixed unpinned-slot count to use pinned cells on the visible grid only; guarded pin/unpin `mutationFn` when `timetableId` is null; added year-group filter unit test.

---
**Story completion status:** done — Code review passed 2026-04-01 (re-review after patch pass)

### Review Findings

- [x] [Review][Patch] `countUnpinnedSlotsForSolver` counts every `isPinned` lesson in the dataset while `totalCells` is scoped to the current view and year-group filter; when the filter hides a pinned lesson (e.g. pinned in Year 7 while viewing Year 8), the bar under-reports unpinned slots — [src/components/timetable/timetable-grid.tsx:100-118] — Fixed: count pinned cells by iterating the same rows/columns as the grid and using `findLesson` per cell; added test for Year 8 filter.

- [x] [Review][Patch] `usePinLesson` / `useUnpinLesson` still call the API when `timetableId` is `null` (`onMutate` bails but `mutationFn` runs) — [src/api/hooks/useTimetable.ts:30-95] — Fixed: `mutationFn` rejects with `timetableId is required` when `!timetableId`.

- [x] [Review][Defer] AC2 “re-run the generator” behaviour is validated only in MSW/mock (`regenerate-unpinned`); production engine wiring and UI trigger remain future work — deferred, pre-existing scope.

- [x] [Review][Defer] NFR3 (pin state reflected within 500ms) is not asserted in tests or telemetry — deferred, mirrors other NFR deferrals.

- [x] [Review][Defer] Pin/unpin mutation failures roll back cache but show no user-visible error — deferred until global error/toast pattern is applied to timetable mutations.

### Re-review (2026-04-01)

- ✅ **Clean review** — Blind Hunter, Edge Case Hunter, and Acceptance Auditor found no new `patch` or `decision-needed` items after triage. Prior `[Review][Patch]` fixes were verified in diff (`countUnpinnedSlotsForSolver` cell iteration; `mutationFn` guard). Deferred items (AC2 production wiring, NFR3 assertion, mutation error UX) remain tracked above and in `deferred-work.md`; not blocking story completion.
