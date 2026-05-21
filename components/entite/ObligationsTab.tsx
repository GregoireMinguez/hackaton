'use client'

import { useState } from 'react'
import type { Obligation } from '@/lib/eu/types'
import { joursRestants, formatDate, cn } from '@/lib/utils'
import { CheckCircle, Clock, AlertTriangle, Circle } from 'lucide-react'

interface Props { obligations: Obligation[] }

const TYPE_LABELS: Record<string, string> = {
  ag_annuelle: 'AG Annuelle',
  depot_comptes: 'Dépôt comptes',
  mise_a_jour_registre: 'Mise à jour registre',
  renouvellement_mandat: 'Renouvellement mandat',
  declaration_fiscale: 'Déclaration fiscale',
  autre: 'Autre',
}

function ObligationIcon({ statut, jours }: { statut: string; jours: number }) {
  if (statut === 'fait') return <CheckCircle size={16} className="text-green-500" />
  if (statut === 'en_retard' || jours < 0) return <AlertTriangle size={16} className="text-red-500" />
  if (jours <= 7) return <AlertTriangle size={16} className="text-amber-500" />
  return <Circle size={16} className="text-gray-300" />
}

export default function ObligationsTab({ obligations }: Props) {
  const [filter, setFilter] = useState<'toutes' | 'a_faire' | 'fait'>('toutes')
  const [done, setDone] = useState<Set<string>>(new Set())

  const getStatut = (obl: Obligation) => done.has(obl.id) ? 'fait' : obl.statut

  const filtered = obligations.filter(o => {
    const s = getStatut(o)
    return filter === 'toutes' || s === filter
  }).sort((a, b) => joursRestants(a.echeance) - joursRestants(b.echeance))

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['toutes', 'a_faire', 'fait'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
              filter === f ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100',
            )}
          >
            {f === 'toutes' ? 'Toutes' : f === 'a_faire' ? 'À faire' : 'Accomplies'}
            <span className="ml-1 text-[10px] opacity-70">
              ({obligations.filter(o => f === 'toutes' || getStatut(o) === f).length})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
          <CheckCircle size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucune obligation dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(obl => {
            const statut = getStatut(obl)
            const jours = joursRestants(obl.echeance)
            const isUrgent = statut !== 'fait' && jours <= 7
            const isLate = statut !== 'fait' && jours < 0

            return (
              <div
                key={obl.id}
                className={cn(
                  'bg-white rounded-xl border p-4 transition-all',
                  statut === 'fait' ? 'border-green-100 bg-green-50/40' :
                  isLate ? 'border-red-200 bg-red-50' :
                  isUrgent ? 'border-amber-200' : 'border-gray-100',
                )}
              >
                <div className="flex items-start gap-3">
                  <ObligationIcon statut={statut} jours={jours} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('text-sm font-medium', statut === 'fait' ? 'line-through text-gray-400' : 'text-gray-900')}>
                        {obl.titre}
                      </span>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {TYPE_LABELS[obl.type] ?? obl.type}
                      </span>
                    </div>
                    {obl.description && <p className="text-xs text-gray-500 mt-0.5">{obl.description}</p>}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={cn(
                        'text-xs font-medium',
                        statut === 'fait' ? 'text-green-600' :
                        isLate ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-gray-500',
                      )}>
                        {statut === 'fait' ? `✓ Accomplie — ${formatDate(obl.echeance)}` :
                         isLate ? `En retard de ${Math.abs(jours)} jours` :
                         `Échéance : ${formatDate(obl.echeance)} (${jours}j)`}
                      </span>
                    </div>
                  </div>
                  {statut === 'a_faire' && (
                    <button
                      onClick={() => setDone(prev => new Set(prev).add(obl.id))}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-600 border border-indigo-200 px-2.5 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 active:scale-95 transition-all whitespace-nowrap"
                    >
                      <CheckCircle size={11} /> Marquer fait
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
