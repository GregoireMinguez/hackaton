'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useEntite } from '@/hooks/useEntite'
import Header from '@/components/layout/Header'
import InfosTab from '@/components/entite/InfosTab'
import DocumentsTab from '@/components/entite/DocumentsTab'
import EquipeTab from '@/components/entite/EquipeTab'
import ObligationsTab from '@/components/entite/ObligationsTab'
import HistoriqueTab from '@/components/entite/HistoriqueTab'
import { getPaysParCode } from '@/lib/eu/pays'
import { cn, statutColor } from '@/lib/utils'
import Link from 'next/link'
import { ChevronLeft, Award } from 'lucide-react'

const TABS = [
  { id: 'infos', label: 'Informations' },
  { id: 'documents', label: 'Documents' },
  { id: 'equipe', label: 'Équipe légale' },
  { id: 'obligations', label: 'Obligations' },
  { id: 'historique', label: 'Historique' },
] as const

type Tab = typeof TABS[number]['id']

export default function EntiteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { entite, activity, loading } = useEntite(id)
  const [activeTab, setActiveTab] = useState<Tab>('infos')

  if (loading) {
    return (
      <div>
        <Header title="Chargement..." />
        <div className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-100 h-24 animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!entite) {
    return (
      <div>
        <Header title="Entité introuvable" />
        <div className="p-6 text-center py-16">
          <p className="text-gray-500">Cette entité n'existe pas ou vous n'y avez pas accès.</p>
          <Link href="/entites" className="text-indigo-600 text-sm mt-2 inline-block">Retour aux entités</Link>
        </div>
      </div>
    )
  }

  const pays = getPaysParCode(entite.pays)
  const hasCertificatEU = entite.documents.some(d => d.est_certificat_eu)
  const obligationsUrgentes = entite.obligations.filter(
    o => o.statut === 'a_faire' && new Date(o.echeance) <= new Date(Date.now() + 7 * 86400000),
  ).length

  const action = (
    <div className="flex items-center gap-2">
      <Link href="/entites" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ChevronLeft size={14} /> Retour
      </Link>
      <Link
        href={`/entites/${id}/certificat`}
        className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
      >
        <Award size={13} />
        Certificat EU
      </Link>
    </div>
  )

  return (
    <div>
      <Header
        title={entite.nom_legal}
        subtitle={`${entite.forme_juridique} · ${pays?.nom_fr ?? entite.pays}`}
        action={action}
      />

      <div className="p-6">
        {/* Entity header */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{pays?.emoji ?? '🏳️'}</span>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">{entite.nom_legal}</h2>
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', statutColor(entite.statut))}>
                  {entite.statut === 'active' ? 'Active' : entite.statut === 'en_creation' ? 'En création' : entite.statut}
                </span>
                {hasCertificatEU && (
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Award size={11} /> Conforme au cadre EU
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {entite.forme_juridique} · {pays?.nom_fr} · {entite.numero_registre ?? 'N° registre non renseigné'}
              </p>
            </div>
            {obligationsUrgentes > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center flex-shrink-0">
                <div className="text-xl font-bold text-red-600">{obligationsUrgentes}</div>
                <div className="text-[10px] text-red-500 font-medium">alerte{obligationsUrgentes > 1 ? 's' : ''} urgente{obligationsUrgentes > 1 ? 's' : ''}</div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-5">
          <nav className="flex gap-0.5">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800',
                )}
              >
                {tab.label}
                {tab.id === 'obligations' && obligationsUrgentes > 0 && (
                  <span className="ml-1.5 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                    {obligationsUrgentes}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'infos' && <InfosTab entite={entite} />}
          {activeTab === 'documents' && <DocumentsTab documents={entite.documents} entiteId={id} />}
          {activeTab === 'equipe' && <EquipeTab representants={entite.representants} />}
          {activeTab === 'obligations' && <ObligationsTab obligations={entite.obligations} />}
          {activeTab === 'historique' && <HistoriqueTab activity={activity} />}
        </div>
      </div>
    </div>
  )
}
