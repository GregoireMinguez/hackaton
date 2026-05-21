import { cn, formatDate, formatCapital, initiales, statutColor, prioriteColor, joursRestants } from '@/lib/utils'

// Fix date-fns locale in test env
jest.mock('date-fns/locale', () => ({ fr: {} }))

describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('overrides conflicting Tailwind classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('ignores falsy values', () => {
    expect(cn('foo', false, undefined, null as unknown as string, 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    const active = true
    expect(cn('base', active && 'active')).toBe('base active')
    expect(cn('base', !active && 'inactive')).toBe('base')
  })
})

describe('formatCapital()', () => {
  it('formats EUR amounts', () => {
    const result = formatCapital(10000, 'EUR')
    expect(result).toContain('10')
    expect(result).toContain('000')
  })

  it('uses EUR as default currency', () => {
    const withEur = formatCapital(5000, 'EUR')
    const withDefault = formatCapital(5000)
    expect(withEur).toBe(withDefault)
  })

  it('handles zero capital', () => {
    expect(formatCapital(0)).toContain('0')
  })

  it('handles large amounts', () => {
    const result = formatCapital(1000000)
    expect(result).toBeTruthy()
    expect(result).not.toBe('')
  })
})

describe('initiales()', () => {
  it('returns two initials for two words', () => {
    expect(initiales('Sarah Chen')).toBe('SC')
  })

  it('returns one initial for one word', () => {
    expect(initiales('Sarah')).toBe('S')
  })

  it('uppercases the result', () => {
    expect(initiales('sarah chen')).toBe('SC')
  })

  it('handles compound names', () => {
    expect(initiales('Jean-Pierre Dupont')).toBe('JD')
  })

  it('truncates to 2 characters max', () => {
    const result = initiales('Jean Pierre Martin')
    expect(result.length).toBeLessThanOrEqual(2)
  })
})

describe('statutColor()', () => {
  it('returns green for active', () => {
    expect(statutColor('active')).toContain('green')
  })

  it('returns blue for en_creation', () => {
    expect(statutColor('en_creation')).toContain('blue')
  })

  it('returns amber for en_liquidation', () => {
    expect(statutColor('en_liquidation')).toContain('amber')
  })

  it('returns gray for dissoute', () => {
    expect(statutColor('dissoute')).toContain('gray')
  })

  it('returns gray for unknown status', () => {
    expect(statutColor('unknown')).toContain('gray')
  })
})

describe('prioriteColor()', () => {
  it('returns red for urgente priority', () => {
    expect(prioriteColor('urgente', 'a_faire')).toContain('red')
  })

  it('returns amber for haute priority', () => {
    expect(prioriteColor('haute', 'a_faire')).toContain('amber')
  })

  it('returns blue for normale priority', () => {
    expect(prioriteColor('normale', 'a_faire')).toContain('blue')
  })

  it('always returns red when status is en_retard', () => {
    expect(prioriteColor('normale', 'en_retard')).toContain('red')
    expect(prioriteColor('basse', 'en_retard')).toContain('red')
  })
})

describe('joursRestants()', () => {
  it('returns 0 for today', () => {
    const today = new Date().toISOString().split('T')[0]
    expect(joursRestants(today)).toBe(0)
  })

  it('returns positive number for future date', () => {
    const future = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    expect(joursRestants(future)).toBeGreaterThan(0)
  })

  it('returns negative number for past date', () => {
    const past = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0]
    expect(joursRestants(past)).toBeLessThan(0)
  })

  it('returns ~7 for date 7 days from now', () => {
    const inSevenDays = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    expect(joursRestants(inSevenDays)).toBeGreaterThanOrEqual(6)
    expect(joursRestants(inSevenDays)).toBeLessThanOrEqual(7)
  })
})
