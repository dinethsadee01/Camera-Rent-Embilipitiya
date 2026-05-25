import { useEffect, useCallback } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, BackHandler, Alert, type ColorValue } from 'react-native';
import {
  PlusCircle,
  Package,
  Users,
  CalendarDays,
  CalendarCheck2,
  BarChart3,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

function TabIcon({
  icon: Icon,
  label,
  focused,
  color,
  size,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  focused: boolean;
  color: ColorValue;
  size: number;
}) {
  return (
    <View className="items-center justify-center" style={{ paddingTop: focused ? 2 : 6 }}>
      <Icon size={size} color={color as string} />
      {focused && (
        <Text style={{ color: color as string, fontSize: 10, marginTop: 2, fontWeight: '600' }}>
          {label}
        </Text>
      )}
    </View>
  );
}

export default function TabsLayout() {
  const { isDark } = useTheme();

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() },
        ]
      );
      return true;
    });
    return () => handler.remove();
  }, []);

  const activeColor = '#d61e30';
  const inactiveColor = isDark ? '#666666' : '#999999';
  const bgColor = isDark ? '#000000' : '#ffffff';
  const borderColor = isDark ? '#333333' : '#eeeeee';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: bgColor,
          borderTopColor: borderColor,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="inventory"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon icon={Package} label="Inventory" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon icon={Users} label="Customers" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon icon={PlusCircle} label="Add New" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon icon={CalendarDays} label="Bookings" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="availability"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon icon={CalendarCheck2} label="Availability" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon icon={BarChart3} label="Insights" focused={focused} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
