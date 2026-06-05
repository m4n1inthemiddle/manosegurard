'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import HeroDualPath from '@/components/HeroDualPath'
import { Technician } from '@/types'
import { categories } from '@/lib/categories'
import ServiceCard from '@/components/ServiceCard'
import TechnicianCard from '@/components/TechnicianCard'
import SectionHeader from '@/components/ui/SectionHeader'
import TechnicianCardSkeleton from '@/components/ui/TechnicianCardSkeleton'
import CTASection from '@/components/ui/CTASection'
import {
  ClockIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  HomeModernIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

const steps = [
  { number: '01', title: 'Solicita el servicio', description: 'Completa nuestro formulario con tus necesidades en menos de 2 minutos.' },
  { number: '02', title: 'Te conectamos', description: 'Encontramos al técnico verificado ideal para tu trabajo y zona.' },
  { number: '03', title: 'Recibe atención', description: 'Servicio rápido, seguro y con seguimiento por WhatsApp.' },
]

const trustFeatures = [
  { icon: ShieldCheckIcon, title: 'Técnicos verificados', description: 'Proceso riguroso de verificación de credenciales y experiencia.' },
  { icon: ClockIcon, title: 'Atención rápida', description: 'Respuesta en menos de 30 minutos en horario de servicio.' },
  { icon: ChatBubbleLeftRightIcon, title: 'Soporte WhatsApp', description: 'Atención personalizada cuando la necesites.' },
  { icon: StarIcon, title: 'Calificaciones reales', description: 'Opiniones de clientes que contrataron el servicio.' },
  { icon: HomeModernIcon, title: 'Servicio a domicilio', description: 'Vamos a donde nos necesites en todo el país.' },
]

export default function Home() {
  const [featuredTechnicians, setFeaturedTechnicians] = useState<Technician[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [searchCategory, setSearchCategory] = useState('')
  const [loadingTechs, setLoadingTechs] = useState(true)
  const [loadingReviews, setLoadingReviews] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadHomeData = async () => {
      const [techResult, reviewsResult] = await Promise.all([
        supabase
          .from('technicians')
          .select('*')
          .eq('verified', true)
          .eq('approved', true)
          .limit(6),
        supabase
          .from('reviews')
          .select('*, technicians(name)')
          .order('created_at', { ascending: false })
          .limit(6),
      ])

      if (cancelled) return

      if (techResult.data) setFeaturedTechnicians(techResult.data)
      if (reviewsResult.data) setReviews(reviewsResult.data)
      setLoadingTechs(false)
      setLoadingReviews(false)
    }

    loadHomeData()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <HeroDualPath />

      <section className="border-b border-slate-200/80 bg-surface-muted py-10">
        <div className="container-page">
          <div className="card mx-auto max-w-3xl p-2 md:p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <select
                  className="input-field pl-11"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  aria-label="Tipo de servicio"
                >
                  <option value="">¿Qué necesitas?</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <Link
                href={
                  searchCategory
                    ? `/solicitar?servicio=${encodeURIComponent(searchCategory)}`
                    : '/solicitar'
                }
                className="btn-primary shrink-0 text-center"
              >
                Solicitar servicio
              </Link>
              <Link
                href={
                  searchCategory
                    ? `/tecnicos?categoria=${encodeURIComponent(searchCategory.toLowerCase())}`
                    : '/tecnicos'
                }
                className="btn-secondary shrink-0 text-center"
              >
                Buscar técnico
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-page">
          <SectionHeader
            badge="Servicios"
            title="Todo lo que tu hogar necesita"
            description="Profesionales verificados en cada especialidad, listos para atenderte."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <ServiceCard key={category.name} {...category} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface-muted">
        <div className="container-page">
          <SectionHeader
            badge="Proceso"
            title="¿Cómo funciona?"
            description="Tres pasos simples para resolver cualquier problema en tu hogar."
          />
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="card relative h-full p-8">
                <span className="font-display text-5xl font-bold text-brand-100">{step.number}</span>
                <h3 className="mt-4 font-display text-xl font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-page">
          <SectionHeader
            badge="Confianza"
            title="¿Por qué elegir ManoSeguraRD?"
            description="Construimos confianza con procesos claros y soporte real."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {trustFeatures.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface-muted">
        <div className="container-page">
          <SectionHeader
            badge="Profesionales"
            title="Técnicos destacados"
            description="Conoce a algunos de nuestros mejores profesionales verificados."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loadingTechs ? (
              Array.from({ length: 3 }).map((_, i) => <TechnicianCardSkeleton key={i} />)
            ) : featuredTechnicians.length === 0 ? (
              <p className="col-span-full text-center text-slate-500">
                Próximamente más técnicos verificados en tu zona.
              </p>
            ) : (
              featuredTechnicians.map((tech) => (
                <TechnicianCard key={tech.id} technician={tech} />
              ))
            )}
          </div>
          <div className="mt-10 text-center">
            <Link href="/tecnicos" className="btn-secondary">
              Ver todos los técnicos
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-page">
          <SectionHeader badge="Testimonios" title="Lo que dicen nuestros clientes" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loadingReviews ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card h-48 animate-pulse bg-slate-100" />
              ))
            ) : reviews.length === 0 ? (
              <p className="col-span-full text-center text-slate-500">
                Aún no hay reseñas. ¡Sé el primero en calificar!
              </p>
            ) : (
              reviews.map((review) => (
                <blockquote key={review.id} className="card h-full p-6">
                  <div className="mb-3 flex gap-0.5">
                    {[...Array(review.rating)].map((_, idx) => (
                      <StarSolid key={idx} className="h-5 w-5 text-amber-400" />
                    ))}
                  </div>
                  <p className="leading-relaxed text-slate-700">&ldquo;{review.comment}&rdquo;</p>
                  <footer className="mt-4 border-t border-slate-100 pt-4">
                    <cite className="not-italic font-semibold text-slate-900">
                      {review.customer_name}
                    </cite>
                    {review.technicians && (
                      <p className="mt-1 text-sm text-slate-500">
                        Técnico: {review.technicians.name}
                      </p>
                    )}
                  </footer>
                </blockquote>
              ))
            )}
          </div>
        </div>
      </section>

      <CTASection
        title="¿Cliente o técnico?"
        description="Solicita un servicio en minutos o únete a nuestra red de profesionales verificados."
        primaryHref="/solicitar"
        primaryLabel="Solicitar servicio"
        secondaryHref="/unete"
        secondaryLabel="Únete como profesional"
      />
    </>
  )
}
