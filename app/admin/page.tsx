import { MOCK_DATA } from '@/lib/mock-data'
import { PAYS_EU } from '@/lib/eu/pays'
import { Building2, Users, FileText, AlertTriangle, TrendingUp, Globe } from 'lucide-react'

// In production this would query all organisations from Supabase with service role key
const MOCK_ORGS = [
  { id: 'org-1', nom: 'Lumia Technologies', plan: 'scale', entites: 3, membres: 4, created: '2023-06-01' },
  { id: 'org-2', nom: 'AlphaVentures SAS', plan: 'starter', entites: 1, membres: 2, created: '2025-01-15' },
  { id: 'org-3', nom: 'NordTech GmbH', plan: 'scale', entites: 5, membres: 8, created: '2024-03-20' },
  { id: 'org-4', nom: 'IberiaSoft S.L.', plan: 'enterprise', entites: 12, membres: 15, created: '2023-11-01' },
  { id: 'org-5', nom: 'BeneluxAI BV', plan: 'starter', entites: 2, membres: 3, created: '2025-04-10' },
]

const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-gray-100 text-gray-600',
  scale: 'bg-indigo-100 text-indigo-700',
  enterprise: 'bg-purple-100 text-purple-700',
}

export default function AdminPage() {
  const totalOrgs = MOCK_ORGS.length
  const totalEntites = MOCK_ORGS.reduce((s, o) => s + o.entites, 0)
  const totalMembres = MOCK_ORGS.reduce((s, o) => s + o.membres, 0)
  const totalDocs = MOCK_DATA.entites.flatMap(e => e.documents).length
  const planCounts = MOCK_ORGS.reduce<Record<string, number>>((acc, o) => {
    acc[o.plan] = (acc[o.plan] ?? 0) + 1
    return acc
  }, {})
  const paysActifs = new Set(MOCK_DATA.entites.map(e => e.pays))

  return (
    <div className="p-6 text-white">
      {/* Page header */}
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">Administration</div>
        <h1 className="text-2xl font-bold text-white">Vue d'ensemble système</h1>
        <p className="text-gray-400 text-sm">Monitoring global de EU Company OS</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: Building2, label: 'Organisations', value: totalOrgs, sub: `${planCounts.scale ?? 0} Scale · ${planCounts.enterprise ?? 0} Ent.`, color: 'text-indigo-400', bg: 'bg-indigo-950' },
          { icon: Globe, label: 'Entités légales', value: totalEntites, sub: `${paysActifs.size} pays EU couverts`, color: 'text-blue-400', bg: 'bg-blue-950' },
          { icon: Users, label: 'Utilisateurs', value: totalMembres, sub: 'Membres actifs', color: 'text-green-400', bg: 'bg-green-950' },
          { icon: FileText, label: 'Documents', value: totalDocs, sub: 'Certificats EU inclus', color: 'text-purple-400', bg: 'bg-purple-950' },
        ].map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4 border border-gray-800`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} className={color} />
              <span className="text-xs text-gray-400 font-medium">{label}</span>
            </div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Organisations table */}
        <div className="col-span-2 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Organisations</span>
            <span className="text-xs text-gray-500">{totalOrgs} au total</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase text-gray-500">Organisation</th>
                <th className="text-center px-4 py-2 text-[10px] font-semibold uppercase text-gray-500">Plan</th>
                <th className="text-center px-4 py-2 text-[10px] font-semibold uppercase text-gray-500">Entités</th>
                <th className="text-center px-4 py-2 text-[10px] font-semibold uppercase text-gray-500">Membres</th>
                <th className="text-right px-4 py-2 text-[10px] font-semibold uppercase text-gray-500">Créé</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ORGS.map(org => (
                <tr key={org.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-700 rounded text-white text-[10px] font-bold flex items-center justify-center">
                        {org.nom[0]}
                      </div>
                      <span className="text-gray-200 text-xs font-medium">{org.nom}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${PLAN_COLORS[org.plan]}`}>
                      {org.plan}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center text-xs text-gray-300">{org.entites}</td>
                  <td className="px-4 py-2.5 text-center text-xs text-gray-300">{org.membres}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-gray-500">{org.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Revenue by plan */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Répartition plans</div>
            {Object.entries(planCounts).map(([plan, count]) => (
              <div key={plan} className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize text-gray-300">{plan}</span>
                    <span className="text-gray-500">{count} org.</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${plan === 'enterprise' ? 'bg-purple-500' : plan === 'scale' ? 'bg-indigo-500' : 'bg-gray-500'}`}
                      style={{ width: `${(count / totalOrgs) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* MRR estimate */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">MRR Estimé</div>
            <div className="text-3xl font-bold text-green-400">
              {((planCounts.scale ?? 0) * 199 + (planCounts.enterprise ?? 0) * 999).toLocaleString('fr')} €
            </div>
            <div className="text-xs text-gray-500 mt-1">Mensuel récurrent</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={12} className="text-green-400" />
              <span className="text-xs text-green-400">+2 nouveaux clients ce mois</span>
            </div>
          </div>

          {/* System health */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Santé système</div>
            {[
              { label: 'API Supabase', status: 'ok' },
              { label: 'Auth', status: 'ok' },
              { label: 'Storage docs', status: 'ok' },
              { label: 'Alertes cron', status: 'ok' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{s.label}</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-400">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  OK
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-5 bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Activité récente — toutes organisations</div>
        <div className="space-y-2">
          {MOCK_DATA.activity.slice(0, 5).map(log => (
            <div key={log.id} className="flex items-center gap-3 text-xs">
              <span className="text-gray-600 w-32 flex-shrink-0 font-mono">
                {new Date(log.created_at).toLocaleString('fr', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-indigo-400 flex-shrink-0">[Lumia Technologies]</span>
              <span className="text-gray-300">{log.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
