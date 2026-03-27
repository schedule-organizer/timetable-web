# Story 1.7: Role Management, RBAC & Subscription Tier Limits

Status: ready-for-dev

## Story

As a Timetabler,
I want to assign roles to users and have the system automatically enforce access permissions and subscription limits,
So that every user can only do what they're permitted and the institution stays within its plan.

## Acceptance Criteria

**Given** I assign one or more roles (Timetabler, Teacher, Moderator, Principal) to a user
**When** roles are saved
**Then** the user may hold multiple roles simultaneously; changes take effect on their next authenticated request (FR34)

**Given** a user attempts an action not permitted by their role(s)
**When** the request reaches the server
**Then** it is denied with an appropriate error; the UI does not render controls for unpermitted actions (NFR8, FR36)

**Given** my institution is on the Starter tier (limit: 20 classes, 30 teachers, 2 terms)
**When** I attempt to exceed any limit
**Then** the creation is blocked server-side with a message identifying the limit and an upgrade prompt (FR38)

**Given** my institution is on the Professional tier (100 classes, 200 teachers, unlimited terms)
**When** I operate within those limits
**Then** all operations succeed without restriction

**Given** any request attempts to access another institution's data
**When** the server processes it
**Then** a 403 is returned; no cross-tenant data is included in the response (FR37, NFR6)

---

## Epic 2: People & Resource Management

A Timetabler can build out the full school data model — add teachers manually or via CSV bulk import, create class groups, configure subjects with difficulty levels, and manage rooms. Teachers can maintain their own profiles and qualifications.

**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR11

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
Build on patterns from `1-6-teacher-invitation-and-magic-link-onboarding.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 1.7
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
