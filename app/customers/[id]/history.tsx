import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { Badge, statusVariant, statusLabel } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useCustomer } from '@/hooks/useCustomers';
import { useCustomerBookings } from '@/hooks/useBookings';
import { useTheme } from '@/hooks/useTheme';
import { CalendarDays } from 'lucide-react-native';

export default function CustomerHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: customer } = useCustomer(id);
  const { data: bookings, isLoading } = useCustomerBookings(id);
  const { isDark } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-platinum-700 dark:bg-black">
      <View className="flex-row items-center px-4 pt-2 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={22} color={isDark ? '#eeeeee' : '#000000'} />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-bold text-black dark:text-platinum">Booking History</Text>
          {customer && (
            <Text className="text-xs text-black-800 dark:text-black-800">{customer.full_name}</Text>
          )}
        </View>
      </View>

      {isLoading ? (
        <View className="px-4">
          {[1, 2, 3].map((k) => <SkeletonCard key={k} />)}
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => b.id}
          contentContainerClassName="px-4 pb-10"
          renderItem={({ item: b }) => (
            <View className="bg-white dark:bg-black-600 rounded-2xl p-4 mb-3">
              <View className="flex-row items-start justify-between mb-2">
                <Text className="text-xs font-mono text-black-800 dark:text-black-800">{b.booking_code}</Text>
                <View className="flex-row gap-1.5">
                  <Badge label={statusLabel(b.status)} variant={statusVariant(b.status)} />
                  <Badge label={statusLabel(b.payment_status)} variant={statusVariant(b.payment_status)} />
                </View>
              </View>
              <Text className="text-base font-semibold text-black dark:text-platinum mb-1">{b.item?.name}</Text>
              <View className="flex-row items-center">
                <CalendarDays size={13} color={isDark ? '#999999' : '#666666'} />
                <Text className="ml-1.5 text-sm text-black-700 dark:text-black-900">
                  {formatDate(b.start_date)} – {formatDate(b.end_date)}
                </Text>
              </View>
              <Text className="text-sm font-semibold text-flag_red mt-1">{formatCurrency(b.total_price)}</Text>
            </View>
          )}
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
