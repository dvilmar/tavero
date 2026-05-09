import { useCallback, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { useFocusEffect, router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { useRestaurant } from '@/context/RestaurantContext'
import { haptic } from '@/lib/haptics'
import { Header } from '@/components/ui/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { Svg, Path } from 'react-native-svg'
import type { Category } from '@/lib/types'

function ArrowUpIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 15l-6-6-6 6" />
    </Svg>
  )
}

function ArrowDownIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 9l6 6 6-6" />
    </Svg>
  )
}

type ProductRow = {
  id: string
  name: string
  sort_order: number
  category_id: string
  price: number
  is_active: boolean
}

type Section = {
  title: string
  catId: string
  data: ProductRow[]
}

export default function ProductsReorderScreen() {
  const { restaurant } = useRestaurant()
  const { t } = useTranslation()
  const toast = useToast()
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!restaurant) { setSections([]); setLoading(false); return }
    setLoading(true)
    const [{ data: cats, error: catsError }, { data: prods, error: prodsError }] = await Promise.all([
      (supabase as any).from('categories').select('id, name').eq('restaurant_id', restaurant.id).order('sort_order'),
      (supabase as any).from('products').select('id, name, sort_order, category_id, price, is_active').eq('restaurant_id', restaurant.id).order('sort_order'),
    ])
    if (catsError || prodsError) {
      Alert.alert(t('common.error'), (catsError ?? prodsError)?.message ?? '')
      setLoading(false)
      return
    }
    const built: Section[] = (cats ?? []).map((cat: Category) => ({
      title: cat.name,
      catId: cat.id,
      data: (prods ?? []).filter((p: ProductRow) => p.category_id === cat.id),
    }))
    setSections(built)
    setLoading(false)
  }, [restaurant, t])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const moveItem = (sectionIndex: number, itemIndex: number, direction: 'up' | 'down') => {
    const section = sections[sectionIndex]
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1
    if (targetIndex < 0 || targetIndex >= section.data.length) return

    haptic.select()
    const newSections = [...sections]
    const newSection = { ...section, data: [...section.data] }
    const temp = { ...newSection.data[itemIndex] }
    newSection.data[itemIndex] = newSection.data[targetIndex]
    newSection.data[targetIndex] = temp
    newSections[sectionIndex] = newSection

    setSections(newSections)
  }

  const handleSave = async () => {
    if (!restaurant) return
    setSaving(true)

    for (const section of sections) {
      for (let i = 0; i < section.data.length; i++) {
        const product = section.data[i]
        if (product.sort_order !== i) {
          const { error } = await supabase
            .from('products')
            .update({ sort_order: i })
            .eq('id', product.id)
          if (error) {
            Alert.alert(t('common.error'), error.message)
            setSaving(false)
            return
          }
        }
      }
    }

    setSaving(false)
    haptic.success()
    toast.show(t('products.reorderSuccess'))
    router.back()
  }

  const renderItem = (product: ProductRow, index: number, sectionIndex: number) => (
    <View style={{ marginBottom: 6 }}>
      <Card className="p-3">
        <View className="flex-row items-center">
          <View className="flex-1 mr-2">
            <Text className={`font-semibold text-[15px] ${product.is_active ? 'text-primary' : 'text-mutedLight'}`}>
              {index + 1}. {product.name}
            </Text>
            <Text className="text-xs text-muted mt-0.5">
              €{Number(product.price).toFixed(2)}
            </Text>
          </View>

          <View className="flex-row gap-1">
            <Pressable
              onPress={() => moveItem(sectionIndex, index, 'up')}
              disabled={index === 0}
              style={{ opacity: index === 0 ? 0.3 : 1, padding: 10 }}
            >
              <ArrowUpIcon color="#0A0A0A" />
            </Pressable>

            <Pressable
              onPress={() => moveItem(sectionIndex, index, 'down')}
              disabled={index === sections[sectionIndex].data.length - 1}
              style={{ opacity: index === sections[sectionIndex].data.length - 1 ? 0.3 : 1, padding: 10 }}
            >
              <ArrowDownIcon color="#0A0A0A" />
            </Pressable>
          </View>
        </View>
      </Card>
    </View>
  )

  const visibleProductsCount = sections.reduce((acc, section) => acc + section.data.length, 0)

  return (
    <View className="flex-1 bg-background">
      <Header title={t('products.reorderTitle')} subtitle={t('products.reorderSubtitle')} />

      {visibleProductsCount === 0 ? (
        <EmptyState
          icon="🍽️"
          title={t('products.reorderEmpty')}
          description={t('products.reorderEmptyDesc')}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section, sectionIndex) => (
            section.data.length > 0 && (
              <View key={section.catId} style={{ marginBottom: 16 }}>
                <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-2 px-1">
                  {section.title}
                </Text>
                {section.data.map((product, index) => (
                  <View key={product.id}>
                    {renderItem(product, index, sectionIndex)}
                  </View>
                ))}
              </View>
            )
          ))}
        </ScrollView>
      )}

      {visibleProductsCount > 0 && (
        <View className="px-5 pb-8" style={{ paddingBottom: 24 }}>
          <Button label={t('common.save')} onPress={handleSave} loading={saving} />
        </View>
      )}

      <Toast message={toast.message} visible={toast.visible} />
    </View>
  )
}
