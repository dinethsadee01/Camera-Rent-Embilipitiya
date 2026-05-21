import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import type { TouchableOpacityProps } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-flag_red',
    text: 'text-white font-semibold',
  },
  secondary: {
    container: 'bg-platinum-700 dark:bg-black-600',
    text: 'text-black dark:text-platinum font-medium',
  },
  ghost: {
    container: 'bg-transparent',
    text: 'text-flag_red font-medium',
  },
  destructive: {
    container: 'bg-flag_red-400',
    text: 'text-white font-semibold',
  },
  outline: {
    container: 'bg-transparent border border-platinum-400 dark:border-black-600',
    text: 'text-black dark:text-platinum font-medium',
  },
};

const sizeClasses: Record<Size, { container: string; text: string }> = {
  sm: { container: 'px-3 py-2 rounded-lg', text: 'text-sm' },
  md: { container: 'px-4 py-3 rounded-xl', text: 'text-base' },
  lg: { container: 'px-5 py-3.5 rounded-xl', text: 'text-base' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const vc = variantClasses[variant];
  const sc = sizeClasses[size];
  const opacity = disabled || loading ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center ${vc.container} ${sc.container} ${opacity} ${className ?? ''}`}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'destructive' ? '#ffffff' : '#d61e30'}
        />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`${vc.text} ${sc.text}`}>{children}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
