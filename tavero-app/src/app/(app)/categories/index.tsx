import { Fragment, useCallback, useState } from 'react'
import { Alert, Image, Modal, Pressable, ScrollView, Switch, Text, View } from 'react-native'
import { useFocusEffect, router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/context/ThemeContext'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { sanitizeText } from '@/lib/utils'
import { createCategorySchema } from '@/lib/validation'
import { useRestaurant } from '@/context/RestaurantContext'
import { haptic } from '@/lib/haptics'
import { pickImage, uploadImage } from '@/lib/storage'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { Toast } from '@/components/ui/Toast'
import { ImagePickerField } from '@/components/ui/ImagePickerField'
import { CategoryRowSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/hooks/useToast'
import { DESIGN_TOKENS } from '@/lib/designTokens'
import type { Category } from '@/lib/types'

type FormState = { name: string; description: string }
const emptyForm: FormState = { name: '', description: '' }

type MenuOption = { id: string; name: string }

export default function CategoriesScreen() {
  const { restaurant } = useRestaurant()
  const { t } = useTranslation()
  const categorySchema = createCategorySchema(t)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [categories, setCategories] = useState<Category[]>([])
  const [productCounts, setProductCounts] = useState<Map<string, number>>(new Map())
  const [menus, setMenus] = useState<MenuOption[]>([])
  const [menuId, setMenuId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const toast = useToast()

  const load = useCallback(async () => {
    if (!restaurant) {
      setCategories([])
      setMenus([])
      setLoading(false)
      return
    }
    setLoading(true)
    const [catResult, menuResult, prodsResult] = await Promise.all([
      (supabase as any)
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('sort_order', { ascending: true }),
      (supabase as any)
        .from('menus')
        .select('id, name')
        .eq('restaurant_id', restaurant.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('products')
        .select('category_id')
        .eq('restaurant_id', restaurant.id),
    ])
    if (catResult.error) {
      Alert.alert(t('common.error'), catResult.error.message)
      setLoading(false)
      return
    }
    setCategories(catResult.data ?? [])
    setMenus(menuResult.data ?? [])
    const counts = new Map<string, number>()
    for (const p of (prodsResult.data ?? []) as { category_id: string }[]) {
      counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1)
    }
    setProductCounts(counts)
    setLoading(false)
  }, [restaurant, t])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setMenuId(null)
    setImageUrl(null)
    setPendingImageUri(null)
    setModalVisible(true)
  }
  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({ name: cat.name, description: cat.description ?? '' })
    setMenuId((cat as any).menu_id ?? null)
    setImageUrl((cat as any).image_url ?? null)
    setPendingImageUri(null)
    setModalVisible(true)
  }

  const handlePickImage = async () => {
    const uri = await pickImage('categories')
    if (!uri) return
    setPendingImageUri(uri)
    setImageUrl(uri)
  }

  const handleSave = async () => {
    if (!restaurant) return
    const result = categorySchema.safeParse(form)
    if (!result.success) {
      Alert.alert(t('common.error'), result.error.flatten().fieldErrors.name?.[0] ?? t('categories.nameRequired'))
      return
    }
    setSaving(true)
    const payload = { name: form.name.trim(), description: form.description.trim() || null, menu_id: menuId || null }
    let categoryId = editing?.id ?? null
    if (editing) {
      const { error } = await (supabase as any).from('categories').update(payload).eq('id', editing.id)
      if (error) { Alert.alert(t('common.error'), error.message); setSaving(false); return }
    } else {
      const nextSortOrder = categories.length > 0
        ? Math.max(...categories.map((c) => c.sort_order)) + 1
        : 0
      const { data, error } = await (supabase as any).from('categories').insert({ ...payload, sort_order: nextSortOrder, restaurant_id: restaurant.id }).select('id').single()
      if (error) { Alert.alert(t('common.error'), error.message); setSaving(false); return }
      categoryId = data.id
    }
    if (pendingImageUri && categoryId) {
      setUploading(true)
      const uploaded = await uploadImage(pendingImageUri, 'categories', restaurant.id, categoryId)
      setUploading(false)
      if (uploaded) {
        await (supabase as any).from('categories').update({ image_url: uploaded }).eq('id', categoryId)
      }
    }
    setSaving(false)
    setModalVisible(false)
    haptic.success()
    toast.show(editing ? t('categories.updated') : t('categories.created'))
    load()
  }

  const handleToggle = async (cat: Category) => {
    haptic.select()
    const { error } = await (supabase as any).from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id)
    if (error) {
      Alert.alert(t('common.error'), error.message)
      return
    }
    setCategories((prev) => prev.map((c) => c.id === cat.id ? { ...c, is_active: !cat.is_active } : c))
  }

  const handleDelete = (cat: Category) => {
    Alert.alert(
      t('categories.deleteTitle'),
      t('categories.deleteConfirm', { name: cat.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'), style: 'destructive',
          onPress: async () => {
            const { error } = await (supabase as any).from('categories').delete().eq('id', cat.id)
            if (error) {
              Alert.alert(t('common.error'), error.message)
              return
            }
            haptic.success()
            toast.show(t('categories.deleted'))
            load()
          },
        },
      ]
    )
  }

  const renderItem = (cat: Category, index: number) => {
    const count = productCounts.get(cat.id) ?? 0
    const imageUri = (cat as any).image_url as string | null

    return (
      <View style={{ marginBottom: 14 }}>
        <View
          className={`rounded-2xl overflow-hidden border ${isDark ? 'bg-surface border-border' : 'bg-white border-zinc-100'}`}
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.2 : 0.06, shadowRadius: 8, elevation: 3 }}
        >
          {/* Image banner or colored header */}
          {imageUri ? (
            <View style={{ height: 100 }}>
              <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.25)' }} />
              <View style={{ position: 'absolute', bottom: 10, left: 14, right: 14, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18, textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }} numberOfLines={1}>
                  {cat.name}
                </Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>{count} {t('products.title').toLowerCase()}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={{ height: 56, backgroundColor: isDark ? '#2A2A30' : '#F4F4F5', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isDark ? '#3A3A42' : '#E4E4E7', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 16 }}>📂</Text>
                </View>
                <Text style={{ fontWeight: '700', fontSize: 16, color: isDark ? '#F9FAFB' : '#111', flex: 1 }} numberOfLines={1}>{cat.name}</Text>
              </View>
              <View style={{ backgroundColor: isDark ? '#3A3A42' : '#E4E4E7', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
                <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 11, fontWeight: '600' }}>{count} {t('products.title').toLowerCase()}</Text>
              </View>
            </View>
          )}

          {/* Body */}
          <View style={{ padding: 14 }}>
            {/* Description */}
            {cat.description ? (
              <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 13, lineHeight: 19, marginBottom: 12 }} numberOfLines={2}>
                {cat.description}
              </Text>
            ) : null}

            {/* Status row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{
                  width: 8, height: 8, borderRadius: 4,
                  backgroundColor: cat.is_active ? (isDark ? '#4ADE80' : '#22C55E') : '#9CA3AF',
                }} />
                <Text style={{ fontSize: 13, fontWeight: '500', color: cat.is_active ? (isDark ? '#86EFAC' : '#16A34A') : (isDark ? '#9CA3AF' : '#9CA3AF') }}>
                  {cat.is_active ? t('categories.active') : t('categories.hidden')}
                </Text>
              </View>
              <Switch
                value={cat.is_active}
                onValueChange={() => handleToggle(cat)}
                trackColor={{ true: isDark ? '#FAFAFA' : '#111111', false: isDark ? '#4B5563' : '#E7E5E4' }}
                thumbColor={isDark ? '#F3F4F6' : '#FFFFFF'}
              />
            </View>

            {/* Action buttons */}
            <View className="flex-row gap-2">
              <Button label={t('common.edit')} onPress={() => openEdit(cat)} variant="secondary" className="flex-1 py-2" />
              <Pressable
                onPress={() => handleDelete(cat)}
                className={`flex-1 py-2 rounded-xl border items-center justify-center ${
                  isDark ? 'bg-surface border-red-300' : 'bg-red-100 border-red-200'
                }`}
                style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
              >
                <Text className={`font-semibold text-base ${isDark ? 'text-red-200' : 'text-red-700'}`}>
                  {t('common.delete')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <Header title={t('categories.title')} subtitle={t('common.totalCount', { count: categories.length })} />

      {loading && categories.length === 0 ? (
        <View className="px-5 py-5">
          {[0, 1, 2].map((i) => <CategoryRowSkeleton key={i} />)}
        </View>
      ) : categories.length === 0 && !loading ? (
        <EmptyState icon="📂" title={t('categories.empty')} description={t('categories.emptyDesc')} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
        >
          {categories.map((cat, i) => <Fragment key={cat.id}>{renderItem(cat, i)}</Fragment>)}
        </ScrollView>
      )}

      <Toast message={toast.message} visible={toast.visible} />

      {/* FABs - create + reorder */}
      <Pressable
        onPress={() => { haptic.light(); router.push('/(app)/categories/reorder') }}
        className="absolute right-5 w-14 h-14 bg-primary rounded-full items-center justify-center"
        style={{ bottom: 96, zIndex: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
      >
        <Ionicons name="swap-vertical-outline" size={24} color="#fff" />
      </Pressable>

      <Pressable
        onPress={() => { haptic.light(); openCreate() }}
        className="absolute right-5 w-14 h-14 bg-accent rounded-full items-center justify-center"
        style={{ bottom: 32, zIndex: 10, shadowColor: DESIGN_TOKENS.colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background px-5 pt-8">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-primary tracking-tight">
              {editing ? t('categories.editTitle') : t('categories.newTitle')}
            </Text>
            <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
              <Text className="text-muted font-medium">{t('common.cancel')}</Text>
            </Pressable>
          </View>
          <View className="gap-4">
            <ImagePickerField
              label={t('categories.imageLabel')}
              imageUrl={imageUrl}
              onPress={handlePickImage}
              uploading={uploading}
              aspectRatio={16 / 6}
            />
            <Input label={t('categories.nameLabel')} value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: sanitizeText(v, 60) }))}
              placeholder={t('categories.namePlaceholder')} />
            <Input label={t('categories.descLabel')} value={form.description}
              onChangeText={(v) => setForm((f) => ({ ...f, description: sanitizeText(v, 200) }))}
              placeholder={t('categories.descPlaceholder')} multiline />

            {/* menus.length > 0 && (...menu picker disabled...) */}

            <Button label={t('categories.save')} onPress={handleSave} loading={saving || uploading} className="mt-2" />
          </View>
        </View>
      </Modal>
    </View>
  )
}
