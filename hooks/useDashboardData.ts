'use client'

import { useState, useEffect } from 'react'
import type { DashboardData } from '@/lib/eu/types'
import { MOCK_DATA } from '@/lib/mock-data'
import { getLocalEntites } from '@/lib/local-store'

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (USE_MOCK) {
      const localEntites = getLocalEntites()
      setData({
        ...MOCK_DATA,
        entites: [...MOCK_DATA.entites, ...localEntites],
      })
      setLoading(false)
      return
    }

    async function fetchData() {
      const localEntites = getLocalEntites()
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const { fetchDashboardData } = await import('@/lib/supabase/fetchDashboardData')
        const supabase = createClient()
        const dashboardData = await fetchDashboardData(supabase)
        if (!dashboardData) {
          setData({ ...MOCK_DATA, entites: [...MOCK_DATA.entites, ...localEntites] })
          setLoading(false)
          return
        }
        setData({ ...dashboardData, entites: [...dashboardData.entites, ...localEntites] })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
        setData({ ...MOCK_DATA, entites: [...MOCK_DATA.entites, ...localEntites] })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
