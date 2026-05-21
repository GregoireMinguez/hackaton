'use client'

import { useState } from 'react'
import { PAYS_EU } from '@/lib/eu/pays'
import type { EntiteAvecDetails } from '@/lib/eu/types'

interface Props { entites: EntiteAvecDetails[] }

export default function MapEU({ entites }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const paysCoverts = new Set(entites.map(e => e.pays))

  const getPaysEntites = (code: string) =>
    entites.filter(e => e.pays === code).map(e => e.nom_legal).join(', ')

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Présence EU</div>

      <div className="relative">
        <svg viewBox="0 0 440 360" className="w-full h-auto" style={{ maxHeight: 240 }}>
          {/* Europe background (simplified) */}
          <rect x="40" y="60" width="360" height="280" rx="12" fill="#f1f5f9" />
          <text x="220" y="360" textAnchor="middle" fontSize="10" fill="#cbd5e1">Union Européenne</text>

          {/* Country dots */}
          {PAYS_EU.map(pays => {
            const hasEntite = paysCoverts.has(pays.code)
            const isHovered = hovered === pays.code
            return (
              <g key={pays.code}>
                <circle
                  cx={pays.map_x}
                  cy={pays.map_y}
                  r={isHovered ? 14 : hasEntite ? 11 : 8}
                  fill={hasEntite ? '#4f46e5' : '#e2e8f0'}
                  stroke={hasEntite ? '#3730a3' : '#cbd5e1'}
                  strokeWidth={1}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHovered(pays.code)}
                  onMouseLeave={() => setHovered(null)}
                />
                <text
                  x={pays.map_x}
                  y={pays.map_y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={hasEntite ? '9' : '7'}
                  className="pointer-events-none select-none"
                  fill={hasEntite ? 'white' : '#94a3b8'}
                  fontWeight={hasEntite ? 'bold' : 'normal'}
                >
                  {pays.code}
                </text>
              </g>
            )
          })}

          {/* Tooltip */}
          {hovered && (() => {
            const pays = PAYS_EU.find(p => p.code === hovered)!
            const entiteNom = getPaysEntites(hovered)
            const x = Math.min(Math.max(pays.map_x - 60, 10), 320)
            const y = pays.map_y > 200 ? pays.map_y - 55 : pays.map_y + 18
            return (
              <g>
                <rect x={x} y={y} width={130} height={entiteNom ? 38 : 26} rx={6} fill="white" stroke="#e2e8f0" strokeWidth={1} filter="drop-shadow(0 2px 4px rgba(0,0,0,.1))" />
                <text x={x + 8} y={y + 13} fontSize="11" fontWeight="600" fill="#1e293b">{pays.emoji} {pays.nom_fr}</text>
                {entiteNom && <text x={x + 8} y={y + 27} fontSize="9.5" fill="#6366f1">{entiteNom.slice(0, 22)}{entiteNom.length > 22 ? '…' : ''}</text>}
              </g>
            )
          })()}
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-indigo-600" />
            <span className="text-xs text-gray-500">Entité active ({paysCoverts.size} pays)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-200" />
            <span className="text-xs text-gray-500">Sans entité</span>
          </div>
        </div>
      </div>
    </div>
  )
}
