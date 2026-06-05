import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    return NextResponse.json(
      { success: false, error: 'captcha_not_configured' },
      { status: 503 }
    )
  }

  let token: string | undefined
  try {
    const body = await request.json()
    token = body.token
  } catch {
    return NextResponse.json({ success: false, error: 'invalid_body' }, { status: 400 })
  }

  if (!token) {
    return NextResponse.json({ success: false, error: 'missing_token' }, { status: 400 })
  }

  const formData = new URLSearchParams()
  formData.append('secret', secret)
  formData.append('response', token)

  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  })

  const outcome = await verifyRes.json()

  return NextResponse.json({
    success: outcome.success === true,
  })
}
