import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Topbar } from './Topbar'
import { Sidebar } from './Sidebar'
import { useTerminologyLabels } from '@/api/hooks/useSettings'
import { useTenantStore } from '@/store/tenantStore'

// Application shell: fixed topbar (48px) + dark sidebar + light-grey workspace.
// Responsive: sidebar collapses to icon strip at ≤768px; bottom tab bar at <768px.
// UX-DR1–3 design tokens applied via CSS variables in globals.css.
export function AppShell() {
  const { data: labelsData } = useTerminologyLabels()
  const { setLabels } = useTenantStore()

  // Sync fetched labels into the store so useLabels() reflects institution terminology.
  useEffect(() => {
    if (labelsData) {
      setLabels(labelsData)
    }
  }, [labelsData, setLabels])

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {/* Main workspace — light grey, scrollable */}
        <main
          className="flex-1 overflow-auto pb-14 md:pb-0"
          style={{ backgroundColor: 'var(--color-workspace)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
