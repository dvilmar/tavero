import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from 'nativewind'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useRestaurant } from '@/context/RestaurantContext'
import { haptic } from '@/lib/haptics'
import { Header } from '@/components/ui/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Fab } from '@/components/ui/Fab'
import { EmptyState } from '@/components/ui/EmptyState'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { DESIGN_TOKENS } from '@/lib/designTokens'
import { sanitizeText } from '@/lib/utils'

type BannerRow = {
  id: string
  text: string
  link_url: string | null
  bg_color: string
  text_color: string
  is_active: boolean
  sort_order: number
}

const PRESET_COLORS = [
  { bg: '#1C1917', text: '#FFFFFF', label: 'Negro' },
  { bg: '#7C3AED', text: '#FFFFFF', label: 'Morado' },
  { bg: '#DC2626', text: '#FFFFFF', label: 'Rojo' },
  { bg: '#D97706', text: '#FFFFFF', label: 'Ámbar' },
  { bg: '#059669', text: '#FFFFFF', label: 'Verde' },
  { bg: '#0284C7', text: '#FFFFFF', label: 'Azul' },
  { bg: '#FAFAF9', text: '#1C1917', label: 'Blanco' },
]

export default function BannersScreen() {
  const { restaurant } = useRestaurant()
  const { t } = useTranslation()
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const toast = useToast()

  const [banners, setBanners] = useState<BannerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [selectedColor, setSelectedColor] = useState(0)
  const [saving, setSaving] = useState(false)

  const loadBanners = useCallback(async () => {
    if (!restaurant) return
    const { data } = await (supabase as any)
      .from('restaurant_banners')
      .select('id, text, link_url, bg_color, text_color, is_active, sort_order')
      .eq('restaurant_id', restaurant.id)
      .order('sort_order')
    setBanners(data ?? [])
    setLoading(false)
  }, [restaurant])

  useEffect(() => { loadBanners() }, [loadBanners])

  const resetForm = () => {
    setText(''); setLinkUrl(''); setSelectedColor(0); setEditingId(null); setShowForm(false)
  }

  const handleSave = async () => {
    if (!restaurant || !text.trim()) return
    setSaving(true)
    const preset = PRESET_COLORS[selectedColor]
    const payload = {
      text: text.trim(),
      link_url: linkUrl.trim() || null,
      bg_color: preset.bg,
      text_color: preset.text,
    }

    if (editingId) {
      await (supabase as any).from('restaurant_banners').update(payload).eq('id', editingId)
    } else {
      const nextOrder = banners.length > 0 ? Math.max(...banners.map((b) => b.sort_order)) + 1 : 0
      await (supabase as any).from('restaurant_banners').insert({
        ...payload,
        restaurant_id: restaurant.id,
        sort_order: nextOrder,
      })
    }

    setSaving(false)
    haptic.success()
    resetForm()
    toast.show(editingId ? t('banners.updated') : t('banners.created'))
    loadBanners()
  }

  const handleEdit = (banner: BannerRow) => {
    setEditingId(banner.id)
    setText(banner.text)
    setLinkUrl(banner.link_url ?? '')
    const idx = PRESET_COLORS.findIndex((c) => c.bg === banner.bg_color)
    setSelectedColor(idx >= 0 ? idx : 0)
    setShowForm(true)
  }

  const handleToggle = async (banner: BannerRow) => {
    haptic.select()
    await (supabase as any)
      .from('restaurant_banners')
      .update({ is_active: !banner.is_active })
      .eq('id', banner.id)
    loadBanners()
  }

  const handleDelete = (banner: BannerRow) => {
    Alert.alert(t('banners.deleteTitle'), t('banners.deleteConfirm', { name: banner.text }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'), style: 'destructive',
        onPress: async () => {
          await (supabase as any).from('restaurant_banners').delete().eq('id', banner.id)
          toast.show(t('banners.deleted'))
          loadBanners()
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
      <Header title={t('banners.title')} subtitle={t('banners.subtitle')} />

      <ScrollView contentContainerClassName="px-6 py-6 gap-4">
        {banners.length === 0 && !showForm ? (
          <EmptyState
            icon="📢"
            title={t('banners.empty')}
            description={t('banners.emptyDesc')}
          />
        ) : (
          banners.map((banner) => (
            <Card key={banner.id} className="gap-2" style={{ opacity: banner.is_active ? 1 : 0.55 }}>
              {/* Preview */}
              <View
                className="rounded-xl px-4 py-3 mb-1 overflow-hidden"
                style={{ backgroundColor: banner.bg_color }}
              >
                <Text className="text-sm font-medium text-center" style={{ color: banner.text_color }}>
                  {banner.text}
                </Text>
                {!banner.is_active && (
                  <View className="absolute top-1.5 right-1.5 bg-black/40 rounded-full px-2 py-0.5 flex-row items-center gap-1">
                    <Ionicons name="eye-off-outline" size={10} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{t('categories.hidden').toUpperCase()}</Text>
                  </View>
                )}
              </View>

              {banner.link_url ? (
                <Text className="text-[11px] text-muted" numberOfLines={1}>{banner.link_url}</Text>
              ) : null}

              <View className="flex-row gap-2 mt-1">
                <Pressable
                  onPress={() => { haptic.light(); handleEdit(banner) }}
                  className="flex-1 items-center py-2 rounded-lg bg-surface border border-border"
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text className="text-xs font-semibold text-primary">{t('common.edit')}</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleToggle(banner)}
                  className={`flex-1 items-center py-2 rounded-lg border ${
                    banner.is_active ? 'bg-surface border-border' : 'bg-accentSoft border-accent/30'
                  }`}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text className={`text-xs font-semibold ${banner.is_active ? 'text-primary' : 'text-accent'}`}>
                    {banner.is_active ? t('banners.hide') : t('banners.show')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(banner)}
                  className={`items-center px-3 py-2 rounded-lg ${isDark ? 'bg-surface border border-red-800' : 'bg-red-50 border border-red-200'}`}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Ionicons name="trash-outline" size={15} color={isDark ? '#FCA5A5' : '#DC2626'} />
                </Pressable>
              </View>
            </Card>
          ))
        )}

        {showForm && (
          <Card className="gap-3 border-2 border-accent/30">
            <Text className="text-sm font-semibold text-primary">
              {editingId ? t('banners.editTitle') : t('banners.newTitle')}
            </Text>

            <TextInput
              value={text}
              onChangeText={(v) => setText(sanitizeText(v, 120))}
              placeholder={t('banners.textPlaceholder')}
              className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-primary"
              placeholderTextColor={isDark ? '#78716C' : '#A8A29E'}
            />

            <TextInput
              value={linkUrl}
              onChangeText={(v) => setLinkUrl(v)}
              placeholder={t('banners.linkPlaceholder')}
              className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-primary"
              placeholderTextColor={isDark ? '#78716C' : '#A8A29E'}
              keyboardType="url"
              autoCapitalize="none"
            />

            {/* Color picker */}
            <Text className="text-xs font-semibold text-muted">{t('banners.colorLabel')}</Text>
            <View className="flex-row flex-wrap gap-2">
              {PRESET_COLORS.map((color, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => setSelectedColor(idx)}
                  className={`px-3 py-2 rounded-xl border-2 ${selectedColor === idx ? 'border-accent' : 'border-transparent'}`}
                  style={{ backgroundColor: color.bg }}
                >
                  <Text className="text-xs font-semibold" style={{ color: color.text }}>
                    {color.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Live preview */}
            <View
              className="rounded-xl px-4 py-3"
              style={{ backgroundColor: PRESET_COLORS[selectedColor].bg }}
            >
              <Text
                className="text-sm font-medium text-center"
                style={{ color: PRESET_COLORS[selectedColor].text }}
              >
                {text || t('banners.textPlaceholder')}
              </Text>
            </View>

            <View className="flex-row gap-2">
              <Button
                label={t('common.cancel')}
                variant="gray"
                onPress={resetForm}
                className="flex-1"
              />
              <Button
                label={t('common.save')}
                onPress={handleSave}
                loading={saving}
                className="flex-1"
              />
            </View>
          </Card>
        )}
      </ScrollView>

      {!showForm && (
        <Fab onPress={() => { resetForm(); setShowForm(true) }} />
      )}
      <Toast message={toast.message} visible={toast.visible} />
    </View>
  )
}
