'use client'
export const dynamic = 'force-dynamic'

import { useState, useRef } from 'react'
import PageHero from '@/components/ui/PageHero'
import FadeIn from '@/components/ui/FadeIn'
import SuccessMessage from '@/components/ui/SuccessMessage'
import {
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { ADMIN_PHONE_DISPLAY, ADMIN_PHONE_TEL, buildAdminWhatsAppUrl } from '@/lib/contact'
import { verifyCaptchaToken } from '@/lib/captcha'
import TurnstileField, { type TurnstileFieldHandle } from '@/components/TurnstileField'

const contactInfo = [
  { icon: PhoneIcon, title: 'Teléfono', value: ADMIN_PHONE_DISPLAY, href: `tel:${ADMIN_PHONE_TEL}` },
  { icon: ChatBubbleLeftRightIcon, title: 'WhatsApp', value: ADMIN_PHONE_DISPLAY, href: buildAdminWhatsAppUrl() },
  { icon: EnvelopeIcon, title: 'Email', value: 'info@manosegurard.com', href: 'mailto:info@manosegurard.com' },
  { icon: ClockIcon, title: 'Horario', value: 'Lun–Dom: 8am – 8pm', href: undefined },
]

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: '',
  })
  const [enviado, setEnviado] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileFieldHandle>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const captcha = await verifyCaptchaToken(captchaToken)
    if (!captcha.ok) {
      setErrorMsg(captcha.message || 'Verificación requerida.')
      turnstileRef.current?.reset()
      return
    }

    const mensajeWhatsApp = `Hola, soy ${formData.nombre}. ${formData.mensaje}`
    window.location.href = buildAdminWhatsAppUrl(mensajeWhatsApp)
    setEnviado(true)
  }

  if (enviado) {
    return (
      <SuccessMessage
        title="¡Mensaje enviado!"
        description="Te contactaremos a la brevedad por WhatsApp."
      />
    )
  }

  return (
    <>
      <PageHero
        badge="Contacto"
        title="Estamos aquí para ayudarte"
        description="¿Tienes dudas o sugerencias? Escríbenos y te responderemos rápido."
      />

      <section className="section-padding bg-white">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
              {contactInfo.map((item, i) => (
                <FadeIn key={item.title} delay={i * 0.06}>
                  <div className="card p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="mt-1 text-sm text-brand-600 hover:text-brand-700"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-slate-600">{item.value}</p>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={0.15} className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="card p-8 md:p-10">
                <h2 className="font-display text-xl font-semibold text-slate-900">Envíanos un mensaje</h2>
                <p className="mt-2 text-sm text-slate-600">Te responderemos por WhatsApp lo antes posible.</p>

                <div className="mt-8 space-y-5">
                  {errorMsg && (
                    <div
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                      role="alert"
                    >
                      {errorMsg}
                    </div>
                  )}
                  <div>
                    <label className="label-field" htmlFor="nombre">
                      Nombre completo *
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      required
                      className="input-field"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label-field" htmlFor="email">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="input-field"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label-field" htmlFor="telefono">
                      Teléfono *
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      required
                      className="input-field"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label-field" htmlFor="mensaje">
                      Mensaje *
                    </label>
                    <textarea
                      id="mensaje"
                      rows={4}
                      required
                      className="input-field resize-none"
                      value={formData.mensaje}
                      onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    />
                  </div>
                  <TurnstileField ref={turnstileRef} onTokenChange={setCaptchaToken} />
                  <button type="submit" className="btn-primary w-full">
                    Enviar mensaje
                  </button>
                </div>
              </form>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  )
}
