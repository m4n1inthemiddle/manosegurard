'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/tecnicos', label: 'Técnicos' },
  { href: '/unete', label: 'Únete' },
  { href: '/contacto', label: 'Contacto' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          scrolled
            ? 'border-b border-slate-200/80 bg-white/80 shadow-soft backdrop-blur-xl'
            : 'border-b border-transparent bg-white/60 backdrop-blur-md'
        )}
      >
        <nav className="container-page flex h-16 items-center justify-between md:h-[4.5rem]">
          <Link href="/" className="group flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft transition-transform group-hover:scale-105">
              <ShieldCheckIcon className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-slate-900">
              Mano<span className="text-brand-600">Segura</span>RD
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'text-brand-600'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-brand-600"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/unete" className="btn-ghost text-sm">
              Soy técnico
            </Link>
            <Link href="/solicitar" className="btn-primary text-sm">
              Solicitar servicio
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <span className="font-display font-semibold text-slate-900">Menú</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 hover:bg-slate-100"
                  aria-label="Cerrar menú"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                      isActive(link.href)
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/solicitar" className="btn-primary mt-4 w-full">
                  Solicitar servicio
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
