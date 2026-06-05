'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { parseRouteId } from '@/lib/parseRouteId'
import { updateTechnicianAverageRating } from '@/lib/reviews'
import PageHero from '@/components/ui/PageHero'
import FadeIn from '@/components/ui/FadeIn'
import SuccessMessage from '@/components/ui/SuccessMessage'
import { StarIcon } from '@heroicons/react/24/solid'
import { verifyCaptchaToken } from '@/lib/captcha'
import TurnstileField, { type TurnstileFieldHandle } from '@/components/TurnstileField'

function CalificarForm() {
  const params = useParams()
  const searchParams = useSearchParams()
  const technicianId = parseRouteId(params.id)
  const serviceRequestId = searchParams.get('solicitud')

  const [technician, setTechnician] = useState<{ id: number; name: string } | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileFieldHandle>(null)

  useEffect(() => {
    if (!technicianId) {
      setNotFound(true)
      setLoading(false)
      return
    }

    const fetchTechnician = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('technicians')
        .select('id, name, approved')
        .eq('id', technicianId)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else if (!data.approved) {
        setNotFound(true)
        setErrorMsg('Este técnico no está disponible para recibir calificaciones.')
      } else {
        setTechnician({ id: data.id, name: data.name })
      }
      setLoading(false)
    }

    fetchTechnician()
  }, [technicianId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!technicianId || !technician) return

    const name = customerName.trim()
    const text = comment.trim()
    if (!name || !text) {
      setErrorMsg('Completa tu nombre y el comentario.')
      return
    }
    if (rating < 1 || rating > 5) {
      setErrorMsg('Selecciona una calificación entre 1 y 5 estrellas.')
      return
    }

    const captcha = await verifyCaptchaToken(captchaToken)
    if (!captcha.ok) {
      setErrorMsg(captcha.message || 'Verificación requerida.')
      turnstileRef.current?.reset()
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    const reviewPayload: Record<string, unknown> = {
      technician_id: parseInt(technicianId, 10),
      customer_name: name,
      rating,
      comment: text,
    }

    if (serviceRequestId) {
      const reqId = parseInt(serviceRequestId, 10)
      if (!Number.isNaN(reqId)) {
        reviewPayload.service_request_id = reqId
      }
    }

    const { error } = await supabase.from('reviews').insert(reviewPayload)

    if (error) {
      const fallbackPayload = {
        technician_id: parseInt(technicianId, 10),
        customer_name: name,
        rating,
        comment: text,
      }
      const { error: retryError } = await supabase.from('reviews').insert(fallbackPayload)

      if (retryError) {
        setErrorMsg('No pudimos guardar tu reseña: ' + retryError.message)
        setSubmitting(false)
        turnstileRef.current?.reset()
        return
      }
    }

    await updateTechnicianAverageRating(parseInt(technicianId, 10))
    setSubmitted(true)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    )
  }

  if (notFound || !technician) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-slate-600">
          {errorMsg || 'Técnico no encontrado o enlace inválido.'}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Verifica el enlace que recibiste por WhatsApp o contacta a soporte.
        </p>
      </div>
    )
  }

  if (submitted) {
    return (
      <SuccessMessage
        title="¡Gracias por tu reseña!"
        description="Tu opinión ayuda a otros clientes y mejora la reputación del técnico en ManoSeguraRD."
      />
    )
  }

  return (
    <>
      <PageHero
        badge="Reseña"
        title={`Califica a ${technician.name}`}
        description="Cuéntanos cómo fue tu experiencia con el servicio recibido."
        centered
      />

      <section className="section-padding bg-white">
        <div className="container-page">
          <FadeIn className="mx-auto max-w-lg">
            <form onSubmit={handleSubmit} className="card p-8 md:p-10">
              {errorMsg && (
                <div
                  className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {errorMsg}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="label-field" htmlFor="customerName">
                    Tu nombre *
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    required
                    autoComplete="name"
                    className="input-field"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-field">Calificación *</label>
                  <div className="flex gap-2" role="group" aria-label="Calificación en estrellas">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="rounded-lg p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        aria-label={`${star} estrellas`}
                        aria-pressed={rating >= star}
                      >
                        <StarIcon
                          className={`h-10 w-10 ${rating >= star ? 'text-amber-400' : 'text-slate-200'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label-field" htmlFor="comment">
                    Comentario *
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    required
                    className="input-field resize-none"
                    placeholder="¿Qué tal fue el servicio? Cuéntanos tu experiencia..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <TurnstileField ref={turnstileRef} onTokenChange={setCaptchaToken} />
                <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50">
                  {submitting ? 'Enviando...' : 'Enviar reseña'}
                </button>
              </div>
            </form>
          </FadeIn>
        </div>
      </section>
    </>
  )
}

export default function CalificarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      }
    >
      <CalificarForm />
    </Suspense>
  )
}
