# Story 1 - Platform Foundation & Secure Access

### E1-001: Institution Registration [FULL] [P0] [5 points]

**As a** School Administrator  
**I want** to register my institution with basic details  
**So that** I can start using SchediFlow for my school

**Acceptance Criteria:**
- Given I am on the registration page
- When I provide institution name, country, email, and password
- Then my institution account is created
- And I receive a confirmation email
- And I am redirected to the onboarding wizard
- And my role is automatically set to Admin

**Technical Requirements:**
- POST `/api/v1/auth/register` endpoint
- Email validation and uniqueness check
- Password strength requirements (min 8 chars, 1 uppercase, 1 number)
- JWT token generation on successful registration
- Tenant record created in multi-tenant database

**UX Requirements:**
- Clear error messages for validation failures
- Loading state during registration
- Success confirmation before redirect

---

### E1-002: User Login [FULL] [P0] [3 points]

**As a** registered user  
**I want** to log in with my email and password  
**So that** I can access my institution's timetable system

**Acceptance Criteria:**
- Given I have a registered account
- When I enter valid credentials
- Then I am logged in and redirected to my role-appropriate dashboard
- And my session persists across browser refreshes
- And invalid credentials show a clear error message

**Technical Requirements:**
- POST `/api/v1/auth/login` endpoint
- JWT access token (15 min expiry) and refresh token (7 day expiry)
- Axios interceptor attaches token to all requests
- 401 response triggers automatic token refresh
- Zustand authStore manages authentication state

**UX Requirements:**
- "Remember me" checkbox for extended sessions
- "Forgot password" link (future story)
- Loading spinner during authentication
- Accessible form with proper labels and ARIA attributes

---

### E1-003: Teacher Invitation [FULL] [P0] [5 points]

**As an** Admin or Moderator  
**I want** to invite teachers to join the platform  
**So that** they can manage their profiles and view their timetables

**Acceptance Criteria:**
- Given I am logged in as Admin or Moderator
- When I navigate to User Management and click "Invite Teacher"
- And I provide teacher's email and optional name
- Then an invitation email is sent with a unique registration link
- And the teacher appears in the user list with "Pending" status
- And the invitation expires after 7 days

**Technical Requirements:**
- POST `/api/v1/users/invite` endpoint
- Generate unique, time-limited invitation token
- Email template with registration completion link
- Token validation on registration completion page

**UX Requirements:**
- Bulk invite option (CSV upload) for large staff lists
- Copy invitation link to clipboard option
- Resend invitation button for expired invites
- Clear pending vs. active status indicators

---

### E1-004: Teacher Registration Completion [FULL] [P0] [4 points]

**As an** invited teacher  
**I want** to complete my registration using the invitation link  
**So that** I can access my timetable and manage my profile

**Acceptance Criteria:**
- Given I received an invitation email
- When I click the registration link
- Then I am taken to a registration completion page
- And I can set my password and complete my profile (name, avatar, bio)
- And my account is activated with Teacher role
- And I am redirected to my personal timetable view

**Technical Requirements:**
- POST `/api/v1/auth/complete-registration` endpoint
- Token validation and expiry check
- Password creation with strength requirements
- Avatar upload (optional, multipart/form-data)
- User status updated from PENDING to ACTIVE

**UX Requirements:**
- Token expiry message with request new invite option
- Avatar upload with preview
- Optional fields clearly marked
- Welcome message after successful registration

---

### E1-005: Profile Management [FULL] [P0] [5 points]

**As a** user of any role
**I want** to view and edit my profile
**So that** I can keep my information current and personalize my account

**Acceptance Criteria:**
- Given I am logged in
- When I navigate to my profile page
- Then I can view my current profile information
- And I can edit my name, avatar, bio, and contact preferences
- And changes are saved and reflected immediately
- And I can see my role and institution name (read-only)

**Technical Requirements:**
- GET/PUT `/api/v1/users/me` endpoints
- Avatar upload with image validation (max 2MB, jpg/png only)
- Image resizing on backend to 200x200px
- Optimistic update in UI with rollback on error

**UX Requirements:**
- Avatar preview before upload
- Unsaved changes warning when navigating away
- Success toast on save
- Accessible form with proper validation messages

---

### E1-006: Role-Based Access Control [FULL] [P0] [3 points]

**As a** system
**I want** to enforce role-based permissions
**So that** users can only access features appropriate to their role

**Acceptance Criteria:**
- Given I am logged in with a specific role
- When I attempt to access a protected route
- Then I am granted access if my role has permission
- And I am redirected to 403 page if I lack permission
- And navigation menu only shows routes I can access

**Technical Requirements:**
- Backend: Spring Security role-based authorization on all endpoints
- Frontend: `<RoleGuard>` component wraps protected routes
- `usePermission` hook for conditional UI rendering
- Role hierarchy: Admin > Moderator > Teacher > Student > Parent

**UX Requirements:**
- Clear 403 error page with explanation
- Navigation menu dynamically filtered by role
- Disabled state for actions user cannot perform

---

### E1-007: Session Management & Auto-Refresh [FE] [P0] [3 points]

**As a** logged-in user
**I want** my session to remain active while I'm using the app
**So that** I don't get logged out unexpectedly

**Acceptance Criteria:**
- Given I am logged in and actively using the app
- When my access token expires (15 minutes)
- Then the system automatically refreshes it using my refresh token
- And I continue working without interruption
- And if refresh fails, I am redirected to login with a clear message

**Technical Requirements:**
- Axios interceptor detects 401 responses
- Automatic POST `/api/v1/auth/refresh` with refresh token
- New access token stored in authStore
- Failed requests retried with new token
- Refresh token expiry (7 days) triggers logout

**UX Requirements:**
- No visible interruption during token refresh
- Clear "Session expired" message on refresh failure
- Option to "Stay logged in" extends refresh token to 30 days

---

### E1-008: User Management Page [FULL] [P0] [4 points]

**As an** Admin or Moderator
**I want** to view and manage all users in my institution
**So that** I can control access and assign appropriate roles

**Acceptance Criteria:**
- Given I am logged in as Admin or Moderator
- When I navigate to User Management
- Then I see a paginated list of all users
- And I can filter by role and status (Active/Pending/Deactivated)
- And I can search by name or email
- And I can change user roles (Admin only)
- And I can deactivate users (Admin only)

**Technical Requirements:**
- GET `/api/v1/users` with pagination, filtering, sorting
- PUT `/api/v1/users/{id}/role` endpoint (Admin only)
- DELETE `/api/v1/users/{id}` soft-delete endpoint (Admin only)
- TanStack Table for data grid
- React Query for data fetching and cache management

**UX Requirements:**
- Role badges with color coding
- Confirmation dialog for role changes and deactivation
- Bulk actions for multiple users
- Export user list to CSV

---

## Access model clarification

The current product direction introduces a few rules that apply across the auth and user-management flows:

- The first institution account is created automatically as the initial `Sys Admin` and is immutable.
- Teachers are the only role that can self-register, and that registration is subject to approval by `Sys Admin` or `Moderator`.
- Teacher invitation still exists for staff onboarding, but approval/status handling must stay visible in the user list.
- User accounts may hold multiple roles at once.
- If a user logs in without choosing a role, the highest available role is used.
- If a user has multiple roles, the header should expose a role switcher so they can change the active role after login.
- Teacher code / staff number is managed by `Sys Admin` and is not self-edited by teachers.

---
