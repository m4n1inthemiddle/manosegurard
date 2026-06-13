'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Technician, ServiceRequest, PendingTechnician } from '@/types'
import {
  PlusIcon, TrashIcon, XMarkIcon, LinkIcon,
  ClipboardDocumentIcon, PencilSquareIcon, CheckIcon,
} from '@heroicons/react/24/outline'
import { normalizePhoneForWhatsApp } from '@/lib/phone'
import { buildReviewUrl, buildReviewWhatsAppMessage, updateTechnicianAverageRating } from '@/lib/reviews'

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface AdminReview {
  id: number
  technician_id: number
  customer_name: string
  rating: number
  comment: string
  created_at?: string
  technicians?: { name: string } | null
}

interface EditingTech {
  id: number
  name: string
  phone: string
  category: string
  province: string
  sector: string
  experience: number
  bio: string
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function AdminPage() {
  // ── Auth — NO usa localStorage; siempre pide contraseña al entrar ──────────
  const [isLoggedIn, setIsLoggedIn]     = useState(false)
  const [password, setPassword]         = useState('')
  const [authError, setAuthError]       = useState<string | null>(null)

  // ── Tabs & data ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]       = useState<'solicitudes' | 'tecnicos' | 'pendientes' | 'resenas'>('solicitudes')
  const [requests, setRequests]         = useState<ServiceRequest[]>([])
  const [technicians, setTechnicians]   = useState<Technician[]>([])
  const [pendingTechs, setPendingTechs] = useState<PendingTechnician[]>([])
  const [adminReviews, setAdminReviews] = useState<AdminReview[]>([])
  const [loading, setLoading]           = useState(false)
  const [errorMsg, setErrorMsg]         = useState<string | null>(null)

  // ── Work photos ─────────────────────────────────────────────────────────────
  const [workPhotos, setWorkPhotos]         = useState<Record<number, any[]>>({})
  const [uploadingFor, setUploadingFor]     = useState<number | null>(null)
  const [selectedFile, setSelectedFile]     = useState<File | null>(null)
  const [caption, setCaption]               = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading]           = useState(false)

  // ── Review links ─────────────────────────────────────────────────────────────
  const [copiedLinkId, setCopiedLinkId] = useState<number | null>(null)

  // ── Technician editing ───────────────────────────────────────────────────────
  const [editingTech, setEditingTech]   = useState<EditingTech | null>(null)
  const [savingEdit, setSavingEdit]     = useState(false)

  /* ── Login ───────────────────────────────────────────────────────────────── */
  const handleLogin = () => {
    const correct = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
    if (password === correct) {
      setIsLoggedIn(true)
      setAuthError(null)
    } else {
      setAuthError('Contraseña incorrecta')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setPassword('')
    setRequests([])
    setTechnicians([])
    setPendingTechs([])
    setAdminReviews([])
  }

  /* ── Data loaders ────────────────────────────────────────────────────────── */
  const loadTechnicians = useCallback(async () => {
    const { data, error } = await supabase.from('technicians').select('*').order('name')
    if (!error && data) setTechnicians(data)
  }, [])

  const loadWorkPhotos = useCallback(async (techList: Technician[]) => {
    const map: Record<number, any[]> = {}
    for (const tech of techList) {
      const { data } = await supabase
        .from('work_photos').select('*')
        .eq('technician_id', tech.id)
        .order('created_at', { ascending: false })
      if (data) map[tech.id] = data
    }
    setWorkPhotos(map)
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      if (activeTab === 'solicitudes') {
        const { data, error } = await supabase
          .from('service_requests').select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        setRequests(data || [])
      } else if (activeTab === 'tecnicos') {
        const { data, error } = await supabase.from('technicians').select('*').order('name')
        if (error) throw error
        if (data) { setTechnicians(data); await loadWorkPhotos(data) }
      } else if (activeTab === 'pendientes') {
        const { data, error } = await supabase
          .from('pending_technicians').select('*')
          .eq('status', 'pendiente')
          .order('created_at', { ascending: false })
        if (error) throw error
        setPendingTechs(data || [])
      } else if (activeTab === 'resenas') {
        const { data, error } = await supabase
          .from('reviews').select('*, technicians(name)')
          .order('created_at', { ascending: false }).limit(50)
        if (error) throw error
        setAdminReviews((data as AdminReview[]) || [])
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [activeTab, loadWorkPhotos])

  useEffect(() => {
    if (isLoggedIn) { loadTechnicians(); fetchData() }
  }, [isLoggedIn, activeTab, fetchData, loadTechnicians])

  /* ── Solicitudes handlers ────────────────────────────────────────────────── */
  const handleAssignTechnician = async (reqId: number, techIdStr: string) => {
    const techId = techIdStr ? parseInt(techIdStr, 10) : null
    const updates: { assigned_technician: number | null; status?: string } = { assigned_technician: techId }
    if (techId) updates.status = 'asignado'
    const { error } = await supabase.from('service_requests').update(updates).eq('id', reqId)
    if (error) { alert('Error: ' + error.message); return }
    setRequests(prev => prev.map(r =>
      r.id === reqId ? { ...r, assigned_technician: techId ?? undefined, status: techId ? 'asignado' as const : r.status } : r
    ))
  }

  const handleStatusChange = async (req: ServiceRequest, newStatus: string) => {
    if (newStatus === 'completado') {
      if (!req.assigned_technician) { alert('Asigna un técnico primero.'); return }
      const phone = normalizePhoneForWhatsApp(req.phone)
      if (!phone) { alert('Teléfono del cliente no válido.'); return }
      const msg = buildReviewWhatsAppMessage(req.customer_name, req.assigned_technician, req.id)
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
    }
    const { error } = await supabase.from('service_requests').update({ status: newStatus }).eq('id', req.id)
    if (error) { alert('Error: ' + error.message); return }
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: newStatus as ServiceRequest['status'] } : r))
  }

  const copyReviewLink = async (req: ServiceRequest) => {
    if (!req.assigned_technician) { alert('Asigna un técnico primero.'); return }
    const url = buildReviewUrl(req.assigned_technician, req.id)
    try {
      await navigator.clipboard.writeText(url)
      setCopiedLinkId(req.id)
      setTimeout(() => setCopiedLinkId(null), 2000)
    } catch { prompt('Copia este enlace:', url) }
  }

  /* ── Pending technicians ─────────────────────────────────────────────────── */
  const approveTechnician = async (tech: PendingTechnician) => {
    const { error } = await supabase.from('technicians').insert([{
      name: tech.name, phone: tech.phone, category: tech.specialty,
      province: tech.province, sector: tech.sector, experience: tech.experience,
      photo: tech.photo_url, photo_url: tech.photo_url,
      certificates_url: tech.certificates_url, verified: true, approved: true,
      bio: tech.certifications || '', rating: 0,
    }])
    if (error) { alert('Error: ' + error.message); return }
    await supabase.from('pending_technicians').update({ status: 'aprobado' }).eq('id', tech.id)
    await loadTechnicians()
    fetchData()
  }

  /* ── Technician management ───────────────────────────────────────────────── */
  const startEdit = (tech: Technician) => {
    setEditingTech({
      id: tech.id,
      name: tech.name || '',
      phone: tech.phone || '',
      category: tech.category || '',
      province: tech.province || '',
      sector: tech.sector || '',
      experience: tech.experience || 0,
      bio: tech.bio || '',
    })
  }

  const saveEdit = async () => {
    if (!editingTech) return
    setSavingEdit(true)
    const { error } = await supabase.from('technicians').update({
      name:       editingTech.name,
      phone:      editingTech.phone,
      category:   editingTech.category,
      province:   editingTech.province,
      sector:     editingTech.sector,
      experience: editingTech.experience,
      bio:        editingTech.bio,
    }).eq('id', editingTech.id)
    setSavingEdit(false)
    if (error) { alert('Error al guardar: ' + error.message); return }
    setEditingTech(null)
    fetchData()
  }

  const toggleApproval = async (tech: Technician) => {
    const newVal = !tech.approved
    const label  = newVal ? 'activar' : 'desactivar'
    if (!confirm(`¿${label.charAt(0).toUpperCase() + label.slice(1)} a ${tech.name}?`)) return
    const { error } = await supabase.from('technicians').update({ approved: newVal }).eq('id', tech.id)
    if (error) { alert('Error: ' + error.message); return }
    setTechnicians(prev => prev.map(t => t.id === tech.id ? { ...t, approved: newVal } : t))
  }

  const deleteTechnician = async (tech: Technician) => {
    if (!confirm(`⚠️ ¿Eliminar permanentemente a ${tech.name}?\nEsta acción no se puede deshacer.`)) return
    const { error } = await supabase.from('technicians').delete().eq('id', tech.id)
    if (error) { alert('Error: ' + error.message); return }
    setTechnicians(prev => prev.filter(t => t.id !== tech.id))
  }

  /* ── Work photos ─────────────────────────────────────────────────────────── */
  const uploadWorkPhoto = async (technicianId: number, file: File, captionText: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `work_${technicianId}_${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('work-photos').upload(fileName, file)
    if (uploadError) throw uploadError
    const { data: urlData } = supabase.storage.from('work-photos').getPublicUrl(fileName)
    const { error: insertError } = await supabase.from('work_photos').insert({
      technician_id: technicianId, image_url: urlData.publicUrl, caption: captionText || null,
    })
    if (insertError) throw insertError
    const { data } = await supabase.from('technicians').select('*')
    if (data) await loadWorkPhotos(data)
  }

  const deleteWorkPhoto = async (photoId: number) => {
    if (!confirm('¿Eliminar esta foto?')) return
    const { error } = await supabase.from('work_photos').delete().eq('id', photoId)
    if (error) alert('Error: ' + error.message)
    else fetchData()
  }

  /* ── Reviews ─────────────────────────────────────────────────────────────── */
  const deleteReview = async (review: AdminReview) => {
    if (!confirm(`¿Eliminar la reseña de "${review.customer_name}"?`)) return
    const { error } = await supabase.from('reviews').delete().eq('id', review.id)
    if (error) { alert('Error: ' + error.message); return }
    await updateTechnicianAverageRating(review.technician_id)
    setAdminReviews(prev => prev.filter(r => r.id !== review.id))
  }

  const deleteAllReviews = async () => {
    if (adminReviews.length === 0) return
    if (!confirm(`¿Eliminar las ${adminReviews.length} reseñas? Esta acción no se puede deshacer.`)) return
    const techIds = [...new Set(adminReviews.map(r => r.technician_id))]
    const { error } = await supabase.from('reviews').delete().in('id', adminReviews.map(r => r.id))
    if (error) { alert('Error: ' + error.message); return }
    for (const techId of techIds) await updateTechnicianAverageRating(techId)
    setAdminReviews([])
  }

  /* ── Helpers ─────────────────────────────────────────────────────────────── */
  const tabClass = (tab: typeof activeTab) =>
    `rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
      activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
    }`

  const assignedTechName = (techId?: number) =>
    technicians.find(t => t.id === techId)?.name || 'Sin asignar'

  /* ══════════════════════════════════════════════════════════════════════════
     LOGIN SCREEN — siempre se muestra al entrar, sin persistencia en storage
  ══════════════════════════════════════════════════════════════════════════ */
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
        <div className="w-full max-w-sm">
          {/* Logo / header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>
              Panel Admin
            </h1>
            <p className="mt-1 text-sm text-slate-500">ManoSeguraRD — Acceso restringido</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            {authError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 border border-red-200">
                <span>⚠️</span> {authError}
              </div>
            )}

            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="mb-5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm
                         outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoFocus
            />
            <button
              onClick={handleLogin}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white
                         hover:bg-blue-700 transition-all shadow-[0_4px_14px_rgba(37,99,235,0.35)]
                         hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)] hover:-translate-y-0.5"
            >
              Acceder al panel
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════════════════════
     MAIN PANEL
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>
              Panel de Administración
            </h1>
            <p className="text-xs text-slate-400">ManoSeguraRD</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600
                       hover:bg-red-50 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {errorMsg && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-7 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {([
            { tab: 'solicitudes', label: 'Solicitudes', count: requests.length },
            { tab: 'tecnicos',    label: 'Técnicos',    count: technicians.length },
            { tab: 'pendientes',  label: 'Pendientes',  count: pendingTechs.length },
            { tab: 'resenas',     label: 'Reseñas',     count: adminReviews.length },
          ] as const).map(({ tab, label, count }) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={tabClass(tab)}>
              {label}
              {count > 0 && (
                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-bold
                  ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        )}

        {/* ── SOLICITUDES ─────────────────────────────────────────────────── */}
        {!loading && activeTab === 'solicitudes' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
                No hay solicitudes aún.
              </div>
            ) : (
              requests.map(req => (
                <div key={req.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">{req.customer_name}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          req.status === 'completado' ? 'bg-emerald-100 text-emerald-700' :
                          req.status === 'asignado'   ? 'bg-blue-100 text-blue-700' :
                                                        'bg-amber-100 text-amber-700'
                        }`}>{req.status}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">Tel: {req.phone}</p>
                      <p className="text-sm text-slate-500">Servicio: {req.service_type}</p>
                      <p className="text-sm text-slate-500">Ciudad: {req.city}</p>
                      {req.description && <p className="text-sm text-slate-500">Desc: {req.description}</p>}
                      <p className="mt-2 text-sm font-semibold text-blue-600">
                        Técnico: {assignedTechName(req.assigned_technician)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:min-w-[280px]">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">Asignar técnico</label>
                        <select
                          value={req.assigned_technician ?? ''}
                          onChange={e => handleAssignTechnician(req.id, e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                          <option value="">Sin técnico</option>
                          {technicians.filter(t => t.approved).map(tech => (
                            <option key={tech.id} value={tech.id}>{tech.name} — {tech.category}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">Estado</label>
                        <select
                          value={req.status}
                          onChange={e => handleStatusChange(req, e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="asignado">Asignado</option>
                          <option value="completado">Completado</option>
                        </select>
                      </div>
                      {req.assigned_technician && (
                        <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                          <p className="text-xs font-semibold text-slate-400">Calificación del cliente</p>
                          <a href={buildReviewUrl(req.assigned_technician, req.id)} target="_blank" rel="noopener noreferrer"
                             className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                            <LinkIcon className="h-4 w-4" /> Abrir calificación
                          </a>
                          <button type="button" onClick={() => copyReviewLink(req)}
                                  className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
                            <ClipboardDocumentIcon className="h-4 w-4" />
                            {copiedLinkId === req.id ? '¡Enlace copiado!' : 'Copiar enlace'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TÉCNICOS ────────────────────────────────────────────────────── */}
        {!loading && activeTab === 'tecnicos' && (
          <div className="space-y-5">
            {technicians.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
                No hay técnicos aprobados aún.
              </div>
            ) : (
              technicians.map(tech => {
                const photos    = workPhotos[tech.id] || []
                const isEditing = editingTech?.id === tech.id

                return (
                  <div key={tech.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    {/* Header row */}
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">

                        {/* Top: foto + info principal */}
                        <div className="flex items-start gap-4 mb-3">
                          {/* Foto de perfil */}
                          {(tech.photo_url || tech.photo) ? (
                            <a href={tech.photo_url || tech.photo} target="_blank" rel="noopener noreferrer"
                               title="Ver foto completa">
                              <img
                                src={tech.photo_url || tech.photo}
                                alt={tech.name}
                                className="h-20 w-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm flex-shrink-0 hover:opacity-90 transition"
                              />
                            </a>
                          ) : (
                            <div className="h-20 w-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200
                                            flex items-center justify-center flex-shrink-0">
                              <span className="text-3xl text-slate-300">👤</span>
                            </div>
                          )}

                          <div className="min-w-0">
                            {/* Nombre + badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-slate-900">{tech.name}</h3>
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                tech.approved
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                {tech.approved ? 'Activo' : 'Inactivo'}
                              </span>
                              {tech.verified && (
                                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                                  ✓ Verificado
                                </span>
                              )}
                            </div>

                            {/* Info rápida */}
                            <p className="text-sm text-slate-500 mb-0.5">
                              {tech.category} · {tech.province}{tech.sector ? ` (${tech.sector})` : ''} · ⭐ {tech.rating || 'Sin reseñas'}
                            </p>
                            <p className="text-xs text-slate-400">ID #{tech.id}</p>
                            <a href={buildReviewUrl(tech.id)} target="_blank" rel="noopener noreferrer"
                               className="mt-0.5 inline-block text-xs text-blue-600 hover:underline">
                              Ver página de calificación →
                            </a>
                          </div>
                        </div>

                        {/* Detalles completos */}
                        <div className="grid grid-cols-1 gap-y-1.5 gap-x-6 sm:grid-cols-2 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 mb-2">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="text-slate-400">📞</span>
                            <span className="font-medium">{tech.phone || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="text-slate-400">🔧</span>
                            <span>{tech.category || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="text-slate-400">📍</span>
                            <span>{tech.province}{tech.sector ? `, ${tech.sector}` : ''}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="text-slate-400">🏅</span>
                            <span>{tech.experience ? `${tech.experience} años de experiencia` : 'Experiencia no indicada'}</span>
                          </div>
                          {tech.bio && (
                            <div className="flex items-start gap-2 text-sm text-slate-600 sm:col-span-2">
                              <span className="text-slate-400 mt-0.5">📝</span>
                              <span className="italic">{tech.bio}</span>
                            </div>
                          )}
                        </div>

                        {/* Links: foto y certificado */}
                        <div className="flex flex-wrap gap-3">
                          {(tech.photo_url || tech.photo) && (
                            <a href={tech.photo_url || tech.photo} target="_blank" rel="noopener noreferrer"
                               className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200
                                          bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm">
                              🖼 Ver foto de perfil
                            </a>
                          )}
                          {tech.certificates_url && (
                            <a href={tech.certificates_url} target="_blank" rel="noopener noreferrer"
                               className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200
                                          bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition shadow-sm">
                              📄 Ver certificado
                            </a>
                          )}
                        </div>

                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2 flex-shrink-0">
                        {!isEditing ? (
                          <button
                            onClick={() => startEdit(tech)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200
                                       px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition"
                          >
                            <PencilSquareIcon className="h-3.5 w-3.5" /> Editar
                          </button>
                        ) : (
                          <button
                            onClick={saveEdit}
                            disabled={savingEdit}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600
                                       px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700
                                       disabled:opacity-50 transition"
                          >
                            <CheckIcon className="h-3.5 w-3.5" />
                            {savingEdit ? 'Guardando...' : 'Guardar'}
                          </button>
                        )}
                        {isEditing && (
                          <button
                            onClick={() => setEditingTech(null)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200
                                       px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
                          >
                            <XMarkIcon className="h-3.5 w-3.5" /> Cancelar
                          </button>
                        )}
                        <button
                          onClick={() => toggleApproval(tech)}
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5
                                      text-xs font-bold transition ${
                            tech.approved
                              ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {tech.approved ? '⏸ Desactivar' : '▶ Activar'}
                        </button>
                        <button
                          onClick={() => deleteTechnician(tech)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200
                                     px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                        >
                          <TrashIcon className="h-3.5 w-3.5" /> Eliminar
                        </button>
                        <button
                          onClick={() => { setUploadingFor(tech.id); setSelectedFile(null); setCaption(''); setShowUploadModal(true) }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600
                                     px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                        >
                          <PlusIcon className="h-3.5 w-3.5" /> Subir trabajo
                        </button>
                      </div>
                    </div>

                    {/* Edit form */}
                    {isEditing && editingTech && (
                      <div className="mb-5 grid gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4 sm:grid-cols-2 lg:grid-cols-3">
                        {([
                          { field: 'name',       label: 'Nombre',       type: 'text'   },
                          { field: 'phone',      label: 'Teléfono',     type: 'text'   },
                          { field: 'category',   label: 'Categoría',    type: 'text'   },
                          { field: 'province',   label: 'Provincia',    type: 'text'   },
                          { field: 'sector',     label: 'Sector',       type: 'text'   },
                          { field: 'experience', label: 'Experiencia (años)', type: 'number' },
                        ] as const).map(({ field, label, type }) => (
                          <div key={field}>
                            <label className="mb-1 block text-xs font-bold text-slate-500">{label}</label>
                            <input
                              type={type}
                              value={(editingTech as any)[field]}
                              onChange={e => setEditingTech(prev => prev ? {
                                ...prev,
                                [field]: type === 'number' ? Number(e.target.value) : e.target.value,
                              } : prev)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2
                                         text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        ))}
                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className="mb-1 block text-xs font-bold text-slate-500">Biografía / descripción</label>
                          <textarea
                            rows={2}
                            value={editingTech.bio}
                            onChange={e => setEditingTech(prev => prev ? { ...prev, bio: e.target.value } : prev)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2
                                       text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Work photos */}
                    {photos.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-bold text-slate-700">Trabajos realizados</h4>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          {photos.map(photo => (
                            <div key={photo.id} className="group relative">
                              <img src={photo.image_url} alt={photo.caption || 'Trabajo'}
                                   className="h-32 w-full rounded-xl object-cover shadow-sm" />
                              {photo.caption && (
                                <p className="mt-1 text-xs text-slate-500">{photo.caption}</p>
                              )}
                              <button onClick={() => deleteWorkPhoto(photo.id)}
                                      className="absolute right-1.5 top-1.5 rounded-full bg-red-600 p-1
                                                 text-white opacity-0 transition group-hover:opacity-100"
                                      aria-label="Eliminar foto">
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

        {/* ── PENDIENTES ──────────────────────────────────────────────────── */}
        {!loading && activeTab === 'pendientes' && (
          <div className="space-y-4">
            {pendingTechs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
                No hay solicitudes pendientes.
              </div>
            ) : (
              pendingTechs.map(tech => (
                <div key={tech.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">{tech.name}</h3>
                      <p className="text-sm text-slate-500">Especialidad: {tech.specialty}</p>
                      <p className="text-sm text-slate-500">Teléfono: {tech.phone}</p>
                      <p className="text-sm text-slate-500">Ubicación: {tech.province} — {tech.sector}</p>
                      <p className="text-sm text-slate-500">Experiencia: {tech.experience} años</p>
                      <div className="mt-2 flex flex-wrap gap-3">
                        {tech.photo_url && (
                          <a href={tech.photo_url} target="_blank" rel="noopener noreferrer"
                             className="text-sm font-semibold text-blue-600 hover:underline">Ver foto</a>
                        )}
                        {tech.certificates_url && (
                          <a href={tech.certificates_url} target="_blank" rel="noopener noreferrer"
                             className="text-sm font-semibold text-blue-600 hover:underline">Ver certificado</a>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => approveTechnician(tech)}
                      className="h-fit rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold
                                 text-white hover:bg-emerald-700 transition shadow-sm"
                    >
                      ✓ Aprobar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── RESEÑAS ─────────────────────────────────────────────────────── */}
        {!loading && activeTab === 'resenas' && (
          <div className="space-y-4">
            {adminReviews.length > 0 && (
              <div className="flex justify-end">
                <button onClick={deleteAllReviews}
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold
                                   text-red-600 hover:bg-red-50 transition">
                  Eliminar todas las reseñas
                </button>
              </div>
            )}
            {adminReviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
                Aún no hay reseñas registradas.
              </div>
            ) : (
              adminReviews.map(review => (
                <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">{review.customer_name}</p>
                      <p className="text-sm font-semibold text-blue-600">
                        Técnico: {review.technicians?.name || '—'}
                      </p>
                      {review.created_at && (
                        <p className="text-xs text-slate-400">{new Date(review.created_at).toLocaleString('es-DO')}</p>
                      )}
                      <p className="mt-1 text-amber-400">{'★'.repeat(review.rating)}</p>
                      <p className="mt-2 break-words text-sm text-slate-600">&ldquo;{review.comment}&rdquo;</p>
                    </div>
                    <button onClick={() => deleteReview(review)}
                            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-red-200
                                       px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition">
                      <TrashIcon className="h-4 w-4" /> Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── UPLOAD MODAL ────────────────────────────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Subir foto de trabajo</h3>
              <button onClick={() => setShowUploadModal(false)}
                      className="rounded-lg p-1.5 hover:bg-slate-100 transition">
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <input type="file" accept="image/*"
                   onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                   className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
            <input type="text" placeholder="Descripción (opcional)"
                   value={caption} onChange={e => setCaption(e.target.value)}
                   className="mb-5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm
                              outline-none focus:border-blue-500" />
            <button
              disabled={uploading}
              onClick={async () => {
                if (!selectedFile || !uploadingFor) { alert('Selecciona una imagen'); return }
                setUploading(true)
                try { await uploadWorkPhoto(uploadingFor, selectedFile, caption); setShowUploadModal(false) }
                catch (err: unknown) { alert('Error: ' + (err instanceof Error ? err.message : 'Error al subir')) }
                finally { setUploading(false) }
              }}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white
                         hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {uploading ? 'Subiendo...' : 'Subir foto'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}