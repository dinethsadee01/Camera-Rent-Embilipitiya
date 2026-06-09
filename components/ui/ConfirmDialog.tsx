import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { AlertTriangle, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface DialogConfig {
  title: string;
  message: string;
  confirmLabel: string;
  destructive: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

// Global singleton setter — populated when GlobalConfirmDialogProvider mounts
let _show: (config: DialogConfig) => void = () => {};

export function confirmAction(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void,
  onCancel?: () => void,
) {
  _show({ title, message, confirmLabel, destructive: false, onConfirm, onCancel });
}

export function confirmDelete(itemName: string, onConfirm: () => void) {
  _show({
    title: `Delete ${itemName}`,
    message: 'This action cannot be undone. Are you sure?',
    confirmLabel: 'Delete',
    destructive: true,
    onConfirm,
  });
}

export function GlobalConfirmDialogProvider() {
  const { isDark } = useTheme();
  const [config, setConfig] = useState<DialogConfig | null>(null);

  _show = (c) => setConfig(c);

  const bg = isDark ? '#1a1a1a' : '#ffffff';
  const border = isDark ? '#2a2a2a' : '#eeeeee';
  const text = isDark ? '#eeeeee' : '#1a1a1a';
  const sub = isDark ? '#888888' : '#666666';
  const surface = isDark ? '#2a2a2a' : '#f4f4f4';

  function handleConfirm() {
    const cb = config?.onConfirm;
    setConfig(null);
    cb?.();
  }

  function handleCancel() {
    const cb = config?.onCancel;
    setConfig(null);
    cb?.();
  }

  if (!config) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: bg, borderRadius: 20, overflow: 'hidden', padding: 24 }}>
          {/* Icon */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: config.destructive ? '#fee2e2' : (isDark ? '#2a1a10' : '#fff7ed'),
              alignItems: 'center', justifyContent: 'center',
            }}>
              {config.destructive
                ? <Trash2 size={24} color="#d61e30" />
                : <AlertTriangle size={24} color="#d97706" />}
            </View>
          </View>

          {/* Text */}
          <Text style={{ fontSize: 17, fontWeight: '700', color: text, textAlign: 'center', marginBottom: 8 }}>
            {config.title}
          </Text>
          <Text style={{ fontSize: 13, color: sub, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
            {config.message}
          </Text>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={{ flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: surface, alignItems: 'center' }}
              onPress={handleCancel}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: sub }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center',
                backgroundColor: config.destructive ? '#d61e30' : '#1a1a1a',
              }}
              onPress={handleConfirm}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff' }}>
                {config.confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
