import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { useRestaurant } from '@/context/RestaurantContext'
import { haptic } from '@/lib/haptics'
import { Header } from '@/components/ui/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { DESIGN_TOKENS } from '@/lib/designTokens'
import type { Category } from '@/lib/types'

type RoundingMode = 'none' | 'round_05' | 'round_10'

export default function BulkPricesScreen() {
  const { restaurant } = useRestaurant()
  const { t } = useTranslation()
  const toast = useToast()

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [percentage, setPercentage] = useState('')
  const [rounding, setRounding] = useState<RoundingMode>('round_05')
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [affectedCount, setAffectedCount] = useState<number | null>(null)

  const loadCategories = useCallback(async () => {
    if (!restaurant) return
    const { data } = await (supabase as any)
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('sort_order')
    setCategories(data ?? [])
    setLoading(false)
  }, [restaurant])

  useEffect(() => { loadCategories() }, [loadCategories])

  useEffect(() => {
    const countProducts = async () => {
      if (!restaurant) return
      let query = (supabase as any)
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('restaurant_id', restaurant.id)
      if (selectedCategoryId) {
        query = query.eq('category_id', selectedCategoryId)
      }
      const { count } = await query
      setAffectedCount(count ?? 0)
    }
    countProducts()
  }, [restaurant, selectedCategoryId])

  const applyRounding = (price: number): number => {
    if (rounding === 'round_05') return Math.round(price * 20) / 20
    if (rounding === 'round_10') return Math.round(price * 10) / 10
    return Math.round(price * 100) / 100
  }

  const handleApply = async () => {
    if (!restaurant) return
    const pct = parseFloat(percentage.replace(',', '.'))
    if (isNaN(pct) || pct === 0) {
      Alert.alert(t('common.error'), t('bulkPrices.invalidPercentage'))
      return
    }

    const direction = pct > 0 ? t('bulkPrices.increase') : t('bulkPrices.decrease')
    const msg = t('bulkPrices.confirmMessage', {
      direction,
      pct: Math.abs(pct).toFixed(1),
      count: affectedCount ?? 0,
    })

    Alert.alert(t('bulkPrices.confirmTitle'), msg, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('bulkPrices.apply'),
        style: 'destructive',
        onPress: async () => {
          setApplying(true)
          let query = (supabase as any)
            .from('products')
            .select('id, price')
            .eq('restaurant_id', restaurant.id)
          if (selectedCategoryId) {
            query = query.eq('category_id', selectedCategoryId)
          }
          const { data: products } = await query
          if (!products) { setApplying(false); return }

          const multiplier = 1 + pct / 100
          for (const product of products) {
            const newPrice = applyRounding(product.price * multiplier)
            await (supabase as any)
              .from('products')
              .update({ price: Math.max(0, newPrice) })
              .eq('id', product.id)
          }

          // Also update variants
          for (const product of products) {
            const { data: variants } = await (supabase as any)
              .from('product_variants')
              .select('id, price')
              .eq('product_id', product.id)
            if (variants) {
              for (const variant of variants) {
                const newPrice = applyRounding(variant.price * multiplier)
                await (supabase as any)
                  .from('product_variants')
                  .update({ price: Math.max(0, newPrice) })
                  .eq('id', variant.id)
              }
            }
          }

          setApplying(false)
          toast.show(t('bulkPrices.applied', { count: products.length }))
          setTimeout(() => router.back(), 800)
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
    <View className="flex-1 bg-background">
      <Header title={t('bulkPrices.title')} subtitle={t('bulkPrices.subtitle')} />

      <ScrollView contentContainerClassName="px-6 py-6 gap-5">
        {/* Percentage input */}
        <Input
          label={t('bulkPrices.percentageLabel')}
          value={percentage}
          onChangeText={setPercentage}
          placeholder={t('bulkPrices.percentagePlaceholder')}
          keyboardType="decimal-pad"
        />
        <Text className="text-xs text-muted -mt-3">
          {t('bulkPrices.percentageHint')}
        </Text>

        {/* Category filter */}
        <Card>
          <Text className="text-sm font-semibold text-primary mb-3">{t('bulkPrices.categoryFilter')}</Text>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => { setSelectedCategoryId(null); haptic.select() }}
              className={`px-4 py-2.5 rounded-full border-2 ${
                selectedCategoryId === null
                  ? 'bg-accent border-accent'
                  : 'bg-surface border-border'
              }`}
            >
              <Text className={`text-sm font-semibold ${
                selectedCategoryId === null ? 'text-white' : 'text-primary'
              }`}>
                {t('bulkPrices.allCategories')}
              </Text>
            </Pressable>
            {categories.map((cat) => {
              const selected = selectedCategoryId === cat.id
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => { setSelectedCategoryId(cat.id); haptic.select() }}
                  className={`px-4 py-2.5 rounded-full border-2 ${
                    selected
                      ? 'bg-accent border-accent'
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
        </Card>

        {/* Rounding */}
        <Card>
          <Text className="text-sm font-semibold text-primary mb-3">{t('bulkPrices.roundingLabel')}</Text>
          <View className="gap-2">
            {([
              { id: 'none' as RoundingMode, label: t('bulkPrices.roundNone'), example: '3.47' },
              { id: 'round_05' as RoundingMode, label: t('bulkPrices.round05'), example: '3.45' },
              { id: 'round_10' as RoundingMode, label: t('bulkPrices.round10'), example: '3.50' },
            ]).map((opt) => (
              <Pressable
                key={opt.id}
                onPress={() => { setRounding(opt.id); haptic.select() }}
                className={`flex-row items-center justify-between px-4 py-3 rounded-xl border ${
                  rounding === opt.id ? 'border-accent bg-accentSoft' : 'border-border bg-surface'
                }`}
              >
                <Text className={`text-sm font-medium ${rounding === opt.id ? 'text-primary' : 'text-primary'}`}>
                  {opt.label}
                </Text>
                <Text className="text-xs text-muted">{opt.example} €</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Summary */}
        {affectedCount !== null && (
          <View className="bg-accentSoft border border-accent/20 rounded-xl px-4 py-3">
            <Text className="text-sm text-primary font-medium">
              {t('bulkPrices.affected', { count: affectedCount })}
            </Text>
          </View>
        )}

        <Button
          label={t('bulkPrices.apply')}
          onPress={handleApply}
          loading={applying}
        />
      </ScrollView>
      <Toast message={toast.message} visible={toast.visible} />
    </View>
  )
}
