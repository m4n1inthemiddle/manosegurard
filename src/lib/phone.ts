/** Normaliza un teléfono para enlaces wa.me (solo dígitos, con código de país si falta). */
export function normalizePhoneForWhatsApp(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10) return null
  if (digits.length === 10 && digits.startsWith('8')) {
    return `1${digits}`
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits
  }
  return digits
}
