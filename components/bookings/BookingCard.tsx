import { View, Text, TouchableOpacity } from 'react-native';
import { CalendarDays, User, Package, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { Badge, statusVariant, statusLabel } from '@/components/ui/Badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import type { BookingWithRelations } from '@/lib/types';

interface BookingCardProps {
  booking: BookingWithRelations;
  onMarkPaid: () => void;
  onMarkPending: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onComplete: () => void;
}

export function BookingCard({ booking: b, onMarkPaid, onMarkPending, onCancel, onEdit, onComplete }: BookingCardProps) {
  const { isDark } = useTheme();
  const iconColor = isDark ? '#999999' : '#666666';

  return (
    <View className="bg-white dark:bg-black-600 rounded-2xl p-4 mb-3">
      {/* Top row */}
      <View className="flex-row items-start justify-between mb-3">
        <Text className="text-xs font-mono text-black-800 dark:text-black-800">{b.booking_code}</Text>
        <View className="flex-row gap-1.5">
          <Badge label={statusLabel(b.status)} variant={statusVariant(b.status)} />
          <Badge label={statusLabel(b.payment_status)} variant={statusVariant(b.payment_status)} />
        </View>
      </View>

      {/* Customer & Item */}
      <View className="gap-1.5 mb-3">
        <View className="flex-row items-center">
          <User size={13} color={iconColor} />
          <Text className="ml-2 text-sm font-medium text-black dark:text-platinum">{b.customer?.full_name}</Text>
          <Text className="ml-1.5 text-xs text-black-800 dark:text-black-800">{b.customer?.customer_code}</Text>
        </View>
        <View className="flex-row items-center">
          <Package size={13} color={iconColor} />
          <Text className="ml-2 text-sm text-black dark:text-platinum">{b.item?.name}</Text>
          {b.quantity > 1 && (
            <Text className="ml-1.5 text-xs text-black-800 dark:text-black-800">×{b.quantity}</Text>
          )}
        </View>
        <View className="flex-row items-center">
          <CalendarDays size={13} color={iconColor} />
          <Text className="ml-2 text-sm text-black-700 dark:text-black-900">
            {formatDate(b.start_date)} → {formatDate(b.end_date)}
          </Text>
        </View>
      </View>

      {/* Price row */}
      <View className="flex-row items-center justify-between border-t border-platinum-600 dark:border-black-500 pt-3 mb-3">
        <Text className="text-base font-bold text-flag_red">{formatCurrency(b.total_price)}</Text>
        {b.payment_method && (
          <Text className="text-xs text-black-800 dark:text-black-800 capitalize">{b.payment_method.replace('_', ' ')}</Text>
        )}
        {b.advance_amount > 0 && (
          <Text className="text-xs text-black-800 dark:text-black-800">
            Advance: {formatCurrency(b.advance_amount)}
          </Text>
        )}
      </View>

      {/* Actions */}
      <View className="flex-row gap-2">
        {b.payment_status !== 'paid' && b.status !== 'cancelled' && (
          <TouchableOpacity
            onPress={onMarkPaid}
            className="flex-row items-center px-3 py-2 rounded-xl bg-green-100 dark:bg-green-900/30"
          >
            <CheckCircle size={13} color="#16a34a" />
            <Text className="ml-1.5 text-xs font-medium text-green-700 dark:text-green-400">Mark Paid</Text>
          </TouchableOpacity>
        )}
        {b.payment_status === 'paid' && b.status !== 'cancelled' && (
          <TouchableOpacity
            onPress={onMarkPending}
            className="flex-row items-center px-3 py-2 rounded-xl bg-amber-100 dark:bg-amber-900/30"
          >
            <Clock size={13} color="#d97706" />
            <Text className="ml-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">Mark Pending</Text>
          </TouchableOpacity>
        )}
        {b.status !== 'cancelled' && b.status !== 'completed' && (
          <TouchableOpacity onPress={onEdit} className="px-3 py-2 rounded-xl bg-platinum-600 dark:bg-black-500">
            <Text className="text-xs font-medium text-black-700 dark:text-black-900">Edit</Text>
          </TouchableOpacity>
        )}
        {b.status === 'active' && (
          <TouchableOpacity onPress={onComplete} className="px-3 py-2 rounded-xl bg-platinum-600 dark:bg-black-500">
            <Text className="text-xs font-medium text-black-700 dark:text-black-900">Complete</Text>
          </TouchableOpacity>
        )}
        {b.status !== 'cancelled' && b.status !== 'completed' && (
          <TouchableOpacity onPress={onCancel} className="px-3 py-2 rounded-xl bg-flag_red-900 dark:bg-flag_red-100">
            <XCircle size={13} color="#d61e30" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
