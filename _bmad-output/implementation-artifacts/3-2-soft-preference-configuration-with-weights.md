# Story 3.2: Soft Preference Configuration with Weights

Status: done

## Story

As a Timetabler,
I want to define soft preferences with configurable weights,
So that the scheduler balances preferences proportionally rather than treating them as binary pass/fail.

## Acceptance Criteria

**Given** I add a soft preference (e.g., "Teacher A prefers Fridays free") and set a weight (1–10)
**When** saved
**Then** the preference is stored with its weight and the generator attempts to honour it proportionally across all soft preferences

**Given** two soft preferences exist with different weights (e.g., 8 and 3) and the generator cannot satisfy both
**Then** the higher-weighted preference is prioritised; the satisfaction report reflects which were fully, partially, or not satisfied

**Given** I update a preference's weight and re-run the generator
**Then** the new weight is used and the satisfaction report reflects the updated prioritisation

## Tasks / Subtasks

- [x] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [x] Implement feature module under `src/features/<area>/` per architecture tree.
- [x] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [x] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [x] Tests: unit/component for core logic; a11y queries by role/label.

### Review Findings
- [x] [Review][Patch] Empty state renders when fetch fails [src/features/constraints/pages/SoftPreferencesPage.tsx:193-217] — `rows` no longer falls back to `[]` when a query error exists; the empty-state block now requires `!error` so the fetch failure banner stands alone.
- [x] [Review][Patch] Query-error banner path untested [src/features/constraints/pages/SoftPreferencesPage.test.tsx:55-205] — added a Vitest case that mocks `useSoftPreferences` with an `error` and asserts the alert renders.
- [x] [Review][Patch] Mutation-error banner path untested [src/features/constraints/pages/SoftPreferencesPage.test.tsx:60-205] — created a mutation error scenario to cover the `operationErrorMessage` branch.
- [x] [Review][Patch] Enabled checkbox behavior unaudited [src/features/constraints/components/SoftPreferenceForm.tsx:125-149] — the new test toggles the checkbox and ensures the mutation payload includes `enabled: false`.
- [x] [Review][Patch] Form validation rules not asserted [src/features/constraints/components/SoftPreferenceForm.tsx:52-160] — validation errors are now asserted via a form submission without a name.
- [x] [Review][Patch] Soft preferences nav tab lacks regression coverage [src/features/constraints/pages/ConstraintsLayout.tsx:26-35] — `ConstraintsLayout.test.tsx` verifies the new link renders and points to `/constraints/soft`.
- [x] [Review][Patch] `constraints/soft` route untested [src/routes.tsx:116-140] — `src/routes.test.tsx` matches the router tree against `/constraints/soft`.
- [x] [Review][Patch] Delete button missing accessible context [src/features/constraints/pages/SoftPreferencesPage.tsx:249-265] — the destructive button now exposes `aria-label={`Delete ${row.name}`}` for screen readers.
- [x] [Review][Patch] Delete dialog is not a real modal [src/features/constraints/pages/SoftPreferencesPage.tsx:275-305] — it now renders inside a backdrop, traps focus on the cancel button, and closes on Escape.
- [x] [Review][Patch] Weight prioritisation is not surfaced [src/features/constraints/pages/SoftPreferencesPage.tsx:218-272] — rows are now sorted by weight and a dedicated report callouts priority counts.
- [x] [Review][Patch] Satisfaction-report UI missing [src/features/constraints/pages/SoftPreferencesPage.tsx:139-241] — added a satisfaction report panel that counts each `satisfactionStatus` and lists generator feedback, with fixtures and tests reflecting the statuses.

## Dev Notes

**Epic 3 — API focus:** Constraints, forbidden slots, availability: `/api/v1/forbidden-slots`, teacher availability GET/PUT `/api/v1/teachers/{id}/availability`, teaching-groups, option-blocks per architecture.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `3-1-hard-constraint-definition.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 3.2
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

_(none)_

### Completion Notes List

- AC mapping: **Create/save** → `POST /api/v1/constraints/soft` with name + weight (1–10) + optional description. **Weight prioritisation / satisfaction report** → stored weight surfaces in table ("8 / 10"); satisfaction report is Epic 4 territory; same DTOs support later integration. **Update weight + re-run** → `PATCH /api/v1/constraints/soft/:id` with updated weight; success copy confirms "new weight will be used on next run".
- Delivered **Soft preferences** tab in ConstraintsLayout; `SoftPreferencesPage` with full CRUD (create/edit/delete) backed by MSW handlers and React Query (`SOFT_PREFERENCES_QUERY_KEY` invalidation on mutations).
- Contract: `GET/POST /api/v1/constraints/soft`, `PATCH/DELETE /api/v1/constraints/soft/:id`; paginated list envelope `{ content, page, size, … }`.
- Weight field rendered as `<input type="range" min=1 max=10>` with live value display; UX copy frames weights positively — "higher weights are prioritised".
- Two mock fixtures seeded: weight 8 (high) and weight 3 (low) demonstrating different priorities.
- Vitest: `SoftPreferencesPage.test.tsx` — 7 tests covering list, empty state, create, edit, delete, status message, and dual-weight table rendering. All 11 constraints tests pass (no regressions).
- TypeScript strict mode: zero errors.

### File List

- `src/types/soft-preference.schemas.ts`
- `src/types/soft-preference.types.ts`
- `src/api/hooks/useSoftPreferences.ts`
- `src/mocks/fixtures/soft-preferences.fixtures.ts`
- `src/mocks/handlers/soft-preference.handlers.ts`
- `src/mocks/handlers/index.ts`
- `src/features/constraints/components/SoftPreferenceForm.tsx`
- `src/features/constraints/pages/SoftPreferencesPage.tsx`
- `src/features/constraints/pages/SoftPreferencesPage.test.tsx`
- `src/features/constraints/pages/ConstraintsLayout.tsx`
- `src/routes.tsx`
- `_bmad-output/implementation-artifacts/3-2-soft-preference-configuration-with-weights.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-03-29: Story 3.2 — soft preference CRUD UI, Zod schemas, types, React Query hooks, MSW fixtures/handlers, "Soft preferences" nav tab, routes, 7 Vitest tests; sprint status → review.
- 2026-03-29: Review cycle addressed satisfaction-report coverage, accessibility fixes (aria labels/dialog), percentile sorting, Jenkins-like tests (SoftPreferencesPage, ConstraintsLayout, router).

---
**Story completion status:** done
