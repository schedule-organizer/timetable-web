---
stepsCompleted:
  - step-01-document-discovery
  - step-02-prd-analysis
  - step-03-epic-coverage-validation
  - step-04-ux-alignment
  - step-05-epic-quality-review
  - step-06-final-assessment
documentsInventoried:
  prd: _bmad-output/planning-artifacts/prd.md
  architecture: null
  epics: null
  ux: _bmad-output/planning-artifacts/ux-design-specification.md
---

# Implementation Readiness Assessment Report

**Date:** 2026-03-27
**Project:** timetable-web (SchediFlow)

## PRD Analysis

### Functional Requirements

**Institution Setup & Configuration**
- FR1: A Timetabler can configure institution-wide terminology — renaming domain concepts to match how the institution refers to them
- FR2: A Timetabler can define the Bell Schedule — the set of named periods per day and their time slots
- FR3: A Timetabler can define the Cycle — the repeating pattern of school days
- FR4: A Timetabler can create and manage academic Terms with defined start and end dates
- FR5: A Timetabler can initialise institution configuration from a pre-built Template that pre-populates Bell Schedule, Cycle, and common settings

**People & Resource Management**
- FR6: A Timetabler can create and manage teacher records including name, contact details, and subject qualifications
- FR7: A Timetabler can import teacher records in bulk via CSV upload
- FR8: A Timetabler can create and manage class records (student groups to be scheduled)
- FR9: A Timetabler can create and manage subjects, including assigning a difficulty level to each subject
- FR10: A Timetabler can create and manage room records including capacity and room type
- FR11: A Teacher can manage their own profile including name, contact details, and subject qualifications

**Constraint & Preference Management**
- FR12: A Timetabler can define hard constraints — rules the scheduler must not violate
- FR13: A Timetabler can define soft preferences with configurable weights
- FR14: A Timetabler can define subject-level scheduling rules such as maximum occurrences of high-difficulty subjects per day per class
- FR15: A Teacher can declare their availability — marking specific slots as unavailable (Forbidden Slots) or preferred
- FR16: A Timetabler can view all teacher availability declarations and override individual entries

**Schedule Generation**
- FR17: A Timetabler can run the schedule generator to produce a complete draft timetable for a term
- FR18: The system produces a constraint satisfaction report alongside each generated schedule
- FR19: The system detects constraint conflicts that prevent generation and presents a plain-language explanation
- FR20: A Timetabler can adjust constraint sensitivity — downgrading specific hard constraints to soft preferences at runtime

**Iterative Schedule Workspace**
- FR21: A Timetabler can view the generated schedule in a grid layout
- FR22: A Timetabler can pin specific slots to lock them from modification in subsequent generator runs
- FR23: A Timetabler can manually assign a lesson to a specific slot for a specific teacher, class, or room
- FR24: The system detects conflicts created by manual slot assignments and suggests alternative valid slots
- FR25: A Timetabler can re-run the generator on unpinned slots only, preserving all pinned and manually assigned slots
- FR26: A Timetabler can unpin a slot and return it to unassigned state

**Timetable Publishing & Distribution**
- FR27: A Timetabler can publish a timetable, making it visible to Teachers, Students, and all authorised roles
- FR28: The system notifies Teachers and Students via email when a timetable is published or when changes are made
- FR29: A Teacher can view their personal timetable showing all assigned lessons, subjects, rooms, and periods
- FR30: A Teacher can view the full timetable grid for all teachers in read-only mode
- FR31: A Student can view their personal timetable showing all lessons, subjects, teachers, and rooms
- FR32: A Timetabler can export the timetable as a PDF document

**Access Control & Identity**
- FR33: A Timetabler can invite Teachers via email; Teachers complete onboarding via a magic link without prior account creation
- FR34: A Timetabler can assign one or more roles to any user; users may hold multiple roles simultaneously
- FR35: A Timetabler can create Student accounts and associate each student with a class
- FR36: The system enforces role-based access control
- FR37: The system enforces multi-tenant data isolation
- FR38: The system enforces subscription tier limits

**Reporting & Visibility**
- FR39: A Principal or Timetabler can view a workload report showing total periods per teacher, free period distribution, and preference satisfaction rate
- FR40: A Timetabler can view a constraint satisfaction summary after each generator run

**Total FRs: 40**

### Non-Functional Requirements

**Performance**
- NFR1: Schedule generator returns result within 30 seconds for up to 100 teachers, 60 classes, 5-day cycle
- NFR2: All user-facing page loads complete within 2 seconds under normal load
- NFR3: Manual slot operations reflect in UI within 500ms
- NFR4: System supports at least 50 concurrent active users per institution without degradation

**Security**
- NFR5: All data encrypted in transit (TLS 1.2+) and at rest
- NFR6: Multi-tenant isolation enforced at data layer — no cross-tenant access permissible
- NFR7: Auth tokens expire after configurable inactivity; magic-link tokens single-use, expire within 24 hours
- NFR8: All RBAC checks enforced server-side
- NFR9: Passwords stored as salted hashes (bcrypt, Argon2)

**Scalability**
- NFR10: Architecture supports horizontal scaling from 100 to 10,000+ institutions without redesign
- NFR11: Scheduling engine deployable as isolated service for independent scaling
- NFR12: Database supports 10,000 concurrent institution tenants without multi-tenancy overhead
- NFR13: Platform uptime ≥99.5% monthly, excluding pre-announced maintenance

**Accessibility**
- NFR14: All user-facing interfaces conform to WCAG 2.1 Level AA
- NFR15: Timetable grid navigable by keyboard without mouse
- NFR16: All form inputs, errors, and status indicators compatible with screen readers
- NFR17: Colour not sole means of conveying information — all indicators include text or icon differentiation

**Total NFRs: 17**

### Additional Requirements

**Tenant & Subscription Constraints:**
- One account per institution (no cross-institution accounts in MVP)
- Subscription tier limits: Starter (20 classes, 30 teachers, 2 terms), Professional (100 classes, 200 teachers, unlimited terms), Enterprise (unlimited)
- Tier limits enforced server-side

**Integration Constraints (MVP):**
- CSV import for teacher and student data
- iCal and PDF export for timetables
- Email notifications only (no push/in-app in MVP)

**Regulatory:**
- Privacy policy required at launch
- Regulatory compliance (GDPR, FERPA, COPPA) deferred to market expansion milestone

### PRD Completeness Assessment

The PRD is comprehensive and well-structured. All required BMAD sections are present: Executive Summary, Success Criteria, Product Scope, User Journeys (6), Domain Requirements, Innovation Analysis, SaaS B2B Requirements, Project Scoping, Functional Requirements (40 FRs), and Non-Functional Requirements (17 NFRs). Requirements are specific, measurable, and implementation-agnostic. Traceability from user journeys to FRs is established via the Journey Requirements Summary table.

## Epic Coverage Validation

### Coverage Matrix

No epics document exists. Epic breakdown has not yet been performed.

### Coverage Statistics

- Total PRD FRs: 40
- FRs covered in epics: 0 (no epics created yet)
- Coverage percentage: N/A — epics not yet created

### Note

This is the expected state immediately after PRD completion. Epic breakdown is the next required planning step.

## UX Alignment Assessment

### UX Document Status

Found: `_bmad-output/planning-artifacts/ux-design-specification.md` — **Initialization only (step-01-init completed)**

The UX workflow was started and the PRD was correctly listed as an input document. However, no UX content has been generated yet — the document contains only the initial header and frontmatter placeholder.

### Alignment Issues

No alignment issues can be assessed — UX content has not been produced yet.

### Warnings

- ⚠️ UX design work is planned but not yet started. The PRD contains 6 detailed user journeys and a timetable grid workspace (FR21–FR26) that will require significant UX design effort before architecture decisions can be finalized.
- ⚠️ The iterative schedule workspace (pin/adjust/regenerate) is the core differentiator and the most UX-complex feature. Architecture decisions about state management and real-time updates depend on UX decisions here.

## Epic Quality Review

**N/A** — No epics or stories exist yet. Review cannot be performed.

## Summary and Recommendations

### Overall Readiness Status

**READY TO PROCEED TO NEXT PLANNING PHASE**

The PRD is complete, well-structured, and ready to feed downstream planning work. The project is at the correct point in the BMAD workflow.

### Critical Issues

None. No critical issues found in the PRD.

### Warnings Requiring Attention Before Implementation

1. **UX Design not yet started** — The UX specification was initialized but contains no content. Before architecture decisions are finalized, UX design is needed — especially for the iterative schedule workspace (FR21–FR26), which is the core product differentiator and has significant interaction design complexity.

2. **Epics & Stories not created** — All 40 FRs are unallocated to epics. Epic breakdown is required before development can begin.

3. **Architecture not defined** — No technical architecture document exists. Given the scheduling engine performance requirements (NFR1: 30s for 100 teachers/60 classes) and scalability targets (NFR10–NFR12), architecture decisions — particularly around the constraint solver and multi-tenant data model — will have high impact on implementation approach.

### Recommended Next Steps

1. **Run `bmad-create-ux-design`** — Complete the UX design specification, prioritizing the iterative schedule workspace and timetabler flows (J1–J3). UX decisions will inform architecture.

2. **Run `bmad-create-architecture`** — Design the technical architecture with focus on: constraint solver selection/design, multi-tenant data isolation pattern, scheduling engine as isolated service (NFR11), and real-time workspace state management.

3. **Run `bmad-create-epics-and-stories`** — Break down the 40 FRs into epics and stories. Recommended epic groupings based on PRD structure:
   - Epic 1: Institution setup & onboarding (FR1–FR5, FR33–FR35)
   - Epic 2: People & resource management (FR6–FR11)
   - Epic 3: Constraint & preference management (FR12–FR16)
   - Epic 4: Schedule generation engine (FR17–FR20)
   - Epic 5: Iterative schedule workspace (FR21–FR26)
   - Epic 6: Timetable publishing & distribution (FR27–FR32)
   - Epic 7: Access control, roles & multi-tenancy (FR36–FR38)
   - Epic 8: Reporting & visibility (FR39–FR40)

4. **Re-run implementation readiness check** after UX, Architecture, and Epics are complete for a full assessment.

### Final Note

This assessment found **0 critical issues** and **3 warnings** across 4 categories. The PRD is in excellent shape — comprehensive, traceable, and well-scoped. The warnings are all expected at this stage of the planning workflow. Proceed to UX design and architecture before epic breakdown.
