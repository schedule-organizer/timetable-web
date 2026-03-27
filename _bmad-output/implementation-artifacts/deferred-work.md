# Deferred work

## Deferred from: code review of 1-1-institution-registration-and-application-shell.md (2026-03-28)

- [x] [Review][Defer] MSW dev bypass — `worker.start({ onUnhandledRequest: 'bypass' })` in `src/main.tsx` can send unmatched paths to the real network when `VITE_API_BASE_URL` points at a backend; stricter `warn`/`error` or path-scoped handlers reduce surprise during integration. — deferred, pre-existing

- [x] [Review][Defer] Password hashing, 24h session inactivity (NFR7/NFR9) — enforced on backend; frontend cannot satisfy alone; track in backend repo / integration tests. — deferred, pre-existing

- [x] [Review][Defer] Same email registering a second institution (AC) — isolation and duplicate-policy are backend concerns; MSW always mints a new user. Confirm with API contract tests when backend exists. — deferred, pre-existing
