import { TouchableOpacity } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { isDark, toggleColorScheme } = useTheme();
  return (
    <TouchableOpacity
      onPress={toggleColorScheme}
      className="w-9 h-9 rounded-xl bg-platinum-700 dark:bg-black-600 items-center justify-center"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {isDark ? <Sun size={18} color="#eeeeee" /> : <Moon size={18} color="#333333" />}
    </TouchableOpacity>
  );
}
