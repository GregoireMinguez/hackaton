import type { EntiteAvecDetails } from '@/lib/eu/types'
import { formatDate, formatCapital } from '@/lib/utils'
import { getPaysParCode } from '@/lib/eu/pays'
import { ExternalLink } from 'lucide-react'

interface Props { entite: EntiteAvecDetails }

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex py-2.5 border-b border-gray-50 last:border-0">
      <dt className="w-44 text-xs font-medium text-gray-500 flex-shrink-0">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  )
}

export default function InfosTab({ entite }: Props) {
  const pays = getPaysParCode(entite.pays)
  const siege = entite.siege_social

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Identité légale</div>
        <dl>
          <Row label="Nom légal" value={entite.nom_legal} />
          <Row label="Nom commercial" value={entite.nom_commercial} />
          <Row label="Forme juridique" value={entite.forme_juridique} />
          <Row label="Pays" value={pays ? `${pays.emoji} ${pays.nom_fr}` : entite.pays} />
          <Row label="N° registre" value={entite.numero_registre} />
          <Row label="Date immatriculation" value={entite.date_immatriculation ? formatDate(entite.date_immatriculation) : undefined} />
          <Row label="Capital social" value={entite.capital_social ? formatCapital(entite.capital_social, entite.devise) : undefined} />
        </dl>
      </div>

      {siege && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Siège social</div>
          <p className="text-sm text-gray-900">{siege.rue}</p>
          <p className="text-sm text-gray-900">{siege.cp} {siege.ville}</p>
          <p className="text-sm text-gray-600">{siege.pays}</p>
        </div>
      )}

      {pays && (
        <div className="bg-eu-bg rounded-xl border border-indigo-100 p-4">
          <div className="text-xs font-semibold text-indigo-700 mb-2">Registre officiel</div>
          <a
            href={pays.url_registre}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800"
          >
            {pays.url_registre}
            <ExternalLink size={13} />
          </a>
          <p className="text-xs text-indigo-600 mt-1">
            Délai mise à jour registre (cadre européen) : <strong>{pays.delai_mise_a_jour} jours ouvrables</strong>
          </p>
        </div>
      )}
    </div>
  )
}
