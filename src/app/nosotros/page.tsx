'use client'
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import PageHero from '@/components/ui/PageHero'
import SectionHeader from '@/components/ui/SectionHeader'
import FadeIn from '@/components/ui/FadeIn'
import CTASection from '@/components/ui/CTASection'
import {
  HeartIcon,
  ShieldCheckIcon,
  UsersIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

const values = [
  {
    icon: ShieldCheckIcon,
    title: 'Seguridad primero',
    description: 'Cada técnico pasa por verificación de identidad, experiencia y referencias antes de unirse a la red.',
  },
  {
    icon: HeartIcon,
    title: 'Compromiso local',
    description: 'Somos dominicanos sirviendo a dominicanos. Entendemos las necesidades reales de los hogares en RD.',
  },
  {
    icon: UsersIcon,
    title: 'Comunidad de confianza',
    description: 'Conectamos familias con profesionales que construyen reputación con trabajo de calidad.',
  },
  {
    icon: SparklesIcon,
    title: 'Experiencia simple',
    description: 'Solicitar un técnico debe ser tan fácil como pedir un ride. Por eso optimizamos cada paso.',
  },
]

const stats = [
  { value: '9+', label: 'Especialidades' },
  { value: '30 min', label: 'Tiempo de respuesta' },
  { value: '24/7', label: 'Soporte WhatsApp' },
  { value: '100%', label: 'Técnicos verificados' },
]

export default function NosotrosPage() {
  return (
    <>
      <PageHero
        badge="Nuestra historia"
        title="Conectamos hogares con profesionales de confianza"
        description="ManoSeguraRD nació para resolver un problema simple: encontrar técnicos confiables en República Dominicana no debería ser complicado."
      />

      <section className="section-padding bg-white">
        <div className="container-page">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn>
              <h2 className="font-display text-3xl font-bold text-slate-900 md:text-4xl">
                Nuestra misión
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Facilitar el acceso a servicios técnicos de calidad en todo el país, con transparencia,
                rapidez y un estándar de verificación que genere confianza real.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Ya sea una emergencia de plomería o la instalación de paneles solares, queremos que cada
                familia tenga la tranquilidad de saber quién entra a su hogar.
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="card p-6 text-center">
                    <p className="font-display text-3xl font-bold text-brand-600">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface-muted">
        <div className="container-page">
          <SectionHeader
            badge="Valores"
            title="Lo que nos define"
            description="Principios que guían cada decisión y cada conexión que hacemos."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {values.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <div className="card flex gap-5 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-slate-600">{item.description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-page text-center">
          <FadeIn>
            <h2 className="font-display text-3xl font-bold text-slate-900">¿Listo para empezar?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
              Solicita un técnico o únete a nuestra red de profesionales verificados.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/solicitar" className="btn-primary">
                Solicitar servicio
              </Link>
              <Link href="/unete" className="btn-secondary">
                Unirme como técnico
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <CTASection
        title="Tu hogar merece lo mejor"
        description="Miles de familias confían en nosotros para mantener sus hogares seguros y funcionando."
        primaryHref="/contacto"
        primaryLabel="Contáctanos"
        secondaryHref="/servicios"
        secondaryLabel="Ver servicios"
      />
    </>
  )
}
