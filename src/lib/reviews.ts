import { supabase } from '@/lib/supabaseClient'

export function buildReviewUrl(technicianId: number, requestId?: number): string {
  if (typeof window === 'undefined') {
    const path = `/calificar/${technicianId}`
    return requestId ? `${path}?solicitud=${requestId}` : path
  }
  const base = window.location.origin
  const path = `/calificar/${technicianId}`
  return requestId ? `${base}${path}?solicitud=${requestId}` : `${base}${path}`
}

export function buildReviewWhatsAppMessage(
  customerName: string,
  technicianId: number,
  requestId?: number
): string {
  const url = buildReviewUrl(technicianId, requestId)
  return `Hola ${customerName}, tu servicio en ManoSeguraRD ha sido completado. Por favor califica al técnico aquí: ${url}`
}

/** Recalcula el promedio de reseñas y actualiza el campo rating del técnico. */
export async function updateTechnicianAverageRating(technicianId: number): Promise<void> {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('technician_id', technicianId)

  if (error) return

  const average =
    reviews?.length ?
      Math.round(
        (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length) * 10
      ) / 10
    : 0

  await supabase.from('technicians').update({ rating: average }).eq('id', technicianId)
}
