import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { generateBookingCode } from '@/lib/sku';
import type { Booking, BookingWithRelations, BookingStatus, PaymentStatus } from '@/lib/types';

const BOOKING_SELECT = `
  *,
  customer:customers(*),
  item:items(*)
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
        .from('bookings')
        .select('*')
        .eq('item_id', itemId)
        .not('status', 'eq', 'cancelled')
        .order('start_date');
      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!itemId,
  });
}

export function useAllActiveBookings() {
  return useQuery({
    queryKey: ['bookings', 'active-dates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('item_id, start_date, end_date, quantity, status')
        .not('status', 'eq', 'cancelled');
      if (error) throw error;
      return data as Pick<Booking, 'item_id' | 'start_date' | 'end_date' | 'quantity' | 'status'>[];
    },
  });
}

export function useAddBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Booking, 'id' | 'booking_code' | 'created_at' | 'updated_at'>) => {
      const { data: existing } = await supabase.from('bookings').select('booking_code');
      const existingCodes = (existing ?? []).map((b: { booking_code: string }) => b.booking_code);
      const booking_code = generateBookingCode(existingCodes);
      const { data, error } = await supabase
        .from('bookings')
        .insert({ ...input, booking_code })
        .select(BOOKING_SELECT)
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
