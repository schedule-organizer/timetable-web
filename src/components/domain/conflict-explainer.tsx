import { useState } from 'react'
import { AlertCircle, ChevronDown, ChevronUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BellPeriod } from '@/types/bell-schedule.types'
import type { ConflictExplanationDto, ConflictReportDto } from '@/types/engine.types'
import { padDayLabels } from '@/lib/cycle-term-utils'

export interface ConflictExplainerProps {
  conflictReport: ConflictReportDto
  cycleLengthDays: number
  dayLabels: string[]
  periods: BellPeriod[]
  onRelaxConstraint: (conflictId: string) => void
  onAssignManually: () => void
  onEditSourceData: () => void
  onClose: () => void
}

function slotKey(cycleDayIndex: number, periodId: string) {
  return `${cycleDayIndex}:${periodId}`
}

interface MiniGridProps {
  affectedSlots: ConflictExplanationDto['affectedSlots']
  cycleLengthDays: number
  dayLabels: string[]
  periods: BellPeriod[]
  conflictId: string
}

function MiniGrid({ affectedSlots, cycleLengthDays, dayLabels, periods, conflictId }: MiniGridProps) {
  const labels = padDayLabels(dayLabels, cycleLengthDays)
  const affected = new Set(affectedSlots.map((s) => slotKey(s.cycleDayIndex, s.periodId)))

  return (
    <div className="overflow-x-auto">
      <table
        className="border-collapse text-xs"
        aria-label={`Affected slots for conflict ${conflictId}`}
      >
        <caption className="sr-only">Mini grid showing affected schedule slots</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="border border-[--color-border] bg-[--color-surface] px-1.5 py-1 font-medium text-[--color-text-secondary]"
            />
            {Array.from({ length: cycleLengthDays }, (_, i) => (
              <th
                key={i}
                scope="col"
                className="border border-[--color-border] bg-[--color-surface] px-2 py-1 font-medium text-[--color-text-primary]"
              >
                {labels[i]?.trim() || `D${i + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <tr key={period.id}>
              <th
                scope="row"
                className="border border-[--color-border] bg-[--color-surface] px-1.5 py-1 font-medium text-[--color-text-secondary] whitespace-nowrap"
              >
                {period.name}
              </th>
              {Array.from({ length: cycleLengthDays }, (_, d) => {
                const isAffected = affected.has(slotKey(d, period.id))
                return (
                  <td
                    key={d}
                    aria-label={
                      isAffected
                        ? `${labels[d]?.trim() || `Day ${d + 1}`} ${period.name} — conflict`
                        : `${labels[d]?.trim() || `Day ${d + 1}`} ${period.name}`
                    }
                    className={[
                      'border px-2 py-1',
                      isAffected
                        ? 'border-red-400 bg-red-100 dark:border-red-700 dark:bg-red-950'
                        : 'border-[--color-border] bg-[--color-surface]',
                    ].join(' ')}
                  >
                    {isAffected ? (
                      <span className="sr-only">conflict</span>
                    ) : null}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface ConflictCardProps {
  conflict: ConflictExplanationDto
  cycleLengthDays: number
  dayLabels: string[]
  periods: BellPeriod[]
  onRelaxConstraint: (conflictId: string) => void
  onAssignManually: () => void
  onEditSourceData: () => void
}

function ConflictCard({
  conflict,
  cycleLengthDays,
  dayLabels,
  periods,
  onRelaxConstraint,
  onAssignManually,
  onEditSourceData,
}: ConflictCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article
      aria-label={`Conflict: ${conflict.constraintName}`}
      className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40"
    >
      {/* Conflict header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-2">
        <AlertCircle
          className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            {conflict.constraintName}
          </p>
          <p className="mt-1 text-sm text-[--color-text-primary]" role="note">
            {conflict.explanation}
          </p>
        </div>
      </div>

      {/* Affected entities */}
      <div className="flex flex-wrap gap-3 px-4 pb-3">
        {conflict.affectedTeachers.length > 0 ? (
          <div>
            <span className="mr-1 text-xs font-medium text-[--color-text-secondary]">
              Teachers:
            </span>
            {conflict.affectedTeachers.map((t) => (
              <span
                key={t.id}
                className="mr-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300"
              >
                {t.name}
              </span>
            ))}
          </div>
        ) : null}
        {conflict.affectedClasses.length > 0 ? (
          <div>
            <span className="mr-1 text-xs font-medium text-[--color-text-secondary]">
              Classes:
            </span>
            {conflict.affectedClasses.map((c) => (
              <span
                key={c.id}
                className="mr-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300"
              >
                {c.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Mini grid preview */}
      {conflict.affectedSlots.length > 0 && periods.length > 0 ? (
        <div className="px-4 pb-3">
          <p className="mb-1.5 text-xs font-medium text-[--color-text-secondary]">
            Affected slots (highlighted red):
          </p>
          <MiniGrid
            affectedSlots={conflict.affectedSlots}
            cycleLengthDays={cycleLengthDays}
            dayLabels={dayLabels}
            periods={periods}
            conflictId={conflict.id}
          />
        </div>
      ) : null}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 border-t border-red-200 px-4 py-3 dark:border-red-800">
        <Button
          type="button"
          size="sm"
          onClick={() => onRelaxConstraint(conflict.id)}
          aria-label={`Relax constraint for ${conflict.constraintName}`}
        >
          Relax constraint
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAssignManually}
        >
          Assign manually
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEditSourceData}
        >
          Edit source data
        </Button>
      </div>

      {/* Expandable technical details */}
      <div className="border-t border-red-200 px-4 py-2 dark:border-red-800">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex items-center gap-1 text-xs text-[--color-text-secondary] hover:text-[--color-text-primary]"
        >
          {expanded ? (
            <ChevronUp className="size-3" aria-hidden />
          ) : (
            <ChevronDown className="size-3" aria-hidden />
          )}
          Technical details
        </button>
        {expanded ? (
          <dl className="mt-2 space-y-1 text-xs text-[--color-text-secondary]">
            <div className="flex gap-2">
              <dt className="font-medium">Constraint ID:</dt>
              <dd>{conflict.constraintId}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium">Affected slots:</dt>
              <dd>
                {conflict.affectedSlots
                  .map((s) => `Day ${s.cycleDayIndex + 1} / ${s.periodId}`)
                  .join(', ')}
              </dd>
            </div>
          </dl>
        ) : null}
      </div>
    </article>
  )
}

/**
 * Full-panel first-class screen for hard-constraint deadlock diagnosis (UX-DR10).
 * Shows plain-language conflict explanations with miniature grid previews and
 * action buttons for each conflict. Not a modal — rendered in place of the workspace.
 */
export function ConflictExplainer({
  conflictReport,
  cycleLengthDays,
  dayLabels,
  periods,
  onRelaxConstraint,
  onAssignManually,
  onEditSourceData,
  onClose,
}: ConflictExplainerProps) {
  return (
    <section
      aria-label="Conflict explainer"
      className="flex min-h-0 flex-1 flex-col overflow-auto rounded-xl border border-red-300 bg-[--color-surface] dark:border-red-800"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-red-200 px-5 py-4 dark:border-red-800">
        <div className="flex items-center gap-3">
          <AlertCircle
            className="size-5 shrink-0 text-red-600 dark:text-red-400"
            aria-hidden
          />
          <div>
            <h2 className="text-base font-semibold text-[--color-text-primary]">
              Schedule generation failed
            </h2>
            <p className="mt-0.5 text-sm text-[--color-text-secondary]">
              {conflictReport.conflicts.length === 1
                ? '1 hard constraint conflict detected'
                : `${conflictReport.conflicts.length} hard constraint conflicts detected`}
              {' — '}resolve each to generate a valid schedule.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close conflict explainer"
        >
          <X className="size-4" aria-hidden />
        </Button>
      </div>

      {/* Conflict list */}
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {conflictReport.conflicts.map((conflict) => (
          <ConflictCard
            key={conflict.id}
            conflict={conflict}
            cycleLengthDays={cycleLengthDays}
            dayLabels={dayLabels}
            periods={periods}
            onRelaxConstraint={onRelaxConstraint}
            onAssignManually={onAssignManually}
            onEditSourceData={onEditSourceData}
          />
        ))}
      </div>
    </section>
  )
}
