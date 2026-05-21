import { useColorScheme } from 'nativewind';

export function useTheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  return { colorScheme, isDark, setColorScheme, toggleColorScheme };
}
