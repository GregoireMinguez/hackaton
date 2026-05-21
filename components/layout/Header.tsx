'use client'

import { Bell, HelpCircle, Sun, Moon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

interface HeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [initiales, setInitiales] = useState('?')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    async function loadUser() {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const name = (user.user_metadata?.full_name as string) ?? ''
      const email = user.email ?? ''
      setInitiales(
        name
          ? name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
          : email[0]?.toUpperCase() ?? '?'
      )
      setAvatarUrl((user.user_metadata?.avatar_url as string) ?? '')
    }
    loadUser()
  }, [])

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-4 sticky top-0 z-30 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-gray-900 truncate">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {action}

        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title={resolvedTheme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}

        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <Link href="/guide" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <HelpCircle size={16} />
        </Link>

        <Link href="/profil" className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="profil" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {initiales}
            </div>
          )}
        </Link>
      </div>
    </header>
  )
}
