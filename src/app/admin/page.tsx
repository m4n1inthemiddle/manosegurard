'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Technician, ServiceRequest, PendingTechnician } from '@/types'
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('solicitudes')
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [pendingTechs, setPendingTechs] = useState<PendingTechnician[]>([])
  const [loading, setLoading] = useState(false)
  const [workPhotos, setWorkPhotos] = useState<Record<number, any[]>>({})
  const [uploadingFor, setUploadingFor] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    const logged = localStorage.getItem('adminLoggedIn')
    if (logged === 'true') setIsLoggedIn(true)
  }, [])

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      setIsLoggedIn(true)
      localStorage.setItem('adminLoggedIn', 'true')
    } else {
      alert('Contraseña incorrecta')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn')
    setIsLoggedIn(false)
    setRequests([])
    setTechnicians([])
    setPendingTechs([])
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      if (activeTab === 'solicitudes') {
        const { data } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false })
        if (data) setRequests(data)
      } else if (activeTab === 'tecnicos') {
        const { data } = await supabase.from('technicians').select('*')
        if (data) {
          setTechnicians(data)
          const photosMap: Record<number, any[]> = {}
          for (const tech of data) {
            const { data: photos } = await supabase
              .from('work_photos')
              .select('*')
              .eq('technician_id', tech.id)
              .order('created_at', { ascending: false })
            if (photos) photosMap[tech.id] = photos
          }
          setWorkPhotos(photosMap)
        }
      } else if (activeTab === 'pendientes') {
        const { data } = await supabase.from('pending_technicians').select('*').eq('status', 'pendiente')
        if (data) setPendingTechs(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    if (isLoggedIn) fetchData()
  }, [isLoggedIn, activeTab, fetchData])

  const updateRequestStatus = async (id: number, status: string, technicianId?: number) => {
    if (status === 'completado' && technicianId) {
      const request = requests.find(r => r.id === id)
      if (request?.phone) {
        const baseUrl = window.location.origin
        const reviewUrl = `${baseUrl}/calificar/${technicianId}`
        const message = `Hola ${request.customer_name}, tu servicio ha sido completado. Por favor, deja tu reseña aquí: ${reviewUrl}`
        window.open(`https://wa.me/${request.phone}?text=${encodeURIComponent(message)}`, '_blank')
      }
    }
    const updateData: any = { status }
    if (technicianId) updateData.assigned_technician = technicianId
    await supabase.from('service_requests').update(updateData).eq('id', id)
    fetchData()
  }

  const approveTechnician = async (tech: PendingTechnician) => {
    const { error } = await supabase.from('technicians').insert([{
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
      bio: tech.certifications || ''
    }])
    if (!error) {
      await supabase.from('pending_technicians').update({ status: 'aprobado' }).eq('id', tech.id)
      fetchData()
    } else {
      alert('Error al aprobar técnico: ' + error.message)
    }
  }

  const uploadWorkPhoto = async (technicianId: number, file: File, captionText: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `work_${technicianId}_${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('work-photos')
      .upload(fileName, file)
    if (uploadError) throw uploadError
    const { data: urlData } = supabase.storage.from('work-photos').getPublicUrl(fileName)
    const { error: insertError } = await supabase
      .from('work_photos')
      .insert({ technician_id: technicianId, image_url: urlData.publicUrl, caption: captionText })
    if (insertError) throw insertError
    fetchData()
  }

  const deleteWorkPhoto = async (photoId: number) => {
    if (confirm('¿Eliminar esta foto?')) {
      await supabase.from('work_photos').delete().eq('id', photoId)
      fetchData()
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Panel de Administración</h2>
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-3 border rounded-lg mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} className="btn-primary w-full">Acceder</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
          Cerrar sesión
        </button>
      </div>

      {loading && <div className="text-center py-4">Cargando...</div>}

      <div className="flex gap-4 mb-8 border-b">
        <button onClick={() => setActiveTab('solicitudes')} className={`pb-2 px-4 ${activeTab === 'solicitudes' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}>
          Solicitudes ({requests.length})
        </button>
        <button onClick={() => setActiveTab('tecnicos')} className={`pb-2 px-4 ${activeTab === 'tecnicos' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}>
          Técnicos ({technicians.length})
        </button>
        <button onClick={() => setActiveTab('pendientes')} className={`pb-2 px-4 ${activeTab === 'pendientes' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}>
          Solicitudes de técnicos ({pendingTechs.length})
        </button>
      </div>

      {/* Solicitudes */}
      {activeTab === 'solicitudes' && (
        <div className="space-y-4">
          {requests.length === 0 ? <p className="text-center text-gray-500">No hay solicitudes aún.</p> : requests.map(req => (
            <div key={req.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{req.customer_name}</h3>
                  <p className="text-sm text-gray-600">Tel: {req.phone}</p>
                  <p className="text-sm">Servicio: {req.service_type}</p>
                  <p className="text-sm">Ciudad: {req.city}</p>
                  <p className="text-sm">Descripción: {req.description}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <select
                    value={req.assigned_technician || ''}
                    onChange={async (e) => {
                      const techId = e.target.value ? parseInt(e.target.value) : null
                      await supabase.from('service_requests').update({ assigned_technician: techId }).eq('id', req.id)
                      fetchData()
                    }}
                    className="p-2 border rounded text-sm"
                  >
                    <option value="">Sin técnico</option>
                    {technicians.map(tech => <option key={tech.id} value={tech.id}>{tech.name}</option>)}
                  </select>
                  <select
                    value={req.status}
                    onChange={(e) => updateRequestStatus(req.id, e.target.value, req.assigned_technician || undefined)}
                    className="p-2 border rounded"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="asignado">Asignado</option>
                    <option value="completado">Completado</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Técnicos aprobados con galería de trabajos */}
      {activeTab === 'tecnicos' && (
        <div className="space-y-8">
          {technicians.length === 0 ? (
            <p className="text-center text-gray-500">No hay técnicos aprobados aún.</p>
          ) : (
            technicians.map(tech => {
              const photos = workPhotos[tech.id] || []
              return (
                <div key={tech.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{tech.name}</h3>
                      <p className="text-sm text-gray-600">{tech.category} - {tech.province} {tech.sector && `(${tech.sector})`}</p>
                      <p className="text-sm">✅ {tech.verified ? 'Verificado' : 'No verificado'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUploadingFor(tech.id)
                        setSelectedFile(null)
                        setCaption('')
                        setShowUploadModal(true)
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <PlusIcon className="h-4 w-4" /> Subir trabajo
                    </button>
                  </div>

                  {/* Galería de trabajos */}
                  {photos.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Trabajos realizados:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {photos.map(photo => (
                          <div key={photo.id} className="relative group">
                            <img src={photo.image_url} alt={photo.caption || 'Trabajo'} className="w-full h-32 object-cover rounded-lg shadow" />
                            {photo.caption && <p className="text-xs text-gray-600 mt-1">{photo.caption}</p>}
                            <button
                              onClick={() => deleteWorkPhoto(photo.id)}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
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

      {/* Técnicos pendientes */}
      {activeTab === 'pendientes' && (
        <div className="grid gap-4">
          {pendingTechs.length === 0 ? <p className="text-center text-gray-500">No hay solicitudes pendientes.</p> : pendingTechs.map(tech => (
            <div key={tech.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{tech.name}</h3>
                  <p>Especialidad: {tech.specialty}</p>
                  <p>Teléfono: {tech.phone}</p>
                  <p>Ubicación: {tech.province} - {tech.sector}</p>
                  <p>Experiencia: {tech.experience} años</p>
                  {tech.photo_url && <a href={tech.photo_url} target="_blank" className="text-blue-600 underline">Ver foto</a>}
                  {tech.certificates_url && <a href={tech.certificates_url} target="_blank" className="text-blue-600 underline ml-2">Ver certificado</a>}
                </div>
                <button onClick={() => approveTechnician(tech)} className="bg-green-600 text-white px-4 py-2 rounded">Aprobar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para subir foto */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Subir foto de trabajo</h3>
              <button onClick={() => setShowUploadModal(false)}><XMarkIcon className="h-6 w-6" /></button>
            </div>
            <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="mb-4 w-full" />
            <input type="text" placeholder="Descripción (opcional)" value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full p-2 border rounded mb-4" />
            <button
              onClick={async () => {
                if (selectedFile && uploadingFor) {
                  await uploadWorkPhoto(uploadingFor, selectedFile, caption)
                  setShowUploadModal(false)
                } else {
                  alert('Selecciona una imagen')
                }
              }}
              className="bg-blue-600 text-white w-full py-2 rounded"
            >
              Subir
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

