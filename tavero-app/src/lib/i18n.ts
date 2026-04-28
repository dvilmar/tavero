import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'

import es from '@/locales/es.json'
import en from '@/locales/en.json'

export const LANGUAGE_KEY = 'app_language'
export const SUPPORTED_LANGUAGES = ['es', 'en'] as const
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

async function getStoredLanguage(): Promise<SupportedLanguage> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY)
    if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
      return stored as SupportedLanguage
    }
  } catch {
    // ignore
  }
  return 'es'
}

export async function saveLanguage(lang: SupportedLanguage) {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang)
  } catch (err) {
    console.error('Error saving language in storage', err)
  }
  await i18n.changeLanguage(lang)
}

export async function initI18n() {
  const lng = await getStoredLanguage()

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        es: { translation: es },
        en: { translation: en },
      },
      lng,
      fallbackLng: 'es',
      interpolation: { escapeValue: false },
    })
}

export default i18n
