'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { parseRouteId } from '@/lib/parseRouteId'
import { buildTechnicianInquiryWhatsAppUrl } from '@/lib/contact'
import Image from 'next/image'
import Link from 'next/link'
import FadeIn from '@/components/ui/FadeIn'
import { StarIcon, MapPinIcon, ShieldCheckIcon } from '@heroicons/react/24/solid'

export default function TecnicoDetailPage() {
  const params = useParams()
  const technicianId = parseRouteId(params.id)
  const [technician, setTechnician] = useState<any>(null)
  const [workPhotos, setWorkPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!technicianId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      const { data: techData } = await supabase
        .from('technicians')
        .select('*')
        .eq('id', technicianId)
        .single()
      setTechnician(techData)

      const { data: photos } = await supabase
        .from('work_photos')
        .select('*')
        .eq('technician_id', technicianId)
        .order('created_at', { ascending: false })
      setWorkPhotos(photos || [])
      setLoading(false)
    }
    fetchData()
  }, [technicianId])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    )
  }

  if (!technician) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-slate-500">Técnico no encontrado</p>
        <Link href="/tecnicos" className="btn-primary mt-6 inline-flex">
          Ver todos los técnicos
        </Link>
      </div>
    )
  }

  const imagenUrl = technician.photo_url || technician.photo || 'https://picsum.photos/400/300'
  const ubicacion = technician.province
    ? technician.sector
      ? `${technician.province} (${technician.sector})`
      : technician.province
    : 'Ubicación no especificada'

  return (
    <section className="section-padding bg-white">
      <div className="container-page max-w-5xl">
        <FadeIn>
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-br from-brand-50 to-white p-8 md:p-10">
              <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
                <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl border-4 border-white shadow-card">
                  <Image src={imagenUrl} alt={technician.name} fill className="object-cover" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                    <h1 className="font-display text-3xl font-bold text-slate-900">{technician.name}</h1>
                    {technician.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                        <ShieldCheckIcon className="h-4 w-4" />
                        Verificado
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-lg font-medium text-brand-600">{technician.category}</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-slate-600 md:justify-start">
                    <span className="inline-flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4 text-slate-400" />
                      {ubicacion}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <StarIcon className="h-4 w-4 text-amber-400" />
                      {technician.rating || 'Nuevo'}
                    </span>
                    <span>{technician.experience} años de experiencia</span>
                  </div>
                  <Link
                    href={buildTechnicianInquiryWhatsAppUrl(technician.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-6 inline-flex bg-emerald-600 hover:bg-emerald-700"
                  >
                    Contactar por WhatsApp
                  </Link>
                </div>
              </div>
              {technician.bio && (
                <p className="mt-8 border-t border-slate-200/80 pt-8 text-slate-600 leading-relaxed">
                  {technician.bio}
                </p>
              )}
            </div>
          </div>
        </FadeIn>

        {workPhotos.length > 0 && (
          <FadeIn delay={0.15} className="mt-10">
            <h2 className="font-display mb-6 text-2xl font-bold text-slate-900">Trabajos realizados</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {workPhotos.map((photo) => (
                <div key={photo.id} className="card-interactive group overflow-hidden">
                  <div className="relative aspect-square">
                    <img
                      src={photo.image_url}
                      alt={photo.caption || 'Trabajo realizado'}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {photo.caption && (
                    <p className="p-3 text-sm text-slate-600">{photo.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  )
}
