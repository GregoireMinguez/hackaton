'use client'

import { useMemo } from 'react'
import { useDashboardData } from '@/hooks/useDashboardData'
import type { EntiteAvecDetails } from '@/lib/eu/types'

export function useEntite(id: string) {
  const { data, loading } = useDashboardData()
  const entite: EntiteAvecDetails | null = useMemo(
    () => data?.entites.find(e => e.id === id) ?? null,
    [data, id],
  )
  const activity = useMemo(
    () => data?.activity.filter(a => a.entite_id === id) ?? [],
    [data, id],
  )
  return { entite, activity, loading }
}
