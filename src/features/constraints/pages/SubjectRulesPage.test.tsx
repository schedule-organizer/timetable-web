import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import SubjectRulesPage from '@/features/constraints/pages/SubjectRulesPage'
import type { SubjectRuleDto } from '@/types/subject-rule.types'
import {
  useCreateSubjectRule,
  useDeleteSubjectRule,
  useSubjectRules,
  useUpdateSubjectRule,
} from '@/api/hooks/useSubjectRules'

vi.mock('@/api/hooks/useSubjectRules', () => ({
  useSubjectRules: vi.fn(),
  useCreateSubjectRule: vi.fn(),
  useUpdateSubjectRule: vi.fn(),
  useDeleteSubjectRule: vi.fn(),
}))

const hardRule: SubjectRuleDto = {
  id: 'subject-rule-1',
  name: 'Maximum 1 High-difficulty subject per class per cycle day',
  description: 'Prevents overloading students.',
  constraintType: 'hard',
  enabled: true,
  createdAt: '2026-03-20T08:00:00.000Z',
  updatedAt: '2026-03-20T08:00:00.000Z',
}

const softRule: SubjectRuleDto = {
  id: 'subject-rule-2',
  name: 'Avoid consecutive Maths and Sciences periods',
  description: undefined,
  constraintType: 'soft',
  weight: 7,
  enabled: true,
  satisfactionRate: 85,
  createdAt: '2026-03-21T09:00:00.000Z',
  updatedAt: '2026-03-21T09:00:00.000Z',
}

const fixture: SubjectRuleDto[] = [hardRule, softRule]

const useSubjectRulesMock = vi.mocked(useSubjectRules)
const useCreateSubjectRuleMock = vi.mocked(useCreateSubjectRule)
const useUpdateSubjectRuleMock = vi.mocked(useUpdateSubjectRule)
const useDeleteSubjectRuleMock = vi.mocked(useDeleteSubjectRule)

describe('SubjectRulesPage', () => {
  let createMutate: ReturnType<typeof vi.fn>
  let updateMutate: ReturnType<typeof vi.fn>
  let deleteMutate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    createMutate = vi.fn((_payload, options) => {
      options?.onSuccess?.()
    })
    updateMutate = vi.fn((_payload, options) => {
      options?.onSuccess?.()
    })
    deleteMutate = vi.fn((_payload, options) => {
      options?.onSuccess?.()
    })

    useSubjectRulesMock.mockReturnValue({
      data: { content: fixture },
      isLoading: false,
      error: null,
    })
    useCreateSubjectRuleMock.mockReturnValue({
      mutate: createMutate,
      isPending: false,
      error: null,
    })
    useUpdateSubjectRuleMock.mockReturnValue({
      mutate: updateMutate,
      isPending: false,
      error: null,
    })
    useDeleteSubjectRuleMock.mockReturnValue({
      mutate: deleteMutate,
      isPending: false,
      error: null,
    })
  })

  it('renders the rule list with type badges and weight column', () => {
    render(<SubjectRulesPage />)

    expect(screen.getByText('Maximum 1 High-difficulty subject per class per cycle day')).toBeInTheDocument()
    // soft rule name may appear in both table and satisfaction report
    expect(screen.getAllByText('Avoid consecutive Maths and Sciences periods').length).toBeGreaterThan(0)
    expect(screen.getByText('Hard')).toBeInTheDocument()
    expect(screen.getByText('Soft')).toBeInTheDocument()
    expect(screen.getByText('7 / 10')).toBeInTheDocument()
    // Hard rule weight column shows em-dash
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows empty state when no rules exist', () => {
    useSubjectRulesMock.mockReturnValue({
      data: { content: [] },
      isLoading: false,
      error: null,
    })
    render(<SubjectRulesPage />)

    expect(screen.getByText(/No subject rules yet/i)).toBeInTheDocument()
  })

  it('shows query error banner when fetch fails and hides empty state', () => {
    useSubjectRulesMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Fetch failure'),
    })

    render(<SubjectRulesPage />)

    expect(screen.getByText(/Failed to load subject rules/i)).toBeInTheDocument()
    expect(screen.queryByText(/No subject rules yet/i)).not.toBeInTheDocument()
  })

  it('shows mutation error banner when a mutation fails', () => {
    useCreateSubjectRuleMock.mockReturnValue({
      mutate: createMutate,
      isPending: false,
      error: new Error('Mutation failure'),
    })

    render(<SubjectRulesPage />)

    expect(screen.getByText('Mutation failure')).toBeInTheDocument()
  })

  it('shows validation error when form is submitted without a name', async () => {
    const user = userEvent.setup()
    render(<SubjectRulesPage />)

    await user.click(screen.getByRole('button', { name: /add subject rule/i }))
    await user.click(screen.getByRole('button', { name: /create rule/i }))

    await waitFor(() => {
      expect(screen.getByText('Name is required.')).toBeInTheDocument()
    })
  })

  it('creates a hard constraint rule when form is filled', async () => {
    useSubjectRulesMock.mockReturnValue({
      data: { content: [] },
      isLoading: false,
      error: null,
    })

    const user = userEvent.setup()
    render(<SubjectRulesPage />)

    await user.click(screen.getByRole('button', { name: /add subject rule/i }))
    await user.type(screen.getByLabelText(/rule name/i), 'Max 1 hard subject per day')
    // Hard is already selected by default — submit
    await user.click(screen.getByRole('button', { name: /create rule/i }))

    await waitFor(() => {
      expect(createMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Max 1 hard subject per day',
          constraintType: 'hard',
        }),
        expect.any(Object),
      )
    })
  })

  it('creates a soft constraint rule with weight when soft is selected', async () => {
    useSubjectRulesMock.mockReturnValue({
      data: { content: [] },
      isLoading: false,
      error: null,
    })

    const user = userEvent.setup()
    render(<SubjectRulesPage />)

    await user.click(screen.getByRole('button', { name: /add subject rule/i }))
    await user.type(screen.getByLabelText(/rule name/i), 'Spread PE evenly')

    // Switch to soft
    await user.click(screen.getByRole('radio', { name: /soft/i }))

    await user.click(screen.getByRole('button', { name: /create rule/i }))

    await waitFor(() => {
      expect(createMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Spread PE evenly',
          constraintType: 'soft',
          weight: 5,
        }),
        expect.any(Object),
      )
    })
  })

  it('updates an existing rule when edit is clicked and saved', async () => {
    const user = userEvent.setup()
    render(<SubjectRulesPage />)

    const editButtons = screen.getAllByRole('button', { name: /^edit/i })
    await user.click(editButtons[0])

    const nameInput = screen.getByLabelText(/rule name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Updated rule name')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(updateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'subject-rule-1',
          data: expect.objectContaining({ name: 'Updated rule name' }),
        }),
        expect.any(Object),
      )
    })
  })

  it('deletes a rule after confirmation in the dialog', async () => {
    const user = userEvent.setup()
    render(<SubjectRulesPage />)

    await user.click(screen.getByRole('button', { name: /delete Maximum 1/i }))

    const dialog = screen.getByRole('dialog', { name: /delete rule/i })
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    await waitFor(() => {
      expect(deleteMutate).toHaveBeenCalledWith('subject-rule-1', expect.any(Object))
    })
  })

  it('shows satisfaction report panel for soft rules with satisfactionRate data', () => {
    render(<SubjectRulesPage />)

    expect(screen.getByText(/satisfaction report/i)).toBeInTheDocument()
    // name appears in both table and satisfaction report
    expect(screen.getAllByText('Avoid consecutive Maths and Sciences periods').length).toBeGreaterThan(0)
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('does not show satisfaction report when no soft rules have satisfactionRate', () => {
    useSubjectRulesMock.mockReturnValue({
      data: {
        content: [
          { ...hardRule },
          { ...softRule, satisfactionRate: undefined },
        ],
      },
      isLoading: false,
      error: null,
    })

    render(<SubjectRulesPage />)

    expect(screen.queryByText(/satisfaction report/i)).not.toBeInTheDocument()
  })
})
