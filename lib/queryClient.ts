import { QueryClient, onlineManager, focusManager, defaultShouldDehydrateQuery, type Query } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AppState, type AppStateStatus, Platform } from 'react-native';

// TanStack Query's default online/focus detection relies on browser APIs
// (`navigator.onLine`, `window` focus events) that don't exist in React
// Native — without wiring these manually, refetchOnReconnect and
// refetchOnMount-after-background silently never fire.
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

export function setupFocusManager(): () => void {
  const subscription = AppState.addEventListener('change', onAppStateChange);
  return () => subscription.remove();
}

const PERSIST_MAX_AGE = 24 * 60 * 60 * 1000; // 24h

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30 * 1000,
      // Must stay >= PERSIST_MAX_AGE, otherwise TanStack GCs cached entries
      // from memory before the persister ever gets a chance to write them.
      gcTime: PERSIST_MAX_AGE,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'camerarent-query-cache',
});

export const persistOptions = {
  persister: asyncStoragePersister,
  maxAge: PERSIST_MAX_AGE,
  dehydrateOptions: {
    shouldDehydrateQuery: (query: Query) => {
      // Customer records carry NIC numbers — keep that out of unencrypted
      // on-device storage. Signed photo URLs are inherently short-lived and
      // not worth persisting either. Bookings/items/insights are fine to
      // cache for instant, offline-first reads at the counter.
      const isCustomers = query.queryKey[0] === 'customers';
      const isSignedPhotoUrl = query.queryKey[0] === 'signed-photo-url';
      return !isCustomers && !isSignedPhotoUrl && defaultShouldDehydrateQuery(query);
    },
  },
};
