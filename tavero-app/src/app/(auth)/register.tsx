import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { translateAuthError } from '@/lib/authErrors'
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

  const handleRegister = async () => {
    setError('')
    if (!email.trim())          { setError('Introduce tu email'); return }
    if (!password)              { setError('Introduce una contraseña'); return }
    if (password.length < 6)    { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (password !== confirm)   { setError('Las contraseñas no coinciden'); return }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password })
    setLoading(false)

    if (error) {
      if (error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('user already exists')) {
        setError('Este email ya tiene una cuenta. Inicia sesión.')
      } else {
        setError(translateAuthError(error.message))
      }
      return
    }

    if (data.user?.identities?.length === 0) {
      setError('Este email ya tiene una cuenta. Inicia sesión.')
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
          Revisa tu email
        </Text>
        <Text className="text-muted text-base mb-8 text-center leading-relaxed px-2">
          Hemos enviado un enlace de confirmación a{'\n'}
          <Text className="text-primary font-semibold">{email}</Text>
        </Text>
        <Button label="Ir al inicio de sesión" onPress={() => router.replace('/(auth)/login')} />
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
          <Text className="text-3xl font-bold text-primary tracking-tight">Crear cuenta</Text>
          <Text className="text-muted mt-1 text-[15px]">Empieza a digitalizar tu menú</Text>
        </View>

        <View className="gap-4">
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="tu@email.com"
          />
          <PasswordInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
          />
          <PasswordInput
            label="Confirmar contraseña"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repite la contraseña"
          />

          {error ? (
            <View className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <Text className="text-danger text-sm leading-relaxed">{error}</Text>
            </View>
          ) : null}

          <Button label="Crear cuenta" onPress={handleRegister} loading={loading} className="mt-2" />
        </View>

        <View className="mt-10 pt-6 border-t border-border items-center">
          <Text className="text-muted text-sm">
            ¿Ya tienes cuenta?{' '}
            <Text className="text-accent font-semibold" onPress={() => router.back()}>
              Inicia sesión
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
