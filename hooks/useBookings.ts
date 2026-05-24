import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { generateBookingCode } from '@/lib/sku';
import type { Booking, BookingWithRelations, BookingStatus, PaymentStatus, PaymentMethod } from '@/lib/types';

const BOOKING_SELECT = `
  *,
  customer:customers(*),
  booking_items(*, item:items(*))
`;

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(BOOKING_SELECT)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BookingWithRelations[];
    },
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(BOOKING_SELECT)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as BookingWithRelations;
    },
    enabled: !!id,
  });
}

export function useCustomerBookings(customerId: string) {
  return useQuery({
    queryKey: ['bookings', 'customer', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(BOOKING_SELECT)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BookingWithRelations[];
    },
    enabled: !!customerId,
  });
}

export function useItemBookings(itemId: string) {
  return useQuery({
    queryKey: ['bookings', 'item', itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_items')
        .select('booking:bookings(id, start_date, end_date, status)')
        .eq('item_id', itemId);
      if (error) throw error;
      return (data ?? [])
        .map((d: any) => d.booking)
        .filter((b: any) => b && b.status !== 'cancelled');
    },
    enabled: !!itemId,
  });
}

export type ActiveBookingEntry = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  booking_items: { item_id: string | null; quantity: number }[];
};

export function useAllActiveBookings() {
  return useQuery({
    queryKey: ['bookings', 'active-dates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, start_date, end_date, status, booking_items(item_id, quantity)')
        .not('status', 'eq', 'cancelled');
      if (error) throw error;
      return (data ?? []) as ActiveBookingEntry[];
    },
  });
}

export interface NewBookingItemInput {
  item_id: string | null;
  custom_name: string | null;
  quantity: number;
  daily_rate: number;
  is_free: boolean;
}

export interface NewBookingInput {
  customer_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  advance_amount: number;
  notes: string | null;
  items: NewBookingItemInput[];
}

export function useAddBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewBookingInput) => {
      const { items, ...bookingData } = input;

      const { data: existing } = await supabase.from('bookings').select('booking_code');
      const existingCodes = (existing ?? []).map((b: { booking_code: string }) => b.booking_code);
      const booking_code = generateBookingCode(existingCodes);

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({ ...bookingData, booking_code })
        .select('id')
        .single();
      if (bookingError) throw bookingError;

      if (items.length > 0) {
        const { error: itemsError } = await supabase
          .from('booking_items')
          .insert(items.map((item) => ({ ...item, booking_id: booking.id })));
        if (itemsError) throw itemsError;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(BOOKING_SELECT)
        .eq('id', booking.id)
        .single();
      if (error) throw error;
      return data as BookingWithRelations;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Booking> & { id: string }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select(BOOKING_SELECT)
        .single();
      if (error) throw error;
      return data as BookingWithRelations;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', vars.id] });
    },
  });
}

export function useUpdateBookingStatus() {
  const update = useUpdateBooking();
  return {
    ...update,
    mutateAsync: (id: string, status: BookingStatus) =>
      update.mutateAsync({ id, status }),
  };
}

export function useMarkBookingPaid() {
  const update = useUpdateBooking();
  return {
    ...update,
    markPaid: (id: string) =>
      update.mutateAsync({ id, payment_status: 'paid' as PaymentStatus }),
    markPending: (id: string) =>
      update.mutateAsync({ id, payment_status: 'pending' as PaymentStatus }),
  };
}
