import { Pressable, Switch, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { haptic } from '@/lib/haptics'
import { Card } from '@/components/ui/Card'

export default function SettingsScreen() {
  const { colorScheme, setColorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()

  const handleDarkToggle = (value: boolean) => {
    haptic.select()
    setColorScheme(value ? 'dark' : 'light')
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-14 pb-4 bg-surface border-b border-border flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="mr-4 w-9 h-9 rounded-full bg-borderSoft items-center justify-center"
          hitSlop={8}
        >
          <Text className="text-primary text-2xl leading-none" style={{ marginTop: -2 }}>‹</Text>
        </Pressable>
        <Text className="text-xl font-bold text-primary flex-1">Configuración</Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 + insets.bottom, gap: 20 }}>

        <View>
          <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">Apariencia</Text>
          <Card>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="font-semibold text-[15px] text-primary">Modo oscuro</Text>
                <Text className="text-muted text-xs mt-0.5">Cambia el aspecto de la app</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={handleDarkToggle}
                trackColor={{ true: '#0D9488', false: '#E7E5E4' }}
                thumbColor="#fff"
              />
            </View>
          </Card>
        </View>

      </View>
    </View>
  )
}
