import { format, parseISO, differenceInDays } from 'date-fns';
import type { BookingWithRelations } from '@/lib/types';

export function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateStr: string): string {
  try {
    const date = typeof dateStr === 'string' && dateStr.includes('T')
      ? parseISO(dateStr)
      : new Date(dateStr + 'T00:00:00');
    return format(date, 'dd/MM/yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy HH:mm');
  } catch {
    return dateStr;
  }
}

export function calculateTotalPrice(
  dailyRate: number,
  startDate: string,
  endDate: string,
  quantity: number
): number {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const days = Math.max(1, differenceInDays(end, start) + 1);
  return dailyRate * days * quantity;
}

export function getRentalDays(startDate: string, endDate: string): number {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  return Math.max(1, differenceInDays(end, start) + 1);
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function today(): string {
  return toISODateString(new Date());
}

export function buildBookingReceipt(b: BookingWithRelations): string {
  const days = getRentalDays(b.start_date, b.end_date);
  const primaryItems = (b.booking_items ?? []).filter((bi) => !bi.is_free);
  const freeItems = (b.booking_items ?? []).filter((bi) => bi.is_free);

  const itemLines = primaryItems
    .map((bi) => {
      const name = bi.item?.name ?? bi.custom_name ?? 'Item';
      const qty = bi.quantity > 1 ? ` ×${bi.quantity}` : '';
      return `  • ${name}${qty} — ${formatCurrency(bi.daily_rate)}/day`;
    })
    .join('\n');

  const freeLines =
    freeItems.length > 0
      ? `\n  + ${freeItems.map((bi) => bi.custom_name ?? bi.item?.name).join(', ')} (free)`
      : '';

  const paymentLine =
    b.payment_status === 'partial'
      ? `  Advance paid : ${formatCurrency(b.advance_amount)}\n  Balance due  : ${formatCurrency(b.total_price - b.advance_amount)}`
      : `  Payment      : ${b.payment_status === 'paid' ? 'Paid in full' : 'Pending'}`;

  return [
    '📷 Camera Rent Embilipitiya',
    '─────────────────────────',
    `Booking   : ${b.booking_code}`,
    `Customer  : ${b.customer?.full_name} (${b.customer?.customer_code})`,
    '',
    'Items:',
    itemLines + freeLines,
    '',
    `Period    : ${formatDate(b.start_date)} → ${formatDate(b.end_date)} (${days} day${days !== 1 ? 's' : ''})`,
    `Total     : ${formatCurrency(b.total_price)}`,
    paymentLine,
    b.payment_method ? `  Method       : ${b.payment_method.replace('_', ' ')}` : '',
    b.notes ? `\nNotes: ${b.notes}` : '',
    '─────────────────────────',
  ]
    .filter((l) => l !== undefined)
    .join('\n')
    .trim();
}
