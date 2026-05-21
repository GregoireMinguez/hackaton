'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { MACF_MOCK } from '@/lib/macf/mock-data'
import { cn } from '@/lib/utils'
import { Download, CheckCircle, Clock, AlertCircle, FileCheck, X, Send } from 'lucide-react'

const STATUT_DEC: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  verifie: { label: 'Vérifié', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  calcule: { label: 'Calculé', color: 'bg-blue-100 text-blue-700', icon: Clock },
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
}

const ETAPES = [
  { num: 1, label: 'Données douanières importées', done: true, sub: 'Via DELT@ — 4 codes NC' },
  { num: 2, label: 'Données fournisseurs collectées', done: false, sub: '3/4 validés · 1 en attente (Gujarat)' },
  { num: 3, label: 'Émissions calculées', done: true, sub: 'Lignes verifie + calcule' },
  { num: 4, label: 'Vérificateur accrédité assigné', done: false, sub: 'SGS France — à confirmer' },
  { num: 5, label: 'Déclaration prête à déposer', done: false, sub: 'Échéance 30 sept. 2027' },
]

function xmlEscape(value: string | number) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white border border-green-200 rounded-2xl shadow-xl p-4 flex items-center gap-3 max-w-sm">
      <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <CheckCircle size={16} className="text-green-600" />
      </div>
      <span className="text-sm font-medium text-gray-900 flex-1">{msg}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
    </div>
  )
}

export default function DeclarationPage() {
  const data = MACF_MOCK
  const prix = data.prix_ets_actuel
  const lignes = data.lignes_declaration

  const co2Total = lignes.reduce((s, l) => s + l.co2_incorpore, 0)
  const certNetsTotal = lignes.reduce((s, l) => s + l.certificats_nets, 0)
  const valeurTotale = lignes.reduce((s, l) => s + l.valeur_eur, 0)
  const lignesToutes = lignes.length
  const lignesVerifiees = lignes.filter(l => l.statut === 'verifie').length

  const [toast, setToast] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 5000)
  }

  const handleExportXML = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CBAMDeclarationDraft xmlns="urn:eu:cbam:annual-declaration:draft" schemaVersion="article-6-mapping-2026">
  <legalBasis>
    <regulation>Regulation (EU) 2023/956 as amended by Regulation (EU) 2025/2083</regulation>
    <reportingYear>2026</reportingYear>
    <submissionDeadline>2027-09-30</submissionDeadline>
    <surrenderDeadline>2027-09-30</surrenderDeadline>
  </legalBasis>
  <declarant>
    <name>Lumia Technologies</name>
    <role>Authorised CBAM declarant</role>
    <authorisationReference>CBAM-AUTH-TO-BE-COMPLETED</authorisationReference>
    <establishmentMemberState>FR</establishmentMemberState>
  </declarant>
  <summary>
    <totalQuantity unit="tonne">${lignes.reduce((s, l) => s + l.quantite_tonnes, 0)}</totalQuantity>
    <totalEmbeddedEmissions unit="tCO2e">${co2Total}</totalEmbeddedEmissions>
    <carbonPricePaidDeduction unit="tCO2e">${co2Total - certNetsTotal}</carbonPricePaidDeduction>
    <freeAllocationAdjustment unit="tCO2e">0</freeAllocationAdjustment>
    <cbamCertificatesToSurrender>${certNetsTotal}</cbamCertificatesToSurrender>
    <referenceCertificatePrice currency="EUR" unit="tCO2e">${prix}</referenceCertificatePrice>
    <estimatedFinancialLiability currency="EUR">${valeurTotale}</estimatedFinancialLiability>
  </summary>
  <goods>
${lignes.map(l => `    <goodsItem id="${xmlEscape(l.id)}">
      <cnCode>${xmlEscape(l.code_nc)}</cnCode>
      <description>${xmlEscape(l.produit)}</description>
      <countryOfOrigin>${l.pays_emoji}</countryOfOrigin>
      <quantity unit="tonne">${l.quantite_tonnes}</quantity>
      <installation>
        <operatorName>${xmlEscape(l.fournisseur_nom)}</operatorName>
        <operatorReference>${xmlEscape(l.fournisseur_id)}</operatorReference>
      </installation>
      <embeddedEmissions>
        <specificEmissionFactor unit="tCO2e/tonne">${l.facteur_emission}</specificEmissionFactor>
        <total unit="tCO2e">${l.co2_incorpore}</total>
        <method>${l.statut === 'en_attente' ? 'EU default value pending supplier data' : 'Supplier data / Article 7 methodology'}</method>
      </embeddedEmissions>
      <carbonPricePaidInCountryOfOrigin currency="EUR" unit="tCO2e">${l.prix_carbone_origine}</carbonPricePaidInCountryOfOrigin>
      <certificatesToSurrender>${l.certificats_nets}</certificatesToSurrender>
      <verificationStatus>${xmlEscape(l.statut)}</verificationStatus>
    </goodsItem>`).join('\n')}
  </goods>
  <verification>
    <required>true</required>
    <verifierAccreditationStatus>to_be_confirmed</verifierAccreditationStatus>
    <supportingDocuments>customs_declarations,supplier_emissions_data,calculation_workbook,carbon_price_paid_evidence</supportingDocuments>
  </verification>
</CBAMDeclarationDraft>`
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'declaration_macf_2026.xml'; a.click()
    URL.revokeObjectURL(url)
    showToast('Projet XML conforme aux champs Article 6 exporté')
  }

  const handleSoumettre = () => {
    setSubmitted(true)
    showToast('Pré-dépôt enregistré — dépôt officiel à faire dans le registre MACF avant le 30/09/2027')
  }

  const handleDossierVerificateur = () => {
    const content = `DOSSIER VERIFICATEUR MACF 2026
Lumia Technologies

Base juridique : Reglement (UE) 2023/956 modifie par le Reglement (UE) 2025/2083
Echeance premiere declaration et restitution : 30 septembre 2027
Prix officiel disponible a date : T1 2026 = ${prix.toFixed(2)} EUR/tCO2e

Synthese Article 6 :
- Quantite totale importee : ${lignes.reduce((s, l) => s + l.quantite_tonnes, 0).toLocaleString('fr')} tonnes
- Emissions incorporees totales : ${co2Total.toLocaleString('fr')} tCO2e
- Deduction prix carbone pays d'origine : ${(co2Total - certNetsTotal).toLocaleString('fr')} tCO2e
- Ajustement quotas gratuits ETS : 0 tCO2e
- Certificats MACF a restituer : ${certNetsTotal.toLocaleString('fr')}
- Responsabilite financiere estimee : ${valeurTotale.toLocaleString('fr')} EUR

Pieces a fournir au verificateur accredite :
- Declarations douanieres et codes NC
- Donnees d'emissions par installation/fournisseur
- Methode de calcul et facteurs d'emission utilises
- Preuves du prix carbone paye dans le pays d'origine, le cas echeant
- Justificatifs de quantites importees et factures

Lignes de declaration :
${lignes.map(l => `- ${l.code_nc} | ${l.fournisseur_nom} | ${l.quantite_tonnes} t | ${l.co2_incorpore} tCO2e | ${l.certificats_nets} certificats | statut ${l.statut}`).join('\n')}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'dossier_verificateur_macf_2026.txt'; a.click()
    URL.revokeObjectURL(url)
    showToast('Dossier vérificateur téléchargé')
  }

  return (
    <div>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      <Header
        title="Déclaration annuelle MACF 2026"
        subtitle="Préparation de la déclaration et restitution — Échéance 30 septembre 2027"
        action={
          <div className="flex gap-2">
            <button
              onClick={handleExportXML}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-gray-50 active:scale-95 transition-all"
            >
              <Download size={13} /> Export XML
            </button>
            <button
              onClick={handleSoumettre}
              disabled={submitted}
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-60 active:scale-95 transition-all"
            >
              {submitted ? <><CheckCircle size={13} /> Pré-dépôt</> : <><Send size={13} /> Préparer le dépôt</>}
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-5">

        {/* Statut avancement */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Avancement de la déclaration</div>
          <div className="flex items-center">
            {ETAPES.map((e, i) => (
              <div key={e.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center min-w-0">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                    e.done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400',
                  )}>
                    {e.done ? <CheckCircle size={14} /> : e.num}
                  </div>
                  <div className="text-[10px] font-semibold mt-1 text-center max-w-20 hidden sm:block leading-tight">
                    <span className={e.done ? 'text-green-700' : 'text-gray-400'}>{e.label}</span>
                  </div>
                  <div className="text-[9px] text-gray-400 text-center max-w-20 hidden sm:block leading-tight mt-0.5">{e.sub}</div>
                </div>
                {i < ETAPES.length - 1 && (
                  <div className={cn('flex-1 h-px mx-2 mb-8', e.done ? 'bg-green-300' : 'bg-gray-100')} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Lignes d\'importation', value: `${lignesToutes}`, sub: `${lignesVerifiees} vérifiées par auditeur` },
            { label: 'CO₂ incorporé total', value: `${co2Total.toLocaleString('fr')} t`, sub: 'Émissions directes + indirectes' },
            { label: 'Certificats nets requis', value: `${certNetsTotal.toLocaleString('fr')}`, sub: 'Après déduction prix carbone origine' },
            { label: 'Montant total estimé', value: `${(valeurTotale / 1e6).toFixed(2)} M€`, sub: `prix officiel T1 2026 : ${prix} €/t` },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="text-xs text-gray-400 mb-1">{k.label}</div>
              <div className="text-xl font-bold text-gray-900">{k.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Table déclaration */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">Lignes de déclaration — Importations 2026</div>
            <button
              onClick={handleDossierVerificateur}
              className="flex items-center gap-1 text-xs font-semibold text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
            >
              <Download size={11} /> Dossier vérificateur
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-[10px] text-gray-400 font-semibold uppercase px-5 py-3">Fournisseur</th>
                  <th className="text-center text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">Code NC</th>
                  <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">Quantité (t)</th>
                  <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">Fact. émission</th>
                  <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">CO₂ incorporé</th>
                  <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">Déduction origine</th>
                  <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">Certificats nets</th>
                  <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">Valeur (€)</th>
                  <th className="text-center text-[10px] text-gray-400 font-semibold uppercase px-3 py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map(l => {
                  const cfg = STATUT_DEC[l.statut] ?? STATUT_DEC.calcule
                  const Icon = cfg.icon
                  const deduction = l.co2_incorpore - l.certificats_nets
                  return (
                    <tr key={l.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span>{l.pays_emoji}</span>
                          <div>
                            <div className="text-xs font-medium text-gray-900">{l.fournisseur_nom}</div>
                            <div className="text-[10px] text-gray-400">{l.produit}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center px-3 py-3 text-xs font-mono text-gray-600">{l.code_nc}</td>
                      <td className="text-right px-3 py-3 text-sm font-medium text-gray-900">{l.quantite_tonnes.toLocaleString('fr')}</td>
                      <td className="text-right px-3 py-3 text-sm text-gray-700">{l.facteur_emission}</td>
                      <td className="text-right px-3 py-3 text-sm text-gray-900">{l.co2_incorpore.toLocaleString('fr')}</td>
                      <td className="text-right px-3 py-3 text-sm">
                        {deduction > 0
                          ? <span className="text-green-600 font-medium">−{deduction.toLocaleString('fr')}</span>
                          : <span className="text-gray-400">—</span>
                        }
                      </td>
                      <td className="text-right px-3 py-3 text-sm font-bold text-gray-900">{l.certificats_nets.toLocaleString('fr')}</td>
                      <td className="text-right px-3 py-3 text-sm font-semibold text-gray-900">{l.valeur_eur.toLocaleString('fr')}</td>
                      <td className="text-center px-3 py-3">
                        <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full', cfg.color)}>
                          <Icon size={9} />{cfg.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                <tr className="bg-indigo-50 font-bold">
                  <td className="px-5 py-3 text-xs font-bold text-indigo-800" colSpan={4}>TOTAL DÉCLARATION 2026</td>
                  <td className="text-right px-3 py-3 text-sm font-bold text-indigo-800">{co2Total.toLocaleString('fr')} t</td>
                  <td className="text-right px-3 py-3 text-sm font-bold text-green-700">
                    −{(co2Total - certNetsTotal).toLocaleString('fr')}
                  </td>
                  <td className="text-right px-3 py-3 text-sm font-bold text-indigo-800">{certNetsTotal.toLocaleString('fr')}</td>
                  <td className="text-right px-3 py-3 text-sm font-bold text-indigo-800">{valeurTotale.toLocaleString('fr')} €</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Info conformité */}
        <div className="bg-eu-dark rounded-xl p-5 text-white">
          <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Sanctions en cas de non-conformité</div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-lg font-bold text-red-400">10 – 50 €</div>
              <div className="text-xs text-slate-400 mt-0.5">par tonne non déclarée ou certificat manquant</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-400">Blocage des imports</div>
              <div className="text-xs text-slate-400 mt-0.5">Retrait du statut "Déclarant MACF autorisé"</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-400">~{(certNetsTotal * 50 / 1000).toFixed(0)} k€</div>
              <div className="text-xs text-slate-400 mt-0.5">Pénalité maximale potentielle sur cette déclaration</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
