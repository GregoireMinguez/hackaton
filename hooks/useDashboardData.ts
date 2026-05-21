'use client'

import { useState, useEffect } from 'react'
import type { DashboardData } from '@/lib/eu/types'
import { getLocalEntites } from '@/lib/local-store'

const EMPTY_DASHBOARD_DATA: DashboardData = {
  organisation: {
    id: '',
    owner_user_id: '',
    nom: '',
    plan_abonnement: 'starter',
    created_at: '',
    updated_at: '',
  },
  entites: [],
  activity: [],
  membres: [],
}

const HAS_SUPABASE = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const localEntites = getLocalEntites()

    if (!HAS_SUPABASE) {
      setData({ ...EMPTY_DASHBOARD_DATA, entites: localEntites })
      setLoading(false)
      return
    }

    async function fetchData() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const { fetchDashboardData } = await import('@/lib/supabase/fetchDashboardData')
        const supabase = createClient()
        const dashboardData = await fetchDashboardData(supabase)
        if (!dashboardData) {
          setData({ ...EMPTY_DASHBOARD_DATA, entites: localEntites })
          setLoading(false)
          return
        }
        setData({ ...dashboardData, entites: [...dashboardData.entites, ...localEntites] })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
        setData({ ...EMPTY_DASHBOARD_DATA, entites: localEntites })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
