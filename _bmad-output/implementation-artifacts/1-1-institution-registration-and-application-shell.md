# Story 1.1: Institution Registration & Application Shell

Status: ready-for-dev

## Story

As a Timetabler,
I want to register a new institution and create my account,
So that my school has a secure, isolated workspace in SchediFlow ready to configure.

## Acceptance Criteria

**Given** I visit the registration page
**When** I submit a valid institution name, my full name, email, and password
**Then** a new institution tenant is created, my Timetabler account is created, I am logged in, and I land on the institution setup dashboard

**Given** my account is created
**When** my password is stored
**Then** it is stored as a salted hash (bcrypt or Argon2) and my session token expires after 24 hours of inactivity (NFR7, NFR9)

**Given** the same email is used to register a second institution
**When** registration is submitted
**Then** a new independent account is created for the second institution; the two accounts are fully isolated with no shared data

**Given** I access any page in my institution
**Then** all data is scoped to my institution only; no cross-institution data is accessible through any code path (NFR6)

**Given** a new institution is registered
**Then** it is provisioned on a 30-day free trial with full feature access

**And** the application shell is implemented: white topbar (48px), dark sidebar (#1a2740, 160px wide), light grey workspace (#f3f4f6), design tokens applied globally (UX-DR1–3), responsive layout with sidebar collapsing to 48px icon strip at ≤768px and bottom tab bar at <768px, Inter typography throughout, all interactive elements have 2px solid #4a78d3 focus rings (UX-DR4, UX-DR17)

## Tasks / Subtasks

- [ ] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [ ] Implement feature module under `src/features/<area>/` per architecture tree.
- [ ] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [ ] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [ ] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 1 — API focus:** Auth: POST `/api/v1/auth/*`; Settings: GET/PUT `/api/v1/settings`, GET `/api/v1/settings/labels`; Users: `/api/v1/users` — see architecture §3.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
First story in the backlog (Epic 1.1) — no predecessor.

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 1.1
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

_(filled by dev agent)_

### Debug Log References

### Completion Notes List

### File List

---
**Story completion status:** ready-for-dev — Batch story context generated from epics.md
