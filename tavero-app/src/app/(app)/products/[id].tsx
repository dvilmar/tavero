import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, Text, View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from 'nativewind'
import { supabase } from '@/lib/supabase'
import { pickImage, uploadImage } from '@/lib/storage'
import { useRestaurant } from '@/context/RestaurantContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ImagePickerField } from '@/components/ui/ImagePickerField'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { DESIGN_TOKENS } from '@/lib/designTokens'
import type { Category } from '@/lib/types'

const DAYS_ORDER = [
  { key: 'mon', value: 1 },
  { key: 'tue', value: 2 },
  { key: 'wed', value: 3 },
  { key: 'thu', value: 4 },
  { key: 'fri', value: 5 },
  { key: 'sat', value: 6 },
  { key: 'sun', value: 0 },
] as const

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const isNew = id === 'new'
  const { restaurant } = useRestaurant()
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()

  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null)
  const [availableDays, setAvailableDays] = useState<number[]>(isNew ? ALL_DAYS : [])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [savedProductId, setSavedProductId] = useState<string | null>(isNew ? null : id)
  const [errors, setErrors] = useState<{ name?: string; price?: string; category?: string }>({})
  const toast = useToast()

  const loadCategories = useCallback(async () => {
    if (!restaurant) return
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('sort_order')
    setCategories(data ?? [])
    if (!isNew && data?.length) setCategoryId((prev) => prev || data[0].id)
  }, [restaurant, isNew])

  const loadProduct = useCallback(async () => {
    if (isNew) return
    const { data } = await supabase
      .from('products')
      .select('*, product_availability(day_of_week)')
      .eq('id', id)
      .single()
    if (!data) { setLoading(false); return }
    setName(data.name)
    setDescription(data.description ?? '')
    setPrice(String(data.price))
    setCategoryId(data.category_id)
    setImageUrl(data.image_url ?? null)
    setPendingImageUri(null)
    const days = (data.product_availability ?? []).map((a: { day_of_week: number }) => a.day_of_week)
    setAvailableDays(days.length === 0 ? ALL_DAYS : days)
    setLoading(false)
  }, [id, isNew])

  useEffect(() => {
    loadCategories()
    loadProduct()
  }, [loadCategories, loadProduct])

  const toggleDay = (day: number) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }))
    }
  }

  const handlePriceChange = (value: string) => {
    setPrice(value)
    if (errors.price) {
      setErrors((prev) => ({ ...prev, price: undefined }))
    }
  }

  const handleCategoryChange = (value: string) => {
    setCategoryId(value)
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: undefined }))
    }
  }

  const validate = () => {
    const e: typeof errors = {}
    const normalizedPrice = price.replace(',', '.')
    if (!name.trim()) e.name = t('products.nameRequired')
    if (!normalizedPrice || isNaN(Number(normalizedPrice)) || Number(normalizedPrice) < 0) e.price = t('products.priceInvalid')
    if (!categoryId) e.category = t('products.categoryRequired')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const getNextSortOrder = useCallback(async (currentCategoryId: string): Promise<number> => {
    if (!restaurant) return 0
    const { data, error } = await supabase
      .from('products')
      .select('sort_order')
      .eq('restaurant_id', restaurant.id)
      .eq('category_id', currentCategoryId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) {
      console.error('Error calculating next product sort_order', error)
      return 0
    }
    return data?.sort_order != null ? data.sort_order + 1 : 0
  }, [restaurant])

  const handlePickImage = async () => {
    const uri = await pickImage('products')
    if (!uri) return
    setPendingImageUri(uri)
  }

  const handleSave = async () => {
    if (!restaurant) return
    if (!validate()) return
    setSaving(true)

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      price: parseFloat(price.replace(',', '.')),
      category_id: categoryId,
      restaurant_id: restaurant.id,
      image_url: imageUrl,
    }

    let productId = savedProductId ?? id
    if (isNew && !savedProductId) {
      const nextSortOrder = await getNextSortOrder(categoryId)
      const { data, error } = await supabase.from('products').insert({ ...payload, sort_order: nextSortOrder }).select('id').single()
      if (error) { Alert.alert(t('common.error'), error.message); setSaving(false); return }
      productId = data.id
    } else {
      const { error } = await supabase.from('products').update(payload).eq('id', productId)
      if (error) { Alert.alert(t('common.error'), error.message); setSaving(false); return }
    }

    if (pendingImageUri) {
      setUploading(true)
      const uploadedUrl = await uploadImage(pendingImageUri, 'products', restaurant.id, productId)
      setUploading(false)
      if (!uploadedUrl) {
        Alert.alert(t('common.error'), t('products.imageUploadError'))
        setSaving(false)
        return
      }
      setImageUrl(uploadedUrl)
      setPendingImageUri(null)
      const { error: imageError } = await supabase.from('products').update({ image_url: uploadedUrl }).eq('id', productId)
      if (imageError) {
        Alert.alert(t('common.error'), imageError.message)
        setSaving(false)
        return
      }
    }

    const daysToSave = availableDays.length === 7 ? [] : availableDays
    const { error: deleteAvailabilityError } = await supabase
      .from('product_availability')
      .delete()
      .eq('product_id', productId)
    if (deleteAvailabilityError) {
      Alert.alert(t('common.error'), deleteAvailabilityError.message)
      setSaving(false)
      return
    }
    if (daysToSave.length > 0) {
      const { error: insertAvailabilityError } = await supabase
        .from('product_availability')
        .insert(
        daysToSave.map((day) => ({ product_id: productId, day_of_week: day }))
      )
      if (insertAvailabilityError) {
        Alert.alert(t('common.error'), insertAvailabilityError.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    toast.show(isNew ? t('products.created') : t('products.saved'))
    setTimeout(() => router.back(), 600)
  }

  const handleDelete = () => {
    Alert.alert(t('products.deleteTitle'), t('products.deleteConfirm', { name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'), style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('products').delete().eq('id', savedProductId ?? id)
          if (error) {
            Alert.alert(t('common.error'), error.message)
            return
          }
          router.back()
        },
      },
    ])
  }

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.accent} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      {/* Header */}
      <View className="px-6 pt-14 pb-4 bg-surface border-b border-border flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="mr-4 w-9 h-9 rounded-full bg-borderSoft items-center justify-center"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Text className="text-primary text-2xl leading-none" style={{ marginTop: -2 }}>‹</Text>
        </Pressable>
        <Text className="text-xl font-bold text-primary flex-1">
          {isNew ? t('products.newTitle') : t('products.editTitle')}
        </Text>
        {!isNew && (
          <Pressable onPress={handleDelete} accessibilityRole="button" accessibilityLabel={t('common.delete')}>
            <Text className="text-danger font-semibold">{t('common.delete')}</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 + insets.bottom, gap: 20 }}>
        <ImagePickerField
          label={t('products.photoLabel')}
          imageUrl={pendingImageUri ?? imageUrl}
          onPress={handlePickImage}
          uploading={uploading}
          aspectRatio={16 / 9}
        />

        <Input
          label={t('products.nameLabel')}
          value={name}
          onChangeText={handleNameChange}
          placeholder={t('products.namePlaceholder')}
          error={errors.name}
        />

        <Input
          label={t('products.descLabel')}
          value={description}
          onChangeText={setDescription}
          placeholder={t('products.descPlaceholder')}
          multiline
          numberOfLines={2}
        />

        <Input
          label={t('products.priceLabel')}
          value={price}
          onChangeText={handlePriceChange}
          keyboardType="decimal-pad"
          placeholder="3.50"
          error={errors.price}
        />

        {/* Category */}
        <View className="gap-2">
          <Text className="text-sm font-medium text-primary">{t('products.categoryLabel')}</Text>
          {categories.length === 0 ? (
            <View className="bg-accentSoft border border-accent/20 rounded-xl px-4 py-3">
              <Text className="text-sm text-primary font-medium">{t('products.noCategoriesTitle')}</Text>
              <Text className="text-xs text-muted mt-1">{t('products.noCategoriesDesc')}</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {categories.map((cat) => {
                const selected = categoryId === cat.id
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => handleCategoryChange(cat.id)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    className={`px-4 py-2.5 rounded-full border-2 ${
                      selected
                        ? (isDark ? 'bg-zinc-200 border-zinc-200' : 'bg-zinc-900 border-zinc-900')
                        : 'bg-surface border-border'
                    }`}
                  >
                    <Text className={`text-sm font-semibold ${selected ? (isDark ? 'text-zinc-900' : 'text-white') : 'text-primary'}`}>
                      {selected ? '✓ ' : ''}{cat.name}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          )}
          {errors.category && <Text className="text-xs text-danger mt-0.5">{errors.category}</Text>}
        </View>

        {/* Availability */}
        <Card>
          <Text className="text-sm font-semibold text-primary mb-1">{t('products.availabilityLabel')}</Text>
          <Text className="text-xs text-muted mb-3">{t('products.availabilityHint')}</Text>
          <View className="flex-row justify-between">
            {DAYS_ORDER.map((day) => {
              const active = availableDays.includes(day.value)
              return (
                <Pressable
                  key={day.value}
                  onPress={() => toggleDay(day.value)}
                  className={`items-center justify-center w-10 h-10 rounded-full border ${
                    active
                      ? (isDark ? 'bg-zinc-200 border-zinc-200' : 'bg-zinc-900 border-zinc-900')
                      : 'bg-surface border-border'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${active ? (isDark ? 'text-zinc-900' : 'text-white') : 'text-muted'}`}>
                    {t(`products.days.${day.key}`)}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </Card>

        <Button label={t('products.submit')} onPress={handleSave} loading={saving} />
      </ScrollView>
      <Toast message={toast.message} visible={toast.visible} />
    </KeyboardAvoidingView>
  )
}
