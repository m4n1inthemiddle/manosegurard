'use client'
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import PageHero from '@/components/ui/PageHero'
import FadeIn from '@/components/ui/FadeIn'
import ServiceRequestMultiStepForm from '@/components/forms/ServiceRequestMultiStepForm'

function FormFallback() {
  return (
    <div className="card flex min-h-[320px] items-center justify-center p-10">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
    </div>
  )
}

export default function SolicitarPage() {
  return (
    <>
      <PageHero
        badge="Solicitud rápida"
        title="Solicitar servicio técnico"
        description="Completa los pasos en menos de 2 minutos. Te conectamos con el profesional ideal."
      />

      <section className="section-padding bg-white">
        <div className="container-page">
          <FadeIn className="mx-auto max-w-2xl">
            <Suspense fallback={<FormFallback />}>
              <ServiceRequestMultiStepForm />
            </Suspense>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
