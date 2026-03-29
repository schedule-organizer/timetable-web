# Deferred work

## Deferred from: code review of 2-6-teacher-self-profile-management.md (2026-03-29)

- No TEACHER-only route wrapper for `/profile`: consistent with auth-only `ProtectedRoute` across the app; API enforces `/me` permissions.

- AC3 test could assert the forbidden message string from `getApiErrorMessage`; low priority polish.

## Deferred from: code review of 2-5-room-management.md (2026-03-29)

- AC3 “scheduled slots flagged”: MSW does not model slot entities or flagging; success copy matches product intent — verify with real API and integration tests when scheduling data exists.

## Deferred from: code review of 2-2-bulk-teacher-import-via-csv.md (2026-03-29) follow-up

- CSV files saved in a legacy encoding (not UTF-8) may mis-parse; document “UTF-8 only” in UI or add detection when product requires it.

- Import preview `<table>` could use a `<caption>` for screen readers; optional a11y polish.

## Deferred from: code review of 2-1-teacher-management-manual-entry.md (2026-03-29)

- No dedicated Vitest case for `GET /api/v1/teachers` failure on the manual roster (error banner path); add when stabilizing error UX or E2E.

## Deferred from: code review of 1-7-role-management-rbac-and-subscription-tier-limits.md (2026-03-28)

- Cross-tenant isolation and 403 responses (FR37): frontend mocks and client checks are supplementary; full enforcement belongs to the API — confirm with contract/integration tests when the real backend is wired.

## Deferred from: code review of 1-6-teacher-invitation-and-magic-link-onboarding.md (2026-03-28)

- AC1: Per-teacher email delivery and message content are backend/email-system concerns; the web app posts invitations and shows success. Confirm end-to-end when the real API and mailer exist.

- MSW `POST /api/v1/auth/magic-link/complete` could use `magicLinkCompleteRequestSchema` for parity with production validation and with `POST /api/v1/invitations`; low priority for local mocks.

## Deferred from: code review of 1-4-cycle-and-academic-term-configuration.md (2026-03-28)

- Schedule generator acceptance criterion (use active term date range + cycle when generator runs) — UI wiring belongs to Epic 4; pure helpers are in place per story notes.

## Deferred from: code review of 1-3-bell-schedule-definition.md (2026-03-28)

- D1: BellPeriod.id typed as plain string with no uniqueness enforcement — duplicate IDs from a buggy server would cause silent wrong-index moves in onDragEnd; acceptable given current API contract. Track when API contract is formalised.
- D2: Node 20 engines constraint has no CI enforcement — .nvmrc/.node-version present but CI image not configured; follow up when CI pipeline is set up.
- D3: No duplicate period detection (same name + same times) — out of spec for story 1.3; consider as future enhancement in the bell schedule refinement story.
- D4: Network save failure does not roll back form to last-persisted state — complex optimistic-update/undo mechanism; out of scope for this story.
- D5: addPeriod defaults (12:00–13:00) may immediately conflict with an existing midday period — minor UX friction; user is informed at Save; revisit if UX research flags it.

## Deferred from: code review of 1-2-institution-terminology-configuration.md (2026-03-28)

- AC2 multi-user / cross-tab terminology sync depends on backend or client polling beyond single-tab Zustand + React Query; track when real API and collaboration requirements land.

- Vitest/Vite require a modern Node (≥18); enforce via `engines` / CI image / `.nvmrc` so contributors do not hit `crypto.getRandomValues` startup errors.

## Deferred from: code review of 1-1-institution-registration-and-application-shell.md (2026-03-28)

- [x] [Review][Defer] MSW dev bypass — `worker.start({ onUnhandledRequest: 'bypass' })` in `src/main.tsx` can send unmatched paths to the real network when `VITE_API_BASE_URL` points at a backend; stricter `warn`/`error` or path-scoped handlers reduce surprise during integration. — deferred, pre-existing

- [x] [Review][Defer] Password hashing, 24h session inactivity (NFR7/NFR9) — enforced on backend; frontend cannot satisfy alone; track in backend repo / integration tests. — deferred, pre-existing

- [x] [Review][Defer] Same email registering a second institution (AC) — isolation and duplicate-policy are backend concerns; MSW always mints a new user. Confirm with API contract tests when backend exists. — deferred, pre-existing
