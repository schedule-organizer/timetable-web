import type { InvitationStatus } from '@/types/invitation.types'

interface TeacherStatusBadgeProps {
  status: InvitationStatus
}

const STATUS_CONFIG: Record<InvitationStatus, { label: string; className: string }> = {
  INVITED: {
    label: 'Invited',
    className: 'bg-yellow-100 text-yellow-800',
  },
  ACTIVE: {
    label: 'Active',
    className: 'bg-green-100 text-green-800',
  },
  EXPIRED: {
    label: 'Expired',
    className: 'bg-slate-100 text-slate-600',
  },
}

export function TeacherStatusBadge({ status }: TeacherStatusBadgeProps) {
  const { label, className } = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}
