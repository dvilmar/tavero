import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { translateAuthError } from '@/lib/authErrors'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)
  const { t } = useTranslation()

  const handleReset = async () => {
    setError('')
    if (!password || !confirm)  { setError(t('resetPassword.errors.fieldsRequired')); return }
    if (password.length < 6)    { setError(t('resetPassword.errors.passwordTooShort')); return }
    if (password !== confirm)   { setError(t('resetPassword.errors.passwordsMismatch')); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) { setError(translateAuthError(error.message)); return }
    setDone(true)
  }

  if (done) {
    return (
      <View className="flex-1 bg-background justify-center px-6">
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-accentSoft items-center justify-center">
            <Text className="text-4xl">🔐</Text>
          </View>
        </View>
        <Text className="text-3xl font-bold text-primary mb-2 text-center tracking-tight">
          {t('resetPassword.successTitle')}
        </Text>
        <Text className="text-muted text-base mb-8 text-center leading-relaxed">
          {t('resetPassword.successBody')}
        </Text>
        <Button label={t('resetPassword.goToLogin')} onPress={() => router.replace('/(auth)/login')} />
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
          <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-5">
            <Text className="text-3xl">🔑</Text>
          </View>
          <Text className="text-3xl font-bold text-primary tracking-tight">{t('resetPassword.title')}</Text>
          <Text className="text-muted mt-1 text-[15px]">{t('resetPassword.tagline')}</Text>
        </View>

        <View className="gap-4">
          <PasswordInput
            label={t('resetPassword.newPassword')}
            value={password}
            onChangeText={setPassword}
            placeholder={t('resetPassword.passwordPlaceholder')}
            returnKeyType="next"
          />
          <PasswordInput
            label={t('resetPassword.confirmPassword')}
            value={confirm}
            onChangeText={setConfirm}
            placeholder={t('resetPassword.confirmPlaceholder')}
            onSubmitEditing={handleReset}
            returnKeyType="done"
          />

          {error ? (
            <View className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <Text className="text-danger text-sm leading-relaxed">{error}</Text>
            </View>
          ) : null}

          <Button label={t('resetPassword.submit')} onPress={handleReset} loading={loading} className="mt-2" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
