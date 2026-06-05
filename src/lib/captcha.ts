/** ¿Hay clave pública configurada? (muestra el widget en formularios) */
export function isCaptchaConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
}

/** Verifica el token con el servidor antes de enviar formularios. */
export async function verifyCaptchaToken(
  token: string | null
): Promise<{ ok: boolean; message?: string }> {
  if (!isCaptchaConfigured()) {
    return { ok: true }
  }

  if (!token) {
    return { ok: false, message: 'Completa la verificación de seguridad (CAPTCHA).' }
  }

  try {
    const res = await fetch('/api/captcha/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await res.json()

    if (!res.ok || !data.success) {
      return {
        ok: false,
        message: 'No pudimos verificar que no eres un bot. Intenta de nuevo.',
      }
    }

    return { ok: true }
  } catch {
    return { ok: false, message: 'Error de conexión al verificar el CAPTCHA.' }
  }
}
