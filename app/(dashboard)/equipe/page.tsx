'use client'

import { useState } from 'react'
import { useDashboardData } from '@/hooks/useDashboardData'
import Header from '@/components/layout/Header'
import { initiales } from '@/lib/utils'
import { UserPlus, Mail, Check, X, Crown, Shield, Eye, Users, ChevronDown } from 'lucide-react'

const ROLES = [
  { value: 'admin', label: 'Admin', description: 'Peut modifier toutes les données', icon: Shield, color: 'text-purple-600 bg-purple-50' },
  { value: 'member', label: 'Membre', description: 'Accès en lecture et édition limitée', icon: Users, color: 'text-blue-600 bg-blue-50' },
  { value: 'viewer', label: 'Lecteur', description: 'Consultation uniquement', icon: Eye, color: 'text-gray-600 bg-gray-100' },
  { value: 'externe', label: 'Externe (avocat, VC)', description: 'Accès entités et certificats EU', icon: Eye, color: 'text-amber-600 bg-amber-50' },
]

const ROLE_DISPLAY: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  owner: { label: 'Propriétaire', color: 'text-indigo-700 bg-indigo-100', icon: Crown },
  admin: { label: 'Admin', color: 'text-purple-700 bg-purple-100', icon: Shield },
  member: { label: 'Membre', color: 'text-blue-700 bg-blue-100', icon: Users },
  viewer: { label: 'Lecteur', color: 'text-gray-600 bg-gray-100', icon: Eye },
  externe: { label: 'Externe', color: 'text-amber-700 bg-amber-100', icon: Eye },
}

function Avatar({ email, size = 'md' }: { email: string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'w-12 h-12 text-base' : size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-sm'
  return (
    <div className={`${sz} rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold flex-shrink-0`}>
      {initiales(email.split('@')[0])}
    </div>
  )
}

export default function EquipePage() {
  const { data } = useDashboardData()
  const [showInvite, setShowInvite] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [showRoles, setShowRoles] = useState(false)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const membres = data?.membres ?? []
  const owner = membres.find(m => m.role === 'owner')
  const others = membres.filter(m => m.role !== 'owner')

  const selectedRole = ROLES.find(r => r.value === role) ?? ROLES[0]

  const handleEnvoyer = () => {
    if (!email.trim()) return
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setShowInvite(false)
      setEmail('')
      setRole('member')
      setToast(`Invitation envoyée à ${email}`)
      setTimeout(() => setToast(null), 4000)
    }, 1200)
  }

  return (
    <div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-green-200 rounded-2xl shadow-xl p-4 flex items-center gap-3 max-w-sm animate-in slide-in-from-bottom-2">
          <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Check size={16} className="text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-900 flex-1">{toast}</span>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      <Header
        title="Équipe & accès"
        subtitle={`${membres.length} membre${membres.length > 1 ? 's' : ''} · Gérez les accès à votre organisation`}
        action={
          <button
            onClick={() => setShowInvite(v => !v)}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <UserPlus size={15} />
            Inviter un membre
          </button>
        }
      />

      <div className="p-6 max-w-2xl space-y-5">

        {/* Invite panel */}
        {showInvite && (
          <div className="bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden">
            <div className="bg-indigo-50 px-5 py-3 border-b border-indigo-100 flex items-center justify-between">
              <div className="text-sm font-semibold text-indigo-900">Inviter un nouveau membre</div>
              <button onClick={() => setShowInvite(false)} className="text-indigo-400 hover:text-indigo-600 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Adresse e-mail *</label>
                <input
                  type="email"
                  placeholder="collaborateur@startup.eu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleEnvoyer()}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Niveau d'accès</label>
                <div className="relative">
                  <button
                    onClick={() => setShowRoles(v => !v)}
                    className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${selectedRole.color}`}>{selectedRole.label}</span>
                      <span className="text-gray-500 text-xs">{selectedRole.description}</span>
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${showRoles ? 'rotate-180' : ''}`} />
                  </button>
                  {showRoles && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                      {ROLES.map(r => (
                        <button
                          key={r.value}
                          onClick={() => { setRole(r.value); setShowRoles(false) }}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${role === r.value ? 'bg-indigo-50' : ''}`}
                        >
                          <r.icon size={14} className={`mt-0.5 flex-shrink-0 ${r.color.split(' ')[0]}`} />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{r.label}</div>
                            <div className="text-xs text-gray-500">{r.description}</div>
                          </div>
                          {role === r.value && <Check size={14} className="ml-auto text-indigo-600 flex-shrink-0 mt-0.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleEnvoyer}
                disabled={!email.trim() || sending}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {sending ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi en cours…</>
                ) : (
                  <><Mail size={14} /> Envoyer l'invitation</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Vous */}
        {owner && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Votre compte</div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
              <Avatar email={owner.email} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">{owner.email}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-indigo-700 bg-indigo-100 flex items-center gap-1">
                    <Crown size={9} /> Propriétaire
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Accès complet · Tous les droits</div>
              </div>
            </div>
          </div>
        )}

        {/* Autres membres */}
        {others.length > 0 ? (
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              Membres de l'équipe ({others.length})
            </div>
            <div className="space-y-2">
              {others.map(m => {
                const cfg = ROLE_DISPLAY[m.role] ?? ROLE_DISPLAY.viewer
                const RoleIcon = cfg.icon
                return (
                  <div key={m.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                    <Avatar email={m.email} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 text-sm">{m.email}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${cfg.color}`}>
                          <RoleIcon size={9} /> {cfg.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {m.accepted_at ? 'Accès confirmé' : 'Invitation en attente'}
                      </div>
                    </div>
                    <a
                      href={`mailto:${m.email}`}
                      className="text-gray-300 hover:text-indigo-500 transition-colors p-1.5 rounded-lg hover:bg-indigo-50"
                      title="Envoyer un e-mail"
                    >
                      <Mail size={15} />
                    </a>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-8 text-center">
            <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center mx-auto mb-3">
              <Users size={20} className="text-gray-400" />
            </div>
            <div className="font-semibold text-gray-700 text-sm mb-1">Vous êtes seul pour l'instant</div>
            <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">
              Invitez des collaborateurs, avocats ou investisseurs pour qu'ils accèdent à vos entités EU.
            </p>
            <button
              onClick={() => setShowInvite(true)}
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              <UserPlus size={14} /> Inviter maintenant
            </button>
          </div>
        )}

        {/* Accès externe info */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Eye size={15} className="text-amber-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-800 mb-0.5">Accès Externe — VCs & Avocats</div>
            <p className="text-xs text-amber-700 leading-relaxed">
              Les membres "Externe" voient les entités légales et les certificats EU, sans pouvoir modifier les données. Idéal lors d'une due diligence.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
