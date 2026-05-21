'use client'

import { useDashboardData } from '@/hooks/useDashboardData'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { PlusCircle, Globe, Building2, ExternalLink } from 'lucide-react'
import { PAYS_EU } from '@/lib/eu/pays'

const STATUT_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  en_creation: { label: 'En création', color: 'bg-yellow-100 text-yellow-700' },
  en_liquidation: { label: 'En liquidation', color: 'bg-red-100 text-red-700' },
  dissoute: { label: 'Dissoute', color: 'bg-gray-100 text-gray-500' },
}

export default function FilialesPage() {
  const { data, loading } = useDashboardData()

  const toutes = data?.entites ?? []
  const filiales = toutes.filter(e => !!e.entite_parente_id)
  const parentes = toutes.filter(e => !e.entite_parente_id)

  const getParentNom = (parentId: string) =>
    toutes.find(e => e.id === parentId)?.nom_legal ?? '—'

  return (
    <div>
      <Header
        title="Filiales EU"
        subtitle={filiales.length > 0
          ? `${filiales.length} filiale${filiales.length > 1 ? 's' : ''} dans ${new Set(filiales.map(f => f.pays)).size} pays`
          : 'Créez et gérez vos filiales dans toute l\'Europe'}
        action={
          <Link
            href="/filiales/nouvelle"
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            <PlusCircle size={14} />
            Nouvelle filiale
          </Link>
        }
      />

      <div className="p-6 space-y-5">

        {/* Filiales existantes */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filiales.length > 0 ? (
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Vos filiales</div>
            <div className="space-y-2">
              {filiales.map(f => {
                const pays = PAYS_EU.find(p => p.code === f.pays)
                const statut = STATUT_LABELS[f.statut] ?? STATUT_LABELS.en_creation
                return (
                  <Link
                    key={f.id}
                    href={`/entites/${f.id}`}
                    className="group bg-white rounded-xl border border-gray-100 px-4 py-3.5 flex items-center gap-3 hover:border-indigo-200 hover:bg-indigo-50/20 hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 text-xl">
                      {pays?.emoji ?? '🏢'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900 group-hover:text-indigo-700 transition-colors">
                          {f.nom_legal}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                          {f.forme_juridique}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statut.color}`}>
                          {statut.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-400">
                          {pays?.nom_fr ?? f.pays}
                        </span>
                        <span className="text-xs text-gray-400">
                          Filiale de <span className="font-medium">{getParentNom(f.entite_parente_id!)}</span>
                        </span>
                        {f.capital_social && (
                          <span className="text-xs text-gray-400">
                            Capital : {f.capital_social.toLocaleString('fr')} {f.devise}
                          </span>
                        )}
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-gray-400 group-hover:text-indigo-500 flex-shrink-0 transition-colors" />
                  </Link>
                )
              })}
            </div>
          </div>
        ) : null}

        {/* Promo / CTA */}
        {!loading && filiales.length === 0 && (
          <div className="bg-eu-dark rounded-2xl p-8 text-white text-center">
            <Globe size={40} className="mx-auto mb-3 text-indigo-400" />
            <h2 className="text-xl font-bold mb-2">Filiale Express</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-5">
              Créez une filiale dans n'importe quel État membre de l'UE en quelques clics. Statuts générés automatiquement, procuration numérique EU, checklist de conformité.
            </p>
            <div className="flex gap-3 justify-center flex-wrap mb-5">
              {['🇫🇷 France', '🇩🇪 Allemagne', '🇳🇱 Pays-Bas', '🇪🇸 Espagne', '🇮🇹 Italie', '🇧🇪 Belgique'].map(c => (
                <span key={c} className="bg-slate-800 px-3 py-1.5 rounded-lg text-sm">{c}</span>
              ))}
              <span className="bg-slate-800 px-3 py-1.5 rounded-lg text-sm text-slate-400">+21 pays EU</span>
            </div>
            <Link
              href="/filiales/nouvelle"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              <PlusCircle size={18} />
              Créer une filiale en 6 étapes
            </Link>
          </div>
        )}

        {/* Encart si des filiales existent déjà */}
        {!loading && filiales.length > 0 && (
          <div className="bg-eu-dark rounded-2xl p-6 text-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Globe size={32} className="text-indigo-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-sm mb-0.5">Filiale Express — 27 États membres</div>
                <p className="text-slate-400 text-xs">
                  Statuts auto, procuration numérique EU sans apostille, checklist de conformité.
                </p>
              </div>
            </div>
            <Link
              href="/filiales/nouvelle"
              className="flex-shrink-0 flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              <PlusCircle size={16} />
              Nouvelle filiale
            </Link>
          </div>
        )}

        {/* Feature cards — always shown */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: '⚡', titre: 'Création rapide', desc: 'Wizard guidé en 6 étapes — de quelques heures à 48h selon le pays' },
            { icon: '📄', titre: 'Statuts auto', desc: 'Templates juridiques harmonisés par pays et forme juridique — 12 articles complets' },
            { icon: '🔐', titre: 'Procuration EU', desc: 'Procuration numérique valable sans apostille dans les 27 États membres' },
          ].map(f => (
            <div key={f.titre} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-semibold text-gray-900 text-sm mb-1">{f.titre}</div>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Sociétés mères disponibles */}
        {!loading && parentes.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Sociétés mères disponibles ({parentes.length})
            </div>
            <div className="space-y-2">
              {parentes.map(e => {
                const pays = PAYS_EU.find(p => p.code === e.pays)
                const count = filiales.filter(f => f.entite_parente_id === e.id).length
                return (
                  <div key={e.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <Building2 size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 flex-1">{e.nom_legal}</span>
                    <span className="text-xs text-gray-400">{pays?.emoji} {pays?.nom_fr}</span>
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                      {count} filiale{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
