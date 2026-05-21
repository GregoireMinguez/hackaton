import Header from '@/components/layout/Header'
import { ExternalLink } from 'lucide-react'

const SECTIONS = [
  {
    icon: '📜',
    titre: 'La Directive (UE) 2025/25 en bref',
    contenu: [
      { q: 'Qu\'est-ce que la Directive 2025/25 ?', r: 'Adoptée le 19 décembre 2024, elle digitalise le droit des sociétés européen. Elle crée un cadre unifié pour les documents d\'entreprise dans les 27 États membres. Entrée en vigueur le 30 janvier 2025, applicable à partir du 31 juillet 2028.' },
      { q: 'Qu\'est-ce que le Certificat d\'Entreprise EU ?', r: 'Un document officiel standardisé, disponible dans les 24 langues de l\'UE, reconnu comme preuve suffisante d\'immatriculation par toutes les autorités publiques européennes. Il contient les représentants légaux, les statuts et le capital.' },
      { q: 'Qu\'est-ce que la Procuration Numérique EU ?', r: 'Une procuration digitale valable sans apostille dans toute l\'Union pour la création de filiales, l\'enregistrement de succursales et les fusions transfrontalières.' },
      { q: 'Qu\'est-ce que le principe "Once-Only" ?', r: 'Les entreprises ne fournissent plus plusieurs fois les mêmes données — les administrations se les transmettent automatiquement entre elles. Particulièrement bénéfique pour les PME et les startups multi-pays.' },
    ],
  },
  {
    icon: '🗓️',
    titre: 'Calendrier d\'application',
    timeline: [
      { date: '19 déc. 2024', label: 'Adoption de la directive', status: 'done' },
      { date: '30 janv. 2025', label: 'Entrée en vigueur officielle', status: 'done' },
      { date: 'Janv. 2026', label: 'Lancement EU Inc. (28ème régime)', status: 'active' },
      { date: '31 juil. 2027', label: 'Deadline transposition nationale', status: 'next' },
      { date: '31 juil. 2028', label: 'Application effective — certificat EU disponible', status: 'future' },
      { date: '1er août 2029', label: 'Obligations reporting groupes d\'entreprises', status: 'future' },
    ],
  },
  {
    icon: '🏢',
    titre: 'EU Inc. — Le 28ème régime',
    contenu: [
      { q: 'Qu\'est-ce que EU Inc. ?', r: 'Lancé en janvier 2026, EU Inc. crée une forme juridique européenne unique, distincte des formes nationales. Incorporation digitale en 48h dans toute l\'EU, enregistrement via un registre central en anglais.' },
      { q: 'Avantages pour les startups', r: 'Documents d\'investissement harmonisés pan-EU, framework de stock-options unifié pour tous les employés EU, agents IA remplaçant les traducteurs assermentés pour les dépôts officiels.' },
    ],
  },
  {
    icon: '❓',
    titre: 'FAQ — EU Company OS',
    contenu: [
      { q: 'Le certificat EU que je génère est-il officiellement valide ?', r: 'Avant le 31 juillet 2028, les certificats générés sont des previews du format qui sera officiellement standardisé. Après cette date, les registres nationaux seront interconnectés et les certificats auront une valeur légale complète dans les 27 États membres.' },
      { q: 'Mes données sont-elles sécurisées ?', r: 'Toutes les données sont stockées dans l\'Union européenne (Supabase EU). Chaque organisation est isolée par Row Level Security (RLS) côté base de données. Les documents sont chiffrés au repos.' },
      { q: 'Puis-je utiliser EU Company OS sans être technique ?', r: 'Oui. L\'application est conçue pour les fondateurs, CFO et juristes d\'entreprise. Aucune compétence technique n\'est requise pour gérer vos entités et générer vos certificats.' },
    ],
  },
]

export default function GuidePage() {
  return (
    <div>
      <Header title="Guide Directive (UE) 2025/25" subtitle="Tout comprendre sur la révolution du droit des sociétés numérique" />

      <div className="p-6 max-w-3xl space-y-6">
        {/* Hero banner */}
        <div className="bg-eu-dark rounded-2xl p-6 text-white">
          <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Ressource officielle</div>
          <h2 className="text-xl font-bold mb-2">Directive (UE) 2025/25 du Parlement Européen</h2>
          <p className="text-slate-400 text-sm mb-4">
            La première directive européenne à digitaliser intégralement le droit des sociétés. Elle révolutionne la façon dont les startups s'expandent dans les 27 États membres.
          </p>
          <a
            href="https://eur-lex.europa.eu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300"
          >
            Lire le texte officiel sur EUR-Lex <ExternalLink size={13} />
          </a>
        </div>

        {SECTIONS.map(section => (
          <div key={section.titre} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{section.icon}</span>
              <h3 className="font-semibold text-gray-900">{section.titre}</h3>
            </div>

            {'timeline' in section && section.timeline ? (
              <div className="relative pl-6">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />
                {section.timeline.map(item => (
                  <div key={item.date} className="mb-4 relative">
                    <div className={`absolute -left-4 w-3 h-3 rounded-full border-2 border-white ${
                      item.status === 'done' ? 'bg-green-500' :
                      item.status === 'active' ? 'bg-amber-500' :
                      item.status === 'next' ? 'bg-indigo-600' : 'bg-gray-300'
                    }`} />
                    <div className="text-[10px] font-bold text-gray-400 uppercase">{item.date}</div>
                    <div className={`text-sm ${item.status === 'done' ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {section.contenu.map(item => (
                  <div key={item.q} className="border-l-2 border-indigo-200 pl-3">
                    <div className="text-sm font-semibold text-gray-900 mb-1">{item.q}</div>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.r}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
