# Story 6 - Scheduling Engine Control, Quality, and Manual Adjustment

### E6-001: Run Scheduling Engine [FULL] [P0] [6 points]

**As a** Timetabler
**I want** to run the automated scheduling engine
**So that** I can generate a timetable without manual placement

**Acceptance Criteria:**
- Given I have configured all resources (classes, teachers, subjects, rooms)
- When I click "Generate Timetable"
- Then the scheduling engine starts a background job
- And I see a progress panel with real-time updates
- And I can cancel the job if needed
- And when complete, I see the generated timetable and quality score

**Technical Requirements:**
- POST `/api/v1/engine/run` endpoint
- Background job processing (Spring @Async or job queue)
- WebSocket updates to `/topic/solver/{jobId}/progress`
- Job status: QUEUED, RUNNING, COMPLETED, FAILED, CANCELLED
- Quality score calculation (0-100)

**UX Requirements:**
- Confirmation dialog before starting (warns about overwriting)
- Progress panel showing: elapsed time, current score, hard violations
- Cancel button with confirmation
- Success/failure notification
- Automatic redirect to timetable view on completion

---

### E6-002: Sensitivity Dial [FE] [P0] [3 points]

**As a** Timetabler
**I want** to adjust the scheduling engine's sensitivity
**So that** I can relax constraints if the engine cannot find a valid solution

**Acceptance Criteria:**
- Given I am about to run the scheduling engine
- When I adjust the sensitivity dial
- Then I can choose from: Strict, Balanced, Lenient, Minimal
- And I see an explanation of what each level means
- And the engine uses the selected sensitivity level
- And I can see which constraints are relaxed at each level

**Technical Requirements:**
- Sensitivity levels map to constraint weight multipliers
- Strict: all soft constraints at 100%
- Balanced: soft constraints at 70%
- Lenient: soft constraints at 40%
- Minimal: soft constraints at 10%
- Sensitivity parameter sent with engine run request

**UX Requirements:**
- Segmented button group (not a slider)
- Tooltip explaining each level
- Recommended level highlighted (Balanced)
- Warning if selecting Minimal
- Constraint weight preview table

---

### E6-003: Generator Progress Panel [FE] [P0] [4 points]

**As a** Timetabler
**I want** to see real-time progress while the engine runs
**So that** I know the job is working and can estimate completion time

**Acceptance Criteria:**
- Given the scheduling engine is running
- When I view the progress panel
- Then I see: elapsed time, current score, hard violations count, progress percentage
- And the score updates in real-time via WebSocket
- And I can see a score trend chart
- And I can cancel the job at any time

**Technical Requirements:**
- WebSocket subscription to `/topic/solver/{jobId}/progress`
- Progress updates every 2-5 seconds
- Score format: `-3hard / 0medium / -12soft`
- Progress percentage based on iteration count or time limit

**UX Requirements:**
- Animated progress bar
- Score trend line chart (Recharts)
- Elapsed time counter
- Cancel button always visible
- Estimated time remaining (if calculable)

---

### E6-004: Quality Score Card [FE] [P0] [3 points]

**As a** Timetabler
**I want** to see a quality score for the generated timetable
**So that** I can assess how well it meets our constraints

**Acceptance Criteria:**
- Given the scheduling engine has completed
- When I view the timetable
- Then I see an overall quality score (0-100)
- And I see a breakdown by constraint category
- And I can click each category to see which constraints contributed
- And I can see a comparison to previous runs

**Technical Requirements:**
- Quality score calculated from constraint violations
- Score = 100 - (hard_penalty + medium_penalty + soft_penalty)
- Breakdown by category: Teacher Workload, Room Utilization, Subject Spread, etc.
- Historical scores stored for comparison

**UX Requirements:**
- Ring chart showing score with color coding (green >80, yellow 60-80, red <60)
- Breakdown table with category scores
- Expandable details for each category
- Trend chart comparing last 5 runs

---

### E6-005: Drag-and-Drop Lesson Movement [FE] [P0] [8 points]

**As a** Timetabler
**I want** to drag lesson cards to different time slots
**So that** I can manually adjust the generated timetable

**Acceptance Criteria:**
- Given I am viewing the timetable
- When I drag a lesson card to a different cell
- Then the card moves instantly (optimistic update)
- And the backend is notified of the change
- And conflicts are detected and highlighted
- And if the move is invalid, it rolls back with an error message
- And other users see the change in real-time

**Technical Requirements:**
- dnd-kit library for drag-and-drop
- PATCH `/api/v1/lessons/{id}` with new periodSlotId and roomId
- Optimistic update via React Query cache mutation
- Rollback on error
- WebSocket broadcast of LESSON_UPDATED event
- Conflict detection on backend

**UX Requirements:**
- Smooth drag animation
- Drop zone highlighting
- Invalid drop zones grayed out
- Conflict warning before confirming move
- Undo button for recent moves
- Keyboard alternative (arrow keys + Enter)

---

### E6-006: Pin and Unpin Lessons [FULL] [P0] [3 points]

**As a** Timetabler
**I want** to pin specific lessons to their current time slots
**So that** the engine doesn't move them during regeneration

**Acceptance Criteria:**
- Given I am viewing the timetable
- When I right-click a lesson and select "Pin"
- Then the lesson is marked as pinned with a lock icon
- And the lesson cannot be moved by the scheduling engine
- And I can manually move pinned lessons
- And I can unpin lessons at any time

**Technical Requirements:**
- POST/DELETE `/api/v1/lessons/{id}/pin` endpoints
- Lesson.isPinned boolean field
- Engine respects pinned lessons as hard constraints
- WebSocket broadcast of pin state changes

**UX Requirements:**
- Lock icon overlay on pinned lessons
- Pin/Unpin in context menu
- Bulk pin/unpin for multiple lessons
- Visual distinction from unpinned lessons
- Confirmation before unpinning many lessons

---

### E6-007: Lesson Swap [FULL] [P0] [3 points]

**As a** Timetabler
**I want** to swap two lessons' time slots
**So that** I can quickly exchange positions without dragging

**Acceptance Criteria:**
- Given I am viewing the timetable
- When I right-click a lesson and select "Swap"
- Then I enter swap mode and can click another lesson
- And the two lessons exchange time slots
- And conflicts are checked before confirming
- And the swap is rejected if it creates hard constraint violations

**Technical Requirements:**
- POST `/api/v1/lessons/{id}/swap` with target lesson ID
- Backend validates swap doesn't violate hard constraints
- Atomic transaction for both lesson updates
- WebSocket broadcast of both changes

**UX Requirements:**
- Swap mode cursor change
- Highlight valid swap targets
- Confirmation dialog showing before/after
- Cancel swap with Escape key
- Undo swap option

---

### E6-008: Conflict Detection and Display [FULL] [P0] [3 points]

**As a** Timetabler
**I want** to see which lessons have conflicts
**So that** I can fix constraint violations

**Acceptance Criteria:**
- Given I am viewing the timetable
- When a lesson violates a hard constraint
- Then it is marked with a red conflict badge
- And I can click the badge to see conflict details
- And I see suggested resolutions
- And conflicts are recalculated in real-time as I make changes

**Technical Requirements:**
- Backend conflict detection on every lesson change
- Conflict types: Teacher double-booked, Room double-booked, Class double-booked, Teacher unqualified, Room over-capacity
- GET `/api/v1/lessons/{id}/conflicts` endpoint
- Real-time conflict updates via WebSocket

**UX Requirements:**
- Red badge with conflict count
- Popover showing conflict details
- Suggested fixes (e.g., "Move to Period 3" or "Assign different room")
- Filter to show only conflicted lessons
- Conflict summary panel showing all conflicts

---

### E6-009: Constraint Weight Configuration [FULL] [P0] [5 points]

**As a** Timetabler
**I want** to adjust the weight of soft constraints
**So that** the engine prioritizes what matters most to my institution

**Acceptance Criteria:**
- Given I am logged in as Admin or Moderator
- When I navigate to Settings > Constraints
- Then I see a list of all soft constraints
- And I can adjust the weight of each (0-100 slider)
- And I can see which constraints are hard vs. soft
- And I can reset to default weights

**Technical Requirements:**
- Constraint weights stored in tenant_settings
- Constraints grouped by category
- Default weights provided
- Weights affect engine scoring function

**UX Requirements:**
- Grouped constraint list (Teacher, Room, Subject, Student)
- Slider for each soft constraint
- Hard constraints shown as read-only
- Preview of how weights affect scoring
- Save and apply to next engine run

**Mockup References:**
- [Engine hub](../../ux-mockups/engine/index.html)
- [Engine run](../../ux-mockups/engine/run.html)
- [Engine progress](../../ux-mockups/engine/progress.html)
- [Engine quality](../../ux-mockups/engine/quality.html)
- [Moderator engine start state](../../ux-mockups/moderator/engine-start-state.html)
- [Moderator engine progress](../../ux-mockups/moderator/engine-runtime-progress.html)
- [Lesson actions weekly view](../../ux-mockups/moderator/lesson-actions-weekly-view.html)
- [Manual editing hub](../../ux-mockups/moderator/manual-editing/index.html)
- [Manual editing workspace](../../ux-mockups/moderator/manual-editing/edit.html)
- [Pin and swap tools](../../ux-mockups/moderator/manual-editing/pin-swap.html)
- [Conflict review](../../ux-mockups/moderator/manual-editing/conflicts.html)
- [Constraint weights](../../ux-mockups/system-admin/settings/constraints.html)

---
