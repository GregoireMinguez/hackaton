import Link from 'next/link'
import type { EntiteAvecDetails } from '@/lib/eu/types'
import { cn, statutColor, joursRestants, formatDate } from '@/lib/utils'
import { getPaysParCode } from '@/lib/eu/pays'
import { FileText, Users, ChevronRight, Award } from 'lucide-react'

interface Props { entite: EntiteAvecDetails }

export default function EntiteCard({ entite }: Props) {
  const pays = getPaysParCode(entite.pays)
  const prochaineObligation = entite.obligations
    .filter(o => o.statut === 'a_faire')
    .sort((a, b) => joursRestants(a.echeance) - joursRestants(b.echeance))[0]
  const hasCertificatEU = entite.documents.some(d => d.est_certificat_eu)
  const jours = prochaineObligation ? joursRestants(prochaineObligation.echeance) : null

  return (
    <div className="group relative bg-white rounded-xl border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
      <Link href={`/entites/${entite.id}`} className="absolute inset-0 rounded-xl z-0" aria-label={`Voir ${entite.nom_legal}`} />

      <div className="p-4 relative z-10 pointer-events-none">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{pays?.emoji ?? '🏳️'}</span>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-700 transition-colors">{entite.nom_legal}</div>
              <div className="text-xs text-gray-500">{entite.forme_juridique} · {pays?.nom_fr ?? entite.pays}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {hasCertificatEU && (
              <span title="Certificat EU valide" className="text-indigo-400">
                <Award size={14} />
              </span>
            )}
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', statutColor(entite.statut))}>
              {entite.statut === 'active' ? 'Active' : entite.statut === 'en_creation' ? 'En création' : entite.statut}
            </span>
          </div>
        </div>

        {/* Next obligation */}
        {prochaineObligation && (
          <div className={cn(
            'text-xs px-2.5 py-1.5 rounded-lg mb-3',
            jours !== null && jours <= 7 ? 'bg-red-50 text-red-700' :
            jours !== null && jours <= 30 ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-600',
          )}>
            <span className="font-medium">Prochaine :</span> {prochaineObligation.titre}
            {jours !== null && (
              <span className="ml-1">· {jours <= 0 ? 'En retard' : `${jours}j`}</span>
            )}
          </div>
        )}

        {/* Counters */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><FileText size={12} /> {entite.documents.length} doc{entite.documents.length > 1 ? 's' : ''}</span>
          <span className="flex items-center gap-1"><Users size={12} /> {entite.representants.length} représentant{entite.representants.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Actions footer */}
      <div className="border-t border-gray-50 px-4 py-2.5 flex gap-2 relative z-10">
        <Link
          href={`/entites/${entite.id}`}
          className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 py-1 transition-colors"
        >
          Voir la fiche <ChevronRight size={12} />
        </Link>
        <div className="w-px bg-gray-100" />
        <Link
          href={`/entites/${entite.id}/certificat`}
          className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 py-1 transition-colors"
        >
          <Award size={12} /> Certificat EU
        </Link>
      </div>
    </div>
  )
}
