import { useAuthStore } from '@/store/authStore'

// Institution setup dashboard — landing page after registration.
// Populated with setup wizard content in Story 1.5.
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Welcome, {user?.fullName ?? 'Timetabler'}!
      </h1>
      <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
        Your institution is ready. Use the sidebar to configure your school.
      </p>
    </div>
  )
}
