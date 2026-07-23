import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import type { BookingWithRelations } from './types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('bookings', {
      name: 'Booking Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleBookingNotifications(booking: BookingWithRelations) {
  const customerName = booking.customer?.full_name ?? 'Unknown customer';
  const itemNames = (booking.booking_items ?? [])
    .filter((bi) => !bi.is_free)
    .map((bi) => bi.item?.name ?? bi.custom_name ?? 'item')
    .join(', ');

  const now = new Date();

  // 9 AM on the end_date — "return due today"
  const returnDate = new Date(booking.end_date + 'T09:00:00');
  if (returnDate > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: `booking-return-${booking.id}`,
      content: {
        title: 'Return Due Today',
        body: `${customerName} — ${itemNames}`,
        data: { bookingId: booking.id },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: returnDate,
      },
    });
  }

  // 9 AM day after end_date — "overdue"
  const overdueDate = new Date(booking.end_date + 'T09:00:00');
  overdueDate.setDate(overdueDate.getDate() + 1);
  if (overdueDate > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: `booking-overdue-${booking.id}`,
      content: {
        title: 'Overdue Return',
        body: `${customerName} has not returned ${itemNames} yet.`,
        data: { bookingId: booking.id },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: overdueDate,
      },
    });
  }
}

export async function cancelBookingNotifications(bookingId: string) {
  await Promise.allSettled([
    Notifications.cancelScheduledNotificationAsync(`booking-return-${bookingId}`),
    Notifications.cancelScheduledNotificationAsync(`booking-overdue-${bookingId}`),
  ]);
}

const SCHEDULED_ID_PATTERN = /^booking-(?:return|overdue)-(.+)$/;

// Local notifications are only ever cancelled by the device that scheduled
// them, via the cancel/edit mutations above. If a booking is cancelled from
// a different device, or deleted directly in the Supabase dashboard, this
// device never hears about it and the stale reminder still fires. Run this
// on launch to reconcile: cancel any pending local notification whose
// booking is no longer active (or no longer exists) on the server.
export async function reconcileBookingNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  const bookingIds = new Set<string>();
  for (const n of scheduled) {
    const match = n.identifier.match(SCHEDULED_ID_PATTERN);
    if (match) bookingIds.add(match[1]);
  }
  if (bookingIds.size === 0) return;

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, status')
    .in('id', Array.from(bookingIds));
  if (error) return; // best-effort — don't block app startup on a network hiccup

  const activeIds = new Set(
    (bookings ?? [])
      .filter((b) => b.status !== 'cancelled' && b.status !== 'completed')
      .map((b) => b.id)
  );

  const staleIds = Array.from(bookingIds).filter((id) => !activeIds.has(id));
  await Promise.allSettled(staleIds.map((id) => cancelBookingNotifications(id)));
}
