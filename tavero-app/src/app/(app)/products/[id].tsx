import { useCallback, useEffect, useState } from 'react'
import {
  Alert, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, Text, View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { pickAndUpload } from '@/lib/storage'
import { useRestaurant } from '@/context/RestaurantContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ImagePickerField } from '@/components/ui/ImagePickerField'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import type { Category } from '@/lib/types'

const DAYS = [
  { label: 'Lun', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Mié', value: 3 },
  { label: 'Jue', value: 4 },
  { label: 'Vie', value: 5 },
  { label: 'Sáb', value: 6 },
  { label: 'Dom', value: 0 },
]

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const isNew = id === 'new'
  const { restaurant } = useRestaurant()
  const insets = useSafeAreaInsets()

  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [availableDays, setAvailableDays] = useState<number[]>([])
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
    if (!data) return
    setName(data.name)
    setDescription(data.description ?? '')
    setPrice(String(data.price))
    setCategoryId(data.category_id)
    setImageUrl(data.image_url ?? null)
    const days = (data.product_availability ?? []).map((a: { day_of_week: number }) => a.day_of_week)
    // Empty array means available every day → show all days highlighted
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

  const validate = () => {
    const e: typeof errors = {}
    if (!name.trim()) e.name = 'El nombre es obligatorio'
    if (!price || isNaN(Number(price)) || Number(price) < 0) e.price = 'Precio inválido'
    if (!categoryId) e.category = 'Selecciona una categoría'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // Ensures the product row exists before uploading (needed for new products)
  const ensureProductSaved = async (): Promise<string | null> => {
    if (savedProductId) return savedProductId
    if (!validate()) return null

    setSaving(true)
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        price: parseFloat(price) || 0,
        sort_order: 0,
        category_id: categoryId,
        restaurant_id: restaurant!.id,
      })
      .select('id')
      .single()
    setSaving(false)

    if (error) { Alert.alert('Error', error.message); return null }
    setSavedProductId(data.id)
    return data.id
  }

  const handlePickImage = async () => {
    // For new products, save first so we have a real ID for the storage path
    const productId = await ensureProductSaved()
    if (!productId) return

    setUploading(true)
    const url = await pickAndUpload('products', restaurant!.id, productId)
    setUploading(false)

    if (!url) return
    setImageUrl(url)

    // Persist immediately so the URL is not lost if the user navigates away
    await supabase.from('products').update({ image_url: url }).eq('id', productId)
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      price: parseFloat(price),
      category_id: categoryId,
      restaurant_id: restaurant!.id,
      image_url: imageUrl,
    }

    let productId = savedProductId ?? id
    if (isNew && !savedProductId) {
      const { data, error } = await supabase.from('products').insert({ ...payload, sort_order: 0 }).select('id').single()
      if (error) { Alert.alert('Error', error.message); setSaving(false); return }
      productId = data.id
    } else {
      const { error } = await supabase.from('products').update(payload).eq('id', productId)
      if (error) { Alert.alert('Error', error.message); setSaving(false); return }
    }

    // Todos los días = disponible siempre (guardamos array vacío)
    const daysToSave = availableDays.length === 7 ? [] : availableDays
    await supabase.from('product_availability').delete().eq('product_id', productId)
    if (daysToSave.length > 0) {
      await supabase.from('product_availability').insert(
        daysToSave.map((day) => ({ product_id: productId, day_of_week: day }))
      )
    }

    setSaving(false)
    toast.show(isNew ? 'Producto creado' : 'Producto guardado')
    setTimeout(() => router.back(), 600)
  }

  const handleDelete = () => {
    Alert.alert('Eliminar producto', `¿Eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          await supabase.from('products').delete().eq('id', savedProductId ?? id)
          router.back()
        },
      },
    ])
  }

  if (loading) return null

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      {/* Header */}
      <View className="px-6 pt-14 pb-4 bg-white border-b border-border flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-4 w-9 h-9 rounded-full bg-borderSoft items-center justify-center" hitSlop={8}>
          <Text className="text-primary text-2xl leading-none" style={{ marginTop: -2 }}>‹</Text>
        </Pressable>
        <Text className="text-xl font-bold text-primary flex-1">
          {isNew ? 'Nuevo producto' : 'Editar producto'}
        </Text>
        {!isNew && (
          <Pressable onPress={handleDelete}>
            <Text className="text-danger font-semibold">Eliminar</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 + insets.bottom, gap: 20 }}>
        {/* Imagen */}
        <ImagePickerField
          label="Foto del plato (opcional)"
          imageUrl={imageUrl}
          onPress={handlePickImage}
          uploading={uploading}
          aspectRatio={16 / 9}
        />

        {/* Nombre */}
        <Input
          label="Nombre"
          value={name}
          onChangeText={setName}
          placeholder="Patatas bravas"
          error={errors.name}
        />

        {/* Descripción */}
        <Input
          label="Descripción (opcional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Con salsa brava y alioli"
          multiline
          numberOfLines={2}
        />

        {/* Precio */}
        <Input
          label="Precio (€)"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          placeholder="3.50"
          error={errors.price}
        />

        {/* Categoría */}
        <View className="gap-2">
          <Text className="text-sm font-medium text-primary">Categoría</Text>
          {categories.length === 0 ? (
            <View className="bg-accentSoft border border-accent/20 rounded-xl px-4 py-3">
              <Text className="text-sm text-primary font-medium">No tienes categorías aún</Text>
              <Text className="text-xs text-muted mt-1">
                Crea al menos una categoría antes de añadir productos.
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {categories.map((cat) => {
                const selected = categoryId === cat.id
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    className={`px-4 py-2.5 rounded-full border-2 ${
                      selected ? 'bg-primary border-primary' : 'bg-surface border-border'
                    }`}
                  >
                    <Text className={`text-sm font-semibold ${selected ? 'text-white' : 'text-primary'}`}>
                      {selected ? '✓ ' : ''}{cat.name}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          )}
          {errors.category && <Text className="text-xs text-danger mt-0.5">{errors.category}</Text>}
        </View>

        {/* Disponibilidad por días */}
        <Card>
          <Text className="text-sm font-semibold text-primary mb-1">Disponibilidad</Text>
          <Text className="text-xs text-muted mb-3">
            Todos los días marcados = disponible toda la semana
          </Text>
          <View className="flex-row justify-between">
            {DAYS.map((day) => {
              const active = availableDays.includes(day.value)
              return (
                <Pressable
                  key={day.value}
                  onPress={() => toggleDay(day.value)}
                  className={`items-center justify-center w-10 h-10 rounded-full border ${
                    active ? 'bg-primary border-primary' : 'bg-white border-border'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-muted'}`}>
                    {day.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </Card>

        <Button label="Guardar producto" onPress={handleSave} loading={saving} />
      </ScrollView>
      <Toast message={toast.message} visible={toast.visible} />
    </KeyboardAvoidingView>
  )
}
