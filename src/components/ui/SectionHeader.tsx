import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  badge?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export default function SectionHeader({
  badge,
  title,
  description,
  align = 'center',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(align === 'center' && 'text-center', 'mb-12 md:mb-16', className)}>
      {badge && <span className="badge mb-4">{badge}</span>}
      <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-4 text-lg text-slate-600',
            align === 'center' && 'mx-auto max-w-2xl'
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
