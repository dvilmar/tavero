import { EmailOtpType, Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'
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
let forceRecoveryRoute = false

async function handleDeepLink(url: string): Promise<void> {
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
    // setSession triggers onAuthStateChange which handles navigation
    const { error } = await supabase.auth.setSession({ access_token, refresh_token })
    if (!error && deepLinkType === 'recovery') {
      forceRecoveryRoute = true
    }
    return
  }

  const code = queryParam('code')
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) throw error
    return
  }

  const tokenHash = queryParam('token_hash')
  const type = queryParam('type')
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    })
    if (error) throw error
    return
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)

      if (event === 'INITIAL_SESSION') {
        setLoading(false)
        return
      }
      if (event === 'SIGNED_IN') {
        if (forceRecoveryRoute) {
          forceRecoveryRoute = false
          router.replace('/(auth)/reset-password')
          return
        }
        router.replace('/(app)/dashboard')
      }
      if (event === 'SIGNED_OUT')         router.replace('/(auth)/login')
      if (event === 'PASSWORD_RECOVERY')  router.replace('/(auth)/reset-password')
    })

    // Handle deep links while the app is open
    const linkSub = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url).catch((err) => {
        console.error('Error handling deep link', err)
      })
    })

    // Handle deep link that cold-launched the app
    Linking.getInitialURL()
      .then((url) => {
        if (url) {
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
    // onAuthStateChange SIGNED_OUT handles navigation, but force it in case of race
    router.replace('/(auth)/login')
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
