/** Número oficial de ManoSeguraRD (admin / soporte) */
export const ADMIN_PHONE_DISPLAY = '+1 (849) 358-7828'
export const ADMIN_PHONE_WHATSAPP = '18493587828'
export const ADMIN_PHONE_TEL = '+18493587828'

export function buildAdminWhatsAppUrl(text?: string): string {
  const base = `https://wa.me/${ADMIN_PHONE_WHATSAPP}`
  if (!text) return base
  return `${base}?text=${encodeURIComponent(text)}`
}

/** Mensaje prellenado al contactar soporte por un técnico específico. */
export function buildTechnicianInquiryWhatsAppUrl(technicianName: string): string {
  const text = `Hola, vi el perfil de ${technicianName} en ManoSeguraRD y necesito sus servicios.`
  return buildAdminWhatsAppUrl(text)
}
