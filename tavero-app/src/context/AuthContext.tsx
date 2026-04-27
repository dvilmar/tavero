import { Session, User } from '@supabase/supabase-js'
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

async function handleDeepLink(url: string): Promise<void> {
  const fragment = url.split('#')[1]
  if (!fragment) return
  const params = new URLSearchParams(fragment)
  const access_token  = params.get('access_token')
  const refresh_token = params.get('refresh_token')
  if (!access_token || !refresh_token) return
  // setSession triggers onAuthStateChange which handles navigation
  await supabase.auth.setSession({ access_token, refresh_token })
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
      if (event === 'SIGNED_IN')          router.replace('/(app)/dashboard')
      if (event === 'SIGNED_OUT')         router.replace('/(auth)/login')
      if (event === 'PASSWORD_RECOVERY')  router.replace('/(auth)/reset-password')
    })

    // Handle deep links while the app is open
    const linkSub = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url)
    })

    // Handle deep link that cold-launched the app
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url)
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
