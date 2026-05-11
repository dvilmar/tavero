import { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

type Props = {
  width?: number | string
  height?: number | string
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const radius: Record<NonNullable<Props['rounded']>, number> = {
  sm: 4, md: 8, lg: 12, xl: 16, full: 9999,
}

export function Skeleton({ width = '100%', height = 16, rounded = 'md', className = '' }: Props) {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.85, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4,  duration: 700, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])

  return (
    <Animated.View
      className={`bg-borderSoft ${className}`}
      style={{
        width,
        height,
        borderRadius: radius[rounded],
        opacity,
      }}
    />
  )
}

export function ProductRowSkeleton() {
  return (
    <View className="bg-surface rounded-2xl p-3 mb-2.5 border border-borderSoft flex-row items-center">
      <Skeleton width={52} height={52} rounded="lg" />
      <View className="flex-1 ml-3 gap-1.5">
        <Skeleton width="60%" height={14} />
        <Skeleton width="85%" height={11} />
        <Skeleton width={48} height={13} />
      </View>
      <Skeleton width={44} height={24} rounded="full" />
    </View>
  )
}

export function CategoryRowSkeleton() {
  return (
    <View className="bg-surface rounded-2xl overflow-hidden mb-3.5 border border-borderSoft">
      {/* Banner placeholder */}
      <Skeleton width="100%" height={56} rounded="sm" />
      {/* Body */}
      <View className="p-3.5 gap-3">
        <View className="flex-row items-center justify-between">
          <Skeleton width="50%" height={13} />
          <Skeleton width={44} height={24} rounded="full" />
        </View>
        <View className="flex-row gap-2">
          <Skeleton width="48%" height={34} rounded="xl" />
          <Skeleton width="48%" height={34} rounded="xl" />
        </View>
      </View>
    </View>
  )
}
