import { Fragment, useCallback, useMemo, useRef, useState } from 'react'
import {
  Alert, Image, Pressable, ScrollView, Switch, Text, TextInput, View,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/context/ThemeContext'
import { Svg, Circle, Line } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useRestaurant } from '@/context/RestaurantContext'
import { haptic } from '@/lib/haptics'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductRowSkeleton } from '@/components/ui/Skeleton'
import { DESIGN_TOKENS } from '@/lib/designTokens'
import type { Category, Product } from '@/lib/types'

type Section = { title: string; catId: string; imageUrl: string | null; data: Product[] }

function SearchIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2.2} strokeLinecap="round">
      <Circle cx={11} cy={11} r={7} />
      <Line x1={16.5} y1={16.5} x2={22} y2={22} />
    </Svg>
  )
}

export default function ProductsScreen() {
  const { restaurant } = useRestaurant()
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [sections, setSections] = useState<Section[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null)
  const catScrollRef = useRef<ScrollView>(null)

  const load = useCallback(async () => {
    if (!restaurant) {
      setSections([])
      setCount(0)
      setLoading(false)
      return
    }
    setLoading(true)
    const [{ data: cats, error: categoriesError }, { data: prods, error: productsError }] = await Promise.all([
      supabase.from('categories').select('*').eq('restaurant_id', restaurant.id).order('sort_order'),
      supabase.from('products').select('*').eq('restaurant_id', restaurant.id).order('sort_order'),
    ])
    if (categoriesError || productsError) {
      Alert.alert(t('common.error'), (categoriesError ?? productsError)?.message ?? '')
      setLoading(false)
      return
    }
    const built: Section[] = (cats ?? []).map((cat: Category) => ({
      title: cat.name,
      catId: cat.id,
      imageUrl: (cat as any).image_url ?? null,
      data: (prods ?? []).filter((p: Product) => p.category_id === cat.id),
    }))
    setSections(built)
    setCount(prods?.length ?? 0)
    setLoading(false)
  }, [restaurant, t])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const filtered = useMemo(() => {
    let result = sections
    if (selectedCatId) {
      result = result.filter((s) => s.catId === selectedCatId)
    }
    const q = search.trim().toLowerCase()
    if (!q) return result
    return result
      .map((s) => ({ ...s, data: s.data.filter((p) => p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)) }))
      .filter((s) => s.data.length > 0)
  }, [sections, search, selectedCatId])

  const handleToggle = async (product: Product) => {
    haptic.select()
    const { error } = await supabase.from('products').update({ out_of_stock: !product.out_of_stock }).eq('id', product.id)
    if (error) {
      Alert.alert(t('common.error'), error.message)
      return
    }
    setSections((prev) =>
      prev.map((s) => ({ ...s, data: s.data.map((p) => p.id === product.id ? { ...p, out_of_stock: !product.out_of_stock } : p) }))
    )
  }

  const [resettingStock, setResettingStock] = useState(false)
  const outOfStockCount = sections.reduce((acc, s) => acc + s.data.filter((p) => p.out_of_stock).length, 0)

  const handleResetAllStock = async () => {
    if (!restaurant || outOfStockCount === 0) return
    haptic.select()
    setResettingStock(true)
    const ids = sections.flatMap((s) => s.data.filter((p) => p.out_of_stock).map((p) => p.id))
    const { error } = await supabase.from('products').update({ out_of_stock: false }).in('id', ids)
    setResettingStock(false)
    if (error) { Alert.alert(t('common.error'), error.message); return }
    setSections((prev) => prev.map((s) => ({ ...s, data: s.data.map((p) => ({ ...p, out_of_stock: false })) })))
    haptic.success()
  }

  const isSearching = search.trim().length > 0
  const visibleProductsCount = filtered.reduce((acc, section) => acc + section.data.length, 0)
  const moneyFormatter = useMemo(
    () => new Intl.NumberFormat(i18n.language === 'en' ? 'en-GB' : 'es-ES', { style: 'currency', currency: 'EUR' }),
    [i18n.language]
  )

  const renderProductItem = useCallback(
    (product: Product) => (
      <View style={{ marginBottom: 10, opacity: product.out_of_stock ? 0.45 : 1 }}>
        <Card className="p-3">
          <View className="flex-row items-center">
            {product.image_url ? (
              <Image
                source={{ uri: product.image_url }}
                style={{ width: 52, height: 52, borderRadius: 10 }}
                resizeMode="cover"
              />
            ) : (
              <View className="rounded-xl bg-accentSoft items-center justify-center" style={{ width: 52, height: 52 }}>
                <Text className="text-xl">🍽️</Text>
              </View>
            )}

            <Pressable
              onPress={() => router.push(`/(app)/products/${product.id}`)}
              style={{ flex: 1, marginLeft: 10 }}
            >
              <Text className={`font-semibold text-[15px] ${!product.is_active ? 'text-muted line-through' : 'text-primary'}`}>
                {product.name}
              </Text>
              {!product.is_active ? (
                <Text className="text-muted text-xs font-bold mt-0.5 uppercase tracking-wide">
                  {t('categories.hidden')}
                </Text>
              ) : product.out_of_stock ? (
                <Text className="text-danger text-xs font-bold mt-0.5 uppercase tracking-wide">
                  {t('products.outOfStock')}
                </Text>
              ) : product.description ? (
                <Text className="text-muted text-xs mt-0.5" numberOfLines={1}>{product.description}</Text>
              ) : null}
              <Text className="font-bold text-sm mt-1 text-accent">
                {moneyFormatter.format(Number(product.price))}
              </Text>
            </Pressable>

          <Switch
            value={!product.out_of_stock}
            onValueChange={() => handleToggle(product)}
            trackColor={{ true: isDark ? '#FAFAFA' : '#111111', false: isDark ? '#4B5563' : '#E7E5E4' }}
            thumbColor={isDark ? '#F3F4F6' : '#FFFFFF'}
          />
          </View>
        </Card>
      </View>
    ),
    [isSearching, isDark, moneyFormatter, handleToggle]
  )

  return (
    <View className="flex-1 bg-background">
      <Header title={t('products.title')} subtitle={t('common.totalCount', { count })} />

      <View className="pt-3 pb-1">
        <View className="mx-5 bg-surface border border-border rounded-xl px-3.5 py-2.5 flex-row items-center">
          <View className="mr-2">
            <SearchIcon />
          </View>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('products.searchPlaceholder')}
            placeholderTextColor="#94A3B8"
            className="flex-1 text-primary text-[15px]"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>

        {sections.length > 1 && (
          <ScrollView
            ref={catScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, gap: 8 }}
          >
            <Pressable
              onPress={() => setSelectedCatId(null)}
              className={`px-3.5 py-1.5 rounded-full border ${
                selectedCatId === null
                  ? isDark ? 'bg-zinc-100 border-zinc-100' : 'bg-zinc-900 border-zinc-900'
                  : 'bg-surface border-border'
              }`}
            >
              <Text className={`text-xs font-semibold ${
                selectedCatId === null
                  ? isDark ? 'text-zinc-900' : 'text-white'
                  : 'text-muted'
              }`}>{t('categories.allCategories')}</Text>
            </Pressable>
            {sections.map((s) => {
              const active = selectedCatId === s.catId
              return (
                <Pressable
                  key={s.catId}
                  onPress={() => setSelectedCatId(active ? null : s.catId)}
                  className={`px-3.5 py-1.5 rounded-full border ${
                    active
                      ? isDark ? 'bg-zinc-100 border-zinc-100' : 'bg-zinc-900 border-zinc-900'
                      : 'bg-surface border-border'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${
                    active
                      ? isDark ? 'text-zinc-900' : 'text-white'
                      : 'text-muted'
                  }`}>{s.title}</Text>
                </Pressable>
              )
            })}
          </ScrollView>
        )}

      </View>

      {outOfStockCount > 0 && !loading && (
        <Pressable
          onPress={handleResetAllStock}
          disabled={resettingStock}
          className="mx-5 mt-2 mb-1 flex-row items-center justify-between px-4 py-3 rounded-xl bg-amber-50 border border-amber-200"
          style={{ opacity: resettingStock ? 0.6 : 1 }}
        >
          <View className="flex-row items-center gap-2.5">
            <Text className="text-base">⚠️</Text>
            <Text className="text-amber-800 text-sm font-semibold">
              {t('products.outOfStockBanner', { count: outOfStockCount })}
            </Text>
          </View>
          <Text className="text-amber-700 text-xs font-bold uppercase tracking-wide">
            {resettingStock ? '...' : t('products.resetAll')}
          </Text>
        </Pressable>
      )}

      {loading && sections.length === 0 ? (
        <View className="px-5 pt-4">
          {[0, 1, 2, 3].map((i) => <ProductRowSkeleton key={i} />)}
        </View>
      ) : visibleProductsCount === 0 && !loading ? (
        <EmptyState
          icon={isSearching ? '🔍' : '🍽️'}
          title={isSearching ? t('products.emptySearchTitle') : t('products.emptyTitle')}
          description={isSearching ? t('products.emptySearchDesc', { search }) : t('products.emptyDesc')}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((section) => (
            <View key={section.catId} style={{ marginBottom: 12 }}>
              {section.imageUrl ? (
                <View className="rounded-xl overflow-hidden mt-5 mb-3" style={{ height: 64 }}>
                  <Image source={{ uri: section.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  <View className="absolute inset-0 bg-black/50 justify-end px-3 pb-2">
                    <Text className="text-white text-xs font-bold uppercase tracking-widest">{section.title}</Text>
                  </View>
                </View>
              ) : (
                <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mt-5 mb-2.5 px-1">
                  {section.title}
                </Text>
              )}
              {section.data.map((product) => <Fragment key={product.id}>{renderProductItem(product)}</Fragment>)}
            </View>
          ))}
        </ScrollView>
      )}

      <Pressable
        onPress={() => { haptic.light(); router.push('/(app)/products/reorder') }}
        className="absolute right-5 w-14 h-14 bg-primary rounded-full items-center justify-center"
        style={{ bottom: 96, zIndex: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
      >
        <Ionicons name="swap-vertical-outline" size={24} color="#fff" />
      </Pressable>

      <Pressable
        onPress={() => { haptic.light(); router.push('/(app)/products/new') }}
        className="absolute right-5 w-14 h-14 bg-accent rounded-full items-center justify-center"
        style={{ bottom: 32, zIndex: 10, shadowColor: DESIGN_TOKENS.colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </Pressable>
    </View>
  )
}
