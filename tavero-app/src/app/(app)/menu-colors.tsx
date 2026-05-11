import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { pickImage, uploadImage } from '@/lib/storage'
import { haptic } from '@/lib/haptics'
import { Header } from '@/components/ui/Header'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { ColorPickerModal } from '@/components/ui/ColorPickerModal'
import { useRestaurant } from '@/context/RestaurantContext'
import { useTheme } from '@/context/ThemeContext'
import { supabase } from '@/lib/supabase'

type FontId = 'inter' | 'montserrat' | 'playfair' | 'lato'

const FONTS: { id: FontId; style: { fontFamily: string } }[] = [
  { id: 'inter',      style: { fontFamily: 'Inter' } },
  { id: 'montserrat', style: { fontFamily: 'Montserrat' } },
  { id: 'playfair',   style: { fontFamily: 'PlayfairDisplay' } },
  { id: 'lato',       style: { fontFamily: 'Lato' } },
]

const LEGACY_PALETTE: Record<string, string> = {
  black: '#111827', wine: '#7E2D4D', sage: '#6B8E6B', plum: '#7C3AED',
  red: '#DC2626', orange: '#EA580C', brown: '#78350F', teal: '#0D9488',
  azure: '#7DB9E8', pink: '#F4A6B6', gold: '#D4A017', terracotta: '#C2410C',
}

function parseAccentColor(raw: string | null | undefined): string {
  if (!raw) return '#111827'
  if (raw.startsWith('#') || raw.startsWith('rgb')) return raw
  return LEGACY_PALETTE[raw] ?? '#111827'
}

// Converts any color string (hex or rgba(...)) to a plain hex6 for DB storage
function toHex6(color: string): string {
  if (color.startsWith('#')) return color.slice(0, 7)
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (match) {
    const h = (n: string) => parseInt(n).toString(16).padStart(2, '0')
    return `#${h(match[1])}${h(match[2])}${h(match[3])}`
  }
  return '#111827'
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16) || 0,
    g: parseInt(h.slice(2, 4), 16) || 0,
    b: parseInt(h.slice(4, 6), 16) || 0,
  }
}

export default function MenuColorsScreen() {
  const { restaurant, refresh } = useRestaurant()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()
  const toast = useToast()

  const [accentColor, setAccentColor] = useState(() => parseAccentColor(restaurant?.menu_accent_color))
  const [selectedFont, setSelectedFont] = useState<FontId>((restaurant?.menu_font as FontId) ?? 'inter')
  const [bannerUrl, setBannerUrl] = useState<string | null>(restaurant?.menu_banner_url ?? null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  const MENU_BASE_URL = process.env.EXPO_PUBLIC_MENU_URL ?? 'https://tavero.app/menu'

  useEffect(() => {
    if (restaurant) {
      setAccentColor(parseAccentColor(restaurant.menu_accent_color))
      setSelectedFont((restaurant.menu_font as FontId) ?? 'inter')
    }
  }, [restaurant?.id])

  const handleSave = useCallback(async () => {
    if (!restaurant) return
    setSaving(true)
    haptic.select()
    const hexColor = toHex6(accentColor)
    const { error } = await supabase
      .from('restaurants')
      .update({ menu_accent_color: hexColor, menu_font: selectedFont })
      .eq('id', restaurant.id)
    if (!error) {
      await refresh()
      try {
        const baseUrl = MENU_BASE_URL.replace(/\/menu.*$/, '')
        const secret = process.env.EXPO_PUBLIC_REVALIDATE_SECRET
        await fetch(`${baseUrl}/api/revalidate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(secret ? { Authorization: `Bearer ${secret}` } : {}) },
          body: JSON.stringify({ slug: restaurant.slug }),
        })
      } catch {}
      haptic.success()
      toast.show(t('menuColors.saved'))
    }
    setSaving(false)
  }, [restaurant, accentColor, selectedFont, refresh, MENU_BASE_URL, t, toast])

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

  const accentHex = toHex6(accentColor)
  const { r, g, b } = hexToRgb(accentHex)
  const fnt = FONTS.find((f) => f.id === selectedFont) ?? FONTS[0]

  return (
    <View className="flex-1 bg-background">
      <Header title={t('menuColors.title')} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 + insets.bottom, gap: 20 }}
      >
        {/* Font */}
        <View>
          <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">
            {t('menuColors.fontSection')}
          </Text>
          <Select
            options={FONTS.map((f) => ({ label: t(`menuColors.fonts.${f.id}`), value: f.id, style: f.style }))}
            value={selectedFont}
            onChange={(id) => setSelectedFont(id as FontId)}
          />
        </View>

        {/* Accent color */}
        <View>
          <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">
            {t('menuColors.colorSection')}
          </Text>
          <Card>
            <View className="flex-row items-center gap-4">
              <View
                style={{
                  width: 52, height: 52, borderRadius: 26,
                  backgroundColor: accentHex,
                  borderWidth: 3, borderColor: isDark ? '#3F3F46' : '#E4E4E7',
                  shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4,
                }}
              />
              <View className="flex-1">
                <Text className="text-base font-semibold text-primary">{accentHex.toUpperCase()}</Text>
                <Text className="text-xs text-muted mt-0.5">R {r} · G {g} · B {b}</Text>
              </View>
              <Pressable
                onPress={() => setPickerOpen(true)}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                className="px-4 py-2 rounded-xl bg-accent"
              >
                <Text className="text-white text-sm font-semibold">{t('menuColors.changeColor')}</Text>
              </Pressable>
            </View>
          </Card>
        </View>

        {/* Banner */}
        <View>
          <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">
            {t('menuColors.bannerSection')}
          </Text>
          <Text className="text-muted text-sm mb-4 leading-relaxed">{t('menuColors.bannerHint')}</Text>
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
          <View style={{ borderRadius: 16, overflow: 'hidden' }}>
            <View style={{ padding: 20, paddingBottom: 28, backgroundColor: accentHex, position: 'relative' }}>
              {bannerUrl && <Image source={{ uri: bannerUrl }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />}
              {bannerUrl && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />}
              <View style={{ position: 'relative' }}>
                <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 12, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: '#fff' }}>
                    {(restaurant?.name ?? 'B').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={[{ fontSize: 22, color: '#fff', lineHeight: 28 }, fnt.style]}>
                  {restaurant?.name ?? 'Mi Bar'}
                </Text>
                <Text style={[{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }, fnt.style]}>
                  {t('menuColors.previewSubtitle')}
                </Text>
              </View>
            </View>
            <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: isDark ? '#1E1E22' : '#FAFAFA' }}>
              <View className="flex-row flex-wrap gap-2">
                {[t('categories.title'), t('products.title'), t('menuColors.previewCategoryDesserts')].map((cat) => (
                  <View key={cat} style={{ backgroundColor: `rgba(${r},${g},${b},0.12)`, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}>
                    <Text style={[{ color: accentHex, fontWeight: '600', fontSize: 12 }, fnt.style]}>{cat}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <Button label={t('menuColors.save')} onPress={handleSave} loading={saving} />
      </ScrollView>

      <Toast message={toast.message} visible={toast.visible} />

      <ColorPickerModal
        visible={pickerOpen}
        value={accentColor}
        title={t('menuColors.colorSection')}
        onClose={() => setPickerOpen(false)}
        onConfirm={(color) => { setAccentColor(color); setPickerOpen(false); haptic.select() }}
        isDark={isDark}
        showAlpha={false}
      />
    </View>
  )
}
