import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { useRestaurant } from '@/context/RestaurantContext'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/ui/Header'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { sanitizeText } from '@/lib/utils'

export default function RestaurantInfoScreen() {
  const { restaurant, refresh } = useRestaurant()
  const { t } = useTranslation()
  const toast = useToast()

  const [phone, setPhone] = useState(restaurant?.phone ?? '')
  const [whatsapp, setWhatsapp] = useState((restaurant as any)?.whatsapp_number ?? '')
  const [address, setAddress] = useState(restaurant?.address ?? '')
  const [wifiName, setWifiName] = useState(restaurant?.wifi_name ?? '')
  const [wifiPassword, setWifiPassword] = useState(restaurant?.wifi_password ?? '')
  const [instagram, setInstagram] = useState(restaurant?.instagram_url ?? '')
  const [facebook, setFacebook] = useState(restaurant?.facebook_url ?? '')
  const [tiktok, setTiktok] = useState(restaurant?.tiktok_url ?? '')
  const [twitter, setTwitter] = useState(restaurant?.twitter_url ?? '')
  const [website, setWebsite] = useState(restaurant?.website_url ?? '')
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const handleSave = async () => {
    if (!restaurant) return
    setLoading(true)
    setServerError('')

    const { error } = await supabase
      .from('restaurants')
      .update({
        phone: phone.trim() || null,
        address: address.trim() || null,
        wifi_name: wifiName.trim() || null,
        wifi_password: wifiPassword.trim() || null,
        instagram_url: instagram.trim() || null,
        facebook_url: facebook.trim() || null,
        tiktok_url: tiktok.trim() || null,
        twitter_url: twitter.trim() || null,
        website_url: website.trim() || null,
        whatsapp_number: whatsapp.trim() || null,
      } as any)
      .eq('id', restaurant.id)

    if (error) {
      setServerError(error.message)
      setLoading(false)
      return
    }

    await refresh()
    setLoading(false)
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
            <Text className="text-green-600 text-xs">✦</Text>
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
            <Input
              label={t('restaurantInfo.websiteLabel')}
              value={website}
              onChangeText={(v) => setWebsite(sanitizeText(v, 200))}
              placeholder={t('restaurantInfo.websitePlaceholder')}
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
          loading={loading}
          className="mt-2"
        />
      </ScrollView>
      <Toast message={toast.message} visible={toast.visible} />
    </KeyboardAvoidingView>
  )
}
