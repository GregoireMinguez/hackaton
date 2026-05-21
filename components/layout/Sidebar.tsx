'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Building2, PlusCircle, BarChart3,
  FileText, Users, Settings, BookOpen, LogOut,
  Leaf, Factory, ShieldCheck, ScrollText, TrendingUp,
} from 'lucide-react'

const NAV_ENTITES = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Vue globale' },
  { href: '/entites', icon: Building2, label: 'Mes entités' },
  { href: '/filiales/nouvelle', icon: PlusCircle, label: 'Créer une filiale' },
  { href: '/cap-table', icon: BarChart3, label: 'Cap Table' },
  { href: '/documents', icon: FileText, label: 'Documents' },
]

const NAV_MACF = [
  { href: '/macf', icon: Leaf, label: 'Tableau de bord' },
  { href: '/macf/fournisseurs', icon: Factory, label: 'Fournisseurs' },
  { href: '/macf/certificats', icon: ShieldCheck, label: 'Certificats' },
  { href: '/macf/declaration', icon: ScrollText, label: 'Déclaration' },
  { href: '/macf/simulateur', icon: TrendingUp, label: 'Simulateur' },
]

const NAV_BOTTOM = [
  { href: '/equipe', icon: Users, label: 'Équipe & accès' },
  { href: '/parametres', icon: Settings, label: 'Paramètres' },
  { href: '/guide', icon: BookOpen, label: 'Guide 2025/25' },
]

export default function Sidebar() {
  const path = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    async function loadUser() {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserEmail(user.email ?? '')
      setUserName((user.user_metadata?.full_name as string) ?? '')
      setAvatarUrl((user.user_metadata?.avatar_url as string) ?? '')
    }
    loadUser()
  }, [])

  async function handleLogout() {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initiales = userName
    ? userName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : userEmail?.[0]?.toUpperCase() ?? '?'

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => {
    const active = path === href || (href !== '/dashboard' && path.startsWith(href))
    return (
      <Link
        href={href}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
          active
            ? 'bg-indigo-600 text-white font-medium'
            : 'text-slate-400 hover:text-white hover:bg-slate-800',
        )}
      >
        <Icon size={16} />
        {label}
      </Link>
    )
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-eu-dark flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-base">🇪🇺</div>
          <div>
            <div className="text-white font-bold text-sm leading-none">EU Company OS</div>
            <div className="text-slate-500 text-[10px] mt-0.5">Directive 2025/25</div>
          </div>
        </div>
      </div>

      {/* Org badge */}
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-500 rounded text-white text-xs font-bold flex items-center justify-center">LT</div>
          <div className="min-w-0">
            <div className="text-white text-xs font-medium truncate">Lumia Technologies</div>
            <div className="text-slate-500 text-[10px]">Plan Scale</div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        <div className="pb-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-3">Entités EU · Directive 2025/25</div>
        </div>
        {NAV_ENTITES.map(item => <NavItem key={item.href} {...item} />)}

        <div className="pt-3 pb-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-3">MACF / CBAM · 2023/956</div>
        </div>
        {NAV_MACF.map(item => <NavItem key={item.href} {...item} />)}

        <div className="pt-3 pb-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-3">Gestion</div>
        </div>
        {NAV_BOTTOM.map(item => <NavItem key={item.href} {...item} />)}
      </nav>

      {/* Badges conformité */}
      <div className="px-4 py-3 border-t border-slate-800 space-y-2">
        <div className="bg-indigo-950 rounded-lg px-3 py-2">
          <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">Directive 2025/25</div>
          <div className="text-[10px] text-slate-400">Entités transfrontalières EU</div>
        </div>
        <div className="bg-emerald-950 rounded-lg px-3 py-2">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">MACF · 2023/956</div>
          <div className="text-[10px] text-slate-400">Déclaration et restitution 30 sept. 2027</div>
        </div>
      </div>

      {/* User profile */}
      <div className="px-3 pb-4 border-t border-slate-800 pt-3">
        <Link
          href="/profil"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full',
            path === '/profil' ? 'bg-indigo-600' : 'hover:bg-slate-800',
          )}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initiales}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-white text-xs font-medium truncate">{userName || userEmail}</div>
            <div className="text-slate-500 text-[10px] truncate">Mon profil</div>
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition-colors w-full mt-0.5"
        >
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
