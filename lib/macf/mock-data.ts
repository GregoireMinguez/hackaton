import type { MACFData } from './types'

export const MACF_MOCK: MACFData = {
  prix_ets_actuel: 75.36,
  stock_certificats: 0,
  annee_declaration: 2026,

  prix_ets_historique: [
    { semaine: 'T1 2026', prix: 75.36 },
    { semaine: 'T2 2026', prix: 0 },
    { semaine: 'T3 2026', prix: 0 },
    { semaine: 'T4 2026', prix: 0 },
  ],

  fournisseurs: [
    {
      id: 'f-01',
      nom: 'Wuhan Iron & Steel Trading Co.',
      pays_code: 'CN',
      pays_nom: 'Chine',
      pays_emoji: '🇨🇳',
      secteur: 'acier',
      code_nc: '7208 37 00',
      tonnes_annuelles: 6000,
      facteur_reel: 1.42,
      facteur_defaut: 1.85,
      statut: 'valide',
      contact_email: 'compliance@wuhan-steel.cn',
      derniere_relance: '2026-03-15',
    },
    {
      id: 'f-02',
      nom: 'Istanbul Aluminium A.Ş.',
      pays_code: 'TR',
      pays_nom: 'Turquie',
      pays_emoji: '🇹🇷',
      secteur: 'aluminium',
      code_nc: '7601 10 00',
      tonnes_annuelles: 1800,
      facteur_reel: 8.60,
      facteur_defaut: 11.20,
      statut: 'valide',
      contact_email: 'export@istanbul-alu.com.tr',
      derniere_relance: '2026-02-28',
    },
    {
      id: 'f-03',
      nom: 'Tata Steel India — Jamshedpur',
      pays_code: 'IN',
      pays_nom: 'Inde',
      pays_emoji: '🇮🇳',
      secteur: 'acier',
      code_nc: '7209 16 90',
      tonnes_annuelles: 3500,
      facteur_reel: 1.65,
      facteur_defaut: 1.85,
      statut: 'valide',
      contact_email: 'cbam@tata-steel.in',
      derniere_relance: '2026-04-01',
    },
    {
      id: 'f-04',
      nom: 'Gujarat State Fertilisers Corp.',
      pays_code: 'IN',
      pays_nom: 'Inde',
      pays_emoji: '🇮🇳',
      secteur: 'engrais',
      code_nc: '3102 10 10',
      tonnes_annuelles: 800,
      facteur_defaut: 2.10,
      statut: 'en_collecte',
      contact_email: 'export@gsfc.in',
      derniere_relance: '2026-04-18',
    },
    {
      id: 'f-05',
      nom: 'Aliağa Çelik Endüstri',
      pays_code: 'TR',
      pays_nom: 'Turquie',
      pays_emoji: '🇹🇷',
      secteur: 'acier',
      code_nc: '7208 51 00',
      tonnes_annuelles: 2200,
      facteur_defaut: 1.85,
      statut: 'a_contacter',
      contact_email: 'info@aliaga-celik.com.tr',
    },
  ],

  achats_certificats: [],

  lignes_declaration: [
    {
      id: 'ld-1',
      fournisseur_id: 'f-01',
      fournisseur_nom: 'Wuhan Iron & Steel Trading Co.',
      pays_emoji: '🇨🇳',
      code_nc: '7208 37 00',
      produit: 'Acier laminé à chaud',
      quantite_tonnes: 6000,
      facteur_emission: 1.42,
      co2_incorpore: 8520,
      prix_carbone_origine: 0,
      certificats_nets: 8520,
      valeur_eur: 708312,
      statut: 'verifie',
    },
    {
      id: 'ld-2',
      fournisseur_id: 'f-02',
      fournisseur_nom: 'Istanbul Aluminium A.Ş.',
      pays_emoji: '🇹🇷',
      code_nc: '7601 10 00',
      produit: 'Aluminium primaire',
      quantite_tonnes: 1800,
      facteur_emission: 8.60,
      co2_incorpore: 15480,
      prix_carbone_origine: 12.50,
      certificats_nets: 14255,
      valeur_eur: 1184590,
      statut: 'verifie',
    },
    {
      id: 'ld-3',
      fournisseur_id: 'f-03',
      fournisseur_nom: 'Tata Steel India — Jamshedpur',
      pays_emoji: '🇮🇳',
      code_nc: '7209 16 90',
      produit: 'Acier laminé à froid',
      quantite_tonnes: 3500,
      facteur_emission: 1.65,
      co2_incorpore: 5775,
      prix_carbone_origine: 0,
      certificats_nets: 5775,
      valeur_eur: 479903,
      statut: 'calcule',
    },
    {
      id: 'ld-4',
      fournisseur_id: 'f-04',
      fournisseur_nom: 'Gujarat State Fertilisers Corp.',
      pays_emoji: '🇮🇳',
      code_nc: '3102 10 10',
      produit: 'Urée (engrais azoté)',
      quantite_tonnes: 800,
      facteur_emission: 2.10,
      co2_incorpore: 1680,
      prix_carbone_origine: 0,
      certificats_nets: 1680,
      valeur_eur: 139608,
      statut: 'en_attente',
    },
  ],
}

export function getMACFStats(data: MACFData) {
  const co2Total = data.lignes_declaration.reduce((s, l) => s + l.certificats_nets, 0)
  const coutTotal = co2Total * data.prix_ets_actuel
  const stockRequis = co2Total

  const economieTotal = data.fournisseurs
    .filter(f => f.facteur_reel !== undefined)
    .reduce((s, f) => {
      const diff = f.facteur_defaut - (f.facteur_reel ?? 0)
      return s + diff * f.tonnes_annuelles * data.prix_ets_actuel
    }, 0)

  return { co2Total, coutTotal, stockRequis, economieTotal }
}
