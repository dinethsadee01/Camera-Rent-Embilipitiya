import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
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
