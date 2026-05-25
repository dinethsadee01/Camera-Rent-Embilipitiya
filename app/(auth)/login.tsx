import { useState, useEffect, useRef } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fingerprint } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import {
  loginWithCredentials,
  isBiometricsAvailable,
  authenticateWithBiometrics,
  getBiometricsEnabled,
  getSession,
} from "@/lib/auth";
import { useTheme } from "@/hooks/useTheme";

export default function LoginScreen() {
  const { setUser } = useAuth();
  const { isDark } = useTheme();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    checkBiometricResume();
  }, []);

  async function checkBiometricResume() {
    const session = await getSession();
    const bioEnabled = await getBiometricsEnabled();
    const bioAvailable = await isBiometricsAvailable();

    if (bioEnabled && bioAvailable) {
      // Biometrics is the primary login method — show it and auto-trigger
      setShowBiometric(true);
      setShowCredentials(false);
      if (session) {
        // Auto-trigger on launch when session exists
        triggerBiometric(session);
      }
      return;
    }

    if (session && !bioEnabled) {
      // No biometrics configured — auto-login from session
      await setUser(session);
      return;
    }

    // No session or biometrics not set up — show credentials
    setShowCredentials(true);
  }

  async function triggerBiometric(
    sessionUser?: Awaited<ReturnType<typeof getSession>>,
  ) {
    setBioLoading(true);
    try {
      const success = await authenticateWithBiometrics();
      if (success) {
        const s = sessionUser ?? (await getSession());
        if (s) {
          await setUser(s);
        } else {
          // No stored session — biometrics passed but no account found
          Alert.alert(
            "No account found",
            "Please sign in with your email and password first.",
          );
          setShowCredentials(true);
        }
      }
    } catch {
      // cancelled
    } finally {
      setBioLoading(false);
    }
  }

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const user = await loginWithCredentials(email.trim(), password);
      if (!user) {
        Alert.alert("Login failed", "Incorrect email or password.");
        return;
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Logo */}
        <View className="items-center mb-10">
          <Image
            source={
              isDark
                ? require("@/assets/Logo-white.png")
                : require("@/assets/Logo-black.png")
            }
            style={{ width: 320, height: 210 }}
            resizeMode="contain"
          />
        </View>

        {/* Card */}
        <View className="bg-white dark:bg-black-600 rounded-2xl p-6 shadow-sm">
          <Text className="text-base font-semibold text-black dark:text-platinum mb-5">
            Sign in to continue
          </Text>

          {/* Biometric primary option */}
          {showBiometric && (
            <TouchableOpacity
              className="border-2 border-flag_red rounded-xl py-4 items-center mb-4"
              onPress={() => triggerBiometric()}
              disabled={bioLoading}
              activeOpacity={0.85}
            >
              {bioLoading ? (
                <ActivityIndicator color="#d61e30" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Fingerprint size={22} color="#d61e30" />
                  <Text className="text-flag_red font-semibold text-base">
                    Sign in with Biometrics
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Toggle to show/hide credentials */}
          {showBiometric && !showCredentials && (
            <TouchableOpacity
              className="items-center py-2 mb-1"
              onPress={() => setShowCredentials(true)}
            >
              <Text className="text-xs text-black-800 dark:text-black-800">
                Use email & password instead
              </Text>
            </TouchableOpacity>
          )}

          {/* OR divider */}
          {showBiometric && showCredentials && (
            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-platinum-600 dark:bg-black-500" />
              <Text className="mx-3 text-xs text-black-800 dark:text-black-800">
                or
              </Text>
              <View className="flex-1 h-px bg-platinum-600 dark:bg-black-500" />
            </View>
          )}

          {/* Credentials form */}
          {showCredentials && (
            <>
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
                  textContentType="emailAddress"
                  autoComplete="email"
                  importantForAutofill="yes"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>

              <View className="mb-5">
                <Text className="text-xs font-medium text-black-700 dark:text-black-900 mb-1.5 uppercase tracking-wide">
                  Password
                </Text>
                <TextInput
                  ref={passwordRef}
                  className="bg-platinum-700 dark:bg-black-500 rounded-xl px-4 py-3 text-black dark:text-platinum text-base"
                  placeholder="Enter password"
                  placeholderTextColor="#999999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  returnKeyType="done"
                  textContentType="password"
                  autoComplete="current-password"
                  importantForAutofill="yes"
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
                  <Text className="text-white font-semibold text-base">
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text className="text-center text-xs text-black-800 dark:text-black-800 mt-6">
          Camera Rent Embilipitiya
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
