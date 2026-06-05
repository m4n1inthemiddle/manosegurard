'use client'

import FadeIn from './FadeIn'
import { ReactNode } from 'react'

interface PageHeroProps {
  badge?: string
  title: string
  description?: string
  children?: ReactNode
  centered?: boolean
}

export default function PageHero({
  badge,
  title,
  description,
  children,
  centered = true,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 bg-white">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40" />
      <div className={`container-page relative py-16 md:py-24 ${centered ? 'text-center' : ''}`}>
        <FadeIn>
          {badge && <span className="badge mb-4">{badge}</span>}
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description && (
            <p className={`mt-4 max-w-2xl text-lg text-slate-600 ${centered ? 'mx-auto' : ''}`}>
              {description}
            </p>
          )}
          {children && <div className={`mt-8 ${centered ? 'flex justify-center' : ''}`}>{children}</div>}
        </FadeIn>
      </div>
    </section>
  )
}
