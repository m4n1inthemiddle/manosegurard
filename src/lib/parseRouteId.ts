/** Convierte el parámetro dinámico de Next.js a string numérica válida. */
export function parseRouteId(id: string | string[] | undefined): string | null {
  const raw = Array.isArray(id) ? id[0] : id
  if (!raw || raw === 'undefined' || raw === 'null') return null
  const num = parseInt(raw, 10)
  if (Number.isNaN(num) || num <= 0) return null
  return String(num)
}
