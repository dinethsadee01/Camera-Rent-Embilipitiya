import { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal,
  FlatList, Alert, TextInput,
} from 'react-native';
import { Search, Check, ChevronDown, CalendarDays } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FilterChips } from '@/components/ui/FilterChip';
import { formatCurrency, calculateTotalPrice, getRentalDays, toISODateString } from '@/lib/utils';
import { useItems } from '@/hooks/useInventory';
import { useCustomers } from '@/hooks/useCustomers';
import { useTheme } from '@/hooks/useTheme';
import type { Booking, PaymentMethod } from '@/lib/types';
import DateTimePicker from '@react-native-community/datetimepicker';

type BookingInput = Omit<Booking, 'id' | 'booking_code' | 'created_at' | 'updated_at'>;

interface BookingFormProps {
  onSubmit: (data: BookingInput) => Promise<void>;
  onCancel: () => void;
}

const PAYMENT_OPTIONS = [
  { key: 'paid', label: 'Paid Now' },
  { key: 'pending', label: 'Pay on Return' },
  { key: 'partial', label: 'Partial / Advance' },
];

const PAYMENT_METHODS: { key: PaymentMethod; label: string }[] = [
  { key: 'cash', label: 'Cash' },
  { key: 'bank_transfer', label: 'Bank Transfer' },
];

export function BookingForm({ onSubmit, onCancel }: BookingFormProps) {
  const { data: items } = useItems();
  const { data: customers } = useCustomers();
  const { isDark } = useTheme();

  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [itemId, setItemId] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemRate, setItemRate] = useState(0);
  const [quantity, setQuantity] = useState('1');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [dailyRateOverride, setDailyRateOverride] = useState('');
  const [paymentOption, setPaymentOption] = useState('pending');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');

  const effectiveDailyRate = dailyRateOverride ? parseFloat(dailyRateOverride) || 0 : itemRate;
  const qty = parseInt(quantity, 10) || 1;
  const startStr = toISODateString(startDate);
  const endStr = toISODateString(endDate);
  const totalPrice = calculateTotalPrice(effectiveDailyRate, startStr, endStr, qty);
  const days = getRentalDays(startStr, endStr);

  const filteredCustomers = useMemo(() =>
    (customers ?? []).filter((c) => {
      const q = customerSearch.toLowerCase();
      return !q || c.full_name.toLowerCase().includes(q) || c.phone.includes(q) || c.customer_code.toLowerCase().includes(q);
    }), [customers, customerSearch]);

  const filteredItems = useMemo(() =>
    (items ?? []).filter((i) => {
      const q = itemSearch.toLowerCase();
      return !q || i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q);
    }), [items, itemSearch]);

  async function handleSubmit() {
    if (!customerId) { Alert.alert('Required', 'Please select a customer.'); return; }
    if (!itemId) { Alert.alert('Required', 'Please select an item.'); return; }
    if (endDate < startDate) { Alert.alert('Invalid dates', 'End date must be on or after start date.'); return; }
    if (paymentOption === 'partial' && !advanceAmount) { Alert.alert('Required', 'Enter advance amount for partial payment.'); return; }

    setLoading(true);
    try {
      await onSubmit({
        customer_id: customerId,
        item_id: itemId,
        quantity: qty,
        start_date: startStr,
        end_date: endStr,
        daily_rate: effectiveDailyRate,
        total_price: totalPrice,
        status: 'upcoming',
        payment_status: paymentOption === 'paid' ? 'paid' : paymentOption === 'partial' ? 'partial' : 'pending',
        payment_method: paymentMethod,
        advance_amount: paymentOption === 'partial' ? parseFloat(advanceAmount) || 0 : 0,
        notes: notes.trim() || null,
      });
    } finally {
      setLoading(false);
    }
  }

  const iconColor = isDark ? '#999999' : '#666666';

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Customer selector */}
      <Text className="text-xs font-medium text-black-700 dark:text-black-900 mb-1.5 uppercase tracking-wide">Customer</Text>
      <TouchableOpacity
        onPress={() => setShowCustomerPicker(true)}
        className="flex-row items-center bg-platinum-700 dark:bg-black-500 rounded-xl px-4 py-3 mb-4"
      >
        <Text className={`flex-1 text-base ${customerId ? 'text-black dark:text-platinum' : 'text-black-800 dark:text-black-800'}`}>
          {customerId ? `${customerName}` : 'Select customer...'}
        </Text>
        <ChevronDown size={16} color={iconColor} />
      </TouchableOpacity>

      {/* Item selector */}
      <Text className="text-xs font-medium text-black-700 dark:text-black-900 mb-1.5 uppercase tracking-wide">Item</Text>
      <TouchableOpacity
        onPress={() => setShowItemPicker(true)}
        className="flex-row items-center bg-platinum-700 dark:bg-black-500 rounded-xl px-4 py-3 mb-4"
      >
        <Text className={`flex-1 text-base ${itemId ? 'text-black dark:text-platinum' : 'text-black-800 dark:text-black-800'}`}>
          {itemId ? itemName : 'Select item...'}
        </Text>
        <ChevronDown size={16} color={iconColor} />
      </TouchableOpacity>

      {/* Quantity */}
      <Input label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="number-pad" placeholder="1" className="mb-4" />

      {/* Date Range */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <Text className="text-xs font-medium text-black-700 dark:text-black-900 mb-1.5 uppercase tracking-wide">Start Date</Text>
          <TouchableOpacity
            onPress={() => setShowStartDate(true)}
            className="flex-row items-center bg-platinum-700 dark:bg-black-500 rounded-xl px-4 py-3"
          >
            <CalendarDays size={15} color={iconColor} />
            <Text className="ml-2 text-base text-black dark:text-platinum">
              {startDate.toLocaleDateString('en-GB')}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-1">
          <Text className="text-xs font-medium text-black-700 dark:text-black-900 mb-1.5 uppercase tracking-wide">End Date</Text>
          <TouchableOpacity
            onPress={() => setShowEndDate(true)}
            className="flex-row items-center bg-platinum-700 dark:bg-black-500 rounded-xl px-4 py-3"
          >
            <CalendarDays size={15} color={iconColor} />
            <Text className="ml-2 text-base text-black dark:text-platinum">
              {endDate.toLocaleDateString('en-GB')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showStartDate && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(_, d) => { setShowStartDate(false); if (d) { setStartDate(d); if (d > endDate) setEndDate(d); } }}
        />
      )}
      {showEndDate && (
        <DateTimePicker
          value={endDate}
          mode="date"
          minimumDate={startDate}
          display="default"
          onChange={(_, d) => { setShowEndDate(false); if (d) setEndDate(d); }}
        />
      )}

      {/* Rate & Total */}
      <View className="flex-row gap-3 mb-1">
        <Input
          label="Daily Rate (Rs.)"
          value={dailyRateOverride || (itemRate > 0 ? String(itemRate) : '')}
          onChangeText={setDailyRateOverride}
          keyboardType="decimal-pad"
          placeholder={itemRate > 0 ? String(itemRate) : '0.00'}
          className="flex-1"
        />
        <View className="flex-1">
          <Text className="text-xs font-medium text-black-700 dark:text-black-900 mb-1.5 uppercase tracking-wide">Total</Text>
          <View className="bg-platinum-700 dark:bg-black-500 rounded-xl px-4 py-3">
            <Text className="text-base font-bold text-flag_red">{formatCurrency(totalPrice)}</Text>
          </View>
        </View>
      </View>
      {days > 0 && itemId && (
        <Text className="text-xs text-black-800 dark:text-black-800 mb-4">
          {days} day{days !== 1 ? 's' : ''} × {qty} unit{qty !== 1 ? 's' : ''} × {formatCurrency(effectiveDailyRate)}/day
        </Text>
      )}

      {/* Payment option */}
      <Text className="text-xs font-medium text-black-700 dark:text-black-900 mb-2 uppercase tracking-wide">Payment</Text>
      <FilterChips chips={PAYMENT_OPTIONS} selected={paymentOption} onSelect={setPaymentOption} />

      {paymentOption === 'partial' && (
        <Input
          label="Advance Amount (Rs.)"
          value={advanceAmount}
          onChangeText={setAdvanceAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          className="mt-4"
        />
      )}

      {/* Payment method */}
      <View className="flex-row gap-2 mt-4">
        {PAYMENT_METHODS.map((m) => (
          <TouchableOpacity
            key={m.key}
            onPress={() => setPaymentMethod(m.key)}
            className={`flex-1 py-2.5 rounded-xl border items-center ${
              paymentMethod === m.key
                ? 'bg-flag_red border-flag_red'
                : 'bg-transparent border-platinum-400 dark:border-black-600'
            }`}
          >
            <Text className={`text-sm font-medium ${paymentMethod === m.key ? 'text-white' : 'text-black-700 dark:text-black-900'}`}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notes */}
      <Input
        label="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="Any additional information..."
        multiline
        numberOfLines={2}
        className="mt-4 mb-6"
      />

      <View className="flex-row gap-3">
        <Button variant="outline" onPress={onCancel} className="flex-1">Cancel</Button>
        <Button onPress={handleSubmit} loading={loading} className="flex-1">Create Booking</Button>
      </View>

      {/* Customer Picker Modal */}
      <Modal visible={showCustomerPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowCustomerPicker(false)}>
        <View className="flex-1 bg-platinum-700 dark:bg-black px-5 pt-6">
          <Text className="text-lg font-bold text-black dark:text-platinum mb-4">Select Customer</Text>
          <View className="flex-row items-center bg-white dark:bg-black-600 rounded-xl px-3 py-2.5 mb-3">
            <Search size={16} color={iconColor} />
            <TextInput
              className="flex-1 ml-2 text-base text-black dark:text-platinum"
              placeholder="Search..."
              placeholderTextColor={iconColor}
              value={customerSearch}
              onChangeText={setCustomerSearch}
            />
          </View>
          <FlatList
            data={filteredCustomers}
            keyExtractor={(c) => c.id}
            renderItem={({ item: c }) => (
              <TouchableOpacity
                onPress={() => { setCustomerId(c.id); setCustomerName(c.full_name); setShowCustomerPicker(false); setCustomerSearch(''); }}
                className="flex-row items-center py-3 border-b border-platinum-600 dark:border-black-500"
              >
                <View className="flex-1">
                  <Text className="text-base text-black dark:text-platinum">{c.full_name}</Text>
                  <Text className="text-xs text-black-800 dark:text-black-800">{c.customer_code} · {c.phone}</Text>
                </View>
                {customerId === c.id && <Check size={16} color="#d61e30" />}
              </TouchableOpacity>
            )}
          />
          <Button variant="outline" onPress={() => setShowCustomerPicker(false)} className="mt-4">Close</Button>
        </View>
      </Modal>

      {/* Item Picker Modal */}
      <Modal visible={showItemPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowItemPicker(false)}>
        <View className="flex-1 bg-platinum-700 dark:bg-black px-5 pt-6">
          <Text className="text-lg font-bold text-black dark:text-platinum mb-4">Select Item</Text>
          <View className="flex-row items-center bg-white dark:bg-black-600 rounded-xl px-3 py-2.5 mb-3">
            <Search size={16} color={iconColor} />
            <TextInput
              className="flex-1 ml-2 text-base text-black dark:text-platinum"
              placeholder="Search item or SKU..."
              placeholderTextColor={iconColor}
              value={itemSearch}
              onChangeText={setItemSearch}
            />
          </View>
          <FlatList
            data={filteredItems}
            keyExtractor={(i) => i.id}
            renderItem={({ item: i }) => (
              <TouchableOpacity
                onPress={() => { setItemId(i.id); setItemName(i.name); setItemRate(i.daily_rate); setDailyRateOverride(''); setShowItemPicker(false); setItemSearch(''); }}
                className="flex-row items-center py-3 border-b border-platinum-600 dark:border-black-500"
              >
                <View className="flex-1">
                  <Text className="text-base text-black dark:text-platinum">{i.name}</Text>
                  <Text className="text-xs text-black-800 dark:text-black-800">{i.sku} · {formatCurrency(i.daily_rate)}/day · {i.quantity} units</Text>
                </View>
                {itemId === i.id && <Check size={16} color="#d61e30" />}
              </TouchableOpacity>
            )}
          />
          <Button variant="outline" onPress={() => setShowItemPicker(false)} className="mt-4">Close</Button>
        </View>
      </Modal>
    </ScrollView>
  );
}
