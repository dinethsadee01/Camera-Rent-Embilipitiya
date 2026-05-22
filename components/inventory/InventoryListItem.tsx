import { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ChevronDown, ChevronUp, Pencil, Trash2, Tag, Box } from 'lucide-react-native';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ItemForm } from './ItemForm';
import { confirmDelete } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils';
import { useUpdateItem, useDeleteItem } from '@/hooks/useInventory';
import { useTheme } from '@/hooks/useTheme';
import type { Item } from '@/lib/types';

const CATEGORY_LABEL: Record<string, string> = {
  camera: 'Camera', lens: 'Lens', accessory: 'Accessory', lighting: 'Lighting', other: 'Other',
};

interface InventoryListItemProps {
  item: Item;
}

export function InventoryListItem({ item }: InventoryListItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const { isDark } = useTheme();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  function toggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  }

  function handleDelete() {
    confirmDelete(item.name, async () => {
      try {
        await deleteItem.mutateAsync(item.id);
        Toast.success(`${item.name} removed.`);
      } catch (e: any) {
        Toast.error(e?.message ?? 'Could not delete item.');
      }
    });
  }

  async function handleEdit(data: Omit<Item, 'id' | 'sku' | 'created_at' | 'updated_at'>) {
    try {
      await updateItem.mutateAsync({ id: item.id, ...data });
      setEditing(false);
      Toast.success('Item updated.');
    } catch (e: any) {
      Toast.error(e?.message ?? 'Could not update item.');
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
        {/* Collapsed row */}
        <View className="flex-row items-center px-4 py-3.5">
          <View className="bg-platinum-700 dark:bg-black-500 rounded-lg px-2 py-1 mr-3">
            <Text className="text-xs font-mono font-semibold text-black-700 dark:text-black-900">
              {item.sku}
            </Text>
          </View>
          <Text className="flex-1 text-base font-medium text-black dark:text-platinum" numberOfLines={1}>
            {item.name}
          </Text>
          {expanded
            ? <ChevronUp size={16} color={iconColor} />
            : <ChevronDown size={16} color={iconColor} />}
        </View>

        {/* Expanded details */}
        {expanded && (
          <View className="px-4 pb-4 border-t border-platinum-600 dark:border-black-500">
            <View className="flex-row flex-wrap gap-3 mt-3 mb-3">
              <View className="flex-row items-center">
                <Tag size={14} color={iconColor} />
                <Text className="ml-1.5 text-sm text-black-700 dark:text-black-900">
                  {formatCurrency(item.daily_rate)} / day
                </Text>
              </View>
              <View className="flex-row items-center">
                <Box size={14} color={iconColor} />
                <Text className="ml-1.5 text-sm text-black-700 dark:text-black-900">
                  {item.quantity} unit{item.quantity !== 1 ? 's' : ''}
                </Text>
              </View>
              <Badge label={CATEGORY_LABEL[item.category] ?? item.category} variant="muted" />
            </View>
            {item.notes ? (
              <Text className="text-sm text-black-800 dark:text-black-800 mb-3">{item.notes}</Text>
            ) : null}
            <View className="flex-row gap-2">
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
                loading={deleteItem.isPending}
                className="flex-1"
              >
                Delete
              </Button>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Edit modal */}
      <Modal visible={editing} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditing(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <View className="flex-1 bg-platinum-700 dark:bg-black px-5 pt-6">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-bold text-black dark:text-platinum">Edit Item</Text>
              <Text className="text-sm text-black-800 dark:text-black-800 font-mono">{item.sku}</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <ItemForm initial={item} onSubmit={handleEdit} onCancel={() => setEditing(false)} submitLabel="Save Changes" />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
