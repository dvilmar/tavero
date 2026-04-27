import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@/context/AuthContext'

export default function AppLayout() {
  const { session, loading } = useAuth()

  if (loading) return null
  if (!session) return <Redirect href="/(auth)/login" />

  return <Stack screenOptions={{ headerShown: false }} />
}
