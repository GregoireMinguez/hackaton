import type { ActivityLog } from '@/lib/eu/types'
import { initiales, formatDateRelative } from '@/lib/utils'

interface Props { activity: ActivityLog[] }

export default function HistoriqueTab({ activity }: Props) {
  if (activity.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
        <p className="text-sm">Aucun historique disponible</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-100" />
      <div className="space-y-4">
        {activity.map(log => (
          <div key={log.id} className="flex items-start gap-4 pl-8 relative">
            <div className="absolute left-0 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-indigo-600">
              {log.user_nom ? initiales(log.user_nom) : '?'}
            </div>
            <div className="flex-1 bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-sm text-gray-800">{log.action}</p>
              <p className="text-xs text-gray-400 mt-1">
                {log.user_nom} · {formatDateRelative(log.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
