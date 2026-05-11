import { useCallback, useState } from 'react'
import { Modal, Pressable, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { haptic } from '@/lib/haptics'
import { useTheme } from '@/context/ThemeContext'

type Option = {
  label: string
  value: string
  style?: Record<string, unknown>
}

type Props = {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function Select({ options, value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const selected = options.find((o) => o.value === value)

  const handleSelect = useCallback(
    (option: Option) => {
      haptic.select()
      onChange(option.value)
      setOpen(false)
    },
    [onChange]
  )

  return (
    <>
      <Pressable
        onPress={() => { haptic.light(); setOpen(true) }}
        className="flex-row items-center justify-between px-4 py-3.5 rounded-2xl border-2 bg-surface border-border"
        style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
      >
        <Text className="text-base text-primary flex-1" style={selected?.style}>
          {selected?.label ?? placeholder ?? ''}
        </Text>
        <Ionicons name="chevron-down" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View className="flex-1 justify-end bg-black/40">
            <TouchableWithoutFeedback>
              <View className="bg-surface rounded-t-3xl max-h-[60%]">
                {/* Handle */}
                <View className="items-center pt-3 pb-2">
                  <View className="w-10 h-1 rounded-full bg-border" />
                </View>

                <ScrollView className="px-4 pb-8">
                  {options.map((option) => {
                    const isSelected = option.value === value
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => handleSelect(option)}
                        className={`flex-row items-center justify-between py-4 px-3 rounded-xl ${isSelected ? 'bg-accentSoft' : ''}`}
                        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                      >
                        <Text
                          className={`text-lg ${isSelected ? 'font-bold text-accent' : 'text-primary'}`}
                          style={option.style}
                        >
                          {option.label}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark" size={20} color={isDark ? '#F9FAFB' : '#111827'} />
                        )}
                      </Pressable>
                    )
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  )
}
