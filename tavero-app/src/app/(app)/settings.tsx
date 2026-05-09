import { Alert, Linking, Pressable, ScrollView, Switch, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { haptic } from '@/lib/haptics'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { saveLanguage, type SupportedLanguage } from '@/lib/i18n'

export default function SettingsScreen() {
  const { theme, setTheme } = useTheme()
  const { signOut } = useAuth()
  const isDark = theme === 'dark'
  const insets = useSafeAreaInsets()
  const { t, i18n } = useTranslation()
  const currentLang = (i18n.resolvedLanguage ?? i18n.language).slice(0, 2) as SupportedLanguage
  const deleteAccountUrl = process.env.EXPO_PUBLIC_ACCOUNT_DELETE_URL
    ?? `${(process.env.EXPO_PUBLIC_MENU_URL ?? 'https://tavero.app/menu').replace('/menu', '')}/delete-account`

  const handleDarkToggle = async (value: boolean) => {
    haptic.select()
    await setTheme(value ? 'dark' : 'light')
  }

  const handleLanguage = async (lang: SupportedLanguage) => {
    if (lang === currentLang) return
    haptic.select()
    await saveLanguage(lang)
  }

  const handleSignOut = () => {
    Alert.alert(
      t('settings.signOutTitle'),
      t('settings.signOutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.signOut'),
          style: 'destructive',
          onPress: () => {
            haptic.light()
            signOut()
          },
        },
      ],
    )
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccountTitle'),
      t('settings.deleteAccountConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.deleteAccount'),
          style: 'destructive',
          onPress: () => {
            haptic.light()
            Linking.openURL(deleteAccountUrl).catch((err) => {
              console.error('Error opening delete account URL', err)
              Alert.alert(t('common.error'), t('settings.deleteAccountOpenError'))
            })
          },
        },
      ],
    )
  }

  return (
    <View className="flex-1 bg-background">
      <Header title={t('settings.title')} backArrow />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: insets.bottom, gap: 20 }}>

        {/* Appearance */}
        <View>
          <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">
            {t('settings.appearance')}
          </Text>
          <Card>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="font-semibold text-[15px] text-primary">{t('settings.darkMode')}</Text>
                <Text className="text-muted text-xs mt-0.5">{t('settings.darkModeDesc')}</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={handleDarkToggle}
                trackColor={{ true: isDark ? '#FAFAFA' : '#111111', false: isDark ? '#4B5563' : '#E7E5E4' }}
                thumbColor={isDark ? '#F3F4F6' : '#FFFFFF'}
              />
            </View>
          </Card>
        </View>

        {/* Language */}
        <View>
          <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">
            {t('settings.languageSection')}
          </Text>
          <Card>
            <View className="flex-row items-center justify-between gap-3">
              <Pressable
                onPress={() => handleLanguage('es')}
                className={`flex-1 py-2.5 rounded-xl items-center border ${
                  currentLang === 'es'
                    ? 'bg-accent border-accent'
                    : 'bg-background border-border'
                }`}
              >
                <Text className={`font-semibold text-sm ${
                  currentLang === 'es' ? (isDark ? 'text-white' : 'text-zinc-800') : 'text-primary'
                }`}>
                  {t('settings.spanish')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleLanguage('en')}
                className={`flex-1 py-2.5 rounded-xl items-center border ${
                  currentLang === 'en'
                    ? 'bg-accent border-accent'
                    : 'bg-background border-border'
                }`}
              >
                <Text className={`font-semibold text-sm ${
                  currentLang === 'en' ? (isDark ? 'text-white' : 'text-zinc-800') : 'text-primary'
                }`}>
                  {t('settings.english')}
                </Text>
              </Pressable>
            </View>
          </Card>
        </View>

        {/* Account */}
        <View>
          <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">
            {t('settings.accountSection')}
          </Text>
          <Card>
            <View className="flex-row items-center justify-between gap-3">
              <Pressable
                onPress={handleSignOut}
                className={`flex-1 py-2.5 rounded-xl items-center border ${
                  isDark
                    ? 'bg-surface border-zinc-200'
                    : 'bg-accentSoft border-accent'
                }`}
                style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                accessibilityRole="button"
                accessibilityLabel={t('common.signOut')}
              >
                <Text className={`text-sm font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-700'}`}>{t('common.signOut')}</Text>
              </Pressable>
              <Pressable
                onPress={handleDeleteAccount}
                className={`flex-1 py-2.5 rounded-xl items-center border ${
                  isDark
                    ? 'bg-surface border-red-300'
                    : 'bg-red-100 border-red-200'
                }`}
                style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                accessibilityRole="button"
                accessibilityLabel={t('settings.deleteAccount')}
              >
                <Text className={`text-sm font-semibold ${isDark ? 'text-red-200' : 'text-red-700'}`}>{t('settings.deleteAccount')}</Text>
              </Pressable>
            </View>
          </Card>
        </View>

      </ScrollView>
    </View>
  )
}
