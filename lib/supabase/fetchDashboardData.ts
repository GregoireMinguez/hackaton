import type {
  DashboardData,
  Organisation,
  EntiteAvecDetails,
  Obligation,
  Representant,
  Document,
  Associe,
  ActivityLog,
  MembreEquipe,
} from '@/lib/eu/types'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function fetchDashboardData(supabase: SupabaseClient): Promise<DashboardData | null> {
  // 1. Authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 2. Organisation (owner or member)
  const { data: orgRows } = await supabase
    .from('organisations')
    .select('*')
    .limit(1)
  const organisation = orgRows?.[0] as Organisation | undefined
  if (!organisation) return null

  const orgId = organisation.id

  // 3. All entities for this org
  const { data: entiteRows } = await supabase
    .from('entites_legales')
    .select('*')
    .eq('organisation_id', orgId)
    .order('created_at', { ascending: true })

  if (!entiteRows || entiteRows.length === 0) {
    const { data: membres } = await supabase
      .from('membres_equipe')
      .select('*')
      .eq('organisation_id', orgId)
    return {
      organisation,
      entites: [],
      activity: [],
      membres: (membres ?? []) as MembreEquipe[],
    }
  }

  const entiteIds = entiteRows.map((e: { id: string }) => e.id)

  // 4. Fetch related data in parallel
  const [
    { data: obligations },
    { data: representants },
    { data: documents },
    { data: associes },
    { data: activity },
    { data: membres },
  ] = await Promise.all([
    supabase
      .from('obligations')
      .select('*')
      .in('entite_id', entiteIds)
      .order('echeance', { ascending: true }),
    supabase
      .from('representants')
      .select('*')
      .in('entite_id', entiteIds),
    supabase
      .from('documents')
      .select('*')
      .in('entite_id', entiteIds)
      .order('created_at', { ascending: false }),
    supabase
      .from('associes')
      .select('*')
      .in('entite_id', entiteIds),
    supabase
      .from('activity_log')
      .select('*')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('membres_equipe')
      .select('*')
      .eq('organisation_id', orgId),
  ])

  // 5. Assemble EntiteAvecDetails by joining related rows
  const entites: EntiteAvecDetails[] = entiteRows.map((entite: EntiteAvecDetails) => ({
    ...entite,
    obligations: ((obligations ?? []) as Obligation[]).filter(o => o.entite_id === entite.id),
    representants: ((representants ?? []) as Representant[]).filter(r => r.entite_id === entite.id),
    documents: ((documents ?? []) as Document[]).filter(d => d.entite_id === entite.id),
    associes: ((associes ?? []) as Associe[]).filter(a => a.entite_id === entite.id),
  }))

  return {
    organisation,
    entites,
    activity: (activity ?? []) as ActivityLog[],
    membres: (membres ?? []) as MembreEquipe[],
  }
}
