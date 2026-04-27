import '../../global.css'
import { Stack } from 'expo-router'
import { AuthProvider } from '@/context/AuthContext'
import { RestaurantProvider } from '@/context/RestaurantContext'

export default function RootLayout() {
  return (
    <AuthProvider>
      <RestaurantProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </RestaurantProvider>
    </AuthProvider>
  )
}
