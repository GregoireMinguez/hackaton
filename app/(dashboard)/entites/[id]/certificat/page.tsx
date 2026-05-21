'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useEntite } from '@/hooks/useEntite'
import Header from '@/components/layout/Header'
import { getPaysParCode } from '@/lib/eu/pays'
import { formatDate } from '@/lib/utils'
import { Printer, ChevronLeft, Share2, CheckCircle, ShieldCheck, Globe } from 'lucide-react'
import Link from 'next/link'
import type { EntiteAvecDetails } from '@/lib/eu/types'

const LANGUES = [
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'de', label: '🇩🇪 Deutsch' },
  { code: 'nl', label: '🇳🇱 Nederlands' },
  { code: 'es', label: '🇪🇸 Español' },
]

const LABELS: Record<string, Record<string, string>> = {
  fr: {
    title: 'CERTIFICAT D\'ENTREPRISE EUROPÉEN',
    subtitle: 'European Union Company Certificate · Europäisches Unternehmenszertifikat',
    legalName: 'Dénomination sociale',
    legalForm: 'Forme juridique',
    country: 'État membre d\'immatriculation',
    regNumber: 'Numéro d\'immatriculation',
    regDate: 'Date d\'immatriculation',
    address: 'Siège social',
    capital: 'Capital social',
    status: 'Statut juridique',
    active: 'ACTIVE',
    legalReps: 'Représentants légaux autorisés',
    issueDate: 'Date d\'émission',
    certNumber: 'N° du certificat',
    issuer: 'Autorité émettrice',
    issuerValue: 'EU Company OS — Registre Numérique Européen',
    legal: 'Document émis conformément au cadre européen des sociétés transfrontalières.\nReconnu de plein droit dans les 27 États membres de l\'Union européenne sans légalisation ni apostille.',
    verify: 'Vérification en ligne :',
  },
  en: {
    title: 'EUROPEAN COMPANY CERTIFICATE',
    subtitle: 'Certificat d\'Entreprise Européen · Europäisches Unternehmenszertifikat',
    legalName: 'Company name',
    legalForm: 'Legal form',
    country: 'Member state of registration',
    regNumber: 'Registration number',
    regDate: 'Date of registration',
    address: 'Registered office',
    capital: 'Share capital',
    status: 'Legal status',
    active: 'ACTIVE',
    legalReps: 'Authorised legal representatives',
    issueDate: 'Date of issue',
    certNumber: 'Certificate number',
    issuer: 'Issuing authority',
    issuerValue: 'EU Company OS — European Digital Register',
    legal: 'Document issued pursuant to the European framework for cross-border companies.\nRecognised in all 27 Member States of the European Union without legalisation or apostille.',
    verify: 'Online verification:',
  },
  de: {
    title: 'EUROPÄISCHES UNTERNEHMENSZERTIFIKAT',
    subtitle: 'European Union Company Certificate · Certificat d\'Entreprise Européen',
    legalName: 'Unternehmensbezeichnung',
    legalForm: 'Rechtsform',
    country: 'Registrierungsmitgliedstaat',
    regNumber: 'Registrierungsnummer',
    regDate: 'Eintragusdatum',
    address: 'Eingetragener Sitz',
    capital: 'Stammkapital',
    status: 'Rechtsstatus',
    active: 'AKTIV',
    legalReps: 'Bevollmächtigte Vertreter',
    issueDate: 'Ausstellungsdatum',
    certNumber: 'Zertifikat-Nummer',
    issuer: 'Ausstellende Behörde',
    issuerValue: 'EU Company OS — Europäisches Digitalregister',
    legal: 'Gemäß dem europäischen Rahmen für grenzüberschreitende Gesellschaften ausgestelltes Dokument.\nIn allen 27 EU-Mitgliedstaaten anerkannt, ohne Legalisierung oder Apostille.',
    verify: 'Online-Verifizierung:',
  },
  nl: {
    title: 'EUROPEES BEDRIJFSCERTIFICAAT',
    subtitle: 'European Union Company Certificate · Certificat d\'Entreprise Européen',
    legalName: 'Handelsnaam',
    legalForm: 'Rechtsvorm',
    country: 'Lidstaat van inschrijving',
    regNumber: 'Inschrijvingsnummer',
    regDate: 'Inschrijvingsdatum',
    address: 'Vestigingsadres',
    capital: 'Maatschappelijk kapitaal',
    status: 'Juridische status',
    active: 'ACTIEF',
    legalReps: 'Bevoegde wettelijke vertegenwoordigers',
    issueDate: 'Datum van afgifte',
    certNumber: 'Certificaatnummer',
    issuer: 'Uitgevende instantie',
    issuerValue: 'EU Company OS — Europees Digitaal Register',
    legal: 'Document afgegeven krachtens het Europese kader voor grensoverschrijdende vennootschappen.\nErkend in alle 27 lidstaten van de Europese Unie zonder legalisatie of apostille.',
    verify: 'Online verificatie:',
  },
  es: {
    title: 'CERTIFICADO DE EMPRESA EUROPEO',
    subtitle: 'European Union Company Certificate · Certificat d\'Entreprise Européen',
    legalName: 'Denominación social',
    legalForm: 'Forma jurídica',
    country: 'Estado miembro de registro',
    regNumber: 'Número de registro',
    regDate: 'Fecha de registro',
    address: 'Domicilio social',
    capital: 'Capital social',
    status: 'Situación jurídica',
    active: 'ACTIVA',
    legalReps: 'Representantes legales autorizados',
    issueDate: 'Fecha de emisión',
    certNumber: 'Número de certificado',
    issuer: 'Autoridad emisora',
    issuerValue: 'EU Company OS — Registro Digital Europeo',
    legal: 'Documento emitido conforme al marco europeo de sociedades transfronterizas.\nReconocido en los 27 Estados miembros de la Unión Europea sin legalización ni apostilla.',
    verify: 'Verificación en línea:',
  },
}

function hashBits(str: string, n: number): boolean[] {
  return [...Array(n)].map((_, i) => {
    let h = 0x811c9dc5
    for (let j = 0; j < str.length; j++) h = Math.imul(h ^ str.charCodeAt(j), 0x01000193) + i * 0x9e3779b9
    return (h & 1) === 0
  })
}

function euEmblemSVG(size: number): string {
  const cx = size / 2, cy = size / 2, r = size * 0.38
  const stars = [...Array(12)].map((_, i) => {
    const a = (i * 30 - 90) * Math.PI / 180
    const x = (cx + r * Math.cos(a)).toFixed(2)
    const y = (cy + r * Math.sin(a)).toFixed(2)
    return `<text x="${x}" y="${y}" font-size="${size * 0.12}" fill="#FFD700" text-anchor="middle" dominant-baseline="central">★</text>`
  }).join('')
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${cx}" cy="${cy}" r="${size * 0.47}" fill="none" stroke="#003399" stroke-width="1.5"/>
    ${stars}
    <text x="${cx}" y="${cy - size * 0.04}" font-size="${size * 0.13}" fill="#003399" text-anchor="middle" font-family="Arial" font-weight="900">EU</text>
    <text x="${cx}" y="${cy + size * 0.09}" font-size="${size * 0.07}" fill="#003399" text-anchor="middle" font-family="Arial">★</text>
  </svg>`
}

function buildCertificatHTML(
  entite: EntiteAvecDetails,
  labels: Record<string, string>,
  certNum: string,
  paysEmoji: string,
  paysNom: string,
  today: string,
): string {
  const adresse = entite.siege_social
    ? `${entite.siege_social.rue}, ${entite.siege_social.cp} ${entite.siege_social.ville}`
    : '—'
  const reps = entite.representants.filter(r => !r.date_fin)
  const qrBits = hashBits(certNum, 25)
  const qrCells = qrBits.map(b => `<div style="width:100%;aspect-ratio:1;background:${b ? '#003399' : '#fff'};"></div>`).join('')
  const starsCircle = euEmblemSVG(80)
  const watermark = euEmblemSVG(180)
  const dateFormatted = new Date(today).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const verifyUrl = `https://eucompanyos.eu/verify/${certNum}`

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${labels.title} — ${entite.nom_legal}</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; background: #e8e8e8; display: flex; justify-content: center; padding: 20px; min-height: 100vh; }
  .page { width: 210mm; min-height: 297mm; background: #fff; position: relative; box-shadow: 0 8px 40px rgba(0,0,0,.25); overflow: hidden; }

  /* Security outer border */
  .sec-border { position: absolute; inset: 5mm; border: 1.5px solid #003399; pointer-events: none; z-index: 10; }
  .sec-border-2 { position: absolute; inset: 6.5mm; border: 0.5px solid rgba(0,51,153,.3); pointer-events: none; z-index: 10; }

  /* Watermark */
  .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); opacity: 0.04; pointer-events: none; z-index: 0; }

  /* Header */
  .header { background: #003399; padding: 7mm 12mm 6mm; position: relative; z-index: 1; }
  .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3mm; }
  .header-stars { color: #FFD700; font-size: 9px; letter-spacing: 4px; }
  .header-label { color: rgba(255,255,255,.6); font-family: Arial, sans-serif; font-size: 7pt; letter-spacing: 5px; text-transform: uppercase; }
  .header-directive { color: rgba(255,255,255,.5); font-family: Arial, sans-serif; font-size: 6.5pt; letter-spacing: 1px; }
  .header-title { text-align: center; color: #fff; font-size: 14pt; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; margin: 1mm 0 1.5mm; }
  .header-sub { text-align: center; color: rgba(255,255,255,.55); font-family: Arial, sans-serif; font-size: 7pt; letter-spacing: 2px; }

  /* Emblem + company name band */
  .company-band { display: flex; align-items: center; gap: 8mm; padding: 5mm 12mm; border-bottom: 2px solid #003399; background: #f5f7ff; }
  .company-info { flex: 1; }
  .company-name { font-size: 17pt; font-weight: 700; color: #003399; letter-spacing: .5px; line-height: 1.2; }
  .company-meta { font-family: Arial, sans-serif; font-size: 8.5pt; color: #6b7280; margin-top: 1mm; }

  /* Data section */
  .data { padding: 5mm 12mm; position: relative; z-index: 1; }
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table tr { border-bottom: 0.5px solid #e5e7eb; }
  .data-table tr:last-child { border-bottom: none; }
  .data-table td { padding: 2.5mm 1mm; vertical-align: top; }
  .td-label { font-family: Arial, sans-serif; font-size: 7.5pt; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; width: 46%; padding-right: 4mm; }
  .td-value { font-size: 10pt; font-weight: 600; color: #111827; }
  .status-badge { display: inline-block; background: #dcfce7; color: #14532d; font-family: Arial, sans-serif; font-size: 7pt; font-weight: 800; padding: 1mm 3mm; border-radius: 2px; letter-spacing: 1px; border: 0.5px solid #86efac; }

  /* Representatives */
  .reps { padding: 4mm 12mm; border-top: 1px solid #e5e7eb; background: #f9fafb; position: relative; z-index: 1; }
  .reps-label { font-family: Arial, sans-serif; font-size: 7pt; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2mm; }
  .rep-item { display: flex; gap: 6mm; font-size: 9.5pt; margin-bottom: 1mm; }
  .rep-name { font-weight: 700; color: #111827; }
  .rep-role { color: #6b7280; font-style: italic; }

  /* Security footer */
  .sec-footer { padding: 4mm 12mm; border-top: 2px solid #003399; display: flex; justify-content: space-between; align-items: flex-start; gap: 8mm; position: relative; z-index: 1; }
  .meta { flex: 1; }
  .meta-row { font-family: Arial, sans-serif; font-size: 8pt; margin-bottom: 1.5mm; color: #374151; display: flex; gap: 2mm; }
  .meta-label { color: #9ca3af; font-size: 7pt; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; white-space: nowrap; }
  .cert-num { font-family: 'Courier New', monospace; font-size: 9pt; font-weight: 700; color: #003399; letter-spacing: 1px; }
  .verify-url { font-family: Arial, sans-serif; font-size: 6.5pt; color: #6b7280; margin-top: 2mm; word-break: break-all; }
  .qr-wrap { display: flex; flex-direction: column; align-items: center; gap: 1.5mm; }
  .qr-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; padding: 2mm; border: 1.5px solid #003399; background: #003399; width: 22mm; height: 22mm; }
  .qr-label { font-family: Arial, sans-serif; font-size: 5.5pt; color: #6b7280; letter-spacing: 1px; text-transform: uppercase; }

  /* Legal footer */
  .legal-footer { background: #003399; padding: 3.5mm 12mm; position: absolute; bottom: 0; left: 0; right: 0; z-index: 2; }
  .legal-text { color: rgba(255,255,255,.65); font-family: Arial, sans-serif; font-size: 6.5pt; text-align: center; line-height: 1.7; }

  @media print {
    body { background: white; padding: 0; }
    .page { box-shadow: none; width: 100%; min-height: 100vh; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="sec-border"></div>
  <div class="sec-border-2"></div>
  <div class="watermark">${watermark}</div>

  <!-- Header -->
  <div class="header">
    <div class="header-row">
      <span class="header-stars">★ ★ ★ ★ ★ ★</span>
      <span class="header-label">Union Européenne</span>
      <span class="header-stars">★ ★ ★ ★ ★ ★</span>
    </div>
    <div class="header-title">${labels.title}</div>
    <div class="header-sub">${labels.subtitle}</div>
  </div>

  <!-- Company band -->
  <div class="company-band">
    ${starsCircle}
    <div class="company-info">
      <div class="company-name">${entite.nom_legal}</div>
      <div class="company-meta">${entite.forme_juridique} &nbsp;·&nbsp; ${paysEmoji} ${paysNom} &nbsp;·&nbsp; <span class="status-badge">${labels.active}</span></div>
    </div>
  </div>

  <!-- Data table -->
  <div class="data">
    <table class="data-table">
      <tr><td class="td-label">${labels.legalName}</td><td class="td-value">${entite.nom_legal}</td></tr>
      <tr><td class="td-label">${labels.legalForm}</td><td class="td-value">${entite.forme_juridique}</td></tr>
      <tr><td class="td-label">${labels.country}</td><td class="td-value">${paysEmoji} ${paysNom}</td></tr>
      <tr><td class="td-label">${labels.regNumber}</td><td class="td-value" style="font-family:'Courier New',monospace;font-size:10pt;">${entite.numero_registre ?? '—'}</td></tr>
      <tr><td class="td-label">${labels.regDate}</td><td class="td-value">${entite.date_immatriculation ? new Date(entite.date_immatriculation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}</td></tr>
      <tr><td class="td-label">${labels.address}</td><td class="td-value">${adresse}</td></tr>
      <tr><td class="td-label">${labels.capital}</td><td class="td-value">${entite.capital_social ? entite.capital_social.toLocaleString('fr-FR') + ' ' + (entite.devise || 'EUR') : '—'}</td></tr>
      <tr><td class="td-label">${labels.status}</td><td class="td-value"><span class="status-badge">${labels.active}</span></td></tr>
      <tr><td class="td-label">${labels.issuer}</td><td class="td-value" style="font-size:9pt;color:#6b7280;">${labels.issuerValue}</td></tr>
    </table>
  </div>

  ${reps.length > 0 ? `
  <div class="reps">
    <div class="reps-label">${labels.legalReps}</div>
    ${reps.map(r => `<div class="rep-item"><span class="rep-name">${r.nom_complet}</span><span class="rep-role">${r.role}</span>${r.email ? `<span style="font-family:Arial,sans-serif;font-size:8.5pt;color:#9ca3af;">${r.email}</span>` : ''}</div>`).join('')}
  </div>` : ''}

  <!-- Security footer -->
  <div class="sec-footer">
    <div class="meta">
      <div class="meta-row"><span class="meta-label">${labels.issueDate}</span>${dateFormatted}</div>
      <div class="meta-row"><span class="meta-label">${labels.certNumber}</span><span class="cert-num">${certNum}</span></div>
      <div class="verify-url">${labels.verify} ${verifyUrl}</div>
    </div>
    <div class="qr-wrap">
      <div class="qr-grid">${qrCells}</div>
      <div class="qr-label">Scanner</div>
    </div>
  </div>

  <!-- Legal footer -->
  <div class="legal-footer">
    <div class="legal-text">${labels.legal.split('\n').join(' &nbsp;|&nbsp; ')}</div>
  </div>
</div>
<script>setTimeout(() => window.print(), 700)</script>
</body>
</html>`
}

export default function CertificatPage() {
  const { id } = useParams<{ id: string }>()
  const { entite, loading } = useEntite(id)
  const [langue, setLangue] = useState('fr')
  const [copied, setCopied] = useState(false)

  const l = LABELS[langue] ?? LABELS.fr
  const pays = entite ? getPaysParCode(entite.pays) : null

  const certNum = useMemo(() => {
    if (!entite) return ''
    const suffix = entite.id.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase()
    const reg = (entite.numero_registre ?? 'NEW').replace(/\s/g, '').substring(0, 8)
    return `EU/${entite.pays}/${new Date().getFullYear()}/${reg}-${suffix}`
  }, [entite])

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const qrPattern = useMemo(() => hashBits(certNum || 'placeholder', 25), [certNum])

  const handlePDF = () => {
    if (!entite) return
    const html = buildCertificatHTML(entite, l, certNum, pays?.emoji ?? '', pays?.nom_fr ?? entite.pays, today)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(`https://eucompanyos.eu/verify/${certNum}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div><Header title="Chargement..." /></div>
  if (!entite) return (
    <div>
      <Header title="Entité introuvable" />
      <div className="p-6 text-center py-16">
        <p className="text-gray-500">Cette entité n'existe pas ou vous n'y avez pas accès.</p>
        <Link href="/entites" className="text-indigo-600 text-sm mt-2 inline-block">Retour aux entités</Link>
      </div>
    </div>
  )

  const reps = entite.representants.filter(r => !r.date_fin)

  return (
    <div>
      <Header
        title="Certificat d'Entreprise EU"
        subtitle="Cadre européen des sociétés transfrontalières · Format officiel reconnu dans les 27 États membres"
        action={
          <Link href={`/entites/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
            <ChevronLeft size={14} /> Retour à la fiche
          </Link>
        }
      />

      <div className="p-6">
        <div className="grid grid-cols-5 gap-6">

          {/* Controls */}
          <div className="col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Langue du certificat</div>
              <div className="space-y-1">
                {LANGUES.map(lg => (
                  <button
                    key={lg.code}
                    onClick={() => setLangue(lg.code)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      langue === lg.code ? 'bg-indigo-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {lg.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2.5">
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Actions</div>
              <button
                onClick={handlePDF}
                className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
              >
                <Printer size={15} /> Télécharger PDF officiel
              </button>
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                {copied ? <CheckCircle size={15} className="text-green-500" /> : <Globe size={15} />}
                {copied ? 'Lien copié !' : 'Copier lien de vérification'}
              </button>
            </div>

            <div className="bg-[#003399] rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-yellow-400" />
                <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Cadre européen des sociétés transfrontalières</div>
              </div>
              <p className="text-xs text-blue-200 leading-relaxed mb-2">
                Ce certificat est conforme au format standardisé de l'Union européenne. Il est reconnu comme preuve légale d'immatriculation dans les 27 États membres, <strong className="text-white">sans apostille ni légalisation</strong>.
              </p>
              <div className="text-[10px] text-blue-300 border-t border-blue-800 pt-2 mt-2">
                Application obligatoire : 31 juillet 2028<br />
                Numéro : <span className="font-mono text-blue-100">{certNum}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Données certifiées</div>
              <div className="space-y-2">
                {[
                  ['Entité', entite.nom_legal],
                  ['Forme', entite.forme_juridique],
                  ['Pays', `${pays?.emoji} ${pays?.nom_fr}`],
                  ['Capital', entite.capital_social ? `${entite.capital_social.toLocaleString('fr')} ${entite.devise}` : '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-gray-400">{k}</span>
                    <span className="font-semibold text-gray-900">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Certificate Preview */}
          <div className="col-span-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Aperçu — Format A4 officiel</div>

            <div className="relative border-2 border-[#003399] rounded-xl overflow-hidden shadow-lg" style={{ fontFamily: 'Georgia, serif' }}>
              {/* Inner security border */}
              <div className="absolute inset-1.5 border border-indigo-200/40 rounded-lg pointer-events-none z-10" />

              {/* EU Header */}
              <div className="bg-[#003399] text-white px-7 py-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-yellow-400 text-xs tracking-widest">★ ★ ★ ★ ★ ★</span>
                  <span className="text-[9px] text-blue-200 tracking-[4px] uppercase">Union Européenne</span>
                  <span className="text-yellow-400 text-xs tracking-widest">★ ★ ★ ★ ★ ★</span>
                </div>
                <div className="text-center">
                  <div className="text-[13px] font-bold tracking-[2px] uppercase">{l.title}</div>
                  <div className="text-[9px] text-blue-200 mt-1 tracking-widest">{l.subtitle}</div>
                </div>
              </div>

              {/* Company band */}
              <div className="flex items-center gap-4 px-6 py-4 bg-indigo-50/70 border-b-2 border-[#003399]">
                <svg width="44" height="44" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="37" fill="none" stroke="#003399" strokeWidth="1.5"/>
                  {[...Array(12)].map((_, i) => {
                    const a = (i * 30 - 90) * Math.PI / 180
                    return (
                      <text key={i} x={40 + 28 * Math.cos(a)} y={40 + 28 * Math.sin(a)} fontSize="9" fill="#FFD700" textAnchor="middle" dominantBaseline="central">★</text>
                    )
                  })}
                  <text x="40" y="38" fontSize="10" fill="#003399" textAnchor="middle" fontFamily="Arial" fontWeight="900">EU</text>
                  <text x="40" y="50" fontSize="8" fill="#003399" textAnchor="middle" fontFamily="Arial">★</text>
                </svg>
                <div>
                  <div className="text-base font-bold text-[#003399] tracking-wide">{entite.nom_legal}</div>
                  <div className="text-xs text-gray-500 mt-0.5 font-sans">
                    {entite.forme_juridique} · {pays?.emoji} {pays?.nom_fr}
                    <span className="ml-2 bg-green-100 text-green-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-green-200">{l.active}</span>
                  </div>
                </div>
              </div>

              {/* Data table */}
              <div className="px-6 py-4">
                <table className="w-full text-xs">
                  <tbody>
                    {[
                      [l.legalName, entite.nom_legal],
                      [l.legalForm, entite.forme_juridique],
                      [l.country, pays ? `${pays.emoji} ${pays.nom_fr}` : entite.pays],
                      [l.regNumber, entite.numero_registre ?? '—'],
                      [l.regDate, entite.date_immatriculation ? formatDate(entite.date_immatriculation) : '—'],
                      [l.address, entite.siege_social ? `${entite.siege_social.rue}, ${entite.siege_social.cp} ${entite.siege_social.ville}` : '—'],
                      [l.capital, entite.capital_social ? `${entite.capital_social.toLocaleString('fr')} ${entite.devise}` : '—'],
                      [l.issuer, l.issuerValue],
                    ].map(([label, value]) => (
                      <tr key={label} className="border-b border-gray-50">
                        <td className="py-2 pr-3 text-gray-400 font-sans font-semibold uppercase tracking-wide w-44" style={{ fontSize: '8px' }}>{label}</td>
                        <td className="py-2 text-gray-900 font-semibold">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Representatives */}
              {reps.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-sans">{l.legalReps}</div>
                  {reps.map(rep => (
                    <div key={rep.id} className="flex gap-3 text-xs mb-0.5">
                      <span className="font-bold text-gray-900">{rep.nom_complet}</span>
                      <span className="text-gray-500 italic">{rep.role}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Security footer */}
              <div className="px-6 py-3 border-t-2 border-[#003399] flex items-end justify-between gap-4">
                <div className="font-sans">
                  <div className="text-[8px] text-gray-400 mb-0.5">{l.issueDate} : <span className="text-gray-700 font-semibold">{formatDate(today)}</span></div>
                  <div className="text-[8px] text-gray-400">{l.certNumber} : <span className="font-mono text-[#003399] font-bold text-[9px]">{certNum}</span></div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="grid grid-cols-5 gap-px p-1.5 border-2 border-[#003399] bg-[#003399]" style={{ width: 52, height: 52 }}>
                    {qrPattern.map((filled, i) => (
                      <div key={i} style={{ background: filled ? '#003399' : '#fff', border: filled ? 'none' : '0.5px solid #003399' }} />
                    ))}
                  </div>
                  <div className="text-[7px] text-gray-400 font-sans tracking-wider">SCANNER</div>
                </div>
              </div>

              {/* Legal footer */}
              <div className="bg-[#003399] px-6 py-2.5">
                {l.legal.split('\n').map((line, i) => (
                  <p key={i} className="text-[8px] text-blue-200 text-center leading-relaxed font-sans">{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
