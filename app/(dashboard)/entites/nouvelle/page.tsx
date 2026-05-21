'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import { PAYS_EU } from '@/lib/eu/pays'
import { validateCP, validateCapital, getCPExemple, getCapitalMin } from '@/lib/eu/validation'
import { addLocalEntite } from '@/lib/local-store'
import type { EntiteAvecDetails } from '@/lib/eu/types'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

function NouvelleEntiteForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [form, setForm] = useState({
    nom_legal: '',
    forme_juridique: '',
    pays: params.get('pays') ?? 'FR',
    numero_registre: '',
    capital_social: '',
    ville: '',
    rue: '',
    cp: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const paysConfig = PAYS_EU.find(p => p.code === form.pays)
  const formes = paysConfig?.formes_juridiques ?? []
  const capitalMin = getCapitalMin(form.pays, form.forme_juridique)

  const handleChange = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n })
  }

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {}

    if (!form.nom_legal.trim()) errs.nom_legal = 'Nom légal requis'
    if (!form.forme_juridique) errs.forme_juridique = 'Sélectionnez une forme juridique'

    if (form.capital_social !== '') {
      const capErr = validateCapital(form.capital_social, form.pays, form.forme_juridique)
      if (capErr) errs.capital_social = capErr
    }

    if (form.cp) {
      const cpErr = validateCP(form.pays, form.cp)
      if (cpErr) errs.cp = cpErr
    }

    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSaving(true)

    const id = `ent-local-${Date.now()}`
    const now = new Date().toISOString()
    const entite: EntiteAvecDetails = {
      id,
      organisation_id: 'org-1',
      nom_legal: form.nom_legal.trim(),
      forme_juridique: form.forme_juridique,
      pays: form.pays,
      numero_registre: form.numero_registre || undefined,
      capital_social: form.capital_social ? Number(form.capital_social) : undefined,
      devise: 'EUR',
      siege_social: form.rue ? {
        rue: form.rue,
        cp: form.cp,
        ville: form.ville,
        pays: paysConfig?.nom_fr ?? form.pays,
      } : undefined,
      statut: 'active',
      created_at: now,
      updated_at: now,
      obligations: [],
      representants: [],
      documents: [],
      associes: [],
    }

    addLocalEntite(entite)
    await new Promise(r => setTimeout(r, 400))
    router.push('/entites')
  }

  const cpExemple = getCPExemple(form.pays)

  return (
    <div>
      <Header
        title="Nouvelle entité légale"
        subtitle="Ajoutez une société à votre portefeuille EU"
        action={
          <Link href="/entites" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
            <ChevronLeft size={14} /> Retour
          </Link>
        }
      />

      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Pays */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Localisation</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Pays</label>
                <select
                  value={form.pays}
                  onChange={e => { handleChange('pays', e.target.value); handleChange('forme_juridique', '') }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PAYS_EU.map(p => (
                    <option key={p.code} value={p.code}>{p.emoji} {p.nom_fr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Forme juridique</label>
                <select
                  value={form.forme_juridique}
                  onChange={e => handleChange('forme_juridique', e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.forme_juridique ? 'border-red-400' : 'border-gray-200'}`}
                >
                  <option value="">Sélectionner...</option>
                  {formes.map(f => (
                    <option key={f.code} value={f.code}>{f.nom} {f.capital_min > 0 ? `(min. ${f.capital_min.toLocaleString('fr')} €)` : ''}</option>
                  ))}
                </select>
                {errors.forme_juridique && <p className="mt-1 text-xs text-red-500">{errors.forme_juridique}</p>}
              </div>
            </div>
          </div>

          {/* Identité */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Identité légale</div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nom légal</label>
                <input
                  type="text"
                  value={form.nom_legal}
                  onChange={e => handleChange('nom_legal', e.target.value)}
                  placeholder={`Ex: Lumia Technologies ${form.forme_juridique || (paysConfig?.formes_juridiques[0]?.code ?? '')}`}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.nom_legal ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.nom_legal && <p className="mt-1 text-xs text-red-500">{errors.nom_legal}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">N° de registre</label>
                  <input
                    type="text"
                    value={form.numero_registre}
                    onChange={e => handleChange('numero_registre', e.target.value)}
                    placeholder="Ex: 893 456 789"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Capital social (€){capitalMin > 0 ? ` — min. ${capitalMin.toLocaleString('fr')} €` : ''}
                  </label>
                  <input
                    type="number"
                    value={form.capital_social}
                    onChange={e => handleChange('capital_social', e.target.value)}
                    placeholder={`${capitalMin.toLocaleString('fr')}`}
                    min={0}
                    step="1"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.capital_social ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.capital_social && <p className="mt-1 text-xs text-red-500">{errors.capital_social}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Siège social */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Siège social</div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Adresse</label>
                <input
                  type="text"
                  value={form.rue}
                  onChange={e => handleChange('rue', e.target.value)}
                  placeholder="15 rue du Faubourg Saint-Antoine"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Code postal</label>
                  <input
                    type="text"
                    value={form.cp}
                    onChange={e => handleChange('cp', e.target.value)}
                    placeholder={cpExemple || '75011'}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.cp ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.cp && <p className="mt-1 text-xs text-red-500">{errors.cp}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Ville</label>
                  <input
                    type="text"
                    value={form.ville}
                    onChange={e => handleChange('ville', e.target.value)}
                    placeholder="Paris"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/entites" className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {saving ? 'Création en cours...' : 'Créer l\'entité légale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NouvelleEntitePage() {
  return (
    <Suspense>
      <NouvelleEntiteForm />
    </Suspense>
  )
}
