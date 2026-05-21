import { View, Text, TextInput } from 'react-native';
import type { TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({ label, error, leftIcon, rightIcon, className, ...props }: InputProps) {
  return (
    <View className={className}>
      {label && (
        <Text className="text-xs font-medium text-black-700 dark:text-black-900 mb-1.5 uppercase tracking-wide">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center bg-platinum-700 dark:bg-black-500 rounded-xl px-4 ${
          error ? 'border border-flag_red' : ''
        }`}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className="flex-1 py-3 text-black dark:text-platinum text-base"
          placeholderTextColor="#999999"
          {...props}
        />
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error && (
        <Text className="text-xs text-flag_red mt-1">{error}</Text>
      )}
    </View>
  );
}
