import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlusCircle, Package, Users, CalendarDays } from 'lucide-react-native';
import { BookingForm } from '@/components/bookings/BookingForm';
import { ItemForm } from '@/components/inventory/ItemForm';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { Card } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AppMenu } from '@/components/ui/AppMenu';
import { Toast } from '@/components/ui/Toast';
import { useAddBooking } from '@/hooks/useBookings';
import { useAddItem } from '@/hooks/useInventory';
import { useAddCustomer } from '@/hooks/useCustomers';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency, formatDate } from '@/lib/utils';

type ActiveForm = 'booking' | 'item' | 'customer' | null;

interface SuccessData {
  booking_code: string;
  customerName: string;
  itemName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  paymentStatus: string;
}

export default function AddNewScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const addBooking = useAddBooking();
  const addItem = useAddItem();
  const addCustomer = useAddCustomer();

  const [activeForm, setActiveForm] = useState<ActiveForm>('booking');
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  async function handleNewBooking(data: Parameters<typeof addBooking.mutateAsync>[0]) {
    const result = await addBooking.mutateAsync(data);
    setActiveForm(null);
    const primaryItems = (result.booking_items ?? []).filter((bi) => !bi.is_free);
    const itemSummary = primaryItems.length === 1
      ? (primaryItems[0].item?.name ?? primaryItems[0].custom_name ?? '')
      : `${primaryItems.length} items`;
    setSuccessData({
      booking_code: result.booking_code,
      customerName: result.customer?.full_name ?? '',
      itemName: itemSummary,
      startDate: result.start_date,
      endDate: result.end_date,
      totalPrice: result.total_price,
      paymentStatus: result.payment_status,
    });
  }

  async function handleNewItem(data: Parameters<typeof addItem.mutateAsync>[0]) {
    await addItem.mutateAsync(data);
    setActiveForm('booking');
    Toast.success('Item added to inventory.');
  }

  async function handleNewCustomer(data: Parameters<typeof addCustomer.mutateAsync>[0]) {
    await addCustomer.mutateAsync(data);
    setActiveForm('booking');
    Toast.success('Customer registered.');
  }

  const ACTION_TABS = [
    { key: 'booking' as ActiveForm, label: 'New Booking', icon: CalendarDays, desc: 'Create a rental booking' },
    { key: 'item' as ActiveForm, label: 'New Item', icon: Package, desc: 'Add to inventory' },
    { key: 'customer' as ActiveForm, label: 'New Customer', icon: Users, desc: 'Register a customer' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-platinum-700 dark:bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <View>
          <Text className="text-xl font-bold text-black dark:text-platinum">Add New</Text>
          <Text className="text-xs text-black-800 dark:text-black-800">
            Welcome, {user?.name}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <ThemeToggle />
          <AppMenu />
        </View>
      </View>

      {/* Action Tabs */}
      <View className="flex-row px-4 gap-2 mb-4">
        {ACTION_TABS.map(({ key, label, icon: Icon }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveForm(key)}
            className={`flex-1 py-3 rounded-2xl items-center ${
              activeForm === key ? 'bg-flag_red' : 'bg-white dark:bg-black-600'
            }`}
            activeOpacity={0.85}
          >
            <Icon size={18} color={activeForm === key ? '#ffffff' : isDark ? '#eeeeee' : '#333333'} />
            <Text className={`text-xs font-medium mt-1 ${activeForm === key ? 'text-white' : 'text-black-700 dark:text-black-900'}`}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Form area */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeForm === 'booking' && (
            <BookingForm
              onSubmit={handleNewBooking}
              onCancel={() => {}}
            />
          )}
          {activeForm === 'item' && (
            <View className="pb-24">
              <ItemForm
                onSubmit={handleNewItem}
                onCancel={() => setActiveForm('booking')}
              />
            </View>
          )}
          {activeForm === 'customer' && (
            <View className="pb-24">
              <CustomerForm
                onSubmit={handleNewCustomer}
                onCancel={() => setActiveForm('booking')}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Sheet */}
      <Modal visible={!!successData} transparent animationType="slide" onRequestClose={() => setSuccessData(null)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-black-600 rounded-t-3xl px-6 pt-6 pb-10">
            <View className="items-center mb-5">
              <View className="w-14 h-14 rounded-full bg-green-100 items-center justify-center mb-3">
                <PlusCircle size={28} color="#16a34a" />
              </View>
              <Text className="text-xl font-bold text-black dark:text-platinum">Booking Created!</Text>
              <Text className="text-sm text-black-800 dark:text-black-800 mt-1">{successData?.booking_code}</Text>
            </View>

            {successData && (
              <Card className="mb-5">
                <Row label="Customer" value={successData.customerName} />
                <Row label="Item" value={successData.itemName} />
                <Row label="Start" value={formatDate(successData.startDate)} />
                <Row label="End" value={formatDate(successData.endDate)} />
                <Row label="Total" value={formatCurrency(successData.totalPrice)} highlight />
                <Row label="Payment" value={successData.paymentStatus.charAt(0).toUpperCase() + successData.paymentStatus.slice(1)} last />
              </Card>
            )}

            <TouchableOpacity
              onPress={() => { setSuccessData(null); setActiveForm('booking'); }}
              className="bg-flag_red rounded-xl py-3.5 items-center"
            >
              <Text className="text-white font-semibold text-base">New Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Row({ label, value, highlight, last }: { label: string; value: string; highlight?: boolean; last?: boolean }) {
  return (
    <View className={`flex-row justify-between py-2 ${!last ? 'border-b border-platinum-600 dark:border-black-500' : ''}`}>
      <Text className="text-sm text-black-700 dark:text-black-900">{label}</Text>
      <Text className={`text-sm font-medium ${highlight ? 'text-flag_red' : 'text-black dark:text-platinum'}`}>{value}</Text>
    </View>
  );
}
