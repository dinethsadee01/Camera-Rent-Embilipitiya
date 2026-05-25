import { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, LogOut, Settings, X } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import {
  getBiometricsEnabled,
  setBiometricsEnabled,
  isBiometricsAvailable,
  authenticateWithBiometrics,
} from '@/lib/auth';

export function AppMenu() {
  const { signOut } = useAuth();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);

  useEffect(() => {
    if (settingsOpen) loadBioSettings();
  }, [settingsOpen]);

  async function loadBioSettings() {
    const [enabled, available] = await Promise.all([
      getBiometricsEnabled(),
      isBiometricsAvailable(),
    ]);
    setBioEnabled(enabled);
    setBioAvailable(available);
  }

  function handleSignOut() {
    setMenuOpen(false);
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  }

  async function handleBioToggle(value: boolean) {
    const ok = await authenticateWithBiometrics();
    if (!ok) return;
    await setBiometricsEnabled(value);
    setBioEnabled(value);
  }

  const iconColor = isDark ? '#eeeeee' : '#333333';
  const dropdownTop = insets.top + 52;

  return (
    <>
      <TouchableOpacity
        onPress={() => setMenuOpen(true)}
        className="w-9 h-9 bg-platinum-600 dark:bg-black-600 rounded-xl items-center justify-center"
      >
        <Menu size={18} color={iconColor} />
      </TouchableOpacity>

      {/* Dropdown menu */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
        >
          <View
            style={{
              position: 'absolute',
              top: dropdownTop,
              right: 16,
              elevation: 12,
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              width: 192,
            }}
            className="bg-white dark:bg-black-600 rounded-2xl overflow-hidden"
          >
            <TouchableOpacity
              className="flex-row items-center px-4 py-3.5 border-b border-platinum-600 dark:border-black-500"
              onPress={() => {
                setMenuOpen(false);
                setTimeout(() => setSettingsOpen(true), 150);
              }}
            >
              <Settings size={16} color={iconColor} />
              <Text className="ml-3 text-sm text-black dark:text-platinum">Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center px-4 py-3.5"
              onPress={handleSignOut}
            >
              <LogOut size={16} color="#d61e30" />
              <Text className="ml-3 text-sm text-flag_red">Sign Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Settings bottom sheet */}
      <Modal
        visible={settingsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsOpen(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setSettingsOpen(false)}
          />
          <View className="bg-white dark:bg-black-600 rounded-t-3xl px-6 pt-5" style={{ paddingBottom: insets.bottom + 24 }}>
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-bold text-black dark:text-platinum">Settings</Text>
              <TouchableOpacity
                onPress={() => setSettingsOpen(false)}
                className="w-8 h-8 rounded-full bg-platinum-600 dark:bg-black-500 items-center justify-center"
              >
                <X size={16} color={iconColor} />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-between py-4 border-b border-platinum-600 dark:border-black-500">
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text className="text-sm font-medium text-black dark:text-platinum">Biometric Login</Text>
                <Text className="text-xs text-black-800 dark:text-black-800 mt-0.5">
                  {bioAvailable
                    ? 'Require fingerprint or face on each launch'
                    : 'No biometrics enrolled on this device'}
                </Text>
              </View>
              <Switch
                value={bioEnabled}
                onValueChange={bioAvailable ? handleBioToggle : undefined}
                disabled={!bioAvailable}
                trackColor={{ false: '#cccccc', true: '#d61e30' }}
                thumbColor="#ffffff"
              />
            </View>

            <Text className="text-xs text-black-800 dark:text-black-800 mt-5">
              Camera Rent Embilipitiya · v1.0.0
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}
