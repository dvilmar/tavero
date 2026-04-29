import '../../global.css'
import { useEffect, useState } from 'react'
import { Platform, View } from 'react-native'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { I18nextProvider } from 'react-i18next'
import { useColorScheme, vars } from 'nativewind'
import * as NavigationBar from 'expo-navigation-bar'
import { AuthProvider } from '@/context/AuthContext'
import { RestaurantProvider } from '@/context/RestaurantContext'
import { FullScreenLoader } from '@/components/ui/FullScreenLoader'
import i18n, { initI18n } from '@/lib/i18n'

const lightThemeVars = vars({
  '--background': '255 255 255',
  '--surface': '250 250 250',
  '--primary': '10 10 10',
  '--primaryLight': '39 39 42',
  '--accent': '17 24 39',
  '--accentSoft': '243 244 246',
  '--muted': '113 113 122',
  '--mutedLight': '161 161 170',
  '--border': '228 228 231',
  '--borderSoft': '244 244 245',
  '--danger': '220 38 38',
  '--success': '22 163 74',
})

const darkThemeVars = vars({
  '--background': '18 18 20',
  '--surface': '30 30 34',
  '--primary': '250 250 250',
  '--primaryLight': '212 212 216',
  '--accent': '82 82 91',
  '--accentSoft': '39 39 42',
  '--muted': '161 161 170',
  '--mutedLight': '113 113 122',
  '--border': '63 63 70',
  '--borderSoft': '39 39 42',
  '--danger': '248 113 113',
  '--success': '74 222 128',
})

export default function RootLayout() {
  const { colorScheme } = useColorScheme()
  const [i18nReady, setI18nReady] = useState(false)

  useEffect(() => {
    initI18n()
      .catch((err) => {
        console.error('Error initializing i18n', err)
      })
      .finally(() => setI18nReady(true))

    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden')
      NavigationBar.setBehaviorAsync('overlay-swipe')
    }
  }, [])

  const activeThemeVars = colorScheme === 'dark' ? darkThemeVars : lightThemeVars

  return (
    <View style={activeThemeVars} className="flex-1">
      <I18nextProvider i18n={i18n}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <AuthProvider>
              <RestaurantProvider>
                {!i18nReady ? <FullScreenLoader /> : <Stack screenOptions={{ headerShown: false }} />}
              </RestaurantProvider>
            </AuthProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </I18nextProvider>
    </View>
  )
}
