import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { translateAuthError } from '@/lib/authErrors'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const RESET_REDIRECT  = process.env.EXPO_PUBLIC_MENU_URL
  ? `${process.env.EXPO_PUBLIC_MENU_URL.replace('/menu', '')}/auth/callback`
  : 'https://tavero-web.vercel.app/auth/callback'

const CHECK_EMAIL_URL = process.env.EXPO_PUBLIC_MENU_URL
  ? `${process.env.EXPO_PUBLIC_MENU_URL.replace('/menu', '')}/api/check-email`
  : 'https://tavero-web.vercel.app/api/check-email'

export default function ForgotPasswordScreen() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleSend = async () => {
    setError('')
    if (!email.trim())        { setError('Introduce tu email'); return }
    if (!email.includes('@')) { setError('Introduce un email válido'); return }

    setLoading(true)

    try {
      const res = await fetch(CHECK_EMAIL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const { exists } = await res.json()
      if (!exists) {
        setError('No existe ninguna cuenta con ese email.')
        setLoading(false)
        return
      }
    } catch {
      // Network check failed — proceed with sending anyway
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: RESET_REDIRECT,
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
          Revisa tu email
        </Text>
        <Text className="text-muted text-base mb-2 text-center leading-relaxed px-2">
          Hemos enviado el enlace de recuperación a{'\n'}
          <Text className="text-primary font-semibold">{email}</Text>
        </Text>
        <Text className="text-muted text-sm mb-8 text-center">
          Puede tardar unos minutos. Revisa también el spam.
        </Text>
        <Button label="Volver al inicio de sesión" onPress={() => router.replace('/(auth)/login')} />
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
            <Text className="text-muted font-medium">← Volver</Text>
          </Pressable>
          <Text className="text-3xl font-bold text-primary tracking-tight">
            Recuperar contraseña
          </Text>
          <Text className="text-muted mt-1 text-[15px]">
            Te mandamos un enlace para restablecerla
          </Text>
        </View>

        <View className="gap-4">
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="tu@email.com"
          />

          {error ? (
            <View className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <Text className="text-danger text-sm leading-relaxed">{error}</Text>
            </View>
          ) : null}

          <Button label="Enviar enlace" onPress={handleSend} loading={loading} className="mt-2" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
