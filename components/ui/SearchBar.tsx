import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search...' }: SearchBarProps) {
  const { isDark } = useTheme();
  const iconColor = isDark ? '#999999' : '#666666';

  return (
    <View className="flex-row items-center bg-platinum-700 dark:bg-black-600 rounded-xl px-3 py-2.5">
      <Search size={18} color={iconColor} />
      <TextInput
        className="flex-1 mx-2 text-black dark:text-platinum text-base"
        placeholder={placeholder}
        placeholderTextColor={iconColor}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={16} color={iconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}
