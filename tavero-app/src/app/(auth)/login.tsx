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

export default function LoginScreen() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const { t } = useTranslation()
  const authSchema = createAuthSchema(t)

  const handleLogin = async () => {
    setError('')
    const result = authSchema.safeParse({ email: email.trim(), password })
    if (!result.success) {
      setError(result.error.flatten().fieldErrors.email?.[0] ?? result.error.flatten().fieldErrors.password?.[0])
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) { setError(translateAuthError(error.message)); return }
    router.replace('/(app)/dashboard')
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerClassName="flex-1 justify-center px-6 py-12">
        {/* Hero */}
        <View className="items-center mb-12">
          <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-4">
            <Text className="text-3xl">🍽️</Text>
          </View>
          <Text className="text-4xl font-bold text-primary tracking-tight">Tavero</Text>
          <Text className="text-muted mt-1.5 text-[15px]">{t('login.tagline')}</Text>
        </View>

        <View className="gap-4">
          <Input
            label={t('login.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder={t('login.emailPlaceholder')}
            returnKeyType="next"
          />
          <PasswordInput
            label={t('login.password')}
            value={password}
            onChangeText={setPassword}
            placeholder={t('login.passwordPlaceholder')}
            onSubmitEditing={handleLogin}
            returnKeyType="done"
          />

          {error ? (
            <View className="bg-surface border border-danger rounded-xl px-3 py-2.5">
              <Text className="text-danger text-sm leading-relaxed">{error}</Text>
            </View>
          ) : null}

          <Button label={t('login.submit')} onPress={handleLogin} loading={loading} className="mt-2" />

          <Pressable onPress={() => router.push('/(auth)/forgot-password')} className="items-center py-1">
            <Text className="text-muted text-sm">
              {t('login.forgotPassword')}{' '}
              <Text className="text-accent font-semibold">{t('login.recover')}</Text>
            </Text>
          </Pressable>
        </View>

        <View className="mt-10 pt-6 border-t border-border flex-row items-center justify-center gap-1">
          <Text className="text-muted text-sm">{t('login.noAccount')}</Text>
          <Pressable onPress={() => router.push('/(auth)/register')} hitSlop={8}>
            <Text className="text-accent font-semibold text-sm">{t('login.register')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
