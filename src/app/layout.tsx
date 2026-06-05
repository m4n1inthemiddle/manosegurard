import './globals.css'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ManoSeguraRD - Técnicos confiables en RD',
  description: 'Encuentra técnicos verificados para tu hogar en República Dominicana',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={plusJakarta.variable}>
      <body className="font-sans">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  )
}
