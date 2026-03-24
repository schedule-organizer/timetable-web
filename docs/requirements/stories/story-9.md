# Story 9 - Notifications & Preference Management

### E9-001: Notification Center [FULL] [P0] [5 points]

**As a** user
**I want** to see all my notifications in one place
**So that** I don't miss important timetable changes

**Acceptance Criteria:**
- Given I am logged in
- When I click the notification bell icon
- Then I see a dropdown list of recent notifications
- And unread notifications are highlighted
- And I can mark notifications as read
- And I can click a notification to navigate to the relevant page
- And I see an unread count badge on the bell icon

**Technical Requirements:**
- WebSocket subscription to `/user/queue/personal` and `/topic/tenant/{tenantId}/notifications`
- Notification types: TIMETABLE_PUBLISHED, COVER_ASSIGNED, DELEGATION_APPROVED, DELEGATION_REJECTED, LESSON_CHANGED
- Zustand notificationStore for unread count
- GET `/api/v1/notifications` for notification history

**UX Requirements:**
- Bell icon with unread badge
- Dropdown with scrollable list (max 10 recent)
- "Mark all as read" button
- Click notification to navigate and mark as read
- Empty state when no notifications

---

### E9-002: Real-Time Notification Delivery [FULL] [P0] [3 points]

**As a** user
**I want** to receive notifications in real-time
**So that** I'm immediately informed of changes

**Acceptance Criteria:**
- Given I am logged in and the app is open
- When a relevant event occurs (e.g., timetable published, cover assigned)
- Then I receive a notification instantly via WebSocket
- And a toast appears briefly
- And the notification is added to my notification center
- And the unread count increments

**Technical Requirements:**
- WebSocket message handling for notification events
- Toast notification using Sonner library
- Notification persisted to database
- Unread count updated in notificationStore

**UX Requirements:**
- Toast appears in top-right corner
- Auto-dismiss after 5 seconds
- Click toast to navigate to relevant page
- Sound/vibration option (user preference)

---

### E9-003: Email Notification Delivery [BE] [P0] [3 points]

**As a** user
**I want** to receive important notifications via email
**So that** I'm informed even when not using the app

**Acceptance Criteria:**
- Given I have email notifications enabled
- When a high-priority event occurs (e.g., cover assigned to me, timetable published)
- Then I receive an email notification
- And the email contains relevant details and a link to the app
- And I can unsubscribe from email notifications

**Technical Requirements:**
- Email service integration (SMTP or SendGrid)
- Email templates for each notification type
- Notification priority levels (HIGH, MEDIUM, LOW)
- Only HIGH priority triggers email by default
- Unsubscribe link in email footer

**UX Requirements:**
- HTML email templates with branding
- Clear subject lines
- Mobile-friendly email layout
- One-click link to relevant page

---

### E9-004: Notification Preferences [FULL] [P0] [3 points]

**As a** user
**I want** to control which notifications I receive
**So that** I'm not overwhelmed by alerts

**Acceptance Criteria:**
- Given I am logged in
- When I navigate to Settings > Notifications
- Then I see a list of notification types
- And I can toggle each type on/off for in-app and email
- And I can set quiet hours (no notifications during specific times)
- And my preferences are saved and respected

**Technical Requirements:**
- GET/PUT `/api/v1/users/me/notification-preferences` endpoint
- Preferences stored per user
- Notification types: TIMETABLE_PUBLISHED, COVER_ASSIGNED, DELEGATION_UPDATE, LESSON_CHANGED, SYSTEM_ANNOUNCEMENT
- Channels: IN_APP, EMAIL, (future: SMS, PUSH)
- Quiet hours: start_time, end_time

**UX Requirements:**
- Toggle switches for each notification type × channel
- Grouped by category (Timetable, Cover, Delegation, System)
- Quiet hours time picker
- Save button with confirmation
- Preview of current settings

---
