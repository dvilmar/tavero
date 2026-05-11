import { useState } from 'react'
import { Clipboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { pickImage, uploadImage } from '@/lib/storage'
import { useAuth } from '@/context/AuthContext'
import { useRestaurant } from '@/context/RestaurantContext'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/ui/Header'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Toast } from '@/components/ui/Toast'
import { ImagePickerField } from '@/components/ui/ImagePickerField'
import { useToast } from '@/hooks/useToast'
import { sanitizeText, slugify } from '@/lib/utils'
import { haptic } from '@/lib/haptics'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/context/ThemeContext'
import { createRestaurantSchema } from '@/lib/validation'

const MENU_BASE_URL = process.env.EXPO_PUBLIC_MENU_URL ?? 'https://tavero.app/menu'

export default function RestaurantInfoScreen() {
  const { user } = useAuth()
  const { restaurant, refresh } = useRestaurant()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const toast = useToast()
  const restaurantSchema = createRestaurantSchema(t)

  const [name, setName] = useState(restaurant?.name ?? '')
  const [description, setDescription] = useState(restaurant?.description ?? '')
  const [logoUrl, setLogoUrl] = useState<string | null>(restaurant?.logo_url ?? null)
  const [pendingLogoUri, setPendingLogoUri] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [phone, setPhone] = useState(restaurant?.phone ?? '')
  const [whatsapp, setWhatsapp] = useState((restaurant as any)?.whatsapp_number ?? '')
  const [address, setAddress] = useState(restaurant?.address ?? '')
  const [wifiName, setWifiName] = useState(restaurant?.wifi_name ?? '')
  const [wifiPassword, setWifiPassword] = useState(restaurant?.wifi_password ?? '')
  const [instagram, setInstagram] = useState(restaurant?.instagram_url ?? '')
  const [facebook, setFacebook] = useState(restaurant?.facebook_url ?? '')
  const [tiktok, setTiktok] = useState(restaurant?.tiktok_url ?? '')
  const [twitter, setTwitter] = useState(restaurant?.twitter_url ?? '')
  const [loading, setLoading] = useState(false)
  const [nameError, setNameError] = useState('')
  const [serverError, setServerError] = useState('')

  const menuUrl = restaurant ? `${MENU_BASE_URL}/${restaurant.slug}` : ''

  const handlePickLogo = async () => {
    const uri = await pickImage('logos')
    if (!uri) return
    setPendingLogoUri(uri)
    setLogoUrl(uri)
  }

  const handleCopyUrl = () => {
    if (!menuUrl) return
    Clipboard.setString(menuUrl)
    haptic.select()
    toast.show(t('restaurantInfo.copied'))
  }

  const handleSave = async () => {
    if (!restaurant || !user) return

    const result = restaurantSchema.safeParse({ name, description })
    if (!result.success) {
      setNameError(result.error.flatten().fieldErrors.name?.[0] ?? '')
      return
    }
    setNameError('')

    const finalSlug = slugify(name)
    if (!finalSlug) {
      setServerError(t('setup.slugInvalid'))
      return
    }

    setLoading(true)
    setServerError('')

    const { error } = await supabase
      .from('restaurants')
      .update({
        name: name.trim(),
        description: description.trim() || null,
        slug: finalSlug,
        is_active: true,
        phone: phone.trim() || null,
        address: address.trim() || null,
        wifi_name: wifiName.trim() || null,
        wifi_password: wifiPassword.trim() || null,
        instagram_url: instagram.trim() || null,
        facebook_url: facebook.trim() || null,
        tiktok_url: tiktok.trim() || null,
        twitter_url: twitter.trim() || null,
        whatsapp_number: whatsapp.trim() || null,
      } as any)
      .eq('id', restaurant.id)

    if (error) {
      setServerError(error.code === '23505' ? t('setup.slugConflict') : error.message)
      setLoading(false)
      return
    }

    if (pendingLogoUri) {
      setUploading(true)
      const url = await uploadImage(pendingLogoUri, 'logos', user.id, restaurant.id)
      setUploading(false)
      if (url) {
        await supabase.from('restaurants').update({ logo_url: url }).eq('id', restaurant.id)
      }
    }

    await refresh()
    setLoading(false)
    haptic.success()
    toast.show(t('restaurantInfo.saved'))
    setTimeout(() => router.back(), 600)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <Header
        title={t('restaurantInfo.title')}
        subtitle={t('restaurantInfo.subtitle')}
      />

      <ScrollView contentContainerClassName="px-6 py-6 gap-5">
        {/* Logo */}
        <View className="items-center py-2">
          <ImagePickerField
            label={t('setup.logoLabel')}
            imageUrl={logoUrl}
            onPress={handlePickLogo}
            uploading={uploading}
            circular
          />
        </View>

        {/* Name */}
        <Input
          label={t('setup.nameLabel')}
          value={name}
          onChangeText={(v) => setName(sanitizeText(v, 80))}
          placeholder={t('setup.namePlaceholder')}
          error={nameError}
        />

        {/* Description */}
        <Input
          label={t('setup.descLabel')}
          value={description}
          onChangeText={(v) => setDescription(sanitizeText(v, 300))}
          placeholder={t('setup.descPlaceholder')}
          multiline
          numberOfLines={3}
        />

        {/* Menu URL */}
        {menuUrl ? (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-primary">{t('restaurantInfo.menuUrlLabel')}</Text>
            <Pressable
              onPress={handleCopyUrl}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              className={`flex-row items-center border rounded-xl px-4 py-3 gap-3 ${isDark ? 'bg-surface border-border' : 'bg-borderSoft border-border'}`}
            >
              <Text className="flex-1 text-sm text-muted" numberOfLines={1}>{menuUrl}</Text>
              <Ionicons name="copy-outline" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </Pressable>
          </View>
        ) : null}

        {/* Contact */}
        <Input
          label={t('restaurantInfo.phoneLabel')}
          value={phone}
          onChangeText={(v) => setPhone(sanitizeText(v, 30))}
          placeholder={t('restaurantInfo.phonePlaceholder')}
          keyboardType="phone-pad"
        />

        <View>
          <Input
            label={t('restaurantInfo.whatsappLabel')}
            value={whatsapp}
            onChangeText={(v) => setWhatsapp(sanitizeText(v, 20))}
            placeholder={t('restaurantInfo.whatsappPlaceholder')}
            keyboardType="phone-pad"
          />
          <View className="flex-row items-start gap-1.5 mt-1.5 px-1">
            <Ionicons name="logo-whatsapp" size={13} color="#22C55E" style={{ marginTop: 1 }} />
            <Text className="text-xs text-muted flex-1">{t('restaurantInfo.whatsappOrderHint')}</Text>
          </View>
        </View>

        <Input
          label={t('restaurantInfo.addressLabel')}
          value={address}
          onChangeText={(v) => setAddress(sanitizeText(v, 200))}
          placeholder={t('restaurantInfo.addressPlaceholder')}
          multiline
          numberOfLines={2}
        />

        {/* Wi-Fi */}
        <Card>
          <Text className="text-sm font-semibold text-primary mb-3">Wi-Fi</Text>
          <View className="gap-4">
            <Input
              label={t('restaurantInfo.wifiLabel')}
              value={wifiName}
              onChangeText={(v) => setWifiName(sanitizeText(v, 60))}
              placeholder={t('restaurantInfo.wifiPlaceholder')}
            />
            <Input
              label={t('restaurantInfo.wifiPasswordLabel')}
              value={wifiPassword}
              onChangeText={(v) => setWifiPassword(sanitizeText(v, 60))}
              placeholder={t('restaurantInfo.wifiPasswordPlaceholder')}
            />
          </View>
        </Card>

        {/* Social Media */}
        <Card>
          <Text className="text-sm font-semibold text-primary mb-3">{t('restaurantInfo.socialSection')}</Text>
          <View className="gap-4">
            <Input
              label={t('restaurantInfo.instagramLabel')}
              value={instagram}
              onChangeText={(v) => setInstagram(sanitizeText(v, 200))}
              placeholder={t('restaurantInfo.instagramPlaceholder')}
              keyboardType="url"
              autoCapitalize="none"
            />
            <Input
              label={t('restaurantInfo.facebookLabel')}
              value={facebook}
              onChangeText={(v) => setFacebook(sanitizeText(v, 200))}
              placeholder={t('restaurantInfo.facebookPlaceholder')}
              keyboardType="url"
              autoCapitalize="none"
            />
            <Input
              label={t('restaurantInfo.tiktokLabel')}
              value={tiktok}
              onChangeText={(v) => setTiktok(sanitizeText(v, 200))}
              placeholder={t('restaurantInfo.tiktokPlaceholder')}
              keyboardType="url"
              autoCapitalize="none"
            />
            <Input
              label={t('restaurantInfo.twitterLabel')}
              value={twitter}
              onChangeText={(v) => setTwitter(sanitizeText(v, 200))}
              placeholder={t('restaurantInfo.twitterPlaceholder')}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </Card>

        {serverError ? (
          <View className="bg-surface border border-danger rounded-xl px-4 py-3">
            <Text className="text-danger text-sm font-medium">{serverError}</Text>
          </View>
        ) : null}

        <Button
          label={t('restaurantInfo.submit')}
          onPress={handleSave}
          loading={loading || uploading}
          className="mt-2"
        />
      </ScrollView>
      <Toast message={toast.message} visible={toast.visible} />
    </KeyboardAvoidingView>
  )
}
