import { renderHook, waitFor } from '@testing-library/react'
import { useDashboardData } from '@/hooks/useDashboardData'
import { MOCK_DATA } from '@/lib/mock-data'

// NEXT_PUBLIC_SUPABASE_URL is not set in test env → always uses mock data
describe('useDashboardData()', () => {
  it('resolves without staying in loading state (mock is synchronous)', async () => {
    const { result } = renderHook(() => useDashboardData())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).not.toBeNull()
  })

  it('returns mock data when Supabase is not configured', async () => {
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

  it('matches MOCK_DATA exactly', async () => {
    const { result } = renderHook(() => useDashboardData())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual(MOCK_DATA)
  })

  it('has no loading error', async () => {
    const { result } = renderHook(() => useDashboardData())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeNull()
  })
})
