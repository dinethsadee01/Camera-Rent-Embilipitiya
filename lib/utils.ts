import { format, parseISO, differenceInDays } from 'date-fns';

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
