'use client'

import { useState } from 'react'
import { useDashboardData } from '@/hooks/useDashboardData'
import EntiteCard from '@/components/dashboard/EntiteCard'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { PlusCircle, Search } from 'lucide-react'
import { PAYS_EU } from '@/lib/eu/pays'

export default function EntitesPage() {
  const { data, loading } = useDashboardData()
  const [search, setSearch] = useState('')
  const [filterPays, setFilterPays] = useState('')

  const entites = (data?.entites ?? []).filter(e => {
    const matchSearch = !search || e.nom_legal.toLowerCase().includes(search.toLowerCase())
    const matchPays = !filterPays || e.pays === filterPays
    return matchSearch && matchPays
  })

  const action = (
    <Link
      href="/entites/nouvelle"
      className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
    >
      <PlusCircle size={14} />
      Ajouter une entité
    </Link>
  )

  return (
    <div>
      <Header title="Mes entités légales" subtitle={`${data?.entites.length ?? 0} entités dans ${new Set(data?.entites.map(e => e.pays)).size ?? 0} pays`} action={action} />

      <div className="p-6">
        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une entité..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterPays}
            onChange={e => setFilterPays(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Tous les pays</option>
            {PAYS_EU.map(p => (
              <option key={p.code} value={p.code}>{p.emoji} {p.nom_fr}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 h-40 animate-pulse" />
            ))}
          </div>
        ) : entites.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🏢</div>
            <p className="font-medium text-gray-600">Aucune entité trouvée</p>
            <p className="text-sm mt-1">Ajoutez votre première entité légale EU</p>
            <Link href="/entites/nouvelle" className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
              Ajouter une entité
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {entites.map(e => <EntiteCard key={e.id} entite={e} />)}
          </div>
        )}
      </div>
    </div>
  )
}
