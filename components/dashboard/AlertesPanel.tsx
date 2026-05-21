import Link from 'next/link'
import type { DashboardData, Obligation } from '@/lib/eu/types'
import { joursRestants, formatDateRelative } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { getPaysParCode } from '@/lib/eu/pays'

interface Props { data: DashboardData }

function urgenceLabel(jours: number, statut: string) {
  if (statut === 'en_retard' || jours < 0) return { label: 'EN RETARD', cls: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
  if (jours <= 3) return { label: `${jours}j — URGENT`, cls: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
  if (jours <= 7) return { label: `${jours}j — Cette semaine`, cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' }
  if (jours <= 30) return { label: formatDateRelative(new Date(Date.now() + jours * 86400000).toISOString()), cls: 'bg-blue-50 text-blue-700', dot: 'bg-blue-400' }
  return { label: formatDateRelative(new Date(Date.now() + jours * 86400000).toISOString()), cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' }
}

export default function AlertesPanel({ data }: Props) {
  const obligations: Array<Obligation & { entiteNom: string; entiteId: string }> = data.entites
    .flatMap(e => e.obligations.map(o => ({ ...o, entiteNom: e.nom_legal, entiteId: e.id })))
    .filter(o => o.statut === 'a_faire')
    .sort((a, b) => joursRestants(a.echeance) - joursRestants(b.echeance))
    .slice(0, 6)

  if (obligations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Actions requises</div>
        <div className="text-center py-6 text-gray-400">
          <div className="text-2xl mb-2">✅</div>
          <p className="text-sm">Aucune obligation urgente</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">Actions requises</div>
        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
          {obligations.filter(o => joursRestants(o.echeance) <= 7).length} urgentes
        </span>
      </div>

      <div className="space-y-2">
        {obligations.map(obl => {
          const jours = joursRestants(obl.echeance)
          const { label, cls, dot } = urgenceLabel(jours, obl.statut)
          return (
            <Link
              key={obl.id}
              href={`/entites/${obl.entiteId}`}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cls}`}>{label}</span>
                </div>
                <div className="text-sm font-medium text-gray-900 truncate">{obl.titre}</div>
                <div className="text-xs text-gray-500 truncate">{obl.entiteNom}</div>
              </div>
              <ChevronRight size={14} className="text-gray-300 mt-1 group-hover:text-indigo-500 flex-shrink-0" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
