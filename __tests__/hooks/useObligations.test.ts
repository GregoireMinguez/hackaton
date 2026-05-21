import { renderHook, waitFor } from '@testing-library/react'
import { useObligations } from '@/hooks/useObligations'
import { MOCK_DATA } from '@/lib/mock-data'

describe('useObligations()', () => {
  it('returns all obligations across all entities', async () => {
    const { result } = renderHook(() => useObligations())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const totalExpected = MOCK_DATA.entites.flatMap(e => e.obligations).length
    expect(result.current.toutes.length).toBe(totalExpected)
  })

  it('urgent obligations all have echeance within 7 days', async () => {
    const { result } = renderHook(() => useObligations())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const today = new Date()
    result.current.urgentes.forEach(o => {
      const diff = Math.ceil((new Date(o.echeance).getTime() - today.getTime()) / 86400000)
      expect(diff).toBeLessThanOrEqual(7)
    })
  })

  it('overdue obligations all have echeance in the past', async () => {
    const { result } = renderHook(() => useObligations())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const today = new Date()
    result.current.enRetard.forEach(o => {
      const diff = new Date(o.echeance).getTime() - today.getTime()
      expect(diff).toBeLessThan(0)
    })
  })

  it('urgent obligations are a subset of all obligations', async () => {
    const { result } = renderHook(() => useObligations())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const allIds = new Set(result.current.toutes.map(o => o.id))
    result.current.urgentes.forEach(o => {
      expect(allIds.has(o.id)).toBe(true)
    })
  })

  it('mock data has at least one urgent obligation', async () => {
    const { result } = renderHook(() => useObligations())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.urgentes.length).toBeGreaterThan(0)
  })
})
