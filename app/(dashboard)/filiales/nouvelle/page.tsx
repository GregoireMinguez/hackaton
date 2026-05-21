import Header from '@/components/layout/Header'
import WizardFiliale from '@/components/filiale/WizardFiliale'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NouvelleFialePage() {
  return (
    <div>
      <Header
        title="Créer une filiale EU"
        subtitle="Wizard guidé en 6 étapes — Conforme Directive 2025/25"
        action={
          <Link href="/filiales" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
            <ChevronLeft size={14} /> Retour
          </Link>
        }
      />
      <div className="p-6">
        <WizardFiliale />
      </div>
    </div>
  )
}
