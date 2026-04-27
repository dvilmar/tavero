import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { pickImage, uploadImage } from '@/lib/storage'
import { useAuth } from '@/context/AuthContext'
import { useRestaurant } from '@/context/RestaurantContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImagePickerField } from '@/components/ui/ImagePickerField'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'

const MENU_BASE = process.env.EXPO_PUBLIC_MENU_URL ?? 'https://tavero.app/menu'

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function RestaurantSetupScreen() {
  const { user } = useAuth()
  const { restaurant, refresh } = useRestaurant()
  const toast = useToast()

  const [name, setName]               = useState(restaurant?.name ?? '')
  const [description, setDescription] = useState(restaurant?.description ?? '')
  const [logoUrl, setLogoUrl]         = useState<string | null>(restaurant?.logo_url ?? null)
  const [pendingLogoUri, setPendingLogoUri] = useState<string | null>(null)
  const [loading, setLoading]         = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [errors, setErrors]           = useState<{ name?: string }>({})

  const isEditing = !!restaurant
  const slug = isEditing ? restaurant!.slug : slugify(name)
  const previewUrl = `${MENU_BASE}/${slug || '...'}`

  const validate = () => {
    const e: typeof errors = {}
    if (!name.trim()) e.name = 'El nombre es obligatorio'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePickLogo = async () => {
    const uri = await pickImage('logos')
    if (!uri) return

    if (isEditing) {
      setUploading(true)
      const url = await uploadImage(uri, 'logos', user!.id, restaurant!.id)
      setUploading(false)
      if (!url) return
      setLogoUrl(url)
      await supabase.from('restaurants').update({ logo_url: url }).eq('id', restaurant!.id)
      await refresh()
      toast.show('Logo actualizado')
    } else {
      setPendingLogoUri(uri)
      setLogoUrl(uri)
    }
  }

  const handleSave = async () => {
    if (!validate()) return
    setLoading(true)

    if (isEditing) {
      const { error } = await supabase
        .from('restaurants')
        .update({ name, description, logo_url: logoUrl })
        .eq('id', restaurant.id)
      if (error) { Alert.alert('Error', error.message); setLoading(false); return }
    } else {
      const finalSlug = slugify(name)
      const { data, error } = await supabase
        .from('restaurants')
        .insert({ user_id: user!.id, name, slug: finalSlug, description })
        .select('id')
        .single()
      if (error) {
        Alert.alert('Error', error.code === '23505'
          ? 'Ya existe un bar con un nombre muy parecido. Cámbialo ligeramente.'
          : error.message)
        setLoading(false)
        return
      }

      if (pendingLogoUri && data?.id) {
        const url = await uploadImage(pendingLogoUri, 'logos', user!.id, data.id)
        if (url) await supabase.from('restaurants').update({ logo_url: url }).eq('id', data.id)
      }
    }

    await refresh()
    setLoading(false)
    router.replace('/(app)/dashboard')
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      {/* Header */}
      <View className="px-6 pt-14 pb-4 bg-white border-b border-border flex-row items-center">
        {isEditing && (
          <Pressable onPress={() => router.back()} className="mr-4">
            <Text className="text-accent font-semibold text-base">←</Text>
          </Pressable>
        )}
        <View className="flex-1">
          <Text className="text-xl font-bold text-primary">
            {isEditing ? 'Información del bar' : 'Crea tu bar'}
          </Text>
          <Text className="text-xs text-muted mt-0.5">
            {isEditing ? 'Actualiza los datos de tu bar' : 'Configura tu bar para empezar'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerClassName="px-6 py-6 gap-5">
        {/* Logo */}
        <View className="items-center py-2">
          <ImagePickerField
            label="Logo del bar (opcional)"
            imageUrl={logoUrl}
            onPress={handlePickLogo}
            uploading={uploading}
            circular
          />
        </View>

        {/* Name */}
        <Input
          label="Nombre del bar"
          value={name}
          onChangeText={setName}
          placeholder="Bar El Rincón"
          error={errors.name}
        />

        {/* URL preview */}
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-primary">Tu URL pública</Text>
          <View className="bg-borderSoft border border-border rounded-xl px-4 py-3">
            <Text className="text-sm text-muted" numberOfLines={1}>{previewUrl}</Text>
          </View>
          <Text className="text-xs text-muted">Generada automáticamente a partir del nombre.</Text>
        </View>

        {/* Description */}
        <Input
          label="Descripción (opcional)"
          value={description}
          onChangeText={setDescription}
          placeholder="El mejor bar del barrio, con tapas caseras y vinos de la tierra"
          multiline
          numberOfLines={3}
        />

        <Button
          label={isEditing ? 'Guardar cambios' : 'Crear bar'}
          onPress={handleSave}
          loading={loading}
          className="mt-2"
        />
      </ScrollView>

      <Toast message={toast.message} visible={toast.visible} />
    </KeyboardAvoidingView>
  )
}
