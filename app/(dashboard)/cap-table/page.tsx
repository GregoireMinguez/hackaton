'use client'

import { useDashboardData } from '@/hooks/useDashboardData'
import Header from '@/components/layout/Header'
import CapTableTable from '@/components/captable/CapTableTable'
import GroupeStructure from '@/components/captable/GroupeStructure'

export default function CapTablePage() {
  const { data, loading } = useDashboardData()

  const entitesAvecAssocie = data?.entites.filter(e => e.associes.length > 0) ?? []
  const totalActions = data?.entites.flatMap(e => e.associes).reduce((s, a) => s + a.nb_actions, 0) ?? 0

  return (
    <div>
      <Header
        title="Cap Table consolidée"
        subtitle={`Structure multi-pays · ${totalActions.toLocaleString('fr')} actions totales`}
      />

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-100 h-48 animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Group structure */}
            {data && <GroupeStructure entites={data.entites} />}

            {/* Cap tables by entity */}
            {entitesAvecAssocie.map(e => (
              <CapTableTable key={e.id} associes={e.associes} entiteNom={e.nom_legal} />
            ))}

            {/* Consolidated summary */}
            {data && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Vue consolidée groupe</div>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Entités', value: data.entites.length },
                    { label: 'Total actions', value: totalActions.toLocaleString('fr') },
                    { label: 'Investisseurs', value: data.entites.flatMap(e => e.associes).filter(a => a.type === 'investisseur').length },
                    { label: 'ESOP actif', value: data.entites.flatMap(e => e.associes).filter(a => a.type === 'esop_pool').reduce((s, a) => s + a.nb_actions, 0).toLocaleString('fr') + ' options' },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-xl font-bold text-gray-900">{s.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
