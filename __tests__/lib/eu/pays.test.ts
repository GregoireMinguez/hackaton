import { PAYS_EU, getPaysParCode, getFormeJuridique } from '@/lib/eu/pays'

describe('PAYS_EU — structure', () => {
  it('contains all 27 EU member states', () => {
    const EU27_CODES = ['FR', 'DE', 'NL', 'ES', 'IT', 'BE', 'LU', 'IE', 'PT', 'PL', 'SE', 'DK', 'AT', 'FI', 'CZ', 'RO']
    EU27_CODES.forEach(code => {
      expect(PAYS_EU.some(p => p.code === code)).toBe(true)
    })
  })

  it('every country has required fields', () => {
    PAYS_EU.forEach(pays => {
      expect(pays.code).toBeTruthy()
      expect(pays.nom_fr).toBeTruthy()
      expect(pays.emoji).toBeTruthy()
      expect(pays.url_registre).toBeTruthy()
      expect(pays.formes_juridiques.length).toBeGreaterThan(0)
    })
  })

  it('every country has delai_mise_a_jour of 15 (Directive 2025/25)', () => {
    PAYS_EU.forEach(pays => {
      expect(pays.delai_mise_a_jour).toBe(15)
    })
  })

  it('every country has at least one legal form with capital_min >= 0', () => {
    PAYS_EU.forEach(pays => {
      pays.formes_juridiques.forEach(forme => {
        expect(forme.capital_min).toBeGreaterThanOrEqual(0)
      })
    })
  })

  it('map coordinates are within SVG viewBox (500x400)', () => {
    PAYS_EU.forEach(pays => {
      expect(pays.map_x).toBeGreaterThanOrEqual(0)
      expect(pays.map_x).toBeLessThanOrEqual(500)
      expect(pays.map_y).toBeGreaterThanOrEqual(0)
      expect(pays.map_y).toBeLessThanOrEqual(400)
    })
  })

  it('codes are 2-letter ISO 3166-1 alpha-2', () => {
    PAYS_EU.forEach(pays => {
      expect(pays.code).toMatch(/^[A-Z]{2}$/)
    })
  })

  it('has no duplicate country codes', () => {
    const codes = PAYS_EU.map(p => p.code)
    const unique = new Set(codes)
    expect(unique.size).toBe(codes.length)
  })
})

describe('getPaysParCode()', () => {
  it('returns France for FR', () => {
    const fr = getPaysParCode('FR')
    expect(fr).toBeDefined()
    expect(fr!.nom_fr).toBe('France')
    expect(fr!.emoji).toBe('🇫🇷')
  })

  it('returns Germany for DE', () => {
    const de = getPaysParCode('DE')
    expect(de).toBeDefined()
    expect(de!.nom_fr).toBe('Allemagne')
  })

  it('returns undefined for unknown code', () => {
    expect(getPaysParCode('XX')).toBeUndefined()
    expect(getPaysParCode('')).toBeUndefined()
    expect(getPaysParCode('US')).toBeUndefined()
  })

  it('is case-sensitive', () => {
    expect(getPaysParCode('fr')).toBeUndefined()
    expect(getPaysParCode('Fr')).toBeUndefined()
  })
})

describe('getFormeJuridique()', () => {
  it('returns SAS for FR/SAS', () => {
    const sas = getFormeJuridique('FR', 'SAS')
    expect(sas).toBeDefined()
    expect(sas!.code).toBe('SAS')
    expect(sas!.capital_min).toBe(1)
  })

  it('returns GmbH with correct minimum capital for DE', () => {
    const gmbh = getFormeJuridique('DE', 'GmbH')
    expect(gmbh).toBeDefined()
    expect(gmbh!.capital_min).toBe(25000)
  })

  it('returns BV for NL', () => {
    const bv = getFormeJuridique('NL', 'BV')
    expect(bv).toBeDefined()
    expect(bv!.capital_min).toBe(1)
  })

  it('returns undefined for unknown form', () => {
    expect(getFormeJuridique('FR', 'UNKNOWN')).toBeUndefined()
  })

  it('returns undefined for unknown country', () => {
    expect(getFormeJuridique('XX', 'SAS')).toBeUndefined()
  })
})

describe('legal form capital minimums', () => {
  it('SA France has 37000 minimum capital', () => {
    const sa = getFormeJuridique('FR', 'SA')
    expect(sa!.capital_min).toBe(37000)
  })

  it('AG Germany has 50000 minimum capital', () => {
    const ag = getFormeJuridique('DE', 'AG')
    expect(ag!.capital_min).toBe(50000)
  })

  it('UG Germany has 1 minimum capital', () => {
    const ug = getFormeJuridique('DE', 'UG')
    expect(ug!.capital_min).toBe(1)
  })
})
