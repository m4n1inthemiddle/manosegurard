'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Technician, ServiceRequest, PendingTechnician } from '@/types'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('solicitudes')
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [pendingTechs, setPendingTechs] = useState<PendingTechnician[]>([])
  const [loading, setLoading] = useState(false)

  // Verificar sesión almacenada al cargar la página
  useEffect(() => {
    const logged = localStorage.getItem('adminLoggedIn')
    if (logged === 'true') {
      setIsLoggedIn(true)
    }
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
    setPassword('')
    setRequests([])
    setTechnicians([])
    setPendingTechs([])
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      if (activeTab === 'solicitudes') {
        const { data, error } = await supabase
          .from('service_requests')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        if (data) setRequests(data)
      } else if (activeTab === 'tecnicos') {
        const { data, error } = await supabase.from('technicians').select('*')
        if (error) throw error
        if (data) setTechnicians(data)
      } else if (activeTab === 'pendientes') {
        const { data, error } = await supabase
          .from('pending_technicians')
          .select('*')
          .eq('status', 'pendiente')
        if (error) throw error
        if (data) setPendingTechs(data)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    if (isLoggedIn) {
      fetchData()
    }
  }, [isLoggedIn, activeTab, fetchData])

  const updateRequestStatus = async (id: number, status: string, technicianId?: number) => {
    // Si se marca como completado y hay técnico asignado, enviar enlace de reseña
    if (status === 'completado' && technicianId) {
      const request = requests.find(r => r.id === id)
      if (request && request.phone) {
        const baseUrl = window.location.origin
        const reviewUrl = `${baseUrl}/calificar/${technicianId}`
        const message = `Hola ${request.customer_name}, tu servicio ha sido completado. Por favor, deja tu reseña aquí: ${reviewUrl}`
        window.open(`https://wa.me/${request.phone}?text=${encodeURIComponent(message)}`, '_blank')
      }
    }
    // Actualizar estado y técnico asignado en la base de datos
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

  // Pantalla de login
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
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      )}

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

      {/* Solicitudes de servicio */}
      {activeTab === 'solicitudes' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay solicitudes aún.</p>
          ) : (
            requests.map(req => (
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
                    {/* Select para asignar técnico */}
                    <select
                      value={req.assigned_technician || ''}
                      onChange={async (e) => {
                        const techId = e.target.value ? parseInt(e.target.value) : null
                        await supabase
                          .from('service_requests')
                          .update({ assigned_technician: techId })
                          .eq('id', req.id)
                        fetchData()
                      }}
                      className="p-2 border rounded text-sm"
                    >
                      <option value="">Sin técnico</option>
                      {technicians.map(tech => (
                        <option key={tech.id} value={tech.id}>{tech.name}</option>
                      ))}
                    </select>
                    {/* Select para estado */}
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
            ))
          )}
        </div>
      )}

      {/* Técnicos aprobados */}
      {activeTab === 'tecnicos' && (
        <div className="grid gap-4">
          {technicians.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay técnicos aprobados aún.</p>
          ) : (
            technicians.map(tech => (
              <div key={tech.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{tech.name}</h3>
                  <p className="text-sm">{tech.category} - {tech.province || tech.city} {tech.sector && `(${tech.sector})`}</p>
                  <p className="text-sm">✅ {tech.verified ? 'Verificado' : 'No verificado'}</p>
                  {tech.photo_url && <a href={tech.photo_url} target="_blank" className="text-xs text-blue-600">Ver foto</a>}
                </div>
                <button
                  onClick={async () => {
                    await supabase.from('technicians').update({ verified: !tech.verified }).eq('id', tech.id)
                    fetchData()
                  }}
                  className="text-blue-600"
                >
                  {tech.verified ? 'Desverificar' : 'Verificar'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Técnicos pendientes de aprobación */}
      {activeTab === 'pendientes' && (
        <div className="grid gap-4">
          {pendingTechs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay solicitudes de técnicos pendientes.</p>
          ) : (
            pendingTechs.map(tech => (
              <div key={tech.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{tech.name}</h3>
                    <p>Especialidad: {tech.specialty}</p>
                    <p>Teléfono: {tech.phone}</p>
                    <p>Ubicación: {tech.province} - {tech.sector}</p>
                    <p>Experiencia: {tech.experience} años</p>
                    {tech.photo_url && (
                      <p><a href={tech.photo_url} target="_blank" className="text-blue-600 underline">Ver foto de perfil</a></p>
                    )}
                    {tech.certificates_url && (
                      <p><a href={tech.certificates_url} target="_blank" className="text-blue-600 underline">Ver certificado</a></p>
                    )}
                    {tech.certifications && <p className="text-sm text-gray-600">Notas: {tech.certifications}</p>}
                  </div>
                  <button onClick={() => approveTechnician(tech)} className="bg-green-600 text-white px-4 py-2 rounded">
                    Aprobar técnico
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

