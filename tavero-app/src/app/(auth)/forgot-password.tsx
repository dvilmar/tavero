import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { checkEmailExists, RESET_REDIRECT_URL } from '@/lib/auth'
import { translateAuthError } from '@/lib/authErrors'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ForgotPasswordScreen() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')
  const { t } = useTranslation()

  const handleSend = async () => {
    setError('')
    if (!email.trim())        { setError(t('forgotPassword.errors.emailRequired')); return }
    if (!email.includes('@')) { setError(t('forgotPassword.errors.invalidEmail')); return }

    setLoading(true)

    try {
      const exists = await checkEmailExists(email.trim())
      if (!exists) {
        setError(t('forgotPassword.errors.noAccount'))
        setLoading(false)
        return
      }
    } catch {
      // Network check failed — proceed with sending anyway
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: RESET_REDIRECT_URL,
    })
    setLoading(false)

    if (error) { setError(translateAuthError(error.message)); return }
    setSent(true)
  }

  if (sent) {
    return (
      <View className="flex-1 bg-background justify-center px-6">
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-accentSoft items-center justify-center">
            <Text className="text-4xl">✉️</Text>
          </View>
        </View>
        <Text className="text-3xl font-bold text-primary mb-2 text-center tracking-tight">
          {t('forgotPassword.successTitle')}
        </Text>
        <Text className="text-muted text-base mb-2 text-center leading-relaxed px-2">
          {t('forgotPassword.successBody')}{'\n'}
          <Text className="text-primary font-semibold">{email}</Text>
        </Text>
        <Text className="text-muted text-sm mb-8 text-center">
          {t('forgotPassword.successNote')}
        </Text>
        <Button label={t('forgotPassword.backToLogin')} onPress={() => router.replace('/(auth)/login')} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerClassName="flex-1 justify-center px-6 py-12">
        <View className="mb-10">
          <Pressable onPress={() => router.back()} className="mb-6" hitSlop={8}>
            <Text className="text-muted font-medium">{t('common.back')}</Text>
          </Pressable>
          <Text className="text-3xl font-bold text-primary tracking-tight">
            {t('forgotPassword.title')}
          </Text>
          <Text className="text-muted mt-1 text-[15px]">
            {t('forgotPassword.tagline')}
          </Text>
        </View>

        <View className="gap-4">
          <Input
            label={t('forgotPassword.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder={t('forgotPassword.emailPlaceholder')}
            returnKeyType="done"
            onSubmitEditing={handleSend}
          />

          {error ? (
            <View className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <Text className="text-danger text-sm leading-relaxed">{error}</Text>
            </View>
          ) : null}

          <Button label={t('forgotPassword.submit')} onPress={handleSend} loading={loading} className="mt-2" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
