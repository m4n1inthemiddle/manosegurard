'use client'

import { useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import { serviceOptions } from '@/lib/categories'
import { serviceCities } from '@/lib/locations'
import MultiStepProgress from '@/components/ui/MultiStepProgress'
import SuccessMessage from '@/components/ui/SuccessMessage'
import { cn } from '@/lib/utils'
import { buildAdminWhatsAppUrl } from '@/lib/contact'
import { verifyCaptchaToken } from '@/lib/captcha'
import TurnstileField, { type TurnstileFieldHandle } from '@/components/TurnstileField'

const STEP_LABELS = ['Servicio', 'Ubicación', 'Detalle', 'Contacto', 'Confirmar']
const TOTAL_STEPS = 5

export interface ServiceRequestFormData {
  servicio: string
  ciudad: string
  descripcion: string
  nombre: string
  telefono: string
}

const initialFormData: ServiceRequestFormData = {
  servicio: '',
  ciudad: '',
  descripcion: '',
  nombre: '',
  telefono: '',
}

const stepVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

function validateStep(step: number, data: ServiceRequestFormData): string | null {
  switch (step) {
    case 1:
      return data.servicio ? null : 'Selecciona el tipo de servicio que necesitas.'
    case 2:
      return data.ciudad ? null : 'Indica tu ciudad o zona.'
    case 3:
      return null
    case 4:
      if (!data.nombre.trim()) return 'Ingresa tu nombre completo.'
      if (!data.telefono.trim()) return 'Ingresa un número de teléfono.'
      if (data.telefono.replace(/\D/g, '').length < 10) {
        return 'El teléfono debe tener al menos 10 dígitos.'
      }
      return null
    default:
      return null
  }
}

export default function ServiceRequestMultiStepForm() {
  const searchParams = useSearchParams()
  const servicioParam = searchParams.get('servicio') || ''

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ServiceRequestFormData>(() => ({
    ...initialFormData,
    servicio: servicioParam
      ? serviceOptions.find(
          (o) => o.toLowerCase() === servicioParam.toLowerCase() || o.includes(servicioParam)
        ) || servicioParam
      : '',
  }))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileFieldHandle>(null)

  const updateField = useCallback(
    <K extends keyof ServiceRequestFormData>(key: K, value: ServiceRequestFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }))
      setError(null)
    },
    []
  )

  const goNext = () => {
    const validationError = validateStep(currentStep, formData)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  const goPrev = () => {
    setError(null)
    setCurrentStep((s) => Math.max(s - 1, 1))
  }

  const handleSubmit = async () => {
    const validationError = validateStep(4, formData)
    if (validationError) {
      setError(validationError)
      setCurrentStep(4)
      return
    }

    const captcha = await verifyCaptchaToken(captchaToken)
    if (!captcha.ok) {
      setError(captcha.message || 'Verificación requerida.')
      turnstileRef.current?.reset()
      return
    }

    setSubmitting(true)
    setError(null)

    const { error: insertError } = await supabase.from('service_requests').insert([
      {
        customer_name: formData.nombre.trim(),
        phone: formData.telefono.trim(),
        city: formData.ciudad,
        service_type: formData.servicio,
        description: formData.descripcion.trim(),
        status: 'pendiente',
      },
    ])

    setSubmitting(false)

    if (insertError) {
      setError('No pudimos enviar tu solicitud. Intenta de nuevo o contáctanos por WhatsApp.')
      turnstileRef.current?.reset()
      return
    }

    setSubmitted(true)
    setTimeout(() => {
      window.location.href = buildAdminWhatsAppUrl(
        `Solicitud de servicio: ${formData.nombre} necesita ${formData.servicio} en ${formData.ciudad}`
      )
    }, 2000)
  }

  if (submitted) {
    return (
      <SuccessMessage
        title="¡Solicitud recibida!"
        description="Recibimos tu solicitud. Te contactaremos en minutos por WhatsApp. Redirigiendo..."
      />
    )
  }

  return (
    <div className="card p-6 md:p-10">
      <MultiStepProgress
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        labels={STEP_LABELS}
      />

      {error && (
        <div
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="min-h-[220px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {currentStep === 1 && (
              <fieldset>
                <legend className="font-display text-lg font-semibold text-slate-900">
                  ¿Qué servicio necesitas?
                </legend>
                <p className="mt-1 text-sm text-slate-600">
                  Elige la especialidad para conectarte con el técnico adecuado.
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {serviceOptions.map((opt) => (
                    <label
                      key={opt}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all',
                        formData.servicio === opt
                          ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:border-brand-200 hover:bg-slate-50'
                      )}
                    >
                      <input
                        type="radio"
                        name="servicio"
                        value={opt}
                        checked={formData.servicio === opt}
                        onChange={() => updateField('servicio', opt)}
                        className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm font-medium text-slate-800">{opt}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {currentStep === 2 && (
              <fieldset>
                <legend className="font-display text-lg font-semibold text-slate-900">
                  ¿Dónde necesitas el servicio?
                </legend>
                <p className="mt-1 text-sm text-slate-600">
                  Indica tu ciudad para asignarte un técnico cercano.
                </p>
                <div className="mt-5">
                  <label className="label-field" htmlFor="ciudad">
                    Ciudad o zona *
                  </label>
                  <select
                    id="ciudad"
                    className="input-field"
                    value={formData.ciudad}
                    onChange={(e) => updateField('ciudad', e.target.value)}
                  >
                    <option value="">Selecciona tu ciudad</option>
                    {serviceCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </fieldset>
            )}

            {currentStep === 3 && (
              <fieldset>
                <legend className="font-display text-lg font-semibold text-slate-900">
                  Cuéntanos el problema
                </legend>
                <p className="mt-1 text-sm text-slate-600">
                  Mientras más detalle nos des, mejor podremos ayudarte. (Opcional)
                </p>
                <div className="mt-5">
                  <label className="label-field" htmlFor="descripcion">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    rows={5}
                    className="input-field resize-none"
                    placeholder="Ej: Fuga en el baño, necesito revisión urgente..."
                    value={formData.descripcion}
                    onChange={(e) => updateField('descripcion', e.target.value)}
                  />
                </div>
              </fieldset>
            )}

            {currentStep === 4 && (
              <fieldset>
                <legend className="font-display text-lg font-semibold text-slate-900">
                  ¿Cómo te contactamos?
                </legend>
                <p className="mt-1 text-sm text-slate-600">
                  Te escribiremos por WhatsApp en minutos.
                </p>
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="label-field" htmlFor="nombre">
                      Nombre completo *
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      autoComplete="name"
                      className="input-field"
                      value={formData.nombre}
                      onChange={(e) => updateField('nombre', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-field" htmlFor="telefono">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      autoComplete="tel"
                      className="input-field"
                      placeholder="809-000-0000"
                      value={formData.telefono}
                      onChange={(e) => updateField('telefono', e.target.value)}
                    />
                  </div>
                </div>
              </fieldset>
            )}

            {currentStep === 5 && (
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-900">
                  Revisa tu solicitud
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Confirma que todo esté correcto antes de enviar.
                </p>
                <dl className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {[
                    { label: 'Servicio', value: formData.servicio },
                    { label: 'Ubicación', value: formData.ciudad },
                    {
                      label: 'Descripción',
                      value: formData.descripcion || 'Sin descripción adicional',
                    },
                    { label: 'Nombre', value: formData.nombre },
                    { label: 'Teléfono', value: formData.telefono },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between gap-4 px-4 py-3 text-sm">
                      <dt className="font-medium text-slate-500">{row.label}</dt>
                      <dd className="text-right font-medium text-slate-900">{row.value}</dd>
                    </div>
                  ))}
                </dl>
                {currentStep === TOTAL_STEPS && (
                  <TurnstileField
                    ref={turnstileRef}
                    className="mt-6"
                    onTokenChange={setCaptchaToken}
                  />
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentStep === 1}
          className={cn(
            'btn-secondary w-full sm:w-auto',
            currentStep === 1 && 'pointer-events-none opacity-40'
          )}
        >
          Anterior
        </button>

        {currentStep < TOTAL_STEPS ? (
          <button type="button" onClick={goNext} className="btn-primary w-full sm:w-auto">
            Siguiente
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full sm:w-auto disabled:opacity-50"
          >
            {submitting ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        )}
      </div>
    </div>
  )
}
