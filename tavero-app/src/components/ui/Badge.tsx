import { Text, View } from 'react-native'

type Variant = 'success' | 'muted' | 'accent'

type Props = {
  label: string
  variant?: Variant
}

const styles: Record<Variant, { bg: string; text: string }> = {
  success: { bg: 'bg-green-100', text: 'text-green-700' },
  muted:   { bg: 'bg-borderSoft', text: 'text-muted' },
  accent:  { bg: 'bg-accentSoft', text: 'text-accent' },
}

export function Badge({ label, variant = 'muted' }: Props) {
  const s = styles[variant]
  return (
    <View className={`${s.bg} px-2.5 py-1 rounded-full`}>
      <Text className={`${s.text} text-[11px] font-semibold uppercase tracking-wide`}>{label}</Text>
    </View>
  )
}
