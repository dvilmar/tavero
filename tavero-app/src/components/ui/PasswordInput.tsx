import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { Svg, Path, Line, Circle } from 'react-native-svg'
import { DESIGN_TOKENS } from '@/lib/designTokens'

type Props = {
  label?: string
  error?: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  onSubmitEditing?: () => void
  returnKeyType?: 'done' | 'next' | 'go' | 'search' | 'send'
}

function EyeOpen() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={DESIGN_TOKENS.colors.iconMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <Circle cx={12} cy={12} r={3} />
    </Svg>
  )
}

function EyeOff() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={DESIGN_TOKENS.colors.iconMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <Path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <Line x1={1} y1={1} x2={23} y2={23} />
    </Svg>
  )
}

export function PasswordInput({ label, error, value, onChangeText, placeholder, onSubmitEditing, returnKeyType }: Props) {
  const [visible, setVisible] = useState(false)

  const toggleVisible = () => {
    setVisible(v => !v)
  }

  return (
    <View className="gap-1">
      {label && <Text className="text-sm font-medium text-primary">{label}</Text>}
      <View className={`flex-row items-center bg-surface border rounded-xl px-4 ${
        error ? 'border-danger' : 'border-border'
      }`}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={DESIGN_TOKENS.colors.placeholder}
          autoCorrect={false}
          autoCapitalize="none"
          secureTextEntry={!visible}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          className="flex-1 py-3 text-base text-primary"
        />
        <Pressable onPress={toggleVisible} hitSlop={8} className="pl-2">
          {visible ? <EyeOpen /> : <EyeOff />}
        </Pressable>
      </View>
      {error && <Text className="text-xs text-danger">{error}</Text>}
    </View>
  )
}
