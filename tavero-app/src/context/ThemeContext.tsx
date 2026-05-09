import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => Promise<void>
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [theme, setThemeState] = useState<Theme>('light')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchTheme = async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('theme_preference')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!error && data?.theme_preference) {
        setThemeState(data.theme_preference as Theme)
      }
      setLoading(false)
    }
    fetchTheme()
  }, [user])

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme)
    if (!user) return

    await (supabase as any)
      .from('restaurants')
      .upsert(
        { user_id: user.id, theme_preference: newTheme },
        { onConflict: 'user_id' }
      )
  }, [user])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {loading ? null : children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
