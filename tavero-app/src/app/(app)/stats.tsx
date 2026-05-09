import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from 'nativewind'
import { supabase } from '@/lib/supabase'
import { useRestaurant } from '@/context/RestaurantContext'
import { Header } from '@/components/ui/Header'
import { Card } from '@/components/ui/Card'
import { DESIGN_TOKENS } from '@/lib/designTokens'

type DayStat = { date: string; visits: number }

export default function StatsScreen() {
  const { restaurant } = useRestaurant()
  const { t } = useTranslation()
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DayStat[]>([])
  const [period, setPeriod] = useState<7 | 30>(30)

  const [prevStats, setPrevStats] = useState<DayStat[]>([])

  const loadStats = useCallback(async () => {
    if (!restaurant) return
    setLoading(true)
    const { data, error } = await (supabase as any).rpc('get_visit_stats', {
      p_restaurant_id: restaurant.id,
      p_days: period * 2,
    })
    if (!error && data) {
      const all = data as DayStat[]
      setPrevStats(all.slice(0, period))
      setStats(all.slice(period))
    }
    setLoading(false)
  }, [restaurant, period])

  useFocusEffect(useCallback(() => { loadStats() }, [loadStats]))
  useEffect(() => { loadStats() }, [loadStats])

  const totalVisits = stats.reduce((sum, s) => sum + s.visits, 0)
  const prevTotal = prevStats.reduce((sum, s) => sum + s.visits, 0)
  const avgPerDay = stats.length > 0 ? Math.round(totalVisits / period) : 0
  const maxVisits = Math.max(...stats.map((s) => s.visits), 1)

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayVisits = stats.find((s) => s.date === todayStr)?.visits ?? 0

  const trendPct = prevTotal > 0
    ? Math.round(((totalVisits - prevTotal) / prevTotal) * 100)
    : null
  const trendUp = trendPct !== null && trendPct >= 0

  return (
    <View className="flex-1 bg-background">
      <Header title={t('stats.title')} subtitle={t('stats.subtitle')} />

      <ScrollView contentContainerClassName="px-6 py-6 gap-5">
        {/* Period selector */}
        <View className="flex-row gap-2">
          {([7, 30] as const).map((p) => (
            <View key={p} className="flex-1">
              <Text
                onPress={() => setPeriod(p)}
                className={`text-center py-2.5 rounded-xl text-sm font-semibold ${
                  period === p
                    ? 'bg-accent text-white'
                    : 'bg-surface border border-border text-primary'
                }`}
              >
                {p === 7 ? t('stats.last7') : t('stats.last30')}
              </Text>
            </View>
          ))}
        </View>

        {loading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.accent} />
          </View>
        ) : (
          <>
            {/* Summary cards */}
            <View className="flex-row gap-3">
              <Card className="flex-1 items-center py-5">
                <Text className="text-3xl font-bold text-primary">{totalVisits}</Text>
                <Text className="text-xs text-muted mt-1">{t('stats.totalVisits')}</Text>
                {trendPct !== null && (
                  <View className={`mt-1.5 px-2 py-0.5 rounded-full ${trendUp ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Text className={`text-[11px] font-bold ${trendUp ? 'text-green-700' : 'text-red-600'}`}>
                      {trendUp ? '▲' : '▼'} {Math.abs(trendPct)}%
                    </Text>
                  </View>
                )}
              </Card>
              <Card className="flex-1 items-center py-5">
                <Text className="text-3xl font-bold text-primary">{todayVisits}</Text>
                <Text className="text-xs text-muted mt-1">{t('stats.today')}</Text>
              </Card>
              <Card className="flex-1 items-center py-5">
                <Text className="text-3xl font-bold text-primary">{avgPerDay}</Text>
                <Text className="text-xs text-muted mt-1">{t('stats.avgPerDay')}</Text>
              </Card>
            </View>

            {trendPct !== null && (
              <View className={`flex-row items-center gap-2 px-4 py-3 rounded-xl border ${trendUp ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <Text className={`text-sm font-semibold ${trendUp ? 'text-green-700' : 'text-red-700'}`}>
                  {trendUp ? '▲' : '▼'} {Math.abs(trendPct)}%
                </Text>
                <Text className={`text-xs flex-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {t('stats.vsLastPeriod', { visits: prevTotal })}
                </Text>
              </View>
            )}

            {/* Bar chart */}
            <Card>
              <Text className="text-sm font-semibold text-primary mb-4">{t('stats.chartTitle')}</Text>
              {stats.length === 0 ? (
                <View className="py-8 items-center">
                  <Text className="text-muted text-sm">{t('stats.noData')}</Text>
                </View>
              ) : (
                <View className="gap-1.5">
                  {stats.slice(-period).map((day) => {
                    const pct = (day.visits / maxVisits) * 100
                    const dateLabel = new Date(day.date + 'T00:00:00').toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric',
                    })
                    return (
                      <View key={day.date} className="flex-row items-center gap-2">
                        <Text className="text-[10px] text-muted w-12 text-right">{dateLabel}</Text>
                        <View className="flex-1 h-5 bg-background rounded-full overflow-hidden">
                          <View
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.max(pct, 2)}%`,
                              backgroundColor: DESIGN_TOKENS.colors.accent,
                            }}
                          />
                        </View>
                        <Text className="text-[11px] font-semibold text-primary w-8 text-right">
                          {day.visits}
                        </Text>
                      </View>
                    )
                  })}
                </View>
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  )
}
