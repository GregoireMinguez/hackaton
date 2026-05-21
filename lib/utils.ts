import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy', { locale: fr })
}

export function formatDateRelative(date: string): string {
  const d = parseISO(date)
  const diff = differenceInDays(d, new Date())
  if (diff < 0) return `Il y a ${Math.abs(diff)} jours`
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Demain'
  if (diff <= 7) return `Dans ${diff} jours`
  if (diff <= 30) return `Dans ${Math.ceil(diff / 7)} semaines`
  return formatDate(date)
}

export function joursRestants(echeance: string): number {
  return differenceInDays(parseISO(echeance), new Date())
}

export function formatCapital(montant: number, devise = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise, maximumFractionDigits: 0 }).format(montant)
}

export function initiales(nom: string): string {
  return nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function statutColor(statut: string): string {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    en_creation: 'bg-blue-100 text-blue-800',
    en_liquidation: 'bg-amber-100 text-amber-800',
    dissoute: 'bg-gray-100 text-gray-600',
  }
  return map[statut] ?? 'bg-gray-100 text-gray-600'
}

export function prioriteColor(priorite: string, statut: string): string {
  if (statut === 'en_retard') return 'text-red-600'
  const map: Record<string, string> = {
    urgente: 'text-red-600',
    haute: 'text-amber-600',
    normale: 'text-blue-600',
    basse: 'text-gray-500',
  }
  return map[priorite] ?? 'text-gray-500'
}
