import { useCallback, useMemo, useState } from 'react'
import { useGeneratorPrerequisites } from '@/api/hooks/useGeneratorPrerequisites'
import {
  useDraftSchedule,
  useEngineJob,
  useRunEngine,
  useSyncDraftFromEngineJob,
} from '@/api/hooks/useEngine'
import { useBellSchedule } from '@/api/hooks/useBellSchedule'
import { useCycleSettings } from '@/api/hooks/useCycleSettings'
import { DraftTimetablePreview } from '@/components/domain/draft-timetable-preview'
import {
  GeneratorStatusBar,
  type GeneratorStatusPhase,
} from '@/components/domain/generator-status-bar'
import { SatisfactionBanner } from '@/components/domain/satisfaction-banner'
import { ConstraintSatisfactionSummary } from '@/components/domain/constraint-satisfaction-summary'
import { ConflictExplainer } from '@/components/domain/conflict-explainer'
import { Button } from '@/components/ui/button'
import { padDayLabels } from '@/lib/cycle-term-utils'

function prerequisiteSentence(missing: ReturnType<typeof useGeneratorPrerequisites>['missing']) {
  if (missing.length === 0) return ''
  const labels: Record<string, string> = {
    teacher: 'at least one teacher',
    class: 'at least one class',
    subject: 'at least one subject',
    room: 'at least one room',
    bellSchedule: 'a bell schedule with periods',
    cycle: 'a cycle',
    activeTerm: 'an active term',
  }
  return `Add ${missing.map((k) => labels[k]).join(', ')} before generating.`
}

export default function EnginePage() {
  const {
    canRun,
    missing,
    activeTerm,
    isLoading: prerequisitesLoading,
  } = useGeneratorPrerequisites()
  const { data: bell } = useBellSchedule()
  const { data: cycle } = useCycleSettings()
  const termId = activeTerm?.id ?? null

  const [jobId, setJobId] = useState<string | null>(null)
  const [showSatisfactionSummary, setShowSatisfactionSummary] = useState(false)
  const [showConflictExplainer, setShowConflictExplainer] = useState(false)
  const runEngine = useRunEngine()
  const { data: job, isPending: jobPending } = useEngineJob(jobId)
  useSyncDraftFromEngineJob(termId, job)

  const { data: draft } = useDraftSchedule(termId)

  const statusPhase: GeneratorStatusPhase = useMemo(() => {
    if (runEngine.isPending) return 'running'
    if (jobId && jobPending) return 'running'
    if (!job) return 'idle'
    if (job.status === 'queued' || job.status === 'running') return 'running'
    if (job.status === 'succeeded') return 'succeeded'
    if (job.status === 'failed') return 'failed'
    if (job.status === 'cancelled') return 'cancelled'
    return 'idle'
  }, [runEngine.isPending, jobId, jobPending, job])

  const statusMessage = useMemo(() => {
    if (runEngine.isPending) return 'Starting generator…'
    if (jobId && jobPending) return 'Preparing job…'
    if (!job) return ''
    if (job.status === 'queued' || job.status === 'running') return job.statusMessage
    if (job.status === 'succeeded') return job.statusMessage
    if (job.status === 'failed') return job.statusMessage || 'Generator failed.'
    if (job.status === 'cancelled') return 'Run cancelled.'
    return ''
  }, [runEngine.isPending, jobId, jobPending, job])

  const cycleLength = cycle?.cycleLengthDays ?? 0
  const dayLabels = useMemo(
    () => padDayLabels(cycle?.dayLabels ?? [], cycleLength),
    [cycle?.dayLabels, cycleLength],
  )

  const onGenerate = useCallback(() => {
    if (!termId || !canRun) return
    setJobId(null)
    runEngine.mutate(
      { termId },
      {
        onSuccess: (res) => setJobId(res.jobId),
      },
    )
  }, [termId, canRun, runEngine])

  const onOpenSatisfactionSummary = useCallback(() => setShowSatisfactionSummary(true), [])
  const onCloseSatisfactionSummary = useCallback(() => setShowSatisfactionSummary(false), [])
  const onOpenConflictExplainer = useCallback(() => setShowConflictExplainer(true), [])
  const onCloseConflictExplainer = useCallback(() => setShowConflictExplainer(false), [])
  const onRelaxConstraint = useCallback((_conflictId: string) => {
    // Story 4.4 — opens SensitivityPanel; placeholder for now
  }, [])
  const onAssignManually = useCallback(() => {
    // Story 5 — navigates to timetable grid; placeholder for now
  }, [])
  const onEditSourceData = useCallback(() => {
    // Navigates to teacher/class management; placeholder for now
  }, [])

  const disableGenerate =
    prerequisitesLoading ||
    !canRun ||
    !termId ||
    runEngine.isPending ||
    statusPhase === 'running'

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-1 min-h-0 flex-col gap-4 px-4 py-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Schedule generator
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {prerequisitesLoading
                ? 'Loading configuration…'
                : activeTerm
                  ? `Active term: ${activeTerm.name}`
                  : 'No calendar-active term — configure academic terms in Settings.'}
            </p>
            {!canRun && !prerequisitesLoading ? (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-400" role="status">
                {prerequisiteSentence(missing)}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            onClick={onGenerate}
            disabled={disableGenerate}
            aria-busy={runEngine.isPending || statusPhase === 'running'}
          >
            Generate
          </Button>
        </header>

        {job?.status === 'succeeded' && job.constraintReport ? (
          <SatisfactionBanner
            report={job.constraintReport}
            onViewDetails={onOpenSatisfactionSummary}
          />
        ) : null}

        {showConflictExplainer && job?.status === 'failed' && job.conflictReport ? (
          <ConflictExplainer
            conflictReport={job.conflictReport}
            cycleLengthDays={cycleLength}
            dayLabels={dayLabels}
            periods={bell?.periods ?? []}
            onRelaxConstraint={onRelaxConstraint}
            onAssignManually={onAssignManually}
            onEditSourceData={onEditSourceData}
            onClose={onCloseConflictExplainer}
          />
        ) : (
          <section
            className="min-h-0 flex-1 overflow-auto rounded-xl border border-[--color-border] bg-[--color-surface] p-4"
            aria-label="Draft timetable workspace"
          >
            {bell && cycle && cycleLength > 0 ? (
              <DraftTimetablePreview
                cycleLengthDays={cycleLength}
                dayLabels={dayLabels}
                periods={bell.periods}
                lessons={draft?.lessons ?? []}
              />
            ) : (
              <p className="text-sm text-[--color-text-secondary]">
                Loading bell schedule and cycle…
              </p>
            )}
            {draft && draft.lessons.length === 0 && !jobId ? (
              <p className="mt-4 text-sm text-[--color-text-secondary]">
                Generated lessons will appear in this grid. Click Generate to build a draft for the
                active term.
              </p>
            ) : null}
          </section>
        )}
      </div>

      <GeneratorStatusBar
        phase={statusPhase === 'idle' && !statusMessage ? 'idle' : statusPhase}
        message={statusMessage}
        onViewConflicts={
          job?.status === 'failed' && job.conflictReport ? onOpenConflictExplainer : undefined
        }
      />

      {showSatisfactionSummary && job?.constraintReport ? (
        <ConstraintSatisfactionSummary
          report={job.constraintReport}
          onClose={onCloseSatisfactionSummary}
        />
      ) : null}
    </div>
  )
}
