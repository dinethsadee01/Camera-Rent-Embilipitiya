import '../global.css';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { requestNotificationPermissions, reconcileBookingNotifications } from '@/lib/notifications';
import { GlobalConfirmDialogProvider } from '@/components/ui/ConfirmDialog';
import { queryClient, persistOptions, setupFocusManager } from '@/lib/queryClient';
import { Sentry } from '@/lib/sentry';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const { isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(isDark ? '#000000' : '#f4f4f4');
  }, [isDark]);

  useEffect(() => {
    if (isLoading) return;
    SplashScreen.hideAsync();
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) {
      router.replace('/(auth)/login');
    } else if (user && inAuth) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

function RootLayout() {
  useEffect(() => {
    requestNotificationPermissions().then(() => reconcileBookingNotifications());
    return setupFocusManager();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <AuthProvider>
          <StatusBar style="auto" />
          <RootLayoutNav />
          <GlobalConfirmDialogProvider />
        </AuthProvider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
