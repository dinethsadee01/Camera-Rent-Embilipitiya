import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export function Skeleton({ width, height = 16, rounded = 'md', className }: SkeletonProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.3, { duration: 800 }), -1, true);
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const roundedClass = {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  }[rounded];

  return (
    <Animated.View
      style={[style, { height, width: width as number }]}
      className={`bg-platinum-500 dark:bg-black-600 ${roundedClass} ${className ?? ''}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <View className="bg-white dark:bg-black-600 rounded-2xl p-4 mb-3">
      <View className="flex-row items-center justify-between mb-3">
        <Skeleton width={80} height={14} />
        <Skeleton width={60} height={22} rounded="full" />
      </View>
      <Skeleton width="90%" height={18} className="mb-2" />
      <Skeleton width="60%" height={14} />
    </View>
  );
}
