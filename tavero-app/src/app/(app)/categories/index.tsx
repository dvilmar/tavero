import { useCallback, useState } from 'react'
import { Alert, Modal, Pressable, Switch, Text, View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist'
import { supabase } from '@/lib/supabase'
import { useRestaurant } from '@/context/RestaurantContext'
import { haptic } from '@/lib/haptics'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { Toast } from '@/components/ui/Toast'
import { CategoryRowSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/hooks/useToast'
import type { Category } from '@/lib/types'

type FormState = { name: string; description: string }
const emptyForm: FormState = { name: '', description: '' }

function DragHandle() {
  return (
    <View style={{ width: 18, gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ width: 18, height: 2.5, backgroundColor: '#CBD5E1', borderRadius: 2 }} />
      ))}
    </View>
  )
}

export default function CategoriesScreen() {
  const { restaurant } = useRestaurant()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const load = useCallback(async () => {
    if (!restaurant) return
    setLoading(true)
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('sort_order', { ascending: true })
    setCategories(data ?? [])
    setLoading(false)
  }, [restaurant])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalVisible(true) }
  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({ name: cat.name, description: cat.description ?? '' })
    setModalVisible(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Error', 'El nombre es obligatorio'); return }
    setSaving(true)
    const payload = { name: form.name.trim(), description: form.description.trim() || null }
    if (editing) {
      await supabase.from('categories').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('categories').insert({ ...payload, sort_order: categories.length, restaurant_id: restaurant!.id })
    }
    setSaving(false)
    setModalVisible(false)
    haptic.success()
    toast.show(editing ? 'Categoría actualizada' : 'Categoría creada')
    load()
  }

  const handleToggle = async (cat: Category) => {
    haptic.select()
    await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id)
    setCategories((prev) => prev.map((c) => c.id === cat.id ? { ...c, is_active: !cat.is_active } : c))
  }

  const handleDelete = (cat: Category) => {
    Alert.alert(
      'Eliminar categoría',
      `¿Seguro que quieres eliminar "${cat.name}"? Se borrarán también sus productos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            await supabase.from('categories').delete().eq('id', cat.id)
            haptic.success()
            toast.show('Categoría eliminada')
            load()
          },
        },
      ]
    )
  }

  const handleDragEnd = async ({ data }: { data: Category[] }) => {
    const reordered = data.map((c, i) => ({ ...c, sort_order: i }))
    setCategories(reordered)
    haptic.light()
    await Promise.all(reordered.map((c) =>
      supabase.from('categories').update({ sort_order: c.sort_order }).eq('id', c.id)
    ))
  }

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Category>) => (
    <ScaleDecorator>
      <View style={{ marginBottom: 12, opacity: isActive ? 0.9 : 1 }}>
        <Card className={isActive ? 'shadow-lg' : ''}>
          <View className="flex-row items-start">
            <Pressable
              onLongPress={() => { haptic.light(); drag() }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="mr-3 px-2 py-4 justify-center"
            >
              <DragHandle />
            </Pressable>

            <View className="flex-1 mr-3">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className={`font-semibold text-base ${item.is_active ? 'text-primary' : 'text-mutedLight line-through'}`}>
                  {item.name}
                </Text>
                <Badge label={item.is_active ? 'Activa' : 'Oculta'} variant={item.is_active ? 'success' : 'muted'} />
              </View>
              {item.description ? (
                <Text className="text-muted text-sm leading-relaxed">{item.description}</Text>
              ) : null}
            </View>

            <Switch
              value={item.is_active}
              onValueChange={() => handleToggle(item)}
              trackColor={{ true: '#0D9488', false: '#E7E5E4' }}
              thumbColor="#fff"
            />
          </View>

          <View className="flex-row gap-2 mt-4 pt-4 border-t border-borderSoft">
            <Button label="Editar" onPress={() => openEdit(item)} variant="secondary" className="flex-1 py-2" />
            <Button label="Eliminar" onPress={() => handleDelete(item)} variant="ghost" className="flex-1 py-2" />
          </View>
        </Card>
      </View>
    </ScaleDecorator>
  )

  return (
    <View className="flex-1 bg-background">
      <Header title="Categorías" subtitle={`${categories.length} en total`} />

      {loading && categories.length === 0 ? (
        <View className="px-5 py-5">
          {[0, 1, 2].map((i) => <CategoryRowSkeleton key={i} />)}
        </View>
      ) : categories.length === 0 && !loading ? (
        <EmptyState icon="📂" title="Aún no tienes categorías"
          description="Crea tu primera sección del menú: tapas, bebidas, postres…" />
      ) : (
        <DraggableFlatList
          data={categories}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 96 }}
        />
      )}

      <Toast message={toast.message} visible={toast.visible} />

      <Pressable
        onPress={() => { haptic.light(); openCreate() }}
        className="absolute bottom-8 right-5 w-14 h-14 bg-accent rounded-full items-center justify-center"
        style={{ shadowColor: '#0D9488', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
      >
        <Text style={{ color: '#fff', fontSize: 32, lineHeight: 32, fontWeight: '300', textAlign: 'center' }}>+</Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background px-5 pt-8">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-primary tracking-tight">
              {editing ? 'Editar categoría' : 'Nueva categoría'}
            </Text>
            <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
              <Text className="text-muted font-medium">Cancelar</Text>
            </Pressable>
          </View>
          <View className="gap-4">
            <Input label="Nombre" value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="Tapas, bebidas, postres..." />
            <Input label="Descripción (opcional)" value={form.description}
              onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              placeholder="Una breve descripción" multiline />
            <Button label="Guardar" onPress={handleSave} loading={saving} className="mt-2" />
          </View>
        </View>
      </Modal>
    </View>
  )
}
