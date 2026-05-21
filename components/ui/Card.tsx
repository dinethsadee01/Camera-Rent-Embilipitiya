import { View } from 'react-native';
import type { ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: boolean;
}

export function Card({ children, padding = true, className, ...props }: CardProps) {
  return (
    <View
      className={`bg-white dark:bg-black-600 rounded-2xl shadow-sm ${padding ? 'p-4' : ''} ${className ?? ''}`}
      {...props}
    >
      {children}
    </View>
  );
}
