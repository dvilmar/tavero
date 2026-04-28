import { useEffect, useRef } from 'react'
import { ActivityIndicator, Animated, Easing, Text, View } from 'react-native'
import { useColorScheme } from 'nativewind'

type Props = {
	color?: string
	title?: string
	subtitle?: string
}

export function FullScreenLoader({
	color,
	title = 'Tavero',
	subtitle = 'Cargando tu carta digital',
}: Props) {
	const { colorScheme } = useColorScheme()
	const resolvedColor = color ?? (colorScheme === 'dark' ? '#FAFAFA' : '#111111')
	const pulse = useRef(new Animated.Value(1)).current

	useEffect(() => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(pulse, {
					toValue: 1.06,
					duration: 850,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(pulse, {
					toValue: 1,
					duration: 850,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
			]),
		)

		animation.start()
		return () => animation.stop()
	}, [pulse])

	return (
		<View className="flex-1 bg-background items-center justify-center">
			<View className="items-center">
				<Animated.View
					style={{ transform: [{ scale: pulse }] }}
					className="w-20 h-20 rounded-3xl bg-accentSoft border border-border items-center justify-center mb-4"
				>
					<Text className="text-3xl">🍽️</Text>
				</Animated.View>
				<Text className="text-2xl font-bold text-primary tracking-tight">{title}</Text>
				<Text className="text-sm text-muted mt-1 mb-5">{subtitle}</Text>
				<ActivityIndicator size="small" color={resolvedColor} />
			</View>
		</View>
	)
}
