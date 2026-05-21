import type { EntiteAvecDetails } from '@/lib/eu/types'

const KEY = 'eucos_entites'

export function getLocalEntites(): EntiteAvecDetails[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function addLocalEntite(e: EntiteAvecDetails): void {
  const list = getLocalEntites()
  list.push(e)
  localStorage.setItem(KEY, JSON.stringify(list))
}