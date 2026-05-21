'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { useDashboardData } from '@/hooks/useDashboardData'
import { Check, X } from 'lucide-react'

export default function ParametresPage() {
  const { data } = useDashboardData()
  const [saved, setSaved] = useState(false)
  const [orgNom, setOrgNom] = useState(data?.organisation.nom ?? 'Lumia Technologies')
  const [toast, setToast] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 500))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const plan = data?.organisation.plan_abonnement ?? 'scale'

  return (
    <div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-green-200 rounded-2xl shadow-xl p-4 flex items-center gap-3 max-w-sm">
          <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Check size={16} className="text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-900 flex-1">{toast}</span>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
        </div>
      )}
      <Header title="Paramètres" subtitle="Configuration de votre organisation" />

      <div className="p-6 max-w-2xl space-y-6">
        {/* Organisation */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Organisation</div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Nom de l'organisation</label>
              <input
                type="text"
                value={orgNom}
                onChange={e => setOrgNom(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email de contact</label>
              <input
                type="email"
                defaultValue="sarah@lumia.io"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              {saved ? <><Check size={14} /> Sauvegardé</> : 'Sauvegarder'}
            </button>
          </div>
        </div>

        {/* Plan */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Abonnement</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'starter', label: 'Starter', price: 'Gratuit', features: ['1 entité', 'Certificats EU', '1 utilisateur'] },
              { id: 'scale', label: 'Scale', price: '199 €/mois', features: ['Entités illimitées', 'Filiale Express', 'Cap table', '5 utilisateurs'], popular: true },
              { id: 'enterprise', label: 'Enterprise', price: 'Sur devis', features: ['API Certificate EU', 'White-label', 'SLA 99.9%'] },
            ].map(p => (
              <div key={p.id} className={`rounded-xl border-2 p-4 ${plan === p.id ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100'}`}>
                {p.popular && <div className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded mb-2 inline-block font-bold">ACTUEL</div>}
                <div className="font-bold text-gray-900">{p.label}</div>
                <div className={`text-lg font-bold mt-1 mb-2 ${plan === p.id ? 'text-indigo-600' : 'text-gray-900'}`}>{p.price}</div>
                <ul className="space-y-1">
                  {p.features.map(f => <li key={f} className="text-xs text-gray-600 flex items-center gap-1"><Check size={10} className="text-green-500" />{f}</li>)}
                </ul>
                {plan !== p.id && (
                  <button
                    onClick={() => showToast(p.id === 'enterprise' ? 'Notre équipe vous contactera sous 24h.' : `Passage au plan ${p.label} en cours…`)}
                    className="mt-3 w-full text-xs border border-indigo-200 text-indigo-600 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 active:scale-95 transition-all font-semibold"
                  >
                    {p.id === 'enterprise' ? 'Contacter' : 'Changer'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Notifications</div>
          <div className="space-y-3">
            {[
              { label: 'Alertes obligations urgentes (< 7 jours)', defaultChecked: true },
              { label: 'Rappels mensuels compliance', defaultChecked: true },
              { label: 'Nouvelles fonctionnalités EU Company OS', defaultChecked: false },
              { label: 'Mises à jour Directive 2025/25', defaultChecked: true },
            ].map(n => (
              <label key={n.label} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked={n.defaultChecked} className="w-4 h-4 text-indigo-600 rounded" />
                <span className="text-sm text-gray-700">{n.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-red-50 rounded-xl border border-red-100 p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-4">Zone dangereuse</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">Supprimer l'organisation</div>
              <div className="text-xs text-gray-500">Supprime toutes les entités, documents et données associées.</div>
            </div>
            {confirmDelete ? (
              <div className="flex gap-2">
                <button
                  onClick={() => { setConfirmDelete(false); showToast('Suppression annulée.') }}
                  className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => { setConfirmDelete(false); showToast('Fonctionnalité désactivée en mode démo.') }}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
                >
                  Confirmer
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 active:scale-95 transition-all"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
