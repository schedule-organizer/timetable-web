import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AvailabilityGrid } from '@/components/domain/availability-grid'
import type { AvailabilitySlotState } from '@/types/teacher-availability.types'

function StatefulGrid() {
  const [value, setValue] = useState<Map<string, AvailabilitySlotState>>(new Map())
  return (
    <div className="p-4">
      <AvailabilityGrid
        cycleLengthDays={5}
        dayLabels={['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5']}
        periods={[
          { id: 'p1', name: 'Period 1' },
          { id: 'p2', name: 'Period 2' },
          { id: 'p3', name: 'Period 3' },
        ]}
        value={value}
        onChange={setValue}
      />
    </div>
  )
}

const meta = {
  title: 'Domain/AvailabilityGrid',
  component: AvailabilityGrid,
  render: () => <StatefulGrid />,
} satisfies Meta<typeof AvailabilityGrid>

export default meta

export const Default: StoryObj<typeof AvailabilityGrid> = {}
