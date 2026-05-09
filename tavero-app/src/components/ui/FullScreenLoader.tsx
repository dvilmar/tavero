import { ActivityIndicator, View } from 'react-native'

export function FullScreenLoader() {
	return (
		<View className="flex-1 bg-background items-center justify-center">
			<ActivityIndicator size="large" className="text-accent" />
		</View>
	)
}
