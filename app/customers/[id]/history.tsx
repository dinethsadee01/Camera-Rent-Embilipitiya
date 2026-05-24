import { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CalendarDays, Package, TrendingUp } from 'lucide-react-native';
import { Badge, statusVariant, statusLabel } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useCustomer } from '@/hooks/useCustomers';
import { useCustomerBookings } from '@/hooks/useBookings';
import { useTheme } from '@/hooks/useTheme';
import type { BookingWithRelations } from '@/lib/types';

export default function CustomerHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: customer } = useCustomer(id);
  const { data: bookings, isLoading } = useCustomerBookings(id);
  const { isDark } = useTheme();

  const stats = useMemo(() => {
    if (!bookings) return null;
    const active = bookings.filter((b) => b.status !== 'cancelled');
    const totalSpent = active.reduce((s, b) => s + Number(b.total_price), 0);
    const completed = bookings.filter((b) => b.status === 'completed').length;
    return { total: active.length, totalSpent, completed };
  }, [bookings]);

  const iconColor = isDark ? '#999999' : '#666666';

  function renderBooking({ item: b }: { item: BookingWithRelations }) {
    const primaryItems = (b.booking_items ?? []).filter((bi) => !bi.is_free);
    const freeItems = (b.booking_items ?? []).filter((bi) => bi.is_free);

    return (
      <View className="bg-white dark:bg-black-600 rounded-2xl p-4 mb-3">
        <View className="flex-row items-start justify-between mb-2">
          <Text className="text-xs font-mono text-black-800 dark:text-black-800">{b.booking_code}</Text>
          <View className="flex-row gap-1.5">
            <Badge label={statusLabel(b.status)} variant={statusVariant(b.status)} />
            <Badge label={statusLabel(b.payment_status)} variant={statusVariant(b.payment_status)} />
          </View>
        </View>

        <View className="flex-row items-start mb-2">
          <Package size={13} color={iconColor} style={{ marginTop: 2 }} />
          <View className="ml-2 flex-1">
            {primaryItems.map((bi, idx) => (
              <Text key={idx} className="text-sm font-medium text-black dark:text-platinum">
                {bi.item?.name ?? bi.custom_name}
                {bi.quantity > 1 ? ` ×${bi.quantity}` : ''}
              </Text>
            ))}
            {freeItems.length > 0 && (
              <Text className="text-xs text-black-800 dark:text-black-800">
                + {freeItems.map((bi) => bi.custom_name ?? bi.item?.name).join(', ')} (free)
              </Text>
            )}
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <CalendarDays size={13} color={iconColor} />
            <Text className="ml-1.5 text-sm text-black-700 dark:text-black-900">
              {formatDate(b.start_date)} – {formatDate(b.end_date)}
            </Text>
          </View>
          <Text className="text-sm font-bold text-flag_red">{formatCurrency(b.total_price)}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-platinum-700 dark:bg-black">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 w-9 h-9 rounded-xl bg-white dark:bg-black-600 items-center justify-center">
          <ArrowLeft size={18} color={isDark ? '#eeeeee' : '#000000'} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-black dark:text-platinum" numberOfLines={1}>
            {customer?.full_name ?? '…'}
          </Text>
          <Text className="text-xs text-black-800 dark:text-black-800">{customer?.customer_code}</Text>
        </View>
      </View>

      {/* Stats */}
      {stats && (
        <View className="flex-row px-4 gap-3 mb-4">
          <View className="flex-1 bg-white dark:bg-black-600 rounded-2xl px-4 py-3">
            <Text className="text-2xl font-bold text-black dark:text-platinum">{stats.total}</Text>
            <Text className="text-xs text-black-800 dark:text-black-800">Total Bookings</Text>
          </View>
          <View className="flex-1 bg-white dark:bg-black-600 rounded-2xl px-4 py-3">
            <Text className="text-2xl font-bold text-black dark:text-platinum">{stats.completed}</Text>
            <Text className="text-xs text-black-800 dark:text-black-800">Completed</Text>
          </View>
          <View className="flex-1 bg-white dark:bg-black-600 rounded-2xl px-4 py-3">
            <TrendingUp size={14} color="#d61e30" />
            <Text className="text-sm font-bold text-flag_red mt-0.5">{formatCurrency(stats.totalSpent)}</Text>
            <Text className="text-xs text-black-800 dark:text-black-800">Total Spent</Text>
          </View>
        </View>
      )}

      {isLoading ? (
        <View className="px-4">
          {[1, 2, 3].map((k) => <SkeletonCard key={k} />)}
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => b.id}
          contentContainerClassName="px-4 pb-10"
          renderItem={renderBooking}
          ListHeaderComponent={
            bookings && bookings.length > 0 ? (
              <Text className="text-xs font-medium text-black-700 dark:text-black-900 mb-3 uppercase tracking-wide">
                Booking History
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon={<CalendarDays size={48} color={isDark ? '#eeeeee' : '#666666'} />}
              title="No bookings yet"
              subtitle="This customer has no booking history."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
