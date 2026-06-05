import Link from 'next/link'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import { ADMIN_PHONE_DISPLAY, ADMIN_PHONE_TEL, buildAdminWhatsAppUrl } from '@/lib/contact'

const footerLinks = {
  empresa: [
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/servicios', label: 'Servicios' },
    { href: '/tecnicos', label: 'Técnicos' },
    { href: '/unete', label: 'Únete como técnico' },
  ],
  legal: [
    { href: '/privacidad', label: 'Privacidad' },
    { href: '/terminos', label: 'Términos' },
  ],
  contacto: [
    { href: buildAdminWhatsAppUrl(), label: 'WhatsApp', external: true },
    { href: 'https://instagram.com', label: 'Instagram', external: true },
    { href: 'mailto:info@manosegurard.com', label: 'info@manosegurard.com', external: true },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="container-page py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                <ShieldCheckIcon className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-bold text-white">
                Mano<span className="text-brand-400">Segura</span>RD
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Conectamos hogares dominicanos con técnicos verificados. Rápido, seguro y con respaldo real.
            </p>
            <Link
              href="/solicitar"
              className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
            >
              Solicitar técnico
            </Link>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Empresa
            </h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Contacto
            </h4>
            <ul className="space-y-3">
              {footerLinks.contacto.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={`tel:${ADMIN_PHONE_TEL}`} className="text-sm text-slate-400 hover:text-white">
                  {ADMIN_PHONE_DISPLAY}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Horario
            </h4>
            <p className="text-sm text-slate-400">
              Lunes a Domingo
              <br />
              8:00 AM – 8:00 PM
            </p>
            <h4 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wider text-white">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 md:flex-row">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} ManoSeguraRD. Todos los derechos reservados.
          </p>
          <p className="text-sm text-slate-500">República Dominicana</p>
        </div>
      </div>
    </footer>
  )
}
