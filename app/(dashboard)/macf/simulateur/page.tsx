'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { cn } from '@/lib/utils'

const SCENARIOS_PRIX = [
  { annee: 2026, prix_bas: 75.36, prix_med: 75.36, prix_haut: 75.36 },
  { annee: 2027, prix_bas: 80, prix_med: 100, prix_haut: 120 },
  { annee: 2028, prix_bas: 95, prix_med: 130, prix_haut: 165 },
  { annee: 2030, prix_bas: 130, prix_med: 200, prix_haut: 260 },
  { annee: 2032, prix_bas: 180, prix_med: 290, prix_haut: 350 },
  { annee: 2034, prix_bas: 260, prix_med: 400, prix_haut: 500 },
]

function formatM(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)} M€`
  return `${Math.round(n / 1000)} k€`
}

export default function SimulateurPage() {
  const [tonnage, setTonnage] = useState(10000)
  const [facteurReel, setFacteurReel] = useState(1.42)
  const [secteur, setSecteur] = useState('acier')
  const [scenario, setScenario] = useState<'bas' | 'med' | 'haut'>('med')

  const FACTEURS_DEFAUT: Record<string, { value: number; label: string }> = {
    acier: { value: 1.85, label: 'Acier / Fer (7208–7217)' },
    aluminium: { value: 11.20, label: 'Aluminium primaire (7601)' },
    ciment: { value: 0.84, label: 'Ciment (2523)' },
    engrais: { value: 2.10, label: 'Urée / engrais azotés (3102)' },
    hydrogene: { value: 9.40, label: 'Hydrogène (2804)' },
  }

  const defaut = FACTEURS_DEFAUT[secteur]?.value ?? 1.85

  const coutReel = (annee: number) => {
    const prix = SCENARIOS_PRIX.find(s => s.annee === annee)?.[`prix_${scenario}`] ?? 75.36
    return facteurReel * tonnage * prix
  }

  const coutDefaut = (annee: number) => {
    const prix = SCENARIOS_PRIX.find(s => s.annee === annee)?.[`prix_${scenario}`] ?? 75.36
    return defaut * tonnage * prix
  }

  const economie = (annee: number) => Math.max(0, coutDefaut(annee) - coutReel(annee))

  const co2Reel = facteurReel * tonnage
  const co2Defaut = defaut * tonnage
  const eco2026 = economie(2026)
  const eco2034 = economie(2034)
  const maxCout = Math.max(...SCENARIOS_PRIX.map(s => coutDefaut(s.annee)))

  return (
    <div>
      <Header
        title="Simulateur de coûts MACF"
        subtitle="Projection financière 2026–2034 · Règlement (UE) 2023/956"
      />

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">

          {/* Paramètres */}
          <div className="col-span-1 space-y-4">

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Paramètres</div>

              <div className="space-y-5">
                {/* Secteur */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Secteur / produit</label>
                  <select
                    value={secteur}
                    onChange={e => setSecteur(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(FACTEURS_DEFAUT).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>

                {/* Tonnage */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Volume annuel importé : <strong>{tonnage.toLocaleString('fr')} t</strong>
                  </label>
                  <input
                    type="range" min={100} max={50000} step={100}
                    value={tonnage}
                    onChange={e => setTonnage(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>100 t</span><span>50 000 t</span>
                  </div>
                </div>

                {/* Facteur réel */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Facteur d'émission réel : <strong>{facteurReel.toFixed(2)} t CO₂/t</strong>
                  </label>
                  <input
                    type="range" min={0.1} max={defaut * 1.1} step={0.01}
                    value={facteurReel}
                    onChange={e => setFacteurReel(Number(e.target.value))}
                    className="w-full accent-green-600"
                  />
                  <div className="flex justify-between text-[10px] mt-1">
                    <span className="text-green-600">0.1 (optimal)</span>
                    <span className="text-red-400">{(defaut * 1.1).toFixed(2)} (défaut+)</span>
                  </div>
                  <div className="text-[10px] text-orange-600 mt-1">
                    Valeur défaut UE pour ce secteur : <strong>{defaut}</strong> t CO₂/t
                    {facteurReel >= defaut && ' · Vous utilisez la valeur défaut'}
                  </div>
                </div>

                {/* Scénario prix */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Scénario prix carbone</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['bas', 'med', 'haut'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setScenario(s)}
                        className={cn(
                          'py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                          scenario === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
                        )}
                      >
                        {s === 'bas' ? 'Bas' : s === 'med' ? 'Médian' : 'Haut'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Résumé immédiat */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <div className="text-xs font-bold text-emerald-700 mb-3 uppercase tracking-wider">Économie en 2026</div>
              <div className="text-3xl font-bold text-emerald-700 mb-1">{formatM(eco2026)}</div>
              <div className="text-xs text-emerald-600">en utilisant le facteur réel ({facteurReel.toFixed(2)}) vs défaut ({defaut})</div>
              {eco2026 <= 0 && (
                <div className="text-xs text-red-500 mt-1">Facteur réel ≥ défaut : pas d'économie</div>
              )}
            </div>

            {eco2034 > 0 && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <div className="text-xs font-bold text-indigo-700 mb-2 uppercase tracking-wider">Projection 2034</div>
                <div className="text-2xl font-bold text-indigo-700">{formatM(eco2034)}</div>
                <div className="text-xs text-indigo-600">économie annuelle au prix estimé ~{SCENARIOS_PRIX[5][`prix_${scenario}`]} €/t</div>
              </div>
            )}
          </div>

          {/* Graphique projection */}
          <div className="col-span-2 space-y-4">

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                Coût carbone annuel estimé 2026–2034
              </div>

              <div className="space-y-3">
                {SCENARIOS_PRIX.map(s => {
                  const reel = coutReel(s.annee)
                  const def = coutDefaut(s.annee)
                  const eco = economie(s.annee)
                  const prixScen = s[`prix_${scenario}`]
                  return (
                    <div key={s.annee}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-600 w-10">{s.annee}</span>
                        <span className="text-[10px] text-gray-400">{prixScen} €/t</span>
                        <span className="ml-auto text-xs font-semibold text-emerald-600">
                          {eco > 0 ? `−${formatM(eco)}` : ''}
                        </span>
                      </div>
                      <div className="flex gap-1 items-center">
                        <div className="flex-1 bg-gray-100 rounded h-5 relative overflow-hidden">
                          {/* Défaut bar */}
                          <div
                            className="absolute inset-y-0 left-0 bg-red-200 rounded"
                            style={{ width: `${(def / maxCout) * 100}%` }}
                          />
                          {/* Réel bar */}
                          <div
                            className="absolute inset-y-0 left-0 bg-indigo-500 rounded"
                            style={{ width: `${(reel / maxCout) * 100}%` }}
                          />
                        </div>
                        <div className="text-[10px] font-bold text-indigo-700 w-20 text-right">{formatM(reel)}</div>
                        <div className={cn('text-[10px] text-red-400 w-20 text-right', facteurReel < defaut ? 'line-through' : '')}>{formatM(def)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-3 h-3 rounded bg-indigo-500" />Coût avec facteur réel ({facteurReel.toFixed(2)})
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-3 h-3 rounded bg-red-200" />Coût avec valeur défaut UE ({defaut})
                </div>
              </div>
            </div>

            {/* Table de projection */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left text-[10px] text-gray-400 font-semibold uppercase px-5 py-3">Année</th>
                    <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">Prix MACF (€/t)</th>
                    <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">CO₂ total (t)</th>
                    <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">Coût réel</th>
                    <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">Coût défaut</th>
                    <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">Économie</th>
                  </tr>
                </thead>
                <tbody>
                  {SCENARIOS_PRIX.map(s => {
                    const prixScen = s[`prix_${scenario}`]
                    const reel = coutReel(s.annee)
                    const def = coutDefaut(s.annee)
                    const eco = economie(s.annee)
                    return (
                      <tr key={s.annee} className="border-b border-gray-50 last:border-0">
                        <td className="px-5 py-3 text-sm font-bold text-gray-900">{s.annee}</td>
                        <td className="px-3 py-3 text-right text-sm text-gray-700">{prixScen} €</td>
                        <td className="px-3 py-3 text-right text-sm text-gray-700">
                          {co2Reel.toLocaleString('fr')} / <span className="text-red-400">{co2Defaut.toLocaleString('fr')}</span>
                        </td>
                        <td className="px-3 py-3 text-right text-sm font-semibold text-indigo-700">{formatM(reel)}</td>
                        <td className="px-3 py-3 text-right text-sm text-red-400">{formatM(def)}</td>
                        <td className="px-3 py-3 text-right text-sm font-bold text-emerald-600">
                          {eco > 0 ? `+${formatM(eco)}` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Info ROI */}
            <div className="bg-eu-dark rounded-xl p-4 text-white">
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Retour sur investissement SaaS</div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-lg font-bold text-white">{formatM(eco2026)}/an</div>
                  <div className="text-xs text-slate-400">Économie MACF 2026 (données réelles)</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-400">×{eco2026 > 0 ? Math.round(eco2026 / 18000) : 0}x</div>
                  <div className="text-xs text-slate-400">ROI vs abonnement Business 1 490 €/mois</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-indigo-300">{formatM(eco2034)}/an</div>
                  <div className="text-xs text-slate-400">Économie MACF 2034 (prix ~400 €/t)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
