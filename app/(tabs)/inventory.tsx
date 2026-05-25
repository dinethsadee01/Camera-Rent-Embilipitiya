import { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, SlidersHorizontal } from 'lucide-react-native';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterChips } from '@/components/ui/FilterChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AppMenu } from '@/components/ui/AppMenu';
import { ItemForm } from '@/components/inventory/ItemForm';
import { InventoryListItem } from '@/components/inventory/InventoryListItem';
import { Toast } from '@/components/ui/Toast';
import { useItems, useAddItem } from '@/hooks/useInventory';
import { useTheme } from '@/hooks/useTheme';
import type { ItemCategory } from '@/lib/types';

const CATEGORY_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'camera', label: 'Camera' },
  { key: 'lens', label: 'Lens' },
  { key: 'drone', label: 'Drone' },
  { key: 'stabilizer', label: 'Stabilizer' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'support', label: 'Support' },
  { key: 'accessory', label: 'Accessory' },
  { key: 'other', label: 'Other' },
];

const SORT_OPTIONS = [
  { key: 'name_asc', label: 'Name A→Z' },
  { key: 'name_desc', label: 'Name Z→A' },
  { key: 'rate_asc', label: 'Rate ↑' },
  { key: 'rate_desc', label: 'Rate ↓' },
  { key: 'qty_asc', label: 'Qty ↑' },
  { key: 'qty_desc', label: 'Qty ↓' },
];

export default function InventoryScreen() {
  const { data: items, isLoading } = useItems();
  const addItem = useAddItem();
  const { isDark } = useTheme();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortKey, setSortKey] = useState('name_asc');
  const [showSort, setShowSort] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() => {
    if (!items) return [];
    let list = items.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch = !q || item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchSearch && matchCategory;
    });
    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case 'name_asc': return a.name.localeCompare(b.name);
        case 'name_desc': return b.name.localeCompare(a.name);
        case 'rate_asc': return a.daily_rate - b.daily_rate;
        case 'rate_desc': return b.daily_rate - a.daily_rate;
        case 'qty_asc': return a.quantity - b.quantity;
        case 'qty_desc': return b.quantity - a.quantity;
        default: return 0;
      }
    });
    return list;
  }, [items, search, categoryFilter, sortKey]);

  async function handleAddItem(data: Parameters<typeof addItem.mutateAsync>[0]) {
    try {
      await addItem.mutateAsync(data);
      setShowAdd(false);
      Toast.success('Item added to inventory.');
    } catch (e: any) {
      Toast.error(e?.message ?? 'Could not add item.');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-platinum-700 dark:bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <View>
          <Text className="text-xl font-bold text-black dark:text-platinum">Inventory</Text>
          <Text className="text-xs text-black-800 dark:text-black-800">
            {items?.length ?? 0} items
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <ThemeToggle />
          <AppMenu />
        </View>
      </View>

      {/* Search */}
      <View className="px-4 mb-3">
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name or SKU..." />
      </View>

      {/* Filter + Sort row */}
      <View className="flex-row items-center mb-3">
        <View className="flex-1 pl-4">
          <FilterChips chips={CATEGORY_FILTERS} selected={categoryFilter} onSelect={setCategoryFilter} />
        </View>
        <TouchableOpacity
          onPress={() => setShowSort(true)}
          className="mr-4 ml-2 w-9 h-9 bg-platinum-700 dark:bg-black-600 rounded-xl items-center justify-center"
        >
          <SlidersHorizontal size={16} color={isDark ? '#eeeeee' : '#333333'} />
        </TouchableOpacity>
      </View>

      {/* List */}
      {isLoading ? (
        <View className="px-4">
          {[1, 2, 3, 4].map((k) => <SkeletonCard key={k} />)}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 pb-24"
          renderItem={({ item }) => <InventoryListItem item={item} />}
          ListEmptyComponent={
            <EmptyState
              title={search ? 'No items match your search' : 'No items yet'}
              subtitle={search ? 'Try a different search term.' : 'Tap + to add your first item.'}
            />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setShowAdd(true)}
        className="absolute bottom-24 right-5 w-14 h-14 bg-flag_red rounded-2xl items-center justify-center shadow-lg"
        activeOpacity={0.85}
      >
        <Plus size={26} color="#ffffff" />
      </TouchableOpacity>

      {/* Sort Modal */}
      <Modal visible={showSort} transparent animationType="slide" onRequestClose={() => setShowSort(false)}>
        <TouchableOpacity className="flex-1 bg-black/40" activeOpacity={1} onPress={() => setShowSort(false)}>
          <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-black-600 rounded-t-3xl p-5">
            <Text className="text-base font-bold text-black dark:text-platinum mb-4">Sort By</Text>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => { setSortKey(opt.key); setShowSort(false); }}
                className="flex-row items-center py-3 border-b border-platinum-600 dark:border-black-500"
              >
                <View className={`w-4 h-4 rounded-full border-2 mr-3 ${sortKey === opt.key ? 'border-flag_red bg-flag_red' : 'border-black-800 dark:border-black-800'}`} />
                <Text className="text-base text-black dark:text-platinum">{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Item Modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <View className="flex-1 bg-platinum-700 dark:bg-black px-5 pt-6">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-bold text-black dark:text-platinum">New Item</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <ItemForm onSubmit={handleAddItem} onCancel={() => setShowAdd(false)} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
