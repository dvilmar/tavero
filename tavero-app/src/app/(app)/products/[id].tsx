import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, Switch, Text, TextInput, View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from 'nativewind'
import { supabase } from '@/lib/supabase'
import { pickImage, uploadImage } from '@/lib/storage'
import { sanitizeText } from '@/lib/utils'
import { createProductSchema } from '@/lib/validation'
import { useRestaurant } from '@/context/RestaurantContext'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/ui/Header'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ImagePickerField } from '@/components/ui/ImagePickerField'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { DESIGN_TOKENS } from '@/lib/designTokens'
import type { Category, Allergen } from '@/lib/types'

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

const ALL_LABELS = [
  'vegan', 'vegetarian', 'spicy', 'gluten_free', 'dairy_free',
  'new', 'bestseller', 'homemade', 'frozen', 'on_request',
] as const

const LABEL_ICONS: Record<string, string> = {
  vegan: '🌱', vegetarian: '🥗', spicy: '🌶️', gluten_free: '🌾',
  dairy_free: '🥛', new: '✨', bestseller: '⭐',
  homemade: '👩‍🍳', frozen: '❄️', on_request: '🔔',
}

type VariantInput = { id?: string; name: string; price: string; sort_order: number }

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const isNew = id === 'new'
  const { restaurant } = useRestaurant()
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()
  const productSchema = createProductSchema(t)

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

  // New feature state
  const [isActive, setIsActive] = useState(true)
  const [allAllergens, setAllAllergens] = useState<Allergen[]>([])
  const [selectedAllergens, setSelectedAllergens] = useState<Map<string, 'contains' | 'may_contain'>>(new Map())
  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set())
  const [variants, setVariants] = useState<VariantInput[]>([])

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

  const loadAllergens = useCallback(async () => {
    const { data } = await supabase.from('allergens').select('*').order('id')
    setAllAllergens(data ?? [])
  }, [])

  const loadProduct = useCallback(async () => {
    if (isNew) return
    const { data } = await (supabase as any)
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
    setIsActive(data.is_active ?? true)
    const days = (data.product_availability ?? []).map((a: { day_of_week: number }) => a.day_of_week)
    setAvailableDays(days.length === 0 ? ALL_DAYS : days)

    // Load allergens for this product
    const { data: paData } = await supabase
      .from('product_allergens')
      .select('allergen_id, type')
      .eq('product_id', id)
    if (paData) {
      const map = new Map<string, 'contains' | 'may_contain'>()
      paData.forEach((row: { allergen_id: string; type: string }) => {
        map.set(row.allergen_id, row.type as 'contains' | 'may_contain')
      })
      setSelectedAllergens(map)
    }

    // Load labels
    const { data: plData } = await supabase
      .from('product_labels')
      .select('label')
      .eq('product_id', id)
    if (plData) {
      setSelectedLabels(new Set(plData.map((row: { label: string }) => row.label)))
    }

    // Load variants
    const { data: pvData } = await supabase
      .from('product_variants')
      .select('id, name, price, sort_order')
      .eq('product_id', id)
      .order('sort_order')
    if (pvData) {
      setVariants(pvData.map((v: { id: string; name: string; price: number; sort_order: number }) => ({
        id: v.id,
        name: v.name,
        price: String(v.price),
        sort_order: v.sort_order,
      })))
    }

    setLoading(false)
  }, [id, isNew])

  useEffect(() => {
    loadCategories()
    loadAllergens()
    loadProduct()
  }, [loadCategories, loadAllergens, loadProduct])

  const toggleDay = (day: number) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const toggleAllergen = (allergenId: string) => {
    setSelectedAllergens((prev) => {
      const next = new Map(prev)
      if (!next.has(allergenId)) {
        next.set(allergenId, 'contains')
      } else if (next.get(allergenId) === 'contains') {
        next.set(allergenId, 'may_contain')
      } else {
        next.delete(allergenId)
      }
      return next
    })
  }

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const addVariant = () => {
    setVariants((prev) => [...prev, { name: '', price: '', sort_order: prev.length }])
  }

  const updateVariant = (index: number, field: 'name' | 'price', value: string) => {
    setVariants((prev) => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  const handleNameChange = (value: string) => {
    setName(sanitizeText(value, 100))
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
  }

  const handlePriceChange = (value: string) => {
    setPrice(value)
    if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }))
  }

  const handleCategoryChange = (value: string) => {
    setCategoryId(value)
    if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }))
  }

  const validate = () => {
    const priceToValidate = variants.length > 0 ? '1.00' : price
    const result = productSchema.safeParse({ name, description, price: priceToValidate, categoryId })
    if (!result.success) {
      const e: typeof errors = {}
      const fieldErrors = result.error.flatten().fieldErrors
      if (fieldErrors.name) e.name = fieldErrors.name[0]
      if (fieldErrors.price && variants.length === 0) e.price = fieldErrors.price[0]
      if (fieldErrors.categoryId) e.category = fieldErrors.categoryId[0]
      setErrors(e)
      return false
    }
    setErrors({})
    return true
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
    if (error) return 0
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

    const basePrice = variants.length > 0
      ? (parseFloat(variants[0].price.replace(',', '.')) || 0)
      : parseFloat(price.replace(',', '.'))

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      price: basePrice,
      category_id: categoryId,
      restaurant_id: restaurant.id,
      image_url: imageUrl,
      is_active: isActive,
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

    // Upload image
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
      if (imageError) { Alert.alert(t('common.error'), imageError.message); setSaving(false); return }
    }

    // Save availability
    const daysToSave = availableDays.length === 7 ? [] : availableDays
    await supabase.from('product_availability').delete().eq('product_id', productId)
    if (daysToSave.length > 0) {
      await supabase.from('product_availability').insert(
        daysToSave.map((day) => ({ product_id: productId, day_of_week: day }))
      )
    }

    // Save allergens
    await supabase.from('product_allergens').delete().eq('product_id', productId)
    const allergenInserts = Array.from(selectedAllergens.entries()).map(([allergen_id, type]) => ({
      product_id: productId, allergen_id, type,
    }))
    if (allergenInserts.length > 0) {
      await supabase.from('product_allergens').insert(allergenInserts)
    }

    // Save labels
    await supabase.from('product_labels').delete().eq('product_id', productId)
    const labelInserts = Array.from(selectedLabels).map((label) => ({
      product_id: productId, label,
    }))
    if (labelInserts.length > 0) {
      await supabase.from('product_labels').insert(labelInserts)
    }

    // Save variants
    await supabase.from('product_variants').delete().eq('product_id', productId)
    const validVariants = variants.filter((v) => v.name.trim() && v.price.trim())
    if (validVariants.length > 0) {
      await supabase.from('product_variants').insert(
        validVariants.map((v, i) => ({
          product_id: productId,
          name: v.name.trim(),
          price: parseFloat(v.price.replace(',', '.')),
          sort_order: i,
        }))
      )
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
          if (error) { Alert.alert(t('common.error'), error.message); return }
          router.back()
        },
      },
    ])
  }

  const handleDuplicate = async () => {
    if (!restaurant || !categoryId) return
    const basePrice = variants.length > 0
      ? (parseFloat(variants[0].price.replace(',', '.')) || 0)
      : parseFloat(price.replace(',', '.'))
    const nextSortOrder = await getNextSortOrder(categoryId)
    const { data, error } = await supabase.from('products').insert({
      name: `${name} (${t('products.copy')})`,
      description: description.trim() || null,
      price: basePrice,
      category_id: categoryId,
      restaurant_id: restaurant.id,
      image_url: imageUrl,
      sort_order: nextSortOrder,
    }).select('id').single()
    if (error) { Alert.alert(t('common.error'), error.message); return }
    const newId = data.id
    // Copy availability
    const daysToSave = availableDays.length === 7 ? [] : availableDays
    if (daysToSave.length > 0) {
      await supabase.from('product_availability').insert(daysToSave.map((d) => ({ product_id: newId, day_of_week: d })))
    }
    // Copy allergens
    const allergenInserts = Array.from(selectedAllergens.entries()).map(([allergen_id, type]) => ({ product_id: newId, allergen_id, type }))
    if (allergenInserts.length > 0) await supabase.from('product_allergens').insert(allergenInserts)
    // Copy labels
    const labelInserts = Array.from(selectedLabels).map((label) => ({ product_id: newId, label }))
    if (labelInserts.length > 0) await supabase.from('product_labels').insert(labelInserts)
    // Copy variants
    const validVariants = variants.filter((v) => v.name.trim() && v.price.trim())
    if (validVariants.length > 0) {
      await supabase.from('product_variants').insert(validVariants.map((v, i) => ({ product_id: newId, name: v.name.trim(), price: parseFloat(v.price.replace(',', '.')), sort_order: i })))
    }
    toast.show(t('products.duplicated'))
    setTimeout(() => router.replace(`/(app)/products/${newId}`), 400)
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
      <Header
        title={isNew ? t('products.newTitle') : t('products.editTitle')}
        action={!isNew ? (
          <View className="flex-row items-center gap-4">
            <Pressable onPress={handleDuplicate} accessibilityRole="button" accessibilityLabel={t('products.duplicate')}>
              <Text className="text-primary font-semibold text-sm">{t('products.duplicate')}</Text>
            </Pressable>
            <Pressable onPress={handleDelete} accessibilityRole="button" accessibilityLabel={t('common.delete')}>
              <Text className="text-danger font-semibold text-sm">{t('common.delete')}</Text>
            </Pressable>
          </View>
        ) : undefined}
      />

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
          onChangeText={(v) => setDescription(sanitizeText(v, 300))}
          placeholder={t('products.descPlaceholder')}
          multiline
          numberOfLines={2}
        />

        {/* Price */}
        <View>
          <Input
            label={t('products.priceLabel')}
            value={price}
            onChangeText={handlePriceChange}
            keyboardType="decimal-pad"
            placeholder="3.50"
            error={errors.price}
            editable={variants.length === 0}
            inputStyle={variants.length > 0 ? { opacity: 0.7 } : undefined}
          />
          {variants.length > 0 && (
            <Text className="text-xs text-muted mt-1">
              {t('products.priceDisabledHint')}
            </Text>
          )}
        </View>

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
                        ? 'bg-zinc-900 border-zinc-900'
                        : 'bg-surface border-border'
                    }`}
                  >
                    <Text className={`text-sm font-semibold ${selected ? 'text-white' : 'text-primary'}`}>
                      {cat.name}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          )}
          {errors.category && <Text className="text-xs text-danger mt-0.5">{errors.category}</Text>}
        </View>

        {/* Labels */}
        <Card>
          <Text className="text-sm font-semibold text-primary mb-1 text-center">{t('products.labelsSection')}</Text>
          <Text className="text-xs text-muted mb-3 text-center">{t('products.labelsHint')}</Text>
          <View className="flex-row flex-wrap gap-2 items-center justify-center">
            {ALL_LABELS.map((label) => {
              const active = selectedLabels.has(label)
              return (
                <Pressable
                  key={label}
                  onPress={() => toggleLabel(label)}
                  className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${
                    active
                      ? 'bg-zinc-900 border-zinc-900'
                      : 'bg-surface border-border'
                  }`}
                >
                  <Text className="text-sm">{LABEL_ICONS[label]}</Text>
                  <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-primary'}`}>
                    {t(`labels.${label}`)}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </Card>

        {/* Allergens */}
        <Card>
          <Text className="text-sm font-semibold text-primary mb-1 text-center">{t('products.allergensSection')}</Text>
          <Text className="text-xs text-muted mb-3 text-center">{t('products.allergensHint')}</Text>
          <View className="flex-row flex-wrap gap-2 items-center justify-center">
            {allAllergens.map((allergen) => {
              const state = selectedAllergens.get(allergen.id)
              const isContains = state === 'contains'
              const isMayContain = state === 'may_contain'
              return (
                <Pressable
                  key={allergen.id}
                  onPress={() => toggleAllergen(allergen.id)}
                  className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${
                    isContains
                      ? 'bg-red-600 border-red-600'
                      : isMayContain
                        ? 'bg-amber-500 border-amber-500'
                        : 'bg-surface border-border'
                  }`}
                >
                  <Text className="text-sm">{allergen.icon}</Text>
                  <Text className={`text-xs font-bold ${
                    isContains ? 'text-white'
                      : isMayContain ? 'text-white'
                        : 'text-primary'
                  }`}>
                    {allergen.name}
                  </Text>
                  {state && (
                    <Text className={`text-[10px] font-bold ${
                      isContains ? 'text-red-200' : 'text-amber-100'
                    }`}>
                      {isContains ? t('products.contains') : t('products.mayContain')}
                    </Text>
                  )}
                </Pressable>
              )
            })}
          </View>
        </Card>

        {/* Price Variants */}
        <Card>
          <Text className="text-sm font-semibold text-primary mb-1">{t('products.variantsSection')}</Text>
          <Text className="text-xs text-muted mb-3">{t('products.variantsHint')}</Text>
          {variants.map((variant, index) => (
            <View key={index} className="flex-row items-center gap-2 mb-3">
              <View className="flex-1">
                <TextInput
                  value={variant.name}
                  onChangeText={(v) => updateVariant(index, 'name', v)}
                  placeholder={t('products.variantNamePlaceholder')}
                  className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-primary"
                  placeholderTextColor={isDark ? '#78716C' : '#A8A29E'}
                />
              </View>
              <View className="w-24">
                <TextInput
                  value={variant.price}
                  onChangeText={(v) => updateVariant(index, 'price', v)}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-primary"
                  placeholderTextColor={isDark ? '#78716C' : '#A8A29E'}
                />
              </View>
              <Pressable
                onPress={() => removeVariant(index)}
                className="w-10 h-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20"
              >
                <Text className="text-red-500 dark:text-red-400 text-lg">✕</Text>
              </Pressable>
            </View>
          ))}
          <Pressable
            onPress={addVariant}
            className="flex-row items-center justify-center gap-2 py-3 rounded-xl bg-accent border border-accent"
          >
            <Text className="text-white text-lg font-bold">+</Text>
            <Text className="text-sm font-semibold text-white">{t('products.addVariant')}</Text>
          </Pressable>
        </Card>

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

        {/* Visibility */}
        {!isNew && (
          <Card>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-sm font-semibold text-primary">{t('products.visibleLabel')}</Text>
                <Text className="text-xs text-muted mt-0.5">{t('products.visibleHint')}</Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ true: isDark ? '#FAFAFA' : '#111111', false: isDark ? '#4B5563' : '#E7E5E4' }}
                thumbColor={isDark ? '#F3F4F6' : '#FFFFFF'}
              />
            </View>
          </Card>
        )}

        <Button label={t('products.submit')} onPress={handleSave} loading={saving} />
      </ScrollView>
      <Toast message={toast.message} visible={toast.visible} />
    </KeyboardAvoidingView>
  )
}
