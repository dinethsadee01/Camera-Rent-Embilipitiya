import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { AppUser } from './types';

const BIOMETRICS_ENABLED_KEY = 'cr_biometrics_enabled';

export function supabaseUserToAppUser(user: User): AppUser {
  return {
    id: user.id,
    name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User',
    role: user.user_metadata?.role ?? 'manager',
    email: user.email ?? '',
  };
}

export async function loginWithCredentials(
  email: string,
  password: string
): Promise<AppUser | null> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return null;
  return supabaseUserToAppUser(data.user);
}

export async function getSession(): Promise<AppUser | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  return supabaseUserToAppUser(session.user);
}

export async function clearSession(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getBiometricsEnabled(): Promise<boolean> {
  try {
    const raw = await SecureStore.getItemAsync(BIOMETRICS_ENABLED_KEY);
    return raw === 'true';
  } catch {
    return false;
  }
}

export async function setBiometricsEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(BIOMETRICS_ENABLED_KEY, enabled ? 'true' : 'false');
}

export async function isBiometricsAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

export async function authenticateWithBiometrics(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Confirm your identity',
    fallbackLabel: 'Use password',
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });
  return result.success;
}
