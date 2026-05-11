import { Pressable, View } from 'react-native'
import { Text } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'nativewind'
import { haptic } from '@/lib/haptics'
import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  backArrow?: boolean
  onBack?: () => void
  action?: ReactNode
}

export function Header({ title, subtitle, backArrow, onBack, action }: Props) {
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'

  const handleBack = () => {
    haptic.light()
    if (onBack) onBack()
    else router.back()
  }

  return (
    <View className="bg-surface border-b border-border px-5 pt-14 pb-4">
      <View className="flex-row items-center">
        {(backArrow ?? true) && (
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            className="w-9 h-9 rounded-full bg-borderSoft items-center justify-center mr-3"
            accessibilityRole="button"
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Ionicons name="chevron-back" size={20} color={isDark ? '#F9FAFB' : '#111827'} />
          </Pressable>
        )}
        <View className="flex-1">
          <Text className="text-lg font-bold text-primary tracking-tight" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-xs text-muted mt-0.5" numberOfLines={1}>{subtitle}</Text>
          ) : null}
        </View>
        {action}
      </View>
    </View>
  )
}
