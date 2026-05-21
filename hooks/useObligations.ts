'use client'

import { useMemo } from 'react'
import { useDashboardData } from '@/hooks/useDashboardData'
import { joursRestants } from '@/lib/utils'

export function useObligations() {
  const { data, loading } = useDashboardData()

  const toutes = useMemo(
    () => data?.entites.flatMap(e =>
      e.obligations.map(o => ({ ...o, entiteNom: e.nom_legal, entiePays: e.pays })),
    ) ?? [],
    [data],
  )

  const urgentes = useMemo(
    () => toutes.filter(o => o.statut === 'a_faire' && joursRestants(o.echeance) <= 7),
    [toutes],
  )

  const enRetard = useMemo(
    () => toutes.filter(o => o.statut === 'a_faire' && joursRestants(o.echeance) < 0),
    [toutes],
  )

  return { toutes, urgentes, enRetard, loading }
}
