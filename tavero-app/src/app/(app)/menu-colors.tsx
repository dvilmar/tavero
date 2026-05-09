import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { pickImage, uploadImage } from '@/lib/storage'
import { haptic } from '@/lib/haptics'
import { Header } from '@/components/ui/Header'
import { Select } from '@/components/ui/Select'
import { useRestaurant } from '@/context/RestaurantContext'
import { useTheme } from '@/context/ThemeContext'
import { supabase } from '@/lib/supabase'

type PaletteId =
  | 'black'
  | 'wine'
  | 'sage'
  | 'plum'
  | 'red'
  | 'orange'
  | 'brown'
  | 'teal'
  | 'azure'
  | 'pink'
  | 'gold'
  | 'terracotta'
type FontId = 'inter' | 'montserrat' | 'playfair' | 'lato'

const PALETTES: { id: PaletteId; color: string; bg: string }[] = [
  { id: 'black',      color: '#111827', bg: '#F3F4F6' },
  { id: 'wine',       color: '#7E2D4D', bg: '#FCE4EC' },
  { id: 'sage',       color: '#6B8E6B', bg: '#E8F0E8' },
  { id: 'plum',       color: '#7C3AED', bg: '#EDE9FE' },
  { id: 'red',        color: '#DC2626', bg: '#FEE2E2' },
  { id: 'orange',     color: '#EA580C', bg: '#FFF7ED' },
  { id: 'brown',      color: '#78350F', bg: '#FEF3C7' },
  { id: 'teal',       color: '#0D9488', bg: '#CCFBF1' },
  { id: 'azure',      color: '#7DB9E8', bg: '#D6ECFA' },
  { id: 'pink',       color: '#F4A6B6', bg: '#FDE2E8' },
  { id: 'gold',       color: '#D4A017', bg: '#FFF8E1' },
  { id: 'terracotta', color: '#C2410C', bg: '#FED7AA' },
]

const FONTS: { id: FontId; style: { fontFamily: string } }[] = [
  { id: 'inter',      style: { fontFamily: 'Inter' } },
  { id: 'montserrat', style: { fontFamily: 'Montserrat' } },
  { id: 'playfair',   style: { fontFamily: 'PlayfairDisplay' } },
  { id: 'lato',       style: { fontFamily: 'Lato' } },
]

export default function MenuColorsScreen() {
  const { restaurant, refresh } = useRestaurant()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()

  const [selectedPalette, setSelectedPalette] = useState<PaletteId>(
    (restaurant?.menu_accent_color as PaletteId) ?? 'black'
  )
  const [selectedFont, setSelectedFont] = useState<FontId>(
    (restaurant?.menu_font as FontId) ?? 'inter'
  )
  const [bannerUrl, setBannerUrl] = useState<string | null>(restaurant?.menu_banner_url ?? null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const pendingRef = useRef<{ palette?: PaletteId; font?: FontId } | null>(null)

  useEffect(() => {
    if (restaurant) {
      setSelectedPalette((restaurant.menu_accent_color as PaletteId) ?? 'black')
      setSelectedFont((restaurant.menu_font as FontId) ?? 'inter')
    }
  }, [restaurant?.id])

  const MENU_BASE_URL = process.env.EXPO_PUBLIC_MENU_URL ?? 'https://tavero.app/menu'

  const saveToDb = useCallback(async (palette: PaletteId, font: FontId) => {
    if (!restaurant || savingRef.current) return
    savingRef.current = true
    setSaving(true)
    const { error } = await supabase
      .from('restaurants')
      .update({ menu_accent_color: palette, menu_font: font })
      .eq('id', restaurant.id)
    savingRef.current = false
    setSaving(false)
    if (error) {
      console.error('Error saving menu colors:', error.message)
      return
    }
    await refresh()

    // Invalidate web cache for this menu
    try {
      const baseUrl = MENU_BASE_URL.replace(/\/menu.*$/, '')
      const secret = process.env.EXPO_PUBLIC_REVALIDATE_SECRET
      await fetch(`${baseUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
        },
        body: JSON.stringify({ slug: restaurant.slug }),
      })
    } catch (err) {
      console.warn('Failed to revalidate web menu:', err)
    }

    if (pendingRef.current) {
      const { palette: p, font: f } = pendingRef.current
      pendingRef.current = null
      if (p || f) {
        saveToDb(p ?? palette, f ?? font)
      }
    }
  }, [restaurant, refresh])

  const handlePaletteChange = (id: PaletteId) => {
    haptic.select()
    setSelectedPalette(id)
    if (savingRef.current) {
      pendingRef.current = { ...pendingRef.current, palette: id }
    } else {
      saveToDb(id, selectedFont)
    }
  }

  const handleFontChange = (id: FontId) => {
    haptic.select()
    setSelectedFont(id)
    if (savingRef.current) {
      pendingRef.current = { ...pendingRef.current, font: id }
    } else {
      saveToDb(selectedPalette, id)
    }
  }

  const handleBannerPick = async () => {
    const uri = await pickImage('banners')
    if (!uri || !restaurant) return
    setUploading(true)
    const uploadedUrl = await uploadImage(uri, 'banners', restaurant.id, restaurant.id)
    setUploading(false)
    if (uploadedUrl) {
      setBannerUrl(uploadedUrl)
      await supabase.from('restaurants').update({ menu_banner_url: uploadedUrl }).eq('id', restaurant.id)
      await refresh()
      haptic.success()
    }
  }

  const handleRemoveBanner = async () => {
    if (!restaurant) return
    setBannerUrl(null)
    await supabase.from('restaurants').update({ menu_banner_url: null }).eq('id', restaurant.id)
    await refresh()
    haptic.light()
  }

  const pal = PALETTES.find((p) => p.id === selectedPalette) ?? PALETTES[0]
  const fnt = FONTS.find((f) => f.id === selectedFont) ?? FONTS[0]

  return (
    <View className="flex-1 bg-background">
      <Header
        title={t('menuColors.title')}
        action={saving ? <ActivityIndicator size="small" color={isDark ? '#FAFAFA' : '#111827'} /> : undefined}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 24 + insets.bottom,
          gap: 20,
        }}
      >

        {/* Font */}
        <View>
          <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">
            {t('menuColors.fontSection')}
          </Text>
          <Select
            options={FONTS.map((f) => ({
              label: t(`menuColors.fonts.${f.id}`),
              value: f.id,
              style: f.style,
            }))}
            value={selectedFont}
            onChange={(id) => handleFontChange(id as FontId)}
          />
        </View>

        {/* Color */}
        <View>
          <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">
            {t('menuColors.colorSection')}
          </Text>
          <Text className="text-muted text-sm mb-4 leading-relaxed">
            {t('menuColors.colorHint')}
          </Text>
          <View className="flex-row flex-wrap gap-4">
            {PALETTES.map((p) => {
              const selected = selectedPalette === p.id
              return (
                <Pressable
                  key={p.id}
                  onPress={() => handlePaletteChange(p.id)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  <View
                    style={{
                      width: 44, height: 44, borderRadius: 22,
                      backgroundColor: p.color,
                      borderWidth: selected ? 3 : 2,
                      borderColor: selected ? (isDark ? '#FAFAFA' : '#111827') : (isDark ? '#3F3F46' : '#E4E4E7'),
                    }}
                  />
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Banner */}
        <View>
          <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">
            {t('menuColors.bannerSection')}
          </Text>
          <Text className="text-muted text-sm mb-4 leading-relaxed">
            {t('menuColors.bannerHint')}
          </Text>
          <Pressable onPress={handleBannerPick} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
            <View className="rounded-2xl overflow-hidden border-2 border-border bg-surface items-center justify-center" style={{ height: 140 }}>
              {bannerUrl ? (
                <Image source={{ uri: bannerUrl }} className="absolute inset-0 w-full h-full" />
              ) : (
                <Text className="text-muted">📷 {t('menuColors.bannerPick')}</Text>
              )}
              {uploading && (
                <View className="absolute inset-0 bg-black/50 items-center justify-center">
                  <ActivityIndicator color="#fff" />
                </View>
              )}
            </View>
          </Pressable>
          {bannerUrl && (
            <Pressable onPress={handleRemoveBanner} className="mt-3 items-center">
              <Text className="text-danger text-sm font-semibold">{t('menuColors.bannerRemove')}</Text>
            </Pressable>
          )}
        </View>

        {/* Preview */}
        <View>
          <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">
            {t('menuColors.previewSection')}
          </Text>
          <View style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: bannerUrl ? (isDark ? '#1E1E22' : '#FAFAFA') : pal.color }}>
            {/* Header - solid accent color or banner */}
            <View style={{ padding: 20, paddingBottom: 28, position: 'relative', backgroundColor: bannerUrl ? undefined : pal.color }}>
              {bannerUrl && (
                <Image source={{ uri: bannerUrl }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
              )}
              {bannerUrl && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
              )}
              <View style={{ position: 'relative' }}>
                <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 12, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: '#fff' }}>
                    {(restaurant?.name ?? t('menuColors.previewRestaurantFallback')).charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={[{ fontSize: 22, color: '#fff', lineHeight: 28 }, fnt.style]}>
                  {restaurant?.name ?? t('menuColors.previewRestaurantFallback')}
                </Text>
                <Text style={[{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }, fnt.style]}>
                  {t('menuColors.previewSubtitle')}
                </Text>
              </View>
            </View>
            {/* Category badges */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              <View className="flex-row flex-wrap gap-2">
                {[t('categories.title'), t('products.title'), t('menuColors.previewCategoryDesserts')].map((cat) => (
                  <View key={cat} style={{ backgroundColor: pal.bg, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}>
                    <Text style={[{ color: pal.color, fontWeight: '600', fontSize: 12 }, fnt.style]}>{cat}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  )
}
