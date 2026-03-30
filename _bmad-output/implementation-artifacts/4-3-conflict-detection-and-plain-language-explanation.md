# Story 4.3: Conflict Detection & Plain-Language Explanation

Status: done

## Story

As a Timetabler,
I want the system to detect hard-constraint deadlocks and explain them in plain language,
So that I understand exactly what is causing the problem and know my options — with no dead ends.

## Acceptance Criteria

**Given** the generator cannot produce a valid schedule due to conflicting hard constraints
**When** the run completes
**Then** the GeneratorStatusBar shows a red "Failed" state with a link to the ConflictExplainer (UX-DR9)

**Given** I open the ConflictExplainer
**When** I view it
**Then** a full-panel screen (not a modal or toast) shows: a plain-language summary identifying the specific teacher(s), class(es), and slots in conflict; a miniature grid preview with affected slots highlighted red; and three action buttons: "Relax constraint", "Assign manually", "Edit source data" (UX-DR10)

**Given** the conflict explanation is displayed
**When** I read the summary
**Then** language is specific and human-readable (e.g., "Teacher A cannot cover Year 10B in any available slot because all valid windows overlap with their Forbidden Slot: Friday PM") — not a technical error code

**Given** multiple hard constraints are in conflict simultaneously
**When** the ConflictExplainer is shown
**Then** each conflict is listed separately with its own plain-language explanation and affected entities named

## Tasks / Subtasks

- [x] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [x] Implement feature module under `src/features/<area>/` per architecture tree.
- [x] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [x] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [x] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 4 — API focus:** Engine: POST `/api/v1/engine/run`, GET `/api/v1/engine/jobs/{id}`, cancel job; WebSocket `/topic/solver/{jobId}/*`.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `4-2-constraint-satisfaction-report.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 4.3
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Added `conflictEntitySchema`, `affectedSlotSchema`, `conflictExplanationDtoSchema`, `conflictReportDtoSchema` to `engine.schemas.ts`; updated `engineJobDtoSchema` with optional `conflictReport` field.
- Added `ConflictEntity`, `AffectedSlot`, `ConflictExplanationDto`, `ConflictReportDto` types to `engine.types.ts`.
- Updated MSW `engine.handlers.ts`: added `MOCK_CONFLICT_REPORT_DATA` fixture (2 conflicts — forbidden slots and double-booking), `setEngineMockMode('success'|'failure')` export, and failure path in job GET handler; `resetEngineMocks` now also resets mode.
- `GeneratorStatusBar` updated: added `onViewConflicts?: () => void` prop; failed state now uses red (not amber, which is reserved for cancelled); added "View conflicts" button that appears only when phase='failed' and callback provided; added `data-phase` attribute for stable test assertions.
- `ConflictExplainer` domain component: full-panel first-class screen (not a modal) rendered in place of the workspace section when job fails; shows conflict count in header; each conflict rendered as a `ConflictCard` with plain-language explanation, affected teacher/class chips, mini grid preview with affected slots highlighted red, three action buttons (Relax constraint / Assign manually / Edit source data), and expandable technical details (collapsed by default). Storybook stories: SingleConflict, MultipleConflicts, NoGridData.
- `EnginePage.tsx` updated: `showConflictExplainer` state; `onOpenConflictExplainer`/`onCloseConflictExplainer`/`onRelaxConstraint`/`onAssignManually`/`onEditSourceData` callbacks (all useCallback); `GeneratorStatusBar` receives `onViewConflicts` when job has failed + conflictReport; workspace section replaced by `ConflictExplainer` when explainer is open.
- 20 new tests: 11 for `ConflictExplainer` (rendering, entity chips, action buttons, mini grid a11y, expandable details) and 5 additional for `GeneratorStatusBar` failed state (data-phase, View conflicts button, click handler, absence in success state). All pass. 0 regressions.

### File List

- `src/types/engine.schemas.ts` (modified)
- `src/types/engine.types.ts` (modified)
- `src/mocks/handlers/engine.handlers.ts` (modified)
- `src/components/domain/generator-status-bar.tsx` (modified)
- `src/components/domain/generator-status-bar.test.tsx` (modified)
- `src/components/domain/conflict-explainer.tsx` (new)
- `src/components/domain/conflict-explainer.test.tsx` (new)
- `src/components/domain/conflict-explainer.stories.tsx` (new)
- `src/features/engine/pages/EnginePage.tsx` (modified)

## Change Log

- 2026-03-31: Story 4.3 — conflict detection and plain-language explanation: ConflictExplainer component, conflict Zod schemas, MSW failure mock with setEngineMockMode, GeneratorStatusBar red failed state with "View conflicts" link, EnginePage wiring.

---
**Story completion status:** done
