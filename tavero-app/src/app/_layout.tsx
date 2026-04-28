import '../../global.css'
import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '@/context/AuthContext'
import { RestaurantProvider } from '@/context/RestaurantContext'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RestaurantProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </RestaurantProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
