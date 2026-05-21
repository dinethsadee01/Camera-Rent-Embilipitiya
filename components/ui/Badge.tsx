import { View, Text } from 'react-native';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, { container: string; text: string }> = {
  default: { container: 'bg-black-600', text: 'text-platinum' },
  success: { container: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  warning: { container: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  error: { container: 'bg-flag_red-900', text: 'text-flag_red' },
  info: { container: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  muted: { container: 'bg-platinum-600 dark:bg-black-500', text: 'text-black-700 dark:text-black-900' },
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const { container, text } = variantClasses[variant];
  return (
    <View className={`px-2 py-0.5 rounded-full self-start ${container}`}>
      <Text className={`text-xs font-medium ${text}`}>{label}</Text>
    </View>
  );
}

export function statusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'upcoming': return 'info';
    case 'active': return 'success';
    case 'completed': return 'muted';
    case 'cancelled': return 'error';
    case 'paid': return 'success';
    case 'pending': return 'warning';
    case 'partial': return 'info';
    default: return 'default';
  }
}

export function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
