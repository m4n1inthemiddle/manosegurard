// src/app/calificar/[id]/page.tsx
'use client'
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'

export default function CalificarPage() {
  const { id } = useParams() // ID del técnico
  const [technician, setTechnician] = useState<any>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTechnician = async () => {
      const { data } = await supabase
        .from('technicians')
        .select('id, name')
        .eq('id', id)
        .single()
      if (data) setTechnician(data)
      setLoading(false)
    }
    if (id) fetchTechnician()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || !comment) return

    const { error } = await supabase.from('reviews').insert({
      technician_id: parseInt(id as string),
      customer_name: customerName,
      rating,
      comment,
      created_at: new Date().toISOString()
    })
    if (!error) {
      setSubmitted(true)
    } else {
      alert('Error al guardar la reseña: ' + error.message)
    }
  }

  if (loading) return <div className="text-center py-20">Cargando...</div>
  if (!technician) return <div className="text-center py-20">Técnico no encontrado</div>

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-green-100 text-green-700 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">¡Gracias por tu reseña!</h2>
          <p>Tu opinión ayuda a otros clientes y a mejorar nuestros servicios.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-4">Califica a {technician.name}</h1>
      <p className="text-center text-gray-600 mb-8">Cuéntanos cómo fue tu experiencia</p>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Tu nombre *</label>
          <input
            type="text"
            required
            className="w-full p-3 border rounded-lg"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Calificación *</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Comentario *</label>
          <textarea
            rows={4}
            required
            className="w-full p-3 border rounded-lg"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="¿Qué tal fue el servicio? Cuéntanos tu experiencia..."
          />
        </div>

        <button type="submit" className="btn-primary w-full">Enviar reseña</button>
      </form>
    </div>
  )
}