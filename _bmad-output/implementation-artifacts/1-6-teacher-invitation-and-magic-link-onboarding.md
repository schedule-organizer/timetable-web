# Story 1.6: Teacher Invitation & Magic-Link Onboarding

Status: ready-for-dev

## Story

As a Timetabler,
I want to invite teachers via email so they can onboard without creating a password,
So that teacher registration is frictionless and takes under 5 minutes.

## Acceptance Criteria

**Given** I enter one or more teacher email addresses in the invite flow and submit
**When** invites are sent
**Then** each teacher receives an email with a unique single-use magic link; they appear in the teacher list with "Invited" status

**Given** a teacher clicks their magic link within 24 hours
**When** they land on the onboarding page
**Then** they see the institution name, a name confirmation step, and an optional photo upload — no password required (FR33, NFR7)

**Given** a teacher completes magic-link onboarding and submits
**When** their account is activated
**Then** their status changes to "Active" in the teacher list

**Given** a magic link is used a second time or accessed after 24 hours
**When** opened
**Then** it is rejected with a clear message ("This link has expired or has already been used") and a prompt to request a new invite (NFR7)

**Given** a Timetabler resends an invite to a teacher
**When** the new invite is sent
**Then** a new single-use magic link is generated and the previous link is invalidated

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
Build on patterns from `1-5-pre-built-institution-templates-and-onboarding-wizard.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 1.6
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
