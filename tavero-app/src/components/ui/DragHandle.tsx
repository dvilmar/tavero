import { View } from 'react-native'

export function DragHandle() {
	return (
		<View style={{ width: 18, gap: 4, alignItems: 'center' }}>
			{[0, 1, 2].map((i) => (
				<View key={i} style={{ width: 18, height: 2.5, backgroundColor: '#CBD5E1', borderRadius: 2 }} />
			))}
		</View>
	)
}
