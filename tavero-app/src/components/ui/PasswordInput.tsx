import { useRef, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { Svg, Path, Line, Circle } from 'react-native-svg'

type Props = {
  label?: string
  error?: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

const MASK_DELAY = 800
const DOT = '•'

function EyeOpen() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <Circle cx={12} cy={12} r={3} />
    </Svg>
  )
}

function EyeOff() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <Path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <Line x1={1} y1={1} x2={23} y2={23} />
    </Svg>
  )
}

export function PasswordInput({ label, error, value, onChangeText, placeholder }: Props) {
  const real = useRef('')
  const [revealedIdx, setRevealedIdx] = useState(-1)
  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const masked = real.current
    .split('')
    .map((char, i) => (i === revealedIdx ? char : DOT))
    .join('')

  const display = visible ? real.current : masked

  const handleChange = (text: string) => {
    const added = text.length > real.current.length

    if (visible) {
      real.current = text
      onChangeText(text)
      return
    }

    // When masked, the input value is dots — reconstruct real value
    if (added) {
      // Last char is the newly typed one (not a dot)
      const newChar = text[text.length - 1]
      real.current = real.current + newChar
    } else {
      real.current = real.current.slice(0, text.length)
    }
    onChangeText(real.current)

    if (timer.current) clearTimeout(timer.current)
    if (added) {
      setRevealedIdx(real.current.length - 1)
      timer.current = setTimeout(() => setRevealedIdx(-1), MASK_DELAY)
    } else {
      setRevealedIdx(-1)
    }
  }

  const toggleVisible = () => {
    if (timer.current) clearTimeout(timer.current)
    setRevealedIdx(-1)
    setVisible(v => !v)
  }

  return (
    <View className="gap-1">
      {label && <Text className="text-sm font-medium text-primary">{label}</Text>}
      <View className={`flex-row items-center bg-white border rounded-xl px-4 ${
        error ? 'border-danger' : 'border-border'
      }`}>
        <TextInput
          value={display}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          autoCorrect={false}
          autoCapitalize="none"
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
