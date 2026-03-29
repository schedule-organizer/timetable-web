import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SubjectRuleForm } from '@/features/constraints/components/SubjectRuleForm'
import {
  useCreateSubjectRule,
  useDeleteSubjectRule,
  useSubjectRules,
  useUpdateSubjectRule,
} from '@/api/hooks/useSubjectRules'
import { getApiErrorMessage } from '@/lib/api-error-message'
import type { SubjectRuleDto, SubjectRuleFormValues } from '@/types/subject-rule.types'

function getFormInitialValues(rule: SubjectRuleDto): SubjectRuleFormValues {
  return {
    name: rule.name,
    description: rule.description ?? '',
    constraintType: rule.constraintType,
    weight: rule.weight ?? 5,
    enabled: rule.enabled,
  }
}

export default function SubjectRulesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<SubjectRuleDto | null>(null)
  const [toDelete, setToDelete] = useState<SubjectRuleDto | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const { data, isLoading, error } = useSubjectRules()
  const rows = data?.content ?? []
  const softRules = useMemo(() => rows.filter((r) => r.constraintType === 'soft'), [rows])
  const hasSatisfactionData = softRules.some((r) => r.satisfactionRate !== undefined)

  const {
    mutate: createRule,
    isPending: isCreating,
    error: createError,
  } = useCreateSubjectRule()
  const {
    mutate: updateRule,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateSubjectRule()
  const {
    mutate: deleteRule,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteSubjectRule()

  const mutationError = createError ?? updateError ?? deleteError
  const isFormSubmitting = isCreating || isUpdating

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditing(null)
  }

  const handleAddClick = () => {
    setStatusMessage(null)
    setEditing(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (row: SubjectRuleDto) => {
    setStatusMessage(null)
    setEditing(row)
    setIsFormOpen(true)
  }

  const handleFormSubmit = (values: SubjectRuleFormValues) => {
    if (editing) {
      updateRule(
        {
          id: editing.id,
          data: {
            name: values.name,
            description: values.description || null,
            constraintType: values.constraintType,
            weight: values.constraintType === 'soft' ? values.weight : undefined,
            enabled: values.enabled,
          },
        },
        {
          onSuccess: () => {
            setStatusMessage('Rule updated.')
            handleFormClose()
          },
        },
      )
    } else {
      createRule(
        {
          name: values.name,
          description: values.description,
          constraintType: values.constraintType,
          weight: values.constraintType === 'soft' ? values.weight : undefined,
          enabled: values.enabled,
        },
        {
          onSuccess: () => {
            setStatusMessage('Rule created.')
            handleFormClose()
          },
        },
      )
    }
  }

  const handleDeleteConfirm = () => {
    if (!toDelete) return
    deleteRule(toDelete.id, {
      onSuccess: () => {
        setStatusMessage('Rule deleted.')
        setToDelete(null)
      },
    })
  }

  // Focus management for delete dialog
  const cancelRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (toDelete) {
      cancelRef.current?.focus()
    }
  }, [toDelete])

  // Keyboard close for delete dialog
  useEffect(() => {
    if (!toDelete) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setToDelete(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [toDelete])

  const showEmptyState = !isLoading && rows.length === 0 && !error

  const formInitialValues = useMemo(
    () => (editing ? getFormInitialValues(editing) : undefined),
    [editing],
  )

  const operationErrorMessage = mutationError ? getApiErrorMessage(mutationError) : null

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[--color-text-primary]">Subject rules</h2>
          <p className="mt-1 text-sm text-[--color-text-secondary]">
            Define how subjects are distributed across the cycle. Rules can be enforced as hard
            constraints (always applied) or soft preferences (best-effort).
          </p>
        </div>
        <Button onClick={handleAddClick} aria-label="Add subject rule">
          Add rule
        </Button>
      </div>

      {statusMessage && (
        <p role="status" className="mt-3 text-sm text-green-700">
          {statusMessage}
        </p>
      )}

      {operationErrorMessage && (
        <div
          role="alert"
          className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {operationErrorMessage}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Failed to load subject rules. Please refresh and try again.
        </div>
      )}

      {isFormOpen && (
        <div className="mt-6 rounded-lg border border-[--color-border] bg-[--color-surface] p-6">
          <h3 className="mb-4 text-base font-medium text-[--color-text-primary]">
            {editing ? 'Edit rule' : 'New subject rule'}
          </h3>
          <SubjectRuleForm
            mode={editing ? 'edit' : 'create'}
            initialValues={formInitialValues}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
            submitLabel={editing ? 'Save changes' : 'Create rule'}
            isLoading={isFormSubmitting}
          />
        </div>
      )}

      {isLoading && (
        <p className="mt-6 text-sm text-[--color-text-secondary]">Loading subject rules…</p>
      )}

      {showEmptyState && (
        <div className="mt-6 rounded-lg border border-dashed border-[--color-border] p-8 text-center">
          <p className="text-sm text-[--color-text-secondary]">
            No subject rules yet. Add a rule to balance student workload across the cycle.
          </p>
        </div>
      )}

      {!isLoading && rows.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-[--color-border]">
          <table className="w-full text-sm">
            <thead className="bg-[--color-surface]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[--color-text-secondary]">
                  Rule
                </th>
                <th className="px-4 py-3 text-left font-medium text-[--color-text-secondary]">
                  Type
                </th>
                <th className="px-4 py-3 text-left font-medium text-[--color-text-secondary]">
                  Weight
                </th>
                <th className="px-4 py-3 text-left font-medium text-[--color-text-secondary]">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-medium text-[--color-text-secondary]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border]">
              {rows.map((rule) => (
                <tr key={rule.id} className="bg-[--color-background] hover:bg-[--color-surface]">
                  <td className="px-4 py-3 text-[--color-text-primary]">
                    <p className="font-medium">{rule.name}</p>
                    {rule.description && (
                      <p className="mt-0.5 text-xs text-[--color-text-secondary]">
                        {rule.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        rule.constraintType === 'hard'
                          ? 'inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700'
                          : 'inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700'
                      }
                    >
                      {rule.constraintType === 'hard' ? 'Hard' : 'Soft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[--color-text-secondary]">
                    {rule.constraintType === 'soft' && rule.weight !== undefined
                      ? `${rule.weight} / 10`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {rule.enabled ? (
                      <span className="text-xs text-green-700">Active</span>
                    ) : (
                      <span className="text-xs text-[--color-text-secondary]">Disabled</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditClick(rule)}
                        aria-label={`Edit ${rule.name}`}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setToDelete(rule)}
                        aria-label={`Delete ${rule.name}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasSatisfactionData && (
        <div className="mt-6 rounded-lg border border-[--color-border] bg-[--color-surface] p-4">
          <h3 className="text-sm font-medium text-[--color-text-primary]">
            Satisfaction report — soft rules
          </h3>
          <p className="mt-1 text-xs text-[--color-text-secondary]">
            Satisfaction rates from the most recent generator run.
          </p>
          <ul className="mt-3 space-y-2">
            {softRules
              .filter((r) => r.satisfactionRate !== undefined)
              .map((rule) => (
                <li key={rule.id} className="flex items-center justify-between text-sm">
                  <span className="text-[--color-text-primary]">{rule.name}</span>
                  <span
                    className={
                      (rule.satisfactionRate ?? 0) >= 80
                        ? 'font-medium text-green-700'
                        : (rule.satisfactionRate ?? 0) >= 40
                          ? 'font-medium text-amber-700'
                          : 'font-medium text-red-700'
                    }
                  >
                    {rule.satisfactionRate}%
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {toDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setToDelete(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-sm rounded-lg border border-[--color-border] bg-[--color-surface] p-6 shadow-xl">
            <h3
              id="delete-dialog-title"
              className="text-base font-semibold text-[--color-text-primary]"
            >
              Delete rule?
            </h3>
            <p className="mt-2 text-sm text-[--color-text-secondary]">
              <strong className="text-[--color-text-primary]">{toDelete.name}</strong> will be
              permanently removed.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                Delete
              </Button>
              <Button
                ref={cancelRef}
                variant="secondary"
                onClick={() => setToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
