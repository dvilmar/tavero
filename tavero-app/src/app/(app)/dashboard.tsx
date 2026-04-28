import { useCallback } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, Share, Text, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import QRCode from 'react-native-qrcode-svg'
import { useAuth } from '@/context/AuthContext'
import { useRestaurant } from '@/context/RestaurantContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

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

export default function DashboardScreen() {
  const { signOut, user } = useAuth()
  const { restaurant, loading, refresh } = useRestaurant()
  const { t } = useTranslation()

  useFocusEffect(useCallback(() => { refresh() }, [refresh]))

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    )
  }

  if (!restaurant) {
    return (
      <ScrollView className="flex-1 bg-background" contentContainerClassName="px-5 pt-16 pb-12">
        <View className="flex-row items-start justify-between mb-10">
          <View className="flex-1 mr-4">
            <Text className="text-3xl font-bold text-primary tracking-tight">Tavero</Text>
            <Text className="text-muted mt-1 text-sm" numberOfLines={1}>{user?.email}</Text>
          </View>
          <Pressable onPress={signOut} hitSlop={8}>
            <Text className="text-muted text-sm font-medium">{t('common.signOut')}</Text>
          </Pressable>
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

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="px-5 pt-16 pb-12">
      {/* Header */}
      <View className="flex-row items-center mb-7">
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
        <Pressable onPress={signOut} hitSlop={8}>
          <Text className="text-muted text-sm font-medium">{t('common.signOut')}</Text>
        </Pressable>
      </View>

      {/* QR Card */}
      <Card className="items-center gap-3 mb-5 py-6">
        <Text className="text-[11px] font-bold text-muted uppercase tracking-widest">{t('dashboard.yourMenu')}</Text>
        <View className="p-4 bg-accentSoft rounded-2xl">
          <QRCode value={menuUrl} size={170} backgroundColor="#CCFBF1" color="#134E4A" />
        </View>
        <Button label={t('dashboard.shareMenu')} onPress={handleShare} variant="accent" className="w-full mt-1" />
      </Card>

      {/* Navigation */}
      <View className="gap-2.5 mb-5">
        <NavCard
          icon="👀"
          label={t('dashboard.menuPreview')}
          description={t('dashboard.menuPreviewDesc')}
          onPress={() => router.push('/(app)/menu-preview')}
        />
        <NavCard
          icon="🎨"
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
          icon="⚙️"
          label={t('dashboard.settings')}
          description={t('dashboard.settingsDesc')}
          onPress={() => router.push('/(app)/settings')}
        />
      </View>
    </ScrollView>
  )
}
