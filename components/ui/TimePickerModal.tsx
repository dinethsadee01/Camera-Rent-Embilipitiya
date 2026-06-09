import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Modal, ScrollView,
  type NativeSyntheticEvent, type NativeScrollEvent,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

const ITEM_H = 48;
const VISIBLE = 5; // must be odd
const PAD = ITEM_H * Math.floor(VISIBLE / 2);
const PICKER_H = ITEM_H * VISIBLE;

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function pad2(n: number) { return String(n).padStart(2, '0'); }

function parseValue(v: string): [number, number] {
  if (!v) return [9, 0];
  const [hStr, mStr] = v.split(':');
  const h = parseInt(hStr ?? '0', 10);
  const m = parseInt(mStr ?? '0', 10);
  return [
    isNaN(h) ? 0 : Math.min(23, Math.max(0, h)),
    isNaN(m) ? 0 : Math.min(59, Math.max(0, m)),
  ];
}

// ── Drum roll column ──────────────────────────────────────────
interface DrumProps {
  data: number[];
  selected: number;
  onSelect: (v: number) => void;
  scrollKey: number; // increment to force re-scroll on open
  isDark: boolean;
}

function Drum({ data, selected, onSelect, scrollKey, isDark }: DrumProps) {
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollTo({ y: selected * ITEM_H, animated: false });
    }, 60);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollKey]); // re-run every time the modal opens (scrollKey bumps)

  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    onSelect(Math.max(0, Math.min(data.length - 1, idx)));
  }

  return (
    <View style={{ width: 76, height: PICKER_H }}>
      {/* Centre-selection highlight band */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0, right: 0,
          top: PAD,
          height: ITEM_H,
          borderTopWidth: 1.5,
          borderBottomWidth: 1.5,
          borderColor: '#d61e30',
        }}
      />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: PAD }}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
      >
        {data.map((v) => {
          const active = v === selected;
          return (
            <TouchableOpacity
              key={v}
              activeOpacity={0.6}
              style={{ height: ITEM_H, alignItems: 'center', justifyContent: 'center' }}
              onPress={() => {
                onSelect(v);
                ref.current?.scrollTo({ y: v * ITEM_H, animated: true });
              }}
            >
              <Text style={{
                fontSize: active ? 24 : 17,
                fontWeight: active ? '700' : '400',
                color: active ? '#d61e30' : (isDark ? '#555555' : '#cccccc'),
              }}>
                {pad2(v)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ── Public component ──────────────────────────────────────────
interface TimePickerModalProps {
  visible: boolean;
  value: string; // "HH:MM" or ""
  title: string;
  onConfirm: (time: string) => void; // "" means cleared
  onDismiss: () => void;
}

export function TimePickerModal({ visible, value, title, onConfirm, onDismiss }: TimePickerModalProps) {
  const { isDark } = useTheme();
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [scrollKey, setScrollKey] = useState(0);

  useEffect(() => {
    if (visible) {
      const [h, m] = parseValue(value);
      setHour(h);
      setMinute(m);
      setScrollKey((k) => k + 1); // triggers Drum useEffect to scroll
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const bg = isDark ? '#1a1a1a' : '#ffffff';
  const surface = isDark ? '#2a2a2a' : '#f4f4f4';
  const border = isDark ? '#2a2a2a' : '#eeeeee';
  const textColor = isDark ? '#eeeeee' : '#1a1a1a';
  const mutedColor = isDark ? '#888888' : '#999999';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 20 }}>
        <View style={{ backgroundColor: bg, borderRadius: 20, overflow: 'hidden' }}>

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: border }}>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: textColor }}>{title}</Text>
            <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={mutedColor} />
            </TouchableOpacity>
          </View>

          {/* Drum pickers */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
            <Drum data={HOURS} selected={hour} onSelect={setHour} scrollKey={scrollKey} isDark={isDark} />
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#d61e30', paddingHorizontal: 6, marginBottom: 4 }}>:</Text>
            <Drum data={MINUTES} selected={minute} onSelect={setMinute} scrollKey={scrollKey} isDark={isDark} />
          </View>

          {/* Selected time preview */}
          <Text style={{ textAlign: 'center', fontSize: 13, color: mutedColor, marginBottom: 8 }}>
            {pad2(hour)}:{pad2(minute)}
          </Text>

          {/* Footer */}
          <View style={{ flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: border }}>
            {value ? (
              <TouchableOpacity
                style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: surface, alignItems: 'center' }}
                onPress={() => { onConfirm(''); onDismiss(); }}
              >
                <Text style={{ color: mutedColor, fontSize: 14, fontWeight: '600' }}>Clear</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: surface, alignItems: 'center' }}
              onPress={onDismiss}
            >
              <Text style={{ color: mutedColor, fontSize: 14, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#d61e30', alignItems: 'center' }}
              onPress={() => onConfirm(`${pad2(hour)}:${pad2(minute)}`)}
            >
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>Confirm</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}
