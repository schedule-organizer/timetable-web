# Story 11 - AI Scheduling Assistant (Phase 2)

### E11-001: Natural Language Setup [FULL] [P2] [8 points]

**As a** Timetabler
**I want** to describe my scheduling needs in plain language
**So that** the system can configure itself without manual setup

**Acceptance Criteria:**
- Given I am setting up a new institution
- When I describe my school structure in natural language (e.g., "We have 30 teachers, 25 classes, 8 periods per day, 5 days per week")
- Then the AI extracts key information and suggests configuration
- And I can review and confirm the suggested setup
- And the system creates the basic structure automatically

**Technical Requirements:**
- LLM integration (OpenAI, Anthropic, or local model)
- Prompt engineering for entity extraction
- Validation of extracted data
- Confirmation step before applying

**UX Requirements:**
- Chat-like interface for input
- Structured preview of extracted data
- Edit extracted values before applying
- Fallback to manual setup if AI fails

---

### E11-002: AI Constraint Conflict Resolution [FULL] [P2] [8 points]

**As a** Timetabler
**I want** AI assistance when the engine cannot find a valid solution
**So that** I can understand what's wrong and how to fix it

**Acceptance Criteria:**
- Given the scheduling engine fails to find a valid solution
- When I ask the AI for help
- Then it analyzes the constraints and identifies conflicts
- And it suggests specific changes (e.g., "Reduce Math hours for Class 5A by 1" or "Add one more qualified teacher for Science")
- And I can apply suggestions with one click

**Technical Requirements:**
- Constraint conflict analysis algorithm
- LLM integration for natural language explanations
- Suggestion generation based on conflict type
- One-click application of suggestions

**UX Requirements:**
- AI assistant panel in engine view
- Natural language explanation of conflicts
- Ranked suggestions (most likely to help first)
- Apply suggestion button
- Feedback loop (did this help?)

---

### E11-003: AI Timetable Quality Improvement [FULL] [P2] [5 points]

**As a** Timetabler
**I want** AI suggestions to improve timetable quality
**So that** I can optimize the schedule beyond just validity

**Acceptance Criteria:**
- Given I have a valid timetable with low quality score
- When I ask the AI for improvement suggestions
- Then it analyzes the schedule and suggests optimizations
- And suggestions focus on: balancing teacher workload, improving subject spread, reducing student idle time
- And I can preview the impact of each suggestion

**Technical Requirements:**
- Quality analysis algorithm
- Suggestion generation based on quality metrics
- Impact simulation (what-if analysis)
- LLM for natural language explanations

**UX Requirements:**
- AI suggestions panel
- Impact preview (before/after quality score)
- Apply suggestion button
- Undo option

---

## 4. Story Summary by Priority

### P0 (MVP) - 41 stories, ~180 points
- E1: Platform Foundation (8 stories, 33 points)
- E2: Institution Setup (6 stories, 23 points)
- E3: Resource Management (6 stories, 33 points)
- E4: Holiday Calendar (1 story, 5 points)
- E5: Timetable Workspace (7 stories, 39 points)
- E6: Scheduling Engine (9 stories, 35 points)
- E7: Publishing (4 stories, 13 points)
- E8: Daily Operations (6 stories, 24 points)
- E9: Notifications (4 stories, 14 points)

### P1 (Post-MVP) - 7 stories, ~21 points
- E10: Reporting (7 stories, 21 points)

### P2 (Phase 2) - 3 stories, ~21 points
- E11: AI Assistant (3 stories, 21 points)

**Total: 51 stories, ~222 points**

---

## 5. Next Steps

1. **Backlog Refinement**: Review each story with engineering team to validate technical requirements and story points
2. **Acceptance Criteria Expansion**: Add specific test scenarios for each story
3. **Backend Story Creation**: Create corresponding backend stories for [FULL] stories
4. **Sprint Planning**: Group stories into 2-week sprints based on dependencies
5. **Design Mockups**: Create UI mockups for key user flows
6. **API Contract Finalization**: Ensure all endpoints are documented in API spec

---

## Document Information

| Field | Value |
|---|---|
| Document Type | User Stories |
| Product | SchediFlow |
| Version | 1.0 |
| Date | March 2026 |
| Total Stories | 51 |
| Total Story Points | ~222 |
| Sources | MRD v1.0, Epics v1.0, Frontend Architecture v1.2 |

---

*This document provides detailed user stories ready for sprint planning and development. Each story should be further refined during backlog grooming sessions with the development team.*
