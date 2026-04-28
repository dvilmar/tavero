import { ActivityIndicator, View } from 'react-native'

type Props = {
	color?: string
}

export function FullScreenLoader({ color = '#0D9488' }: Props) {
	return (
		<View className="flex-1 bg-background items-center justify-center">
			<ActivityIndicator size="large" color={color} />
		</View>
	)
}
