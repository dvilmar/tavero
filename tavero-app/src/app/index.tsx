import { ActivityIndicator, View } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuth } from '@/context/AuthContext'

export default function Index() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#1A1A2E" />
      </View>
    )
  }

  if (!session) return <Redirect href="/(auth)/login" />
  return <Redirect href="/(app)/dashboard" />
}
