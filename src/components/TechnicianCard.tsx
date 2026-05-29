import Link from 'next/link'
import Image from 'next/image'
import { Technician } from '@/types'

interface TechnicianCardProps {
  technician: Technician
}

export default function TechnicianCard({ technician }: TechnicianCardProps) {
  return (
    <div className="card">
      <div className="relative h-48">
        <Image
          src={technician.photo || 'https://picsum.photos/400/300'}
          alt={technician.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-1">{technician.name}</h3>
        <p className="text-blue-600 mb-2">{technician.category}</p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-400">★</span>
          <span>{technician.rating || 'Nuevo'}</span>
          <span className="text-gray-400">|</span>
          <span>{technician.city}</span>
        </div>
        <p className="text-gray-600 text-sm mb-3">{technician.experience} años de experiencia</p>
        <Link
          href={`https://wa.me/${technician.phone}?text=Hola%2C%20vi%20tu%20perfil%20en%20ManoSeguraRD%20y%20necesito%20tus%20servicios`}
          className="block text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          target="_blank"
        >
          Contactar por WhatsApp
        </Link>
      </div>
    </div>
  )
}