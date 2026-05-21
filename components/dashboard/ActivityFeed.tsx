import type { ActivityLog } from '@/lib/eu/types'
import { initiales, formatDateRelative } from '@/lib/utils'

interface Props { activity: ActivityLog[] }

export default function ActivityFeed({ activity }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Activité récente</div>

      <div className="space-y-3">
        {activity.slice(0, 6).map(log => (
          <div key={log.id} className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              {log.user_nom ? initiales(log.user_nom) : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 leading-snug">{log.action}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {log.user_nom} · {formatDateRelative(log.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
