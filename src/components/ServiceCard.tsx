'use client'

import Link from 'next/link'
import * as Icons from '@heroicons/react/24/outline'
import { ArrowRightIcon } from '@heroicons/react/24/solid'

interface ServiceCardProps {
  name: string
  iconName: string
  description: string
}

export default function ServiceCard({ name, iconName, description }: ServiceCardProps) {
  const IconComponent = (Icons as Record<string, (props: { className?: string }) => JSX.Element>)[iconName]

  return (
    <Link
      href={`/tecnicos?categoria=${encodeURIComponent(name.toLowerCase())}`}
      className="card-interactive group flex h-full flex-col p-6"
    >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
          {IconComponent && <IconComponent className="h-6 w-6" />}
        </div>
        <h3 className="font-display text-lg font-semibold text-slate-900">{name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{description}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-gap group-hover:gap-2">
          Ver técnicos
          <ArrowRightIcon className="h-4 w-4" />
        </span>
    </Link>
  )
}
