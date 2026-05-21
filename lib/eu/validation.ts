import { getPaysParCode, getFormeJuridique } from './pays'

const CP_RULES: Record<string, { regex: RegExp; exemple: string }> = {
  FR: { regex: /^\d{5}$/, exemple: '75011' },
  DE: { regex: /^\d{5}$/, exemple: '10115' },
  NL: { regex: /^\d{4}\s?[A-Za-z]{2}$/, exemple: '1017 EG' },
  ES: { regex: /^\d{5}$/, exemple: '28001' },
  IT: { regex: /^\d{5}$/, exemple: '00100' },
  BE: { regex: /^\d{4}$/, exemple: '1000' },
  LU: { regex: /^(L-?)?\d{4}$/, exemple: '1234' },
  IE: { regex: /^[A-Za-z]\d{2}\s?[A-Za-z0-9]{4}$/, exemple: 'D02 XY12' },
  PT: { regex: /^\d{4}-\d{3}$/, exemple: '1000-001' },
  PL: { regex: /^\d{2}-\d{3}$/, exemple: '00-001' },
  SE: { regex: /^\d{3}\s?\d{2}$/, exemple: '111 20' },
  DK: { regex: /^\d{4}$/, exemple: '1000' },
  AT: { regex: /^\d{4}$/, exemple: '1010' },
  FI: { regex: /^\d{5}$/, exemple: '00100' },
  CZ: { regex: /^\d{3}\s?\d{2}$/, exemple: '110 00' },
  RO: { regex: /^\d{6}$/, exemple: '010011' },
}

export function validateCP(paysCode: string, cp: string): string | null {
  const trimmed = cp?.trim()
  if (!trimmed) return null
  const rule = CP_RULES[paysCode]
  if (!rule) return null
  if (!rule.regex.test(trimmed)) {
    return `Format invalide — ex. ${rule.exemple}`
  }
  return null
}

export function validateCapital(capital: string, paysCode: string, formeCode: string): string | null {
  const val = Number(capital)
  if (capital === '' || isNaN(val)) return 'Veuillez saisir un montant'
  if (val < 0) return 'Le capital ne peut pas être négatif'
  const forme = getFormeJuridique(paysCode, formeCode)
  if (forme && val < forme.capital_min) {
    return `Minimum requis pour ${formeCode} : ${forme.capital_min.toLocaleString('fr')} €`
  }
  return null
}

export function getCPExemple(paysCode: string): string {
  return CP_RULES[paysCode]?.exemple ?? ''
}

export function getCapitalMin(paysCode: string, formeCode: string): number {
  return getFormeJuridique(paysCode, formeCode)?.capital_min ?? getPaysParCode(paysCode)?.capital_min_sarl ?? 1
}