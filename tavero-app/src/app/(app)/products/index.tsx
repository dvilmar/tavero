import { useCallback, useMemo, useState } from 'react'
import {
  Image, Pressable, ScrollView, Switch, Text, TextInput, View,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist'
import { Svg, Circle, Line } from 'react-native-svg'
import { supabase } from '@/lib/supabase'
import { useRestaurant } from '@/context/RestaurantContext'
import { haptic } from '@/lib/haptics'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductRowSkeleton } from '@/components/ui/Skeleton'
import type { Category, Product } from '@/lib/types'

type Section = { title: string; catId: string; data: Product[] }

function SearchIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2.2} strokeLinecap="round">
      <Circle cx={11} cy={11} r={7} />
      <Line x1={16.5} y1={16.5} x2={22} y2={22} />
    </Svg>
  )
}

function DragHandle() {
  return (
    <View style={{ width: 18, gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ width: 18, height: 2.5, backgroundColor: '#CBD5E1', borderRadius: 2 }} />
      ))}
    </View>
  )
}

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

  const handleDragEnd = async (catId: string, data: Product[]) => {
    const reordered = data.map((p, i) => ({ ...p, sort_order: i }))
    setSections((prev) => prev.map((s) => s.catId === catId ? { ...s, data: reordered } : s))
    haptic.light()
    await Promise.all(reordered.map((p) =>
      supabase.from('products').update({ sort_order: p.sort_order }).eq('id', p.id)
    ))
  }

  const isSearching = search.trim().length > 0

  const renderItem = (catId: string) => ({ item, drag, isActive }: RenderItemParams<Product>) => (
    <ScaleDecorator>
      <View style={{ marginBottom: 10, opacity: isActive ? 0.9 : 1 }}>
        <Card className="p-3">
          <View className="flex-row items-center">
            {!isSearching && (
              <Pressable
                onLongPress={() => { haptic.light(); drag() }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="mr-2 px-1.5 py-3 justify-center"
              >
                <DragHandle />
              </Pressable>
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
              <Text className={`font-semibold text-[15px] ${item.is_active ? 'text-primary' : 'text-mutedLight line-through'}`}>
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
              onValueChange={() => handleToggle(item)}
              trackColor={{ true: '#0D9488', false: '#E7E5E4' }}
              thumbColor="#fff"
            />
          </View>
        </Card>
      </View>
    </ScaleDecorator>
  )

  return (
    <View className="flex-1 bg-background">
      <Header title="Productos" subtitle={`${count} en total`} />

      <View className="px-5 pt-3 pb-1">
        <View className="bg-surface border border-border rounded-xl px-3.5 py-2.5 flex-row items-center">
          <View className="mr-2">
            <SearchIcon />
          </View>
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
        >
          {filtered.map((section) => (
            <View key={section.catId}>
              <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mt-5 mb-2.5 px-1">
                {section.title}
              </Text>
              <DraggableFlatList
                data={section.data}
                onDragEnd={({ data }) => handleDragEnd(section.catId, data)}
                keyExtractor={(item) => item.id}
                renderItem={renderItem(section.catId)}
                scrollEnabled={false}
              />
            </View>
          ))}
        </ScrollView>
      )}

      <Pressable
        onPress={() => { haptic.light(); router.push('/(app)/products/new') }}
        className="absolute bottom-8 right-5 w-14 h-14 bg-accent rounded-full items-center justify-center"
        style={{ shadowColor: '#0D9488', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
      >
        <Text style={{ color: '#fff', fontSize: 32, lineHeight: 32, fontWeight: '300', textAlign: 'center' }}>+</Text>
      </Pressable>
    </View>
  )
}
