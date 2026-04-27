import { useState } from 'react'
import { Pressable, ScrollView, Switch, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { haptic } from '@/lib/haptics'
import { Card } from '@/components/ui/Card'

const PALETTES = [
  { id: 'teal',   label: 'Turquesa',  color: '#0D9488', bg: '#CCFBF1' },
  { id: 'blue',   label: 'Azul',      color: '#2563EB', bg: '#DBEAFE' },
  { id: 'violet', label: 'Violeta',   color: '#7C3AED', bg: '#EDE9FE' },
  { id: 'rose',   label: 'Rosa',      color: '#E11D48', bg: '#FFE4E6' },
  { id: 'amber',  label: 'Ámbar',     color: '#D97706', bg: '#FEF3C7' },
  { id: 'slate',  label: 'Pizarra',   color: '#475569', bg: '#F1F5F9' },
]

export default function MenuColorsScreen() {
  const { colorScheme, setColorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [selectedPalette, setSelectedPalette] = useState('teal')

  const handleDarkToggle = (value: boolean) => {
    haptic.select()
    setColorScheme(value ? 'dark' : 'light')
  }

  const handlePalette = (id: string) => {
    haptic.light()
    setSelectedPalette(id)
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-14 pb-4 bg-surface border-b border-border flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-4" hitSlop={8}>
          <Text className="text-accent font-semibold text-base">←</Text>
        </Pressable>
        <Text className="text-xl font-bold text-primary flex-1">Colores del menú</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48, gap: 20 }}>

        {/* Modo oscuro */}
        <View>
          <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">Apariencia de la app</Text>
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

        {/* Paleta del menú público */}
        <View>
          <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">Color del menú público</Text>
          <Text className="text-muted text-sm mb-4 leading-relaxed">
            Elige el color principal que verán tus clientes al abrir el menú.
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {PALETTES.map((p) => {
              const selected = selectedPalette === p.id
              return (
                <Pressable
                  key={p.id}
                  onPress={() => handlePalette(p.id)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  className="items-center gap-2"
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: p.bg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: selected ? 3 : 1.5,
                      borderColor: selected ? p.color : 'transparent',
                    }}
                  >
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: p.color }} />
                  </View>
                  <Text className={`text-xs font-medium ${selected ? 'text-primary' : 'text-muted'}`}>
                    {p.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Preview card */}
        {(() => {
          const pal = PALETTES.find((p) => p.id === selectedPalette) ?? PALETTES[0]
          return (
            <View>
              <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">Vista previa</Text>
              <Card>
                <View style={{ backgroundColor: pal.bg, borderRadius: 12, padding: 16, marginBottom: 12 }}>
                  <Text style={{ fontWeight: '700', fontSize: 18, color: pal.color }}>Mi Restaurante</Text>
                  <Text style={{ color: pal.color, opacity: 0.7, fontSize: 13, marginTop: 4 }}>
                    Carta digital • Tapas y bebidas
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  {['Entrantes', 'Bebidas', 'Postres'].map((cat) => (
                    <View
                      key={cat}
                      style={{ backgroundColor: pal.bg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}
                    >
                      <Text style={{ color: pal.color, fontWeight: '600', fontSize: 12 }}>{cat}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            </View>
          )
        })()}

        <View className="bg-accentSoft rounded-2xl p-4">
          <Text className="text-accent font-semibold text-sm">Próximamente</Text>
          <Text className="text-muted text-xs mt-1 leading-relaxed">
            La sincronización de colores con el menú público estará disponible en la próxima versión.
          </Text>
        </View>

      </ScrollView>
    </View>
  )
}
