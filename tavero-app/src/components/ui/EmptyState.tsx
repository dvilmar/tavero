import { Text, View } from 'react-native'

type Props = {
  icon?: string
  title: string
  description?: string
}

export function EmptyState({ icon = '✨', title, description }: Props) {
  return (
    <View className="items-center py-20 px-6">
      <View className="w-16 h-16 rounded-full bg-accentSoft items-center justify-center mb-4">
        <Text className="text-3xl">{icon}</Text>
      </View>
      <Text className="text-base font-semibold text-primary text-center">{title}</Text>
      {description ? (
        <Text className="text-sm text-muted text-center mt-1.5 leading-relaxed">{description}</Text>
      ) : null}
    </View>
  )
}
