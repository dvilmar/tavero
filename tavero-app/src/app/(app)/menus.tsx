import { useCallback, useState } from 'react'
import {
  Alert, Modal, Pressable, ScrollView, Switch, Text, TextInput, View,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from 'nativewind'
import { supabase } from '@/lib/supabase'
import { useRestaurant } from '@/context/RestaurantContext'
import { haptic } from '@/lib/haptics'
import { sanitizeText } from '@/lib/utils'
import { Header } from '@/components/ui/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { DESIGN_TOKENS } from '@/lib/designTokens'
import { Ionicons } from '@expo/vector-icons'

type MenuRow = {
  id: string
  name: string
  description: string | null
  is_active: boolean
  sort_order: number
  catCount: number
  productCount: number
}

type ScheduleRow = {
  id: string
  menu_id: string
  day_of_week: number
  start_time: string
  end_time: string
}

const DAY_KEYS = ['0', '1', '2', '3', '4', '5', '6'] as const

export default function MenusScreen() {
  const { restaurant } = useRestaurant()
  const { t } = useTranslation()
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const toast = useToast()

  const [menus, setMenus] = useState<MenuRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuRow | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  // Schedule management
  const [scheduleMenuId, setScheduleMenuId] = useState<string | null>(null)
  const [schedules, setSchedules] = useState<ScheduleRow[]>([])
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleSaving, setScheduleSaving] = useState(false)
  const [selectedDay, setSelectedDay] = useState(1)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('23:00')

  const loadMenus = useCallback(async () => {
    if (!restaurant) return
    setLoading(true)
    const [menusRes, catsRes, prodsRes] = await Promise.all([
      supabase.from('menus').select('id, name, description, is_active, sort_order').eq('restaurant_id', restaurant.id).order('sort_order'),
      supabase.from('categories').select('id, menu_id').eq('restaurant_id', restaurant.id),
      supabase.from('products').select('id, category_id').eq('restaurant_id', restaurant.id),
    ])
    const cats = (catsRes.data ?? []) as { id: string; menu_id: string | null }[]
    const prods = (prodsRes.data ?? []) as { id: string; category_id: string }[]
    const statsMap = new Map<string, { catCount: number; productCount: number }>()
    for (const cat of cats) {
      if (!cat.menu_id) continue
      const s = statsMap.get(cat.menu_id) ?? { catCount: 0, productCount: 0 }
      s.catCount++
      s.productCount += prods.filter((p) => p.category_id === cat.id).length
      statsMap.set(cat.menu_id, s)
    }
    setMenus((menusRes.data ?? []).map((m) => ({ ...m, ...(statsMap.get(m.id) ?? { catCount: 0, productCount: 0 }) })))
    setLoading(false)
  }, [restaurant])

  useFocusEffect(useCallback(() => { loadMenus() }, [loadMenus]))

  const openCreate = () => {
    setEditingMenu(null)
    setName('')
    setDescription('')
    setShowForm(true)
  }

  const openEdit = (menu: MenuRow) => {
    setEditingMenu(menu)
    setName(menu.name)
    setDescription(menu.description ?? '')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!restaurant || !name.trim()) {
      Alert.alert(t('common.error'), t('menus.nameRequired'))
      return
    }
    setSaving(true)
    const payload = { name: name.trim(), description: description.trim() || null }
    if (editingMenu) {
      const { error } = await supabase.from('menus').update(payload).eq('id', editingMenu.id)
      if (error) { Alert.alert(t('common.error'), error.message); setSaving(false); return }
    } else {
      const nextOrder = menus.length > 0 ? Math.max(...menus.map((m) => m.sort_order)) + 1 : 0
      const { error } = await supabase.from('menus').insert({ ...payload, restaurant_id: restaurant.id, sort_order: nextOrder })
      if (error) { Alert.alert(t('common.error'), error.message); setSaving(false); return }
    }
    setSaving(false)
    setShowForm(false)
    haptic.success()
    toast.show(editingMenu ? t('menus.updated') : t('menus.created'))
    loadMenus()
  }

  const handleToggle = async (menu: MenuRow) => {
    haptic.select()
    const { error } = await supabase.from('menus').update({ is_active: !menu.is_active }).eq('id', menu.id)
    if (error) { Alert.alert(t('common.error'), error.message); return }
    setMenus((prev) => prev.map((m) => m.id === menu.id ? { ...m, is_active: !menu.is_active } : m))
  }

  const handleDelete = (menu: MenuRow) => {
    Alert.alert(
      t('menus.deleteTitle'),
      t('menus.deleteConfirm', { name: menu.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'), style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('menus').delete().eq('id', menu.id)
            if (error) { Alert.alert(t('common.error'), error.message); return }
            haptic.success()
            toast.show(t('menus.deleted'))
            loadMenus()
          },
        },
      ]
    )
  }

  const openSchedules = async (menu: MenuRow) => {
    setScheduleMenuId(menu.id)
    setSelectedDay(1)
    setStartTime('09:00')
    setEndTime('23:00')
    const { data } = await (supabase as any)
      .from('menu_schedules')
      .select('id, menu_id, day_of_week, start_time, end_time')
      .eq('menu_id', menu.id)
      .order('day_of_week')
    setSchedules(data ?? [])
    setShowSchedule(true)
  }

  const handleAddSchedule = async () => {
    if (!scheduleMenuId) return
    if (startTime >= endTime) {
      Alert.alert(t('common.error'), t('menus.scheduleTo') + ' > ' + t('menus.scheduleFrom'))
      return
    }
    setScheduleSaving(true)
    const { data, error } = await (supabase as any)
      .from('menu_schedules')
      .insert({ menu_id: scheduleMenuId, day_of_week: selectedDay, start_time: startTime, end_time: endTime })
      .select('id, menu_id, day_of_week, start_time, end_time')
      .single()
    setScheduleSaving(false)
    if (error) { Alert.alert(t('common.error'), error.message); return }
    setSchedules((prev) => [...prev, data])
    haptic.success()
    toast.show(t('menus.scheduleAdded'))
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    await (supabase as any).from('menu_schedules').delete().eq('id', scheduleId)
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId))
    haptic.success()
    toast.show(t('menus.scheduleDeleted'))
  }

  const inputStyle = {
    backgroundColor: isDark ? '#292524' : '#F5F5F4',
    color: isDark ? '#FAFAF9' : '#1C1917',
    borderColor: isDark ? '#57534E' : '#E7E5E4',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  }

  return (
    <View className="flex-1 bg-background">
      <Header title={t('menus.title')} subtitle={t('menus.subtitle')} />

      {loading ? null : menus.length === 0 ? (
        <EmptyState icon="📋" title={t('menus.empty')} description={t('menus.emptyDesc')} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
          {menus.map((menu) => (
            <View key={menu.id} style={{ marginBottom: 12 }}>
              <Card>
                <View className="flex-row items-start">
                  <View className="flex-1 mr-3">
                    <Text className={`font-semibold text-base ${menu.is_active ? 'text-primary' : 'text-mutedLight line-through'}`}>
                      {menu.name}
                    </Text>
                    {menu.description ? (
                      <Text className="text-muted text-sm mt-0.5">{menu.description}</Text>
                    ) : null}
                    <Text className="text-muted text-xs mt-1.5">
                      {t('menus.statsLabel', { cats: menu.catCount, products: menu.productCount })}
                    </Text>
                  </View>
                  <Switch
                    value={menu.is_active}
                    onValueChange={() => handleToggle(menu)}
                    trackColor={{ true: isDark ? '#FAFAFA' : '#111111', false: isDark ? '#4B5563' : '#E7E5E4' }}
                    thumbColor={isDark ? '#F3F4F6' : '#FFFFFF'}
                  />
                </View>
                <View className="flex-row gap-2 mt-4 pt-4 border-t border-borderSoft">
                  <Button label={t('common.edit')} onPress={() => openEdit(menu)} variant="secondary" className="flex-1 py-2" />
                  <Pressable
                    onPress={() => openSchedules(menu)}
                    className="flex-1 py-2 rounded-xl border border-borderSoft items-center justify-center"
                    style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1, backgroundColor: isDark ? '#292524' : '#FAFAF9' })}
                  >
                    <Ionicons name="time-outline" size={16} color={isDark ? '#A8A29E' : '#78716C'} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(menu)}
                    className={`flex-1 py-2 rounded-xl border items-center justify-center ${
                      isDark ? 'bg-surface border-red-300' : 'bg-red-100 border-red-200'
                    }`}
                    style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                  >
                    <Text className={`font-semibold text-base ${isDark ? 'text-red-200' : 'text-red-700'}`}>
                      {t('common.delete')}
                    </Text>
                  </Pressable>
                </View>
              </Card>
            </View>
          ))}
        </ScrollView>
      )}

      <Toast message={toast.message} visible={toast.visible} />

      <Pressable
        onPress={() => { haptic.light(); openCreate() }}
        className="absolute right-5 w-14 h-14 bg-accent rounded-full items-center justify-center"
        style={{ bottom: 32, zIndex: 10, shadowColor: DESIGN_TOKENS.colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </Pressable>

      {/* Create/Edit modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background px-5 pt-8">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-primary tracking-tight">
              {editingMenu ? t('menus.editTitle') : t('menus.newTitle')}
            </Text>
            <Pressable onPress={() => setShowForm(false)} hitSlop={8}>
              <Text className="text-muted font-medium">{t('common.cancel')}</Text>
            </Pressable>
          </View>
          <View className="gap-4">
            <Input
              label={t('menus.nameLabel')}
              value={name}
              onChangeText={(v) => setName(sanitizeText(v, 60))}
              placeholder={t('menus.namePlaceholder')}
            />
            <Input
              label={t('menus.descLabel')}
              value={description}
              onChangeText={(v) => setDescription(sanitizeText(v, 200))}
              placeholder={t('menus.descPlaceholder')}
              multiline
            />
            <Button label={t('categories.save')} onPress={handleSave} loading={saving} className="mt-2" />
          </View>
        </View>
      </Modal>

      {/* Schedules modal */}
      <Modal visible={showSchedule} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background px-5 pt-8">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-2xl font-bold text-primary tracking-tight">
              {t('menus.schedulesTitle')}
            </Text>
            <Pressable onPress={() => setShowSchedule(false)} hitSlop={8}>
              <Text className="text-muted font-medium">{t('common.cancel')}</Text>
            </Pressable>
          </View>
          <Text className="text-muted text-sm mb-5">{t('menus.schedulesHint')}</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {schedules.length === 0 ? (
              <View className="items-center py-6 mb-4">
                <Text className="text-4xl mb-2">🕐</Text>
                <Text className="text-primary font-semibold text-base">{t('menus.noSchedules')}</Text>
                <Text className="text-muted text-sm text-center mt-1 px-4">{t('menus.noSchedulesDesc')}</Text>
              </View>
            ) : (
              schedules.map((s) => (
                <View key={s.id} className="flex-row items-center mb-2 px-1">
                  <View className="flex-1">
                    <Text className="text-primary font-medium">
                      {t(`menus.days.${s.day_of_week}`)}
                    </Text>
                    <Text className="text-muted text-sm">{s.start_time} – {s.end_time}</Text>
                  </View>
                  <Pressable onPress={() => handleDeleteSchedule(s.id)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </Pressable>
                </View>
              ))
            )}

            <View className="border-t border-borderSoft pt-5 mt-2 gap-4">
              <Text className="text-primary font-semibold text-base">{t('menus.addSchedule')}</Text>

              <View className="gap-1">
                <Text className="text-sm font-medium text-primary">{t('menus.scheduleDay')}</Text>
                <View className="flex-row flex-wrap gap-2">
                  {DAY_KEYS.map((dk) => {
                    const dayNum = parseInt(dk)
                    const active = selectedDay === dayNum
                    return (
                      <Pressable
                        key={dk}
                        onPress={() => setSelectedDay(dayNum)}
                        className="px-3 py-1.5 rounded-full border"
                        style={{
                          backgroundColor: active ? (isDark ? '#FAFAFA' : '#111111') : 'transparent',
                          borderColor: active ? (isDark ? '#FAFAFA' : '#111111') : (isDark ? '#57534E' : '#D6D3D1'),
                        }}
                      >
                        <Text style={{ color: active ? (isDark ? '#111111' : '#FFFFFF') : (isDark ? '#A8A29E' : '#78716C'), fontWeight: '500', fontSize: 13 }}>
                          {t(`menus.days.${dk}`)}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 gap-1">
                  <Text className="text-sm font-medium text-primary">{t('menus.scheduleFrom')}</Text>
                  <TextInput
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="09:00"
                    keyboardType="numbers-and-punctuation"
                    style={inputStyle}
                    placeholderTextColor={isDark ? '#57534E' : '#A8A29E'}
                  />
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-sm font-medium text-primary">{t('menus.scheduleTo')}</Text>
                  <TextInput
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="23:00"
                    keyboardType="numbers-and-punctuation"
                    style={inputStyle}
                    placeholderTextColor={isDark ? '#57534E' : '#A8A29E'}
                  />
                </View>
              </View>

              <Button
                label={t('menus.addSchedule')}
                onPress={handleAddSchedule}
                loading={scheduleSaving}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}
