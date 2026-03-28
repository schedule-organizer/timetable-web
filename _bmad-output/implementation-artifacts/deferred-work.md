# Deferred work

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
