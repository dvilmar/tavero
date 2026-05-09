import '../../global.css'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { I18nextProvider } from 'react-i18next'
import { vars } from 'nativewind'
import { useFonts } from 'expo-font'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'
import { RestaurantProvider } from '@/context/RestaurantContext'
import { FullScreenLoader } from '@/components/ui/FullScreenLoader'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import i18n, { initI18n } from '@/lib/i18n'

const lightThemeVars = vars({
  '--background': '255 255 255',
  '--surface': '250 250 250',
  '--primary': '10 10 10',
  '--primaryLight': '39 39 42',
  '--accent': '167 223 182',
  '--accentSoft': '232 245 233',
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
  '--accent': '129 205 145',
  '--accentSoft': '20 42 28',
  '--muted': '161 161 170',
  '--mutedLight': '113 113 122',
  '--border': '63 63 70',
  '--borderSoft': '39 39 42',
  '--danger': '248 113 113',
  '--success': '74 222 128',
})

function ThemeContent() {
  const { theme } = useTheme()
  const [i18nReady, setI18nReady] = useState(false)
  const [fontsLoaded] = useFonts({
    'Inter': require('../../assets/fonts/Inter-Regular.ttf'),
    'Montserrat': require('../../assets/fonts/Montserrat-Regular.ttf'),
    'PlayfairDisplay': require('../../assets/fonts/PlayfairDisplay-Regular.ttf'),
    'Lato': require('../../assets/fonts/Lato-Regular.ttf'),
  })

  useEffect(() => {
    initI18n()
      .catch((err) => {
        console.error('Error initializing i18n', err)
      })
      .finally(() => setI18nReady(true))
  }, [])

  const activeThemeVars = theme === 'dark' ? darkThemeVars : lightThemeVars
  const ready = i18nReady && fontsLoaded

  return (
    <View style={activeThemeVars} className="flex-1">
      <I18nextProvider i18n={i18n}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <RestaurantProvider>
              {!ready ? <FullScreenLoader /> : <Stack screenOptions={{ headerShown: false }} />}
            </RestaurantProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </I18nextProvider>
    </View>
  )
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <ThemeContent />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
