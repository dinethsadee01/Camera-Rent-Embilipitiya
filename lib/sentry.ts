import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

// No-ops until EXPO_PUBLIC_SENTRY_DSN is set (see .env.local) — the app
// works fine without it, it just won't report crashes anywhere.
if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
  });
}

export { Sentry };
