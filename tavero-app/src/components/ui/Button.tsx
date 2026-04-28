import { ActivityIndicator, Pressable, Text } from 'react-native'
import { useColorScheme } from 'nativewind'
import { haptic } from '@/lib/haptics'
import { DESIGN_TOKENS } from '@/lib/designTokens'

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent'

type Props = {
  label: string
  onPress: () => void
  variant?: Variant
  loading?: boolean
  disabled?: boolean
  className?: string
}

const base = 'flex-row items-center justify-center rounded-xl px-5 py-3.5'

const variants: Record<Variant, string> = {
  primary:   'bg-primary',
  accent:    'bg-accent',
  secondary: 'bg-surface border border-border',
  ghost:     'bg-transparent',
}

const textVariants: Record<Variant, string> = {
  primary:   'text-white font-semibold text-base tracking-tight',
  accent:    'text-white font-semibold text-base tracking-tight',
  secondary: 'text-primary font-semibold text-base tracking-tight',
  ghost:     'text-accent font-semibold text-base',
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, className }: Props) {
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isDisabled = disabled || loading
  const spinnerColor = variant === 'secondary' || variant === 'ghost' ? DESIGN_TOKENS.colors.accent : '#fff'
  const resolvedTextClass = variant === 'primary' && isDark
    ? 'text-black font-semibold text-base tracking-tight'
    : textVariants[variant]

  const handlePress = () => {
    haptic.light()
    onPress()
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      className={`${base} ${variants[variant]} ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
      style={({ pressed }) => ({ opacity: pressed && !isDisabled ? 0.85 : 1 })}
    >
      {loading
        ? <ActivityIndicator color={spinnerColor} />
        : <Text className={resolvedTextClass}>{label}</Text>
      }
    </Pressable>
  )
}
