'use client'

import { useRef } from 'react'
import type { Document } from '@/lib/eu/types'
import { formatDate } from '@/lib/utils'
import { Award, FileText, Upload, Download, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Props { documents: Document[]; entiteId: string }

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

function openGenericDoc(doc: Document) {
  const today = new Date().toLocaleDateString('fr-FR')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${doc.nom}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 60px auto; padding: 40px; color: #1a1a2e; }
  .header { background: #003399; color: #fff; padding: 24px 32px; margin-bottom: 32px; border-radius: 4px; }
  .header h1 { font-size: 18px; margin: 0; }
  .header p { font-size: 11px; color: #aac4ff; margin: 4px 0 0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  td { padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px; }
  td:first-child { color: #666; width: 40%; }
  td:last-child { font-weight: 600; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #eee; font-size: 10px; color: #999; text-align: center; }
  @media print { body { margin: 20px; } }
  @page { margin: 15mm; }
</style></head><body>
<div class="header"><h1>${doc.nom}</h1><p>${TYPE_LABELS[doc.type] ?? doc.type} · Directive (UE) 2025/25</p></div>
<table>
  <tr><td>Type de document</td><td>${TYPE_LABELS[doc.type] ?? doc.type}</td></tr>
  <tr><td>Langue</td><td>${doc.langue?.toUpperCase() ?? 'FR'}</td></tr>
  ${doc.date_emission ? `<tr><td>Date d'émission</td><td>${new Date(doc.date_emission).toLocaleDateString('fr-FR')}</td></tr>` : ''}
  ${doc.date_expiration ? `<tr><td>Date d'expiration</td><td>${new Date(doc.date_expiration).toLocaleDateString('fr-FR')}</td></tr>` : ''}
</table>
<div class="footer"><p>Document généré le ${today} · EU Company OS · Conforme Directive (UE) 2025/25</p></div>
<script>setTimeout(() => window.print(), 600)</script>
</body></html>`
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 8000)
}

function DocRow({ doc, entiteId }: { doc: Document; entiteId: string }) {
  const isCertEU = doc.est_certificat_eu || doc.type === 'eu_certificate'

  const inner = (
    <>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isCertEU ? 'bg-indigo-100' : 'bg-gray-100'} group-hover:scale-105 transition-transform`}>
        {isCertEU ? <Award size={20} className="text-indigo-600" /> : <FileText size={20} className="text-gray-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 truncate">{doc.nom}</span>
          {isCertEU && (
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">EU 2025/25</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-500">{TYPE_LABELS[doc.type] ?? doc.type}</span>
          {doc.date_emission && <span className="text-xs text-gray-400">{formatDate(doc.date_emission)}</span>}
          {doc.date_expiration && (
            <span className="text-xs text-amber-600 font-medium">Expire : {formatDate(doc.date_expiration)}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 text-xs font-medium">
        {isCertEU ? (
          <span className="flex items-center gap-1 text-indigo-600">
            Ouvrir <ChevronRight size={14} />
          </span>
        ) : doc.fichier_url ? (
          <span className="flex items-center gap-1 text-indigo-600">
            Voir <ChevronRight size={14} />
          </span>
        ) : (
          <span className="flex items-center gap-1 text-gray-500 group-hover:text-gray-800">
            <Download size={14} /> Télécharger
          </span>
        )}
      </div>
    </>
  )

  const baseClass = 'group bg-white rounded-xl border border-gray-100 px-4 py-3.5 flex items-center gap-4 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-sm transition-all cursor-pointer w-full text-left'

  if (doc.fichier_url) {
    return (
      <a href={doc.fichier_url} target="_blank" rel="noopener noreferrer" className={baseClass}>
        {inner}
      </a>
    )
  }
  if (isCertEU) {
    return (
      <Link href={`/entites/${entiteId}/certificat`} className={baseClass}>
        {inner}
      </Link>
    )
  }
  return (
    <button onClick={() => openGenericDoc(doc)} className={baseClass}>
      {inner}
    </button>
  )
}

export default function DocumentsTab({ documents, entiteId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {documents.length} document{documents.length > 1 ? 's' : ''}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/entites/${entiteId}/certificat`}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Award size={13} />
            Générer Certificat EU
          </Link>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload size={13} />
            Uploader un document
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) alert(`Fichier « ${file.name} » reçu. (Upload vers serveur à connecter)`)
              e.target.value = ''
            }}
          />
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
          <FileText size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-gray-600">Aucun document</p>
          <p className="text-xs mt-1 mb-4">Commencez par générer votre Certificat EU</p>
          <Link
            href={`/entites/${entiteId}/certificat`}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Award size={14} /> Générer le Certificat EU
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map(doc => (
            <DocRow key={doc.id} doc={doc} entiteId={entiteId} />
          ))}
        </div>
      )}
    </div>
  )
}
