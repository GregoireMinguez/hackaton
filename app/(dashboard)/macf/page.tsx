'use client'

import Header from '@/components/layout/Header'
import { MACF_MOCK, getMACFStats } from '@/lib/macf/mock-data'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, ChevronRight, Leaf, BarChart2, FileText, Zap } from 'lucide-react'

const ECHEANCES = [
  { date: '1 janv. 2026', label: 'Régime définitif en vigueur · autorisation requise au-delà du seuil 50 t/an', done: true, urgent: false },
  { date: '7 avr. 2026', label: 'Prix officiel T1 2026 publié : 75,36 €/t CO₂', done: true, urgent: false },
  { date: '31 déc. 2026', label: 'Clôture des importations 2026 à déclarer', done: false, urgent: false },
  { date: '1 fév. 2027', label: 'Début des achats de certificats pour les importations 2026', done: false, urgent: true },
  { date: '30 sept. 2027', label: 'Première déclaration annuelle et restitution des certificats 2026', done: false, urgent: true },
]

function KpiCard({ label, value, sub, icon: Icon, color, alert }: {
  label: string; value: string; sub: string; icon: React.ElementType; color: string; alert?: boolean
}) {
  return (
    <div className={cn('bg-white rounded-xl border p-5', alert ? 'border-orange-200' : 'border-gray-100')}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', color)}>
          <Icon size={15} className="text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
      <div className={cn('text-xs', alert ? 'text-orange-500 font-medium' : 'text-gray-400')}>{sub}</div>
    </div>
  )
}

export default function MACFPage() {
  const data = MACF_MOCK
  const { co2Total, coutTotal, stockRequis, economieTotal } = getMACFStats(data)
  const stockPct = stockRequis > 0 ? Math.round((data.stock_certificats / stockRequis) * 100) : 0
  const stockAlert = data.stock_certificats < stockRequis
  const prix = data.prix_ets_actuel
  const prixDelta = 0
  const maxPrix = Math.max(...data.prix_ets_historique.map(p => p.prix), 80)

  const fournisseursValides = data.fournisseurs.filter(f => f.statut === 'valide').length
  const fournisseursTotal = data.fournisseurs.length

  return (
    <div>
      <Header
        title="MACF / CBAM — Tableau de bord"
        subtitle="Mécanisme d'Ajustement Carbone aux Frontières · Règlement (UE) 2023/956"
        action={
          <Link href="/macf/declaration"
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors">
            <FileText size={13} />Préparer la déclaration
          </Link>
        }
      />

      <div className="p-6 space-y-5">

        {/* Alerte stock */}
        {stockAlert && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-orange-800">Certificats à planifier pour 2027</div>
              <div className="text-xs text-orange-700 mt-0.5">
                Les certificats MACF 2026 ne sont achetables qu'à partir de <strong>février 2027</strong> sur la plateforme centrale.
                Besoin estimé : <strong>{stockRequis.toLocaleString('fr')} certificats</strong>, soit <strong>~{((stockRequis - data.stock_certificats) * prix / 1e6).toFixed(2)} M€</strong> avec le prix officiel T1 2026.
              </div>
              <Link href="/macf/certificats" className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 underline mt-1.5">
                Gérer le stock <ChevronRight size={11} />
              </Link>
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard
            label="Prix ETS actuel"
            value={`${prix.toFixed(2)} €/t`}
            sub="Prix officiel MACF T1 2026 publié par la Commission"
            icon={prixDelta >= 0 ? TrendingUp : TrendingDown}
            color={prixDelta >= 0 ? 'bg-red-500' : 'bg-green-500'}
          />
          <KpiCard
            label="Stock certificats"
            value={data.stock_certificats.toLocaleString('fr')}
            sub={`${stockPct}% du besoin 2026 · achat possible dès fév. 2027`}
            icon={stockAlert ? AlertTriangle : CheckCircle}
            color={stockAlert ? 'bg-orange-500' : 'bg-green-500'}
            alert={stockAlert}
          />
          <KpiCard
            label="Coût carbone estimé 2026"
            value={`${(coutTotal / 1e6).toFixed(2)} M€`}
            sub={`${co2Total.toLocaleString('fr')} t CO₂ · ${data.lignes_declaration.length} fournisseurs`}
            icon={Leaf}
            color="bg-indigo-600"
          />
          <KpiCard
            label="Économies vs valeurs défaut"
            value={`${Math.round(economieTotal / 1000).toLocaleString('fr')} k€/an`}
            sub={`Grâce aux données réelles de ${fournisseursValides}/${fournisseursTotal} fournisseurs`}
            icon={Zap}
            color="bg-emerald-600"
          />
        </div>

        {/* Graphique prix ETS + Échéances */}
        <div className="grid grid-cols-5 gap-4">

          {/* Prix ETS mini-chart */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">Prix certificats MACF 2026</div>
                <div className="text-xl font-bold text-gray-900 mt-0.5">{prix.toFixed(2)} €/tonne CO₂</div>
              </div>
              <div className={cn('flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
                prixDelta >= 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600')}>
                {prixDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                T1 publié
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-20">
              {data.prix_ets_historique.map((p, i) => {
                const isPublished = p.prix > 0
                const pct = isPublished ? ((p.prix - 70) / (maxPrix - 70)) * 100 : 8
                return (
                  <div key={p.semaine} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center" style={{ height: 64 }}>
                      <div
                        className={cn('w-full rounded-sm transition-all', isPublished ? 'bg-indigo-600' : 'bg-gray-200')}
                        style={{ height: `${Math.max(8, pct)}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-gray-400">{p.semaine}</div>
                  </div>
                )
              })}
            </div>
            <div className="mt-2 text-xs text-gray-400">T2, T3 et T4 2026 seront publiés les 6 juillet 2026, 5 octobre 2026 et 4 janvier 2027.</div>
          </div>

          {/* Échéances */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Calendrier MACF</div>
            <div className="space-y-3">
              {ECHEANCES.map((e, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1.5',
                    e.urgent ? 'bg-orange-400' : 'bg-gray-300')} />
                  <div className="min-w-0">
                    <div className={cn('text-xs font-semibold', e.urgent ? 'text-orange-700' : 'text-gray-600')}>
                      {e.date}
                    </div>
                    <div className="text-xs text-gray-400 leading-snug">{e.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fournisseurs + actions rapides */}
        <div className="grid grid-cols-3 gap-4">

          {/* Table fournisseurs */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">Fournisseurs MACF</div>
              <Link href="/macf/fournisseurs" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5">
                Gérer <ChevronRight size={12} />
              </Link>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left text-[10px] text-gray-400 font-semibold uppercase pb-2">Fournisseur</th>
                  <th className="text-right text-[10px] text-gray-400 font-semibold uppercase pb-2">CO₂ réel</th>
                  <th className="text-right text-[10px] text-gray-400 font-semibold uppercase pb-2">Économie</th>
                  <th className="text-center text-[10px] text-gray-400 font-semibold uppercase pb-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.fournisseurs.map(f => {
                  const eco = f.facteur_reel != null ? (f.facteur_defaut - f.facteur_reel) * f.tonnes_annuelles * prix : null
                  const co2 = f.facteur_reel != null ? f.facteur_reel * f.tonnes_annuelles : null
                  return (
                    <tr key={f.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{f.pays_emoji}</span>
                          <div>
                            <div className="text-xs font-medium text-gray-900 truncate max-w-40">{f.nom}</div>
                            <div className="text-[10px] text-gray-400">{f.secteur} · {f.code_nc}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-2.5">
                        <span className="text-xs text-gray-700">
                          {co2 != null ? `${co2.toLocaleString('fr')} t` : <span className="text-gray-400">—</span>}
                        </span>
                      </td>
                      <td className="text-right py-2.5">
                        <span className={cn('text-xs font-semibold', eco != null && eco > 0 ? 'text-emerald-600' : 'text-gray-400')}>
                          {eco != null && eco > 0 ? `+${Math.round(eco / 1000)}k€` : '—'}
                        </span>
                      </td>
                      <td className="text-center py-2.5">
                        <StatutBadge statut={f.statut} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Quick actions */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Modules MACF</div>
              <div className="space-y-2">
                {[
                  { href: '/macf/fournisseurs', icon: '🏭', label: 'Collecte données', sub: `${fournisseursValides}/${fournisseursTotal} validés` },
                  { href: '/macf/certificats', icon: '📊', label: 'Certificats', sub: 'Achat dès fév. 2027' },
                  { href: '/macf/declaration', icon: '📝', label: 'Déclaration annuelle', sub: `${co2Total.toLocaleString('fr')} t CO₂` },
                  { href: '/macf/simulateur', icon: '⚡', label: 'Simulateur de coûts', sub: 'Projection 2026–2034' },
                ].map(a => (
                  <Link key={a.href} href={a.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors group">
                    <span className="text-lg">{a.icon}</span>
                    <div>
                      <div className="text-xs font-semibold text-gray-800 group-hover:text-indigo-700">{a.label}</div>
                      <div className="text-[10px] text-gray-400">{a.sub}</div>
                    </div>
                    <ChevronRight size={12} className="ml-auto text-gray-300 group-hover:text-indigo-400" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-eu-dark rounded-xl p-4 text-white">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">Règlement (UE) 2023/956</div>
              <div className="text-xs text-slate-300 mb-2">6 secteurs couverts en 2026. Exemption annuelle sous 50 t de marchandises MACF.</div>
              <div className="space-y-1">
                {['Acier & fer', 'Aluminium', 'Ciment', 'Engrais azotés', 'Électricité', 'Hydrogène'].map(s => (
                  <div key={s} className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-indigo-500 rounded-full" />{s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatutBadge({ statut }: { statut: string }) {
  const map: Record<string, { label: string; className: string }> = {
    valide: { label: 'Validé', className: 'bg-green-100 text-green-700' },
    en_collecte: { label: 'En collecte', className: 'bg-blue-100 text-blue-700' },
    incomplet: { label: 'Incomplet', className: 'bg-yellow-100 text-yellow-700' },
    a_contacter: { label: 'À contacter', className: 'bg-gray-100 text-gray-500' },
  }
  const s = map[statut] ?? { label: statut, className: 'bg-gray-100 text-gray-500' }
  return <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', s.className)}>{s.label}</span>
}
