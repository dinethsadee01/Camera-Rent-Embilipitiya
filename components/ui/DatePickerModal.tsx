import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { X } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { format } from 'date-fns';

interface DatePickerModalProps {
  visible: boolean;
  value: Date;
  minimumDate?: Date;
  title: string;
  onConfirm: (date: Date) => void;
  onDismiss: () => void;
}

export function DatePickerModal({ visible, value, minimumDate, title, onConfirm, onDismiss }: DatePickerModalProps) {
  const { isDark } = useTheme();
  const [selected, setSelected] = useState(format(value, 'yyyy-MM-dd'));

  useEffect(() => {
    if (visible) setSelected(format(value, 'yyyy-MM-dd'));
  }, [visible, value]);

  const minDateStr = minimumDate ? format(minimumDate, 'yyyy-MM-dd') : undefined;
  const bg = isDark ? '#1a1a1a' : '#ffffff';
  const surface = isDark ? '#2a2a2a' : '#f4f4f4';
  const border = isDark ? '#2a2a2a' : '#eeeeee';
  const text = isDark ? '#eeeeee' : '#1a1a1a';
  const muted = isDark ? '#888888' : '#999999';

  function handleConfirm() {
    const [y, m, d] = selected.split('-').map(Number);
    onConfirm(new Date(y, m - 1, d));
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 20 }}>
        <View style={{ backgroundColor: bg, borderRadius: 20, overflow: 'hidden' }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: border }}>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: text }}>{title}</Text>
            <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={muted} />
            </TouchableOpacity>
          </View>

          {/* Calendar */}
          <Calendar
            current={selected}
            minDate={minDateStr}
            onDayPress={(day) => setSelected(day.dateString)}
            markedDates={{ [selected]: { selected: true, selectedColor: '#d61e30', selectedTextColor: '#ffffff' } }}
            enableSwipeMonths
            theme={{
              backgroundColor: bg,
              calendarBackground: bg,
              textSectionTitleColor: '#d61e30',
              selectedDayBackgroundColor: '#d61e30',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#d61e30',
              todayBackgroundColor: isDark ? '#2a1010' : '#fff0f0',
              dayTextColor: text,
              textDisabledColor: isDark ? '#444444' : '#cccccc',
              dotColor: '#d61e30',
              monthTextColor: text,
              arrowColor: '#d61e30',
              textDayFontSize: 13,
              textMonthFontSize: 14,
              textDayHeaderFontSize: 11,
              textDayFontWeight: '400',
              textMonthFontWeight: '700',
            }}
          />

          {/* Footer */}
          <View style={{ flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: border }}>
            <TouchableOpacity
              style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: surface, alignItems: 'center' }}
              onPress={onDismiss}
            >
              <Text style={{ color: muted, fontSize: 14, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#d61e30', alignItems: 'center' }}
              onPress={handleConfirm}
            >
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
