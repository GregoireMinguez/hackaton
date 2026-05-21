import Link from 'next/link'
import { LayoutDashboard, Building2, Users, Activity, Settings, ChevronLeft } from 'lucide-react'

const NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Vue d\'ensemble' },
  { href: '/admin/organisations', icon: Building2, label: 'Organisations' },
  { href: '/admin/utilisateurs', icon: Users, label: 'Utilisateurs' },
  { href: '/admin/activite', icon: Activity, label: 'Activité système' },
  { href: '/admin/parametres', icon: Settings, label: 'Config système' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Admin sidebar */}
      <aside className="w-56 bg-gray-900 flex flex-col border-r border-gray-800">
        <div className="px-4 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">A</div>
            <div>
              <div className="text-white text-xs font-bold">Admin Panel</div>
              <div className="text-gray-500 text-[10px]">EU Company OS</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-300">
            <ChevronLeft size={13} /> Retour à l'app
          </Link>
        </div>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  )
}
