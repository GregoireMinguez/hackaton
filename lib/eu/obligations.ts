import { addMonths, format } from 'date-fns'
import type { Obligation, TypeObligation } from '@/lib/eu/types'

interface ObligationTemplate {
  type: TypeObligation
  titre: string
  description: string
  moisDepuisCloture: number
  recurrence: 'annuelle' | 'trimestrielle' | 'ponctuelle'
}

const OBLIGATIONS_PAR_PAYS: Record<string, ObligationTemplate[]> = {
  FR: [
    { type: 'ag_annuelle', titre: 'Assemblée Générale Annuelle', description: 'Approbation des comptes — obligatoire dans les 6 mois suivant la clôture', moisDepuisCloture: 6, recurrence: 'annuelle' },
    { type: 'depot_comptes', titre: 'Dépôt des comptes au greffe', description: 'Dépôt obligatoire au RNE/INPI', moisDepuisCloture: 6, recurrence: 'annuelle' },
  ],
  DE: [
    { type: 'ag_annuelle', titre: 'Gesellschafterversammlung', description: 'Réunion annuelle des associés — 8 mois après clôture', moisDepuisCloture: 8, recurrence: 'annuelle' },
    { type: 'depot_comptes', titre: 'Jahresabschluss — Handelsregister', description: 'Dépôt des comptes annuels', moisDepuisCloture: 12, recurrence: 'annuelle' },
  ],
  NL: [
    { type: 'depot_comptes', titre: 'Jaarrekening deponeren (KvK)', description: 'Dépôt comptes annuels — Kamer van Koophandel', moisDepuisCloture: 6, recurrence: 'annuelle' },
    { type: 'ag_annuelle', titre: 'Algemene Vergadering van Aandeelhouders', description: 'AG annuelle obligatoire', moisDepuisCloture: 6, recurrence: 'annuelle' },
  ],
}

// Cadre européen : applicable à tous les pays membres
const OBLIGATION_DIRECTIVE_EU: ObligationTemplate = {
  type: 'mise_a_jour_registre',
  titre: 'Mise à jour registre (cadre européen)',
  description: 'Toute modification doit être déclarée dans les 15 jours ouvrables — art. 12 du cadre européen',
  moisDepuisCloture: 0,
  recurrence: 'ponctuelle',
}

export function genererObligationsInitiales(
  entiteId: string,
  pays: string,
  dateCloture: Date = new Date(new Date().getFullYear(), 11, 31),
): Omit<Obligation, 'id' | 'created_at'>[] {
  const templates = OBLIGATIONS_PAR_PAYS[pays] ?? []
  return templates.map(t => ({
    entite_id: entiteId,
    titre: t.titre,
    type: t.type,
    echeance: format(addMonths(dateCloture, t.moisDepuisCloture), 'yyyy-MM-dd'),
    statut: 'a_faire' as const,
    priorite: 'normale' as const,
    description: t.description,
  }))
}

export { OBLIGATION_DIRECTIVE_EU }
