import { renderHook, waitFor } from '@testing-library/react'
import { useDashboardData } from '@/hooks/useDashboardData'

describe('useDashboardData()', () => {
  it('resolves without staying in loading state', async () => {
    const { result } = renderHook(() => useDashboardData())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).not.toBeNull()
  })

  it('returns an empty dashboard when Supabase is not configured', async () => {
    const { result } = renderHook(() => useDashboardData())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).not.toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('returned data has correct shape', async () => {
    const { result } = renderHook(() => useDashboardData())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const { data } = result.current
    expect(data!.organisation).toBeDefined()
    expect(Array.isArray(data!.entites)).toBe(true)
    expect(Array.isArray(data!.activity)).toBe(true)
    expect(Array.isArray(data!.membres)).toBe(true)
  })

  it('starts empty when Supabase is not configured', async () => {
    const { result } = renderHook(() => useDashboardData())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data?.entites).toHaveLength(0)
    expect(result.current.data?.activity).toHaveLength(0)
    expect(result.current.data?.membres).toHaveLength(0)
  })

  it('has no loading error', async () => {
    const { result } = renderHook(() => useDashboardData())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeNull()
  })
})
