'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Technician } from '@/types'
import TechnicianCard from '@/components/TechnicianCard'

export default function TecnicosPage() {
  const searchParams = useSearchParams()
  const categoria = searchParams.get('categoria')
  
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [filteredTechs, setFilteredTechs] = useState<Technician[]>([])
  const [filters, setFilters] = useState({
    categoria: categoria || '',
    provincia: '',
    rating: ''
  })

  useEffect(() => {
    const fetchTechnicians = async () => {
      let query = supabase.from('technicians').select('*').eq('approved', true)
      
      if (filters.categoria) {
        query = query.ilike('category', `%${filters.categoria}%`)
      }
      if (filters.provincia) {
        query = query.eq('province', filters.provincia)
      }
      
      const { data } = await query
      if (data) {
        let filtered = data
        if (filters.rating) {
          filtered = data.filter(t => t.rating >= parseInt(filters.rating))
        }
        setTechnicians(data)
        setFilteredTechs(filtered)
      }
    }
    
    fetchTechnicians()
  }, [filters])

  // Lista de provincias de RD para el filtro
  const provincias = [
    'Distrito Nacional', 'Santo Domingo', 'Santiago', 'La Altagracia', 'La Romana',
    'San Cristóbal', 'Puerto Plata', 'San Pedro de Macorís', 'Duarte', 'Espaillat',
    'La Vega', 'Valverde', 'Barahona', 'Azua', 'Peravia', 'Monseñor Nouel',
    'Sánchez Ramírez', 'María Trinidad Sánchez', 'Samana', 'El Seibo', 'Hato Mayor',
    'Monte Plata', 'San Juan', 'Elías Piña', 'Dajabón', 'Santiago Rodríguez',
    'Monte Cristi', 'Bahoruco', 'Independencia', 'Pedernales'
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Nuestros técnicos</h1>
      
      <div className="grid md:grid-cols-4 gap-6">
        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow h-fit">
          <h3 className="font-bold mb-4">Filtros</h3>
          <div className="mb-4">
            <label className="block text-sm mb-1">Categoría</label>
            <select 
              className="w-full p-2 border rounded"
              value={filters.categoria}
              onChange={(e) => setFilters({...filters, categoria: e.target.value})}
            >
              <option value="">Todas</option>
              <option>Electricidad</option>
              <option>Plomería</option>
              <option>Aires acondicionados</option>
              <option>Cámaras</option>
              <option>Cerrajería</option>
              <option>Pintura</option>
              <option>Limpieza</option>
              <option>Paneles solares</option>
              <option>Tecnología</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1">Provincia</label>
            <select 
              className="w-full p-2 border rounded"
              value={filters.provincia}
              onChange={(e) => setFilters({...filters, provincia: e.target.value})}
            >
              <option value="">Todas</option>
              {provincias.map(prov => <option key={prov}>{prov}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1">Rating mínimo</label>
            <select 
              className="w-full p-2 border rounded"
              value={filters.rating}
              onChange={(e) => setFilters({...filters, rating: e.target.value})}
            >
              <option value="">Cualquiera</option>
              <option value="4">4+ estrellas</option>
              <option value="4.5">4.5+ estrellas</option>
            </select>
          </div>
        </div>
        
        {/* Lista de técnicos */}
        <div className="md:col-span-3">
          {filteredTechs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">No hay técnicos disponibles con esos filtros.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTechs.map(tech => (
                <TechnicianCard key={tech.id} technician={tech} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}