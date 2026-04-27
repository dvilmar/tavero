import { ActivityIndicator, Image, Pressable, ScrollView, Share, Text, View } from 'react-native'
import { router } from 'expo-router'
import QRCode from 'react-native-qrcode-svg'
import { useAuth } from '@/context/AuthContext'
import { useRestaurant } from '@/context/RestaurantContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const MENU_BASE_URL = process.env.EXPO_PUBLIC_MENU_URL ?? 'https://tavero.app/menu'

type NavCardProps = {
  icon: string
  label: string
  description: string
  onPress: () => void
}

function NavCard({ icon, label, description, onPress }: NavCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <Card className="flex-row items-center">
        <View className="w-11 h-11 rounded-xl bg-accentSoft items-center justify-center mr-3.5">
          <Text className="text-xl">{icon}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-semibold text-primary">{label}</Text>
          <Text className="text-[13px] text-muted mt-0.5">{description}</Text>
        </View>
        <Text className="text-2xl text-mutedLight font-light">›</Text>
      </Card>
    </Pressable>
  )
}

export default function DashboardScreen() {
  const { signOut, user } = useAuth()
  const { restaurant, loading } = useRestaurant()

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    )
  }

  if (!restaurant) {
    return (
      <ScrollView className="flex-1 bg-background" contentContainerClassName="px-5 pt-16 pb-12">
        <View className="flex-row items-start justify-between mb-10">
          <View className="flex-1 mr-4">
            <Text className="text-3xl font-bold text-primary tracking-tight">Tavero</Text>
            <Text className="text-muted mt-1 text-sm" numberOfLines={1}>{user?.email}</Text>
          </View>
          <Pressable onPress={signOut} hitSlop={8}>
            <Text className="text-muted text-sm font-medium">Salir</Text>
          </Pressable>
        </View>

        <Card className="items-center gap-3 py-12">
          <View className="w-20 h-20 rounded-full bg-accentSoft items-center justify-center mb-2">
            <Text className="text-4xl">🍽️</Text>
          </View>
          <Text className="text-xl font-bold text-primary tracking-tight">¡Bienvenido a Tavero!</Text>
          <Text className="text-muted text-sm text-center px-6 leading-relaxed">
            Crea tu bar para empezar a digitalizar tu menú y generar tu código QR.
          </Text>
          <Button
            label="Crear mi bar"
            onPress={() => router.push('/(app)/restaurant/setup')}
            className="w-full mt-3"
          />
        </Card>
      </ScrollView>
    )
  }

  const menuUrl = `${MENU_BASE_URL}/${restaurant.slug}`

  const handleShare = async () => {
    await Share.share({ message: `Consulta nuestro menú: ${menuUrl}`, url: menuUrl })
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="px-5 pt-16 pb-12">
      {/* Header */}
      <View className="flex-row items-center mb-7">
        {restaurant.logo_url ? (
          <Image
            source={{ uri: restaurant.logo_url }}
            style={{ width: 52, height: 52, borderRadius: 26 }}
            resizeMode="cover"
          />
        ) : (
          <View className="w-13 h-13 rounded-full bg-accentSoft items-center justify-center"
                style={{ width: 52, height: 52 }}>
            <Text className="text-xl">🏪</Text>
          </View>
        )}
        <View className="flex-1 ml-3">
          <Text className="text-[11px] text-muted font-medium uppercase tracking-wider">Tu bar</Text>
          <Text className="text-xl font-bold text-primary tracking-tight" numberOfLines={1}>
            {restaurant.name}
          </Text>
        </View>
        <Pressable onPress={signOut} hitSlop={8}>
          <Text className="text-muted text-sm font-medium">Salir</Text>
        </Pressable>
      </View>

      {/* QR Card */}
      <Card className="items-center gap-3 mb-5 py-6">
        <Text className="text-[11px] font-bold text-muted uppercase tracking-widest">Tu menú</Text>
        <View className="p-4 bg-accentSoft rounded-2xl">
          <QRCode value={menuUrl} size={170} backgroundColor="#CCFBF1" color="#134E4A" />
        </View>
        <Button label="Compartir menú" onPress={handleShare} variant="accent" className="w-full mt-1" />
      </Card>

      {/* Navigation */}
      <View className="gap-2.5 mb-5">
        <NavCard
          icon="👀"
          label="Vista previa del menú"
          description="Cómo lo ven tus clientes"
          onPress={() => router.push('/(app)/menu-preview')}
        />
        <NavCard
          icon="🎨"
          label="Colores del menú"
          description="Personaliza la apariencia de tu menú"
          onPress={() => router.push('/(app)/menu-colors')}
        />
        <NavCard
          icon="📂"
          label="Categorías"
          description="Gestiona secciones de tu menú"
          onPress={() => router.push('/(app)/categories')}
        />
        <NavCard
          icon="🍽️"
          label="Productos"
          description="Añade y edita platos y bebidas"
          onPress={() => router.push('/(app)/products')}
        />
        <NavCard
          icon="⚙️"
          label="Información del bar"
          description="Edita nombre, logo y descripción"
          onPress={() => router.push('/(app)/restaurant/setup')}
        />
      </View>
    </ScrollView>
  )
}
