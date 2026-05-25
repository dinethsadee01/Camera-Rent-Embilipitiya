import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Package, CalendarDays, Clock, RefreshCw } from 'lucide-react-native';
import { BarChart } from 'react-native-gifted-charts';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AppMenu } from '@/components/ui/AppMenu';
import { SkeletonCard, Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge, statusVariant, statusLabel } from '@/components/ui/Badge';
import { useInsights } from '@/hooks/useInsights';
import { useTheme } from '@/hooks/useTheme';

export default function InsightsScreen() {
  const { data, isLoading, refetch, isFetching } = useInsights();
  const { isDark } = useTheme();
  const textColor = isDark ? '#eeeeee' : '#000000';
  const [selectedBar, setSelectedBar] = useState<number | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-platinum-700 dark:bg-black">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-24">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-2 pb-4">
          <View>
            <Text className="text-xl font-bold text-black dark:text-platinum">Insights</Text>
            <Text className="text-xs text-black-800 dark:text-black-800">Business overview</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => refetch()}
              className="w-9 h-9 bg-platinum-600 dark:bg-black-600 rounded-xl items-center justify-center"
              disabled={isFetching}
            >
              <RefreshCw size={16} color={isDark ? '#eeeeee' : '#333333'} />
            </TouchableOpacity>
            <ThemeToggle />
            <AppMenu />
          </View>
        </View>

        {isLoading ? (
          <View className="px-4 gap-3">
            <View className="flex-row gap-3">
              <Skeleton height={90} className="flex-1 rounded-2xl" />
              <Skeleton height={90} className="flex-1 rounded-2xl" />
            </View>
            <Skeleton height={90} className="rounded-2xl" />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : data ? (
          <>
            {/* Summary cards */}
            <View className="flex-row gap-3 px-4 mb-3">
              <SummaryCard
                icon={<TrendingUp size={18} color="#d61e30" />}
                label="This Month"
                value={formatCurrency(data.revenueThisMonth)}
                sub="Revenue"
              />
              <SummaryCard
                icon={<TrendingUp size={16} color="#d97706" />}
                label="This Week"
                value={formatCurrency(data.revenueThisWeek)}
                sub="Revenue"
              />
            </View>
            <View className="flex-row gap-3 px-4 mb-4">
              <SummaryCard
                icon={<CalendarDays size={18} color="#16a34a" />}
                label="Active"
                value={String(data.activeBookings)}
                sub="Bookings"
              />
              <SummaryCard
                icon={<Package size={18} color="#2563eb" />}
                label="Items Out"
                value={String(data.itemsCurrentlyOut)}
                sub="Currently rented"
              />
            </View>

            {/* Revenue Chart */}
            {data.monthlyRevenue.length > 0 && (
              <View className="mx-4 bg-white dark:bg-black-600 rounded-2xl p-4 mb-4">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-sm font-bold text-black dark:text-platinum">Monthly Revenue</Text>
                  {selectedBar !== null && selectedBar < data.monthlyRevenue.length && (
                    <View className="bg-flag_red rounded-lg px-2.5 py-1">
                      <Text className="text-white text-xs font-bold">
                        {data.monthlyRevenue[selectedBar].month}: {formatCurrency(data.monthlyRevenue[selectedBar].revenue)}
                      </Text>
                    </View>
                  )}
                </View>
                <BarChart
                  data={data.monthlyRevenue.map((m, i) => ({
                    value: m.revenue,
                    label: m.month,
                    frontColor: selectedBar === i ? '#b01525' : '#d61e30',
                  }))}
                  onPress={(_item: any, index: number) =>
                    setSelectedBar((prev) => (prev === index ? null : index))
                  }
                  barWidth={28}
                  spacing={16}
                  roundedTop
                  noOfSections={4}
                  yAxisTextStyle={{ color: textColor, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: textColor, fontSize: 10 }}
                  yAxisColor="transparent"
                  xAxisColor={isDark ? '#333333' : '#eeeeee'}
                  hideRules
                  isAnimated
                  width={280}
                  height={150}
                />
              </View>
            )}

            {/* Top Items */}
            {data.topItems.length > 0 && (
              <View className="mx-4 bg-white dark:bg-black-600 rounded-2xl p-4 mb-4">
                <Text className="text-sm font-bold text-black dark:text-platinum mb-3">Most Rented Items</Text>
                {data.topItems.map((t, i) => (
                  <View key={t.item.id} className="flex-row items-center mb-2">
                    <View className="w-6 h-6 rounded-full bg-flag_red-900 items-center justify-center mr-3">
                      <Text className="text-xs font-bold text-flag_red">{i + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm text-black dark:text-platinum">{t.item.name}</Text>
                      <Text className="text-xs text-black-800 dark:text-black-800">{t.item.sku}</Text>
                    </View>
                    <Text className="text-sm font-semibold text-flag_red">{t.count}×</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Upcoming Returns */}
            {data.upcomingReturns.length > 0 && (
              <View className="mx-4 bg-white dark:bg-black-600 rounded-2xl p-4 mb-4">
                <View className="flex-row items-center mb-3">
                  <Clock size={15} color="#d61e30" />
                  <Text className="text-sm font-bold text-black dark:text-platinum ml-2">Upcoming Returns</Text>
                </View>
                {data.upcomingReturns.map((b) => (
                  <View key={b.id} className="flex-row items-center py-2 border-b border-platinum-600 dark:border-black-500">
                    <View className="flex-1">
                      <Text className="text-sm text-black dark:text-platinum">{b.customer?.full_name}</Text>
                      <Text className="text-xs text-black-800 dark:text-black-800">{b.item?.name}</Text>
                    </View>
                    <Text className="text-xs font-semibold text-flag_red">{formatDate(b.end_date)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recent Bookings */}
            {data.recentBookings.length > 0 && (
              <View className="mx-4 bg-white dark:bg-black-600 rounded-2xl p-4">
                <Text className="text-sm font-bold text-black dark:text-platinum mb-3">Recent Bookings</Text>
                {data.recentBookings.map((b) => (
                  <View key={b.id} className="flex-row items-center py-2 border-b border-platinum-600 dark:border-black-500">
                    <View className="flex-1">
                      <Text className="text-sm text-black dark:text-platinum">{b.customer?.full_name}</Text>
                      <Text className="text-xs text-black-800 dark:text-black-800">{b.item?.name} · {b.booking_code}</Text>
                    </View>
                    <View className="items-end gap-1">
                      <Text className="text-sm font-semibold text-flag_red">{formatCurrency(b.total_price)}</Text>
                      <Badge label={statusLabel(b.payment_status)} variant={statusVariant(b.payment_status)} />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <View className="flex-1 bg-white dark:bg-black-600 rounded-2xl p-4">
      <View className="flex-row items-center justify-between mb-2">
        {icon}
        <Text className="text-xs text-black-800 dark:text-black-800">{label}</Text>
      </View>
      <Text className="text-lg font-bold text-black dark:text-platinum" numberOfLines={1}>{value}</Text>
      <Text className="text-xs text-black-800 dark:text-black-800 mt-0.5">{sub}</Text>
    </View>
  );
}
