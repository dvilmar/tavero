import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { translateAuthError } from '@/lib/authErrors'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'

const CHECK_EMAIL_URL = `${process.env.EXPO_PUBLIC_MENU_URL?.replace('/menu', '') ?? 'https://tavero-web.vercel.app'}/api/check-email`

export default function LoginScreen() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleLogin = async () => {
    setError('')
    if (!email.trim()) { setError('Introduce tu email'); return }
    if (!password)     { setError('Introduce tu contraseña'); return }

    setLoading(true)

    try {
      const res = await fetch(CHECK_EMAIL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const { exists } = await res.json()
      if (!exists) {
        setError('No existe ninguna cuenta con ese email. ¿Quieres registrarte?')
        setLoading(false)
        return
      }
    } catch {
      // ignore network failure on check
    }

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
          <Text className="text-muted mt-1.5 text-[15px]">Gestiona el menú de tu bar</Text>
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
          <PasswordInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
          />

          {error ? (
            <View className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <Text className="text-danger text-sm leading-relaxed">{error}</Text>
            </View>
          ) : null}

          <Button label="Iniciar sesión" onPress={handleLogin} loading={loading} className="mt-2" />

          <Pressable onPress={() => router.push('/(auth)/forgot-password')} className="items-center py-1">
            <Text className="text-muted text-sm">
              ¿Olvidaste tu contraseña?{' '}
              <Text className="text-accent font-semibold">Recupérala</Text>
            </Text>
          </Pressable>
        </View>

        <View className="mt-10 pt-6 border-t border-border items-center">
          <Text className="text-muted text-sm">
            ¿No tienes cuenta?{' '}
            <Text className="text-accent font-semibold" onPress={() => router.push('/(auth)/register')}>
              Regístrate
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
