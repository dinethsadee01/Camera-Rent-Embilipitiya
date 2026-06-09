import { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal,
  FlatList, Alert, TextInput,
} from 'react-native';
import { Search, CalendarDays, Plus, X, Sparkles } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FilterChips } from '@/components/ui/FilterChip';
import { formatCurrency, getRentalDays, toISODateString } from '@/lib/utils';
import { useItems } from '@/hooks/useInventory';
import { useTheme } from '@/hooks/useTheme';
import { BUNDLE_SUGGESTIONS } from '@/lib/bundles';
import type { PaymentMethod, ItemCategory, BookingWithRelations, DiscountType } from '@/lib/types';
import type { NewBookingItemInput } from '@/hooks/useBookings';
import { DatePickerModal } from '@/components/ui/DatePickerModal';
import { TimeInput } from '@/components/ui/TimeInput';

interface LineItem {
  localId: string;
  item_id: string | null;
  custom_name: string | null;
  display_name: string;
  category: ItemCategory | null;
  quantity: number;
  daily_rate: number;
  is_free: boolean;
}

interface BookingEditFormProps {
  booking: BookingWithRelations;
  onSubmit: (updates: {
    start_date: string;
    end_date: string;
    total_price: number;
    payment_status: 'paid' | 'pending' | 'partial';
    payment_method: PaymentMethod | null;
    advance_amount: number;
    discount_type: DiscountType | null;
    discount_value: number | null;
    discount_amount: number;
    pickup_time: string | null;
    return_time: string | null;
    notes: string | null;
  }, items: NewBookingItemInput[]) => Promise<void>;
  onCancel: () => void;
}

const PAYMENT_OPTIONS = [
  { key: 'paid', label: 'Paid' },
  { key: 'pending', label: 'Pending' },
  { key: 'partial', label: 'Partial' },
];

const PAYMENT_METHODS: { key: PaymentMethod; label: string }[] = [
  { key: 'cash', label: 'Cash' },
  { key: 'bank_transfer', label: 'Bank Transfer' },
];

function makeLocalId() {
  return Math.random().toString(36).slice(2);
}

function bookingItemToLine(bi: BookingWithRelations['booking_items'][number]): LineItem {
  return {
    localId: makeLocalId(),
    item_id: bi.item_id,
    custom_name: bi.custom_name,
    display_name: bi.item?.name ?? bi.custom_name ?? '',
    category: (bi.item?.category ?? null) as ItemCategory | null,
    quantity: bi.quantity,
    daily_rate: bi.daily_rate,
    is_free: bi.is_free,
  };
}

export function BookingEditForm({ booking, onSubmit, onCancel }: BookingEditFormProps) {
  const { data: items } = useItems();
  const { isDark } = useTheme();

  const [lineItems, setLineItems] = useState<LineItem[]>(
    () => (booking.booking_items ?? []).map(bookingItemToLine)
  );
  const [startDate, setStartDate] = useState(() => new Date(booking.start_date + 'T00:00:00'));
  const [endDate, setEndDate] = useState(() => new Date(booking.end_date + 'T00:00:00'));
  const [paymentOption, setPaymentOption] = useState<string>(booking.payment_status);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(booking.payment_method);
  const [advanceAmount, setAdvanceAmount] = useState(
    booking.advance_amount > 0 ? String(booking.advance_amount) : ''
  );
  const [discountType, setDiscountType] = useState<DiscountType>(booking.discount_type ?? 'percentage');
  const [discountInput, setDiscountInput] = useState(
    booking.discount_value != null ? String(booking.discount_value) : ''
  );
  const [pickupTime, setPickupTime] = useState(booking.pickup_time ?? '');
  const [returnTime, setReturnTime] = useState(booking.return_time ?? '');
  const [notes, setNotes] = useState(booking.notes ?? '');
  const [loading, setLoading] = useState(false);

  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [itemPickerCategoryFilter, setItemPickerCategoryFilter] = useState<ItemCategory | null>(null);

  const startStr = toISODateString(startDate);
  const endStr = toISODateString(endDate);
  const days = getRentalDays(startStr, endStr);

  const subtotal = useMemo(() =>
    lineItems.reduce((sum, li) => {
      if (li.is_free) return sum;
      return sum + li.daily_rate * li.quantity * days;
    }, 0),
    [lineItems, days]
  );

  const discountAmount = useMemo(() => {
    const val = parseFloat(discountInput) || 0;
    if (val <= 0) return 0;
    if (discountType === 'percentage') return Math.min(subtotal, (subtotal * val) / 100);
    return Math.min(subtotal, val);
  }, [discountInput, discountType, subtotal]);

  const totalPrice = subtotal - discountAmount;

  const filteredItems = useMemo(() => {
    const alreadyAdded = new Set(lineItems.map((li) => li.item_id).filter(Boolean));
    return (items ?? []).filter((i) => {
      if (alreadyAdded.has(i.id)) return false;
      const q = itemSearch.toLowerCase();
      const matchSearch = !q || i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q);
      const matchCat = !itemPickerCategoryFilter || i.category === itemPickerCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [items, itemSearch, itemPickerCategoryFilter, lineItems]);

  const suggestions = useMemo(() => {
    const addedCategories = new Set(
      lineItems.filter((li) => !li.is_free && li.category).map((li) => li.category as ItemCategory)
    );
    const addedFreeLabels = new Set(
      lineItems.filter((li) => li.is_free && li.custom_name).map((li) => li.custom_name!)
    );
    const addedItemCategories = new Set(
      lineItems.filter((li) => !li.is_free && li.category).map((li) => li.category as ItemCategory)
    );
    const seen = new Set<string>();
    const result: Array<{ key: string; label: string; onPress: () => void }> = [];
    for (const cat of addedCategories) {
      for (const s of BUNDLE_SUGGESTIONS[cat] ?? []) {
        if (s.type === 'free') {
          if (addedFreeLabels.has(s.label)) continue;
          const key = `free:${s.label}`;
          if (seen.has(key)) continue;
          seen.add(key);
          result.push({ key, label: `${s.label} (Free)`, onPress: () => addFreeItem(s.label) });
        } else {
          if (addedItemCategories.has(s.category)) continue;
          const key = `item:${s.category}`;
          if (seen.has(key)) continue;
          seen.add(key);
          const { category, hint } = s;
          result.push({ key, label: hint, onPress: () => openItemPickerForCategory(category) });
        }
      }
    }
    return result;
  }, [lineItems, items]);

  function addFreeItem(label: string) {
    setLineItems((prev) => [...prev, {
      localId: makeLocalId(), item_id: null, custom_name: label,
      display_name: label, category: null, quantity: 1, daily_rate: 0, is_free: true,
    }]);
  }

  function openItemPickerForCategory(category: ItemCategory) {
    setItemPickerCategoryFilter(category);
    setItemSearch('');
    setShowItemPicker(true);
  }

  function selectItem(item: NonNullable<typeof items>[number]) {
    setLineItems((prev) => [...prev, {
      localId: makeLocalId(), item_id: item.id, custom_name: null,
      display_name: item.name, category: item.category,
      quantity: 1, daily_rate: item.daily_rate, is_free: false,
    }]);
    setShowItemPicker(false);
    setItemSearch('');
    setItemPickerCategoryFilter(null);
  }

  function removeLineItem(localId: string) {
    setLineItems((prev) => prev.filter((li) => li.localId !== localId));
  }

  function updateQuantity(localId: string, qty: number) {
    setLineItems((prev) =>
      prev.map((li) => (li.localId === localId ? { ...li, quantity: Math.max(1, qty) } : li))
    );
  }

  async function handleSubmit() {
    if (lineItems.length === 0) { Alert.alert('Required', 'Add at least one item.'); return; }
    if (endDate < startDate) { Alert.alert('Invalid dates', 'End date must be on or after start date.'); return; }
    if (paymentOption === 'partial' && !advanceAmount) { Alert.alert('Required', 'Enter advance amount.'); return; }

    setLoading(true);
    try {
      const newItems: NewBookingItemInput[] = lineItems.map((li) => ({
        item_id: li.item_id,
        custom_name: li.custom_name,
        quantity: li.quantity,
        daily_rate: li.daily_rate,
        is_free: li.is_free,
      }));
      const discountVal = parseFloat(discountInput) || 0;
      await onSubmit({
        start_date: startStr,
        end_date: endStr,
        total_price: totalPrice,
        payment_status: paymentOption as 'paid' | 'pending' | 'partial',
        payment_method: paymentMethod,
        advance_amount: paymentOption === 'partial' ? parseFloat(advanceAmount) || 0 : 0,
        discount_type: discountVal > 0 ? discountType : null,
        discount_value: discountVal > 0 ? discountVal : null,
        discount_amount: discountAmount,
        pickup_time: pickupTime.trim() || null,
        return_time: returnTime.trim() || null,
        notes: notes.trim() || null,
      }, newItems);
    } finally {
      setLoading(false);
    }
  }

  const iconColor = isDark ? '#999999' : '#666666';
  const chipBg = isDark ? '#2a2a2a' : '#f0f0f0';

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Customer (read-only) */}
      <Text className="text-xs font-medium text-black-700 dark:text-black-900 mb-1.5 uppercase tracking-wide">Customer</Text>
      <View className="bg-platinum-700 dark:bg-black-500 rounded-xl px-4 py-3 mb-4">
        <Text className="text-base text-black dark:text-platinum">{booking.customer?.full_name}</Text>
        <Text className="text-xs text-black-800 dark:text-black-800">{booking.customer?.customer_code}</Text>
      </View>

      {/* Dates */}
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

      <DatePickerModal
        visible={showStartDate}
        value={startDate}
        title="Select Start Date"
        onConfirm={(date) => { setStartDate(date); if (date > endDate) setEndDate(date); setShowStartDate(false); }}
        onDismiss={() => setShowStartDate(false)}
      />
      <DatePickerModal
        visible={showEndDate}
        value={endDate}
        minimumDate={startDate}
        title="Select End Date"
        onConfirm={(date) => { setEndDate(date); setShowEndDate(false); }}
        onDismiss={() => setShowEndDate(false)}
      />

      {/* Time row */}
      <View className="flex-row gap-3 mb-4">
        <TimeInput label="Pickup Time (opt.)" value={pickupTime} onChange={setPickupTime} className="flex-1" />
        <TimeInput label="Return Time (opt.)" value={returnTime} onChange={setReturnTime} className="flex-1" />
      </View>

      {/* Items */}
      <Text className="text-xs font-medium text-black-700 dark:text-black-900 mb-2 uppercase tracking-wide">Items</Text>

      {lineItems.length > 0 && (
        <View className="bg-white dark:bg-black-600 rounded-2xl mb-3 overflow-hidden">
          {lineItems.map((li, idx) => (
            <View
              key={li.localId}
              className={`flex-row items-center px-4 py-3 ${idx < lineItems.length - 1 ? 'border-b border-platinum-600 dark:border-black-500' : ''}`}
            >
              <View className="flex-1 mr-3">
                <Text className="text-sm font-medium text-black dark:text-platinum" numberOfLines={1}>
                  {li.display_name}
                </Text>
                {li.is_free ? (
                  <Text className="text-xs text-green-600 dark:text-green-400">Free</Text>
                ) : (
                  <Text className="text-xs text-black-800 dark:text-black-800">
                    {formatCurrency(li.daily_rate)}/day · {days} day{days !== 1 ? 's' : ''} = {formatCurrency(li.daily_rate * li.quantity * days)}
                  </Text>
                )}
              </View>
              {!li.is_free && (
                <View className="flex-row items-center mr-3">
                  <TouchableOpacity
                    onPress={() => updateQuantity(li.localId, li.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-platinum-600 dark:bg-black-500 items-center justify-center"
                  >
                    <Text className="text-sm font-bold text-black dark:text-platinum">−</Text>
                  </TouchableOpacity>
                  <Text className="mx-2 text-sm font-medium text-black dark:text-platinum w-5 text-center">{li.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(li.localId, li.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-platinum-600 dark:bg-black-500 items-center justify-center"
                  >
                    <Text className="text-sm font-bold text-black dark:text-platinum">+</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity onPress={() => removeLineItem(li.localId)}>
                <X size={16} color="#d61e30" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {suggestions.length > 0 && (
        <View className="mb-3">
          <View className="flex-row items-center mb-1.5">
            <Sparkles size={12} color={isDark ? '#aaaaaa' : '#888888'} />
            <Text className="ml-1 text-xs text-black-800 dark:text-black-800">Frequently rented together</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {suggestions.map((s) => (
              <TouchableOpacity
                key={s.key}
                onPress={s.onPress}
                style={{ backgroundColor: chipBg }}
                className="flex-row items-center px-3 py-1.5 rounded-full border border-platinum-400 dark:border-black-500"
              >
                <Plus size={11} color="#d61e30" />
                <Text className="ml-1 text-xs font-medium text-black dark:text-platinum">{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity
        onPress={() => { setItemPickerCategoryFilter(null); setItemSearch(''); setShowItemPicker(true); }}
        className="flex-row items-center justify-center border border-dashed border-platinum-400 dark:border-black-600 rounded-xl py-3 mb-4"
      >
        <Plus size={15} color={isDark ? '#aaaaaa' : '#888888'} />
        <Text className="ml-2 text-sm text-black-800 dark:text-black-800">Add item</Text>
      </TouchableOpacity>

      {/* Subtotal + Discount + Total */}
      {lineItems.length > 0 && (
        <View className="bg-white dark:bg-black-600 rounded-2xl px-4 pt-3 pb-1 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-black-700 dark:text-black-900">
              {days} day{days !== 1 ? 's' : ''} subtotal
            </Text>
            <Text className="text-sm font-semibold text-black dark:text-platinum">{formatCurrency(subtotal)}</Text>
          </View>
          <View className="flex-row items-center gap-2 mb-3">
            <View className="flex-row rounded-lg overflow-hidden border border-platinum-400 dark:border-black-500">
              {(['percentage', 'fixed'] as DiscountType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setDiscountType(t)}
                  className={`px-3 py-1.5 ${discountType === t ? 'bg-flag_red' : 'bg-transparent'}`}
                >
                  <Text className={`text-xs font-bold ${discountType === t ? 'text-white' : 'text-black-700 dark:text-black-900'}`}>
                    {t === 'percentage' ? '%' : 'LKR'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              className="flex-1 bg-platinum-700 dark:bg-black-500 rounded-xl px-3 py-2 text-sm text-black dark:text-platinum"
              placeholder={discountType === 'percentage' ? 'e.g. 10' : 'e.g. 500'}
              placeholderTextColor={isDark ? '#666666' : '#999999'}
              value={discountInput}
              onChangeText={setDiscountInput}
              keyboardType="decimal-pad"
            />
            {discountAmount > 0 && (
              <Text className="text-sm font-semibold text-green-600 dark:text-green-400">
                -{formatCurrency(discountAmount)}
              </Text>
            )}
          </View>
          <View className="flex-row items-center justify-between border-t border-platinum-600 dark:border-black-500 pt-2.5 pb-1.5">
            <Text className="text-sm font-semibold text-black dark:text-platinum">Total</Text>
            <Text className="text-base font-bold text-flag_red">{formatCurrency(totalPrice)}</Text>
          </View>
        </View>
      )}

      {/* Payment */}
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

      <View className="flex-row gap-2 mt-4">
        {PAYMENT_METHODS.map((m) => (
          <TouchableOpacity
            key={m.key}
            onPress={() => setPaymentMethod(m.key)}
            className={`flex-1 py-2.5 rounded-xl border items-center ${
              paymentMethod === m.key ? 'bg-flag_red border-flag_red' : 'bg-transparent border-platinum-400 dark:border-black-600'
            }`}
          >
            <Text className={`text-sm font-medium ${paymentMethod === m.key ? 'text-white' : 'text-black-700 dark:text-black-900'}`}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
        <Button onPress={handleSubmit} loading={loading} className="flex-1">Save Changes</Button>
      </View>

      {/* Item Picker Modal */}
      <Modal visible={showItemPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowItemPicker(false)}>
        <View className="flex-1 bg-platinum-700 dark:bg-black px-5 pt-6">
          <Text className="text-lg font-bold text-black dark:text-platinum mb-4">
            {itemPickerCategoryFilter
              ? `Select ${itemPickerCategoryFilter.charAt(0).toUpperCase() + itemPickerCategoryFilter.slice(1)}`
              : 'Select Item'}
          </Text>
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
                onPress={() => selectItem(i)}
                className="flex-row items-center py-3 border-b border-platinum-600 dark:border-black-500"
              >
                <View className="flex-1">
                  <Text className="text-base text-black dark:text-platinum">{i.name}</Text>
                  <Text className="text-xs text-black-800 dark:text-black-800">{i.sku} · {formatCurrency(i.daily_rate)}/day</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text className="text-sm text-black-800 dark:text-black-800 text-center py-8">No items found</Text>
            }
          />
          <Button variant="outline" onPress={() => { setShowItemPicker(false); setItemPickerCategoryFilter(null); }} className="mt-4">Close</Button>
        </View>
      </Modal>
    </ScrollView>
  );
}
