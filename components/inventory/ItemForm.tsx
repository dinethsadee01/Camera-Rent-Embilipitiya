import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FilterChips } from '@/components/ui/FilterChip';
import type { Item, ItemCategory } from '@/lib/types';

const CATEGORIES: { key: ItemCategory; label: string }[] = [
  { key: 'camera', label: 'Camera' },
  { key: 'lens', label: 'Lens' },
  { key: 'drone', label: 'Drone' },
  { key: 'stabilizer', label: 'Stabilizer' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'support', label: 'Support' },
  { key: 'accessory', label: 'Accessory' },
  { key: 'other', label: 'Other' },
];

interface ItemFormProps {
  initial?: Partial<Item>;
  onSubmit: (data: Omit<Item, 'id' | 'sku' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function ItemForm({ initial, onSubmit, onCancel, submitLabel = 'Add Item' }: ItemFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState<ItemCategory>(initial?.category ?? 'camera');
  const [dailyRate, setDailyRate] = useState(initial?.daily_rate?.toString() ?? '');
  const [quantity, setQuantity] = useState(initial?.quantity?.toString() ?? '1');
  const [serialNumber, setSerialNumber] = useState(initial?.serial_number ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) { Alert.alert('Required', 'Item name is required.'); return; }
    const rate = parseFloat(dailyRate);
    if (isNaN(rate) || rate < 0) { Alert.alert('Invalid', 'Enter a valid daily rate.'); return; }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) { Alert.alert('Invalid', 'Quantity must be at least 1.'); return; }

    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), category, daily_rate: rate, quantity: qty, serial_number: serialNumber.trim() || null, notes: notes.trim() || null });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Input label="Item Name" value={name} onChangeText={setName} placeholder="e.g. Sony A7 III" className="mb-4" />

      <Text className="text-xs font-medium text-black-700 dark:text-black-900 mb-2 uppercase tracking-wide">Category</Text>
      <FilterChips chips={CATEGORIES} selected={category} onSelect={(k) => setCategory(k as ItemCategory)} />

      <View className="flex-row gap-3 mt-4 mb-4">
        <Input
          label="Daily Rate (Rs.)"
          value={dailyRate}
          onChangeText={setDailyRate}
          keyboardType="decimal-pad"
          placeholder="0.00"
          className="flex-1"
        />
        <Input
          label="Quantity"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="number-pad"
          placeholder="1"
          className="flex-1"
        />
      </View>

      <Input
        label="Serial Number (optional)"
        value={serialNumber}
        onChangeText={setSerialNumber}
        placeholder="e.g. SN-123456"
        className="mb-4"
      />

      <Input
        label="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="Any additional info..."
        multiline
        numberOfLines={3}
        className="mb-6"
      />

      <View className="flex-row gap-3">
        {initial ? (
          <Button variant="outline" onPress={onCancel} className="flex-1">Cancel</Button>
        ) : (
          <Button variant="outline" onPress={() => {
            setName('');
            setCategory('camera');
            setDailyRate('');
            setQuantity('1');
            setSerialNumber('');
            setNotes('');
          }} className="flex-1">Reset</Button>
        )}
        <Button onPress={handleSubmit} loading={loading} className="flex-1">{submitLabel}</Button>
      </View>
    </ScrollView>
  );
}
