'use client'
export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Technician } from '@/types'
import TechnicianCard from '@/components/TechnicianCard'
import PageHero from '@/components/ui/PageHero'
import FadeIn from '@/components/ui/FadeIn'
import { FunnelIcon } from '@heroicons/react/24/outline'

const provincias = [
  'Distrito Nacional', 'Santo Domingo', 'Santiago', 'La Altagracia', 'La Romana',
  'San Cristóbal', 'Puerto Plata', 'San Pedro de Macorís', 'Duarte', 'Espaillat',
  'La Vega', 'Valverde', 'Barahona', 'Azua', 'Peravia', 'Monseñor Nouel',
  'Sánchez Ramírez', 'María Trinidad Sánchez', 'Samana', 'El Seibo', 'Hato Mayor',
  'Monte Plata', 'San Juan', 'Elías Piña', 'Dajabón', 'Santiago Rodríguez',
  'Monte Cristi', 'Bahoruco', 'Independencia', 'Pedernales',
]

const categorias = [
  'Electricidad', 'Plomería', 'Aires acondicionados', 'Cámaras', 'Cerrajería',
  'Pintura', 'Limpieza', 'Paneles solares', 'Tecnología',
]

function TecnicosContent() {
  const searchParams = useSearchParams()
  const categoriaParam = searchParams.get('categoria')

  const [filteredTechs, setFilteredTechs] = useState<Technician[]>([])
  const [filters, setFilters] = useState({
    categoria: categoriaParam || '',
    provincia: '',
    rating: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (categoriaParam) {
      setFilters((f) => ({ ...f, categoria: categoriaParam }))
    }
  }, [categoriaParam])

  useEffect(() => {
    const fetchTechnicians = async () => {
      setLoading(true)
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
          filtered = data.filter((t) => t.rating >= parseInt(filters.rating))
        }
        setFilteredTechs(filtered)
      }
      setLoading(false)
    }

    fetchTechnicians()
  }, [filters])

  return (
    <>
      <PageHero
        badge="Directorio"
        title="Nuestros técnicos"
        description="Profesionales verificados listos para atender tu hogar o negocio."
      />

      <section className="section-padding bg-white">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-4">
            <FadeIn className="lg:col-span-1">
              <aside className="card sticky top-24 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <FunnelIcon className="h-5 w-5 text-brand-600" />
                  <h3 className="font-display font-semibold text-slate-900">Filtros</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="label-field">Categoría</label>
                    <select
                      className="input-field"
                      value={filters.categoria}
                      onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
                    >
                      <option value="">Todas</option>
                      {categorias.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-field">Provincia</label>
                    <select
                      className="input-field"
                      value={filters.provincia}
                      onChange={(e) => setFilters({ ...filters, provincia: e.target.value })}
                    >
                      <option value="">Todas</option>
                      {provincias.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-field">Rating mínimo</label>
                    <select
                      className="input-field"
                      value={filters.rating}
                      onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                    >
                      <option value="">Cualquiera</option>
                      <option value="4">4+ estrellas</option>
                      <option value="4.5">4.5+ estrellas</option>
                    </select>
                  </div>
                </div>
              </aside>
            </FadeIn>

            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="card h-80 animate-pulse bg-slate-100" />
                  ))}
                </div>
              ) : filteredTechs.length === 0 ? (
                <FadeIn className="card py-20 text-center">
                  <p className="text-slate-500">No hay técnicos disponibles con esos filtros.</p>
                </FadeIn>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredTechs.map((tech, i) => (
                    <TechnicianCard key={tech.id} technician={tech} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default function TecnicosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      }
    >
      <TecnicosContent />
    </Suspense>
  )
}
