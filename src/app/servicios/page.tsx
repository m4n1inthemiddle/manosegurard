'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import * as Icons from '@heroicons/react/24/outline'
import { ArrowRightIcon } from '@heroicons/react/24/solid'
import PageHero from '@/components/ui/PageHero'
import FadeIn from '@/components/ui/FadeIn'
import CTASection from '@/components/ui/CTASection'
import { categories } from '@/lib/categories'

export default function ServiciosPage() {
  const [technicianCounts, setTechnicianCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchCounts = async () => {
      const counts: Record<string, number> = {}
      for (const cat of categories) {
        const { count } = await supabase
          .from('technicians')
          .select('*', { count: 'exact', head: true })
          .eq('category', cat.name)
          .eq('approved', true)
        counts[cat.name] = count || 0
      }
      setTechnicianCounts(counts)
    }
    fetchCounts()
  }, [])

  return (
    <>
      <PageHero
        badge="Servicios"
        title="Soluciones profesionales para tu hogar"
        description="Encuentra técnicos verificados en cada especialidad. Calidad, rapidez y respaldo."
      />

      <section className="section-padding bg-white">
        <div className="container-page">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => {
              const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[
                cat.iconName
              ]
              const count = technicianCounts[cat.name] || 0

              return (
                <FadeIn key={cat.name} delay={i * 0.05}>
                  <article className="card-interactive group flex h-full flex-col p-8">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      {IconComponent && <IconComponent className="h-7 w-7" />}
                    </div>
                    <h2 className="font-display text-xl font-semibold text-slate-900">{cat.name}</h2>
                    <p className="mt-3 flex-1 text-slate-600">{cat.description}</p>
                    <p className="mt-4 text-sm font-medium text-brand-600">
                      {count} {count === 1 ? 'técnico disponible' : 'técnicos disponibles'}
                    </p>
                    <Link
                      href={`/tecnicos?categoria=${encodeURIComponent(cat.name.toLowerCase())}`}
                      className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-all group-hover:gap-2"
                    >
                      Ver técnicos
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </article>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      <CTASection
        title="¿No encuentras lo que buscas?"
        description="Cuéntanos tu necesidad y te conectamos con el profesional adecuado."
        primaryHref="/solicitar"
        primaryLabel="Solicitar servicio"
        secondaryHref="/contacto"
        secondaryLabel="Contactar"
      />
    </>
  )
}
