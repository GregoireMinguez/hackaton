import type { DashboardData } from '@/lib/eu/types'
import { joursRestants } from '@/lib/utils'
import { Building2, AlertTriangle, Globe, FileText } from 'lucide-react'

interface Props { data: DashboardData }

export default function GlobalStats({ data }: Props) {
  const entitesActives = data.entites.filter(e => e.statut === 'active').length
  const alertesUrgentes = data.entites.flatMap(e => e.obligations).filter(o =>
    o.statut === 'a_faire' && joursRestants(o.echeance) <= 7,
  ).length
  const paysCouverts = new Set(data.entites.map(e => e.pays)).size
  const totalDocs = data.entites.flatMap(e => e.documents).length

  const stats = [
    { icon: Building2, label: 'Entités actives', value: entitesActives, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    {
      icon: AlertTriangle,
      label: alertesUrgentes > 0 ? 'Alertes urgentes' : 'Aucune alerte',
      value: alertesUrgentes,
      color: alertesUrgentes > 0 ? 'text-red-600' : 'text-green-600',
      bg: alertesUrgentes > 0 ? 'bg-red-50' : 'bg-green-50',
    },
    { icon: Globe, label: 'Pays couverts', value: paysCouverts, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: FileText, label: 'Documents stockés', value: totalDocs, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map(({ icon: Icon, label, value, color, bg }) => (
        <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={20} className={color} />
          </div>
          <div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 leading-tight">{label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
