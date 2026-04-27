import { View } from 'react-native'
import type { ViewProps } from 'react-native'

type Props = ViewProps & { className?: string }

export function Card({ className, children, style, ...props }: Props) {
  return (
    <View
      className={`bg-surface rounded-2xl p-5 border border-borderSoft ${className ?? ''}`}
      style={[
        {
          shadowColor: '#134E4A',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 1,
        },
        style as object,
      ]}
      {...props}
    >
      {children}
    </View>
  )
}
