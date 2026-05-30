'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import { Technician } from '@/types'
import ServiceCard from '@/components/ServiceCard'
import TechnicianCard from '@/components/TechnicianCard'
import { CheckCircleIcon, StarIcon } from '@heroicons/react/24/solid'

const categories = [
  { name: 'Electricidad', iconName: 'BoltIcon', description: 'Instalaciones, reparaciones y mantenimiento eléctrico' },
  { name: 'Plomería', iconName: 'WrenchIcon', description: 'Fugas, instalaciones y reparaciones de tuberías' },
  { name: 'Aires acondicionados', iconName: 'CloudIcon', description: 'Instalación, limpieza y reparación de AA' },
  { name: 'Cámaras', iconName: 'CameraIcon', description: 'Instalación de sistemas de seguridad' },
  { name: 'Cerrajería', iconName: 'KeyIcon', description: 'Cambio y reparación de cerraduras' },
  { name: 'Pintura', iconName: 'PaintBrushIcon', description: 'Pintura interior y exterior' },
  { name: 'Limpieza', iconName: 'SparklesIcon', description: 'Limpieza profunda y mantenimiento' },
  { name: 'Paneles solares', iconName: 'SunIcon', description: 'Instalación y mantenimiento de paneles solares' },
  { name: 'Tecnología', iconName: 'ComputerDesktopIcon', description: 'Reparación de PC, celulares, tablets, redes y soporte técnico' },
]

const steps = [
  { number: '1', title: 'Solicita el servicio', description: 'Completa nuestro formulario con tus necesidades' },
  { number: '2', title: 'Te conectamos', description: 'Encontramos al técnico ideal para tu trabajo' },
  { number: '3', title: 'Recibe atención', description: 'Servicio rápido, seguro y de calidad' },
]

const trustFeatures = [
  { title: 'Técnicos verificados', description: 'Todos nuestros técnicos pasan por un riguroso proceso de verificación' },
  { title: 'Atención rápida', description: 'Respuesta en menos de 30 minutos' },
  { title: 'Soporte por WhatsApp', description: 'Atención personalizada 24/7' },
  { title: 'Calificaciones reales', description: 'Opiniones de clientes verificados' },
  { title: 'Servicio a domicilio', description: 'Vamos a donde nos necesites' },
]

export default function Home() {
  const [featuredTechnicians, setFeaturedTechnicians] = useState<Technician[]>([])
  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    const fetchTechnicians = async () => {
      const { data } = await supabase
        .from('technicians')
        .select('*')
        .eq('verified', true)
        .eq('approved', true)
        .limit(6)
      if (data) setFeaturedTechnicians(data)
    }
    fetchTechnicians()

    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*, technicians(name)')
        .order('created_at', { ascending: false })
        .limit(6)
      if (data) setReviews(data)
    }
    fetchReviews()
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Técnicos confiables para tu hogar en RD
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Electricistas, plomeros, aires acondicionados, cámaras y más. Rápido, seguro y verificado.
            </p>
            <div className="flex gap-4">
              <Link href="/solicitar" className="btn-primary">
                Solicitar técnico
              </Link>
              <Link href="/unete" className="btn-secondary">
                Quiero trabajar aquí
              </Link>
            </div>
          </div>
          <div className="relative h-96">
            <Image
              src="https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?ixlib=rb-4.0.3"
              alt="Técnico profesional"
              fill
              className="object-cover rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Buscador Rápido */}
      <section className="py-12 bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-4">
            <select className="flex-1 p-3 border rounded-lg text-gray-700">
              <option>¿Qué necesitas?</option>
              {categories.map(cat => (
                <option key={cat.name}>{cat.name}</option>
              ))}
            </select>
            <button className="btn-primary">Buscar técnico</button>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Servicios que ofrecemos</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {categories.map(category => (
              <ServiceCard key={category.name} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(step => (
              <div key={step.number} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Confianza (iconos profesionales en lugar de emojis) */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué confiar en nosotros?</h2>
          <div className="grid md:grid-cols-5 gap-6">
            {trustFeatures.map(feature => (
              <div key={feature.title} className="text-center p-4">
                <div className="flex justify-center mb-3">
                  <CheckCircleIcon className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Técnicos destacados */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Técnicos destacados</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredTechnicians.map(tech => (
              <TechnicianCard key={tech.id} technician={tech} />
            ))}
          </div>
        </div>
      </section>

      {/* Reviews (ahora desde la base de datos) */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Lo que dicen nuestros clientes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-500 col-span-3">Aún no hay reseñas. ¡Sé el primero en calificar!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex text-yellow-400 mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{review.comment}"</p>
                  <p className="font-semibold">- {review.customer_name}</p>
                  {review.technicians && (
                    <p className="text-sm text-gray-500 mt-2">Técnico: {review.technicians.name}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-blue-900 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">¿Necesitas ayuda en casa?</h2>
          <p className="text-xl mb-8">Encuentra al técnico perfecto para tu trabajo en minutos</p>
          <Link href="/solicitar" className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Solicitar técnico ahora
          </Link>
        </div>
      </section>
    </>
  )
}