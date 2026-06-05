'use client'

import type { ComponentType } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
  InboxIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const clientBenefits = [
  { icon: MagnifyingGlassIcon, text: 'Buscar técnico verificado' },
  { icon: BoltIcon, text: 'Solicitar servicio al instante' },
  { icon: HomeIcon, text: 'Ayuda rápida en tu hogar' },
]

const technicianBenefits = [
  { icon: UserPlusIcon, text: 'Registrarse como profesional' },
  { icon: InboxIcon, text: 'Recibir solicitudes de clientes' },
  { icon: CurrencyDollarIcon, text: 'Generar ingresos constantes' },
]

interface PathCardProps {
  type: 'client' | 'technician'
  title: string
  subtitle: string
  benefits: { icon: ComponentType<{ className?: string }>; text: string }[]
  primaryHref: string
  primaryLabel: string
  secondaryHref: string
  secondaryLabel: string
  delay?: number
}

function PathCard({
  type,
  title,
  subtitle,
  benefits,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  delay = 0,
}: PathCardProps) {
  const isClient = type === 'client'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'card flex h-full flex-col p-6 md:p-8',
        isClient
          ? 'border-brand-200/80 ring-1 ring-brand-100'
          : 'border-emerald-200/80 ring-1 ring-emerald-100'
      )}
    >
      <div
        className={cn(
          'mb-4 inline-flex w-fit rounded-xl p-3',
          isClient ? 'bg-brand-50 text-brand-600' : 'bg-emerald-50 text-emerald-600'
        )}
      >
        {isClient ? (
          <HomeIcon className="h-7 w-7" aria-hidden />
        ) : (
          <UserPlusIcon className="h-7 w-7" aria-hidden />
        )}
      </div>

      <p
        className={cn(
          'text-xs font-semibold uppercase tracking-wider',
          isClient ? 'text-brand-600' : 'text-emerald-600'
        )}
      >
        {isClient ? 'Soy cliente' : 'Soy técnico'}
      </p>
      <h2 className="mt-1 font-display text-xl font-bold text-slate-900 md:text-2xl">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{subtitle}</p>

      <ul className="mt-5 flex-1 space-y-3">
        {benefits.map((item) => (
          <li key={item.text} className="flex items-start gap-3 text-sm text-slate-700">
            <item.icon
              className={cn(
                'mt-0.5 h-5 w-5 shrink-0',
                isClient ? 'text-brand-500' : 'text-emerald-500'
              )}
              aria-hidden
            />
            {item.text}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href={primaryHref}
          className={cn(
            'inline-flex w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all active:scale-[0.98]',
            isClient
              ? 'bg-brand-600 hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2'
              : 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2'
          )}
        >
          {primaryLabel}
        </Link>
        <Link
          href={secondaryHref}
          className={cn(
            'inline-flex w-full items-center justify-center rounded-xl border px-6 py-3 text-sm font-semibold transition-all active:scale-[0.98]',
            isClient
              ? 'border-brand-200 text-brand-700 hover:bg-brand-50'
              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
          )}
        >
          {secondaryLabel}
        </Link>
      </div>
    </motion.div>
  )
}

export default function HeroDualPath() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 bg-white">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-50" />
      <div className="container-page relative py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="badge mb-4">Dos caminos, una plataforma</span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
            ¿Necesitas un técnico o{' '}
            <span className="text-gradient">quieres trabajar</span> con nosotros?
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Elige tu perfil y empieza en segundos. Clientes y profesionales tienen el mismo protagonismo aquí.
          </p>
        </motion.div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2 md:gap-8">
          <PathCard
            type="client"
            title="Encuentra ayuda para tu hogar"
            subtitle="Conecta con técnicos verificados en electricidad, plomería, AA y más."
            benefits={clientBenefits}
            primaryHref="/solicitar"
            primaryLabel="Solicitar servicio"
            secondaryHref="/tecnicos"
            secondaryLabel="Buscar técnico"
            delay={0.1}
          />
          <PathCard
            type="technician"
            title="Recibe trabajos en tu zona"
            subtitle="Únete a la red de profesionales verificados y aumenta tus ingresos."
            benefits={technicianBenefits}
            primaryHref="/unete"
            primaryLabel="Únete como profesional"
            secondaryHref="/nosotros"
            secondaryLabel="Conocer la plataforma"
            delay={0.2}
          />
        </div>
      </div>
    </section>
  )
}
