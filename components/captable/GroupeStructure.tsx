import type { EntiteAvecDetails } from '@/lib/eu/types'
import { getPaysParCode } from '@/lib/eu/pays'
import { cn, statutColor } from '@/lib/utils'

interface Props { entites: EntiteAvecDetails[] }

export default function GroupeStructure({ entites }: Props) {
  const mere = entites.find(e => !e.entite_parente_id)
  const filiales = entites.filter(e => e.entite_parente_id)

  if (!mere) return null

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Structure de groupe</div>

      {/* Société mère */}
      <div className="flex flex-col items-center">
        <EntiteNode entite={mere} isMere />

        {filiales.length > 0 && (
          <>
            <div className="w-px h-8 bg-gray-200" />
            <div className="flex gap-8 items-start">
              {filiales.map((f, i) => (
                <div key={f.id} className="flex flex-col items-center">
                  <div className="w-px h-6 bg-gray-200" />
                  <EntiteNode entite={f} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function EntiteNode({ entite, isMere = false }: { entite: EntiteAvecDetails; isMere?: boolean }) {
  const pays = getPaysParCode(entite.pays)
  return (
    <div className={cn(
      'border rounded-xl px-4 py-3 text-center min-w-36',
      isMere ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-white',
    )}>
      <div className="text-xl mb-1">{pays?.emoji ?? '🏳️'}</div>
      <div className={cn('text-xs font-bold mb-0.5', isMere ? 'text-indigo-800' : 'text-gray-800')}>
        {entite.forme_juridique}
      </div>
      <div className="text-[10px] text-gray-500 max-w-[120px] leading-tight">{entite.nom_legal.replace(/^.+?\s/, '')}</div>
      <div className="mt-1.5">
        <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full', statutColor(entite.statut))}>
          {entite.statut === 'active' ? 'Active' : entite.statut === 'en_creation' ? 'En création' : entite.statut}
        </span>
      </div>
    </div>
  )
}
