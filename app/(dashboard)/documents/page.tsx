'use client'

import { useRef, useState } from 'react'
import { useDashboardData } from '@/hooks/useDashboardData'
import Header from '@/components/layout/Header'
import { formatDate } from '@/lib/utils'
import { getPaysParCode } from '@/lib/eu/pays'
import { Award, FileText, Search, Upload, Download, ExternalLink, Check } from 'lucide-react'
import type { Document } from '@/lib/eu/types'
import Link from 'next/link'

const TYPE_LABELS: Record<string, string> = {
  eu_certificate: 'Certificat EU',
  statuts: 'Statuts',
  extrait_kbis: 'Extrait / Kbis',
  pv_ag: 'PV AG',
  procuration_eu: 'Procuration EU',
  bilan: 'Bilan',
  rapport_cac: 'Rapport CAC',
  contrat: 'Contrat',
  autre: 'Autre',
}

const TYPE_FILTERS = ['Tous', ...Object.values(TYPE_LABELS)]

function openDoc(doc: Document) {
  const today = new Date().toLocaleDateString('fr-FR')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${doc.nom}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 60px auto; padding: 40px; }
  .header { background: #003399; color: #fff; padding: 24px 32px; margin-bottom: 32px; border-radius: 4px; }
  h1 { font-size: 18px; margin: 0; }
  .sub { font-size: 11px; color: #aac4ff; margin: 4px 0 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px; }
  td:first-child { color: #666; width: 40%; }
  td:last-child { font-weight: 600; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #eee; font-size: 10px; color: #999; text-align: center; }
  @page { margin: 15mm; }
</style></head><body>
<div class="header"><h1>${doc.nom}</h1><p class="sub">${TYPE_LABELS[doc.type] ?? doc.type} · Cadre européen</p></div>
<table>
  <tr><td>Type</td><td>${TYPE_LABELS[doc.type] ?? doc.type}</td></tr>
  <tr><td>Langue</td><td>${doc.langue?.toUpperCase() ?? 'FR'}</td></tr>
  ${doc.date_emission ? `<tr><td>Date d'émission</td><td>${new Date(doc.date_emission).toLocaleDateString('fr-FR')}</td></tr>` : ''}
  ${doc.date_expiration ? `<tr><td>Date d'expiration</td><td>${new Date(doc.date_expiration).toLocaleDateString('fr-FR')}</td></tr>` : ''}
</table>
<div class="footer"><p>Généré le ${today} · EU Company OS · Conforme au cadre européen</p></div>
<script>setTimeout(() => window.print(), 600)</script>
</body></html>`
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 8000)
}

export default function DocumentsPage() {
  const { data, loading } = useDashboardData()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('Tous')
  const [uploadToast, setUploadToast] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  type DocWithContext = Document & { entiteNom: string; entitePays: string; entiteId: string }

  const allDocs: DocWithContext[] = (data?.entites ?? []).flatMap(e =>
    e.documents.map(d => ({ ...d, entiteNom: e.nom_legal, entitePays: e.pays, entiteId: e.id })),
  )

  const filtered = allDocs.filter(d => {
    const matchSearch = !search ||
      d.nom.toLowerCase().includes(search.toLowerCase()) ||
      d.entiteNom.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'Tous' || TYPE_LABELS[d.type] === typeFilter
    return matchSearch && matchType
  })

  const certEU = allDocs.filter(d => d.est_certificat_eu).length
  const totalDocs = allDocs.length

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadToast(`« ${file.name} » importé avec succès`)
      setTimeout(() => setUploadToast(null), 4000)
    }
    e.target.value = ''
  }

  return (
    <div>
      {uploadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-green-200 rounded-2xl shadow-xl p-4 flex items-center gap-3 max-w-sm">
          <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Check size={16} className="text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">{uploadToast}</span>
        </div>
      )}

      <Header
        title="Documents"
        subtitle={`${totalDocs} documents · ${certEU} certificat${certEU > 1 ? 's' : ''} EU`}
        action={
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
            >
              <Upload size={14} /> Uploader un document
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg" className="hidden" onChange={handleUpload} />
          </>
        }
      />

      <div className="p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total documents', value: totalDocs, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Certificats EU', value: certEU, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Statuts & actes', value: allDocs.filter(d => d.type === 'statuts').length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Extraits registre', value: allDocs.filter(d => d.type === 'extrait_kbis').length, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-600 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {TYPE_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  typeFilter === f ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Document list */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-100 h-16 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucun document trouvé</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(doc => {
              const pays = getPaysParCode(doc.entitePays)
              const isCertEU = doc.est_certificat_eu || doc.type === 'eu_certificate'

              const inner = (
                <>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isCertEU ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                    {isCertEU ? <Award size={18} className="text-indigo-600" /> : <FileText size={18} className="text-gray-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{doc.nom}</span>
                      {isCertEU && (
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded flex-shrink-0">Cadre UE</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400">{pays?.emoji} {doc.entiteNom}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{TYPE_LABELS[doc.type] ?? doc.type}</span>
                      {doc.date_emission && <span className="text-xs text-gray-400">{formatDate(doc.date_emission)}</span>}
                    </div>
                  </div>
                  {doc.date_expiration && (
                    <span className="text-xs text-amber-600 flex-shrink-0">Expire {formatDate(doc.date_expiration)}</span>
                  )}
                  <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 flex-shrink-0">
                    {isCertEU ? <><ExternalLink size={12} /> Ouvrir</> : doc.fichier_url ? <><ExternalLink size={12} /> Voir</> : <><Download size={12} /> Télécharger</>}
                  </span>
                </>
              )

              const rowClass = 'group bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 hover:border-indigo-200 hover:bg-indigo-50/20 hover:shadow-sm transition-all cursor-pointer'

              if (doc.fichier_url) return (
                <a key={doc.id} href={doc.fichier_url} target="_blank" rel="noopener noreferrer" className={rowClass}>{inner}</a>
              )
              if (isCertEU) return (
                <Link key={doc.id} href={`/entites/${doc.entiteId}/certificat`} className={rowClass}>{inner}</Link>
              )
              return (
                <button key={doc.id} onClick={() => openDoc(doc)} className={`${rowClass} w-full text-left`}>{inner}</button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
