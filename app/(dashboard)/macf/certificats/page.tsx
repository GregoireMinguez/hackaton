'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { MACF_MOCK, getMACFStats } from '@/lib/macf/mock-data'
import { cn } from '@/lib/utils'
import { AlertTriangle, CheckCircle, ShoppingCart, TrendingUp, X, Info } from 'lucide-react'

const QUANTITES_RAPIDES = [500, 1000, 2000, 5000]

function AchatModal({ prix, manque, onClose, onConfirm }: {
  prix: number
  manque: number
  onClose: () => void
  onConfirm: (qty: number) => void
}) {
  const [quantite, setQuantite] = useState(Math.max(manque, 500))
  const total = quantite * prix

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-white">
            <ShoppingCart size={18} />
            <div>
              <div className="font-bold text-sm">Planifier l'achat de certificats MACF</div>
              <div className="text-[11px] text-indigo-200">Plateforme centrale MACF · ouverture février 2027</div>
            </div>
          </div>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quantités rapides */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Quantité à acheter</label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {QUANTITES_RAPIDES.map(q => (
                <button
                  key={q}
                  onClick={() => setQuantite(q)}
                  className={cn(
                    'py-2 rounded-lg text-xs font-semibold border transition-colors',
                    quantite === q ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600',
                  )}
                >
                  {q >= 1000 ? `${q / 1000}k` : q}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                step={100}
                value={quantite}
                onChange={e => setQuantite(Math.max(1, Number(e.target.value)))}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">certificats</span>
            </div>
          </div>

          {/* Récap prix */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Quantité</span>
              <span className="font-semibold">{quantite.toLocaleString('fr')} certif.</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Prix de référence</span>
              <span className="font-semibold">{prix} €/t CO₂ (T1 2026)</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="font-bold text-gray-900">Total estimé</span>
              <span className="font-bold text-indigo-700 text-lg">
                {total >= 1e6 ? `${(total / 1e6).toFixed(2)} M€` : `${Math.round(total / 1000)} k€`}
              </span>
            </div>
          </div>

          {manque > 0 && quantite < manque && (
            <div className="flex items-start gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg p-3">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <span>Il reste <strong>{manque.toLocaleString('fr')}</strong> certificats à planifier pour couvrir les importations 2026 avant la restitution du 30 septembre 2027.</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => onConfirm(quantite)}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              Enregistrer la planification
            </button>
          </div>

          <p className="text-[10px] text-gray-400 text-center">
            Simulation MACF · aucun ordre officiel n'est transmis avant l'ouverture de la plateforme centrale en février 2027
          </p>
        </div>
      </div>
    </div>
  )
}

function ConfirmToast({ quantite, prix, onClose }: { quantite: number; prix: number; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white border border-green-200 rounded-2xl shadow-xl p-4 flex items-start gap-3 max-w-sm">
      <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <CheckCircle size={18} className="text-green-600" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold text-gray-900">Plan d'achat enregistré</div>
        <div className="text-xs text-gray-500 mt-0.5">
          {quantite.toLocaleString('fr')} certificats · {quantite >= 1000 ? `${(quantite * prix / 1e6).toFixed(2)} M€` : `${Math.round(quantite * prix / 1000)} k€`} · En cours de traitement
        </div>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X size={14} />
      </button>
    </div>
  )
}

export default function CertificatsPage() {
  const data = MACF_MOCK
  const { co2Total, stockRequis } = getMACFStats(data)
  const prix = data.prix_ets_actuel
  const [stockLocal, setStockLocal] = useState(data.stock_certificats)
  const manque = Math.max(0, stockRequis - stockLocal)
  const pct = Math.min(100, Math.round((stockLocal / stockRequis) * 100))
  const stockAlert = stockLocal < stockRequis

  const totalAchats = data.achats_certificats.reduce((s, a) => s + a.montant_total, 0)
  const valeurStock = stockLocal * prix
  const maxPrix = Math.max(...data.prix_ets_historique.map(p => p.prix))

  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState<{ quantite: number } | null>(null)

  const handleConfirm = (qty: number) => {
    setStockLocal(s => s + qty)
    setShowModal(false)
    setToast({ quantite: qty })
    setTimeout(() => setToast(null), 5000)
  }

  const TRIMESTRES = [
    { label: 'Ouverture achats', date: '1 fév. 2027', requis: Math.ceil(co2Total / 3), urgent: true },
    { label: 'Revue vérificateur', date: '31 août 2027', requis: Math.ceil((co2Total * 2) / 3), urgent: false },
    { label: 'Restitution finale', date: '30 sept. 2027', requis: co2Total, urgent: true },
  ]

  return (
    <div>
      {showModal && (
        <AchatModal
          prix={prix}
          manque={manque}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
        />
      )}
      {toast && (
        <ConfirmToast
          quantite={toast.quantite}
          prix={prix}
          onClose={() => setToast(null)}
        />
      )}

      <Header
        title="Gestion des certificats MACF"
        subtitle="Planification 2027, restitution 2026 et prix officiels publiés"
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
          >
            <ShoppingCart size={15} /> Planifier l'achat
          </button>
        }
      />

      <div className="p-6 space-y-5">

        {/* Alerte */}
        {stockAlert && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-orange-800">Certificats 2026 à acquérir dès février 2027</div>
              <div className="text-xs text-orange-700 mt-0.5">
                Les certificats ne sont pas achetables en 2026. Besoin estimé : <strong>{manque.toLocaleString('fr')} certificats</strong> ≈ <strong>{(manque * prix / 1000).toFixed(0)} k€</strong> au prix officiel T1 2026 de {prix} €/t.
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex-shrink-0 flex items-center gap-1.5 bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-700 transition-colors"
            >
              <ShoppingCart size={12} /> Planifier
            </button>
          </div>
        )}

        {/* Jauge principale + KPIs */}
        <div className="grid grid-cols-3 gap-4">

          {/* Jauge stock */}
          <div className="col-span-1 bg-white rounded-xl border border-gray-100 p-5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Stock actuel</div>
              <div className="text-3xl font-bold text-gray-900">{stockLocal.toLocaleString('fr')}</div>
              <div className="text-xs text-gray-400 mt-0.5">certificats détenus</div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>0</span>
                <span className={cn('font-semibold', stockAlert ? 'text-orange-500' : 'text-green-600')}>
                  {pct}% du besoin
                </span>
                <span>{stockRequis.toLocaleString('fr')} à restituer</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className={cn('h-3 rounded-full transition-all duration-500', stockAlert ? 'bg-orange-400' : 'bg-green-500')}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                {stockAlert ? (
                  <>
                    <AlertTriangle size={12} className="text-orange-500" />
                    <span className="text-xs text-orange-600 font-medium">{manque.toLocaleString('fr')} certificats à planifier</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={12} className="text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Besoin couvert</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <ShoppingCart size={13} /> Planifier les achats
            </button>
          </div>

          {/* KPIs */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            {[
              { label: 'Valeur planifiée', value: `${(valeurStock / 1e6).toFixed(2)} M€`, sub: `prix officiel T1 2026 : ${prix} €/t`, color: 'text-indigo-600' },
              { label: 'Achats officiels', value: `${(totalAchats / 1e6).toFixed(2)} M€`, sub: 'Aucun achat possible avant fév. 2027', color: 'text-gray-900' },
              { label: 'Émissions annuelles estimées', value: `${co2Total.toLocaleString('fr')} t`, sub: 'Basé sur facteurs réels + défaut', color: 'text-gray-900' },
              {
                label: 'Certificats à acheter',
                value: manque > 0 ? manque.toLocaleString('fr') : '0',
                sub: manque > 0 ? `≈ ${(manque * prix / 1000).toFixed(0)} k€ · restitution 30/09/27` : 'Besoin déjà couvert',
                color: manque > 0 ? 'text-orange-600' : 'text-green-600',
              },
            ].map(k => (
              <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="text-xs text-gray-400 mb-1">{k.label}</div>
                <div className={cn('text-xl font-bold', k.color)}>{k.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{k.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Prix ETS + Obligations trimestrielles */}
        <div className="grid grid-cols-5 gap-4">

          {/* Mini chart prix */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">Prix certificats MACF 2026</div>
                <div className="text-xl font-bold text-gray-900 mt-0.5 flex items-center gap-2">
                  {prix} €/tonne
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    <TrendingUp size={11} />T1 2026 publié
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-end gap-1 h-24">
              {data.prix_ets_historique.map((p, i) => {
                const isPublished = p.prix > 0
                const barPct = isPublished ? ((p.prix - 70) / (maxPrix - 70)) * 100 : 8
                return (
                  <div key={p.semaine} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center" style={{ height: 72 }}>
                      <div title={`${p.prix} €`}
                        className={cn('w-full rounded-sm', isPublished ? 'bg-indigo-600' : 'bg-gray-200')}
                        style={{ height: `${Math.max(6, barPct)}%` }} />
                    </div>
                    <div className="text-[8px] text-gray-400">{p.semaine}</div>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between text-xs text-gray-400">
              <span>Prix 2026 calculés trimestriellement, puis hebdomadairement à partir de 2027.</span>
              <span>T2 publié le 6 juillet 2026</span>
            </div>
          </div>

          {/* Obligations trimestrielles */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Jalons certificats 2027</div>
            <div className="space-y-3">
              {TRIMESTRES.map(t => (
                <div key={t.label} className={cn('rounded-lg p-3 border', t.urgent ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100')}>
                  <div className="flex justify-between items-start mb-1">
                    <div className={cn('text-xs font-bold', t.urgent ? 'text-orange-700' : 'text-gray-700')}>{t.label}</div>
                    <div className="text-[10px] text-gray-400">{t.date}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{t.requis.toLocaleString('fr')} certif.</div>
                  <div className="text-[10px] text-gray-400">≈ {(t.requis * prix / 1000).toFixed(0)} k€ au cours actuel</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Historique achats */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">Achats officiels</div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <ShoppingCart size={12} /> Planifier
            </button>
          </div>
          <table className="w-full">
            <thead className="border-b border-gray-50">
              <tr>
                <th className="text-left text-[10px] text-gray-400 font-semibold uppercase pb-2">Date</th>
                <th className="text-right text-[10px] text-gray-400 font-semibold uppercase pb-2">Quantité</th>
                <th className="text-right text-[10px] text-gray-400 font-semibold uppercase pb-2">Prix unitaire</th>
                <th className="text-right text-[10px] text-gray-400 font-semibold uppercase pb-2">Montant total</th>
              </tr>
            </thead>
            <tbody>
              {data.achats_certificats.length === 0 && (
                <tr>
                  <td className="py-5 text-sm text-gray-500" colSpan={4}>
                    Aucun achat officiel enregistré : la plateforme commune de vente ouvre en février 2027 pour couvrir les importations 2026.
                  </td>
                </tr>
              )}
              {data.achats_certificats.map(a => (
                <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 text-sm text-gray-700">{new Date(a.date).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 text-right text-sm font-medium text-gray-900">{a.quantite.toLocaleString('fr')} t CO₂</td>
                  <td className="py-3 text-right text-sm text-gray-700">{a.prix_unitaire.toFixed(2)} €/t</td>
                  <td className="py-3 text-right text-sm font-semibold text-gray-900">{a.montant_total.toLocaleString('fr')} €</td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td className="py-2.5 px-0 text-xs font-bold text-gray-500">TOTAL</td>
                <td className="py-2.5 text-right text-xs text-gray-700">{data.achats_certificats.reduce((s, a) => s + a.quantite, 0).toLocaleString('fr')} t CO₂</td>
                <td className="py-2.5 text-right text-xs text-gray-500">—</td>
                <td className="py-2.5 text-right text-xs font-bold text-gray-900">{totalAchats.toLocaleString('fr')} €</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
