# Page Mock Data

This folder contains page-specific mock data for story implementation.

Rules:
- Reuse existing page mocks before creating new fixtures.
- Keep mock shapes aligned with the contract used in `src/types/` and `src/api/hooks/`.
- Prefer page-level mock objects here, and shared fixture data in `src/mocks/fixtures/`.
- When backend integration starts, replace the mock source behind the same page contract instead of changing page components.

Examples:
- `auth-page.mock.ts`
- `timetable-page.mock.ts`
- `reporting-page.mock.ts`
