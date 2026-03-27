---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-01-requirements-confirmed
  - step-02-design-epics
  - step-03-all-stories-complete
  - step-04-final-validation-complete
scopingDecisions:
  - "FR35 (student account creation) and FR31 (student personal timetable view) deferred out of scope — students not required for core timetable creation workflow"
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# SchediFlow - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for SchediFlow, decomposing the requirements from the PRD and UX Design Specification into implementable stories.

## Requirements Inventory

### Functional Requirements

**Institution Setup & Configuration**
- FR1: A Timetabler can configure institution-wide terminology — renaming domain concepts to match how the institution refers to them (e.g. "Period" → "Lesson", "Class" → "Form Group")
- FR2: A Timetabler can define the Bell Schedule — the set of named periods per day and their time slots
- FR3: A Timetabler can define the Cycle — the repeating pattern of school days (e.g. 5-day week, 10-day fortnight, block schedule)
- FR4: A Timetabler can create and manage academic Terms with defined start and end dates
- FR5: A Timetabler can initialise institution configuration from a pre-built Template that pre-populates Bell Schedule, Cycle, and common settings for their institution type

**People & Resource Management**
- FR6: A Timetabler can create and manage teacher records including name, contact details, and subject qualifications
- FR7: A Timetabler can import teacher records in bulk via CSV upload
- FR8: A Timetabler can create and manage class records (student groups to be scheduled)
- FR9: A Timetabler can create and manage subjects, including assigning a difficulty level to each subject
- FR10: A Timetabler can create and manage room records including capacity and room type
- FR11: A Teacher can manage their own profile including name, contact details, and subject qualifications

**Constraint & Preference Management**
- FR12: A Timetabler can define hard constraints — rules the scheduler must not violate (e.g. a teacher cannot be double-booked)
- FR13: A Timetabler can define soft preferences with configurable weights — rules the scheduler will try to satisfy proportionally to their assigned weight
- FR14: A Timetabler can define subject-level scheduling rules such as maximum occurrences of high-difficulty subjects per day per class
- FR15: A Teacher can declare their availability — marking specific slots as unavailable (Forbidden Slots) or preferred
- FR16: A Timetabler can view all teacher availability declarations and override individual entries

**Schedule Generation**
- FR17: A Timetabler can run the schedule generator to produce a complete draft timetable for a term
- FR18: The system produces a constraint satisfaction report alongside each generated schedule, showing the percentage of soft preferences satisfied and any unmet hard constraints
- FR19: The system detects constraint conflicts that prevent generation and presents a plain-language explanation identifying the conflicting teachers, classes, and slots
- FR20: A Timetabler can adjust constraint sensitivity — downgrading specific hard constraints to soft preferences at runtime without modifying the original constraint definition

**Iterative Schedule Workspace**
- FR21: A Timetabler can view the generated schedule in a grid layout showing teachers, classes, subjects, rooms, and time slots
- FR22: A Timetabler can pin specific slots to lock them from modification in subsequent generator runs
- FR23: A Timetabler can manually assign a lesson to a specific slot for a specific teacher, class, or room
- FR24: The system detects conflicts created by manual slot assignments and suggests alternative valid slots
- FR25: A Timetabler can re-run the generator on unpinned slots only, preserving all pinned and manually assigned slots
- FR26: A Timetabler can unpin a slot and return it to unassigned state for inclusion in the next generator run

**Timetable Publishing & Distribution**
- FR27: A Timetabler can publish a timetable, making it visible to Teachers, Students, and all authorised roles
- FR28: The system notifies Teachers and Students via email when a timetable is published or when changes affecting them are made to a published timetable
- FR29: A Teacher can view their personal timetable showing all assigned lessons, subjects, rooms, and periods
- FR30: A Teacher can view the full timetable grid for all teachers in read-only mode
- FR31: A Student can view their personal timetable showing all lessons, subjects, teachers, and rooms
- FR32: A Timetabler can export the timetable as a PDF document

**Access Control & Identity**
- FR33: A Timetabler can invite Teachers to the institution via email; Teachers complete onboarding via a magic link without prior account creation
- FR34: A Timetabler can assign one or more roles to any user within the institution (Timetabler, Teacher, Moderator, Principal); users may hold multiple roles simultaneously
- FR35: A Timetabler can create Student accounts and associate each student with a class
- FR36: The system enforces role-based access control — users can only perform actions permitted by their assigned roles
- FR37: The system enforces multi-tenant data isolation — users of one institution cannot access data of another institution
- FR38: The system enforces subscription tier limits — restricting class count, teacher count, and term count per the institution's active subscription tier

**Reporting & Visibility**
- FR39: A Principal or Timetabler can view a workload report showing total periods per teacher, free period distribution, and preference satisfaction rate across the published timetable
- FR40: A Timetabler can view a constraint satisfaction summary after each generator run showing which soft preferences were fully satisfied, partially satisfied, or not satisfied

### NonFunctional Requirements

**Performance**
- NFR1: The schedule generator must return a result within 30 seconds for institutions with up to 100 teachers, 60 classes, and a 5-day cycle — or return a clear conflict report if no valid schedule can be produced
- NFR2: All user-facing page loads must complete within 2 seconds under normal load conditions
- NFR3: Manual slot operations in the iterative workspace (pin, assign, unpin) must reflect in the UI within 500ms
- NFR4: The system must support at least 50 concurrent active users per institution without degradation in response time

**Security**
- NFR5: All data must be encrypted in transit (TLS 1.2+) and at rest
- NFR6: Multi-tenant isolation must be enforced at the data layer — queries scoped to the authenticated user's institution; no cross-tenant data access permissible through any code path
- NFR7: Authentication tokens must expire after a configurable inactivity period; magic-link tokens must be single-use and expire within 24 hours
- NFR8: All role-based access control checks must be enforced server-side; client-side UI restrictions are supplementary only
- NFR9: Passwords must be stored as salted hashes using a modern algorithm (e.g. bcrypt, Argon2)

**Scalability**
- NFR10: The system architecture must support horizontal scaling of the application tier to accommodate growth from 100 to 10,000+ institutions without architectural redesign
- NFR11: The scheduling engine must be deployable as an isolated service to allow independent scaling during peak term-planning periods
- NFR12: Database schema and query design must support at least 10,000 concurrent institution tenants without performance degradation from multi-tenancy overhead
- NFR13: Platform uptime must be ≥99.5% measured monthly, excluding pre-announced maintenance windows

**Accessibility**
- NFR14: All user-facing interfaces must conform to WCAG 2.1 Level AA
- NFR15: The timetable grid view must be navigable by keyboard without requiring mouse interaction
- NFR16: All form inputs, error messages, and status indicators must be compatible with screen readers (correct ARIA labelling, landmark roles, live regions for dynamic updates)
- NFR17: Colour must not be the sole means of conveying information — all status indicators (constraint satisfied / violated, slot pinned / unpinned) must include text or icon differentiation

### Additional Requirements

**Frontend Technology Stack:**
- React frontend with shadcn/ui + Tailwind CSS design system; shadcn/ui components are copy-pasted into codebase (owned, not a dependency)
- TypeScript strict mode throughout all components
- Storybook for component isolation testing — all custom components export a `*.stories.tsx`

**Multi-Tenancy & Subscription:**
- Multi-tenant architecture with strict data partitioning at the database layer; all queries scoped to authenticated institution
- Subscription tier limits enforced server-side: Starter (20 classes, 30 teachers, 2 terms), Professional (100 classes, 200 teachers, unlimited terms), Enterprise (unlimited, API, SSO)
- Same email at two institutions creates two independent accounts in MVP; no cross-institution accounts
- Free trial: 30 days, full features

**Scheduling Engine Deployment:**
- Scheduling engine deployed as isolated service for independent scaling (NFR11); must validate performance against 100 teachers / 60 classes / 5-day cycle ≤30s target early in development

**Integration Constraints (MVP):**
- CSV import for teacher and student data
- iCal and PDF export for timetables
- Email notifications only — no push or in-app notifications in MVP

**Regulatory:**
- Privacy policy required at launch covering data collection, usage, and retention
- Regulatory compliance (GDPR, FERPA, COPPA) deferred to market expansion milestone

**CI/CD & Testing:**
- axe-core via jest-axe — run on all Storybook stories
- eslint-plugin-jsx-a11y — lint-time accessibility warnings
- Lighthouse CI — accessibility score ≥90 on key routes
- Chromatic — visual regression for responsive breakpoints

### UX Design Requirements

**Design System & Tokens:**
- UX-DR1: Implement shadcn/ui + Tailwind CSS design token system with full SchediFlow palette: Navy `#172436`, Blue `#4a78d3`, Border `#d0d8e4`, Background `#f4f6f9`, subject-type colors (Math/blue, Science/green, Languages/purple, Humanities/amber, PE/cyan, Arts/pink), semantic status colors (Conflict `#c0392b`, Cover `#2d8da1`, Pinned navy ring, Success `#2c9e78`, Warning `#d38a36`)
- UX-DR2: Implement Inter typography scale — 18px/700 page heading, 14px/700 section heading, 13px/400 body, 12px/500 labels, 11px/400 meta, 10px/700 micro; no text below 10px
- UX-DR3: Implement Professional Light design direction — white topbar (48px, 1px border-bottom `#e5e7eb`), dark sidebar (`#1a2740`, 160px), light grey workspace (`#f3f4f6`), white grid card (4px radius, shadow `0 1px 4px rgba(0,0,0,.08)`)
- UX-DR4: Implement base 8px spacing scale (4/8/10/12/16/20/24px); component heights: topbar 40px, sub-toolbar 34px, buttons/inputs 34px, compact buttons 26px, status bar 24–36px, table rows 38px

**Custom Core Components:**
- UX-DR5: Implement TimetableGrid custom React component — rows=classes, columns=days×periods; sticky column header and row header; SlotCell matrix; overlay layer for drag ghost/selection; `view | edit | readOnly | loading` states; keyboard: arrow keys navigate, Space pins/unpins, Enter opens sheet, Escape deselects; ARIA: `role="grid"`, `aria-rowcount`, `aria-colcount`, `aria-selected`, `aria-label` per cell
- UX-DR6: Implement SlotCell component — 6 states (empty, filled, conflict, cover, pinned, selected) with Professional Light visual rules: conflict=`#fef2f2` fill + `#c0392b` top border 2px, cover=`#ecfeff` fill + dashed border, selected=`#eff6ff` fill + `#4a78d3` border; click=select, right-click=ContextMenu
- UX-DR7: Implement MiniSlot component — subject color bar (left 3px), subject abbreviation, teacher initials, room label, pin icon; `sm` (10px) and `md` (12px) size variants; states: default, pinned (blue ring 2px), conflict (red ring), cover (cyan dashed), ghost; `title` attribute with full detail for screen readers; color chip `aria-hidden="true"`
- UX-DR8: Implement AvailabilityGrid component — weekly three-state tap/click toggle per slot (available white → unavailable `#fef2f2` red → preferred `#f0fdf4` green → available); minimum 44×44px touch target (48×48 preferred); swipe-to-mark-row on mobile; keyboard: arrow keys + Space; mobile-first
- UX-DR9: Implement GeneratorStatusBar — persistent 36px bottom bar (z-index above grid, below modals) showing engine state badge, satisfaction %, conflict count, unpinned slot count, action button; 5 states: idle (grey), running (blue spinner), success (green "Done"), partial (amber), failed (red + link to ConflictExplainer); `aria-live="polite"` for engine state changes
- UX-DR10: Implement ConflictExplainer as a full-panel first-class screen — plain-language conflict summary (which teacher, which classes, why), miniature grid preview of affected slots, three action buttons (Relax constraint / Assign manually / Edit source data), expandable technical details (collapsed by default)
- UX-DR11: Implement SensitivityPanel as right Sheet drawer — constraint list grouped by type, each row: label + hard/soft toggle + weight slider (1–10, soft only) + impact preview chip; changes staged locally → "Apply and re-run" commits
- UX-DR12: Implement WorkloadCard — compact variant (table row 40px) and expanded variant (card with day-by-day breakdown); anatomy: avatar + teacher name + total periods badge + free periods badge + preference satisfaction % bar + flag button (Principal role only)

**Responsive & Mobile:**
- UX-DR13: Implement responsive layout — desktop (≥1024px): three-panel workspace (sidebar 160px + flex main + context panel 200–360px); tablet (768–1023px): sidebar collapses to 48px icon strip, context panel becomes bottom sheet; mobile (<768px): sidebar replaced by bottom tab bar, single-column layout
- UX-DR14: Implement mobile-specific experiences for Teacher and Student — teacher onboarding: full-screen availability grid, 44px+ tap targets, bottom-sheet forms, sub-5-minute completion target; student/parent timetable: single-column card list of week's lessons, day tabs, prominent "Add to Calendar" CTA
- UX-DR15: Implement deep-linking — every timetable state representable as a shareable URL; year-group filter state and other active filters saved to URL params

**Accessibility Implementation:**
- UX-DR16: Implement keyboard navigation throughout — all actions reachable by keyboard; no hover-only affordances; ContextMenu also triggered by Shift+F10; command palette by ⌘K/Ctrl+K; TimetableGrid uses roving tabindex
- UX-DR17: Implement focus management — 2px solid `#4a78d3` offset 2px focus ring on all interactive elements; skip-to-main-content as first focusable element; Sheet/Dialog: focus moves to first focusable on open, returns to trigger on close
- UX-DR18: Implement screen reader ARIA support — SlotCell: `aria-label="[Class] [Day] [Period] — [Subject, Teacher]"`, `aria-selected` on active cell; skeletons: `aria-busy="true"`; conflict state: `aria-describedby` pointing to conflict summary text
- UX-DR19: Implement colour blindness and high contrast support — all subject colours verified under deuteranopia/protanopia/tritanopia simulations; `forced-colors` media query ensures borders visible in Windows High Contrast; all animations respect `prefers-reduced-motion: reduce`

**Interaction & Feedback Patterns:**
- UX-DR20: Implement consistent feedback system — Sonner toasts (bottom-right, 4s auto-dismiss for async success, manual dismiss with Retry for async failure); inline ConflictExplainer for actionable errors; shadcn Alert (amber, dismissible) for soft warnings; no blocking alert dialogs for non-destructive notifications
- UX-DR21: Implement global Command palette — 560px centered, triggered by ⌘K/Ctrl+K or topbar search, results grouped by type (teachers, classes, subjects, rooms), arrow keys navigate, Enter selects, ESC closes
- UX-DR22: Implement loading states — skeleton shimmer for TimetableGrid (6 rows), table (5 rows), workload cards (4); never show spinner for <300ms; show progress % for operations >3s; `aria-busy="true"` on skeleton containers
- UX-DR23: Implement onboarding wizard UX — step indicator (dots or numbered, not breadcrumbs), non-linear navigation (can jump back to any completed step, cannot skip ahead), back never loses data, final step shows review summary before submit
- UX-DR24: Implement form patterns — validate on blur, specific error messages ("Enter a period count between 1 and 12", not "Invalid input"), labels above fields, required fields with asterisk + `aria-required="true"`, dirty-state "Unsaved changes" prompt on navigate away

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 1 | Institution terminology configuration |
| FR2 | Epic 1 | Bell Schedule definition |
| FR3 | Epic 1 | Cycle definition |
| FR4 | Epic 1 | Academic term management |
| FR5 | Epic 1 | Pre-built institution templates |
| FR6 | Epic 2 | Teacher record management |
| FR7 | Epic 2 | Bulk CSV teacher import |
| FR8 | Epic 2 | Class record management |
| FR9 | Epic 2 | Subject management with difficulty levels |
| FR10 | Epic 2 | Room management |
| FR11 | Epic 2 | Teacher self-profile management |
| FR12 | Epic 3 | Hard constraint definition |
| FR13 | Epic 3 | Soft preferences with configurable weights |
| FR14 | Epic 3 | Subject-level scheduling rules |
| FR15 | Epic 3 | Teacher availability declaration |
| FR16 | Epic 3 | Timetabler view/override of availability |
| FR17 | Epic 4 | Schedule generator run |
| FR18 | Epic 4 | Constraint satisfaction report |
| FR19 | Epic 4 | Conflict detection + plain-language explanation |
| FR20 | Epic 4 | Constraint sensitivity adjustment |
| FR21 | Epic 5 | Grid view of generated schedule |
| FR22 | Epic 5 | Pin slots |
| FR23 | Epic 5 | Manual lesson assignment |
| FR24 | Epic 5 | Conflict detection + alternative slot suggestions |
| FR25 | Epic 5 | Partial re-run on unpinned slots |
| FR26 | Epic 5 | Unpin slots |
| FR27 | Epic 6 | Publish timetable |
| FR28 | Epic 6 | Email notifications on publish/changes |
| FR29 | Epic 6 | Teacher personal timetable view |
| FR30 | Epic 6 | Teacher full-school read-only view |
| FR31 | DEFERRED | Student personal timetable view — out of scope |
| FR32 | Epic 6 | PDF export |
| FR33 | Epic 1 | Teacher invite + magic-link onboarding |
| FR34 | Epic 1 | Role assignment (composable roles) |
| FR35 | DEFERRED | Student account creation — out of scope |
| FR36 | Epic 1 | RBAC enforcement |
| FR37 | Epic 1 | Multi-tenant data isolation |
| FR38 | Epic 1 | Subscription tier limit enforcement |
| FR39 | Epic 7 | Workload report |
| FR40 | Epic 7 | Constraint satisfaction summary |

## Epic List

### Epic 1: Platform Foundation & Institution Onboarding
A Timetabler can register an institution, configure it to match how their school works (terminology, Bell Schedule, Cycle, terms, templates), invite their team with magic-link registration, and manage roles — with multi-tenant data isolation and subscription tier enforcement in place throughout.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR33, FR34, FR35, FR36, FR37, FR38
**Also covers:** NFR5–9 (security), NFR10–12 (scalability architecture), NFR13 (uptime baseline), UX-DR1–4 (design system foundation, Professional Light direction), UX-DR23 (onboarding wizard UX)

---

### Epic 2: People & Resource Management
A Timetabler can build out the full school data model — add teachers manually or via CSV bulk import, create class groups, configure subjects with difficulty levels, and manage rooms. Teachers can maintain their own profiles and qualifications.

**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR11
**Also covers:** UX-DR20–22 (table patterns, loading states, empty states for management pages)

---

### Epic 3: Teacher Availability & Constraint Configuration
A Timetabler can define all scheduling rules — hard constraints the engine must not violate, soft preferences with configurable weights, and subject-level scheduling rules. Teachers can submit their availability via the three-state availability grid (forbidden slots + preferred slots).

**FRs covered:** FR12, FR13, FR14, FR15, FR16
**Also covers:** UX-DR8 (AvailabilityGrid component), UX-DR11 (SensitivityPanel basic), UX-DR24 (form patterns)

---

### Epic 4: Schedule Generation Engine
A Timetabler can run the constraint-based generator to produce a complete draft timetable, see a plain-language constraint satisfaction report, understand exactly which constraints caused a deadlock, and adjust sensitivity (downgrade hard → soft at runtime) to reach a valid schedule.

**FRs covered:** FR17, FR18, FR19, FR20
**Also covers:** NFR1 (≤30s performance), UX-DR9 (GeneratorStatusBar), UX-DR10 (ConflictExplainer), UX-DR11 (SensitivityPanel full)

---

### Epic 5: Iterative Schedule Workspace
A Timetabler can work interactively with the generated draft — viewing the full grid (by class / teacher / room), pinning slots to lock them, manually assigning lessons with real-time conflict detection and alternative suggestions, and re-running the generator on unpinned slots only.

**FRs covered:** FR21, FR22, FR23, FR24, FR25, FR26
**Also covers:** NFR2 (page load ≤2s), NFR3 (slot operations ≤500ms), NFR4 (50 concurrent users), NFR15 (keyboard grid navigation), UX-DR5–7 (TimetableGrid, SlotCell, MiniSlot), UX-DR13 (responsive workspace), UX-DR15–18 (keyboard + accessibility)

---

### Epic 6: Timetable Publishing & Personal Views
A Timetabler can publish the finished timetable with email notifications to teachers and students; teachers can view their personal schedule and the full school grid; students can view their personal timetable; PDF export is available.

**FRs covered:** FR27, FR28, FR29, FR30, FR31, FR32
**Also covers:** UX-DR14 (mobile teacher + student views), UX-DR15 (deep-linking for timetable sharing), UX-DR20 (feedback patterns — publish confirmation, toast notifications)

---

### Epic 7: Reporting & Workload Visibility
A Principal or Timetabler can view a workload report showing total periods per teacher, free period distribution, and preference satisfaction rate — and the timetabler can see the constraint satisfaction summary after each generator run.

**FRs covered:** FR39, FR40
**Also covers:** UX-DR12 (WorkloadCard component), UX-DR19 (Principal read-only flow)

---

## Epic 1: Platform Foundation & Institution Onboarding

A Timetabler can register an institution, configure it to match how their school works (terminology, Bell Schedule, Cycle, terms, templates), invite their team with magic-link registration, and manage roles — with multi-tenant data isolation and subscription tier enforcement in place throughout.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR33, FR34, FR36, FR37, FR38
**Deferred:** FR35 (student accounts — out of scope)

### Story 1.1: Institution Registration & Application Shell

As a Timetabler,
I want to register a new institution and create my account,
So that my school has a secure, isolated workspace in SchediFlow ready to configure.

**Acceptance Criteria:**

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

---

### Story 1.2: Institution Terminology Configuration

As a Timetabler,
I want to rename SchediFlow's domain terms to match my school's language,
So that the platform feels native to how my institution operates.

**Acceptance Criteria:**

**Given** I navigate to Institution Settings → Terminology
**When** I view the page
**Then** I see editable fields for each configurable term: Period, Class, Term, Cycle, Bell Schedule, Room, Subject

**Given** I update a term (e.g., "Period" → "Lesson") and save
**When** any user in my institution views any page
**Then** the updated label appears everywhere in the interface — navigation, form labels, grid headers, reports — for all users in the institution

**Given** I clear a term label and save
**Then** the default SchediFlow term is restored for that concept

---

### Story 1.3: Bell Schedule Definition

As a Timetabler,
I want to define my school's Bell Schedule (named periods and their times),
So that the scheduler knows the time structure of each school day.

**Acceptance Criteria:**

**Given** I navigate to Institution Setup → Bell Schedule
**When** I add a period with a name, start time, and end time
**Then** the period is saved and appears in the ordered Bell Schedule list

**Given** I have multiple periods
**When** I reorder them
**Then** the order is saved and used as the time axis in the timetable grid, availability grid, and all reports

**Given** I submit overlapping period time ranges
**When** I save
**Then** a specific validation error identifies the overlapping periods and the Bell Schedule is not saved

---

### Story 1.4: Cycle & Academic Term Configuration

As a Timetabler,
I want to define my school's Cycle and create Academic Terms,
So that the scheduler knows the repeating day structure and the active scheduling period.

**Acceptance Criteria:**

**Given** I navigate to Institution Setup → Cycle
**When** I configure the cycle
**Then** I can set the number of days (e.g., 5, 10) and optionally name each cycle day (e.g., "Day A", "Monday")

**Given** I create a new term with a name, start date, and end date
**When** I submit
**Then** the term is saved and appears in the list ordered chronologically with a status indicator (upcoming / active / past)

**Given** I submit a term with an end date before the start date
**Then** a specific validation error is shown and the term is not saved

**Given** at least one term and one cycle are defined
**When** the schedule generator is invoked
**Then** it uses the active term's date range and the cycle definition to compute total schedulable slots

---

### Story 1.5: Pre-Built Institution Templates & Onboarding Wizard

As a first-time Timetabler,
I want to initialise my institution from a pre-built template for my school type,
So that Bell Schedule, Cycle, and common settings are pre-populated and I reach scheduling faster.

**Acceptance Criteria:**

**Given** I register a new institution with no configuration
**When** I land on the setup dashboard
**Then** the onboarding wizard launches with a step progress indicator; step 1 presents template selection

**Given** I view template selection
**When** I browse available templates
**Then** I see a basic set covering common school types (e.g., 5-day secondary school, 5-day primary school, 10-day fortnight) each with a description of what will be pre-populated

**Given** I select a template and confirm
**When** the template is applied
**Then** Bell Schedule, Cycle, and common terminology are pre-populated; I see a summary of applied defaults before moving to the next step

**Given** I navigate back to a previous wizard step
**Then** my data from later steps is preserved; I can review and edit without losing subsequent step data (UX-DR23)

**Given** I have completed all setup steps
**When** I view the setup dashboard
**Then** a checklist shows which configuration areas are complete and which are missing; I can re-enter any step to update it

---

### Story 1.6: Teacher Invitation & Magic-Link Onboarding

As a Timetabler,
I want to invite teachers via email so they can onboard without creating a password,
So that teacher registration is frictionless and takes under 5 minutes.

**Acceptance Criteria:**

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

---

### Story 1.7: Role Management, RBAC & Subscription Tier Limits

As a Timetabler,
I want to assign roles to users and have the system automatically enforce access permissions and subscription limits,
So that every user can only do what they're permitted and the institution stays within its plan.

**Acceptance Criteria:**

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

### Story 2.1: Teacher Management (Manual Entry)

As a Timetabler,
I want to create and manage individual teacher records,
So that I have a complete roster of staff available for scheduling.

**Acceptance Criteria:**

**Given** I navigate to People → Teachers and click "Add teacher"
**When** I submit a teacher's name and contact details
**Then** the teacher record is created and appears in the teacher list

**Given** I open an existing teacher record and update any field
**When** I save
**Then** the changes are reflected immediately in the teacher list and any views that display teacher data

**Given** I delete a teacher record and confirm
**When** deletion is processed
**Then** the teacher is removed and can no longer be assigned to lessons; any existing schedule assignments for that teacher are flagged

**Given** the teacher list is empty
**When** I view the page
**Then** an empty state reads "No teachers yet. Import via CSV or add individually." with two CTAs

---

### Story 2.2: Bulk Teacher Import via CSV

As a Timetabler,
I want to import teacher records from a CSV file,
So that I can set up a large roster in seconds without manual data entry.

**Acceptance Criteria:**

**Given** I upload a CSV file with valid teacher data (name, email columns at minimum)
**When** the file is parsed
**Then** a preview list shows all found records with a count before committing

**Given** I review the preview and confirm import
**When** the import is committed
**Then** all valid records are created; records already existing (matched by email) are skipped with a note

**Given** the CSV contains rows with missing required fields
**When** the preview is shown
**Then** invalid rows are highlighted with specific error messages; I can import only valid rows or cancel

**Given** the import would push teacher count over my subscription tier limit
**When** I try to commit
**Then** the import is blocked server-side with a message showing how many records can still be added

---

### Story 2.3: Class Management

As a Timetabler,
I want to create and manage class records (student groups),
So that the scheduler knows which groups need lessons assigned.

**Acceptance Criteria:**

**Given** I click "Add class" and submit a class name and optional year group
**When** saved
**Then** the class appears in the class list and is available for scheduling assignment

**Given** I edit a class name or year group and save
**Then** the updated details are reflected everywhere the class is referenced (constraints, grid, reports)

**Given** I delete a class and confirm
**Then** the class is removed; any schedule slots assigned to it are flagged as orphaned

**Given** classes with different year groups exist
**When** I view the class list
**Then** classes are filterable by year group

---

### Story 2.4: Subject Management with Difficulty Levels

As a Timetabler,
I want to create subjects and assign each a difficulty level,
So that the scheduler can apply difficulty-based distribution rules when generating the timetable.

**Acceptance Criteria:**

**Given** I click "Add subject" and submit a subject name and difficulty level (Low / Medium / High)
**When** saved
**Then** the subject is created with the difficulty level stored and used by the constraint engine

**Given** I edit a subject's difficulty level and save
**Then** the updated level is applied on the next generator run

**Given** I view the subject list
**Then** each subject shows its name and difficulty level; the list is sortable and filterable by difficulty

---

### Story 2.5: Room Management

As a Timetabler,
I want to create and manage room records,
So that the scheduler can assign lessons to appropriate rooms and avoid double-booking.

**Acceptance Criteria:**

**Given** I click "Add room" and submit a room name, capacity, and room type (e.g., classroom, lab, sports hall)
**When** saved
**Then** the room is created and available for scheduling assignment

**Given** I edit a room's capacity or type and save
**Then** the updated details are used by the constraint engine for room suitability checks on the next generator run

**Given** I delete a room and confirm
**Then** the room is removed; any schedule slots assigned to it are flagged

---

### Story 2.6: Teacher Self-Profile Management

As a Teacher,
I want to update my own profile including name, contact details, and subject qualifications,
So that the timetabler has accurate information about my teaching capabilities.

**Acceptance Criteria:**

**Given** I am logged in as a Teacher and navigate to My Profile
**When** I update my name or contact details and save
**Then** the changes are reflected in my profile and in timetabler-facing teacher views

**Given** I manage my subject qualifications (add or remove primary / secondary subjects)
**When** I save
**Then** the change is stored and visible to the Timetabler in the teacher management view

**Given** I attempt to edit another teacher's profile
**When** the request reaches the server
**Then** it is denied with a 403 (NFR8)

---

## Epic 3: Teacher Availability & Constraint Configuration

A Timetabler can define all scheduling rules — hard constraints the engine must not violate, soft preferences with configurable weights, and subject-level scheduling rules. Teachers can submit their availability via the three-state availability grid (forbidden slots + preferred slots).

**FRs covered:** FR12, FR13, FR14, FR15, FR16

### Story 3.1: Hard Constraint Definition

As a Timetabler,
I want to define hard constraints that the scheduler must never violate,
So that fundamental scheduling rules are always respected in every generated timetable.

**Acceptance Criteria:**

**Given** I navigate to Constraints → Hard Constraints and create a new constraint (e.g., "Teacher cannot be double-booked", "Room capacity must not be exceeded")
**When** saved
**Then** the constraint is applied by the generator on every subsequent run

**Given** hard constraints are defined and the generator runs
**Then** no generated schedule violates any hard constraint; if satisfaction is impossible, a conflict report is returned instead of a partial schedule

**Given** I edit or delete an existing hard constraint and save
**Then** the change takes effect on the next generator run; previously generated schedules are not retroactively affected

---

### Story 3.2: Soft Preference Configuration with Weights

As a Timetabler,
I want to define soft preferences with configurable weights,
So that the scheduler balances preferences proportionally rather than treating them as binary pass/fail.

**Acceptance Criteria:**

**Given** I add a soft preference (e.g., "Teacher A prefers Fridays free") and set a weight (1–10)
**When** saved
**Then** the preference is stored with its weight and the generator attempts to honour it proportionally across all soft preferences

**Given** two soft preferences exist with different weights (e.g., 8 and 3) and the generator cannot satisfy both
**Then** the higher-weighted preference is prioritised; the satisfaction report reflects which were fully, partially, or not satisfied

**Given** I update a preference's weight and re-run the generator
**Then** the new weight is used and the satisfaction report reflects the updated prioritisation

---

### Story 3.3: Subject-Level Scheduling Rules

As a Timetabler,
I want to define rules about how subjects are distributed across the cycle (e.g., max one high-difficulty subject per day per class),
So that student workload is balanced and fairness rules are enforced automatically.

**Acceptance Criteria:**

**Given** I navigate to Constraints → Subject Rules and create a rule (e.g., "Maximum 1 High-difficulty subject per class per cycle day")
**When** saved
**Then** the rule is applied by the generator as either a hard or soft constraint (configurable per rule)

**Given** a subject rule is set as a hard constraint and the generator runs
**Then** no generated arrangement violates the rule; violations cause a conflict report

**Given** a subject rule is set as a soft constraint with a weight and the generator runs
**Then** the rule is satisfied as best as possible; the satisfaction report shows the satisfaction rate per subject rule

---

### Story 3.4: Teacher Availability Submission (Availability Grid)

As a Teacher,
I want to declare my availability by marking slots as unavailable or preferred in a weekly grid,
So that the scheduler respects my working constraints and preferences.

**Acceptance Criteria:**

**Given** I navigate to My Availability
**When** I view the grid
**Then** I see a weekly grid using my institution's Bell Schedule periods and cycle days; each cell defaults to Available

**Given** I tap or click a slot
**When** toggled
**Then** the slot cycles through three states: Available (white) → Unavailable/Forbidden (red) → Preferred (green) → Available; the change is visually immediate with no confirmation dialog (UX-DR8)

**Given** I am on a mobile device (<768px)
**When** interacting with the grid
**Then** all cells have a minimum 44×44px touch target; I can swipe to mark a full row

**Given** I click "Mark all as available"
**When** confirmed
**Then** all slots reset to Available state in one action

**Given** I submit my availability
**When** submission succeeds
**Then** a confirmation screen shows a summary of my declared unavailable and preferred slots

---

### Story 3.5: Timetabler Availability Overview & Override

As a Timetabler,
I want to view all teacher availability declarations and override individual entries when needed,
So that I have full visibility and control over the data the generator uses.

**Acceptance Criteria:**

**Given** I navigate to a specific teacher's Availability tab
**When** I view it
**Then** I see their submitted grid showing all forbidden and preferred slots

**Given** I navigate to Constraints → Availability Overview
**When** I view the overview
**Then** I see all teachers' availability consolidated, filterable by teacher and by slot state (forbidden / preferred / not submitted)

**Given** I override a specific teacher's slot (e.g., changing preferred to forbidden) and save
**Then** the generator uses the overridden value; the teacher's original submission is preserved and the override is visually indicated

**Given** a teacher has not yet submitted their availability
**When** I view the overview
**Then** that teacher is flagged as "Not submitted"

---

## Epic 4: Schedule Generation Engine

A Timetabler can run the constraint-based generator to produce a complete draft timetable, see a plain-language constraint satisfaction report, understand exactly which constraints caused a deadlock, and adjust sensitivity (downgrade hard → soft at runtime) to reach a valid schedule.

**FRs covered:** FR17, FR18, FR19, FR20

### Story 4.1: Schedule Generator Run

As a Timetabler,
I want to run the schedule generator for a term,
So that a complete draft timetable is produced automatically from my configured constraints and data.

**Acceptance Criteria:**

**Given** I have at least one teacher, class, subject, room, Bell Schedule, Cycle, and active Term configured
**When** I click "Generate"
**Then** the generator runs and produces a complete draft timetable for the active term

**Given** the generator is running
**When** I view the workspace
**Then** the GeneratorStatusBar shows a spinner with real-time status text (e.g., "Placing 340 lessons…"); the rest of the UI remains interactive (UX-DR9)

**Given** the generator completes successfully
**When** the result is returned
**Then** the status bar transitions to green "Done"; the timetable grid is populated with the generated schedule within 30 seconds for up to 100 teachers, 60 classes, 5-day cycle (NFR1)

**Given** the generator runs a second time on the same term
**When** it completes
**Then** the previous draft is replaced with the new result; no previously generated data persists unless explicitly pinned

---

### Story 4.2: Constraint Satisfaction Report

As a Timetabler,
I want to see a constraint satisfaction report after each generator run,
So that I immediately understand how well the schedule honours soft preferences and which went unmet.

**Acceptance Criteria:**

**Given** the generator completes (fully or partially)
**When** the result is displayed
**Then** a satisfaction banner appears showing: overall satisfaction percentage, count of soft preferences fully satisfied, partially satisfied, and not satisfied

**Given** I open the full constraint satisfaction summary
**When** I view it
**Then** each soft preference is listed with its satisfaction status and weight; hard constraints show as satisfied or as the cause of any conflict

**Given** all hard constraints are satisfied and soft preferences are ≥85% satisfied
**When** the banner is shown
**Then** the visual treatment frames the result positively (green banner, e.g., "94% of preferences satisfied") — not as a failure report

---

### Story 4.3: Conflict Detection & Plain-Language Explanation

As a Timetabler,
I want the system to detect hard-constraint deadlocks and explain them in plain language,
So that I understand exactly what is causing the problem and know my options — with no dead ends.

**Acceptance Criteria:**

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

---

### Story 4.4: Constraint Sensitivity Adjustment

As a Timetabler,
I want to downgrade specific hard constraints to soft preferences at runtime,
So that I can break a deadlock without permanently changing my constraint configuration.

**Acceptance Criteria:**

**Given** I click "Relax constraint" from the ConflictExplainer
**When** the SensitivityPanel opens
**Then** I see the conflicting constraint with a hard/soft toggle and (when set to soft) a weight slider (1–10); the original constraint definition is unchanged in the main configuration (FR20)

**Given** I hover or focus the relaxation option before committing
**When** the impact preview is shown
**Then** a chip displays what will change (e.g., "If relaxed: 1 Friday PM slot may be assigned to Teacher A") (UX-DR11)

**Given** I set a hard constraint to soft with a weight and click "Apply and re-run"
**When** the generator runs
**Then** it treats the relaxed constraint as a soft preference with the specified weight; the original constraint remains hard in the saved configuration

**Given** the re-run after sensitivity adjustment produces a valid schedule
**When** the result is shown
**Then** the satisfaction report clearly indicates which formerly-hard constraint was relaxed and how it was handled

---

## Epic 5: Iterative Schedule Workspace

A Timetabler can work interactively with the generated draft — viewing the full grid (by class / teacher / room), pinning slots to lock them, manually assigning lessons with real-time conflict detection and alternative suggestions, and re-running the generator on unpinned slots only.

**FRs covered:** FR21, FR22, FR23, FR24, FR25, FR26

### Story 5.1: Timetable Grid View

As a Timetabler,
I want to view the generated schedule in an interactive grid layout,
So that I can see the full school timetable at a glance and navigate it efficiently.

**Acceptance Criteria:**

**Given** a schedule has been generated
**When** I view the workspace
**Then** the TimetableGrid renders with rows = classes (grouped by year group), columns = cycle days × Bell Schedule periods; each filled slot shows a MiniSlot with subject colour bar, subject abbreviation, teacher initials, and room label (UX-DR5, UX-DR7)

**Given** I select a view pivot from the toolbar
**When** switching between Full School, By Teacher, and By Room
**Then** the same grid re-renders with the new pivot without leaving the workspace

**Given** I use a year-group filter tab above the grid
**When** I select a year group
**Then** only that year group's rows are shown; the filter state is reflected in the URL (UX-DR15)

**Given** the grid is loading
**When** data is being fetched
**Then** a skeleton shimmer is shown for 6 rows; the grid renders within 2 seconds (NFR2, UX-DR22)

**Given** I navigate the grid by keyboard
**When** I use arrow keys
**Then** focus moves cell by cell; Space pins/unpins, Enter opens the slot edit Sheet, Escape deselects (NFR15, UX-DR16)

**Given** I view a slot cell with a screen reader
**Then** each cell announces class, day, period, subject, and teacher; empty cells announce "Empty"; the grid has `role="grid"` with `aria-rowcount` and `aria-colcount` (NFR16, UX-DR18)

**Given** conflict and pinned states are shown
**Then** conflict cells show a red top border AND a text/icon indicator; pinned slots show a ring AND a pin icon — colour is never the sole differentiator (NFR17, UX-DR19)

---

### Story 5.2: Slot Pinning

As a Timetabler,
I want to pin specific slots to lock them from future generator runs,
So that I can preserve the parts of the schedule I'm happy with while continuing to refine the rest.

**Acceptance Criteria:**

**Given** I click a filled slot and select "Pin" (or press Space with the slot focused)
**When** pinned
**Then** a 2px blue ring appears on the MiniSlot and a pin icon is shown; no confirmation dialog; the change reflects within 500ms (NFR3)

**Given** a slot is pinned and I re-run the generator
**Then** the pinned slot is preserved exactly as-is; only unpinned slots are filled

**Given** I click a pinned slot and select "Unpin" (FR26)
**When** unpinned
**Then** the slot returns to standard filled state with no ring or pin icon; it is included in the next generator run

**Given** I have pinned multiple slots
**When** I view the GeneratorStatusBar
**Then** it shows "X unpinned slots will be solved" so I know the scope of the next re-run (UX-DR9)

---

### Story 5.3: Manual Slot Assignment

As a Timetabler,
I want to manually assign a lesson to a specific slot,
So that I can override the generator's choices and place lessons exactly where I need them.

**Acceptance Criteria:**

**Given** I right-click (or press Shift+F10 on) a slot cell
**When** the context menu opens
**Then** I see options: "Assign lesson", "Pin", "Clear", "View detail" (UX-DR16)

**Given** I select "Assign lesson" and choose a teacher, class, subject, and room
**When** I confirm
**Then** the lesson is placed in the slot; the MiniSlot renders immediately; the operation completes within 500ms (NFR3)

**Given** I drag a MiniSlot from one cell to another and drop it
**Then** the lesson moves to the target slot; if the source slot is pinned the move is blocked with a clear message

**Given** I press Enter on a focused slot
**When** the edit Sheet opens
**Then** it slides in from the right (360px) with fields for teacher, class, subject, and room; "Back to grid" is always visible (UX-DR13)

---

### Story 5.4: Conflict Detection on Manual Assignment

As a Timetabler,
I want the system to detect conflicts when I manually assign a lesson and suggest valid alternatives,
So that I can resolve scheduling problems without guessing.

**Acceptance Criteria:**

**Given** I manually assign a lesson to a slot that creates a conflict (e.g., teacher double-booked, room already in use)
**When** the assignment is submitted
**Then** a conflict popover appears showing the specific conflict reason and 2–3 alternative valid slots (FR24)

**Given** alternative slots are suggested and I click one
**Then** the lesson moves to that slot; the conflict is resolved; the original slot is cleared

**Given** I dismiss the conflict suggestion and keep the conflicting assignment
**When** saved
**Then** the SlotCell renders in conflict state (red top border + conflict icon) and is flagged in the ConflictExplainer if the generator re-runs

**Given** a manual assignment creates no conflict
**When** confirmed
**Then** no conflict UI is shown; the slot renders in standard filled state

---

### Story 5.5: Partial Re-Generation on Unpinned Slots

As a Timetabler,
I want to re-run the generator on only the unpinned slots,
So that I can iterate on the schedule without losing the parts I've already approved.

**Acceptance Criteria:**

**Given** I have a mix of pinned and unpinned slots and click "Re-run unpinned"
**When** the generator runs
**Then** all pinned and manually assigned slots remain exactly as-is throughout; only unpinned slots are filled

**Given** the partial re-run completes successfully
**When** the result is shown
**Then** the grid updates with new assignments in previously unpinned slots; the satisfaction banner reflects the full schedule including pinned slots

**Given** the partial re-run cannot produce a valid result for the unpinned slots
**When** the run completes
**Then** the ConflictExplainer is shown scoped to the unsatisfied unpinned portion only

**Given** all slots are pinned
**When** I view the GeneratorStatusBar
**Then** the "Re-run unpinned" button is disabled with tooltip: "All slots are pinned — unpin slots to re-run"

---

## Epic 6: Timetable Publishing & Personal Views

A Timetabler can publish the finished timetable with email notifications to teachers; teachers can view their personal schedule and the full school grid in read-only mode; PDF export is available.

**FRs covered:** FR27, FR28, FR29, FR30, FR32
**Deferred:** FR31 (student personal timetable view — out of scope)

### Story 6.1: Timetable Publishing

As a Timetabler,
I want to publish the timetable so it becomes visible to all authorised users,
So that the finished schedule is officially released and the school can act on it.

**Acceptance Criteria:**

**Given** I have a completed draft timetable and click "Publish"
**When** I confirm the AlertDialog ("Publish this timetable? Teachers will be notified.")
**Then** the timetable is marked as published, becomes visible to all authorised roles, and a success toast appears ("Timetable published — teachers notified") (UX-DR20)

**Given** the timetable is published and I make subsequent changes
**When** changes are saved
**Then** the timetable remains in published state; affected teachers receive a change notification email (FR28)

**Given** I attempt to publish with unresolved conflicts or empty required slots
**When** I click Publish
**Then** a warning identifies the issue; I can choose to proceed or resolve first

---

### Story 6.2: Email Notifications on Publish & Changes

As a Teacher,
I want to be notified by email when a timetable is published or when changes affect my schedule,
So that I always know when my schedule is ready or has been updated.

**Acceptance Criteria:**

**Given** a Timetabler publishes a timetable
**When** publication is confirmed
**Then** every teacher in the institution receives an email with a direct deep-link to their personal timetable (UX-DR15)

**Given** a Timetabler makes changes to a published timetable affecting specific teachers
**When** changes are saved
**Then** only the affected teacher(s) receive a change notification email identifying which slots changed

**Given** an email notification is sent
**When** the teacher receives it
**Then** the email contains: institution name, term name, a summary of what changed or "your timetable is ready", and a direct deep-link to their personal timetable

**Given** an email delivery fails
**When** the failure is detected
**Then** the failure is logged and surfaced to the Timetabler; the timetable publish is not rolled back

---

### Story 6.3: Teacher Personal Timetable View

As a Teacher,
I want to view my personal timetable showing all my assigned lessons,
So that I know exactly what I'm teaching, when, and where.

**Acceptance Criteria:**

**Given** I am logged in as a Teacher and navigate to My Timetable
**When** I view it
**Then** I see all my assigned lessons for the active term: subject, class, room, and period per slot; free periods are clearly indicated

**Given** I am on a mobile device (<768px)
**When** I view my timetable
**Then** the layout renders as a card-list view with day tabs for navigation; each card shows subject, class, room, and time (UX-DR14)

**Given** I click the deep-link from my notification email
**When** I land on my personal timetable
**Then** the correct term's timetable is shown directly without requiring further navigation (UX-DR15)

---

### Story 6.4: Teacher Full-School Read-Only Grid View

As a Teacher,
I want to view the full school timetable grid in read-only mode,
So that I can see colleagues' schedules and understand the full picture.

**Acceptance Criteria:**

**Given** I am logged in as a Teacher and navigate to the School Timetable
**When** I view it
**Then** the TimetableGrid renders in `readOnly` mode — no pin, assign, drag, or context menu actions are available

**Given** I switch view pivot (Full School / By Teacher / By Room)
**Then** all pivot views are available and functional; the year-group filter is also available

**Given** I click a slot in read-only mode
**When** the interaction occurs
**Then** a read-only detail popover shows subject, teacher, room, and period — no editing action occurs

---

### Story 6.5: PDF Timetable Export

As a Timetabler,
I want to export the timetable as a PDF,
So that I can distribute printed copies or archive the schedule outside SchediFlow.

**Acceptance Criteria:**

**Given** I have a published or draft timetable and click "Export PDF"
**When** the PDF is generated
**Then** the download begins automatically; the PDF contains institution name, term name, generation date, and the full grid with subjects, teachers, rooms, and periods legibly rendered

**Given** PDF generation takes more than 1 second
**When** processing
**Then** a loading indicator is shown; on completion a toast appears ("PDF ready — downloading") (UX-DR20)

---

## Epic 7: Reporting & Workload Visibility

A Principal or Timetabler can view a workload report showing total periods per teacher, free period distribution, and preference satisfaction rate — and the timetabler can see the constraint satisfaction summary after each generator run.

**FRs covered:** FR39, FR40

### Story 7.1: Workload Report

As a Principal or Timetabler,
I want to view a workload report showing each teacher's period count, free periods, and preference satisfaction rate,
So that I can verify the timetable is fair and flag any issues before it is finalised.

**Acceptance Criteria:**

**Given** a timetable has been published or is in draft state
**When** I navigate to Reports → Workload
**Then** I see a report listing every teacher with: total periods assigned, free period count, and preference satisfaction percentage

**Given** I view the report in compact mode
**When** each teacher row is rendered
**Then** it shows avatar, teacher name, total periods badge, free periods badge, and a preference satisfaction % bar in a 40px compact row (UX-DR12)

**Given** I expand a teacher's row
**When** the expanded view is shown
**Then** I see a day-by-day breakdown of periods assigned and free slots for that teacher

**Given** a teacher's assigned period count exceeds their contracted hours (if set)
**When** I view the report
**Then** that teacher's row is visually flagged with an amber warning indicator

**Given** I am logged in as a Principal and view the report
**When** I click the "Flag" button on a teacher row
**Then** a comment is sent as a notification to the Timetabler (UX-DR12)

**Given** no timetable has been published
**When** I navigate to the workload report
**Then** an empty state reads "Publish a timetable to see workload data."

---

### Story 7.2: Constraint Satisfaction Summary

As a Timetabler,
I want to view a detailed constraint satisfaction summary after each generator run,
So that I can audit which soft preferences were honoured, partially met, or skipped and guide my next refinement.

**Acceptance Criteria:**

**Given** the generator has completed a run (full or partial)
**When** I open the Constraint Satisfaction Summary
**Then** I see every soft preference listed with: preference description, assigned weight, and satisfaction status (Fully Satisfied / Partially Satisfied / Not Satisfied)

**Given** a soft preference was not satisfied
**When** I view its row
**Then** the reason is shown (e.g., "Could not avoid Monday morning for Teacher B — no valid alternative slot available given hard constraints")

**Given** the summary is shown after a partial re-run
**When** I view it
**Then** the summary reflects the combined state of the full schedule — both pinned and newly generated slots — not just the re-run portion

**Given** I view run history
**When** multiple generator runs have been performed
**Then** each run is listed with its overall satisfaction percentage and timestamp; I can expand any run to see its full summary
