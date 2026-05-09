'use client'

import { useEffect } from 'react'

export function TrackVisit({ restaurantId }: { restaurantId: string }) {
  useEffect(() => {
    const key = `tavero_visit_${restaurantId}`
    const last = sessionStorage.getItem(key)
    if (last) return

    sessionStorage.setItem(key, Date.now().toString())
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurant_id: restaurantId }),
    }).catch(() => {})
  }, [restaurantId])

  return null
}
