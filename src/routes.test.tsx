import { describe, expect, it } from 'vitest'
import { matchRoutes } from 'react-router-dom'
import { router } from '@/routes'

describe('router', () => {
  it('includes the constraints soft route', () => {
    const matches = matchRoutes(router.routes, '/constraints/soft')
    expect(matches).toBeTruthy()
    expect(matches?.some((match) => match.route.path === 'soft')).toBe(true)
  })
})
