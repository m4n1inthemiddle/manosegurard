import Link from 'next/link'
import * as Icons from '@heroicons/react/24/outline'

interface ServiceCardProps {
  name: string
  iconName: string   // cambiamos de 'icon' a 'iconName'
  description: string
}

export default function ServiceCard({ name, iconName, description }: ServiceCardProps) {
  // Mapear el nombre del string al componente real
  const IconComponent = (Icons as any)[iconName]

  return (
    <div className="card p-6 text-center hover:transform hover:scale-105 transition-transform">
      <div className="flex justify-center mb-4">
        {IconComponent && <IconComponent className="w-12 h-12 text-blue-600 mx-auto" />}
      </div>
      <h3 className="text-xl font-semibold mb-2">{name}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <Link href={`/tecnicos?categoria=${name.toLowerCase()}`} className="text-blue-600 hover:text-blue-800">
        Ver técnicos →
      </Link>
    </div>
  )
}