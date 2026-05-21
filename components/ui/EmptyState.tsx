import { View, Text } from 'react-native';
import { PackageOpen } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, subtitle, icon }: EmptyStateProps) {
  const { isDark } = useTheme();
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <View className="mb-4 opacity-30">
        {icon ?? <PackageOpen size={48} color={isDark ? '#eeeeee' : '#666666'} />}
      </View>
      <Text className="text-base font-semibold text-black-700 dark:text-black-900 text-center">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-sm text-black-800 dark:text-black-800 text-center mt-1">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
