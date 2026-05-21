'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { MACF_MOCK } from '@/lib/macf/mock-data'
import type { StatutFournisseur } from '@/lib/macf/types'
import { cn } from '@/lib/utils'
import { Send, Download, CheckCircle, AlertCircle, Clock, Mail, X } from 'lucide-react'

const STATUT_CONFIG: Record<StatutFournisseur, { label: string; color: string; icon: React.ElementType }> = {
  valide: { label: 'Validé', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  en_collecte: { label: 'En collecte', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  incomplet: { label: 'Incomplet', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: AlertCircle },
  a_contacter: { label: 'À contacter', color: 'bg-gray-100 text-gray-500 border-gray-200', icon: Mail },
}

export default function FournisseursPage() {
  const data = MACF_MOCK
  const prix = data.prix_ets_actuel
  const [filter, setFilter] = useState<StatutFournisseur | 'tous'>('tous')
  const [relances, setRelances] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)

  const handleRelance = (id: string, nom: string) => {
    setRelances(prev => new Set(prev).add(id))
    setToast(`Questionnaire envoyé à ${nom}`)
    setTimeout(() => setToast(null), 4000)
  }

  const handleEnvoyerTous = () => {
    const aContacter = data.fournisseurs.filter(f => f.statut !== 'valide').map(f => f.id)
    setRelances(new Set(aContacter))
    setToast(`${aContacter.length} questionnaires envoyés`)
    setTimeout(() => setToast(null), 4000)
  }

  const fournisseurs = filter === 'tous' ? data.fournisseurs : data.fournisseurs.filter(f => f.statut === filter)

  const economieTotale = data.fournisseurs
    .filter(f => f.facteur_reel != null)
    .reduce((s, f) => s + (f.facteur_defaut - f.facteur_reel!) * f.tonnes_annuelles * prix, 0)

  const co2RealTotal = data.fournisseurs
    .filter(f => f.facteur_reel != null)
    .reduce((s, f) => s + f.facteur_reel! * f.tonnes_annuelles, 0)

  const co2DefaultTotal = data.fournisseurs
    .reduce((s, f) => s + f.facteur_defaut * f.tonnes_annuelles, 0)

  const validesCount = data.fournisseurs.filter(f => f.statut === 'valide').length

  return (
    <div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-green-200 rounded-2xl shadow-xl p-4 flex items-center gap-3 max-w-sm">
          <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle size={16} className="text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-900 flex-1">{toast}</span>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
        </div>
      )}
      <Header
        title="Fournisseurs MACF"
        subtitle="Collecte des données d'émissions — Règlement (UE) 2023/956"
        action={
          <button
            onClick={handleEnvoyerTous}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
          >
            <Send size={14} /> Envoyer questionnaires
          </button>
        }
      />

      <div className="p-6 space-y-5">

        {/* Résumé financier */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-xs text-gray-400 mb-1">Fournisseurs validés</div>
            <div className="text-2xl font-bold text-gray-900">{validesCount}<span className="text-sm text-gray-400 font-normal">/{data.fournisseurs.length}</span></div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(validesCount / data.fournisseurs.length) * 100}%` }} />
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <div className="text-xs text-emerald-600 mb-1">Économies vs valeurs défaut</div>
            <div className="text-2xl font-bold text-emerald-700">{Math.round(economieTotale / 1000).toLocaleString('fr')} k€</div>
            <div className="text-xs text-emerald-600 mt-0.5">par an au cours actuel ({prix} €/t)</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-xs text-gray-400 mb-1">CO₂ réel vs défaut</div>
            <div className="text-2xl font-bold text-gray-900">{Math.round(co2RealTotal).toLocaleString('fr')}<span className="text-sm text-gray-400 font-normal"> t</span></div>
            <div className="text-xs text-gray-400">vs {Math.round(co2DefaultTotal).toLocaleString('fr')} t avec valeurs défaut</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-xs text-gray-400 mb-1">Prochain questionnaire</div>
            <div className="text-sm font-semibold text-gray-900 mt-1">Gujarat State Fertilisers</div>
            <div className="text-xs text-orange-500 mt-0.5">Relance en attente · 🇮🇳 Inde</div>
          </div>
        </div>

        {/* Explication valeur */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <div className="text-sm font-semibold text-indigo-800 mb-1">
                Économie calculée : {Math.round(economieTotale / 1000).toLocaleString('fr')} k€/an grâce aux données réelles
              </div>
              <div className="text-xs text-indigo-700">
                En utilisant les facteurs d'émissions réels de vos fournisseurs validés plutôt que les valeurs par défaut imposées par la Commission EU,
                vous réduisez votre obligation de <strong>{(co2DefaultTotal - co2RealTotal).toLocaleString('fr')} t CO₂</strong> de certificats.
                Au prix actuel de {prix} €/t, cela représente <strong>{Math.round(economieTotale / 1000).toLocaleString('fr')} k€ d'économie annuelle</strong>.
                En 2034 (prix estimé 400 €/t), cette économie atteindrait <strong>{Math.round((co2DefaultTotal - co2RealTotal) * 400 / 1000).toLocaleString('fr')} k€/an</strong>.
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2">
          {(['tous', 'valide', 'en_collecte', 'incomplet', 'a_contacter'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                filter === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
              )}
            >
              {f === 'tous' ? `Tous (${data.fournisseurs.length})` :
                `${STATUT_CONFIG[f].label} (${data.fournisseurs.filter(x => x.statut === f).length})`}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-[10px] text-gray-400 font-semibold uppercase px-5 py-3">Fournisseur</th>
                <th className="text-center text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">Secteur</th>
                <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">Volume (t/an)</th>
                <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">Facteur réel</th>
                <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">Facteur défaut</th>
                <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">Économie/an</th>
                <th className="text-center text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">Statut</th>
                <th className="text-center text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {fournisseurs.map(f => {
                const eco = f.facteur_reel != null ? (f.facteur_defaut - f.facteur_reel) * f.tonnes_annuelles * prix : null
                const cfg = STATUT_CONFIG[f.statut]
                const Icon = cfg.icon
                return (
                  <tr key={f.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{f.pays_emoji}</span>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{f.nom}</div>
                          <div className="text-xs text-gray-400">{f.pays_nom} · Code NC : {f.code_nc}</div>
                          <div className="text-xs text-gray-400">{f.contact_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-3 py-4">
                      <span className="text-xs capitalize bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{f.secteur}</span>
                    </td>
                    <td className="text-right px-3 py-4 text-sm font-medium text-gray-900">
                      {f.tonnes_annuelles.toLocaleString('fr')}
                    </td>
                    <td className="text-right px-3 py-4">
                      {f.facteur_reel != null ? (
                        <span className="text-sm font-semibold text-green-700">{f.facteur_reel}</span>
                      ) : (
                        <span className="text-xs text-gray-400">Non collecté</span>
                      )}
                    </td>
                    <td className="text-right px-3 py-4">
                      <span className={cn('text-sm', f.facteur_reel != null ? 'text-red-400 line-through' : 'text-gray-600 font-medium')}>
                        {f.facteur_defaut}
                      </span>
                    </td>
                    <td className="text-right px-3 py-4">
                      {eco != null && eco > 0 ? (
                        <span className="text-sm font-bold text-emerald-600">+{Math.round(eco / 1000).toLocaleString('fr')} k€</span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="text-center px-3 py-4">
                      <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border', cfg.color)}>
                        <Icon size={10} />{cfg.label}
                      </span>
                    </td>
                    <td className="text-center px-3 py-4">
                      {f.statut !== 'valide' ? (
                        relances.has(f.id) ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                            <CheckCircle size={10} /> Envoyé
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRelance(f.id, f.nom)}
                            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 active:scale-95 transition-all mx-auto"
                          >
                            <Send size={10} /> Relancer
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => { setToast(`Rapport téléchargé pour ${f.nom}`) ; setTimeout(() => setToast(null), 3000) }}
                          className="flex items-center gap-1 text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 active:scale-95 transition-all mx-auto"
                        >
                          <Download size={10} /> Rapport
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
