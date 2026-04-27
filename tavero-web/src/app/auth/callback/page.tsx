'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Status = 'loading' | 'confirmed' | 'reset' | 'reset_done' | 'error'

function parseHash(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  return {
    access_token:  params.get('access_token'),
    refresh_token: params.get('refresh_token'),
    type:          params.get('type'),
    error:         params.get('error'),
    error_description: params.get('error_description'),
  }
}

function AuthCallback() {
  const searchParams = useSearchParams()
  const [status, setStatus]       = useState<Status>('loading')
  const [errorMsg, setErrorMsg]   = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [saving, setSaving]       = useState(false)
  const [fieldError, setFieldError] = useState('')

  useEffect(() => {
    const hash   = window.location.hash
    const parsed = parseHash(hash)

    // Clean URL immediately — tokens never visible in address bar
    window.history.replaceState({}, '', '/auth/callback')

    if (parsed.error) {
      const msg = parsed.error_description
        ? decodeURIComponent(parsed.error_description.replace(/\+/g, ' '))
        : 'El enlace no es válido.'
      setErrorMsg(
        parsed.error === 'access_denied' && msg.toLowerCase().includes('expired')
          ? 'El enlace ha caducado (válido 1 hora). Solicita uno nuevo desde la app.'
          : msg
      )
      setStatus('error')
      return
    }

    // Also handle query-param errors (e.g. some redirect paths)
    const qError = searchParams.get('error')
    if (qError) {
      setErrorMsg(searchParams.get('error_description') ?? 'El enlace no es válido.')
      setStatus('error')
      return
    }

    if (parsed.access_token && parsed.refresh_token) {
      supabase.auth
        .setSession({ access_token: parsed.access_token, refresh_token: parsed.refresh_token })
        .then(({ error }) => {
          if (error) {
            setErrorMsg('No se pudo verificar la sesión. Inténtalo de nuevo.')
            setStatus('error')
          } else {
            setStatus(parsed.type === 'recovery' ? 'reset' : 'confirmed')
          }
        })
      return
    }

    setErrorMsg('Enlace incompleto. Solicita un nuevo email de verificación desde la app.')
    setStatus('error')
  }, [searchParams])

  const handleReset = async () => {
    setFieldError('')
    if (!password)               { setFieldError('Introduce una contraseña'); return }
    if (password.length < 6)     { setFieldError('Mínimo 6 caracteres'); return }
    if (password !== confirm)    { setFieldError('Las contraseñas no coinciden'); return }

    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)

    if (error) { setFieldError(error.message); return }
    setStatus('reset_done')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">

        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Verificando…</p>
          </>
        )}

        {status === 'confirmed' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Email confirmado!</h1>
            <p className="text-gray-500">Tu cuenta está activa. Ya puedes iniciar sesión en la app Tavero.</p>
          </>
        )}

        {status === 'reset' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1 text-left">Nueva contraseña</h1>
            <p className="text-gray-500 text-left mb-6 text-sm">Elige una contraseña segura para tu cuenta.</p>
            <div className="flex flex-col gap-4 text-left">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-indigo-400"
                />
              </div>
              {fieldError && <p className="text-red-500 text-sm">{fieldError}</p>}
              <button
                onClick={handleReset}
                disabled={saving}
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Guardando…' : 'Guardar contraseña'}
              </button>
            </div>
          </>
        )}

        {status === 'reset_done' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Contraseña actualizada!</h1>
            <p className="text-gray-500">Ya puedes iniciar sesión en la app Tavero con tu nueva contraseña.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo ha ido mal</h1>
            <p className="text-gray-500">{errorMsg}</p>
          </>
        )}

      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    }>
      <AuthCallback />
    </Suspense>
  )
}
