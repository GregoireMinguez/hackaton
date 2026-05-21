export type PlanAbonnement = 'starter' | 'scale' | 'enterprise'
export type StatutEntite = 'active' | 'en_creation' | 'en_liquidation' | 'dissoute'
export type TypeDocument =
  | 'eu_certificate' | 'statuts' | 'extrait_kbis' | 'pv_ag'
  | 'procuration_eu' | 'bilan' | 'rapport_cac' | 'contrat' | 'autre'
export type StatutObligation = 'a_faire' | 'fait' | 'en_retard' | 'na'
export type PrioriteObligation = 'urgente' | 'haute' | 'normale' | 'basse'
export type TypeObligation =
  | 'ag_annuelle' | 'depot_comptes' | 'mise_a_jour_registre'
  | 'renouvellement_mandat' | 'declaration_fiscale' | 'autre'
export type TypeAssocie = 'fondateur' | 'investisseur' | 'employe' | 'esop_pool' | 'autre'
export type StatutStockOption = 'attribuees' | 'acquises_partiel' | 'acquises' | 'exercees' | 'annulees'
export type RoleMembre = 'owner' | 'admin' | 'member' | 'viewer' | 'externe'
export type StatutFiliale = 'brouillon' | 'etape_2' | 'etape_3' | 'etape_4' | 'etape_5' | 'soumis' | 'actif'

export interface Organisation {
  id: string
  owner_user_id: string
  nom: string
  plan_abonnement: PlanAbonnement
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface SiegeSocial {
  rue: string
  cp: string
  ville: string
  pays: string
}

export interface EntiteLegale {
  id: string
  organisation_id: string
  entite_parente_id?: string
  nom_legal: string
  nom_commercial?: string
  forme_juridique: string
  pays: string
  numero_registre?: string
  date_immatriculation?: string
  capital_social?: number
  devise: string
  siege_social?: SiegeSocial
  statut: StatutEntite
  notes?: string
  created_at: string
  updated_at: string
}

export interface Representant {
  id: string
  entite_id: string
  nom_complet: string
  email?: string
  role: string
  date_debut: string
  date_fin?: string
  document_identite_url?: string
  created_at: string
}

export interface Document {
  id: string
  entite_id: string
  nom: string
  type: TypeDocument
  langue: string
  fichier_url?: string
  date_emission?: string
  date_expiration?: string
  est_certificat_eu: boolean
  signature_electronique_url?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface Obligation {
  id: string
  entite_id: string
  titre: string
  type: TypeObligation
  echeance: string
  statut: StatutObligation
  priorite: PrioriteObligation
  description?: string
  document_id?: string
  accomplie_le?: string
  created_at: string
}

export interface CreationFiliale {
  id: string
  organisation_id: string
  entite_parente_id?: string
  pays_cible: string
  forme_juridique_cible?: string
  nom_filiale?: string
  statut: StatutFiliale
  etape_courante: number
  donnees_formulaire: Record<string, unknown>
  entite_creee_id?: string
  created_at: string
  updated_at: string
}

export interface Associe {
  id: string
  entite_id: string
  nom: string
  email?: string
  type: TypeAssocie
  nb_actions: number
  type_actions: string
  prix_acquisition?: number
  date_entree?: string
  notes?: string
  created_at: string
}

export interface MembreEquipe {
  id: string
  organisation_id: string
  user_id?: string
  email: string
  role: RoleMembre
  invited_by?: string
  invited_at: string
  accepted_at?: string
}

export interface ActivityLog {
  id: string
  organisation_id: string
  entite_id?: string
  user_id?: string
  user_nom?: string
  action: string
  details?: Record<string, unknown>
  created_at: string
}

export interface EntiteAvecDetails extends EntiteLegale {
  obligations: Obligation[]
  representants: Representant[]
  documents: Document[]
  associes: Associe[]
}

export interface DashboardData {
  organisation: Organisation
  entites: EntiteAvecDetails[]
  activity: ActivityLog[]
  membres: MembreEquipe[]
}
