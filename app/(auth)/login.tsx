import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import {
  loginWithCredentials,
  isBiometricsAvailable,
  authenticateWithBiometrics,
  getSession,
} from '@/lib/auth';
import { useTheme } from '@/hooks/useTheme';

export default function LoginScreen() {
  const { setUser } = useAuth();
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);

  useEffect(() => {
    checkBiometricResume();
  }, []);

  async function checkBiometricResume() {
    const session = await getSession();
    if (!session) return;
    const available = await isBiometricsAvailable();
    if (available) {
      setShowBiometric(true);
      triggerBiometric(session);
    } else {
      await setUser(session);
    }
  }

  async function triggerBiometric(sessionUser?: Awaited<ReturnType<typeof getSession>>) {
    setBioLoading(true);
    try {
      const success = await authenticateWithBiometrics();
      if (success) {
        const s = sessionUser ?? (await getSession());
        if (s) await setUser(s);
      }
    } catch {
      // user cancelled
    } finally {
      setBioLoading(false);
    }
  }

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const user = await loginWithCredentials(email.trim(), password);
      if (!user) {
        Alert.alert('Login failed', 'Incorrect email or password.');
        return;
      }
      const available = await isBiometricsAvailable();
      if (available) {
        const ok = await authenticateWithBiometrics();
        if (!ok) return;
      }
      await setUser(user);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-platinum-700 dark:bg-black">
      <KeyboardAvoidingView
        className="flex-1 justify-center px-6"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Logo */}
        <View className="items-center mb-10">
          <Image
            source={isDark
              ? require('@/assets/Logo-white.png')
              : require('@/assets/Logo-black.png')
            }
            style={{ width: 220, height: 110 }}
            resizeMode="contain"
          />
        </View>

        {/* Card */}
        <View className="bg-white dark:bg-black-600 rounded-2xl p-6 shadow-sm">
          <Text className="text-base font-semibold text-black dark:text-platinum mb-5">
            Sign in to continue
          </Text>

          <View className="mb-4">
            <Text className="text-xs font-medium text-black-700 dark:text-black-900 mb-1.5 uppercase tracking-wide">
              Email
            </Text>
            <TextInput
              className="bg-platinum-700 dark:bg-black-500 rounded-xl px-4 py-3 text-black dark:text-platinum text-base"
              placeholder="Enter email"
              placeholderTextColor="#999999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>

          <View className="mb-6">
            <Text className="text-xs font-medium text-black-700 dark:text-black-900 mb-1.5 uppercase tracking-wide">
              Password
            </Text>
            <TextInput
              className="bg-platinum-700 dark:bg-black-500 rounded-xl px-4 py-3 text-black dark:text-platinum text-base"
              placeholder="Enter password"
              placeholderTextColor="#999999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          <TouchableOpacity
            className="bg-flag_red rounded-xl py-3.5 items-center"
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold text-base">Sign In</Text>
            )}
          </TouchableOpacity>

          {showBiometric && (
            <TouchableOpacity
              className="mt-3 py-3 items-center"
              onPress={() => triggerBiometric()}
              disabled={bioLoading}
            >
              {bioLoading ? (
                <ActivityIndicator color="#d61e30" />
              ) : (
                <Text className="text-flag_red font-medium text-sm">
                  Use Biometrics
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-center text-xs text-black-800 dark:text-black-800 mt-6">
          Camera Rent Embilipitiya
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
