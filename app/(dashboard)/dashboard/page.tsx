'use client'

import { useDashboardData } from '@/hooks/useDashboardData'
import GlobalStats from '@/components/dashboard/GlobalStats'
import AlertesPanel from '@/components/dashboard/AlertesPanel'
import EntiteCard from '@/components/dashboard/EntiteCard'
import MapEU from '@/components/dashboard/MapEU'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { PlusCircle, ChevronRight, AlertTriangle, Leaf } from 'lucide-react'
import { MACF_MOCK, getMACFStats } from '@/lib/macf/mock-data'

function SkeletonCard() {
  return <div className="bg-white rounded-xl border border-gray-100 h-36 animate-pulse" />
}

export default function DashboardPage() {
  const { data, loading } = useDashboardData()

  const action = (
    <Link
      href="/filiales/nouvelle"
      className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
    >
      <PlusCircle size={14} />
      Créer une filiale
    </Link>
  )

  return (
    <div>
      <Header
        title="Vue globale"
        subtitle={data ? `${data.organisation.nom} · ${data.entites.length} entités EU` : ''}
        action={action}
      />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        {loading ? (
          <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : data ? (
          <GlobalStats data={data} />
        ) : null}

        {/* Map + Alerts */}
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            {loading ? <SkeletonCard /> : data ? <MapEU entites={data.entites} /> : null}
          </div>
          <div className="col-span-2">
            {loading ? <SkeletonCard /> : data ? <AlertesPanel data={data} /> : null}
          </div>
        </div>

        {/* Entity list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">Mes entités légales</div>
            <Link href="/entites" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Voir tout</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : data?.entites.length === 0 ? (
            <OnboardingEmpty />
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {data?.entites.map(e => <EntiteCard key={e.id} entite={e} />)}
            </div>
          )}
        </div>

        {/* Activity */}
        {data && !loading && (
          <div className="grid grid-cols-2 gap-4">
            <ActivityFeed activity={data.activity} />
            <DirectiveBadge />
          </div>
        )}

        {/* MACF summary */}
        {!loading && <MACFSummary />}
      </div>
    </div>
  )
}

function OnboardingEmpty() {
  const pays = [
    { code: 'FR', emoji: '🇫🇷', label: 'France' },
    { code: 'DE', emoji: '🇩🇪', label: 'Allemagne' },
    { code: 'NL', emoji: '🇳🇱', label: 'Pays-Bas' },
    { code: 'ES', emoji: '🇪🇸', label: 'Espagne' },
  ]
  return (
    <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center">
      <div className="text-4xl mb-3">🇪🇺</div>
      <h3 className="text-lg font-semibold mb-1">Bienvenue sur EU Company OS</h3>
      <p className="text-sm text-gray-500 mb-6">Commencez par ajouter votre première entité légale. Où êtes-vous immatriculé ?</p>
      <div className="flex gap-3 justify-center mb-4">
        {pays.map(p => (
          <Link
            key={p.code}
            href={`/entites/nouvelle?pays=${p.code}`}
            className="flex flex-col items-center gap-1 px-4 py-3 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 border border-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <span className="text-2xl">{p.emoji}</span>
            <span className="text-xs font-medium text-gray-700">{p.label}</span>
          </Link>
        ))}
      </div>
      <Link href="/entites/nouvelle" className="text-xs text-gray-400 hover:text-gray-600">Autre pays EU →</Link>
    </div>
  )
}

function MACFSummary() {
  const macf = MACF_MOCK
  const { co2Total, coutTotal, stockRequis, economieTotal } = getMACFStats(macf)
  const stockAlert = macf.stock_certificats < stockRequis

  return (
    <div className="bg-eu-dark rounded-xl p-5 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Leaf size={16} className="text-emerald-400" />
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-400">MACF / CBAM</div>
            <div className="text-sm font-semibold">Mécanisme d'Ajustement Carbone aux Frontières</div>
          </div>
        </div>
        <Link href="/macf" className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
          Voir le tableau de bord <ChevronRight size={12} />
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 mb-1">Prix ETS actuel</div>
          <div className="text-lg font-bold">{macf.prix_ets_actuel} €/t</div>
        </div>
        <div className={`rounded-lg p-3 ${stockAlert ? 'bg-orange-900/40 border border-orange-700/50' : 'bg-slate-800'}`}>
          <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
            {stockAlert && <AlertTriangle size={9} className="text-orange-400" />}Stock certificats
          </div>
          <div className={`text-lg font-bold ${stockAlert ? 'text-orange-400' : ''}`}>
            {macf.stock_certificats.toLocaleString('fr')}
          </div>
          <div className="text-[10px] text-slate-500">{stockAlert ? `Manque ${(stockRequis - macf.stock_certificats).toLocaleString('fr')}` : 'Seuil OK'}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 mb-1">Coût carbone 2026</div>
          <div className="text-lg font-bold">{(coutTotal / 1e6).toFixed(2)} M€</div>
          <div className="text-[10px] text-slate-500">{co2Total.toLocaleString('fr')} t CO₂</div>
        </div>
        <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-lg p-3">
          <div className="text-[10px] text-emerald-400 mb-1">Économies vs défaut</div>
          <div className="text-lg font-bold text-emerald-400">{Math.round(economieTotal / 1000)}k€/an</div>
          <div className="text-[10px] text-slate-500">données réelles fournisseurs</div>
        </div>
      </div>
    </div>
  )
}

function DirectiveBadge() {
  return (
    <div className="bg-eu-dark rounded-xl p-5 text-white">
      <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Directive (UE) 2025/25</div>
      <h3 className="text-base font-semibold mb-3">Votre checklist conformité</h3>
      <div className="space-y-2">
        {[
          { done: true, label: 'Certificat d\'entreprise EU généré (FR)' },
          { done: false, label: 'Certificat EU — Allemagne' },
          { done: false, label: 'Certificat EU — Pays-Bas' },
          { done: true, label: 'European Business Wallet configuré' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={item.done ? 'text-green-400' : 'text-slate-600'}>
              {item.done ? '✅' : '⬜'}
            </span>
            <span className={`text-sm ${item.done ? 'text-slate-300' : 'text-slate-500'}`}>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-slate-700">
        <div className="text-xs text-slate-400">Application effective : 31 juillet 2028</div>
        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '50%' }} />
        </div>
        <div className="text-xs text-slate-500 mt-1">2 / 4 entités conformes</div>
      </div>
    </div>
  )
}
