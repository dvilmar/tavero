import { Text, View } from 'react-native'

type Variant = 'success' | 'muted' | 'accent' | 'info'

type Props = {
  label: string
  variant?: Variant
  className?: string
}

const styles: Record<Variant, { bg: string; text: string; bgDark: string; textDark: string }> = {
  success: { bg: 'bg-green-100', text: 'text-green-700', bgDark: 'bg-green-900/40', textDark: 'text-green-300' },
  muted:   { bg: 'bg-borderSoft', text: 'text-muted', bgDark: 'bg-borderSoft', textDark: 'text-muted' },
  accent:  { bg: 'bg-accentSoft', text: 'text-accent', bgDark: 'bg-accentSoft', textDark: 'text-accent' },
  info:    { bg: 'bg-blue-100', text: 'text-blue-700', bgDark: 'bg-blue-900/40', textDark: 'text-blue-300' },
}

export function Badge({ label, variant = 'muted', className = '' }: Props) {
  const s = styles[variant]
  return (
    <View className={`${s.bg} dark:${s.bgDark} px-2.5 py-1 rounded-full ${className}`}>
      <Text className={`${s.text} dark:${s.textDark} text-[11px] font-semibold uppercase tracking-wide`}>{label}</Text>
    </View>
  )
}
