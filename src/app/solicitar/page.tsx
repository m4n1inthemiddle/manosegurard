<<<<<<< HEAD
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SolicitarPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    ciudad: '',
    servicio: '',
    descripcion: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = await supabase
      .from('service_requests')
      .insert([{
        customer_name: formData.nombre,
        phone: formData.telefono,
        city: formData.ciudad,
        service_type: formData.servicio,
        description: formData.descripcion,
        status: 'pendiente'
      }])
    
    if (!error) {
      setSubmitted(true)
      setTimeout(() => {
        window.location.href = `https://wa.me/18493587828?text=Solicitud%20de%20servicio%3A%20${formData.nombre}%20necesita%20${formData.servicio}`
      }, 2000)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-green-100 text-green-700 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">¡Solicitud recibida!</h2>
          <p>Recibimos tu solicitud. Te contactaremos en minutos por WhatsApp.</p>
          <p className="text-sm mt-4">Redirigiendo a WhatsApp...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Solicitar servicio técnico</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Nombre completo *</label>
          <input
            type="text"
            required
            className="w-full p-3 border rounded-lg"
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Teléfono *</label>
          <input
            type="tel"
            required
            className="w-full p-3 border rounded-lg"
            value={formData.telefono}
            onChange={(e) => setFormData({...formData, telefono: e.target.value})}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Ciudad *</label>
          <select
            required
            className="w-full p-3 border rounded-lg"
            value={formData.ciudad}
            onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
          >
            <option value="">Selecciona tu ciudad</option>
            <option>Santo Domingo</option>
            <option>Santiago</option>
            <option>La Romana</option>
            <option>Puerto Plata</option>
            <option>Punta Cana</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Tipo de servicio *</label>
          <select
            required
            className="w-full p-3 border rounded-lg"
            value={formData.servicio}
            onChange={(e) => setFormData({...formData, servicio: e.target.value})}
          >
            <option value="">Selecciona un servicio</option>
            <option>Electricidad</option>
            <option>Plomería</option>
            <option>Aires acondicionados</option>
            <option>Cámaras de seguridad</option>
            <option>Cerrajería</option>
            <option>Pintura</option>
            <option>Limpieza</option>
            <option>Paneles solares</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Descripción del problema</label>
          <textarea
            rows={4}
            className="w-full p-3 border rounded-lg"
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
          ></textarea>
        </div>
        
        <button type="submit" className="btn-primary w-full">
          Solicitar técnico
        </button>
      </form>
    </div>
  )
=======
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SolicitarPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    ciudad: '',
    servicio: '',
    descripcion: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = await supabase
      .from('service_requests')
      .insert([{
        customer_name: formData.nombre,
        phone: formData.telefono,
        city: formData.ciudad,
        service_type: formData.servicio,
        description: formData.descripcion,
        status: 'pendiente'
      }])
    
    if (!error) {
      setSubmitted(true)
      setTimeout(() => {
        window.location.href = `https://wa.me/18493587828?text=Solicitud%20de%20servicio%3A%20${formData.nombre}%20necesita%20${formData.servicio}`
      }, 2000)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-green-100 text-green-700 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">¡Solicitud recibida!</h2>
          <p>Recibimos tu solicitud. Te contactaremos en minutos por WhatsApp.</p>
          <p className="text-sm mt-4">Redirigiendo a WhatsApp...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Solicitar servicio técnico</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Nombre completo *</label>
          <input
            type="text"
            required
            className="w-full p-3 border rounded-lg"
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Teléfono *</label>
          <input
            type="tel"
            required
            className="w-full p-3 border rounded-lg"
            value={formData.telefono}
            onChange={(e) => setFormData({...formData, telefono: e.target.value})}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Ciudad *</label>
          <select
            required
            className="w-full p-3 border rounded-lg"
            value={formData.ciudad}
            onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
          >
            <option value="">Selecciona tu ciudad</option>
            <option>Santo Domingo</option>
            <option>Santiago</option>
            <option>La Romana</option>
            <option>Puerto Plata</option>
            <option>Punta Cana</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Tipo de servicio *</label>
          <select
            required
            className="w-full p-3 border rounded-lg"
            value={formData.servicio}
            onChange={(e) => setFormData({...formData, servicio: e.target.value})}
          >
            <option value="">Selecciona un servicio</option>
            <option>Electricidad</option>
            <option>Plomería</option>
            <option>Aires acondicionados</option>
            <option>Cámaras de seguridad</option>
            <option>Cerrajería</option>
            <option>Pintura</option>
            <option>Limpieza</option>
            <option>Paneles solares</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Descripción del problema</label>
          <textarea
            rows={4}
            className="w-full p-3 border rounded-lg"
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
          ></textarea>
        </div>
        
        <button type="submit" className="btn-primary w-full">
          Solicitar técnico
        </button>
      </form>
    </div>
  )
>>>>>>> a40b40e0c0fab772259b055423326813377792f3
}