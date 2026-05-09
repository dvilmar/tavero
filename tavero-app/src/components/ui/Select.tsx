import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, View, Modal, TouchableWithoutFeedback } from 'react-native'

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

  const selected = options.find((o) => o.value === value)

  const handleSelect = useCallback(
    (option: Option) => {
      onChange(option.value)
      setOpen(false)
    },
    [onChange]
  )

  useEffect(() => {
    if (open) {
      const selectedOption = options.find((o) => o.value === value)
      // Scroll to selected option after modal opens
    }
  }, [open])

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between px-4 py-3.5 rounded-2xl border-2 bg-surface border-border"
      >
        <Text className="text-base text-primary" style={selected?.style}>
          {selected?.label ?? placeholder ?? ''}
        </Text>
        <Text className="text-muted text-lg ml-2">▾</Text>
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
                        className="flex-row items-center justify-between py-4 px-3 rounded-xl"
                        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                      >
                        <Text
                          className={`text-lg ${isSelected ? 'font-bold text-accent' : 'text-primary'}`}
                          style={option.style}
                        >
                          {option.label}
                        </Text>
                        {isSelected && (
                          <Text className="text-accent text-lg ml-3">✓</Text>
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
