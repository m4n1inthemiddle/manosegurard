'use client'

import { cn } from '@/lib/utils'

interface MultiStepProgressProps {
  currentStep: number
  totalSteps: number
  labels: string[]
}

export default function MultiStepProgress({
  currentStep,
  totalSteps,
  labels,
}: MultiStepProgressProps) {
  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className="mb-8" aria-label={`Paso ${currentStep} de ${totalSteps}`}>
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-900">
          Paso {currentStep} de {totalSteps}
        </span>
        <span className="text-slate-500">{labels[currentStep - 1]}</span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
      >
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <ol className="mt-4 hidden gap-2 sm:flex">
        {labels.map((label, index) => {
          const stepNum = index + 1
          const isActive = stepNum === currentStep
          const isComplete = stepNum < currentStep

          return (
            <li
              key={label}
              className={cn(
                'flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors',
                isActive && 'bg-brand-50 text-brand-700',
                isComplete && 'text-brand-600',
                !isActive && !isComplete && 'text-slate-400'
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  isActive && 'bg-brand-600 text-white',
                  isComplete && 'bg-brand-100 text-brand-700',
                  !isActive && !isComplete && 'bg-slate-100 text-slate-500'
                )}
              >
                {isComplete ? '✓' : stepNum}
              </span>
              <span className="truncate">{label}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
