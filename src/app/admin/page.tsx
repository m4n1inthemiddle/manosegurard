'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Technician, ServiceRequest, PendingTechnician } from '@/types'
import { PlusIcon, TrashIcon, XMarkIcon, LinkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { normalizePhoneForWhatsApp } from '@/lib/phone'
import { buildReviewUrl, buildReviewWhatsAppMessage, updateTechnicianAverageRating } from '@/lib/reviews'

interface AdminReview {
  id: number
  technician_id: number
  customer_name: string
  rating: number
  comment: string
  created_at?: string
  technicians?: { name: string } | null
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<'solicitudes' | 'tecnicos' | 'pendientes' | 'resenas'>('solicitudes')
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [pendingTechs, setPendingTechs] = useState<PendingTechnician[]>([])
  const [adminReviews, setAdminReviews] = useState<AdminReview[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [workPhotos, setWorkPhotos] = useState<Record<number, any[]>>({})
  const [uploadingFor, setUploadingFor] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [copiedLinkId, setCopiedLinkId] = useState<number | null>(null)

  useEffect(() => {
    const logged = localStorage.getItem('adminLoggedIn')
    if (logged === 'true') setIsLoggedIn(true)
  }, [])

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      setIsLoggedIn(true)
      localStorage.setItem('adminLoggedIn', 'true')
      setErrorMsg(null)
    } else {
      setErrorMsg('Contraseña incorrecta')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn')
    setIsLoggedIn(false)
    setRequests([])
    setTechnicians([])
    setPendingTechs([])
    setAdminReviews([])
  }

  const loadTechnicians = useCallback(async () => {
    const { data, error } = await supabase.from('technicians').select('*').order('name')
    if (error) {
      console.error(error)
      return
    }
    if (data) setTechnicians(data)
  }, [])

  const loadWorkPhotos = useCallback(async (techList: Technician[]) => {
    const photosMap: Record<number, any[]> = {}
    for (const tech of techList) {
      const { data: photos } = await supabase
        .from('work_photos')
        .select('*')
        .eq('technician_id', tech.id)
        .order('created_at', { ascending: false })
      if (photos) photosMap[tech.id] = photos
    }
    setWorkPhotos(photosMap)
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      if (activeTab === 'solicitudes') {
        const { data, error } = await supabase
          .from('service_requests')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        setRequests(data || [])
      } else if (activeTab === 'tecnicos') {
        const { data, error } = await supabase.from('technicians').select('*').order('name')
        if (error) throw error
        if (data) {
          setTechnicians(data)
          await loadWorkPhotos(data)
        }
      } else if (activeTab === 'pendientes') {
        const { data, error } = await supabase
          .from('pending_technicians')
          .select('*')
          .eq('status', 'pendiente')
          .order('created_at', { ascending: false })
        if (error) throw error
        setPendingTechs(data || [])
      } else if (activeTab === 'resenas') {
        const { data, error } = await supabase
          .from('reviews')
          .select('*, technicians(name)')
          .order('created_at', { ascending: false })
          .limit(50)
        if (error) throw error
        setAdminReviews((data as AdminReview[]) || [])
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos'
      setErrorMsg(message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [activeTab, loadTechnicians, loadWorkPhotos])

  useEffect(() => {
    if (isLoggedIn) {
      loadTechnicians()
      fetchData()
    }
  }, [isLoggedIn, activeTab, fetchData, loadTechnicians])

  const handleAssignTechnician = async (reqId: number, techIdStr: string) => {
    const techId = techIdStr ? parseInt(techIdStr, 10) : null
    const updates: { assigned_technician: number | null; status?: string } = {
      assigned_technician: techId,
    }
    if (techId) updates.status = 'asignado'

    const { error } = await supabase.from('service_requests').update(updates).eq('id', reqId)
    if (error) {
      alert('Error al asignar técnico: ' + error.message)
      return
    }

    setRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
              ...r,
              assigned_technician: techId ?? undefined,
              status: techId ? ('asignado' as const) : r.status,
            }
          : r
      )
    )
  }

  const handleStatusChange = async (req: ServiceRequest, newStatus: string) => {
    if (newStatus === 'completado') {
      if (!req.assigned_technician) {
        alert('Asigna un técnico a esta solicitud antes de marcarla como completada.')
        return
      }

      const phone = normalizePhoneForWhatsApp(req.phone)
      if (!phone) {
        alert('El teléfono del cliente no es válido. Verifica el número en la solicitud.')
        return
      }

      const message = buildReviewWhatsAppMessage(
        req.customer_name,
        req.assigned_technician,
        req.id
      )
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
    }

    const { error } = await supabase
      .from('service_requests')
      .update({ status: newStatus })
      .eq('id', req.id)

    if (error) {
      alert('Error al actualizar estado: ' + error.message)
      return
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: newStatus as ServiceRequest['status'] } : r))
    )
  }

  const copyReviewLink = async (req: ServiceRequest) => {
    if (!req.assigned_technician) {
      alert('Asigna un técnico primero para generar el enlace de calificación.')
      return
    }
    const url = buildReviewUrl(req.assigned_technician, req.id)
    try {
      await navigator.clipboard.writeText(url)
      setCopiedLinkId(req.id)
      setTimeout(() => setCopiedLinkId(null), 2000)
    } catch {
      prompt('Copia este enlace de calificación:', url)
    }
  }

  const approveTechnician = async (tech: PendingTechnician) => {
    const { error } = await supabase.from('technicians').insert([
      {
        name: tech.name,
        phone: tech.phone,
        category: tech.specialty,
        province: tech.province,
        sector: tech.sector,
        experience: tech.experience,
        photo: tech.photo_url,
        photo_url: tech.photo_url,
        certificates_url: tech.certificates_url,
        verified: true,
        approved: true,
        bio: tech.certifications || '',
        rating: 0,
      },
    ])
    if (error) {
      alert('Error al aprobar técnico: ' + error.message)
      return
    }
    await supabase.from('pending_technicians').update({ status: 'aprobado' }).eq('id', tech.id)
    await loadTechnicians()
    fetchData()
  }

  const uploadWorkPhoto = async (technicianId: number, file: File, captionText: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `work_${technicianId}_${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('work-photos').upload(fileName, file)
    if (uploadError) throw uploadError
    const { data: urlData } = supabase.storage.from('work-photos').getPublicUrl(fileName)
    const { error: insertError } = await supabase.from('work_photos').insert({
      technician_id: technicianId,
      image_url: urlData.publicUrl,
      caption: captionText || null,
    })
    if (insertError) throw insertError
    await loadTechnicians()
    const { data } = await supabase.from('technicians').select('*')
    if (data) await loadWorkPhotos(data)
  }

  const deleteWorkPhoto = async (photoId: number) => {
    if (!confirm('¿Eliminar esta foto?')) return
    const { error } = await supabase.from('work_photos').delete().eq('id', photoId)
    if (error) alert('Error al eliminar: ' + error.message)
    else fetchData()
  }

  const deleteReview = async (review: AdminReview) => {
    if (!confirm(`¿Eliminar la reseña de "${review.customer_name}"?\n\n"${review.comment.slice(0, 80)}${review.comment.length > 80 ? '…' : ''}"`)) {
      return
    }
    const { error } = await supabase.from('reviews').delete().eq('id', review.id)
    if (error) {
      alert('Error al eliminar reseña: ' + error.message)
      return
    }
    await updateTechnicianAverageRating(review.technician_id)
    setAdminReviews((prev) => prev.filter((r) => r.id !== review.id))
  }

  const deleteAllReviews = async () => {
    if (adminReviews.length === 0) return
    if (
      !confirm(
        `¿Eliminar las ${adminReviews.length} reseñas mostradas? Esta acción no se puede deshacer.`
      )
    ) {
      return
    }
    const techIds = [...new Set(adminReviews.map((r) => r.technician_id))]
    const { error } = await supabase
      .from('reviews')
      .delete()
      .in(
        'id',
        adminReviews.map((r) => r.id)
      )
    if (error) {
      alert('Error al eliminar reseñas: ' + error.message)
      return
    }
    for (const techId of techIds) {
      await updateTechnicianAverageRating(techId)
    }
    setAdminReviews([])
  }

  if (!isLoggedIn) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center py-20">
        <div className="card w-full max-w-md p-8">
          <h2 className="font-display mb-2 text-2xl font-bold text-slate-900">Panel de Administración</h2>
          <p className="mb-6 text-sm text-slate-500">Acceso restringido</p>
          {errorMsg && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {errorMsg}
            </p>
          )}
          <input
            type="password"
            placeholder="Contraseña"
            className="input-field mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} className="btn-primary w-full">
            Acceder
          </button>
        </div>
      </div>
    )
  }

  const tabClass = (tab: typeof activeTab) =>
    `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      activeTab === tab ? 'bg-brand-600 text-white shadow-soft' : 'text-slate-600 hover:bg-slate-100'
    }`

  const assignedTechName = (techId?: number) =>
    technicians.find((t) => t.id === techId)?.name || 'Sin asignar'

  return (
    <div className="container-page py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold text-slate-900">Panel de Administración</h1>
        <button
          onClick={handleLogout}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {errorMsg}
        </div>
      )}

      {loading && (
        <div className="mb-4 flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      )}

      <div className="mb-8 flex flex-wrap gap-2">
        <button onClick={() => setActiveTab('solicitudes')} className={tabClass('solicitudes')}>
          Solicitudes ({requests.length})
        </button>
        <button onClick={() => setActiveTab('tecnicos')} className={tabClass('tecnicos')}>
          Técnicos ({technicians.length})
        </button>
        <button onClick={() => setActiveTab('pendientes')} className={tabClass('pendientes')}>
          Pendientes ({pendingTechs.length})
        </button>
        <button onClick={() => setActiveTab('resenas')} className={tabClass('resenas')}>
          Reseñas ({adminReviews.length})
        </button>
      </div>

      {activeTab === 'solicitudes' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-center text-slate-500">No hay solicitudes aún.</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="card p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{req.customer_name}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          req.status === 'completado'
                            ? 'bg-emerald-100 text-emerald-700'
                            : req.status === 'asignado'
                              ? 'bg-brand-100 text-brand-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">Tel: {req.phone}</p>
                    <p className="text-sm text-slate-600">Servicio: {req.service_type}</p>
                    <p className="text-sm text-slate-600">Ciudad: {req.city}</p>
                    {req.description && (
                      <p className="text-sm text-slate-600">Descripción: {req.description}</p>
                    )}
                    <p className="mt-2 text-sm font-medium text-brand-600">
                      Técnico: {assignedTechName(req.assigned_technician)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:min-w-[280px]">
                    <div>
                      <label className="label-field text-xs">Asignar técnico</label>
                      <select
                        value={req.assigned_technician ?? ''}
                        onChange={(e) => handleAssignTechnician(req.id, e.target.value)}
                        className="input-field text-sm"
                      >
                        <option value="">Sin técnico</option>
                        {technicians
                          .filter((t) => t.approved)
                          .map((tech) => (
                            <option key={tech.id} value={tech.id}>
                              {tech.name} — {tech.category}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="label-field text-xs">Estado</label>
                      <select
                        value={req.status}
                        onChange={(e) => handleStatusChange(req, e.target.value)}
                        className="input-field text-sm"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="asignado">Asignado</option>
                        <option value="completado">Completado</option>
                      </select>
                    </div>
                    {req.assigned_technician && (
                      <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                        <p className="text-xs font-medium text-slate-500">Calificación del cliente</p>
                        <a
                          href={buildReviewUrl(req.assigned_technician, req.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                        >
                          <LinkIcon className="h-4 w-4" />
                          Abrir página de calificación
                        </a>
                        <button
                          type="button"
                          onClick={() => copyReviewLink(req)}
                          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
                        >
                          <ClipboardDocumentIcon className="h-4 w-4" />
                          {copiedLinkId === req.id ? '¡Enlace copiado!' : 'Copiar enlace'}
                        </button>
                        <p className="text-xs text-slate-400">
                          Al marcar &quot;Completado&quot; se abre WhatsApp con este enlace.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'tecnicos' && (
        <div className="space-y-8">
          {technicians.length === 0 ? (
            <p className="text-center text-slate-500">No hay técnicos aprobados aún.</p>
          ) : (
            technicians.map((tech) => {
              const photos = workPhotos[tech.id] || []
              return (
                <div key={tech.id} className="card p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{tech.name}</h3>
                      <p className="text-sm text-slate-600">
                        {tech.category} — {tech.province}
                        {tech.sector && ` (${tech.sector})`}
                      </p>
                      <p className="text-sm text-slate-600">
                        {tech.verified ? '✅ Verificado' : '⏳ No verificado'} · Rating:{' '}
                        {tech.rating || 'Sin reseñas'}
                      </p>
                      <a
                        href={buildReviewUrl(tech.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-sm text-brand-600 hover:underline"
                      >
                        Ver página de calificación →
                      </a>
                    </div>
                    <button
                      onClick={() => {
                        setUploadingFor(tech.id)
                        setSelectedFile(null)
                        setCaption('')
                        setShowUploadModal(true)
                      }}
                      className="btn-primary flex shrink-0 items-center gap-1 px-3 py-1.5 text-sm"
                    >
                      <PlusIcon className="h-4 w-4" /> Subir trabajo
                    </button>
                  </div>

                  {photos.length > 0 && (
                    <div className="mt-4">
                      <h4 className="mb-2 font-semibold text-slate-800">Trabajos realizados</h4>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {photos.map((photo) => (
                          <div key={photo.id} className="group relative">
                            <img
                              src={photo.image_url}
                              alt={photo.caption || 'Trabajo'}
                              className="h-32 w-full rounded-lg object-cover shadow"
                            />
                            {photo.caption && (
                              <p className="mt-1 text-xs text-slate-600">{photo.caption}</p>
                            )}
                            <button
                              onClick={() => deleteWorkPhoto(photo.id)}
                              className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition group-hover:opacity-100"
                              aria-label="Eliminar foto"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {activeTab === 'pendientes' && (
        <div className="grid gap-4">
          {pendingTechs.length === 0 ? (
            <p className="text-center text-slate-500">No hay solicitudes pendientes.</p>
          ) : (
            pendingTechs.map((tech) => (
              <div key={tech.id} className="card p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{tech.name}</h3>
                    <p className="text-sm">Especialidad: {tech.specialty}</p>
                    <p className="text-sm">Teléfono: {tech.phone}</p>
                    <p className="text-sm">
                      Ubicación: {tech.province} — {tech.sector}
                    </p>
                    <p className="text-sm">Experiencia: {tech.experience} años</p>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {tech.photo_url && (
                        <a
                          href={tech.photo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-brand-600 underline"
                        >
                          Ver foto
                        </a>
                      )}
                      {tech.certificates_url && (
                        <a
                          href={tech.certificates_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-brand-600 underline"
                        >
                          Ver certificado
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => approveTechnician(tech)}
                    className="h-fit shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Aprobar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'resenas' && (
        <div className="space-y-4">
          {adminReviews.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={deleteAllReviews}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                Eliminar todas las reseñas
              </button>
            </div>
          )}
          {adminReviews.length === 0 ? (
            <p className="text-center text-slate-500">Aún no hay reseñas registradas.</p>
          ) : (
            adminReviews.map((review) => (
              <div key={review.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{review.customer_name}</p>
                    <p className="text-sm text-brand-600">
                      Técnico: {review.technicians?.name || '—'}
                    </p>
                    {review.created_at && (
                      <p className="text-xs text-slate-400">
                        {new Date(review.created_at).toLocaleString('es-DO')}
                      </p>
                    )}
                    <p className="mt-1 text-amber-500">
                      {'★'.repeat(review.rating)}
                      <span className="sr-only">{review.rating} de 5</span>
                    </p>
                    <p className="mt-2 break-words text-slate-700">&ldquo;{review.comment}&rdquo;</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteReview(review)}
                    className="flex shrink-0 items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                    aria-label="Eliminar reseña"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">Subir foto de trabajo</h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                aria-label="Cerrar"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="input-field mb-4"
            />
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="input-field mb-4"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={async () => {
                if (!selectedFile || !uploadingFor) {
                  alert('Selecciona una imagen')
                  return
                }
                setUploading(true)
                try {
                  await uploadWorkPhoto(uploadingFor, selectedFile, caption)
                  setShowUploadModal(false)
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : 'Error al subir'
                  alert('Error al subir foto: ' + msg)
                } finally {
                  setUploading(false)
                }
              }}
              className="btn-primary w-full disabled:opacity-50"
            >
              {uploading ? 'Subiendo...' : 'Subir'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
