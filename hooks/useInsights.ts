import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { startOfMonth, endOfMonth, startOfWeek, subMonths, format } from 'date-fns';
import type { BookingWithRelations, InsightsSummary, Item } from '@/lib/types';

const BOOKING_SELECT = `*, customer:customers(*), booking_items(*, item:items(*))`;

export function useInsights() {
  return useQuery({
    queryKey: ['insights'],
    queryFn: async (): Promise<InsightsSummary> => {
      const now = new Date();
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');
      const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const today = format(now, 'yyyy-MM-dd');

      const [allBookings, activeBookings, upcomingReturns, recentBookings] = await Promise.all([
        supabase
          .from('bookings')
          .select(BOOKING_SELECT)
          .not('status', 'eq', 'cancelled'),
        supabase
          .from('bookings')
          .select('id')
          .eq('status', 'active'),
        supabase
          .from('bookings')
          .select(BOOKING_SELECT)
          .eq('status', 'active')
          .gte('end_date', today)
          .lte('end_date', format(new Date(now.getTime() + 3 * 86400000), 'yyyy-MM-dd'))
          .order('end_date'),
        supabase
          .from('bookings')
          .select(BOOKING_SELECT)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const bookings = (allBookings.data ?? []) as BookingWithRelations[];

      const monthBookings = bookings
        .filter((b) => b.created_at >= monthStart && b.created_at <= monthEnd + 'T23:59:59');

      const revenueThisMonth = monthBookings.reduce((s, b) => s + Number(b.total_price), 0);

      const discountsThisMonth = monthBookings.reduce((s, b) => s + Number(b.discount_amount ?? 0), 0);

      const revenueThisWeek = bookings
        .filter((b) => b.created_at >= weekStart)
        .reduce((s, b) => s + Number(b.total_price), 0);

      const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(now, 5 - i);
        const start = format(startOfMonth(d), 'yyyy-MM-dd');
        const end = format(endOfMonth(d), 'yyyy-MM-dd');
        const revenue = bookings
          .filter((b) => b.created_at >= start && b.created_at <= end + 'T23:59:59')
          .reduce((s, b) => s + Number(b.total_price), 0);
        return { month: format(d, 'MMM'), revenue };
      });

      const itemCounts = new Map<string, number>();
      for (const b of bookings) {
        for (const bi of (b.booking_items ?? [])) {
          if (bi.item_id && !bi.is_free) {
            itemCounts.set(bi.item_id, (itemCounts.get(bi.item_id) ?? 0) + 1);
          }
        }
      }

      const allBookingItems = bookings.flatMap((b) => b.booking_items ?? []);
      const topItems = [...itemCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([item_id, count]) => {
          const bi = allBookingItems.find((x) => x.item_id === item_id);
          return bi?.item ? { item: bi.item as Item, count } : null;
        })
        .filter((x): x is { item: Item; count: number } => x !== null);

      return {
        revenueThisMonth,
        revenueThisWeek,
        discountsThisMonth,
        activeBookings: activeBookings.data?.length ?? 0,
        itemsCurrentlyOut: activeBookings.data?.length ?? 0,
        upcomingReturns: (upcomingReturns.data ?? []) as BookingWithRelations[],
        recentBookings: (recentBookings.data ?? []) as BookingWithRelations[],
        monthlyRevenue,
        topItems,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
