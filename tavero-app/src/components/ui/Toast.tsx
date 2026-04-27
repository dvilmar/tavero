import { useEffect, useRef } from 'react'
import { Animated, Text } from 'react-native'

type Props = { message: string; visible: boolean }

export function Toast({ message, visible }: Props) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(20)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 20, duration: 200, useNativeDriver: true }),
      ]).start()
    }
  }, [visible])

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', bottom: 40, left: 24, right: 24,
        opacity, transform: [{ translateY }],
        backgroundColor: '#1A1A2E', borderRadius: 12,
        paddingVertical: 12, paddingHorizontal: 16,
        alignItems: 'center', shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15,
        shadowRadius: 8, elevation: 6,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{message}</Text>
    </Animated.View>
  )
}
