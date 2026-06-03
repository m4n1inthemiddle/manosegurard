
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
    <>
      {/* Barra de navegación principal (escritorio y base móvil) */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-blue-600">
              ManoSeguraRD
            </Link>

            {/* Menú escritorio */}
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

            {/* Botón solicitar servicio (escritorio) */}
            <Link
              href="/solicitar"
              className="hidden md:block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Solicitar servicio
            </Link>

            {/* Botón hamburguesa (móvil) */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Menú lateral móvil (overlay) */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Fondo semitransparente (cierra al hacer clic) */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Panel lateral derecho */}
        <div
          className={`absolute right-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Cabecera del menú con botón cerrar */}
          <div className="flex justify-between items-center p-4 border-b">
            <span className="text-lg font-semibold text-gray-800">Menú</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Enlaces del menú */}
          <div className="flex flex-col p-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isActive(link.href)
                    ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Botón Solicitar servicio dentro del menú móvil */}
            <Link
              href="/solicitar"
              onClick={() => setIsOpen(false)}
              className="mt-4 bg-blue-600 text-white text-center px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Solicitar servicio
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}