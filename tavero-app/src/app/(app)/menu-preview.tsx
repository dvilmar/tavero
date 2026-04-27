import { useEffect } from 'react'
import { ActivityIndicator, Linking, View } from 'react-native'
import { router } from 'expo-router'
import { useRestaurant } from '@/context/RestaurantContext'

const MENU_BASE = process.env.EXPO_PUBLIC_MENU_URL ?? 'https://tavero-web.vercel.app/menu'

export default function MenuPreviewScreen() {
  const { restaurant } = useRestaurant()

  useEffect(() => {
    if (!restaurant?.slug) { router.back(); return }
    const url = `${MENU_BASE}/${restaurant.slug}`
    Linking.openURL(url).then(() => router.back())
  }, [restaurant])

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color="#0D9488" />
    </View>
  )
}
