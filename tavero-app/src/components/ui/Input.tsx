import { Text, TextInput, View } from 'react-native'
import type { TextInputProps } from 'react-native'

type Props = TextInputProps & {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: Props) {
  return (
    <View className="gap-1">
      {label && (
        <Text className="text-sm font-medium text-primary">{label}</Text>
      )}
      <TextInput
        placeholderTextColor="#9CA3AF"
        className={`bg-white border rounded-xl px-4 py-3 text-base text-primary ${
          error ? 'border-danger' : 'border-border'
        } ${className ?? ''}`}
        {...props}
      />
      {error && (
        <Text className="text-xs text-danger">{error}</Text>
      )}
    </View>
  )
}
