import { useState, useMemo } from 'react';
import { View, Text, FlatList, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SearchBar } from '@/components/ui/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { BookingCard } from '@/components/bookings/BookingCard';
import { Toast } from '@/components/ui/Toast';
import { confirmAction } from '@/components/ui/ConfirmDialog';
import { useBookings, useUpdateBooking, useMarkBookingPaid } from '@/hooks/useBookings';
import { CalendarDays } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import type { BookingWithRelations, BookingStatus } from '@/lib/types';

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'active', label: 'Active' },
  { key: 'pending_payment', label: 'Unpaid' },
  { key: 'completed', label: 'Done' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function BookingsScreen() {
  const { data: bookings, isLoading } = useBookings();
  const updateBooking = useUpdateBooking();
  const { markPaid, markPending } = useMarkBookingPaid();
  const { isDark } = useTheme();

  const [tab, setTab] = useState('upcoming');
  const [search, setSearch] = useState('');

  const counts = useMemo(() => {
    if (!bookings) return {};
    const map: Record<string, number> = {};
    for (const b of bookings) {
      map[b.status] = (map[b.status] ?? 0) + 1;
      if (b.payment_status !== 'paid' && b.status !== 'cancelled') {
        map['pending_payment'] = (map['pending_payment'] ?? 0) + 1;
      }
    }
    return map;
  }, [bookings]);

  const tabsWithCounts = TABS.map((t) => ({ ...t, count: counts[t.key] }));

  const filtered = useMemo(() => {
    if (!bookings) return [];
    const q = search.toLowerCase();
    return bookings.filter((b) => {
      const matchSearch =
        !q ||
        b.booking_code.toLowerCase().includes(q) ||
        b.customer?.full_name.toLowerCase().includes(q) ||
        b.item?.name.toLowerCase().includes(q);

      const matchTab =
        tab === 'pending_payment'
          ? b.payment_status !== 'paid' && b.status !== 'cancelled'
          : b.status === tab;

      return matchSearch && matchTab;
    });
  }, [bookings, tab, search]);

  async function handleStatusChange(id: string, status: BookingStatus) {
    try {
      await updateBooking.mutateAsync({ id, status });
      Toast.success('Booking updated.');
    } catch (e: any) {
      Toast.error(e?.message ?? 'Update failed.');
    }
  }

  async function handleMarkPaid(b: BookingWithRelations) {
    try {
      await markPaid(b.id);
      Toast.success('Marked as paid.');
    } catch (e: any) {
      Toast.error(e?.message ?? 'Update failed.');
    }
  }

  async function handleMarkPending(b: BookingWithRelations) {
    try {
      await markPending(b.id);
      Toast.success('Marked as pending.');
    } catch (e: any) {
      Toast.error(e?.message ?? 'Update failed.');
    }
  }

  function handleCancel(b: BookingWithRelations) {
    confirmAction(
      'Cancel Booking',
      `Cancel booking ${b.booking_code} for ${b.customer?.full_name}?`,
      'Cancel Booking',
      () => handleStatusChange(b.id, 'cancelled')
    );
  }

  function handleComplete(b: BookingWithRelations) {
    confirmAction(
      'Complete Booking',
      `Mark booking ${b.booking_code} as completed?`,
      'Complete',
      () => handleStatusChange(b.id, 'completed')
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-platinum-700 dark:bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <View>
          <Text className="text-xl font-bold text-black dark:text-platinum">Bookings</Text>
          <Text className="text-xs text-black-800 dark:text-black-800">
            {bookings?.length ?? 0} total
          </Text>
        </View>
        <ThemeToggle />
      </View>

      {/* Search */}
      <View className="px-4 mb-3">
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search bookings, customer, item..." />
      </View>

      {/* Tabs */}
      <SegmentedControl segments={tabsWithCounts} selected={tab} onSelect={setTab} />

      {/* List */}
      <View className="flex-1 mt-3">
        {isLoading ? (
          <View className="px-4">
            {[1, 2, 3].map((k) => <SkeletonCard key={k} />)}
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(b) => b.id}
            contentContainerClassName="px-4 pb-24"
            renderItem={({ item: b }) => (
              <BookingCard
                booking={b}
                onMarkPaid={() => handleMarkPaid(b)}
                onMarkPending={() => handleMarkPending(b)}
                onCancel={() => handleCancel(b)}
                onComplete={() => handleComplete(b)}
                onEdit={() => {}}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon={<CalendarDays size={48} color={isDark ? '#eeeeee' : '#666666'} />}
                title="No bookings here"
                subtitle={search ? 'Try a different search.' : `No ${tab.replace('_', ' ')} bookings.`}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
