import { View, Text, TextInput } from 'react-native';
import { Clock } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface TimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function formatTime(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

export function TimeInput({ label, value, onChange, className }: TimeInputProps) {
  const { isDark } = useTheme();
  const iconColor = isDark ? '#999999' : '#666666';

  return (
    <View className={className}>
      <Text className="text-xs font-medium text-black-700 dark:text-black-900 mb-1.5 uppercase tracking-wide">
        {label}
      </Text>
      <View className="flex-row items-center bg-platinum-700 dark:bg-black-500 rounded-xl px-4 py-3">
        <Clock size={15} color={iconColor} />
        <TextInput
          className="ml-2 flex-1 text-base text-black dark:text-platinum"
          value={value}
          onChangeText={(t) => onChange(formatTime(t))}
          placeholder="HH:MM"
          placeholderTextColor={iconColor}
          keyboardType="number-pad"
          maxLength={5}
        />
      </View>
    </View>
  );
}
