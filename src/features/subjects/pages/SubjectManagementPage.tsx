import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { DifficultyBadge } from '@/features/subjects/components/DifficultyBadge'
import { SubjectForm } from '@/features/subjects/components/SubjectForm'
import { useCreateSubject, useSubjects, useUpdateSubject } from '@/api/hooks/useSubjects'
import type { SubjectDto, SubjectFormValues } from '@/types/subject.types'

const difficultyOptions = [
  { value: 'ALL', label: 'All difficulties' },
  { value: 'LOW', label: 'Low difficulty' },
  { value: 'MEDIUM', label: 'Medium difficulty' },
  { value: 'HIGH', label: 'High difficulty' },
] as const

type DifficultyFilter = (typeof difficultyOptions)[number]['value']

type SortField = 'name' | 'difficulty'

const difficultyOrder: Record<Extract<DifficultyFilter, 'LOW' | 'MEDIUM' | 'HIGH'>, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
}

export default function SubjectManagementPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<SubjectDto | null>(null)
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('ALL')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const { data, isLoading, error } = useSubjects()
  const subjects = data?.content ?? []

  const {
    mutate: createSubject,
    isPending: isCreating,
    error: createError,
  } = useCreateSubject()
  const {
    mutate: updateSubject,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateSubject()

  const mutationError = createError ?? updateError
  const isFormSubmitting = isCreating || isUpdating

  const filteredSubjects = useMemo(() => {
    if (difficultyFilter === 'ALL') return subjects
    return subjects.filter((subject) => subject.difficulty === difficultyFilter)
  }, [subjects, difficultyFilter])

  const sortedSubjects = useMemo(() => {
    const sorted = [...filteredSubjects].sort((a, b) => {
      if (sortField === 'difficulty') {
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      }
      return a.name.localeCompare(b.name)
    })
    return sortDirection === 'asc' ? sorted : sorted.reverse()
  }, [filteredSubjects, sortField, sortDirection])

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingSubject(null)
  }

  const handleAddClick = () => {
    setStatusMessage(null)
    setEditingSubject(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (subject: SubjectDto) => {
    setStatusMessage(null)
    setEditingSubject(subject)
    setIsFormOpen(true)
  }

  const handleFormSubmit = (values: SubjectFormValues) => {
    if (editingSubject) {
      updateSubject(
        { id: editingSubject.id, data: values },
        {
          onSuccess: () => {
            setStatusMessage('Subject updated. Difficulty changes take effect on the next generator run.')
            handleFormClose()
          },
        },
      )
    } else {
      createSubject(values, {
        onSuccess: () => {
          setStatusMessage('Subject added. It is now available for scheduling and constraints.')
          handleFormClose()
        },
      })
    }
  }

  const handleSortDirectionToggle = () => {
    setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
  }

  const handleSortFieldChange = (value: SortField) => {
    setSortField(value)
  }

  const queryErrorMessage = error ? getApiErrorMessage(error) : null
  const operationErrorMessage = mutationError ? getApiErrorMessage(mutationError) : null

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Subjects
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Create subjects with difficulty levels so the generator can balance load.
          </p>
        </div>
        <Button type="button" onClick={handleAddClick}>
          Add subject
        </Button>
      </header>

      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="difficulty-filter" className="text-sm font-semibold">
              Filter by difficulty
            </Label>
            <select
              id="difficulty-filter"
              className="mt-1 block w-full rounded-md border border-[--color-border] bg-transparent px-3 py-2 text-sm text-[--color-text-primary]"
              value={difficultyFilter}
              onChange={(event) => setDifficultyFilter(event.target.value as DifficultyFilter)}
            >
              {difficultyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="sort-field" className="text-sm font-semibold">
              Sort subjects
            </Label>
            <select
              id="sort-field"
              className="mt-1 block w-full rounded-md border border-[--color-border] bg-transparent px-3 py-2 text-sm text-[--color-text-primary]"
              value={sortField}
              onChange={(event) => handleSortFieldChange(event.target.value as SortField)}
            >
              <option value="name">Name</option>
              <option value="difficulty">Difficulty</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-sm font-semibold text-[--color-text-secondary]">Order</span>
            <Button type="button" variant="secondary" onClick={handleSortDirectionToggle}>
              {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
          </div>
        </div>

        <section aria-label="Subject roster" className="space-y-4">
          {statusMessage && (
            <div
              role="status"
              className="rounded-md border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-900"
            >
              {statusMessage}
            </div>
          )}
          {operationErrorMessage && (
            <p className="text-sm text-red-800" role="alert">
              {operationErrorMessage}
            </p>
          )}
          {queryErrorMessage && (
            <p className="text-sm text-red-800" role="alert">
              {queryErrorMessage}
            </p>
          )}

          {isFormOpen && (
            <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {editingSubject ? 'Edit subject' : 'Add subject'}
              </h2>
              <SubjectForm
                initialValues={
                  editingSubject
                    ? { name: editingSubject.name, difficulty: editingSubject.difficulty }
                    : undefined
                }
                onSubmit={handleFormSubmit}
                onCancel={handleFormClose}
                submitLabel={editingSubject ? 'Save changes' : 'Create subject'}
                isLoading={isFormSubmitting}
              />
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-[--color-border] bg-[--color-surface]">
            <table className="min-w-full divide-y divide-[--color-border] text-sm">
              <thead>
                <tr className="bg-white">
                  <th className="px-4 py-3 text-left font-semibold text-[--color-text-secondary]">Subject</th>
                  <th className="px-4 py-3 text-left font-semibold text-[--color-text-secondary]">Difficulty</th>
                  <th className="px-4 py-3 text-left font-semibold text-[--color-text-secondary]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--color-border]">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-sm text-[--color-text-secondary]">
                      Loading subjects…
                    </td>
                  </tr>
                ) : sortedSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-sm text-[--color-text-secondary]">
                      {subjects.length === 0
                        ? 'No subjects configured yet.'
                        : 'No subjects match this difficulty filter.'}
                    </td>
                  </tr>
                ) : (
                  sortedSubjects.map((subject) => (
                    <tr key={subject.id}>
                      <td className="px-4 py-3 text-[--color-text-primary]">{subject.name}</td>
                      <td className="px-4 py-3">
                        <DifficultyBadge level={subject.difficulty} />
                      </td>
                      <td className="px-4 py-3">
                        <Button type="button" variant="ghost" onClick={() => handleEditClick(subject)}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  )
}
