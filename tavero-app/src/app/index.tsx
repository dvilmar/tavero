import { Redirect } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { FullScreenLoader } from '@/components/ui/FullScreenLoader'

export default function Index() {
  const { session, loading } = useAuth()

  if (loading) {
    return <FullScreenLoader />
  }

  if (!session) return <Redirect href="/(auth)/login" />
  return <Redirect href="/(app)/dashboard" />
}
