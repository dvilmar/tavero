import { useCallback, useMemo, useRef, useState } from 'react'
import {
  Animated, Image, PanResponder, Pressable, RefreshControl,
  ScrollView, Switch, Text, TextInput, View,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useRestaurant } from '@/context/RestaurantContext'
import { haptic } from '@/lib/haptics'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductRowSkeleton } from '@/components/ui/Skeleton'
import type { Category, Product } from '@/lib/types'

type Section = { title: string; catId: string; data: Product[] }

const ITEM_H = 78

// ─── ProductRow ─────────────────────────────────────────────────────────────

type RowProps = {
  item: Product
  index: number
  total: number
  catId: string
  showHandle: boolean
  onReorder: (catId: string, from: number, to: number) => void
  onToggle: (product: Product) => void
}

function ProductRow({ item, index, total, catId, showHandle, onReorder, onToggle }: RowProps) {
  const pan = useRef(new Animated.Value(0)).current
  const [dragging, setDragging] = useState(false)

  const idxRef = useRef(index)
  const totRef = useRef(total)
  const catRef = useRef(catId)
  idxRef.current = index
  totRef.current = total
  catRef.current = catId

  const ph = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDragging(true)
        haptic.light()
      },
      onPanResponderMove: (_, g) => { pan.setValue(g.dy) },
      onPanResponderRelease: (_, g) => {
        setDragging(false)
        const to = Math.max(0, Math.min(totRef.current - 1, idxRef.current + Math.round(g.dy / ITEM_H)))
        Animated.spring(pan, { toValue: 0, useNativeDriver: false }).start()
        if (to !== idxRef.current) onReorder(catRef.current, idxRef.current, to)
      },
      onPanResponderTerminate: () => {
        setDragging(false)
        Animated.spring(pan, { toValue: 0, useNativeDriver: false }).start()
      },
    })
  ).current

  return (
    <Animated.View
      style={{
        transform: [{ translateY: pan }],
        zIndex: dragging ? 20 : 1,
        elevation: dragging ? 8 : 0,
        marginBottom: 10,
      }}
    >
      <Card className={`p-3 ${dragging ? 'opacity-90' : ''}`}>
        <View className="flex-row items-center">
          {showHandle && (
            <View
              {...ph.panHandlers}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="mr-2 px-1.5 py-3"
            >
              <Text className="text-mutedLight text-lg" style={{ letterSpacing: 1 }}>⣿</Text>
            </View>
          )}

          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={{ width: 52, height: 52, borderRadius: 10 }}
              resizeMode="cover"
            />
          ) : (
            <View className="rounded-xl bg-accentSoft items-center justify-center" style={{ width: 52, height: 52 }}>
              <Text className="text-xl">🍽️</Text>
            </View>
          )}

          <Pressable
            onPress={() => router.push(`/(app)/products/${item.id}`)}
            style={{ flex: 1, marginLeft: 10 }}
          >
            <Text
              className={`font-semibold text-[15px] ${item.is_active ? 'text-primary' : 'text-mutedLight line-through'}`}
            >
              {item.name}
            </Text>
            {item.description ? (
              <Text className="text-muted text-xs mt-0.5" numberOfLines={1}>{item.description}</Text>
            ) : null}
            <Text className="text-accent font-bold text-sm mt-1">
              {Number(item.price).toFixed(2)} €
            </Text>
          </Pressable>

          <Switch
            value={item.is_active}
            onValueChange={() => onToggle(item)}
            trackColor={{ true: '#0D9488', false: '#E7E5E4' }}
            thumbColor="#fff"
          />
        </View>
      </Card>
    </Animated.View>
  )
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ProductsScreen() {
  const { restaurant } = useRestaurant()
  const [sections, setSections] = useState<Section[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    if (!restaurant) return
    setLoading(true)
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from('categories').select('*').eq('restaurant_id', restaurant.id).order('sort_order'),
      supabase.from('products').select('*').eq('restaurant_id', restaurant.id).order('sort_order'),
    ])
    const built: Section[] = (cats ?? []).map((cat: Category) => ({
      title: cat.name,
      catId: cat.id,
      data: (prods ?? []).filter((p: Product) => p.category_id === cat.id),
    }))
    setSections(built)
    setCount(prods?.length ?? 0)
    setLoading(false)
  }, [restaurant])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sections
    return sections
      .map((s) => ({ ...s, data: s.data.filter((p) => p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)) }))
      .filter((s) => s.data.length > 0)
  }, [sections, search])

  const handleToggle = async (product: Product) => {
    haptic.select()
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    setSections((prev) =>
      prev.map((s) => ({ ...s, data: s.data.map((p) => p.id === product.id ? { ...p, is_active: !product.is_active } : p) }))
    )
  }

  const handleReorder = async (catId: string, from: number, to: number) => {
    if (from === to) return
    const si = sections.findIndex((s) => s.catId === catId)
    if (si === -1) return
    const items = [...sections[si].data]
    const [moved] = items.splice(from, 1)
    items.splice(to, 0, moved)
    const reordered = items.map((p, i) => ({ ...p, sort_order: i }))
    setSections((prev) => prev.map((s, i) => i === si ? { ...s, data: reordered } : s))
    await Promise.all(reordered.map((p) =>
      supabase.from('products').update({ sort_order: p.sort_order }).eq('id', p.id)
    ))
  }

  const isSearching = search.trim().length > 0

  return (
    <View className="flex-1 bg-background">
      <Header title="Productos" subtitle={`${count} en total`} />

      <View className="px-5 pt-3 pb-1">
        <View className="bg-surface border border-border rounded-xl px-3.5 py-2.5 flex-row items-center">
          <Text className="text-muted mr-2">🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar producto..."
            placeholderTextColor="#94A3B8"
            className="flex-1 text-primary text-[15px]"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Text className="text-muted text-base">✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {loading && sections.length === 0 ? (
        <View className="px-5 pt-4">
          {[0, 1, 2, 3].map((i) => <ProductRowSkeleton key={i} />)}
        </View>
      ) : filtered.length === 0 && !loading ? (
        <EmptyState
          icon={isSearching ? '🔍' : '🍽️'}
          title={isSearching ? 'Sin resultados' : 'Aún no tienes productos'}
          description={isSearching ? `Nada coincide con "${search}".` : 'Añade tu primer plato o bebida al menú.'}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 96 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#0D9488" />}
        >
          {filtered.map((section) => (
            <View key={section.catId}>
              <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mt-5 mb-2.5 px-1">
                {section.title}
              </Text>
              {section.data.map((item, index) => (
                <ProductRow
                  key={item.id}
                  item={item}
                  index={index}
                  total={section.data.length}
                  catId={section.catId}
                  showHandle={!isSearching}
                  onReorder={handleReorder}
                  onToggle={handleToggle}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      <Pressable
        onPress={() => { haptic.light(); router.push('/(app)/products/new') }}
        className="absolute bottom-8 right-5 w-14 h-14 bg-accent rounded-full items-center justify-center"
        style={{ shadowColor: '#0D9488', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
      >
        <Text className="text-white text-3xl font-light leading-none -mt-0.5">+</Text>
      </Pressable>
    </View>
  )
}
