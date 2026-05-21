import { genererObligationsInitiales, OBLIGATION_DIRECTIVE_EU } from '@/lib/eu/obligations'

describe('genererObligationsInitiales()', () => {
  const entiteId = 'ent-test-1'
  const dateCloture = new Date('2024-12-31')

  it('generates obligations for France', () => {
    const obligations = genererObligationsInitiales(entiteId, 'FR', dateCloture)
    expect(obligations.length).toBeGreaterThan(0)
    obligations.forEach(o => {
      expect(o.entite_id).toBe(entiteId)
      expect(o.statut).toBe('a_faire')
    })
  })

  it('generates obligations for Germany', () => {
    const obligations = genererObligationsInitiales(entiteId, 'DE', dateCloture)
    expect(obligations.length).toBeGreaterThan(0)
  })

  it('returns empty array for unknown country', () => {
    const obligations = genererObligationsInitiales(entiteId, 'XX', dateCloture)
    expect(obligations).toEqual([])
  })

  it('computes correct AG annuelle date for France (6 months after clôture)', () => {
    const obligations = genererObligationsInitiales(entiteId, 'FR', dateCloture)
    const ag = obligations.find(o => o.type === 'ag_annuelle')
    expect(ag).toBeDefined()
    // 6 months after 2024-12-31 = 2025-06-30
    expect(ag!.echeance).toBe('2025-06-30')
  })

  it('computes correct Gesellschafterversammlung for Germany (8 months)', () => {
    const obligations = genererObligationsInitiales(entiteId, 'DE', dateCloture)
    const ag = obligations.find(o => o.type === 'ag_annuelle')
    expect(ag).toBeDefined()
    // 8 months after 2024-12-31 = 2025-08-31
    expect(ag!.echeance).toBe('2025-08-31')
  })

  it('all generated obligations have priorite of normale', () => {
    const obligations = genererObligationsInitiales(entiteId, 'FR', dateCloture)
    obligations.forEach(o => {
      expect(o.priorite).toBe('normale')
    })
  })

  it('uses current year-end as default date', () => {
    const obligations = genererObligationsInitiales(entiteId, 'FR')
    expect(obligations.length).toBeGreaterThan(0)
  })

  it('generates Netherlands obligations', () => {
    const obligations = genererObligationsInitiales(entiteId, 'NL', dateCloture)
    expect(obligations.some(o => o.type === 'depot_comptes')).toBe(true)
  })
})

describe('OBLIGATION_DIRECTIVE_EU', () => {
  it('has type mise_a_jour_registre', () => {
    expect(OBLIGATION_DIRECTIVE_EU.type).toBe('mise_a_jour_registre')
  })

  it('has recurrence ponctuelle', () => {
    expect(OBLIGATION_DIRECTIVE_EU.recurrence).toBe('ponctuelle')
  })

  it('has description mentioning 15 days', () => {
    expect(OBLIGATION_DIRECTIVE_EU.description).toContain('15')
  })
})
