import { useCallback, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { useFocusEffect, router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { useRestaurant } from '@/context/RestaurantContext'
import { haptic } from '@/lib/haptics'
import { useTheme } from '@/context/ThemeContext'
import { Header } from '@/components/ui/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { Svg, Path } from 'react-native-svg'

type CategoryRow = {
  id: string
  name: string
  sort_order: number
  is_active: boolean
}

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

export default function CategoriesReorderScreen() {
  const { restaurant } = useRestaurant()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const toast = useToast()
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!restaurant) { setCategories([]); setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, sort_order, is_active')
      .eq('restaurant_id', restaurant.id)
      .order('sort_order', { ascending: true })
    if (error) { Alert.alert(t('common.error'), error.message); setLoading(false); return }
    setCategories(data ?? [])
    setLoading(false)
  }, [restaurant, t])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= categories.length) return

    haptic.select()
    const newCategories = [...categories]
    const temp = { ...newCategories[index] }
    newCategories[index] = { ...newCategories[targetIndex] }
    newCategories[targetIndex] = temp

    setCategories(newCategories)
  }

  const handleSave = async () => {
    if (!restaurant) return
    setSaving(true)

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i]
      if (cat.sort_order !== i) {
        const { error } = await (supabase as any)
          .from('categories')
          .update({ sort_order: i })
          .eq('id', cat.id)
        if (error) {
          Alert.alert(t('common.error'), error.message)
          setSaving(false)
          return
        }
      }
    }

    setSaving(false)
    haptic.success()
    toast.show(t('categories.reorderSuccess'))
    router.back()
  }

  const renderItem = (cat: CategoryRow, index: number) => (
    <View style={{ marginBottom: 8 }}>
      <Card>
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className={`font-semibold text-base ${cat.is_active ? 'text-primary' : 'text-mutedLight'}`}>
              {index + 1}. {cat.name}
            </Text>
          </View>

          <View className="flex-row gap-1">
            <Pressable
              onPress={() => moveItem(index, 'up')}
              disabled={index === 0}
              style={{ opacity: index === 0 ? 0.3 : 1, padding: 10 }}
            >
              <ArrowUpIcon color={isDark ? '#F9FAFB' : '#0A0A0A'} />
            </Pressable>

            <Pressable
              onPress={() => moveItem(index, 'down')}
              disabled={index === categories.length - 1}
              style={{ opacity: index === categories.length - 1 ? 0.3 : 1, padding: 10 }}
            >
              <ArrowDownIcon color={isDark ? '#F9FAFB' : '#0A0A0A'} />
            </Pressable>
          </View>
        </View>
      </Card>
    </View>
  )

  return (
    <View className="flex-1 bg-background">
      <Header title={t('categories.reorderTitle')} subtitle={t('categories.reorderSubtitle')} />

      {categories.length === 0 ? (
        <EmptyState
          icon="📂"
          title={t('categories.reorderEmpty')}
          description={t('categories.reorderEmptyDesc')}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {categories.map((cat, index) => (
            <View key={cat.id}>
              {renderItem(cat, index)}
            </View>
          ))}
        </ScrollView>
      )}

      {categories.length > 0 && (
        <View className="px-5 pb-8" style={{ paddingBottom: 24 }}>
          <Button label={t('common.save')} onPress={handleSave} loading={saving} />
        </View>
      )}

      <Toast message={toast.message} visible={toast.visible} />
    </View>
  )
}
