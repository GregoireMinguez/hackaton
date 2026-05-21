import { renderHook, waitFor } from '@testing-library/react'
import { useEntite } from '@/hooks/useEntite'
import { MOCK_DATA } from '@/lib/mock-data'

describe('useEntite()', () => {
  it('returns the correct entity by ID', async () => {
    const targetId = MOCK_DATA.entites[0].id
    const { result } = renderHook(() => useEntite(targetId))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.entite).not.toBeNull()
    expect(result.current.entite!.id).toBe(targetId)
  })

  it('returns null for unknown ID', async () => {
    const { result } = renderHook(() => useEntite('non-existent-id'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.entite).toBeNull()
  })

  it('returns activity filtered to the given entity', async () => {
    const targetId = 'ent-de'
    const { result } = renderHook(() => useEntite(targetId))
    await waitFor(() => expect(result.current.loading).toBe(false))
    result.current.activity.forEach(log => {
      expect(log.entite_id).toBe(targetId)
    })
  })

  it('returns entity with obligations', async () => {
    const targetId = MOCK_DATA.entites.find(e => e.obligations.length > 0)!.id
    const { result } = renderHook(() => useEntite(targetId))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.entite!.obligations.length).toBeGreaterThan(0)
  })

  it('resolves without staying in loading state (mock is synchronous)', async () => {
    const { result } = renderHook(() => useEntite('ent-fr'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.entite).not.toBeNull()
  })
})
