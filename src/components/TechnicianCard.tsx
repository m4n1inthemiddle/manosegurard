'use client'

import Link from 'next/link'
import Image from 'next/image'
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid'
import { Technician } from '@/types'
import { buildTechnicianInquiryWhatsAppUrl } from '@/lib/contact'

interface TechnicianCardProps {
  technician: Technician
}

export default function TechnicianCard({ technician }: TechnicianCardProps) {
  const ubicacion = technician.province
    ? technician.sector
      ? `${technician.province} (${technician.sector})`
      : technician.province
    : 'Ubicación no especificada'

  const imagenUrl = technician.photo_url || technician.photo || 'https://picsum.photos/400/300'

  return (
    <article className="card-interactive group overflow-hidden">
        <Link href={`/tecnicos/${technician.id}`} className="block">
          <div className="relative h-52 overflow-hidden">
            <Image
              src={imagenUrl}
              alt={technician.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            {technician.verified && (
              <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-soft">
                Verificado
              </span>
            )}
          </div>
          <div className="p-5">
            <h3 className="font-display text-lg font-semibold text-slate-900 transition-colors group-hover:text-brand-600">
              {technician.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-brand-600">{technician.category}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1">
                <StarIcon className="h-4 w-4 text-amber-400" />
                {technician.rating || 'Nuevo'}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="h-4 w-4 text-slate-400" />
                {ubicacion}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{technician.experience} años de experiencia</p>
            {technician.bio && (
              <p className="mt-2 line-clamp-2 text-sm text-slate-500 italic">
                &ldquo;{technician.bio}&rdquo;
              </p>
            )}
          </div>
        </Link>
        <div className="border-t border-slate-100 px-5 pb-5 pt-0">
          <Link
            href={buildTechnicianInquiryWhatsAppUrl(technician.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-[0.98]"
          >
            Contactar por WhatsApp
          </Link>
        </div>
    </article>
  )
}
