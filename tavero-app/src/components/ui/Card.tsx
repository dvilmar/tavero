import { View } from 'react-native'
import { useColorScheme } from 'nativewind'
import type { ViewProps } from 'react-native'
import { DESIGN_TOKENS } from '@/lib/designTokens'

type Props = ViewProps & { className?: string }

export function Card({ className, children, style, ...props }: Props) {
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <View
      className={`bg-surface rounded-2xl p-5 border border-borderSoft ${className ?? ''}`}
      style={[
        {
          shadowColor: isDark ? '#000' : DESIGN_TOKENS.colors.cardShadow,
          ...DESIGN_TOKENS.shadow.card,
        },
        style as object,
      ]}
      {...props}
    >
      {children}
    </View>
  )
}
