'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'
export const dynamic = 'force-dynamic';
// ... resto del código (detalle del técnico)

export default function TecnicoDetailPage({ params }: { params: { id: string } }) {
  const [technician, setTechnician] = useState<any>(null)
  const [workPhotos, setWorkPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: techData } = await supabase
        .from('technicians')
        .select('*')
        .eq('id', params.id)
        .single()
      setTechnician(techData)

      const { data: photos } = await supabase
        .from('work_photos')
        .select('*')
        .eq('technician_id', params.id)
        .order('created_at', { ascending: false })
      setWorkPhotos(photos || [])
      setLoading(false)
    }
    fetchData()
  }, [params.id])

  if (loading) return <div className="text-center py-20">Cargando...</div>
  if (!technician) return <div className="text-center py-20">Técnico no encontrado</div>

  const imagenUrl = technician.photo_url || technician.photo || 'https://picsum.photos/400/300'
  const ubicacion = technician.province 
    ? technician.sector 
      ? `${technician.province} (${technician.sector})`
      : technician.province
    : 'Ubicación no especificada'

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="relative w-32 h-32 rounded-full overflow-hidden">
            <Image src={imagenUrl} alt={technician.name} fill className="object-cover" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold">{technician.name}</h1>
            <p className="text-blue-600 text-lg">{technician.category}</p>
            <p className="text-gray-600">{ubicacion}</p>
            <p className="text-gray-600">{technician.experience} años de experiencia</p>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
              <span className="text-yellow-400">★</span>
              <span>{technician.rating || 'Nuevo'}</span>
            </div>
            <Link
              href={`https://wa.me/${technician.phone}?text=Hola%20${technician.name},%20vi%20tu%20perfil%20en%20ManoSeguraRD%20y%20necesito%20tus%20servicios`}
              target="_blank"
              className="inline-block mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Contactar por WhatsApp
            </Link>
          </div>
        </div>
        {technician.bio && <p className="mt-4 text-gray-700">{technician.bio}</p>}
      </div>

      {workPhotos.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Trabajos realizados</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {workPhotos.map(photo => (
              <div key={photo.id} className="relative group">
                <img src={photo.image_url} alt={photo.caption || 'Trabajo'} className="w-full h-48 object-cover rounded-lg shadow" />
                {photo.caption && <p className="text-sm text-gray-600 mt-1">{photo.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

}