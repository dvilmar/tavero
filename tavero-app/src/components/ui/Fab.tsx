import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { haptic } from '@/lib/haptics'

type Props = {
  onPress: () => void
  label?: string
  bottomOffset?: number
}

export function Fab({ onPress, label, bottomOffset = 32 }: Props) {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        position: 'absolute',
        bottom: bottomOffset + insets.bottom,
        right: 20,
        zIndex: 10,
      }}
    >
      <Pressable
        onPress={() => { haptic.light(); onPress() }}
        className="w-14 h-14 rounded-full bg-accent items-center justify-center shadow-lg"
        style={{ elevation: 4, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text className="text-white text-3xl leading-none" style={{ marginTop: -1 }}>+</Text>
      </Pressable>
    </View>
  )
}
