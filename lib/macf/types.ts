export type StatutFournisseur = 'valide' | 'en_collecte' | 'incomplet' | 'a_contacter'
export type SecteurMACF = 'acier' | 'aluminium' | 'ciment' | 'engrais' | 'hydrogene' | 'electricite'

export interface FournisseurMACF {
  id: string
  nom: string
  pays_code: string
  pays_nom: string
  pays_emoji: string
  secteur: SecteurMACF
  code_nc: string
  tonnes_annuelles: number
  facteur_reel?: number
  facteur_defaut: number
  statut: StatutFournisseur
  contact_email: string
  derniere_relance?: string
}

export interface AchatCertificatMACF {
  id: string
  date: string
  quantite: number
  prix_unitaire: number
  montant_total: number
}

export interface LigneDeclarationMACF {
  id: string
  fournisseur_id: string
  fournisseur_nom: string
  pays_emoji: string
  code_nc: string
  produit: string
  quantite_tonnes: number
  facteur_emission: number
  co2_incorpore: number
  prix_carbone_origine: number
  certificats_nets: number
  valeur_eur: number
  statut: 'calcule' | 'en_attente' | 'verifie'
}

export interface PrixETSHebdo {
  semaine: string
  prix: number
}

export interface MACFData {
  fournisseurs: FournisseurMACF[]
  achats_certificats: AchatCertificatMACF[]
  lignes_declaration: LigneDeclarationMACF[]
  prix_ets_historique: PrixETSHebdo[]
  prix_ets_actuel: number
  stock_certificats: number
  annee_declaration: number
}
