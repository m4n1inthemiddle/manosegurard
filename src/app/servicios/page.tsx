'use client'
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import * as Icons from '@heroicons/react/24/outline'

const categories = [
  { name: 'Electricidad', iconName: 'BoltIcon', description: 'Instalaciones, reparaciones y mantenimiento eléctrico' },
  { name: 'Plomería', iconName: 'WrenchIcon', description: 'Fugas, instalaciones y reparaciones de tuberías' },
  { name: 'Aires acondicionados', iconName: 'CloudIcon', description: 'Instalación, limpieza y reparación de AA' },
  { name: 'Cámaras', iconName: 'CameraIcon', description: 'Instalación de sistemas de seguridad' },
  { name: 'Cerrajería', iconName: 'KeyIcon', description: 'Cambio y reparación de cerraduras' },
  { name: 'Pintura', iconName: 'PaintBrushIcon', description: 'Pintura interior y exterior' },
  { name: 'Limpieza', iconName: 'SparklesIcon', description: 'Limpieza profunda y mantenimiento' },
  { name: 'Paneles solares', iconName: 'SunIcon', description: 'Instalación y mantenimiento de paneles solares' },
]

export default function ServiciosPage() {
  const [technicianCounts, setTechnicianCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchCounts = async () => {
      const counts: Record<string, number> = {}
      for (const cat of categories) {
        const { count } = await supabase
          .from('technicians')
          .select('*', { count: 'exact', head: true })
          .eq('category', cat.name)
          .eq('approved', true)
        counts[cat.name] = count || 0
      }
      setTechnicianCounts(counts)
    }
    fetchCounts()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Nuestros servicios</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => {
          const IconComponent = (Icons as any)[cat.iconName]
          return (
            <div key={cat.name} className="card p-6">
              <div className="flex justify-center mb-3">
                {IconComponent && <IconComponent className="w-12 h-12 text-blue-600" />}
              </div>
              <h3 className="text-xl font-semibold mb-2">{cat.name}</h3>
              <p className="text-gray-600 mb-2">{cat.description}</p>
              <p className="text-sm text-blue-600 mb-4">{technicianCounts[cat.name] || 0} técnicos disponibles</p>
              <Link href={`/tecnicos?categoria=${cat.name.toLowerCase()}`} className="text-blue-600 font-semibold hover:text-blue-800">
                Ver técnicos →
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}