import { Text, TextInput, View } from 'react-native'
import type { TextInputProps, TextStyle } from 'react-native'
import { DESIGN_TOKENS } from '@/lib/designTokens'

type Props = TextInputProps & {
  label?: string
  error?: string
  inputStyle?: TextStyle
}

export function Input({ label, error, className, inputStyle, ...props }: Props) {
  return (
    <View className="gap-1">
      {label && (
        <Text className="text-sm font-medium text-primary">{label}</Text>
      )}
      <TextInput
        placeholderTextColor={DESIGN_TOKENS.colors.placeholder}
        className={`bg-surface border rounded-xl px-4 py-3 text-base text-primary ${
          error ? 'border-danger' : 'border-border'
        } ${className ?? ''}`}
        style={inputStyle}
        {...props}
      />
      {error && (
        <Text className="text-xs text-danger">{error}</Text>
      )}
    </View>
  )
}
