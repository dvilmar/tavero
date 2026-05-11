import { useState, useRef, useCallback, useEffect } from 'react'
import { ScrollView, Text, View, Pressable, TextInput } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from 'nativewind'
import { captureRef } from 'react-native-view-shot'
import * as Sharing from 'expo-sharing'
import AsyncStorage from '@react-native-async-storage/async-storage'
import QRCode from 'react-native-qrcode-svg'
import { Ionicons } from '@expo/vector-icons'
import { useRestaurant } from '@/context/RestaurantContext'
import { Header } from '@/components/ui/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { haptic } from '@/lib/haptics'
import { ColorPickerModal } from '@/components/ui/ColorPickerModal'

const MENU_BASE_URL = process.env.EXPO_PUBLIC_MENU_URL ?? 'https://tavero.app/menu'
const STORAGE_KEY = 'qr_prefs_v2'

type QrPrefs = { fg: string; bg: string; showFrame: boolean; frameText: string }

function toHex6(color: string): string {
  if (color.startsWith('#')) return color.slice(0, 7)
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (match) {
    const h = (n: string) => parseInt(n).toString(16).padStart(2, '0')
    return `#${h(match[1])}${h(match[2])}${h(match[3])}`
  }
  return color
}

export default function QrCustomizeScreen() {
  const { restaurant } = useRestaurant()
  const { t } = useTranslation()
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const toast = useToast()
  const qrRef = useRef<View>(null)

  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [frameText, setFrameText] = useState(restaurant?.name ?? t('qr.defaultFrame'))
  const [showFrame, setShowFrame] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [pickerTarget, setPickerTarget] = useState<'fg' | 'bg' | null>(null)

  const menuUrl = restaurant ? `${MENU_BASE_URL}/${restaurant.slug}` : ''
  const fgHex = toHex6(fgColor)
  const bgHex = toHex6(bgColor)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return
      try {
        const prefs: QrPrefs = JSON.parse(raw)
        if (prefs.fg) setFgColor(prefs.fg)
        if (prefs.bg) setBgColor(prefs.bg)
        if (typeof prefs.showFrame === 'boolean') setShowFrame(prefs.showFrame)
        if (prefs.frameText) setFrameText(prefs.frameText)
      } catch {}
    })
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    haptic.select()
    const prefs: QrPrefs = { fg: fgHex, bg: bgHex, showFrame, frameText }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    setSaving(false)
    haptic.success()
    toast.show(t('qr.saved'))
  }, [fgHex, bgHex, showFrame, frameText, t, toast])

  const handleShare = useCallback(async () => {
    if (!qrRef.current) return
    setSharing(true)
    try {
      const uri = await captureRef(qrRef.current, { format: 'png', quality: 1 })
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: t('qr.shareTitle') })
    } catch (e) {
      console.error('QR share error', e)
    }
    setSharing(false)
  }, [t])

  const handlePickerConfirm = useCallback((color: string) => {
    if (pickerTarget === 'fg') setFgColor(toHex6(color))
    else if (pickerTarget === 'bg') setBgColor(toHex6(color))
    setPickerTarget(null)
    haptic.select()
  }, [pickerTarget])

  return (
    <View className="flex-1 bg-background">
      <Header
        title={t('qr.title')}
        subtitle={t('qr.subtitle')}
        action={
          <Pressable onPress={handleShare} disabled={sharing} hitSlop={8} style={{ opacity: sharing ? 0.5 : 1 }}>
            <Ionicons name="share-outline" size={22} color={isDark ? '#E5E7EB' : '#374151'} />
          </Pressable>
        }
      />

      <ScrollView contentContainerClassName="px-6 py-6 gap-5">
        {/* QR Preview */}
        <Card className="items-center py-8">
          <View ref={qrRef} collapsable={false} className="items-center">
            {showFrame && (
              <View className="rounded-t-2xl px-6 py-3" style={{ backgroundColor: fgHex }}>
                <Text className="text-sm font-bold text-center" style={{ color: bgHex }}>
                  {frameText || restaurant?.name}
                </Text>
              </View>
            )}
            <View className={`p-5 ${showFrame ? 'rounded-b-2xl' : 'rounded-2xl'}`} style={{ backgroundColor: bgHex }}>
              <QRCode
                value={menuUrl || 'https://tavero.app'}
                size={200}
                backgroundColor={bgHex}
                color={fgHex}
              />
            </View>
            {showFrame && (
              <View className="rounded-b-2xl px-6 py-2" style={{ backgroundColor: fgHex }}>
                <Text className="text-[10px] text-center font-medium" style={{ color: bgHex, opacity: 0.7 }}>
                  {menuUrl}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Color pickers */}
        <Card>
          <Text className="text-sm font-semibold text-primary mb-4">{t('qr.colorsSection')}</Text>
          <View className="gap-3">
            {([
              { key: 'fg' as const, label: t('qr.colorFg'), color: fgHex },
              { key: 'bg' as const, label: t('qr.colorBg'), color: bgHex },
            ]).map(({ key, label, color }) => (
              <Pressable
                key={key}
                onPress={() => setPickerTarget(key)}
                style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                className={`flex-row items-center gap-4 px-4 py-3 rounded-xl border ${isDark ? 'bg-surface border-border' : 'bg-zinc-50 border-zinc-200'}`}
              >
                <View style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: color,
                  borderWidth: 2, borderColor: isDark ? '#3F3F46' : '#D4D4D8',
                }} />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-primary">{label}</Text>
                  <Text className="text-xs text-muted mt-0.5">{color.toUpperCase()}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={isDark ? '#6B7280' : '#9CA3AF'} />
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Frame */}
        <Card>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-semibold text-primary">{t('qr.frameSection')}</Text>
            <Pressable
              onPress={() => setShowFrame(!showFrame)}
              className={`w-12 h-7 rounded-full justify-center ${showFrame ? 'bg-accent items-end' : 'bg-border items-start'}`}
            >
              <View className="w-5 h-5 rounded-full bg-white mx-1 shadow-sm" />
            </Pressable>
          </View>
          {showFrame && (
            <TextInput
              value={frameText}
              onChangeText={(v) => setFrameText(v.slice(0, 40))}
              placeholder={t('qr.framePlaceholder')}
              className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-primary"
              placeholderTextColor={isDark ? '#78716C' : '#A8A29E'}
            />
          )}
        </Card>

        <Button label={t('qr.save')} onPress={handleSave} loading={saving} />
      </ScrollView>

      <Toast message={toast.message} visible={toast.visible} />

      <ColorPickerModal
        visible={pickerTarget !== null}
        value={pickerTarget === 'bg' ? bgColor : fgColor}
        title={pickerTarget === 'bg' ? t('qr.colorBg') : t('qr.colorFg')}
        onClose={() => setPickerTarget(null)}
        onConfirm={handlePickerConfirm}
        isDark={isDark}
        showAlpha={false}
      />
    </View>
  )
}
