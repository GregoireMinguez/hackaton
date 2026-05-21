'use client'

import { useState } from 'react'
import { PAYS_EU } from '@/lib/eu/pays'
import { validateCP, validateCapital, getCPExemple, getCapitalMin } from '@/lib/eu/validation'
import { addLocalEntite } from '@/lib/local-store'
import { useDashboardData } from '@/hooks/useDashboardData'
import type { EntiteAvecDetails } from '@/lib/eu/types'
import { cn } from '@/lib/utils'
import { ChevronRight, ChevronLeft, Check, Download, FileCheck, Clock, AlertCircle, Building2, PlusCircle } from 'lucide-react'
import Link from 'next/link'

interface FormData {
  entite_parente_id: string
  pays: string
  forme_juridique: string
  nom_filiale: string
  capital: string
  rue: string
  cp: string
  ville: string
  dirigeant_nom: string
  dirigeant_role: string
  dirigeant_email: string
}

const STEPS = [
  { num: 1, label: 'Origine & pays' },
  { num: 2, label: 'Informations' },
  { num: 3, label: 'Dirigeants' },
  { num: 4, label: 'Statuts' },
  { num: 5, label: 'Procuration EU' },
  { num: 6, label: 'Récapitulatif' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// ─────────────────────────────────────────────────────────────────────────────
// PDF : Statuts
// ─────────────────────────────────────────────────────────────────────────────
function buildStatutsHTML(form: FormData, paysConfig: ReturnType<typeof PAYS_EU.find>, parentNom: string): string {
  const ref = `STAT-${Date.now().toString(36).toUpperCase()}`
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Statuts — ${form.nom_filiale}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Georgia,'Times New Roman',serif;font-size:12pt;line-height:1.75;color:#111827;background:#fff;max-width:780px;margin:0 auto;padding:30mm 22mm}
  .doc-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10mm;padding-bottom:4mm;border-bottom:2px solid #111827}
  .doc-header-left{font-family:Arial,sans-serif;font-size:8.5pt;color:#6B7280;text-transform:uppercase;letter-spacing:2px}
  .doc-header-right{text-align:right;font-family:Arial,sans-serif;font-size:8.5pt;color:#6B7280}
  .doc-header-right strong{display:block;color:#111827;font-size:9pt}
  .title-block{text-align:center;margin-bottom:10mm}
  .title-block h1{font-size:18pt;font-weight:700;text-transform:uppercase;letter-spacing:5px;margin-bottom:3mm}
  .title-block .form-tag{display:inline-block;background:#1E3A5F;color:#fff;font-family:Arial,sans-serif;font-size:9pt;padding:2mm 6mm;border-radius:2px;letter-spacing:2px;margin-bottom:2mm}
  .title-block .sub{font-family:Arial,sans-serif;font-size:10pt;color:#6B7280;font-style:italic}
  .info-box{background:#F9FAFB;border:1px solid #E5E7EB;border-left:4px solid #1E3A5F;padding:5mm 6mm;margin-bottom:10mm;font-family:Arial,sans-serif}
  .info-box table{width:100%;border-collapse:collapse}
  .info-box td{padding:2.5mm 3mm;font-size:10pt;vertical-align:top}
  .info-box td:first-child{font-weight:600;color:#374151;width:42%;border-right:1px solid #E5E7EB}
  .info-box td:last-child{color:#111827;padding-left:5mm}
  h2{font-family:Arial,sans-serif;font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-top:8mm;margin-bottom:3mm;padding:2mm 0;border-bottom:1px solid #D1D5DB;color:#1E3A5F}
  p{margin-bottom:4mm;text-align:justify}
  .sig-section{margin-top:18mm;display:grid;grid-template-columns:1fr 1fr;gap:15mm}
  .sig-box{border-top:2px solid #111827;padding-top:3mm}
  .sig-label{font-family:Arial,sans-serif;font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#6B7280;margin-bottom:1mm}
  .sig-name{font-size:11pt;font-weight:600;margin-bottom:1mm}
  .sig-role{font-size:10pt;color:#6B7280;font-style:italic;margin-bottom:1mm}
  .sig-space{height:18mm;border-bottom:1px solid #D1D5DB;margin-top:3mm}
  .doc-footer{margin-top:12mm;padding-top:4mm;border-top:1px solid #E5E7EB;font-family:Arial,sans-serif;font-size:8pt;color:#9CA3AF;display:flex;justify-content:space-between}
  @media print{body{padding:15mm 18mm}}
</style>
</head>
<body>
<div class="doc-header">
  <div class="doc-header-left">Acte constitutif — Document juridique</div>
  <div class="doc-header-right">
    <strong>Réf. ${ref}</strong>
    ${dateStr}<br>
    Conforme au cadre européen
  </div>
</div>

<div class="title-block">
  <div class="form-tag">${form.forme_juridique}</div>
  <h1>${form.nom_filiale}</h1>
  <div class="sub">Statuts constitutifs — ${paysConfig?.nom_fr ?? form.pays}</div>
</div>

<div class="info-box">
  <table>
    <tr><td>Dénomination sociale</td><td>${form.nom_filiale}</td></tr>
    <tr><td>Forme juridique</td><td>${form.forme_juridique}</td></tr>
    <tr><td>Capital social</td><td>${parseInt(form.capital).toLocaleString('fr')} EUR</td></tr>
    <tr><td>Siège social</td><td>${form.rue}, ${form.cp} ${form.ville}, ${paysConfig?.nom_fr}</td></tr>
    <tr><td>Société mère</td><td>${parentNom}</td></tr>
    <tr><td>Date de constitution</td><td>${dateStr}</td></tr>
  </table>
</div>

<h2>Article 1 — Forme juridique</h2>
<p>Il est constitué entre les soussignés une société sous la forme de <strong>${form.forme_juridique}</strong>, régie par la législation en vigueur en ${paysConfig?.nom_fr} et par les présents statuts. La société est également soumise au cadre européen relatif à l'exercice transfrontalier des activités commerciales au sein de l'Union Européenne.</p>

<h2>Article 2 — Dénomination sociale</h2>
<p>La société a pour dénomination sociale : <strong>${form.nom_filiale}</strong>. Dans tous les actes, factures, annonces et publications émanant de la société, la dénomination sociale doit toujours être précédée ou suivie de la forme juridique et du montant du capital.</p>

<h2>Article 3 — Objet social</h2>
<p>La société a pour objet, en ${paysConfig?.nom_fr} et dans tous pays :</p>
<p>— Le développement, l'édition et la commercialisation de logiciels, applications et services numériques ;</p>
<p>— La prestation de services informatiques, de conseil en technologie et d'ingénierie logicielle ;</p>
<p>— Et plus généralement, toutes opérations industrielles, commerciales ou financières, mobilières ou immobilières, pouvant se rattacher directement ou indirectement à l'un quelconque des objets visés ci-dessus ou susceptibles d'en faciliter l'extension ou le développement.</p>

<h2>Article 4 — Siège social</h2>
<p>Le siège social est fixé à : <strong>${form.rue}, ${form.cp} ${form.ville}, ${paysConfig?.nom_fr}</strong>.</p>
<p>Il peut être transféré en tout autre endroit du même pays par décision de la direction, et dans tout autre État membre de l'Union Européenne sous réserve des formalités légales applicables conformément au cadre européen.</p>

<h2>Article 5 — Capital social</h2>
<p>Le capital social est fixé à la somme de <strong>${parseInt(form.capital).toLocaleString('fr')} euros (${parseInt(form.capital).toLocaleString('fr')} EUR)</strong>. Il est intégralement souscrit et libéré par la société mère ${parentNom}.</p>

<h2>Article 6 — Direction et représentation</h2>
<p>La société est dirigée et représentée par <strong>${form.dirigeant_nom}</strong>, en qualité de <strong>${form.dirigeant_role}</strong>, domicilié à ${form.ville}, ${paysConfig?.nom_fr}, dont l'adresse électronique est ${form.dirigeant_email}.</p>
<p>Le dirigeant est investi des pouvoirs les plus étendus pour agir au nom de la société dans toutes circonstances. Il peut subdéléguer tout ou partie de ses pouvoirs.</p>

<h2>Article 7 — Durée</h2>
<p>La durée de la société est fixée à <strong>quatre-vingt-dix-neuf (99) ans</strong> à compter de la date de son immatriculation au registre compétent, sauf dissolution anticipée ou prorogation décidée conformément aux présents statuts.</p>

<h2>Article 8 — Exercice social</h2>
<p>L'exercice social commence le 1er janvier et se termine le 31 décembre de chaque année. Par exception, le premier exercice social commence à la date d'immatriculation de la société et se termine le 31 décembre de l'année en cours.</p>

<h2>Article 9 — Protection des données personnelles (RGPD)</h2>
<p>La société traite les données à caractère personnel conformément au Règlement (UE) 2016/679 (RGPD) et à la législation nationale applicable en ${paysConfig?.nom_fr}. Un registre des traitements est tenu à jour conformément à l'article 30 du RGPD. La société désigne, le cas échéant, un délégué à la protection des données (DPO) dont les coordonnées sont communiquées aux autorités de contrôle compétentes.</p>

<h2>Article 10 — Lutte contre le blanchiment de capitaux et le financement du terrorisme</h2>
<p>La société se conforme aux obligations imposées par la Directive (UE) 2015/849 (4e Directive anti-blanchiment) et ses textes de transposition en ${paysConfig?.nom_fr}, ainsi qu'aux exigences du Règlement (UE) 2023/1113 sur les transferts de fonds. Elle met en œuvre des procédures internes de vigilance à l'égard de la clientèle, de déclaration des opérations suspectes et de formation du personnel.</p>

<h2>Article 11 — Dissolution et liquidation</h2>
<p>La dissolution de la société peut intervenir à l'expiration de sa durée, par décision des associés ou actionnaires représentant la majorité requise par la loi applicable, ou par décision judiciaire. En cas de dissolution, la société entre en liquidation et conserve sa personnalité morale pour les besoins de celle-ci. Le liquidateur est nommé selon les modalités prévues par la législation de ${paysConfig?.nom_fr}. L'actif net subsistant après apurement du passif est attribué à la société mère ${parentNom}.</p>

<h2>Article 12 — Élection de domicile</h2>
<p>Pour l'exécution des présents statuts et pour toute notification légale ou judiciaire, la société élit domicile à son siège social : <strong>${form.rue}, ${form.cp} ${form.ville}, ${paysConfig?.nom_fr}</strong>. Toute modification du siège social fait l'objet d'une publication au registre officiel compétent dans un délai de quinze (15) jours ouvrables conformément au cadre européen.</p>

<div class="sig-section">
  <div class="sig-box">
    <div class="sig-label">Le mandant — Société mère</div>
    <div class="sig-name">${parentNom}</div>
    <div class="sig-role">Représentée par son représentant légal</div>
    <div class="sig-space"></div>
    <div style="font-size:9pt;color:#9CA3AF;margin-top:2mm">Fait à ____________, le ${dateStr}</div>
  </div>
  <div class="sig-box">
    <div class="sig-label">Le dirigeant désigné</div>
    <div class="sig-name">${form.dirigeant_nom}</div>
    <div class="sig-role">${form.dirigeant_role}</div>
    <div class="sig-space"></div>
    <div style="font-size:9pt;color:#9CA3AF;margin-top:2mm">Fait à ${form.ville}, le ${dateStr}</div>
  </div>
</div>

<div class="doc-footer">
  <span>Réf. ${ref} — ${form.nom_filiale} — Statuts constitutifs</span>
  <span>Cadre européen — Registre : ${paysConfig?.url_registre}</span>
</div>
<script>setTimeout(()=>window.print(),400)</script>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF : Procuration
// ─────────────────────────────────────────────────────────────────────────────
function buildProcurationHTML(form: FormData, paysConfig: ReturnType<typeof PAYS_EU.find>, parentNom: string): string {
  const ref = `POA-EU-${Date.now().toString(36).toUpperCase()}`
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const expiry = new Date(Date.now() + 6 * 30 * 86400000).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Procuration EU — ${form.nom_filiale}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Georgia,'Times New Roman',serif;font-size:12pt;line-height:1.75;color:#111827;background:#fff;max-width:780px;margin:0 auto;padding:30mm 22mm}
  .eu-header{background:#1E3A5F;color:#fff;padding:5mm 7mm;margin-bottom:8mm;display:flex;justify-content:space-between;align-items:center}
  .eu-header-left{font-family:Arial,sans-serif}
  .eu-header-left .tag{font-size:8pt;text-transform:uppercase;letter-spacing:2px;opacity:.8;margin-bottom:1.5mm}
  .eu-header-left .title{font-size:13pt;font-weight:700;letter-spacing:1px}
  .eu-header-right{text-align:right;font-family:Arial,sans-serif;font-size:8.5pt;opacity:.85}
  .eu-header-right .ref{font-size:10pt;font-weight:700;margin-bottom:1mm}
  .directive-badge{background:#EEF2FF;border:1px solid #C7D2FE;border-left:4px solid #4F46E5;padding:3mm 5mm;margin-bottom:8mm;font-family:Arial,sans-serif;font-size:9.5pt;color:#3730A3}
  h2{font-family:Arial,sans-serif;font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-top:7mm;margin-bottom:3mm;padding:2mm 0;border-bottom:1px solid #D1D5DB;color:#1E3A5F}
  .party-box{background:#F9FAFB;border:1px solid #E5E7EB;padding:4mm 5mm;margin-bottom:4mm;font-family:Arial,sans-serif}
  .party-box .party-label{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#6B7280;margin-bottom:2mm}
  .party-box .party-name{font-size:12pt;font-weight:700;color:#111827;margin-bottom:1mm}
  .party-box .party-detail{font-size:10pt;color:#374151;margin-bottom:0.5mm}
  p{margin-bottom:4mm;text-align:justify}
  ol{margin:0 0 4mm 6mm}
  ol li{margin-bottom:2mm;font-size:11pt}
  .powers-box{border:1px solid #E5E7EB;padding:4mm 5mm;margin-bottom:6mm}
  .sig-section{margin-top:16mm;display:grid;grid-template-columns:1fr 1fr;gap:15mm}
  .sig-box{border-top:2px solid #111827;padding-top:3mm}
  .sig-label{font-family:Arial,sans-serif;font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#6B7280;margin-bottom:1mm}
  .sig-name{font-size:11pt;font-weight:600;margin-bottom:1mm}
  .sig-role{font-size:10pt;color:#6B7280;font-style:italic;margin-bottom:1mm}
  .sig-space{height:18mm;border-bottom:1px solid #D1D5DB;margin-top:3mm}
  .doc-footer{margin-top:10mm;padding-top:4mm;border-top:1px solid #E5E7EB;font-family:Arial,sans-serif;font-size:8pt;color:#9CA3AF;display:flex;justify-content:space-between}
  @media print{body{padding:15mm 18mm}}
</style>
</head>
<body>
<div class="eu-header">
  <div class="eu-header-left">
    <div class="tag">Union Européenne — Document juridique transfrontalier</div>
    <div class="title">Procuration Numérique Européenne</div>
  </div>
  <div class="eu-header-right">
    <div class="ref">${ref}</div>
    <div>${dateStr}</div>
    <div>Cadre européen</div>
  </div>
</div>

<div class="directive-badge">
  ✓ Ce document est établi conformément au cadre européen et est reconnu sans apostille dans l'ensemble des 27 États membres de l'Union Européenne.
</div>

<h2>Mandant</h2>
<div class="party-box">
  <div class="party-label">Société mandante — Société mère</div>
  <div class="party-name">${parentNom}</div>
  <div class="party-detail">Représentée par son représentant légal dûment habilité</div>
  <div class="party-detail">ci-après désignée <strong>« le Mandant »</strong></div>
</div>

<h2>Mandataire</h2>
<div class="party-box">
  <div class="party-label">Représentant désigné</div>
  <div class="party-name">${form.dirigeant_nom}</div>
  <div class="party-detail">Qualité : <strong>${form.dirigeant_role}</strong></div>
  <div class="party-detail">Email : ${form.dirigeant_email}</div>
  <div class="party-detail">ci-après désigné <strong>« le Mandataire »</strong></div>
</div>

<h2>Objet de la procuration</h2>
<p>Le Mandant donne au Mandataire, qui accepte, tous pouvoirs nécessaires pour accomplir les actes suivants dans le cadre de la constitution et de l'immatriculation de la société <strong>${form.nom_filiale}</strong> (${form.forme_juridique}) en ${paysConfig?.nom_fr} :</p>
<div class="powers-box">
  <ol>
    <li>Représenter le Mandant auprès de toute autorité administrative, judiciaire ou commerciale en ${paysConfig?.nom_fr}, notamment auprès du registre officiel (${paysConfig?.url_registre}) ;</li>
    <li>Signer les statuts constitutifs, actes de constitution, déclarations et tous documents requis pour l'immatriculation de la société ;</li>
    <li>Déposer et retirer tout dossier d'immatriculation, répondre à toute demande complémentaire des autorités compétentes ;</li>
    <li>Ouvrir un compte bancaire professionnel au nom de la société en cours de constitution ;</li>
    <li>Accomplir toutes les formalités fiscales, sociales et administratives liées à la constitution de la société ;</li>
    <li>De manière générale, faire tout ce qui sera utile et nécessaire à la bonne exécution du présent mandat.</li>
  </ol>
</div>

<h2>Territoire et durée</h2>
<p><strong>Territoire d'exercice :</strong> ${paysConfig?.emoji ?? ''} ${paysConfig?.nom_fr} — Registre : ${paysConfig?.url_registre}</p>
<p><strong>Durée de validité :</strong> La présente procuration est valable pour une durée de <strong>six (6) mois</strong> à compter de sa date de signature, soit jusqu'au <strong>${expiry}</strong>, sauf révocation anticipée notifiée par écrit au Mandataire.</p>
<p><strong>Validité transfrontalière :</strong> Conformément au cadre européen, la présente procuration électronique est reconnue de plein droit dans l'ensemble des États membres de l'Union Européenne sans nécessité d'apostille ni de légalisation.</p>

<div class="sig-section">
  <div class="sig-box">
    <div class="sig-label">Le Mandant</div>
    <div class="sig-name">${parentNom}</div>
    <div class="sig-role">Société mère — Représentant légal</div>
    <div class="sig-space"></div>
    <div style="font-size:9pt;color:#9CA3AF;margin-top:2mm">Fait à ____________, le ${dateStr}</div>
  </div>
  <div class="sig-box">
    <div class="sig-label">Le Mandataire</div>
    <div class="sig-name">${form.dirigeant_nom}</div>
    <div class="sig-role">${form.dirigeant_role}</div>
    <div class="sig-space"></div>
    <div style="font-size:9pt;color:#9CA3AF;margin-top:2mm">Fait à ${form.ville}, le ${dateStr}</div>
  </div>
</div>

<div class="doc-footer">
  <span>Réf. ${ref} — Procuration Numérique EU — ${form.nom_filiale}</span>
  <span>Cadre européen, Art. 8 — Valide sans apostille dans l'UE</span>
</div>
<script>setTimeout(()=>window.print(),400)</script>
</body>
</html>`
}

function openDoc(html: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 8000)
}

// ─────────────────────────────────────────────────────────────────────────────
// Wizard
// ─────────────────────────────────────────────────────────────────────────────
export default function WizardFiliale() {
  const { data, loading } = useDashboardData()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [signed, setSigned] = useState<boolean | null>(null)
  const [form, setForm] = useState<FormData>({
    entite_parente_id: '', pays: '', forme_juridique: '', nom_filiale: '',
    capital: '', rue: '', cp: '', ville: '',
    dirigeant_nom: '', dirigeant_role: '', dirigeant_email: '',
  })

  const allEntites = data?.entites ?? []
  const parentEntite = allEntites.find(e => e.id === form.entite_parente_id)
  const parentNom = parentEntite?.nom_legal ?? ''
  const paysConfig = PAYS_EU.find(p => p.code === form.pays)
  const formeConfig = paysConfig?.formes_juridiques.find(f => f.code === form.forme_juridique)
  const capitalMin = getCapitalMin(form.pays, form.forme_juridique)
  const cpExemple = getCPExemple(form.pays)

  const set = (k: keyof FormData, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n })
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateStep = (): Record<string, string> => {
    const e: Record<string, string> = {}
    if (step === 1) {
      if (!form.entite_parente_id) e.entite_parente_id = 'Sélectionnez la société mère'
      if (!form.pays) e.pays = 'Sélectionnez un pays'
      if (!form.forme_juridique) e.forme_juridique = 'Sélectionnez une forme juridique'
    }
    if (step === 2) {
      if (!form.nom_filiale.trim()) e.nom_filiale = 'Nom légal requis'
      const capErr = validateCapital(form.capital, form.pays, form.forme_juridique)
      if (capErr) e.capital = capErr
      if (!form.rue.trim() || form.rue.trim().length < 5) e.rue = 'Adresse requise (min. 5 caractères)'
      if (!form.cp.trim()) e.cp = 'Code postal requis'
      else { const cpErr = validateCP(form.pays, form.cp); if (cpErr) e.cp = cpErr }
      if (!form.ville.trim() || form.ville.trim().length < 2) e.ville = 'Ville requise'
    }
    if (step === 3) {
      if (!form.dirigeant_nom.trim()) e.dirigeant_nom = 'Nom complet requis'
      if (!form.dirigeant_role) e.dirigeant_role = 'Rôle requis'
      if (!form.dirigeant_email.trim()) e.dirigeant_email = 'Email requis'
      else if (!EMAIL_RE.test(form.dirigeant_email.trim())) e.dirigeant_email = 'Adresse email invalide'
    }
    return e
  }

  const canNext = () => {
    if (step === 1) return !!(form.entite_parente_id && form.pays && form.forme_juridique)
    if (step === 2) {
      if (!form.nom_filiale.trim() || !form.rue.trim() || !form.cp.trim() || !form.ville.trim()) return false
      const val = Number(form.capital)
      if (!form.capital || isNaN(val) || val < 0) return false
      if (formeConfig && val < formeConfig.capital_min) return false
      if (validateCP(form.pays, form.cp)) return false
      return true
    }
    if (step === 3) return !!(form.dirigeant_nom.trim() && form.dirigeant_role && form.dirigeant_email.trim() && EMAIL_RE.test(form.dirigeant_email.trim()))
    return true
  }

  const handleNext = () => {
    const errs = validateStep()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStep(s => s + 1)
  }

  const handleSign = () => { setSigned(true); setStep(6) }
  const handleSkipSign = () => { setSigned(false); setStep(6) }

  const handleFinish = async () => {
    setSaving(true)
    const entiteId = `ent-local-${Date.now()}`
    const now = new Date().toISOString()
    const entite: EntiteAvecDetails = {
      id: entiteId,
      organisation_id: 'org-1',
      entite_parente_id: form.entite_parente_id,
      nom_legal: form.nom_filiale.trim(),
      forme_juridique: form.forme_juridique,
      pays: form.pays,
      capital_social: Number(form.capital),
      devise: 'EUR',
      siege_social: { rue: form.rue.trim(), cp: form.cp.trim(), ville: form.ville.trim(), pays: paysConfig?.nom_fr ?? form.pays },
      statut: 'en_creation',
      created_at: now,
      updated_at: now,
      obligations: [],
      representants: [{
        id: `rep-local-${Date.now()}`,
        entite_id: entiteId,
        nom_complet: form.dirigeant_nom.trim(),
        email: form.dirigeant_email.trim(),
        role: form.dirigeant_role,
        date_debut: now.split('T')[0],
        created_at: now,
      }],
      documents: [],
      associes: [],
    }
    addLocalEntite(entite)
    await new Promise(r => setTimeout(r, 600))
    window.location.href = '/entites'
  }

  // ── Pas d'entités disponibles ───────────────────────────────────────────────
  if (!loading && allEntites.length === 0) {
    return (
      <div className="max-w-2xl bg-white rounded-xl border border-gray-100 p-10 text-center">
        <Building2 size={40} className="mx-auto mb-4 text-gray-300" />
        <h3 className="font-semibold text-gray-900 mb-2">Aucune entité mère disponible</h3>
        <p className="text-sm text-gray-500 mb-5">Vous devez d'abord créer une entité légale avant de pouvoir y rattacher une filiale.</p>
        <Link href="/entites/nouvelle" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
          <PlusCircle size={16} />
          Créer une entité mère
        </Link>
      </div>
    )
  }

  // ── Rendu principal ─────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl">
      {/* Barre de progression */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors',
                  step > s.num ? 'bg-green-500 text-white' :
                  step === s.num ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400',
                )}>
                  {step > s.num ? <Check size={14} /> : s.num}
                </div>
                <div className={cn('text-[10px] font-semibold mt-1 hidden sm:block whitespace-nowrap', step >= s.num ? 'text-gray-700' : 'text-gray-400')}>
                  {s.label}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-px mx-1 mb-4', step > s.num ? 'bg-green-300' : 'bg-gray-100')} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">

        {/* ── Étape 1 ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-0.5">Origine et destination</h3>
              <p className="text-sm text-gray-500">Définissez la société mère, le pays cible et la forme juridique</p>
            </div>

            {/* Société mère */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Société mère *</label>
              {loading ? (
                <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : (
                <div className="space-y-2">
                  {allEntites.map(e => {
                    const pays = PAYS_EU.find(p => p.code === e.pays)
                    return (
                      <button
                        key={e.id}
                        onClick={() => set('entite_parente_id', e.id)}
                        className={cn(
                          'w-full text-left px-4 py-3 rounded-xl border transition-colors flex items-center justify-between',
                          form.entite_parente_id === e.id
                            ? 'border-indigo-400 bg-indigo-50'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50',
                        )}
                      >
                        <div>
                          <span className="font-semibold text-sm text-gray-900">{e.nom_legal}</span>
                          <span className="ml-2 text-xs text-gray-500">{e.forme_juridique}</span>
                        </div>
                        <span className="text-lg">{pays?.emoji}</span>
                      </button>
                    )
                  })}
                </div>
              )}
              {errors.entite_parente_id && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.entite_parente_id}</p>}
            </div>

            {/* Pays cible */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Pays de la filiale *</label>
              <div className="grid grid-cols-4 gap-2">
                {PAYS_EU.slice(0, 8).map(p => (
                  <button
                    key={p.code}
                    onClick={() => { set('pays', p.code); set('forme_juridique', '') }}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors',
                      form.pays === p.code ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50',
                    )}
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="text-[11px] font-medium text-gray-700">{p.nom_fr}</span>
                  </button>
                ))}
              </div>
              {errors.pays && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.pays}</p>}
            </div>

            {/* Forme juridique */}
            {form.pays && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Forme juridique *</label>
                <div className="space-y-2">
                  {paysConfig?.formes_juridiques.map(f => (
                    <button
                      key={f.code}
                      onClick={() => set('forme_juridique', f.code)}
                      className={cn(
                        'w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors',
                        form.forme_juridique === f.code ? 'border-indigo-400 bg-indigo-50 text-indigo-800' : 'border-gray-100 hover:border-gray-200',
                      )}
                    >
                      <span className="font-semibold">{f.code}</span>
                      <span className="text-gray-500 ml-2 text-xs">{f.nom.split('–')[1]?.trim() ?? f.nom}</span>
                      {f.capital_min > 0 && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          Min. {f.capital_min.toLocaleString('fr')} €
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {errors.forme_juridique && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.forme_juridique}</p>}
              </div>
            )}
          </div>
        )}

        {/* ── Étape 2 ── */}
        {step === 2 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-0.5">Informations de la filiale</h3>
            <p className="text-sm text-gray-500 mb-5">
              Filiale de <strong>{parentNom}</strong> — {form.forme_juridique} en {paysConfig?.emoji} {paysConfig?.nom_fr}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nom légal *</label>
                <input type="text" value={form.nom_filiale} onChange={e => set('nom_filiale', e.target.value)}
                  placeholder={`Ex: Lumia Technologies ${form.forme_juridique}`}
                  className={cn('w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500', errors.nom_filiale ? 'border-red-400 bg-red-50' : 'border-gray-200')} />
                {errors.nom_filiale && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.nom_filiale}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Capital social (EUR) * — minimum {capitalMin.toLocaleString('fr')} € pour une {form.forme_juridique}
                </label>
                <input type="number" value={form.capital} onChange={e => set('capital', e.target.value)}
                  min={0} step="1" placeholder={`${capitalMin.toLocaleString('fr')}`}
                  className={cn('w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500', errors.capital ? 'border-red-400 bg-red-50' : 'border-gray-200')} />
                {errors.capital && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.capital}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Adresse du siège social *</label>
                <input type="text" value={form.rue} onChange={e => set('rue', e.target.value)}
                  placeholder="Ex: 15 Torstraße"
                  className={cn('w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2', errors.rue ? 'border-red-400 bg-red-50' : 'border-gray-200')} />
                {errors.rue && <p className="mb-2 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.rue}</p>}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input type="text" value={form.cp} onChange={e => set('cp', e.target.value)}
                      placeholder={cpExemple || 'Code postal'}
                      className={cn('w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500', errors.cp ? 'border-red-400 bg-red-50' : 'border-gray-200')} />
                    {errors.cp && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.cp}</p>}
                  </div>
                  <div className="col-span-2">
                    <input type="text" value={form.ville} onChange={e => set('ville', e.target.value)}
                      placeholder="Ville"
                      className={cn('w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500', errors.ville ? 'border-red-400 bg-red-50' : 'border-gray-200')} />
                    {errors.ville && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.ville}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Étape 3 ── */}
        {step === 3 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-0.5">Représentant légal</h3>
            <p className="text-sm text-gray-500 mb-5">Désignez le {form.forme_juridique === 'GmbH' ? 'Geschäftsführer' : 'dirigeant'} de la filiale</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nom complet *</label>
                <input type="text" value={form.dirigeant_nom} onChange={e => set('dirigeant_nom', e.target.value)}
                  placeholder="Sarah Chen"
                  className={cn('w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500', errors.dirigeant_nom ? 'border-red-400 bg-red-50' : 'border-gray-200')} />
                {errors.dirigeant_nom && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.dirigeant_nom}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Rôle *</label>
                <select value={form.dirigeant_role} onChange={e => set('dirigeant_role', e.target.value)}
                  className={cn('w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white', errors.dirigeant_role ? 'border-red-400 bg-red-50' : 'border-gray-200')}>
                  <option value="">Sélectionner un rôle...</option>
                  {form.forme_juridique === 'GmbH' && <><option>Geschäftsführer</option><option>Prokurist</option></>}
                  {form.forme_juridique === 'BV' && <><option>Directeur</option><option>Bestuurder</option></>}
                  {(form.forme_juridique === 'SAS' || form.forme_juridique === 'SARL') && <><option>Président</option><option>Directeur Général</option><option>Gérant</option></>}
                  {form.forme_juridique === 'SRL' && <><option>Gérant</option><option>Administrateur</option></>}
                  {form.forme_juridique === 'Ltd' && <><option>Director</option><option>Company Secretary</option></>}
                  {form.forme_juridique === 'SA' && <><option>Président du Conseil d'Administration</option><option>Directeur Général</option></>}
                  <option>Managing Director</option>
                  <option>Director</option>
                  <option>Administrateur</option>
                </select>
                {errors.dirigeant_role && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.dirigeant_role}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Adresse email *</label>
                <input type="email" value={form.dirigeant_email} onChange={e => set('dirigeant_email', e.target.value)}
                  placeholder="dirigeant@startup.eu"
                  className={cn('w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500', errors.dirigeant_email ? 'border-red-400 bg-red-50' : 'border-gray-200')} />
                {errors.dirigeant_email && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.dirigeant_email}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── Étape 4 : Statuts ── */}
        {step === 4 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-0.5">Statuts générés automatiquement</h3>
            <p className="text-sm text-gray-500 mb-4">Conformes à la législation {paysConfig?.nom_fr} — Cadre européen</p>
            <div className="bg-gray-50 rounded-xl p-4 font-mono text-xs text-gray-700 leading-relaxed max-h-64 overflow-y-auto border border-gray-100">
              <p className="font-bold mb-1.5 text-gray-900 font-sans not-italic">STATUTS DE {form.nom_filiale.toUpperCase()}</p>
              <p className="mb-0.5">Forme : {form.forme_juridique} — Capital : {parseInt(form.capital).toLocaleString('fr')} EUR</p>
              <p className="mb-2">Siège : {form.rue}, {form.cp} {form.ville}, {paysConfig?.nom_fr}</p>
              <p className="font-bold mb-0.5">ART. 1 — FORME</p>
              <p className="mb-2 text-gray-500">Société constituée sous forme de {form.forme_juridique}, régie par la législation de {paysConfig?.nom_fr} et le cadre européen.</p>
              <p className="font-bold mb-0.5">ART. 2 — DÉNOMINATION</p>
              <p className="mb-2 text-gray-500">{form.nom_filiale}</p>
              <p className="font-bold mb-0.5">ART. 3 — OBJET</p>
              <p className="mb-2 text-gray-500">Développement, édition et commercialisation de logiciels et services numériques...</p>
              <p className="font-bold mb-0.5">ART. 4 — SIÈGE</p>
              <p className="mb-2 text-gray-500">{form.rue}, {form.cp} {form.ville}, {paysConfig?.nom_fr}</p>
              <p className="font-bold mb-0.5">ART. 5 — CAPITAL</p>
              <p className="mb-2 text-gray-500">{parseInt(form.capital).toLocaleString('fr')} EUR — intégralement souscrit par {parentNom}</p>
              <p className="font-bold mb-0.5">ART. 6 — DIRECTION</p>
              <p className="text-gray-500">{form.dirigeant_nom} — {form.dirigeant_role}</p>
            </div>
            <button
              onClick={() => openDoc(buildStatutsHTML(form, paysConfig, parentNom))}
              className="mt-3 flex items-center gap-1.5 text-xs text-indigo-600 border border-indigo-200 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
            >
              <Download size={13} />
              Télécharger les statuts (PDF)
            </button>
          </div>
        )}

        {/* ── Étape 5 : Procuration EU ── */}
        {step === 5 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-0.5">Procuration numérique EU</h3>
            <p className="text-sm text-gray-500 mb-4">Cadre européen — Art. 8 — Sans apostille requise</p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="text-xs font-bold text-blue-800 mb-2 uppercase tracking-wider">EU Digital Power of Attorney</div>
              <div className="text-xs text-blue-800 space-y-1.5">
                <div className="flex gap-2"><span className="font-semibold min-w-24">Mandant :</span><span>{parentNom}</span></div>
                <div className="flex gap-2"><span className="font-semibold min-w-24">Mandataire :</span><span>{form.dirigeant_nom} ({form.dirigeant_role})</span></div>
                <div className="flex gap-2"><span className="font-semibold min-w-24">Email :</span><span>{form.dirigeant_email}</span></div>
                <div className="flex gap-2"><span className="font-semibold min-w-24">Pays :</span><span>{paysConfig?.emoji} {paysConfig?.nom_fr}</span></div>
                <div className="flex gap-2"><span className="font-semibold min-w-24">Validité :</span><span>6 mois à compter de la signature</span></div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-4">
              <p className="text-xs text-indigo-700">
                <strong>Art. 8 Cadre européen :</strong> Valide sans apostille dans les 27 États membres de l'UE.
              </p>
            </div>

            <button
              onClick={() => openDoc(buildProcurationHTML(form, paysConfig, parentNom))}
              className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors mb-4 font-medium"
            >
              <Download size={13} />
              Télécharger la procuration (PDF)
            </button>

            {signed === true && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
                <FileCheck size={16} className="text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700 font-semibold">Procuration signée électroniquement</p>
              </div>
            )}
            {signed === false && (
              <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3">
                <Clock size={16} className="text-yellow-600 flex-shrink-0" />
                <p className="text-xs text-yellow-700">Procuration non signée — à compléter avant soumission au registre</p>
              </div>
            )}

            {signed === null ? (
              <div className="flex gap-2">
                <button onClick={handleSign}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  <FileCheck size={14} />Signer électroniquement
                </button>
                <button onClick={handleSkipSign}
                  className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Plus tard
                </button>
              </div>
            ) : (
              <button onClick={() => setStep(6)}
                className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
                Continuer vers le récapitulatif <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}

        {/* ── Étape 6 : Récapitulatif ── */}
        {step === 6 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-0.5">Récapitulatif</h3>
            <p className="text-sm text-gray-500 mb-5">Vérifiez les informations avant la création définitive</p>

            <div className="space-y-1 mb-5">
              {[
                ['Société mère', parentNom],
                ['Entité', `${form.nom_filiale} (${form.forme_juridique})`],
                ['Pays', `${paysConfig?.emoji} ${paysConfig?.nom_fr}`],
                ['Capital', `${parseInt(form.capital).toLocaleString('fr')} EUR`],
                ['Siège', `${form.rue}, ${form.cp} ${form.ville}`],
                ['Dirigeant', `${form.dirigeant_nom} — ${form.dirigeant_role}`],
                ['Email', form.dirigeant_email],
                ['Procuration', signed === true ? '✓ Signée électroniquement' : '⏳ À signer (plus tard)'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-xs text-gray-500 min-w-28">{label}</span>
                  <span className="text-xs font-medium text-gray-900 text-right">{value}</span>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs font-semibold text-gray-600 mb-2">Prochaines étapes</div>
              <ol className="space-y-1">
                {[
                  `Soumettre au registre : ${paysConfig?.url_registre}`,
                  'Ouvrir un compte bancaire professionnel',
                  'S\'immatriculer auprès des autorités fiscales locales',
                  'Générer le certificat EU',
                ].map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="font-bold text-gray-400 flex-shrink-0 w-4">{i + 1}.</span>{s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => step > 1 ? setStep(s => s - 1) : (window.location.href = '/filiales')}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={14} />
          {step === 1 ? 'Annuler' : 'Précédent'}
        </button>

        {step < 5 && (
          <button onClick={handleNext} disabled={!canNext()}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Suivant <ChevronRight size={14} />
          </button>
        )}

        {step === 6 && (
          <button onClick={handleFinish} disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60">
            {saving ? 'Création en cours...' : <><Check size={14} />Créer la filiale</>}
          </button>
        )}
      </div>
    </div>
  )
}
