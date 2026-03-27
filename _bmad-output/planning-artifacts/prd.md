---
stepsCompleted:
  - step-01-init
  - step-01b-continue
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments:
  - docs/requirements/mrd/SchediFlow_MRD_v1.0.md
workflowType: 'prd'
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 1
classification:
  projectType: saas_b2b
  domain: edtech
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - SchediFlow

**Author:** Arthur
**Date:** 2026-03-27

## Executive Summary

SchediFlow is a multi-tenant SaaS platform for school timetable management, purpose-built for educational institutions with 10–200 teaching staff. It addresses a universal operational problem: one administrator, bearing the full weight of hundreds of competing teacher preferences, room constraints, curriculum requirements, and institutional rules, must produce a conflict-free timetable — typically once or twice a year — using tools that are either manual, rigid, or prohibitively expensive.

SchediFlow's core premise is that timetable generation should be an *iterative, collaborative process* rather than a single-shot output. The platform provides a constraint engine that produces a draft schedule, then gives the timetabler full control to refine it: pinning slots that are correct, manually adjusting individual teacher schedules or specific days, and re-running the generator on the remaining gaps — repeatedly, until the result is one everyone can live with.

Target users are timetablers (teachers, deputy principals, or admin staff assigned scheduling responsibility), with secondary access for teachers (preference submission, personal timetable view), students (personal schedule), and parents (read-only visibility). The platform serves the whole school community, not just the person who builds the schedule.

The long-term product direction is an AI scheduling agent capable of interpreting natural language rules and generating schedules autonomously. SchediFlow builds the foundational capability now: a rich, configurable constraint model and iterative workspace that the AI layer can be meaningfully built upon.

### What Makes This Special

**Iterative generation workspace.** The generated schedule is a draft, not a final output. Timetablers can pin specific slots, manually remove or reassign lessons for individual teachers or days, and re-run the generator on what remains. Scheduling becomes a guided refinement process rather than an all-or-nothing engine run.

**Weighted soft constraints.** Every scheduling preference carries configurable weight. A teacher's preferred free day, subject difficulty limits per day (e.g. no more than one hard subject on Fridays), preferred teaching blocks — all expressed as weighted preferences the generator balances, not rigid rules it either satisfies or fails on. The timetabler finds a solution that is fair and broadly accepted, not just technically valid.

**Full configurability.** Every domain element — terminology, Bell Schedule, Cycle structure, room types, difficulty scales, term dates — is configurable per institution. SchediFlow adapts to how the school works, not the other way around.

**AI-ready foundation.** The constraint and preference model is designed from the start to support NLP-driven rule creation and eventually autonomous schedule generation. Phase 1 builds the human-in-the-loop workspace; Phase 2 makes it intelligent.

## Project Classification

- **Project Type:** SaaS B2B — multi-tenant platform, subscription-based, admin/teacher/student role hierarchy
- **Domain:** EdTech — K-12 schools, language schools, vocational centres, universities
- **Complexity:** Medium — student data privacy considerations, accessibility requirements, constraint-based scheduling engine, soft constraint weighting
- **Project Context:** Greenfield — new product, full scope definition required

## Success Criteria

### User Success

- Timetabler completes their first published timetable within 2 hours of starting setup (median)
- Generator acceptance rate ≥85% — schedule accepted without a full manual redo
- ≥50% of generation sessions include at least one pin, manual adjustment, or partial re-run
- Timetabler NPS ≥45 within 90 days of first published timetable
- Teacher activation: ≥70% of invited teachers submit availability preferences within the first scheduling cycle
- Teacher NPS ≥35 within 60 days of timetable publication
- 30-day activation rate: ≥60% of trial institutions complete their first published timetable

### Business Success

**Year 1**
- 100+ paying institutions
- ARR ≥$100,000
- Annual churn ≤15%
- Gross margin ≥75%
- Customer Acquisition Cost ≤$500

**Year 3**
- 1,000+ paying institutions
- ARR ≥$1.2M
- Annual churn ≤10%
- Net Revenue Retention ≥110%
- Active in 5+ countries

### Technical Success

- Scheduling engine ≤30 seconds for institutions with up to 100 teachers and 60 classes (see NFR1)
- Platform uptime ≥99.5% monthly (see NFR13)
- Student and teacher data handled with standard privacy practices; regulatory compliance frameworks (GDPR, FERPA) addressed as market expansion milestones
- All user-facing interfaces conform to WCAG 2.1 AA (see NFR14)

### Measurable Outcomes

- Free trial → paid conversion rate ≥25%
- Time to first generator run (from account creation) ≤1 hour
- Support ticket volume per institution decreases after first full scheduling cycle
- ≥80% of timetablers report reduced scheduling effort vs. previous method (post-launch survey)

## Product Scope

### MVP — Minimum Viable Product

Core scheduling workspace and iterative generation engine — the foundational capability that makes SchediFlow worth using.

- Multi-tenant institution setup with configurable terminology, Bell Schedule, Cycle, and term structure
- Onboarding wizard with pre-built institution Templates (basic set for common school types)
- Teacher, class, subject, and room management with CSV import
- Weighted constraint and preference system (hard rules + soft preferences with configurable weights)
- Constraint-based schedule generator with soft constraint satisfaction reporting
- Iterative generation workspace: pin slots, manually adjust teacher/day assignments, re-run on unpinned slots
- Constraint conflict detection with plain-language explanation and sensitivity dial
- Composable role model: Timetabler, Teacher, Moderator, Principal (configurable), Student
- Teacher self-registration via magic link, availability grid, subject qualification tagging
- Student personal timetable view
- Publish action with email notification to teachers and students
- PDF export
- WCAG 2.1 AA accessibility compliance

### Growth Features (Post-MVP)

Features that make SchediFlow operationally complete for day-to-day school management.

- Absence and cover workflows — structured cover assignment with notifications
- Delegation requests — teacher-to-teacher lesson swap with approval workflow
- Temporary schedules — exceptional week management with rollback
- Parent read-only timetable access via shared link
- Calendar export (iCal/Google Calendar) for teachers and students
- Holiday calendar integration (public holiday API)
- Template Library — extended set of community and institution-type templates
- Multi-campus / department support
- Workload and constraint satisfaction reporting
- Comment/flag on timetable draft (Principal workflow)
- Audit trail of timetable changes
- In-app and push notification system for timetable changes

### Vision (Future)

The AI-powered scheduling layer that SchediFlow's constraint model is designed to support.

- AI Scheduling Assistant — NLP-driven rule creation parsed into weighted constraints automatically
- Autonomous schedule generation from natural language briefs
- Predictive conflict warnings and optimisation suggestions
- SIS/LMS integration for data import/export
- REST API for Enterprise tier and third-party integrations
- Multi-campus / school district account support

## User Journeys

### Journey 1: The First-Time Timetabler — From Zero to Published

**Persona:** Megan, Deputy Head of a 45-teacher secondary school in Dublin. She's been handed timetabling responsibility after the previous coordinator retired. She has never built a timetable before. It's six weeks before the new term.

**Opening Scene:** Megan signs up for SchediFlow's free trial after a Google search for "school timetabling software". She's anxious — the previous timetabler spent three weeks on this every term, and she's expected to match that quality. She logs in for the first time.

**Rising Action:** The onboarding wizard asks her to describe her school — how many teachers, classes, periods per day, days per week, and how she names things. She selects a pre-built Template for a standard Irish secondary school, which pre-populates her Bell Schedule and Cycle structure. She adjusts a few labels, adds her 45 teachers by uploading a CSV, and sets up her 32 classes and subjects. SchediFlow sends invite emails to teachers automatically. Over the next two days, 38 of 45 teachers submit their availability preferences and flag their Forbidden Slots.

**Climax:** Megan clicks "Generate". The engine runs for 18 seconds and produces a complete draft timetable. She sees a green banner: "Schedule generated — 94% of soft preferences satisfied." She clicks through the result. A few slots look off — one teacher has four consecutive periods on Monday. She pins the slots she's happy with (most of them), drags that teacher's Monday block to split it, and clicks "Re-generate unpinned". The second run takes 11 seconds and fills the remaining gaps cleanly.

**Resolution:** Megan publishes the timetable. Teachers receive notifications and can see their personal schedules immediately. What her predecessor spent three weeks on took Megan four hours across two days. She emails the Principal: "Done."

*Reveals requirements for: guided onboarding wizard, CSV teacher import, pre-built Templates, teacher invite + availability submission, generator with constraint satisfaction reporting, pin-and-regenerate workspace, publish action, teacher notification.*

---

### Journey 2: The Experienced Timetabler — Iterative Refinement

**Persona:** David, a Scheduling Coordinator at a 90-teacher international school in Sydney. He's used SchediFlow for two terms. He knows what he wants and uses the generator as a starting point, not a final answer.

**Opening Scene:** It's the start of a new term planning cycle. David opens SchediFlow, duplicates last term's configuration as a starting point, and updates the teachers who have changed. A senior Science teacher has requested Fridays off for personal reasons. The Head of Year 10 wants no more than one "high difficulty" subject scheduled per student on any given Friday.

**Rising Action:** David adds these as weighted soft constraints — the Friday free-day preference at weight 8/10, and the Friday difficulty cap as a rule. He runs the generator. It produces a result in 22 seconds. He opens the grid view and spots that one Year 10 class has two high-difficulty subjects on a Friday — the constraint was satisfied for every other class but this one.

**Climax:** David right-clicks the offending slot, pins the one he prefers to keep, and manually moves the other to a Thursday. The system flags a potential room conflict on Thursday — it suggests two alternative slots. He selects one, and the conflict clears. He locks both adjustments and re-runs the generator on the handful of remaining unpinned slots. Third run — clean result.

**Resolution:** David reviews the timetable summary: the Science teacher has every Friday free. 31 of 32 Year 10 classes have zero high-difficulty subjects on Friday. Total time: 45 minutes from open to publish.

*Reveals requirements for: weighted soft constraint configuration, difficulty-level subject tagging, conflict detection with alternative slot suggestions, manual slot assignment with conflict checking, iterative pin-and-regenerate, constraint satisfaction summary report.*

---

### Journey 3: The Timetabler Edge Case — Generator Hits Its Limit

**Persona:** Sarah, a Timetabler at a 120-teacher high school in London. The school has unusually complex constraints this term — a new sixth-form option block, two teachers with heavily restricted availability, and a requirement that all Year 13 classes finish by 3pm.

**Opening Scene:** Sarah runs the generator. It stops after 45 seconds with a warning: "Unable to produce a fully valid schedule — 3 hard constraints cannot be satisfied simultaneously." The screen shows which constraints are in conflict: Teacher A's Forbidden Slots overlap with the only viable windows for two Year 13 classes.

**Rising Action:** Sarah reads the conflict explanation. The tool shows her exactly which teacher, which classes, and which slots are creating the deadlock. She opens the Sensitivity panel and temporarily moves Teacher A's Friday afternoon restriction from "hard constraint" to "soft preference" with weight 6/10.

**Climax:** She re-runs the generator. It completes in 30 seconds. Teacher A ends up with one Friday afternoon slot — the generator tried to avoid it but couldn't without violating the Year 13 finishing time rule. Sarah checks with Teacher A directly, who agrees it's acceptable this term.

**Resolution:** The timetable is published. The conflict explanation feature saved Sarah from a frustrating trial-and-error loop. She understands exactly why the constraint couldn't be satisfied and made an informed decision rather than a guess.

*Reveals requirements for: hard vs soft constraint designation, constraint conflict detection with plain-language explanation, sensitivity dial (hard → soft with configurable weight), partial regeneration after manual resolution.*

---

### Journey 4: The Teacher — From Invite to Personal Timetable

**Persona:** James, a Maths teacher at Megan's school (Journey 1). He received an email from SchediFlow asking him to set up his profile.

**Opening Scene:** James clicks the link in the email on his phone. He lands on a simple setup page — magic link, no password required. He sets his name, optionally uploads a photo, and reaches the availability screen.

**Rising Action:** He sees a weekly grid. He marks Tuesday afternoons as unavailable (standing medical appointment) and flags Wednesday mornings as preferred. He sets his subject qualifications: Maths (primary), Further Maths (secondary). Submission takes four minutes.

**Climax:** Two days later, he receives a notification: "Your timetable for Term 3 has been published." His personal timetable is there — classes, rooms, free periods. Tuesday afternoons are free. Wednesday mornings have only one class.

**Resolution:** James bookmarks the timetable page. For the first time, he doesn't need to wait for a printed sheet posted in the staffroom. He exports it to his Google Calendar directly.

*Reveals requirements for: magic-link teacher onboarding, availability grid (unavailable + preferred slots), subject qualification tagging, email notification on publish, personal teacher timetable view, calendar export.*

---

### Journey 5: The Principal — Oversight and Approval

**Persona:** Helen, Principal of David's school (Journey 2). She doesn't build the timetable but cares deeply about whether it's fair and whether her staff will be happy.

**Opening Scene:** David sends Helen a summary link before publishing. She opens SchediFlow with her read-only admin view.

**Rising Action:** She navigates to the Workload Report. She can see each teacher's total period count per week, their free periods, and whether their preferences were satisfied. She notices one teacher — a part-timer — has been assigned 18 periods when their contract specifies 16. She flags it to David via a comment on the timetable.

**Climax:** David adjusts two slots and re-runs a partial regeneration. Helen refreshes her view. The part-timer is now at 16 periods. All other workload distributions look fair. She approves.

**Resolution:** Helen has a record of the timetable decision, the adjustment made, and the final state. If a teacher disputes their workload, she has the data.

*Reveals requirements for: principal/read-only admin role, workload report (periods per teacher, preference satisfaction rate), comment/flag on timetable draft, audit trail of changes.*

---

### Journey 6: The Student — Finding Your Schedule

**Persona:** Ava, a Year 11 student at Megan's school. She's used to finding out her timetable from a printed sheet on the noticeboard.

**Opening Scene:** Ava receives an email with a link to her SchediFlow student account. She clicks it on her phone.

**Rising Action:** She sees her personal weekly timetable — each lesson labelled with subject, teacher name, and room number.

**Climax:** She taps "Add to Calendar". Her school timetable syncs to her iPhone calendar. When a room change is made two weeks into term, she receives a push notification: "Room change: History Monday P3 is now Room 22."

**Resolution:** Ava stops checking the noticeboard. Her parents can also view her timetable through a shared link.

*Reveals requirements for: student account with personal timetable view, room and teacher display per slot, calendar export (iCal), push/email notification for changes, parent read-only access via shared link.*

---

### Journey Requirements Summary

| Capability Area | Journeys |
|---|---|
| Guided onboarding wizard + pre-built Templates | J1 |
| CSV/bulk teacher import | J1 |
| Teacher invite + magic-link onboarding | J1, J4 |
| Availability grid (forbidden + preferred slots) | J1, J4 |
| Subject qualification tagging | J4 |
| Weighted constraint configuration (hard + soft) | J2, J3 |
| Subject difficulty tagging + daily limits | J2 |
| Constraint-based schedule generator | J1, J2, J3 |
| Constraint conflict detection + plain-language explanation | J3 |
| Sensitivity dial (hard → soft constraint) | J3 |
| Pin-and-regenerate iterative workspace | J1, J2, J3 |
| Manual slot assignment with conflict checking | J2, J3 |
| Constraint satisfaction summary report | J2 |
| Publish action + teacher/student notification | J1, J4, J6 |
| Personal timetable view (teacher) | J4 |
| Calendar export (iCal/Google) | J4, J6 |
| Student personal timetable view | J6 |
| Parent read-only access | J6 |
| Principal/admin read-only role | J5 |
| Workload report | J5 |
| Comment/flag on timetable draft | J5 |
| Audit trail of timetable changes | J5 |
| Push/email notification for changes | J4, J6 |

## Domain-Specific Requirements

### Compliance & Regulatory

- Student and teacher personal data (names, schedules, availability) encrypted at rest and in transit, access scoped by role
- Regulatory compliance frameworks (GDPR, FERPA, COPPA) deferred to a later milestone tied to market expansion into regulated jurisdictions
- Clear privacy policy required at launch covering data collection, usage, and retention

### Technical Constraints

- All user-facing interfaces conform to WCAG 2.1 AA — mandatory for institutional procurement in markets with accessibility obligations (detailed in NFR14–17)
- Multi-tenant data isolation enforced at the data layer — one institution cannot access another's data, schedules, or user records (detailed in NFR6)

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Iterative Generation Workspace**

Most constraint-based scheduling tools treat generation as a single-shot event — configure constraints, run the engine, accept or reject the result. SchediFlow reframes this as an iterative refinement loop: the generated schedule is a draft the timetabler actively shapes through pinning, manual adjustment, and selective regeneration. The innovation is not in the constraint engine itself, but in how the human and engine collaborate to reach a result.

**2. Weighted Soft Constraint System with Sensitivity Dial**

Most scheduling tools operate on binary constraints — satisfied or not. SchediFlow introduces a continuum: hard constraints that must be satisfied, soft preferences with configurable weights, and a runtime sensitivity dial that lets timetablers progressively relax constraints when a complex configuration cannot produce a valid schedule. The sensitivity dial replaces "engine failed — no result" with a transparent, guided negotiation process.

**3. AI-Ready Constraint Model**

SchediFlow's constraint and preference model is designed from the start to be machine-interpretable. Phase 2 introduces NLP-driven rule creation — a timetabler describes a rule in plain language and it is parsed into a weighted constraint automatically. The innovation is in the architectural intent: SchediFlow is a foundation for an AI scheduling agent, not a tool that retrofits AI later.

### Market Context & Competitive Landscape

Existing tools fall into two categories: legacy desktop software (strong constraint engines, poor UX, no iteration model) and modern cloud tools (better UX, weaker constraint models, still one-shot generation). No current competitor offers pin-and-regenerate iterative workspace or progressive constraint sensitivity. NLP-driven rule creation is emerging market expectation — no established competitor has shipped it yet.

### Validation Approach

- **Iterative workspace:** ≥50% of generation sessions include at least one pin or manual adjustment before re-run (defined in success criteria)
- **Weighted soft constraints:** Generator acceptance rate ≥85% validates the constraint model
- **Sensitivity dial:** ≥70% of failed generation sessions result in a successful re-run after sensitivity adjustment

### Risk Mitigation

- **Iterative workspace complexity:** Progressive disclosure — default to simple one-shot view, reveal iterative controls as an "advanced" mode; usability test with first 10 beta customers
- **Constraint model cognitive overhead:** Sensible defaults for all weights; templates pre-configure common constraint sets; tooltips explain each weight's effect
- **AI layer quality bar:** Phase 2 AI explicitly decoupled from MVP; parsed constraint always shown for timetabler confirmation before applying; never auto-applied without review

## SaaS B2B Specific Requirements

### Tenant Model

- Each institution is a discrete tenant with its own isolated data environment
- Users belong to exactly one institution — no cross-institution accounts in MVP
- No school group or district multi-tenant hierarchy in MVP (post-MVP consideration)
- Tenant provisioning at institution signup; data isolation enforced at the data layer

### Permission Model (RBAC)

SchediFlow uses a **composable role model** — users can hold multiple roles simultaneously. A teacher can also be a Timetabler; a Principal can be granted edit rights. Roles are assigned per institution by any user with Timetabler rights.

| Role | Access Level | Key Permissions |
|---|---|---|
| **Timetabler** | Full admin | Configure institution, manage teachers/classes/subjects/rooms, define constraints, run generator, pin/adjust/publish timetable, view all reports |
| **Principal / Admin** | Configurable | Read-only by default (view timetable, workload reports, comment/flag); can be granted Timetabler-level edit rights |
| **Teacher** | Standard | View own timetable and all teachers' timetables, submit availability preferences, manage own profile and qualifications |
| **Moderator** | Extended teacher | Additional permissions on top of Teacher role — scope defined per institution; activated as a secondary role |
| **Student** | Limited | View own timetable only |
| **Parent** | Read-only | View linked child's timetable only |

Key design decisions:
- Roles are additive and composable — a user can hold Teacher + Moderator, or Teacher + Timetabler simultaneously
- Minimum one Timetabler required per institution; multiple Timetablers supported
- Role assignment and revocation managed by any user with Timetabler rights

### Subscription Tiers

| Tier | Target | Limits | Price (Annual) |
|---|---|---|---|
| **Free Trial** | All new institutions | 30 days, full features | Free |
| **Starter** | Small schools | 20 classes, 30 teachers, 2 terms | $400–$800 |
| **Professional** | Medium schools | 100 classes, 200 teachers, unlimited terms | $1,200–$2,400 |
| **Enterprise** | Large schools, universities | Unlimited, API access, SSO, SLA | Custom / $4,000+ |

### Integration Requirements

- **MVP:** CSV import for teacher and student data; iCal and PDF export for timetables; email notifications
- **Post-MVP:** SIS/LMS integration via partnership agreements; REST API for Enterprise tier

### Technical Architecture Considerations

- Multi-tenant architecture with strict data partitioning at the database layer
- Same email address at two institutions creates two independent accounts in MVP
- Subscription tier limits enforced server-side (class count, teacher count, term count)
- All timetable state (pinned slots, constraints, published schedules) persisted per institution per term

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP — the constraint generator alone is insufficient to validate the product. The iterative workspace (pin, adjust, regenerate) is the core differentiator and must be present in MVP. Users need to experience the full refinement loop to reach the "aha" moment that drives conversion and retention.

**Validation Goal:** One person produces a publishable, conflict-free timetable in under 2 hours using SchediFlow — and the result is accepted by teaching staff without significant rework.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:** J1 (first-time timetabler), J2 (iterative refinement), J3 (conflict resolution), J4 (teacher onboarding), J6 (student view)

**Must-Have Capabilities:**
- Multi-tenant institution setup with configurable Bell Schedule, Cycle, term structure, and terminology
- Onboarding wizard with pre-built institution Templates (basic set)
- Teacher, class, subject, and room management with CSV import
- Weighted constraint and preference system (hard constraints + soft preferences with configurable weights)
- Constraint-based schedule generator with soft constraint satisfaction reporting
- Iterative generation workspace: pin slots, manually adjust teacher/day assignments, re-run on unpinned slots
- Constraint conflict detection with plain-language explanation
- Sensitivity dial — downgrade hard constraints to soft preferences at runtime
- Composable role model: Timetabler, Teacher, Moderator, Principal (configurable), Student
- Teacher self-registration via magic link, availability grid, qualification tagging
- Student personal timetable view
- Publish action with email notification to teachers and students
- PDF export
- WCAG 2.1 AA accessibility compliance

### Post-MVP Features

**Phase 2 — Growth (Operational Completeness):**
- Absence and cover workflows with approval and notifications
- Delegation requests — teacher-to-teacher lesson swap with approval workflow
- Temporary schedules — exceptional week management with rollback
- Parent read-only timetable access via shared link
- Calendar export (iCal/Google Calendar) for teachers and students
- Holiday calendar integration (public holiday API)
- Template Library — extended community and institution-type template set
- In-app and push notification system for timetable changes
- Workload and constraint satisfaction reporting
- Comment/flag on timetable draft (Principal workflow)
- Audit trail of timetable changes

**Phase 3 — Vision (AI Layer):**
- AI Scheduling Assistant with NLP-driven rule creation
- Autonomous schedule generation from natural language briefs
- Predictive conflict warnings and optimisation suggestions
- SIS/LMS integration for data import/export
- REST API for Enterprise tier and third-party integrations
- Multi-campus / school district account support

### Risk Mitigation Strategy

**Technical Risks:** The constraint solver is the critical dependency — real-world school configurations may exceed solver performance targets. Mitigation: validate solver performance with realistic sizes (100 teachers, 60 classes) early in development; implement sensitivity dial early as a fallback for unsolvable configurations.

**Market Risks:** Institutions may be reluctant to trust a new platform with a high-stakes operational process. Mitigation: free trial with full features removes financial risk; onboarding wizard and Templates reduce setup friction; target early adopters willing to run SchediFlow in parallel with existing tools for the first term.

**Scope Risks:** Iterative workspace UX complexity could expand scope during development. Mitigation: build the simplest viable pin-and-regenerate interaction first; defer advanced grid manipulation to Phase 2 if needed.

## Functional Requirements

This is the capability contract for SchediFlow MVP. Every capability listed here will exist in the product; any capability not listed will not be built without an explicit PRD update.

### Institution Setup & Configuration

- **FR1:** A Timetabler can configure institution-wide terminology — renaming domain concepts to match how the institution refers to them (e.g. "Period" → "Lesson", "Class" → "Form Group")
- **FR2:** A Timetabler can define the Bell Schedule — the set of named periods per day and their time slots
- **FR3:** A Timetabler can define the Cycle — the repeating pattern of school days (e.g. 5-day week, 10-day fortnight, block schedule)
- **FR4:** A Timetabler can create and manage academic Terms with defined start and end dates
- **FR5:** A Timetabler can initialise institution configuration from a pre-built Template that pre-populates Bell Schedule, Cycle, and common settings for their institution type

### People & Resource Management

- **FR6:** A Timetabler can create and manage teacher records including name, contact details, and subject qualifications
- **FR7:** A Timetabler can import teacher records in bulk via CSV upload
- **FR8:** A Timetabler can create and manage class records (student groups to be scheduled)
- **FR9:** A Timetabler can create and manage subjects, including assigning a difficulty level to each subject
- **FR10:** A Timetabler can create and manage room records including capacity and room type
- **FR11:** A Teacher can manage their own profile including name, contact details, and subject qualifications

### Constraint & Preference Management

- **FR12:** A Timetabler can define hard constraints — rules the scheduler must not violate (e.g. a teacher cannot be double-booked)
- **FR13:** A Timetabler can define soft preferences with configurable weights — rules the scheduler will try to satisfy proportionally to their assigned weight (e.g. Teacher A prefers Fridays free, weight 8/10)
- **FR14:** A Timetabler can define subject-level scheduling rules such as maximum occurrences of high-difficulty subjects per day per class
- **FR15:** A Teacher can declare their availability — marking specific slots as unavailable (Forbidden Slots) or preferred
- **FR16:** A Timetabler can view all teacher availability declarations and override individual entries

### Schedule Generation

- **FR17:** A Timetabler can run the schedule generator to produce a complete draft timetable for a term
- **FR18:** The system produces a constraint satisfaction report alongside each generated schedule, showing the percentage of soft preferences satisfied and any unmet hard constraints
- **FR19:** The system detects constraint conflicts that prevent generation and presents a plain-language explanation identifying the conflicting teachers, classes, and slots
- **FR20:** A Timetabler can adjust constraint sensitivity — downgrading specific hard constraints to soft preferences at runtime without modifying the original constraint definition

### Iterative Schedule Workspace

- **FR21:** A Timetabler can view the generated schedule in a grid layout showing teachers, classes, subjects, rooms, and time slots
- **FR22:** A Timetabler can pin specific slots to lock them from modification in subsequent generator runs
- **FR23:** A Timetabler can manually assign a lesson to a specific slot for a specific teacher, class, or room
- **FR24:** The system detects conflicts created by manual slot assignments and suggests alternative valid slots
- **FR25:** A Timetabler can re-run the generator on unpinned slots only, preserving all pinned and manually assigned slots
- **FR26:** A Timetabler can unpin a slot and return it to unassigned state for inclusion in the next generator run

### Timetable Publishing & Distribution

- **FR27:** A Timetabler can publish a timetable, making it visible to Teachers, Students, and all authorised roles
- **FR28:** The system notifies Teachers and Students via email when a timetable is published or when changes affecting them are made to a published timetable
- **FR29:** A Teacher can view their personal timetable showing all assigned lessons, subjects, rooms, and periods
- **FR30:** A Teacher can view the full timetable grid for all teachers in read-only mode
- **FR31:** A Student can view their personal timetable showing all lessons, subjects, teachers, and rooms
- **FR32:** A Timetabler can export the timetable as a PDF document

### Access Control & Identity

- **FR33:** A Timetabler can invite Teachers to the institution via email; Teachers complete onboarding via a magic link without prior account creation
- **FR34:** A Timetabler can assign one or more roles to any user within the institution (Timetabler, Teacher, Moderator, Principal); users may hold multiple roles simultaneously
- **FR35:** A Timetabler can create Student accounts and associate each student with a class
- **FR36:** The system enforces role-based access control — users can only perform actions permitted by their assigned roles
- **FR37:** The system enforces multi-tenant data isolation — users of one institution cannot access data of another institution
- **FR38:** The system enforces subscription tier limits — restricting class count, teacher count, and term count per the institution's active subscription tier

### Reporting & Visibility

- **FR39:** A Principal or Timetabler can view a workload report showing total periods per teacher, free period distribution, and preference satisfaction rate across the published timetable
- **FR40:** A Timetabler can view a constraint satisfaction summary after each generator run showing which soft preferences were fully satisfied, partially satisfied, or not satisfied

## Non-Functional Requirements

### Performance

- **NFR1:** The schedule generator must return a result within 30 seconds for institutions with up to 100 teachers, 60 classes, and a 5-day cycle — or return a clear conflict report if no valid schedule can be produced
- **NFR2:** All user-facing page loads must complete within 2 seconds under normal load conditions
- **NFR3:** Manual slot operations in the iterative workspace (pin, assign, unpin) must reflect in the UI within 500ms
- **NFR4:** The system must support at least 50 concurrent active users per institution without degradation in response time

### Security

- **NFR5:** All data must be encrypted in transit (TLS 1.2+) and at rest
- **NFR6:** Multi-tenant isolation must be enforced at the data layer — queries scoped to the authenticated user's institution; no cross-tenant data access permissible through any code path
- **NFR7:** Authentication tokens must expire after a configurable inactivity period; magic-link tokens must be single-use and expire within 24 hours
- **NFR8:** All role-based access control checks must be enforced server-side; client-side UI restrictions are supplementary only
- **NFR9:** Passwords must be stored as salted hashes using a modern algorithm (e.g. bcrypt, Argon2)

### Scalability

- **NFR10:** The system architecture must support horizontal scaling of the application tier to accommodate growth from 100 to 10,000+ institutions without architectural redesign
- **NFR11:** The scheduling engine must be deployable as an isolated service to allow independent scaling during peak term-planning periods
- **NFR12:** Database schema and query design must support at least 10,000 concurrent institution tenants without performance degradation from multi-tenancy overhead
- **NFR13:** Platform uptime must be ≥99.5% measured monthly, excluding pre-announced maintenance windows

### Accessibility

- **NFR14:** All user-facing interfaces must conform to WCAG 2.1 Level AA
- **NFR15:** The timetable grid view must be navigable by keyboard without requiring mouse interaction
- **NFR16:** All form inputs, error messages, and status indicators must be compatible with screen readers (correct ARIA labelling, landmark roles, live regions for dynamic updates)
- **NFR17:** Colour must not be the sole means of conveying information — all status indicators (constraint satisfied / violated, slot pinned / unpinned) must include text or icon differentiation
