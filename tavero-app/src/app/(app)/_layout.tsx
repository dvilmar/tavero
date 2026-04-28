import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { FullScreenLoader } from '@/components/ui/FullScreenLoader'

export default function AppLayout() {
  const { session, loading } = useAuth()

  if (loading) {
    return <FullScreenLoader />
  }
  if (!session) return <Redirect href="/(auth)/login" />

  return <Stack screenOptions={{ headerShown: false }} />
}
