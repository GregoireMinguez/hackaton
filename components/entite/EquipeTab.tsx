'use client'

import { useState } from 'react'
import type { Representant } from '@/lib/eu/types'
import { formatDate, initiales } from '@/lib/utils'
import { UserPlus, Mail, X, Check } from 'lucide-react'

interface Props { representants: Representant[] }

export default function EquipeTab({ representants }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [nom, setNom] = useState('')
  const [role, setRole] = useState('Gérant')
  const [email, setEmail] = useState('')
  const [saved, setSaved] = useState(false)
  const [localReps, setLocalReps] = useState<Representant[]>([])

  const allReps = [...representants, ...localReps]

  const handleAdd = () => {
    if (!nom.trim()) return
    const newRep: Representant = {
      id: `local-${Date.now()}`,
      entite_id: '',
      nom_complet: nom.trim(),
      role,
      email: email.trim() || undefined,
      date_debut: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    }
    setLocalReps(prev => [...prev, newRep])
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setShowForm(false)
      setNom(''); setRole('Gérant'); setEmail('')
    }, 1500)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {allReps.length} représentant{allReps.length > 1 ? 's' : ''} légal{allReps.length > 1 ? 'aux' : ''}
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {showForm ? <X size={13} /> : <UserPlus size={13} />}
          {showForm ? 'Annuler' : 'Ajouter'}
        </button>
      </div>

      {showForm && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
          <div className="text-xs font-bold text-indigo-800">Nouveau représentant légal</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nom complet *</label>
              <input
                value={nom}
                onChange={e => setNom(e.target.value)}
                placeholder="Jean Dupont"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rôle</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {['Gérant', 'Président', 'Directeur Général', 'Administrateur', 'Mandataire'].map(r => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Email (optionnel)</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jean@entreprise.eu"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!nom.trim()}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            {saved ? <><Check size={14} /> Ajouté !</> : <><UserPlus size={14} /> Ajouter le représentant</>}
          </button>
        </div>
      )}

      {allReps.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
          <p className="text-sm">Aucun représentant légal enregistré</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allReps.map(rep => (
            <div key={rep.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {initiales(rep.nom_complet)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 text-sm">{rep.nom_complet}</span>
                  {!rep.date_fin && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">Actif</span>
                  )}
                  {rep.date_fin && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-semibold">Expiré</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{rep.role}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Depuis {formatDate(rep.date_debut)}
                  {rep.date_fin && ` · jusqu'au ${formatDate(rep.date_fin)}`}
                </div>
              </div>
              {rep.email && (
                <a href={`mailto:${rep.email}`} className="text-gray-400 hover:text-indigo-600 transition-colors" title={`Écrire à ${rep.email}`}>
                  <Mail size={15} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
        <p className="text-xs text-amber-800">
          <strong>Directive EU 2025/25</strong> — Tout changement de représentant légal doit être déclaré au registre dans les 15 jours ouvrables.
        </p>
      </div>
    </div>
  )
}
