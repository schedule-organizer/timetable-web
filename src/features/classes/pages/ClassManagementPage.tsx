import { useMemo, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ClassForm } from '@/features/classes/components/ClassForm'
import { useClasses, useCreateClass, useDeleteClass, useUpdateClass } from '@/api/hooks/useClasses'
import { getApiErrorMessage } from '@/lib/api-error-message'
import type { ClassDto, ClassFormValues } from '@/types/class.types'

const ALL_YEAR_GROUPS = 'all'

function normalizeYearGroup(value?: string | null) {
  if (!value) return ''
  return value.trim()
}

export default function ClassManagementPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassDto | null>(null)
  const [classToDelete, setClassToDelete] = useState<ClassDto | null>(null)
  const [selectedYearGroup, setSelectedYearGroup] = useState(ALL_YEAR_GROUPS)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const { data: classesResponse, isLoading, error } = useClasses()
  const classes = classesResponse?.content ?? []


  const {
    mutate: createClass,
    isPending: isCreating,
    error: createError,
  } = useCreateClass()
  const {
    mutate: updateClass,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateClass()
  const {
    mutate: deleteClass,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteClass()

  const mutationError = createError ?? updateError ?? deleteError
  const operationErrorMessage = mutationError ? getApiErrorMessage(mutationError) : null

  const isFormSubmitting = isCreating || isUpdating

  const uniqueYearGroups = useMemo(() => {
    const groups = new Set<string>()
    for (const klass of classes) {
      if (klass.yearGroup) {
        groups.add(klass.yearGroup)
      }
    }
    return Array.from(groups).sort()
  }, [classes])

  const filteredClasses = useMemo(() => {
    if (selectedYearGroup === ALL_YEAR_GROUPS) return classes
    return classes.filter((klass) => klass.yearGroup === selectedYearGroup)
  }, [classes, selectedYearGroup])

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingClass(null)
  }

  const handleAddClassClick = () => {
    setStatusMessage(null)
    setEditingClass(null)
    setIsFormOpen(true)
  }

  const handleEditClass = (klass: ClassDto) => {
    setStatusMessage(null)
    setEditingClass(klass)
    setIsFormOpen(true)
  }

  const handleFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedYearGroup(event.target.value)
  }

  const handleFormSubmit = (values: ClassFormValues) => {
    const payload = {
      name: values.name.trim(),
      yearGroup: values.yearGroup?.trim() || null,
    }

    if (editingClass) {
      updateClass(
        { id: editingClass.id, data: payload },
        {
          onSuccess: () => {
            setStatusMessage('Class updated. Associated schedules now use the refreshed name/year group.')
            handleFormClose()
          },
        },
      )
    } else {
      createClass(payload, {
        onSuccess: () => {
          setStatusMessage('Class added. It is now available for scheduling and filters.')
          handleFormClose()
        },
      })
    }
  }

  const handleDeleteConfirm = () => {
    if (!classToDelete) return
    const removed = classToDelete
    deleteClass(removed.id, {
      onSuccess: () => {
        setStatusMessage(
          'Class deleted. Any previously assigned slots are considered orphaned—review overlapping schedules before publishing.',
        )
        setClassToDelete(null)
      },
    })
  }

  const formInitialValues: ClassFormValues | undefined = editingClass
    ? {
        name: editingClass.name,
        yearGroup: normalizeYearGroup(editingClass.yearGroup),
      }
    : undefined

  return (
    <div className="p-6">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Classes
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Define student groups so the scheduler knows which cohorts need lessons.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={handleAddClassClick}>
            Add class
          </Button>
        </div>
      </header>

      <section aria-label="Class roster" className="space-y-5">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="year-group-filter" className="text-sm font-semibold">
              Filter by year group
            </Label>
            <select
              id="year-group-filter"
              className="mt-1 block w-full rounded-md border border-[--color-border] bg-transparent px-3 py-2 text-sm text-[--color-text-primary]"
              value={selectedYearGroup}
              onChange={handleFilterChange}
            >
              <option value={ALL_YEAR_GROUPS}>All year groups</option>
              {uniqueYearGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isFormOpen && (
          <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {editingClass ? 'Edit class' : 'Add class'}
            </h2>
            <ClassForm
              initialValues={formInitialValues}
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
              submitLabel={editingClass ? 'Save changes' : 'Create class'}
              isLoading={isFormSubmitting}
            />
            {operationErrorMessage && (
              <p className="mt-4 text-xs text-red-700" role="alert">
                {operationErrorMessage}
              </p>
            )}
          </div>
        )}

        {statusMessage && (
          <div
            role="status"
            className="rounded-md border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-900"
          >
            {statusMessage}
          </div>
        )}

        {operationErrorMessage && !isFormOpen && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800" role="alert">
            {operationErrorMessage}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
          >
            {getApiErrorMessage(error)}
          </div>
        )}

        {isLoading ? (
          <div role="status" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Loading classes…
          </div>
        ) : filteredClasses.length === 0 ? (
          <div
            className="rounded-lg border border-dashed border-[--color-border] p-6 text-center"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <p className="text-sm text-[--color-text-secondary]">
              No classes yet. Use the form above to add your first student groups.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button type="button" onClick={handleAddClassClick}>
                Add class
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[--color-border]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[--color-surface] text-[--color-text-secondary]">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Year group</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map((klass) => (
                  <tr key={klass.id} className="border-b border-[--color-border] last:border-b-0">
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>
                      {klass.name}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {klass.yearGroup ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => handleEditClass(klass)}>
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setClassToDelete(klass)}
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

        {classToDelete && (
          <div
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            role="alert"
          >
            <p>
              Are you sure you want to remove {classToDelete.name}? Any scheduled slots that referenced this class
              will need reassignment.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => setClassToDelete(null)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? 'Deleting…' : 'Delete class'}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
