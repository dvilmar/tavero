import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { translateAuthError } from '@/lib/authErrors'
import { createAuthSchema } from '@/lib/validation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'

export default function RegisterScreen() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)
  const { t } = useTranslation()
  const authSchema = createAuthSchema(t)

  const handleRegister = async () => {
    setError('')
    const result = authSchema.safeParse({ email: email.trim(), password })
    if (!result.success) {
      setError(result.error.flatten().fieldErrors.email?.[0] ?? result.error.flatten().fieldErrors.password?.[0])
      return
    }
    if (password !== confirm) { setError(t('register.errors.passwordsMismatch')); return }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password })
    setLoading(false)

    if (error) {
      if (error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('user already exists')) {
        setError(t('register.errors.alreadyRegistered'))
      } else {
        setError(translateAuthError(error.message))
      }
      return
    }

    if (data.user?.identities?.length === 0) {
      setError(t('register.errors.alreadyRegistered'))
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <View className="flex-1 bg-background justify-center px-6">
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-accentSoft items-center justify-center">
            <Text className="text-4xl">✉️</Text>
          </View>
        </View>
        <Text className="text-3xl font-bold text-primary mb-2 text-center tracking-tight">
          {t('register.successTitle')}
        </Text>
        <Text className="text-muted text-base mb-8 text-center leading-relaxed px-2">
          {t('register.successBody')}{'\n'}
          <Text className="text-primary font-semibold">{email}</Text>
        </Text>
        <Button label={t('register.goToLogin')} onPress={() => router.replace('/(auth)/login')} />
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
          <Text className="text-3xl font-bold text-primary tracking-tight">{t('register.title')}</Text>
          <Text className="text-muted mt-1 text-[15px]">{t('register.tagline')}</Text>
        </View>

        <View className="gap-4">
          <Input
            label={t('register.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder={t('register.emailPlaceholder')}
            returnKeyType="next"
          />
          <PasswordInput
            label={t('register.password')}
            value={password}
            onChangeText={setPassword}
            placeholder={t('register.passwordPlaceholder')}
            returnKeyType="next"
          />
          <PasswordInput
            label={t('register.confirmPassword')}
            value={confirm}
            onChangeText={setConfirm}
            placeholder={t('register.confirmPlaceholder')}
            onSubmitEditing={handleRegister}
            returnKeyType="done"
          />

          {error ? (
            <View className="bg-surface border border-danger rounded-xl px-3 py-2.5">
              <Text className="text-danger text-sm leading-relaxed">{error}</Text>
            </View>
          ) : null}

          <Button label={t('register.submit')} onPress={handleRegister} loading={loading} className="mt-2" />
        </View>

        <View className="mt-10 pt-6 border-t border-border items-center">
          <Text className="text-muted text-sm">
            {t('register.hasAccount')}{' '}
            <Text className="text-accent font-semibold" onPress={() => router.back()}>
              {t('register.signIn')}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
