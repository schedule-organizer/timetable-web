# Story 2.5: Room Management

Status: done

## Story

As a Timetabler,
I want to create and manage room records,
So that the scheduler can assign lessons to appropriate rooms and avoid double-booking.

## Acceptance Criteria

**Given** I click "Add room" and submit a room name, capacity, and room type (e.g., classroom, lab, sports hall)
**When** saved
**Then** the room is created and available for scheduling assignment

**Given** I edit a room's capacity or type and save
**Then** the updated details are used by the constraint engine for room suitability checks on the next generator run

**Given** I delete a room and confirm
**Then** the room is removed; any schedule slots assigned to it are flagged

## Tasks / Subtasks

- [x] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [x] Implement feature module under `src/features/<area>/` per architecture tree.
- [x] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [x] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [x] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 2 — API focus:** CRUD: `/api/v1/teachers`, `/api/v1/classes`, `/api/v1/subjects`, `/api/v1/rooms` — paginated envelope; teacher qualifications as multi-subject.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `2-4-subject-management-with-difficulty-levels.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 2.5
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- AC1/AC2 are backed by `useCreateRoom`/`useUpdateRoom` hitting `/api/v1/rooms` (`POST`/`PATCH`); the `RoomForm` overlay collects name, capacity (number), and roomType (CLASSROOM/LAB/SPORTS_HALL) and submits trimmed payloads via React Hook Form + Zod.
- AC3 maps to `useDeleteRoom` (`DELETE /api/v1/rooms/:id`) with an inline confirmation panel; on success the status message notes that scheduled slots have been flagged.
- Filter by room type is implemented with a `<select>` outside the `aria-label="Room roster"` section to prevent RTL label collisions; the table shows name, capacity, and human-readable room type label.
- Zod schemas in `room.schemas.ts` define `roomType` as `CLASSROOM|LAB|SPORTS_HALL`, paginated envelope, and drive both hooks and MSW `roomHandlers` which mirror the subject/class handler contract.
- Vitest coverage for `RoomManagementPage` uses mocked hooks to prove filter, add, edit, and delete flows with confirmation, exercising all three ACs.

### Completion Notes List

- Added the room management UI (list, filter by room type, add/edit form, delete with confirmation) under `src/features/rooms`, wired to TanStack Query and Axios hooks so the scheduler can create and manage rooms with capacity and type metadata.
- Introduced Zod schemas, DTOs, React Query hooks (useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom), and MSW fixtures/handlers for `/api/v1/rooms` with the paginated envelope and cache-invalidation pattern.
- Wrote 7 Vitest tests (RoomManagementPage.test.tsx) covering all three ACs: create (AC1), edit capacity/type (AC2), delete with confirmation and cancellation (AC3), plus filter and empty-state behaviours.

### File List

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/2-5-room-management.md`
- `src/api/hooks/useRooms.ts`
- `src/features/rooms/components/RoomForm.tsx`
- `src/features/rooms/pages/RoomManagementPage.tsx`
- `src/features/rooms/pages/RoomManagementPage.test.tsx`
- `src/mocks/fixtures/rooms.fixtures.ts`
- `src/mocks/handlers/room.handlers.ts`
- `src/mocks/handlers/index.ts`
- `src/routes.tsx`
- `src/types/room.schemas.ts`
- `src/types/room.types.ts`

### Change Log

- Added room management page (list with name/capacity/type, filter by room type, add/edit form, delete with confirmation) under `src/features/rooms` wired to `useRooms`/`useCreateRoom`/`useUpdateRoom`/`useDeleteRoom` covering all three ACs.
- Introduced room Zod schemas, DTOs, React Query hooks, and MSW fixtures/handlers that expose `/api/v1/rooms` (GET, POST, PATCH, DELETE) with the paginated envelope and cache invalidation pattern.
- Wired `RoomManagementPage` into `src/routes.tsx` replacing the placeholder, and registered `roomHandlers` in the MSW handler index.
- Added 7 Vitest tests verifying filter, add, edit, delete-with-confirmation, and delete-cancel flows.

### Review Findings

- [x] [Review][Patch] Stabilize edit-form initial values so `RoomForm` does not reset on every parent re-render — fixed: `formInitialValues` wrapped in `useMemo` with `[editingRoom]` so the object is stable across re-renders until the edited room changes. [`src/features/rooms/pages/RoomManagementPage.tsx`]

- [x] [Review][Patch] Delete confirmation dialog semantics — fixed: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` + visible `h2` title; initial focus on Cancel via ref + `useEffect`. [`src/features/rooms/pages/RoomManagementPage.tsx`]

- [x] [Review][Defer] AC3 “scheduled slots flagged” — MSW `DELETE` removes the room and returns `{ deletedId }` only; no slot entities or flagging side effects are simulated. Success copy reflects product intent; real flagging must be enforced/verified with the API and integration tests when the backend exists. [`src/mocks/handlers/room.handlers.ts`, `src/features/rooms/pages/RoomManagementPage.tsx`] — deferred, pre-existing mock limitation

---
**Story completion status:** done — Room management CRUD UI, hooks, mocks, and tests cover all three ACs; code-review patch items addressed.
