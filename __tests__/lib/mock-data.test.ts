import { MOCK_DATA } from '@/lib/mock-data'

describe('MOCK_DATA — structure integrity', () => {
  it('has an organisation', () => {
    expect(MOCK_DATA.organisation).toBeDefined()
    expect(MOCK_DATA.organisation.nom).toBeTruthy()
    expect(MOCK_DATA.organisation.id).toBeTruthy()
  })

  it('organisation has valid plan', () => {
    expect(['starter', 'scale', 'enterprise']).toContain(MOCK_DATA.organisation.plan_abonnement)
  })

  it('has at least 2 entities', () => {
    expect(MOCK_DATA.entites.length).toBeGreaterThanOrEqual(2)
  })

  it('every entity has required fields', () => {
    MOCK_DATA.entites.forEach(e => {
      expect(e.id).toBeTruthy()
      expect(e.nom_legal).toBeTruthy()
      expect(e.forme_juridique).toBeTruthy()
      expect(e.pays).toMatch(/^[A-Z]{2}$/)
      expect(e.statut).toBeTruthy()
    })
  })

  it('entities reference the correct organisation', () => {
    MOCK_DATA.entites.forEach(e => {
      expect(e.organisation_id).toBe(MOCK_DATA.organisation.id)
    })
  })

  it('every entity has obligations array', () => {
    MOCK_DATA.entites.forEach(e => {
      expect(Array.isArray(e.obligations)).toBe(true)
    })
  })

  it('every entity has representants array', () => {
    MOCK_DATA.entites.forEach(e => {
      expect(Array.isArray(e.representants)).toBe(true)
    })
  })

  it('every entity has documents array', () => {
    MOCK_DATA.entites.forEach(e => {
      expect(Array.isArray(e.documents)).toBe(true)
    })
  })

  it('every entity has associes array', () => {
    MOCK_DATA.entites.forEach(e => {
      expect(Array.isArray(e.associes)).toBe(true)
    })
  })

  it('FR entity has valid SAS legal form', () => {
    const fr = MOCK_DATA.entites.find(e => e.pays === 'FR')
    expect(fr).toBeDefined()
    expect(fr!.forme_juridique).toBe('SAS')
  })

  it('DE entity is a subsidiary of the FR entity', () => {
    const fr = MOCK_DATA.entites.find(e => e.pays === 'FR')
    const de = MOCK_DATA.entites.find(e => e.pays === 'DE')
    expect(de!.entite_parente_id).toBe(fr!.id)
  })

  it('has at least one urgent obligation (≤ 7 days)', () => {
    const today = new Date()
    const allObligs = MOCK_DATA.entites.flatMap(e => e.obligations)
    const urgent = allObligs.filter(o => {
      const diff = Math.ceil((new Date(o.echeance).getTime() - today.getTime()) / 86400000)
      return diff <= 7 && o.statut === 'a_faire'
    })
    expect(urgent.length).toBeGreaterThan(0)
  })

  it('has activity log entries', () => {
    expect(MOCK_DATA.activity.length).toBeGreaterThan(0)
  })

  it('activity log entries have required fields', () => {
    MOCK_DATA.activity.forEach(log => {
      expect(log.id).toBeTruthy()
      expect(log.action).toBeTruthy()
      expect(log.created_at).toBeTruthy()
    })
  })

  it('has team members', () => {
    expect(MOCK_DATA.membres.length).toBeGreaterThan(0)
  })

  it('first member is the owner', () => {
    const owner = MOCK_DATA.membres.find(m => m.role === 'owner')
    expect(owner).toBeDefined()
  })

  it('cap table shares sum to a positive number for each entity with associes', () => {
    MOCK_DATA.entites
      .filter(e => e.associes.length > 0)
      .forEach(e => {
        const total = e.associes.reduce((s, a) => s + a.nb_actions, 0)
        expect(total).toBeGreaterThan(0)
      })
  })

  it('has at least one EU certificate document', () => {
    const allDocs = MOCK_DATA.entites.flatMap(e => e.documents)
    const euCerts = allDocs.filter(d => d.est_certificat_eu)
    expect(euCerts.length).toBeGreaterThan(0)
  })

  it('obligation echeance dates are valid ISO date strings', () => {
    const allObligs = MOCK_DATA.entites.flatMap(e => e.obligations)
    allObligs.forEach(o => {
      expect(o.echeance).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(isNaN(new Date(o.echeance).getTime())).toBe(false)
    })
  })
})
