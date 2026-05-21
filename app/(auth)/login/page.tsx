'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

type Mode = 'link' | 'password'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('link')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      if (mode === 'link') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        })
        if (error) throw error
        setSent(true)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-eu-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🇪🇺</div>
          <h1 className="text-2xl font-bold text-white">EU Company OS</h1>
          <p className="text-slate-400 text-sm mt-1">Cadre européen des sociétés transfrontalières — Droit des Sociétés Numérique</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <h2 className="text-lg font-semibold mb-4">Connexion</h2>

          {/* Toggle mode */}
          <div className="flex bg-gray-100 rounded-lg p-0.5 mb-5">
            <button
              type="button"
              onClick={() => { setMode('link'); setError(''); setSent(false) }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'link' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Lien par email
            </button>
            <button
              type="button"
              onClick={() => { setMode('password'); setError(''); setSent(false) }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'password' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Mot de passe
            </button>
          </div>

          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">📧</div>
              <p className="text-sm font-medium text-green-800">Lien envoyé à {email}</p>
              <p className="text-xs text-green-600 mt-1">Vérifiez votre boîte mail</p>
              <button
                onClick={() => setSent(false)}
                className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Renvoyer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="sarah@startup.eu"
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {mode === 'password' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-1"
              >
                {loading ? 'Connexion...' : mode === 'link' ? 'Envoyer le lien' : 'Se connecter'}
              </button>
            </form>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-2 text-xs text-gray-400">ou</span></div>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full border border-indigo-200 text-indigo-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors"
          >
            Voir la démo — Lumia Technologies
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Conforme RGPD · Données hébergées dans l'Union européenne
        </p>
      </div>
    </div>
  )
}
