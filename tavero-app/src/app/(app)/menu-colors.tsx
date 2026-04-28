import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { haptic } from '@/lib/haptics'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { useRestaurant } from '@/context/RestaurantContext'
import { supabase } from '@/lib/supabase'
import { DESIGN_TOKENS } from '@/lib/designTokens'

type PaletteId =
  | 'amber'
  | 'emerald'
  | 'indigo'
  | 'teal'
  | 'rose'
  | 'slate'
  | 'mono'
  | 'ocean'
  | 'sunset'
  | 'violet'
type FontId = 'inter' | 'montserrat' | 'playfair' | 'lato'

const PALETTES: { id: PaletteId; color: string; bg: string }[] = [
  { id: 'amber',   color: '#D97706', bg: '#FEF3C7' },
  { id: 'emerald', color: '#059669', bg: '#D1FAE5' },
  { id: 'indigo',  color: '#4F46E5', bg: '#EEF2FF' },
  { id: 'teal',    color: '#0D9488', bg: '#CCFBF1' },
  { id: 'rose',    color: '#E11D48', bg: '#FFE4E6' },
  { id: 'slate',   color: '#475569', bg: '#F1F5F9' },
  { id: 'mono',    color: '#111827', bg: '#F3F4F6' },
  { id: 'ocean',   color: '#0369A1', bg: '#E0F2FE' },
  { id: 'sunset',  color: '#EA580C', bg: '#FFEDD5' },
  { id: 'violet',  color: '#7C3AED', bg: '#EDE9FE' },
]

const FONTS: { id: FontId; style: object }[] = [
  { id: 'inter',      style: { fontFamily: undefined } },
  { id: 'montserrat', style: { fontWeight: '700' as const } },
  { id: 'playfair',   style: { fontStyle: 'italic' as const } },
  { id: 'lato',       style: {} },
]

export default function MenuColorsScreen() {
  const { restaurant, refresh } = useRestaurant()
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const { t } = useTranslation()

  const [selectedPalette, setSelectedPalette] = useState<PaletteId>(
    (restaurant?.menu_accent_color as PaletteId) ?? 'amber'
  )
  const [selectedFont, setSelectedFont] = useState<FontId>(
    (restaurant?.menu_font as FontId) ?? 'inter'
  )
  const [saving, setSaving] = useState(false)
  const bottomCtaSafeSpace = 88

  useEffect(() => {
    if (restaurant) {
      setSelectedPalette((restaurant.menu_accent_color as PaletteId) ?? 'amber')
      setSelectedFont((restaurant.menu_font as FontId) ?? 'inter')
    }
  }, [restaurant?.id])

  const hasChanges =
    selectedPalette !== ((restaurant?.menu_accent_color as PaletteId) ?? 'amber') ||
    selectedFont !== ((restaurant?.menu_font as FontId) ?? 'inter')

  const handleSave = async () => {
    if (!restaurant) return
    haptic.light()
    setSaving(true)
    const { error } = await supabase
      .from('restaurants')
      .update({ menu_accent_color: selectedPalette, menu_font: selectedFont })
      .eq('id', restaurant.id)
    if (error) {
      setSaving(false)
      toast.show(t('menuColors.saveError'))
      return
    }
    await refresh()
    setSaving(false)
    toast.show(t('menuColors.saved'))
  }

  const pal = PALETTES.find((p) => p.id === selectedPalette) ?? PALETTES[0]
  const fnt = FONTS.find((f) => f.id === selectedFont) ?? FONTS[0]

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-14 pb-4 bg-surface border-b border-border flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="mr-4 w-9 h-9 rounded-full bg-borderSoft items-center justify-center"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Text className="text-primary text-2xl leading-none" style={{ marginTop: -2 }}>‹</Text>
        </Pressable>
        <Text className="text-xl font-bold text-primary flex-1">{t('menuColors.title')}</Text>
        {saving && <ActivityIndicator size="small" color={DESIGN_TOKENS.colors.accent} />}
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: bottomCtaSafeSpace + insets.bottom,
          gap: 20,
        }}
      >

        {/* Font */}
        <View>
          <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">
            {t('menuColors.fontSection')}
          </Text>
          <View className="gap-3">
            {FONTS.map((f) => {
              const selected = selectedFont === f.id
              const selectedFontContainerClass = isDark
                ? 'bg-surface border-primary'
                : 'bg-borderSoft border-primary'
              const selectedFontTextClass = isDark ? 'text-white' : 'text-primary'
              return (
                <Pressable
                  key={f.id}
                  onPress={() => { haptic.select(); setSelectedFont(f.id) }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  <View
                    className={`flex-row items-center justify-between px-4 py-4 rounded-2xl border-2 ${
                      selected ? selectedFontContainerClass : 'bg-surface border-border'
                    }`}
                  >
                    <View>
                      <Text className={`text-sm font-semibold ${selected ? selectedFontTextClass : 'text-muted'}`}>
                        {t(`menuColors.fonts.${f.id}`)}
                      </Text>
                      <Text
                        className={`${selected ? selectedFontTextClass : 'text-primary'}`}
                        style={[{ fontSize: 22, marginTop: 2 }, f.style]}
                      >
                        {t('dashboard.yourMenu')}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Color */}
        <View>
          <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">
            {t('menuColors.colorSection')}
          </Text>
          <Text className="text-muted text-sm mb-4 leading-relaxed">
            {t('menuColors.colorHint')}
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {PALETTES.map((p) => {
              const selected = selectedPalette === p.id
              return (
                <Pressable
                  key={p.id}
                  onPress={() => { haptic.select(); setSelectedPalette(p.id) }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  className="items-center gap-2"
                >
                  <View
                    style={{
                      width: 56, height: 56, borderRadius: 16,
                      backgroundColor: p.bg, alignItems: 'center', justifyContent: 'center',
                      borderWidth: selected ? 3 : 1.5,
                      borderColor: selected ? p.color : 'transparent',
                    }}
                  >
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: p.color }} />
                  </View>
                  <Text className={`${selected ? 'text-accent' : 'text-muted'}`} style={{ fontSize: 11, fontWeight: selected ? '600' : '400' }}>
                    {t(`menuColors.palettes.${p.id}`)}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Preview */}
        <View>
          <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">
            {t('menuColors.previewSection')}
          </Text>
          <Card>
            <View style={{ backgroundColor: pal.bg, borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <Text style={[{ fontWeight: '700', fontSize: 18, color: pal.color }, fnt.style]}>
                {restaurant?.name ?? t('menuColors.previewRestaurantFallback')}
              </Text>
              <Text style={[{ color: pal.color, opacity: 0.7, fontSize: 13, marginTop: 4 }, fnt.style]}>
                {t('menuColors.previewSubtitle')}
              </Text>
            </View>
            <View className="flex-row gap-2">
              {[t('categories.title'), t('products.title'), t('menuColors.previewCategoryDesserts')].map((cat) => (
                <View key={cat} style={{ backgroundColor: pal.bg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={[{ color: pal.color, fontWeight: '600', fontSize: 12 }, fnt.style]}>{cat}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {hasChanges && (
          <Button
            label={t('menuColors.submit')}
            onPress={handleSave}
            loading={saving}
            className="mb-1"
          />
        )}

      </ScrollView>
      <Toast message={toast.message} visible={toast.visible} />
    </View>
  )
}
