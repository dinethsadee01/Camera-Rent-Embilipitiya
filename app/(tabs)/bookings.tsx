import { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, Modal, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SearchBar } from '@/components/ui/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { BookingCard } from '@/components/bookings/BookingCard';
import { BookingEditForm } from '@/components/bookings/BookingEditForm';
import { Toast } from '@/components/ui/Toast';
import { confirmAction } from '@/components/ui/ConfirmDialog';
import { useBookings, useUpdateBooking, useUpdateBookingFull, useMarkBookingPaid, useAutoAdvanceBookings } from '@/hooks/useBookings';
import { CalendarDays, X, SlidersHorizontal } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { formatDate, toISODateString } from '@/lib/utils';
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
  const updateBookingFull = useUpdateBookingFull();
  const { markPaid, markPending } = useMarkBookingPaid();
  const autoAdvance = useAutoAdvanceBookings();
  const { isDark } = useTheme();

  useEffect(() => { autoAdvance.mutate(); }, []);

  const [tab, setTab] = useState('upcoming');
  const [search, setSearch] = useState('');
  const [editingBooking, setEditingBooking] = useState<BookingWithRelations | null>(null);

  // Date range filter
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'from' | 'to' | null>(null);

  const hasDateFilter = !!dateFrom || !!dateTo;

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
    const fromStr = dateFrom ? toISODateString(dateFrom) : null;
    const toStr = dateTo ? toISODateString(dateTo) : null;

    return bookings.filter((b) => {
      const matchSearch =
        !q ||
        b.booking_code.toLowerCase().includes(q) ||
        b.customer?.full_name.toLowerCase().includes(q) ||
        (b.booking_items ?? []).some(
          (bi) =>
            bi.item?.name.toLowerCase().includes(q) ||
            bi.custom_name?.toLowerCase().includes(q)
        );

      const matchTab =
        tab === 'pending_payment'
          ? b.payment_status !== 'paid' && b.status !== 'cancelled'
          : b.status === tab;

      // A booking overlaps the date range if it starts before `to` AND ends after `from`
      const matchDate =
        (!fromStr || b.end_date >= fromStr) &&
        (!toStr || b.start_date <= toStr);

      return matchSearch && matchTab && matchDate;
    });
  }, [bookings, tab, search, dateFrom, dateTo]);

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

  async function handleEdit(updates: Parameters<typeof updateBookingFull.mutateAsync>[0]['updates'], items: Parameters<typeof updateBookingFull.mutateAsync>[0]['items']) {
    if (!editingBooking) return;
    try {
      await updateBookingFull.mutateAsync({ id: editingBooking.id, updates, items });
      setEditingBooking(null);
      Toast.success('Booking updated.');
    } catch (e: any) {
      Toast.error(e?.message ?? 'Update failed.');
    }
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

      {/* Search + date filter toggle */}
      <View className="px-4 mb-2 flex-row items-center gap-2">
        <View className="flex-1">
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search bookings, customer, item..." />
        </View>
        <TouchableOpacity
          onPress={() => setShowDateFilter((v) => !v)}
          className={`w-10 h-10 rounded-xl items-center justify-center ${hasDateFilter ? 'bg-flag_red' : 'bg-white dark:bg-black-600'}`}
        >
          <SlidersHorizontal size={16} color={hasDateFilter ? '#ffffff' : isDark ? '#eeeeee' : '#333333'} />
        </TouchableOpacity>
      </View>

      {/* Date range filter bar */}
      {showDateFilter && (
        <View className="px-4 mb-3 flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => setPickerTarget('from')}
            className="flex-1 flex-row items-center bg-white dark:bg-black-600 rounded-xl px-3 py-2 gap-1.5"
          >
            <CalendarDays size={13} color={isDark ? '#999999' : '#666666'} />
            <Text className={`text-xs ${dateFrom ? 'text-black dark:text-platinum font-medium' : 'text-black-800 dark:text-black-800'}`}>
              {dateFrom ? formatDate(toISODateString(dateFrom)) : 'From date'}
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-black-800 dark:text-black-800">→</Text>
          <TouchableOpacity
            onPress={() => setPickerTarget('to')}
            className="flex-1 flex-row items-center bg-white dark:bg-black-600 rounded-xl px-3 py-2 gap-1.5"
          >
            <CalendarDays size={13} color={isDark ? '#999999' : '#666666'} />
            <Text className={`text-xs ${dateTo ? 'text-black dark:text-platinum font-medium' : 'text-black-800 dark:text-black-800'}`}>
              {dateTo ? formatDate(toISODateString(dateTo)) : 'To date'}
            </Text>
          </TouchableOpacity>
          {hasDateFilter && (
            <TouchableOpacity
              onPress={() => { setDateFrom(null); setDateTo(null); }}
              className="w-8 h-8 rounded-xl bg-platinum-600 dark:bg-black-500 items-center justify-center"
            >
              <X size={13} color={isDark ? '#eeeeee' : '#333333'} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Native date picker (shown inline on Android, modal on iOS) */}
      {pickerTarget === 'from' && (
        <DateTimePicker
          value={dateFrom ?? new Date()}
          mode="date"
          display="default"
          maximumDate={dateTo ?? undefined}
          onChange={(_, date) => {
            setPickerTarget(null);
            if (date) setDateFrom(date);
          }}
        />
      )}
      {pickerTarget === 'to' && (
        <DateTimePicker
          value={dateTo ?? new Date()}
          mode="date"
          display="default"
          minimumDate={dateFrom ?? undefined}
          onChange={(_, date) => {
            setPickerTarget(null);
            if (date) setDateTo(date);
          }}
        />
      )}

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
                onEdit={() => setEditingBooking(b)}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon={<CalendarDays size={48} color={isDark ? '#eeeeee' : '#666666'} />}
                title="No bookings here"
                subtitle={search || hasDateFilter ? 'Try adjusting your filters.' : `No ${tab.replace('_', ' ')} bookings.`}
              />
            }
          />
        )}
      </View>

      {/* Edit Booking Modal */}
      <Modal
        visible={!!editingBooking}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditingBooking(null)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <View className="flex-1 bg-platinum-700 dark:bg-black px-5 pt-6">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-bold text-black dark:text-platinum">Edit Booking</Text>
              <Text className="text-xs font-mono text-black-800 dark:text-black-800">
                {editingBooking?.booking_code}
              </Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {editingBooking && (
                <BookingEditForm
                  booking={editingBooking}
                  onSubmit={handleEdit}
                  onCancel={() => setEditingBooking(null)}
                />
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
