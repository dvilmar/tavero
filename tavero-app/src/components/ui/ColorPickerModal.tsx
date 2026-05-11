import { useCallback, useEffect, useRef, useState } from 'react'
import { Modal, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import ColorPicker, {
  Panel1,
  HueSlider,
  OpacitySlider,
  Swatches,
  Preview,
  InputWidget,
  type ColorFormatsObject,
} from 'reanimated-color-picker'
import { Button } from '@/components/ui/Button'

const SWATCHES = [
  '#111827', '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899', '#7E2D4D',
  '#0D9488', '#78350F', '#FFFFFF', '#6B7280', '#000000',
]

type Props = {
  visible: boolean
  value: string
  title: string
  onClose: () => void
  onConfirm: (hex: string) => void
  isDark?: boolean
  showAlpha?: boolean
}

export function ColorPickerModal({ visible, value, title, onClose, onConfirm, isDark = false, showAlpha = true }: Props) {
  const { t } = useTranslation()
  const selectedColor = useRef(value)
  const [, forceRender] = useState(0)

  useEffect(() => {
    if (visible) {
      selectedColor.current = value
      forceRender((n) => n + 1)
    }
  }, [visible, value])

  const handleChange = useCallback((colors: ColorFormatsObject) => {
    selectedColor.current = colors.rgba
  }, [])

  const handleConfirm = useCallback(() => {
    onConfirm(selectedColor.current)
  }, [onConfirm])

  const bg = isDark ? '#18181B' : '#FFFFFF'
  const surface = isDark ? '#27272A' : '#F4F4F5'
  const textPrimary = isDark ? '#F9FAFB' : '#111827'
  const textMuted = isDark ? '#9CA3AF' : '#6B7280'
  const border = isDark ? '#3F3F46' : '#E4E4E7'

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 20, paddingVertical: 16,
          borderBottomWidth: 1, borderBottomColor: border,
        }}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={{ fontSize: 16, color: textMuted, fontWeight: '500' }}>{t('common.cancel')}</Text>
          </Pressable>
          <Text style={{ fontSize: 17, fontWeight: '700', color: textPrimary }}>{title}</Text>
          <View style={{ width: 64 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, gap: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ColorPicker
            key={visible ? value : '__hidden__'}
            value={value}
            onChangeJS={handleChange}
            thumbSize={26}
            thumbShape="circle"
            sliderThickness={28}
            style={{ gap: 16 }}
          >
            {/* Current color preview */}
            <Preview
              style={{ height: 52, borderRadius: 14 }}
              hideInitialColor
            />

            {/* 2D saturation + brightness panel */}
            <Panel1
              style={{ borderRadius: 14, height: 220 }}
              thumbShape="circle"
              thumbSize={28}
            />

            {/* Hue ring */}
            <HueSlider
              style={{ borderRadius: 14, height: 28 }}
              thumbShape="circle"
              thumbSize={32}
            />

            {/* Opacity / Alpha */}
            {showAlpha && (
              <OpacitySlider
                style={{ borderRadius: 14, height: 28 }}
                thumbShape="circle"
                thumbSize={32}
              />
            )}

            {/* Preset swatches */}
            <Swatches
              colors={SWATCHES}
              style={{ gap: 0 }}
              swatchStyle={{ borderRadius: 20, width: 36, height: 36, margin: 4 }}
            />

            {/* Hex + RGB text inputs */}
            <InputWidget
              defaultFormat="HEX"
              formats={['HEX', 'RGB', 'HSL']}
              disableAlphaChannel={!showAlpha}
              inputStyle={{
                color: textPrimary,
                backgroundColor: surface,
                borderRadius: 10,
                paddingVertical: 8,
                fontSize: 14,
                fontWeight: '600',
              }}
              inputTitleStyle={{ color: textMuted, fontSize: 11, fontWeight: '700' }}
              iconColor={textMuted}
            />
          </ColorPicker>
        </ScrollView>

        {/* Confirm button */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, borderTopWidth: 1, borderTopColor: border }}>
          <Button label={t('common.confirm')} onPress={handleConfirm} />
        </View>
      </SafeAreaView>
    </Modal>
  )
}
