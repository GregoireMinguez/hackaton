'use client'

import type { Associe } from '@/lib/eu/types'
import { initiales, cn } from '@/lib/utils'

interface Props {
  associes: Associe[]
  entiteNom: string
}

const TYPE_COLORS: Record<string, string> = {
  fondateur: 'bg-indigo-100 text-indigo-700',
  investisseur: 'bg-purple-100 text-purple-700',
  employe: 'bg-blue-100 text-blue-700',
  esop_pool: 'bg-green-100 text-green-700',
  autre: 'bg-gray-100 text-gray-600',
}

const TYPE_LABELS: Record<string, string> = {
  fondateur: 'Fondateur', investisseur: 'Investisseur',
  employe: 'Employé', esop_pool: 'ESOP Pool', autre: 'Autre',
}

export default function CapTableTable({ associes, entiteNom }: Props) {
  const total = associes.reduce((s, a) => s + a.nb_actions, 0)

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50">
        <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">{entiteNom}</div>
        <div className="text-xs text-gray-500">{total.toLocaleString('fr')} actions · {associes.length} associés</div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2 flex gap-0.5 h-3">
        {associes.map(a => {
          const pct = (a.nb_actions / total) * 100
          const colors: Record<string, string> = {
            fondateur: 'bg-indigo-500', investisseur: 'bg-purple-500',
            employe: 'bg-blue-400', esop_pool: 'bg-green-400', autre: 'bg-gray-300',
          }
          return (
            <div
              key={a.id}
              style={{ width: `${pct}%` }}
              className={cn('rounded-full h-full', colors[a.type] ?? 'bg-gray-300')}
              title={`${a.nom}: ${pct.toFixed(1)}%`}
            />
          )
        })}
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-50">
            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Associé</th>
            <th className="text-right px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            <th className="text-right px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">%</th>
            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
          </tr>
        </thead>
        <tbody>
          {associes.map(a => (
            <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                    {initiales(a.nom)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{a.nom}</div>
                    {a.email && <div className="text-xs text-gray-400">{a.email}</div>}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm">{a.nb_actions.toLocaleString('fr')}</td>
              <td className="px-4 py-3 text-right font-bold text-sm">{((a.nb_actions / total) * 100).toFixed(1)}%</td>
              <td className="px-4 py-3">
                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', TYPE_COLORS[a.type] ?? 'bg-gray-100 text-gray-600')}>
                  {TYPE_LABELS[a.type] ?? a.type}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
