'use client'

import { CheckCircleIcon } from '@heroicons/react/24/solid'
import FadeIn from './FadeIn'

interface SuccessMessageProps {
  title: string
  description: string
}

export default function SuccessMessage({ title, description }: SuccessMessageProps) {
  return (
    <div className="container-page py-24">
      <FadeIn className="mx-auto max-w-lg text-center">
        <div className="card p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircleIcon className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">{title}</h2>
          <p className="mt-3 text-slate-600">{description}</p>
        </div>
      </FadeIn>
    </div>
  )
}
