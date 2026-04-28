import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'

type Props = {
  title: string
  subtitle?: string
  onBack?: () => void
  rightLabel?: string
  onRightPress?: () => void
  rightDanger?: boolean
}

export function Header({ title, subtitle, onBack, rightLabel, onRightPress, rightDanger }: Props) {
  return (
    <View className="bg-surface border-b border-border px-5 pt-14 pb-4">
      <View className="flex-row items-center">
        <Pressable
          onPress={onBack ?? (() => router.back())}
          hitSlop={12}
          className="w-9 h-9 rounded-full bg-borderSoft items-center justify-center mr-3"
        >
          <Text className="text-primary text-2xl leading-none" style={{ marginTop: -2 }}>‹</Text>
        </Pressable>
        <View className="flex-1">
          <Text className="text-lg font-bold text-primary tracking-tight" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-xs text-muted mt-0.5" numberOfLines={1}>{subtitle}</Text>
          ) : null}
        </View>
        {rightLabel ? (
          <Pressable onPress={onRightPress} hitSlop={8}>
            <Text className={`font-semibold text-sm ${rightDanger ? 'text-danger' : 'text-accent'}`}>
              {rightLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}
