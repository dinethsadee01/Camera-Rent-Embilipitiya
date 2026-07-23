import { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Modal, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { ChevronDown, ChevronUp, Phone, CreditCard, MapPin, Pencil, Trash2, History, Image as ImageIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { CustomerForm } from './CustomerForm';
import { confirmDelete } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { useUpdateCustomer, useDeleteCustomer } from '@/hooks/useCustomers';
import { useSignedPhotoUrl } from '@/hooks/useSignedPhotoUrl';
import { useTheme } from '@/hooks/useTheme';
import type { Customer } from '@/lib/types';

interface CustomerListItemProps {
  customer: Customer;
}

export function CustomerListItem({ customer }: CustomerListItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const { isDark } = useTheme();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const router = useRouter();
  // Only resolve a signed URL once the card is actually expanded — no need
  // to fire a network request per row while scrolling a long customer list.
  const { data: photoUrl } = useSignedPhotoUrl(expanded ? customer.id_photo_path : null);

  function toggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  }

  function handleDelete() {
    confirmDelete(customer.full_name, async () => {
      try {
        await deleteCustomer.mutateAsync(customer.id);
        Toast.success(`${customer.full_name} removed.`);
      } catch (e: any) {
        Toast.error(e?.message ?? 'Could not delete customer.');
      }
    });
  }

  async function handleEdit(data: Omit<Customer, 'id' | 'customer_code' | 'registered_at' | 'updated_at'>) {
    try {
      await updateCustomer.mutateAsync({ id: customer.id, ...data });
      setEditing(false);
      Toast.success('Customer updated.');
    } catch (e: any) {
      Toast.error(e?.message ?? 'Could not update customer.');
    }
  }

  const iconColor = isDark ? '#999999' : '#666666';

  return (
    <>
      <TouchableOpacity
        onPress={toggle}
        className="bg-white dark:bg-black-600 rounded-2xl mb-2 overflow-hidden"
        activeOpacity={0.9}
      >
        {/* Collapsed */}
        <View className="flex-row items-center px-4 py-3.5">
          <View className="w-10 h-10 rounded-full bg-flag_red-900 dark:bg-flag_red-200 items-center justify-center mr-3">
            <Text className="text-sm font-bold text-flag_red">
              {customer.full_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-black dark:text-platinum" numberOfLines={1}>
              {customer.full_name}
            </Text>
            <Text className="text-xs text-black-800 dark:text-black-800">{customer.customer_code}</Text>
          </View>
          {expanded ? <ChevronUp size={16} color={iconColor} /> : <ChevronDown size={16} color={iconColor} />}
        </View>

        {/* Expanded */}
        {expanded && (
          <View className="px-4 pb-4 border-t border-platinum-600 dark:border-black-500">
            <View className="gap-2 mt-3 mb-3">
              <View className="flex-row items-center">
                <Phone size={13} color={iconColor} />
                <Text className="ml-2 text-sm text-black-700 dark:text-black-900">{customer.phone}</Text>
                {customer.phone_secondary ? (
                  <Text className="ml-2 text-sm text-black-800 dark:text-black-800">· {customer.phone_secondary}</Text>
                ) : null}
              </View>
              {customer.nic && (
                <View className="flex-row items-center">
                  <CreditCard size={13} color={iconColor} />
                  <Text className="ml-2 text-sm text-black-700 dark:text-black-900">{customer.nic}</Text>
                </View>
              )}
              {customer.address && (
                <View className="flex-row items-start">
                  <MapPin size={13} color={iconColor} />
                  <Text className="ml-2 text-sm text-black-700 dark:text-black-900 flex-1">{customer.address}</Text>
                </View>
              )}
            </View>

            {customer.id_photo_path ? (
              photoUrl ? (
                <Image
                  source={{ uri: photoUrl }}
                  className="w-full h-32 rounded-xl mb-3"
                  contentFit="cover"
                  transition={150}
                  cachePolicy="disk"
                />
              ) : (
                <View className="w-full h-32 rounded-xl bg-platinum-600 dark:bg-black-500 items-center justify-center mb-3">
                  <ActivityIndicator color="#d61e30" />
                </View>
              )
            ) : (
              <View className="w-full h-20 rounded-xl bg-platinum-600 dark:bg-black-500 items-center justify-center mb-3">
                <ImageIcon size={20} color={iconColor} />
                <Text className="text-xs text-black-800 dark:text-black-800 mt-1">No ID photo</Text>
              </View>
            )}

            <Text className="text-xs text-black-800 dark:text-black-800 mb-3">
              Registered {formatDate(customer.registered_at)}
            </Text>

            <View className="flex-row gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<History size={13} color={isDark ? '#eeeeee' : '#333333'} />}
                onPress={() => router.push(`/customers/${customer.id}/history` as any)}
                className="flex-1"
              >
                History
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Pencil size={13} color={isDark ? '#eeeeee' : '#333333'} />}
                onPress={() => setEditing(true)}
                className="flex-1"
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                icon={<Trash2 size={13} color="#ffffff" />}
                onPress={handleDelete}
                loading={deleteCustomer.isPending}
                className="flex-1"
              >
                Delete
              </Button>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Edit Modal */}
      <Modal visible={editing} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditing(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <View className="flex-1 bg-platinum-700 dark:bg-black px-5 pt-6">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-bold text-black dark:text-platinum">Edit Customer</Text>
              <Text className="text-sm text-black-800 dark:text-black-800 font-mono">{customer.customer_code}</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <CustomerForm initial={customer} onSubmit={handleEdit} onCancel={() => setEditing(false)} submitLabel="Save Changes" />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
