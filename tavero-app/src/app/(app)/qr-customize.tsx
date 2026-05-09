import { useState, useRef, useCallback } from 'react'
import { ScrollView, Text, View, Pressable, TextInput } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from 'nativewind'
import { captureRef } from 'react-native-view-shot'
import * as Sharing from 'expo-sharing'
import QRCode from 'react-native-qrcode-svg'
import { useRestaurant } from '@/context/RestaurantContext'
import { Header } from '@/components/ui/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'

const MENU_BASE_URL = process.env.EXPO_PUBLIC_MENU_URL ?? 'https://tavero.app/menu'

const QR_COLORS = [
  { id: 'black', fg: '#000000', bg: '#FFFFFF', label: 'Negro' },
  { id: 'navy', fg: '#1E3A5F', bg: '#FFFFFF', label: 'Navy' },
  { id: 'wine', fg: '#7E2D4D', bg: '#FFFFFF', label: 'Vino' },
  { id: 'forest', fg: '#1B5E20', bg: '#FFFFFF', label: 'Bosque' },
  { id: 'purple', fg: '#6A1B9A', bg: '#FFFFFF', label: 'Púrpura' },
  { id: 'dark', fg: '#FAFAFA', bg: '#1C1917', label: 'Oscuro' },
] as const

type ColorId = typeof QR_COLORS[number]['id']

export default function QrCustomizeScreen() {
  const { restaurant } = useRestaurant()
  const { t } = useTranslation()
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const toast = useToast()
  const qrRef = useRef<View>(null)

  const [selectedColor, setSelectedColor] = useState<ColorId>('black')
  const [frameText, setFrameText] = useState(restaurant?.name ?? t('qr.defaultFrame'))
  const [showFrame, setShowFrame] = useState(false)
  const [sharing, setSharing] = useState(false)

  const menuUrl = restaurant ? `${MENU_BASE_URL}/${restaurant.slug}` : ''
  const colorConfig = QR_COLORS.find((c) => c.id === selectedColor) ?? QR_COLORS[0]

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

  return (
    <View className="flex-1 bg-background">
      <Header title={t('qr.title')} subtitle={t('qr.subtitle')} />

      <ScrollView contentContainerClassName="px-6 py-6 gap-5">
        {/* QR Preview */}
        <Card className="items-center py-8">
          <View ref={qrRef} collapsable={false} className="items-center">
            {showFrame && (
              <View
                className="rounded-t-2xl px-6 py-3 mb-0"
                style={{ backgroundColor: colorConfig.fg }}
              >
                <Text
                  className="text-sm font-bold text-center"
                  style={{ color: colorConfig.bg }}
                >
                  {frameText || restaurant?.name}
                </Text>
              </View>
            )}
            <View
              className={`p-5 ${showFrame ? 'rounded-b-2xl' : 'rounded-2xl'}`}
              style={{ backgroundColor: colorConfig.bg }}
            >
              <QRCode
                value={menuUrl || 'https://tavero.app'}
                size={200}
                backgroundColor={colorConfig.bg}
                color={colorConfig.fg}
              />
            </View>
            {showFrame && (
              <View
                className="rounded-b-2xl px-6 py-2 mt-0"
                style={{ backgroundColor: colorConfig.fg }}
              >
                <Text
                  className="text-[10px] text-center font-medium"
                  style={{ color: colorConfig.bg, opacity: 0.7 }}
                >
                  {menuUrl}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Color selector */}
        <Card>
          <Text className="text-sm font-semibold text-primary mb-3">{t('qr.colorSection')}</Text>
          <View className="flex-row flex-wrap gap-3">
            {QR_COLORS.map((color) => {
              const isActive = selectedColor === color.id
              return (
                <Pressable
                  key={color.id}
                  onPress={() => setSelectedColor(color.id)}
                  className={`items-center gap-1.5 px-3 py-2 rounded-xl border-2 ${
                    isActive ? 'border-accent' : 'border-transparent'
                  }`}
                >
                  <View className="flex-row">
                    <View
                      className="w-6 h-6 rounded-l-lg"
                      style={{ backgroundColor: color.fg }}
                    />
                    <View
                      className="w-6 h-6 rounded-r-lg border border-border"
                      style={{ backgroundColor: color.bg }}
                    />
                  </View>
                  <Text className={`text-[10px] font-semibold ${isActive ? 'text-accent' : 'text-muted'}`}>
                    {color.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </Card>

        {/* Frame options */}
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

        {/* Actions */}
        <Button
          label={t('qr.share')}
          onPress={handleShare}
          loading={sharing}
        />
      </ScrollView>
      <Toast message={toast.message} visible={toast.visible} />
    </View>
  )
}
