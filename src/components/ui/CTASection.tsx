'use client'

import Link from 'next/link'
interface CTASectionProps {
  title: string
  description: string
  primaryHref: string
  primaryLabel: string
  secondaryHref?: string
  secondaryLabel?: string
}

export default function CTASection({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: CTASectionProps) {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10" />
      <div className="container-page relative">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-lg text-brand-100">{description}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-brand-700 shadow-lg transition-all hover:bg-brand-50 hover:shadow-xl active:scale-[0.98]"
            >
              {primaryLabel}
            </Link>
            {secondaryHref && secondaryLabel && (
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center rounded-xl border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
