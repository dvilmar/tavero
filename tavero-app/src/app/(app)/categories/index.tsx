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

  const renderItem = (cat: Category) => (
    <View style={{ marginBottom: 12 }}>
      <Card>
        {(cat as any).image_url ? (
          <View className="rounded-xl overflow-hidden mb-3" style={{ height: 80 }}>
            <Image source={{ uri: (cat as any).image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </View>
        ) : null}
        <View className="flex-row items-start">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center gap-2 mb-1 flex-wrap">
              <Text className={`font-semibold text-base ${cat.is_active ? 'text-primary' : 'text-mutedLight line-through'}`}>
                {cat.name}
              </Text>
              <Badge
                label={cat.is_active ? t('categories.active') : t('categories.hidden')}
                variant={cat.is_active ? 'success' : 'muted'}
              />
              {(cat as any).menu_id && (() => {
                const m = menus.find((x) => x.id === (cat as any).menu_id)
                return m ? <Badge label={m.name} variant="info" /> : null
              })()}
            </View>
            {cat.description ? (
              <Text className="text-muted text-sm leading-relaxed">{cat.description}</Text>
            ) : null}
            <Text className="text-muted text-xs mt-1">
              {t('categories.productCount', { count: productCounts.get(cat.id) ?? 0 })}
            </Text>
          </View>

          <Switch
            value={cat.is_active}
            onValueChange={() => handleToggle(cat)}
            trackColor={{ true: isDark ? '#FAFAFA' : '#111111', false: isDark ? '#4B5563' : '#E7E5E4' }}
            thumbColor={isDark ? '#F3F4F6' : '#FFFFFF'}
          />
        </View>

        <View className="flex-row gap-2 mt-4 pt-4 border-t border-borderSoft">
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
      </Card>
    </View>
  )

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
          {categories.map((cat) => <Fragment key={cat.id}>{renderItem(cat)}</Fragment>)}
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

            {menus.length > 0 && (
              <View>
                <Text className="text-sm font-medium text-muted mb-2">{t('categories.menuLabel')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  <Pressable
                    onPress={() => setMenuId(null)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                      backgroundColor: menuId === null ? (isDark ? '#FAFAFA' : '#111111') : (isDark ? '#292524' : '#F5F5F4'),
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: menuId === null ? (isDark ? '#111111' : '#FAFAFA') : (isDark ? '#A8A29E' : '#78716C') }}>
                      {t('categories.menuAll')}
                    </Text>
                  </Pressable>
                  {menus.map((m) => (
                    <Pressable
                      key={m.id}
                      onPress={() => setMenuId(m.id)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                        backgroundColor: menuId === m.id ? (isDark ? '#FAFAFA' : '#111111') : (isDark ? '#292524' : '#F5F5F4'),
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: menuId === m.id ? (isDark ? '#111111' : '#FAFAFA') : (isDark ? '#A8A29E' : '#78716C') }}>
                        {m.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            <Button label={t('categories.save')} onPress={handleSave} loading={saving || uploading} className="mt-2" />
          </View>
        </View>
      </Modal>
    </View>
  )
}
