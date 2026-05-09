import { ActivityIndicator, Pressable, Text } from 'react-native'
import { useTheme } from '@/context/ThemeContext'
import { haptic } from '@/lib/haptics'
import { DESIGN_TOKENS } from '@/lib/designTokens'

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'gray'

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
  gray:      'bg-zinc-200',
}

const darkVariants: Partial<Record<Variant, string>> = {
  gray:      'bg-zinc-700',
  secondary: 'bg-zinc-900 border border-white',
}

const textVariants: Record<Variant, string> = {
  primary:   'text-white font-semibold text-base tracking-tight',
  accent:    'text-zinc-800 font-semibold text-base tracking-tight',
  secondary: 'text-primary font-semibold text-base tracking-tight',
  ghost:     'text-accent font-semibold text-base',
  gray:      'text-zinc-700 font-semibold text-base tracking-tight',
}

const darkTextVariants: Partial<Record<Variant, string>> = {
  accent:    'text-white font-semibold text-base tracking-tight',
  gray:      'text-zinc-200 font-semibold text-base tracking-tight',
  secondary: 'text-white font-semibold text-base tracking-tight',
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, className }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const isDisabled = disabled || loading
  const spinnerColor = variant === 'secondary' || variant === 'ghost' ? DESIGN_TOKENS.colors.accent : isDark ? '#000' : '#fff'
  const resolvedBgClass = isDark && darkVariants[variant] ? darkVariants[variant]! : variants[variant]
  const resolvedTextClass =
    variant === 'primary' && isDark ? 'text-black font-semibold text-base tracking-tight' :
    isDark && darkTextVariants[variant] ? darkTextVariants[variant]! :
    textVariants[variant]

  const handlePress = () => {
    haptic.light()
    onPress()
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`${base} ${resolvedBgClass} ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
      style={({ pressed }) => ({ opacity: pressed && !isDisabled ? 0.85 : 1 })}
    >
      {loading
        ? <ActivityIndicator color={spinnerColor} />
        : <Text className={resolvedTextClass}>{label}</Text>
      }
    </Pressable>
  )
}
