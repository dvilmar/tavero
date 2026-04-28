import { View } from 'react-native'
import type { ViewProps } from 'react-native'
import { DESIGN_TOKENS } from '@/lib/designTokens'

type Props = ViewProps & { className?: string }

export function Card({ className, children, style, ...props }: Props) {
  return (
    <View
      className={`bg-surface rounded-2xl p-5 border border-borderSoft ${className ?? ''}`}
      style={[
        {
          shadowColor: DESIGN_TOKENS.colors.cardShadow,
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
