import '../../global.css'
import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { I18nextProvider } from 'react-i18next'
import { AuthProvider } from '@/context/AuthContext'
import { RestaurantProvider } from '@/context/RestaurantContext'
import { FullScreenLoader } from '@/components/ui/FullScreenLoader'
import i18n, { initI18n } from '@/lib/i18n'

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false)

  useEffect(() => {
    initI18n()
      .catch((err) => {
        console.error('Error initializing i18n', err)
      })
      .finally(() => setI18nReady(true))
  }, [])

  if (!i18nReady) {
    return <FullScreenLoader />
  }

  return (
    <I18nextProvider i18n={i18n}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <RestaurantProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </RestaurantProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </I18nextProvider>
  )
}
