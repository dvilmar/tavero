import { EmailOtpType, Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import * as Linking from 'expo-linking'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'

type AuthContextValue = {
  session: Session | null
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const pendingRoute = { current: 'recovery' | 'auth' | null }

async function handleDeepLink(url: string): Promise<'recovery' | 'auth' | null> {
  const parsed = Linking.parse(url)
  const query = parsed.queryParams ?? {}
  const fragmentParams = new URLSearchParams(parsed.fragment ?? '')
  const queryParam = (key: string): string | null => {
    const raw = query[key]
    if (typeof raw === 'string') return raw
    if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0]
    return null
  }

  const access_token  = fragmentParams.get('access_token') ?? queryParam('access_token')
  const refresh_token = fragmentParams.get('refresh_token') ?? queryParam('refresh_token')
  const deepLinkType = fragmentParams.get('type') ?? queryParam('type')

  if (access_token && refresh_token) {
    pendingRoute.current = deepLinkType === 'recovery' ? 'recovery' : 'auth'
    const { error } = await supabase.auth.setSession({ access_token, refresh_token })
    if (error) throw error
    return pendingRoute.current
  }

  const code = queryParam('code')
  if (code) {
    pendingRoute.current = 'auth'
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) throw error
    return 'auth'
  }

  const tokenHash = queryParam('token_hash')
  const type = queryParam('type')
  if (tokenHash && type) {
    pendingRoute.current = type === 'recovery' ? 'recovery' : 'auth'
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    })
    if (error) throw error
    return pendingRoute.current
  }

  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const hasHandledInitialLink = useRef(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)

      if (event === 'INITIAL_SESSION') {
        setLoading(false)
        return
      }
      if (event === 'TOKEN_REFRESH_ERROR') {
        console.warn('Token refresh failed, forcing logout')
        supabase.auth.signOut()
        return
      }
      if (event === 'SIGNED_IN') {
        if (pendingRoute.current === 'recovery') {
          pendingRoute.current = null
          router.replace('/(auth)/reset-password')
          return
        }
        router.replace('/(app)/dashboard')
      }
      if (event === 'SIGNED_OUT')         router.replace('/(auth)/login')
    })

    // Explicitly get session with error handling to prevent crash on invalid refresh token
    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.warn('Session retrieval failed, clearing:', error.message)
          await supabase.auth.signOut()
          return
        }
        setSession(data.session)
      } catch (err: any) {
        console.warn('Unhandled session error, forcing logout:', err?.message ?? err)
        await supabase.auth.signOut()
      } finally {
        setLoading(false)
      }
    }
    initSession()

    const linkSub = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url).catch((err) => {
        console.error('Error handling deep link', err)
      })
    })

    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          hasHandledInitialLink.current = true
          return handleDeepLink(url)
        }
      })
      .catch((err) => {
        console.error('Error reading initial deep link', err)
      })

    return () => {
      subscription.unsubscribe()
      linkSub.remove()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
