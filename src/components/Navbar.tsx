'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/servicios', label: 'Servicios' },
    { href: '/tecnicos', label: 'Técnicos' },
    { href: '/unete', label: 'Únete' },
    { href: '/contacto', label: 'Contacto' },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            ManoSeguraRD
          </Link>
          
          <div className="hidden md:flex space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-1 py-2 transition-colors ${
                  isActive(link.href)
                    ? 'text-blue-600 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 after:rounded-full'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <Link href="/solicitar" className="hidden md:block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Solicitar servicio
          </Link>
          
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
            {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md ${
                  isActive(link.href)
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/solicitar"
              className="block px-3 py-2 bg-blue-600 text-white rounded-lg text-center mt-2"
              onClick={() => setIsOpen(false)}
            >
              Solicitar servicio
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}