import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { render } from '@/test/test-utils'
import { useAuthStore } from '@/store/authStore'
import { AppShell } from './AppShell'

const testUser = {
  id: 'user-1',
  email: 'test@test.com',
  fullName: 'Test User',
  role: 'ADMIN' as const,
  institutionId: 'inst-1',
  createdAt: '2026-03-28T00:00:00Z',
}

beforeEach(() => {
  useAuthStore.setState({ user: testUser, accessToken: 'token', isAuthenticated: true })
})

afterEach(() => {
  useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false })
})

function renderShell(content = 'Page Content') {
  return render(
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<main role="main">{content}</main>} />
      </Route>
    </Routes>,
    { initialEntries: ['/'] },
  )
}

describe('AppShell', () => {
  it('renders the banner (topbar)', () => {
    renderShell()
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders main navigation sidebar', () => {
    renderShell()
    // Both desktop sidebar and mobile nav are rendered
    const navs = screen.getAllByRole('navigation')
    expect(navs.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the outlet content', () => {
    renderShell('My page content')
    expect(screen.getByText('My page content')).toBeInTheDocument()
  })

  it('renders SchediFlow brand in topbar', () => {
    renderShell()
    expect(screen.getByText('SchediFlow')).toBeInTheDocument()
  })

  it('displays the current user name in topbar', () => {
    renderShell()
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('renders sign out button in topbar', () => {
    renderShell()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('renders all main nav links', () => {
    renderShell()
    expect(screen.getAllByRole('link', { name: /dashboard/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /timetable/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /teachers/i }).length).toBeGreaterThan(0)
  })
})
