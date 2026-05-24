import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { FilterChips } from '@/components/ui/FilterChip';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useItems } from '@/hooks/useInventory';
import { useAllActiveBookings } from '@/hooks/useBookings';
import type { ActiveBookingEntry } from '@/hooks/useBookings';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency } from '@/lib/utils';
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, format, addMonths, subMonths, isSameDay, isToday,
  isBefore, startOfDay,
} from 'date-fns';

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

type DayStatus = 'available' | 'partial' | 'booked' | 'past';

interface DayInfo {
  date: Date;
  status: DayStatus;
  dateStr: string;
}

interface ItemAvailability {
  itemId: string;
  itemName: string;
  sku: string;
  totalQty: number;
  bookedQty: number;
  available: boolean;
  dailyRate: number;
}

export default function AvailabilityScreen() {
  const { data: items } = useItems();
  const { data: bookings, isLoading } = useAllActiveBookings();
  const { isDark } = useTheme();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedItem, setSelectedItem] = useState('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const itemFilters = useMemo(() => [
    { key: 'all', label: 'All Items' },
    ...(items ?? []).map((i) => ({ key: i.id, label: i.name })),
  ], [items]);

  const calendarDays = useMemo((): DayInfo[] => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const today = startOfDay(new Date());

    return days.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const isPast = isBefore(date, today) && !isToday(date);
      if (isPast) return { date, status: 'past', dateStr };

      const inRangeBookings = (bookings ?? []).filter(
        (b) => b.start_date <= dateStr && b.end_date >= dateStr
      );

      if (selectedItem === 'all') {
        const bookedItemIds = new Set(
          inRangeBookings.flatMap((b) =>
            b.booking_items.map((bi) => bi.item_id).filter(Boolean)
          )
        );
        const totalItems = items?.length ?? 0;
        if (bookedItemIds.size === 0) return { date, status: 'available', dateStr };
        if (bookedItemIds.size >= totalItems) return { date, status: 'booked', dateStr };
        return { date, status: 'partial', dateStr };
      } else {
        const item = items?.find((i) => i.id === selectedItem);
        if (!item) return { date, status: 'available', dateStr };
        const bookedQty = inRangeBookings.reduce((s, b) => {
          const bi = b.booking_items.find((x) => x.item_id === selectedItem);
          return s + (bi?.quantity ?? 0);
        }, 0);
        if (bookedQty === 0) return { date, status: 'available', dateStr };
        if (bookedQty >= item.quantity) return { date, status: 'booked', dateStr };
        return { date, status: 'partial', dateStr };
      }
    });
  }, [currentMonth, bookings, items, selectedItem]);

  const dayItemAvailability = useMemo((): ItemAvailability[] => {
    if (!selectedDate || !items) return [];
    return items.map((item) => {
      const bookedQty = (bookings ?? [])
        .filter((b) => b.start_date <= selectedDate && b.end_date >= selectedDate)
        .reduce((s, b) => {
          const bi = b.booking_items.find((x) => x.item_id === item.id);
          return s + (bi?.quantity ?? 0);
        }, 0);
      return {
        itemId: item.id,
        itemName: item.name,
        sku: item.sku,
        totalQty: item.quantity,
        bookedQty,
        available: bookedQty < item.quantity,
        dailyRate: item.daily_rate,
      };
    });
  }, [selectedDate, items, bookings]);

  // First day offset (Monday = 0)
  const monthStart = startOfMonth(currentMonth);
  const firstDayOfWeek = (getDay(monthStart) + 6) % 7; // Mon=0
  const emptyCells = Array(firstDayOfWeek).fill(null);

  const statusColor: Record<DayStatus, string> = {
    available: '#16a34a',
    partial: '#d97706',
    booked: '#d61e30',
    past: isDark ? '#333333' : '#e0e0e0',
  };

  const statusBg: Record<DayStatus, string> = {
    available: isDark ? '#14532d' : '#dcfce7',
    partial: isDark ? '#78350f' : '#fef3c7',
    booked: isDark ? '#7f1d1d' : '#fee2e2',
    past: isDark ? '#111111' : '#f4f4f4',
  };

  return (
    <SafeAreaView className="flex-1 bg-platinum-700 dark:bg-black">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
          <View>
            <Text className="text-xl font-bold text-black dark:text-platinum">Availability</Text>
            <Text className="text-xs text-black-800 dark:text-black-800">Check item bookings by date</Text>
          </View>
          <ThemeToggle />
        </View>

        {/* Item filter */}
        <View className="pl-4 mb-4">
          <FilterChips chips={itemFilters} selected={selectedItem} onSelect={setSelectedItem} />
        </View>

        {/* Calendar */}
        <View className="mx-4 bg-white dark:bg-black-600 rounded-2xl p-4">
          {/* Month nav */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => setCurrentMonth((m) => subMonths(m, 1))}
              className="w-9 h-9 rounded-xl bg-platinum-600 dark:bg-black-500 items-center justify-center"
            >
              <ChevronLeft size={18} color={isDark ? '#eeeeee' : '#333333'} />
            </TouchableOpacity>
            <Text className="text-base font-bold text-black dark:text-platinum">
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
            <TouchableOpacity
              onPress={() => setCurrentMonth((m) => addMonths(m, 1))}
              className="w-9 h-9 rounded-xl bg-platinum-600 dark:bg-black-500 items-center justify-center"
            >
              <ChevronRight size={18} color={isDark ? '#eeeeee' : '#333333'} />
            </TouchableOpacity>
          </View>

          {/* Day labels */}
          <View className="flex-row mb-2">
            {DAY_LABELS.map((d) => (
              <View key={d} className="flex-1 items-center">
                <Text className="text-xs font-medium text-black-800 dark:text-black-800">{d}</Text>
              </View>
            ))}
          </View>

          {/* Grid */}
          <View className="flex-row flex-wrap">
            {emptyCells.map((_, i) => (
              <View key={`e-${i}`} style={{ width: '14.28%' }} />
            ))}
            {calendarDays.map((day) => {
              const isSelected = selectedDate === day.dateStr;
              const todayHighlight = isToday(day.date);
              return (
                <TouchableOpacity
                  key={day.dateStr}
                  style={{ width: '14.28%', aspectRatio: 1, padding: 2 }}
                  onPress={() => setSelectedDate(isSelected ? null : day.dateStr)}
                  disabled={day.status === 'past'}
                >
                  <View
                    style={{
                      flex: 1,
                      borderRadius: 8,
                      backgroundColor: isSelected ? statusColor[day.status] : statusBg[day.status],
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: todayHighlight && !isSelected ? 2 : 0,
                      borderColor: '#d61e30',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: isSelected || todayHighlight ? '700' : '400',
                        color: isSelected ? '#ffffff' : day.status === 'past' ? (isDark ? '#555555' : '#bbbbbb') : statusColor[day.status],
                      }}
                    >
                      {format(day.date, 'd')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View className="flex-row justify-center gap-4 mt-4">
            {[
              { color: '#16a34a', label: 'Available' },
              { color: '#d97706', label: 'Partial' },
              { color: '#d61e30', label: 'Booked' },
            ].map((l) => (
              <View key={l.label} className="flex-row items-center">
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: l.color, marginRight: 4 }} />
                <Text className="text-xs text-black-700 dark:text-black-900">{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Day detail */}
        {selectedDate && (
          <View className="mx-4 mt-4 mb-6">
            <Text className="text-sm font-bold text-black dark:text-platinum mb-3">
              {format(new Date(selectedDate + 'T00:00:00'), 'EEEE, dd MMMM yyyy')}
            </Text>
            {isLoading ? (
              <SkeletonCard />
            ) : (
              dayItemAvailability.map((ia) => (
                <View key={ia.itemId} className="bg-white dark:bg-black-600 rounded-2xl px-4 py-3 mb-2 flex-row items-center justify-between">
                  <View>
                    <Text className="text-sm font-medium text-black dark:text-platinum">{ia.itemName}</Text>
                    <Text className="text-xs text-black-800 dark:text-black-800">{ia.sku} · {formatCurrency(ia.dailyRate)}/day</Text>
                  </View>
                  <View className="items-end">
                    <View
                      className={`px-2.5 py-1 rounded-full ${ia.available ? 'bg-green-100 dark:bg-green-900/30' : 'bg-flag_red-900'}`}
                    >
                      <Text className={`text-xs font-semibold ${ia.available ? 'text-green-700 dark:text-green-400' : 'text-flag_red'}`}>
                        {ia.available ? `${ia.totalQty - ia.bookedQty}/${ia.totalQty} free` : 'Fully Booked'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
