'use client'
export const dynamic = 'force-dynamic'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import PageHero from '@/components/ui/PageHero'
import FadeIn from '@/components/ui/FadeIn'
import SuccessMessage from '@/components/ui/SuccessMessage'
import { serviceOptions } from '@/lib/categories'
import {
  ChartBarIcon,
  UserGroupIcon,
  StarIcon,
  LifebuoyIcon,
} from '@heroicons/react/24/outline'
import { verifyCaptchaToken } from '@/lib/captcha'
import TurnstileField, { type TurnstileFieldHandle } from '@/components/TurnstileField'

const dominicanProvinces = [
  'Distrito Nacional', 'Santo Domingo', 'Santiago', 'La Altagracia', 'La Romana',
  'San Cristóbal', 'Puerto Plata', 'San Pedro de Macorís', 'Duarte', 'Espaillat',
  'La Vega', 'Valverde', 'Barahona', 'Azua', 'Peravia', 'Monseñor Nouel',
  'Sánchez Ramírez', 'María Trinidad Sánchez', 'Samana', 'El Seibo', 'Hato Mayor',
  'Monte Plata', 'San Juan', 'Elías Piña', 'Dajabón', 'Santiago Rodríguez',
  'Monte Cristi', 'Bahoruco', 'Independencia', 'Pedernales',
]

const sectorsByProvince: Record<string, string[]> = {
  'Distrito Nacional': ['Gazcue', 'Naco', 'Piantini', 'Los Cacicazgos', 'Ciudad Colonial', 'Bella Vista', 'El Millón'],
  'Santo Domingo': ['Santo Domingo Este', 'Santo Domingo Norte', 'Santo Domingo Oeste', 'Los Alcarrizos', 'Boca Chica'],
  'Santiago': ['Santiago de los Caballeros', 'Los Jardines', 'Pontezuela', 'La Herradura', 'Gurabo', 'Villa González'],
  'La Altagracia': ['Punta Cana', 'Bávaro', 'Verón', 'Higüey'],
  'La Romana': ['La Romana', 'Callejón', 'Villa Hermosa'],
  'Puerto Plata': ['Puerto Plata', 'Sosúa', 'Cabarete', 'Maimón', 'Costambar'],
}

const benefits = [
  { icon: ChartBarIcon, title: 'Más visibilidad', desc: 'Aparece en las primeras búsquedas de tu zona' },
  { icon: UserGroupIcon, title: 'Clientes constantes', desc: 'Recibe solicitudes regularmente' },
  { icon: StarIcon, title: 'Reputación online', desc: 'Construye credibilidad con reseñas reales' },
  { icon: LifebuoyIcon, title: 'Soporte 24/7', desc: 'Te ayudamos en todo momento' },
]

export default function UnetePage() {
  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    telefono: '',
    provincia: '',
    sector: '',
    experiencia: '',
    certificaciones: '',
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [certFile, setCertFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileFieldHandle>(null)

  const availableSectors = sectorsByProvince[formData.provincia] || []

  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}_${Math.random()}.${fileExt}`
    const { error } = await supabase.storage.from(bucket).upload(fileName, file)
    if (error) {
      console.error('Error subiendo archivo:', error)
      return null
    }
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    const captcha = await verifyCaptchaToken(captchaToken)
    if (!captcha.ok) {
      setErrorMsg(captcha.message || 'Verificación requerida.')
      turnstileRef.current?.reset()
      return
    }

    setLoading(true)

    try {
      let photoUrl = ''
      if (photoFile) {
        const url = await uploadFile(photoFile, 'technician-photos', 'photos')
        if (url) photoUrl = url
      }

      let certUrl = ''
      if (certFile) {
        const url = await uploadFile(certFile, 'technician-certificates', 'certificates')
        if (url) certUrl = url
      }

      const { error } = await supabase.from('pending_technicians').insert([
        {
          name: formData.nombre,
          specialty: formData.especialidad,
          phone: formData.telefono,
          province: formData.provincia,
          sector: formData.sector,
          experience: parseInt(formData.experiencia),
          photo_url: photoUrl,
          certificates_url: certUrl,
          certifications: formData.certificaciones,
          status: 'pendiente',
        },
      ])

      if (error) throw error
      setSubmitted(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al enviar solicitud'
      setErrorMsg(message)
      turnstileRef.current?.reset()
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <SuccessMessage
        title="¡Gracias por tu interés!"
        description="Hemos recibido tu solicitud. Un asesor se contactará contigo pronto para verificar tus credenciales."
      />
    )
  }

  return (
    <>
      <PageHero
        badge="Únete"
        title="Consigue más clientes con ManoSeguraRD"
        description="Únete a nuestra red de técnicos verificados y aumenta tus ingresos con visibilidad profesional."
      />

      <section className="section-padding bg-surface-muted">
        <div className="container-page">
          <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => (
              <FadeIn key={b.title} delay={i * 0.06}>
                <div className="card p-5">
                  <b.icon className="mb-3 h-8 w-8 text-brand-600" />
                  <h3 className="font-semibold text-slate-900">{b.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{b.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="mx-auto max-w-2xl">
            <form onSubmit={handleSubmit} className="card p-8 md:p-10">
              <div className="space-y-5">
                <div>
                  <label className="label-field">Nombre completo *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-field">Especialidad *</label>
                  <select
                    required
                    className="input-field"
                    value={formData.especialidad}
                    onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                  >
                    <option value="">Selecciona tu especialidad</option>
                    {serviceOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-field">Teléfono *</label>
                  <input
                    type="tel"
                    required
                    className="input-field"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="label-field">Provincia *</label>
                    <select
                      required
                      className="input-field"
                      value={formData.provincia}
                      onChange={(e) =>
                        setFormData({ ...formData, provincia: e.target.value, sector: '' })
                      }
                    >
                      <option value="">Selecciona provincia</option>
                      {dominicanProvinces.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-field">Sector *</label>
                    <select
                      required
                      className="input-field"
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      disabled={!formData.provincia}
                    >
                      <option value="">Selecciona sector</option>
                      {availableSectors.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label-field">Años de experiencia *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    className="input-field"
                    value={formData.experiencia}
                    onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-field">Foto de perfil</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="input-field file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />
                  <p className="mt-1 text-xs text-slate-500">JPG, PNG o GIF. Máx 5MB.</p>
                </div>
                <div>
                  <label className="label-field">Certificaciones (PDF o imagen)</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="input-field file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700"
                    onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div>
                  <label className="label-field">Descripción adicional (opcional)</label>
                  <textarea
                    rows={3}
                    className="input-field resize-none"
                    value={formData.certificaciones}
                    onChange={(e) => setFormData({ ...formData, certificaciones: e.target.value })}
                  />
                </div>
                {errorMsg && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {errorMsg}
                  </div>
                )}
                <TurnstileField ref={turnstileRef} onTokenChange={setCaptchaToken} />
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </div>
            </form>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
