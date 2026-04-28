import { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { haptic } from '@/lib/haptics'
import { Card } from '@/components/ui/Card'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { useRestaurant } from '@/context/RestaurantContext'
import { supabase } from '@/lib/supabase'

// Colores del design system Tavero
const PALETTES = [
  { id: 'amber',   label: 'Ámbar',      color: '#D97706', bg: '#FEF3C7' },
  { id: 'emerald', label: 'Esmeralda',  color: '#059669', bg: '#D1FAE5' },
  { id: 'indigo',  label: 'Índigo',     color: '#4F46E5', bg: '#EEF2FF' },
  { id: 'teal',    label: 'Teal',       color: '#0D9488', bg: '#CCFBF1' },
  { id: 'rose',    label: 'Rosa',       color: '#E11D48', bg: '#FFE4E6' },
  { id: 'slate',   label: 'Pizarra',    color: '#475569', bg: '#F1F5F9' },
]

const FONTS = [
  { id: 'inter',      label: 'Moderna',    sample: 'Menú',  style: { fontFamily: undefined } },
  { id: 'montserrat', label: 'Impacto',    sample: 'Menú',  style: { fontWeight: '700' as const } },
  { id: 'playfair',   label: 'Elegante',   sample: 'Menú',  style: { fontStyle: 'italic' as const } },
  { id: 'lato',       label: 'Clásica',    sample: 'Menú',  style: {} },
]

export default function MenuColorsScreen() {
  const { colorScheme, setColorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [selectedPalette, setSelectedPalette] = useState('amber')
  const [selectedFont, setSelectedFont] = useState('inter')
  const [savingFont, setSavingFont] = useState(false)
  const [savingColor, setSavingColor] = useState(false)
  const { restaurant } = useRestaurant()
  const insets = useSafeAreaInsets()
  const toast = useToast()

  const handleDarkToggle = (value: boolean) => {
    haptic.select()
    setColorScheme(value ? 'dark' : 'light')
  }

  const handlePalette = async (id: string) => {
    haptic.light()
    setSelectedPalette(id)
    if (!restaurant) return
    setSavingColor(true)
    await supabase.from('restaurants').update({ menu_accent_color: id }).eq('id', restaurant.id)
    setSavingColor(false)
    toast.show('Color actualizado')
  }

  const handleFont = async (id: string) => {
    haptic.light()
    setSelectedFont(id)
    if (!restaurant) return
    setSavingFont(true)
    await supabase.from('restaurants').update({ menu_font: id }).eq('id', restaurant.id)
    setSavingFont(false)
    toast.show('Fuente actualizada')
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-14 pb-4 bg-surface border-b border-border flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-4" hitSlop={8}>
          <Text className="text-accent font-semibold text-base">←</Text>
        </Pressable>
        <Text className="text-xl font-bold text-primary flex-1">Apariencia del menú</Text>
        {(savingFont || savingColor) && <ActivityIndicator size="small" color="#059669" />}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 + insets.bottom, gap: 20 }}>

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

        {/* Fuente del menú público */}
        <View>
          <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">Fuente del menú público</Text>
          <View className="gap-3">
            {FONTS.map((f) => {
              const selected = selectedFont === f.id
              return (
                <Pressable
                  key={f.id}
                  onPress={() => handleFont(f.id)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  <View
                    className={`flex-row items-center justify-between px-4 py-4 rounded-2xl border-2 ${
                      selected ? 'bg-accentSoft border-accent' : 'bg-surface border-border'
                    }`}
                  >
                    <View>
                      <Text className={`text-sm font-semibold ${selected ? 'text-accent' : 'text-muted'}`}>
                        {f.label}
                      </Text>
                      <Text
                        style={[{ fontSize: 22, marginTop: 2, color: selected ? '#0D9488' : '#44403C' }, f.style]}
                      >
                        {f.sample}
                      </Text>
                    </View>
                    {selected && (
                      <View className="w-6 h-6 rounded-full bg-accent items-center justify-center">
                        <Text className="text-white text-xs font-bold">✓</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              )
            })}
          </View>
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
                  <Text style={{ fontSize: 11, fontWeight: selected ? '600' : '400', color: selected ? p.color : '#64748B' }}>
                    {p.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Vista previa */}
        {(() => {
          const pal = PALETTES.find((p) => p.id === selectedPalette) ?? PALETTES[0]
          const fnt = FONTS.find((f) => f.id === selectedFont) ?? FONTS[0]
          return (
            <View>
              <Text className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">Vista previa</Text>
              <Card>
                <View style={{ backgroundColor: pal.bg, borderRadius: 12, padding: 16, marginBottom: 12 }}>
                  <Text style={[{ fontWeight: '700', fontSize: 18, color: pal.color }, fnt.style]}>
                    Mi Restaurante
                  </Text>
                  <Text style={[{ color: pal.color, opacity: 0.7, fontSize: 13, marginTop: 4 }, fnt.style]}>
                    Carta digital • Tapas y bebidas
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  {['Entrantes', 'Bebidas', 'Postres'].map((cat) => (
                    <View
                      key={cat}
                      style={{ backgroundColor: pal.bg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}
                    >
                      <Text style={[{ color: pal.color, fontWeight: '600', fontSize: 12 }, fnt.style]}>{cat}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            </View>
          )
        })()}

      </ScrollView>
      <Toast message={toast.message} visible={toast.visible} />
    </View>
  )
}
