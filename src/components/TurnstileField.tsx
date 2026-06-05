'use client'

import { useRef, useImperativeHandle, forwardRef } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { isCaptchaConfigured } from '@/lib/captcha'

export interface TurnstileFieldHandle {
  reset: () => void
}

interface TurnstileFieldProps {
  onTokenChange: (token: string | null) => void
  className?: string
}

const TurnstileField = forwardRef<TurnstileFieldHandle, TurnstileFieldProps>(
  function TurnstileField({ onTokenChange, className }, ref) {
    const turnstileRef = useRef<TurnstileInstance>(null)
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

    useImperativeHandle(ref, () => ({
      reset: () => {
        onTokenChange(null)
        turnstileRef.current?.reset()
      },
    }))

    if (!isCaptchaConfigured() || !siteKey) {
      return null
    }

    return (
      <div className={className}>
        <p className="mb-2 text-xs text-slate-500">Verificación anti-spam</p>
        <Turnstile
          ref={turnstileRef}
          siteKey={siteKey}
          options={{ theme: 'light', size: 'normal' }}
          onSuccess={(token) => onTokenChange(token)}
          onExpire={() => onTokenChange(null)}
          onError={() => onTokenChange(null)}
        />
      </div>
    )
  }
)

export default TurnstileField
