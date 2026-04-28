import { Alert, Linking, Pressable, Switch, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { haptic } from '@/lib/haptics'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/context/AuthContext'
import { saveLanguage, type SupportedLanguage } from '@/lib/i18n'

export default function SettingsScreen() {
  const { colorScheme, setColorScheme } = useColorScheme()
  const { signOut } = useAuth()
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()
  const { t, i18n } = useTranslation()
  const currentLang = (i18n.resolvedLanguage ?? i18n.language).slice(0, 2) as SupportedLanguage
  const deleteAccountUrl = process.env.EXPO_PUBLIC_ACCOUNT_DELETE_URL
    ?? `${(process.env.EXPO_PUBLIC_MENU_URL ?? 'https://tavero.app/menu').replace('/menu', '')}/delete-account`

  const handleDarkToggle = (value: boolean) => {
    haptic.select()
    setColorScheme(value ? 'dark' : 'light')
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
      {/* Header */}
      <View className="px-6 pt-14 pb-4 bg-surface border-b border-border flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="mr-4 w-9 h-9 rounded-full bg-borderSoft items-center justify-center"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Text className="text-primary text-2xl leading-none" style={{ marginTop: -2 }}>‹</Text>
        </Pressable>
        <Text className="text-xl font-bold text-primary flex-1">{t('settings.title')}</Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 + insets.bottom, gap: 20 }}>

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
                  currentLang === 'es' ? 'text-white' : 'text-primary'
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
                  currentLang === 'en' ? 'text-white' : 'text-primary'
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
                <Text className={`text-sm font-semibold ${isDark ? 'text-zinc-50' : 'text-accent'}`}>{t('common.signOut')}</Text>
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

      </View>
    </View>
  )
}
