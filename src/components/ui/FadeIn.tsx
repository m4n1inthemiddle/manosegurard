'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'none'
  once?: boolean
  /** Si true, anima opacidad (puede verse vacío al hacer scroll rápido). Por defecto false. */
  fade?: boolean
}

export default function FadeIn({
  children,
  className,
  delay = 0,
  direction = 'up',
  once = true,
  fade = false,
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotion()
  const y = direction === 'up' ? 12 : direction === 'down' ? -12 : 0

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: fade ? 0 : 1, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.08, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
