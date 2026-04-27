import { createContext, useContext, useEffect, useState } from 'react'
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

  const fetchRestaurant = async () => {
    if (!user) {
      setRestaurant(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .eq('user_id', user.id)
      .single()
    setRestaurant(data ?? null)
    setLoading(false)
  }

  useEffect(() => { fetchRestaurant() }, [user])

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
