import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Restaurant } from '@/lib/types'

type RestaurantContextValue = {
  restaurant: Restaurant | null
  loading: boolean
  refresh: () => Promise<void>
}

const RestaurantContext = createContext<RestaurantContextValue | null>(null)

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRestaurant = useCallback(async () => {
    if (!user) {
      setRestaurant(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (error) {
      console.error('Error loading restaurant', error)
      setRestaurant(null)
      setLoading(false)
      return
    }
    if (data && !data.is_active) {
      supabase.from('restaurants').update({ is_active: true }).eq('id', data.id)
      data.is_active = true
    }
    setRestaurant(data ?? null)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchRestaurant() }, [fetchRestaurant])

  return (
    <RestaurantContext.Provider value={{ restaurant, loading, refresh: fetchRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  )
}

export function useRestaurant() {
  const ctx = useContext(RestaurantContext)
  if (!ctx) throw new Error('useRestaurant must be used inside RestaurantProvider')
  return ctx
}
