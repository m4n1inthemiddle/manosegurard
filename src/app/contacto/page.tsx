// src/app/contacto/page.tsx
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  })
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí puedes guardar el mensaje en una tabla "contact_messages" si lo deseas
    // Por ahora, simulamos envío y redirigimos a WhatsApp
    const mensajeWhatsApp = `Hola, soy ${formData.nombre}. ${formData.mensaje}`
    window.location.href = `https://wa.me/18493587828?text=${encodeURIComponent(mensajeWhatsApp)}`
    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-green-100 text-green-700 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">¡Mensaje enviado!</h2>
          <p>Te contactaremos a la brevedad por WhatsApp.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-4">Contacto</h1>
      <p className="text-center text-gray-600 mb-8">¿Tienes dudas o sugerencias? Escríbenos y te responderemos rápido.</p>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-bold text-lg mb-2">📞 Teléfono</h3>
          <p>+1 849 358 7828</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-bold text-lg mb-2">💬 WhatsApp</h3>
          <p>+1 849 358 7828</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-bold text-lg mb-2">✉️ Email</h3>
          <p>info@manosegurard.com</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-bold text-lg mb-2">📍 Horario</h3>
          <p>Lun-Dom: 8am - 8pm</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Nombre completo *</label>
          <input type="text" required className="w-full p-3 border rounded-lg"
            value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Correo electrónico</label>
          <input type="email" className="w-full p-3 border rounded-lg"
            value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Teléfono *</label>
          <input type="tel" required className="w-full p-3 border rounded-lg"
            value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Mensaje *</label>
          <textarea rows={4} required className="w-full p-3 border rounded-lg"
            value={formData.mensaje} onChange={(e) => setFormData({...formData, mensaje: e.target.value})} />
        </div>
        <button type="submit" className="btn-primary w-full">Enviar mensaje</button>
      </form>
    </div>
  )
}