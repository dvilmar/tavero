import { useCallback, useState } from 'react'
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, Share, Text, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { useTranslation } from 'react-i18next'
import QRCode from 'react-native-qrcode-svg'
import { useAuth } from '@/context/AuthContext'
import { useRestaurant } from '@/context/RestaurantContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DESIGN_TOKENS } from '@/lib/designTokens'

const MENU_BASE_URL = process.env.EXPO_PUBLIC_MENU_URL ?? 'https://tavero.app/menu'

type NavCardProps = {
  icon: string
  label: string
  description: string
  onPress: () => void
}

function NavCard({ icon, label, description, onPress }: NavCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <Card className="flex-row items-center">
        <View className="w-11 h-11 rounded-xl bg-accentSoft items-center justify-center mr-3.5">
          <Text className="text-xl">{icon}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-semibold text-primary">{label}</Text>
          <Text className="text-[13px] text-muted mt-0.5">{description}</Text>
        </View>
        <Text className="text-2xl text-mutedLight font-light">›</Text>
      </Card>
    </Pressable>
  )
}

type QuickStats = { products: number; categories: number; todayVisits: number }

export default function DashboardScreen() {
  const { user } = useAuth()
  const { restaurant, loading, refresh } = useRestaurant()
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { t } = useTranslation()
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null)

  const loadQuickStats = useCallback(async () => {
    if (!restaurant) return
    const todayStr = new Date().toISOString().slice(0, 10)
    const [prodsRes, catsRes, visitsRes] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('restaurant_id', restaurant.id),
      supabase.from('categories').select('id', { count: 'exact', head: true }).eq('restaurant_id', restaurant.id),
      (supabase as any).from('restaurant_visits').select('id', { count: 'exact', head: true }).eq('restaurant_id', restaurant.id).eq('visit_date', todayStr),
    ])
    setQuickStats({
      products: prodsRes.count ?? 0,
      categories: catsRes.count ?? 0,
      todayVisits: visitsRes.count ?? 0,
    })
  }, [restaurant])

  useFocusEffect(useCallback(() => {
    refresh()
    loadQuickStats()
  }, [refresh, loadQuickStats]))

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.accent} />
      </View>
    )
  }

  if (!restaurant) {
    return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="px-5 pt-16">
        <View className="flex-row items-start justify-between mb-10">
          <View className="flex-1 mr-4">
            <Text className="text-3xl font-bold text-primary tracking-tight">Tavero</Text>
            <Text className="text-muted mt-1 text-sm" numberOfLines={1}>{user?.email}</Text>
          </View>
        </View>

        <Card className="items-center gap-3 py-12">
          <View className="w-20 h-20 rounded-full bg-accentSoft items-center justify-center mb-2">
            <Text className="text-4xl">🍽️</Text>
          </View>
          <Text className="text-xl font-bold text-primary tracking-tight">{t('dashboard.welcome')}</Text>
          <Text className="text-muted text-sm text-center px-6 leading-relaxed">
            {t('dashboard.welcomeBody')}
          </Text>
          <Button
            label={t('dashboard.createBar')}
            onPress={() => router.push('/(app)/restaurant/setup')}
            className="w-full mt-3"
          />
        </Card>
      </ScrollView>
    )
  }

  const menuUrl = `${MENU_BASE_URL}/${restaurant.slug}`

  const handleShare = async () => {
    await Share.share({ message: `${t('dashboard.shareMessage')}${menuUrl}`, url: menuUrl })
  }

  const handlePreview = () => {
    Linking.openURL(menuUrl).catch((err) => {
      console.error('Error opening menu preview', err)
    })
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="px-5 pt-16 pb-12">
      {/* Header */}
      <View className="flex-row items-center mb-7 px-4 py-3 rounded-2xl bg-accentSoft border border-border">
        <Pressable
          onPress={() => router.push('/(app)/restaurant/setup')}
          className="flex-row items-center flex-1"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          {restaurant.logo_url ? (
            <Image
              source={{ uri: restaurant.logo_url }}
              style={{ width: 52, height: 52, borderRadius: 26 }}
              resizeMode="cover"
            />
          ) : (
            <View className="rounded-full bg-accentSoft items-center justify-center"
                  style={{ width: 52, height: 52 }}>
              <Text className="text-xl">🏪</Text>
            </View>
          )}
          <View className="flex-1 ml-3">
            <Text className="text-[11px] text-muted font-medium uppercase tracking-wider">{t('dashboard.yourBar')}</Text>
            <Text className="text-xl font-bold text-primary tracking-tight" numberOfLines={1}>
              {restaurant.name}
            </Text>
          </View>
        </Pressable>
      </View>

      {/* QR Card */}
      <Card className="items-center gap-3 mb-5 py-6">
        <Text className="text-[11px] font-bold text-muted uppercase tracking-widest">{t('dashboard.yourMenu')}</Text>
        <View className="p-4 bg-accentSoft rounded-2xl">
          <QRCode
            value={menuUrl}
            size={170}
            backgroundColor={isDark ? '#1E1E22' : '#FFFFFF'}
            color={isDark ? '#FAFAFA' : '#000000'}
          />
        </View>
        <Button label={t('dashboard.shareMenu')} onPress={handleShare} variant="accent" className="w-full mt-1" />
        <Button label={t('dashboard.menuPreview')} onPress={handlePreview} variant="gray" className="w-full" />
      </Card>

      {/* Quick stats */}
      {quickStats && (
        <View className="flex-row gap-3 mb-5">
          <Card className="flex-1 items-center py-4">
            <Text className="text-2xl font-bold text-primary">{quickStats.products}</Text>
            <Text className="text-[11px] text-muted mt-0.5 text-center">{t('dashboard.statProducts')}</Text>
          </Card>
          <Card className="flex-1 items-center py-4">
            <Text className="text-2xl font-bold text-primary">{quickStats.categories}</Text>
            <Text className="text-[11px] text-muted mt-0.5 text-center">{t('dashboard.statCategories')}</Text>
          </Card>
          <Card className="flex-1 items-center py-4">
            <Text className="text-2xl font-bold text-accent">{quickStats.todayVisits}</Text>
            <Text className="text-[11px] text-muted mt-0.5 text-center">{t('dashboard.statToday')}</Text>
          </Card>
        </View>
      )}

      {/* Navigation */}
      <View className="gap-2.5">
        <NavCard
          icon="🖼️"
          label={t('dashboard.menuColors')}
          description={t('dashboard.menuColorsDesc')}
          onPress={() => router.push('/(app)/menu-colors')}
        />
        <NavCard
          icon="📂"
          label={t('dashboard.categories')}
          description={t('dashboard.categoriesDesc')}
          onPress={() => router.push('/(app)/categories')}
        />
        <NavCard
          icon="🍽️"
          label={t('dashboard.products')}
          description={t('dashboard.productsDesc')}
          onPress={() => router.push('/(app)/products')}
        />
        <NavCard
          icon="📋"
          label={t('dashboard.menus')}
          description={t('dashboard.menusDesc')}
          onPress={() => router.push('/(app)/menus')}
        />
        <NavCard
          icon="📢"
          label={t('dashboard.banners')}
          description={t('dashboard.bannersDesc')}
          onPress={() => router.push('/(app)/banners')}
        />
        <NavCard
          icon="📍"
          label={t('dashboard.restaurantInfo')}
          description={t('dashboard.restaurantInfoDesc')}
          onPress={() => router.push('/(app)/restaurant/info')}
        />
        <NavCard
          icon="🎨"
          label={t('dashboard.qrCustomize')}
          description={t('dashboard.qrCustomizeDesc')}
          onPress={() => router.push('/(app)/qr-customize')}
        />
        <NavCard
          icon="📊"
          label={t('dashboard.stats')}
          description={t('dashboard.statsDesc')}
          onPress={() => router.push('/(app)/stats')}
        />
        <NavCard
          icon="💰"
          label={t('dashboard.bulkPrices')}
          description={t('dashboard.bulkPricesDesc')}
          onPress={() => router.push('/(app)/bulk-prices')}
        />
        <NavCard
          icon="⚙️"
          label={t('dashboard.settings')}
          description={t('dashboard.settingsDesc')}
          onPress={() => router.push('/(app)/settings')}
        />
      </View>
    </ScrollView>
  )
}
