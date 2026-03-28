import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RouteFallback } from '@/components/layout/RouteFallback'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const PlaceholderPage = lazy(() => import('@/features/shell/pages/PlaceholderPage'))
const SettingsLayout = lazy(() => import('@/features/settings/pages/SettingsLayout'))
const TerminologySettingsPage = lazy(() => import('@/features/settings/pages/TerminologySettingsPage'))
const BellSchedulePage = lazy(() => import('@/features/settings/pages/BellSchedulePage'))
const CycleSettingsPage = lazy(() => import('@/features/settings/pages/CycleSettingsPage'))
const TeacherListPage = lazy(() => import('@/features/teachers/pages/TeacherListPage'))
const MagicLinkOnboardingPage = lazy(() => import('@/features/teachers/pages/MagicLinkOnboardingPage'))
const ClassManagementPage = lazy(() => import('@/features/classes/pages/ClassManagementPage'))
const RoleManagementPage = lazy(() => import('@/features/settings/pages/RoleManagementPage'))
const SubjectManagementPage = lazy(() => import('@/features/subjects/pages/SubjectManagementPage'))
const RoomManagementPage = lazy(() => import('@/features/rooms/pages/RoomManagementPage'))

export const router = createBrowserRouter([
  // Public auth routes
  {
    path: '/auth/login',
    element: (
      <Suspense fallback={<RouteFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/auth/register',
    element: (
      <Suspense fallback={<RouteFallback />}>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: '/auth/magic-link',
    element: (
      <Suspense fallback={<RouteFallback />}>
        <MagicLinkOnboardingPage />
      </Suspense>
    ),
  },
  // Protected app shell — all child routes require authentication
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'timetable',
        handle: { title: 'Timetable' },
        element: (
          <Suspense fallback={<RouteFallback />}>
            <PlaceholderPage />
          </Suspense>
        ),
      },
      {
        path: 'teachers',
        handle: { title: 'Teachers' },
        element: (
          <Suspense fallback={<RouteFallback />}>
            <TeacherListPage />
          </Suspense>
        ),
      },
      {
        path: 'classes',
        handle: { title: 'Classes' },
        element: (
          <Suspense fallback={<RouteFallback />}>
            <ClassManagementPage />
          </Suspense>
        ),
      },
      {
        path: 'subjects',
        handle: { title: 'Subjects' },
        element: (
          <Suspense fallback={<RouteFallback />}>
            <SubjectManagementPage />
          </Suspense>
        ),
      },
      {
        path: 'rooms',
        handle: { title: 'Rooms' },
        element: (
          <Suspense fallback={<RouteFallback />}>
            <RoomManagementPage />
          </Suspense>
        ),
      },
      {
        path: 'engine',
        handle: { title: 'Engine' },
        element: (
          <Suspense fallback={<RouteFallback />}>
            <PlaceholderPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <SettingsLayout />
          </Suspense>
        ),
        children: [
          { index: true, element: <Navigate to="terminology" replace /> },
          {
            path: 'terminology',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <TerminologySettingsPage />
              </Suspense>
            ),
          },
          {
            path: 'bell-schedule',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <BellSchedulePage />
              </Suspense>
            ),
          },
          {
            path: 'cycle',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <CycleSettingsPage />
              </Suspense>
            ),
          },
          {
            path: 'roles',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <RoleManagementPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
])
