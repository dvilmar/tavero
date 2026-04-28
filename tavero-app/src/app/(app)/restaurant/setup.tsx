import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { pickImage, uploadImage } from '@/lib/storage'
import { useAuth } from '@/context/AuthContext'
import { useRestaurant } from '@/context/RestaurantContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImagePickerField } from '@/components/ui/ImagePickerField'

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
  const { t } = useTranslation()

  const [name, setName]               = useState(restaurant?.name ?? '')
  const [description, setDescription] = useState(restaurant?.description ?? '')
  const [logoUrl, setLogoUrl]         = useState<string | null>(restaurant?.logo_url ?? null)
  const [pendingLogoUri, setPendingLogoUri] = useState<string | null>(null)
  const [loading, setLoading]         = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [errors, setErrors]           = useState<{ name?: string }>({})
  const [serverError, setServerError] = useState('')

  const isEditing = !!restaurant
  const slug = isEditing ? (restaurant?.slug ?? '') : slugify(name)
  const previewUrl = `${MENU_BASE}/${slug || '...'}`

  const validate = () => {
    const e: typeof errors = {}
    if (!name.trim()) e.name = t('setup.nameRequired')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePickLogo = async () => {
    const uri = await pickImage('logos')
    if (!uri) return

    setPendingLogoUri(uri)
    setLogoUrl(uri)
  }

  const handleSave = async () => {
    if (!user) return
    if (!validate()) return
    setServerError('')
    setLoading(true)

    if (isEditing && restaurant) {
      const { error } = await supabase
        .from('restaurants')
        .update({ name, description })
        .eq('id', restaurant.id)
      if (error) { setServerError(error.message); setLoading(false); return }

      if (pendingLogoUri) {
        setUploading(true)
        const url = await uploadImage(pendingLogoUri, 'logos', user.id, restaurant.id)
        setUploading(false)
        if (!url) {
          setServerError(t('products.imageUploadError'))
          setLoading(false)
          return
        }
        const { error: logoError } = await supabase
          .from('restaurants')
          .update({ logo_url: url })
          .eq('id', restaurant.id)
        if (logoError) {
          setServerError(logoError.message)
          setLoading(false)
          return
        }
      }
    } else {
      const finalSlug = slugify(name)
      if (!finalSlug) {
        setServerError(t('setup.slugInvalid'))
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('restaurants')
        .insert({ user_id: user.id, name, slug: finalSlug, description })
        .select('id')
        .single()
      if (error) {
        setServerError(error.code === '23505' ? t('setup.slugConflict') : error.message)
        setLoading(false)
        return
      }

      if (pendingLogoUri && data?.id) {
        setUploading(true)
        const url = await uploadImage(pendingLogoUri, 'logos', user.id, data.id)
        setUploading(false)
        if (!url) {
          setServerError(t('products.imageUploadError'))
          setLoading(false)
          return
        }
        await supabase.from('restaurants').update({ logo_url: url }).eq('id', data.id)
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
      <View className="px-6 pt-14 pb-4 bg-surface border-b border-border flex-row items-center">
        {isEditing && (
          <Pressable onPress={() => router.back()} className="mr-4 w-9 h-9 rounded-full bg-borderSoft items-center justify-center" hitSlop={8}>
            <Text className="text-primary text-2xl leading-none" style={{ marginTop: -2 }}>‹</Text>
          </Pressable>
        )}
        <View className="flex-1">
          <Text className="text-xl font-bold text-primary">
            {isEditing ? t('setup.titleEdit') : t('setup.titleCreate')}
          </Text>
          <Text className="text-xs text-muted mt-0.5">
            {isEditing ? t('setup.subtitleEdit') : t('setup.subtitleCreate')}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerClassName="px-6 py-6 gap-5">
        {/* Logo */}
        <View className="items-center py-2">
          <ImagePickerField
            label={t('setup.logoLabel')}
            imageUrl={logoUrl}
            onPress={handlePickLogo}
            uploading={uploading}
            circular
          />
        </View>

        {/* Name */}
        <Input
          label={t('setup.nameLabel')}
          value={name}
          onChangeText={setName}
          placeholder={t('setup.namePlaceholder')}
          error={errors.name}
        />

        {/* URL preview */}
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-primary">{t('setup.urlLabel')}</Text>
          <View className="bg-borderSoft border border-border rounded-xl px-4 py-3">
            <Text className="text-sm text-muted" numberOfLines={1}>{previewUrl}</Text>
          </View>
          <Text className="text-xs text-muted">{t('setup.urlNote')}</Text>
        </View>

        {/* Description */}
        <Input
          label={t('setup.descLabel')}
          value={description}
          onChangeText={setDescription}
          placeholder={t('setup.descPlaceholder')}
          multiline
          numberOfLines={3}
        />

        {serverError ? (
          <View className="bg-surface border border-danger rounded-xl px-4 py-3">
            <Text className="text-danger text-sm font-medium">{serverError}</Text>
          </View>
        ) : null}

        <Button
          label={isEditing ? t('setup.submitEdit') : t('setup.submitCreate')}
          onPress={handleSave}
          loading={loading}
          className="mt-2"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
