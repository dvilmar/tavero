import { useState } from 'react'
import { Image, Text, View } from 'react-native'

type Props = {
  uri?: string | null
  width: number
  height: number
  borderRadius?: number
  fallbackIcon?: string
  className?: string
}

export function SafeImage({ uri, width, height, borderRadius, fallbackIcon = '🖼️', className = '' }: Props) {
  const [error, setError] = useState(false)

  if (!uri || error) {
    return (
      <View
        style={{ width, height, borderRadius: borderRadius ?? 0 }}
        className="bg-borderSoft items-center justify-center"
      >
        <Text style={{ fontSize: Math.min(width, height) * 0.4 }}>{fallbackIcon}</Text>
      </View>
    )
  }

  return (
    <Image
      source={{ uri }}
      style={{ width, height, borderRadius: borderRadius ?? 0 }}
      className={className}
      resizeMode="cover"
      onError={() => setError(true)}
    />
  )
}
