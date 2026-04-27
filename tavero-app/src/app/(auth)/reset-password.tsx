import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  const handleReset = async () => {
    setError('')
    if (!password || !confirm)  { setError('Completa los dos campos'); return }
    if (password.length < 6)    { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (password !== confirm)   { setError('Las contraseñas no coinciden'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) { setError(error.message); return }
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
          ¡Contraseña actualizada!
        </Text>
        <Text className="text-muted text-base mb-8 text-center leading-relaxed">
          Ya puedes iniciar sesión con tu nueva contraseña.
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
          <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-5">
            <Text className="text-3xl">🔑</Text>
          </View>
          <Text className="text-3xl font-bold text-primary tracking-tight">Nueva contraseña</Text>
          <Text className="text-muted mt-1 text-[15px]">Elige una contraseña segura</Text>
        </View>

        <View className="gap-4">
          <PasswordInput
            label="Nueva contraseña"
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

          <Button label="Guardar contraseña" onPress={handleReset} loading={loading} className="mt-2" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
