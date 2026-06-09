import { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, SlidersHorizontal } from 'lucide-react-native';
import { SearchBar } from '@/components/ui/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AppMenu } from '@/components/ui/AppMenu';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { CustomerListItem } from '@/components/customers/CustomerListItem';
import { Toast } from '@/components/ui/Toast';
import { useCustomers, useAddCustomer } from '@/hooks/useCustomers';
import { useTheme } from '@/hooks/useTheme';
import { Users } from 'lucide-react-native';

const SORT_OPTIONS = [
  { key: 'name_asc', label: 'Name A→Z' },
  { key: 'name_desc', label: 'Name Z→A' },
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
];

export default function CustomersScreen() {
  const { data: customers, isLoading } = useCustomers();
  const addCustomer = useAddCustomer();
  const { isDark } = useTheme();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('name_asc');
  const [showSort, setShowSort] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() => {
    if (!customers) return [];
    const q = search.toLowerCase();
    let list = customers.filter((c) =>
      !q ||
      c.full_name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.nic ?? '').toLowerCase().includes(q) ||
      c.customer_code.toLowerCase().includes(q)
    );
    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case 'name_asc': return a.full_name.localeCompare(b.full_name);
        case 'name_desc': return b.full_name.localeCompare(a.full_name);
        case 'newest': return new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime();
        case 'oldest': return new Date(a.registered_at).getTime() - new Date(b.registered_at).getTime();
        default: return 0;
      }
    });
    return list;
  }, [customers, search, sortKey]);

  async function handleAddCustomer(data: Parameters<typeof addCustomer.mutateAsync>[0]) {
    try {
      await addCustomer.mutateAsync(data);
      setShowAdd(false);
      Toast.success('Customer added.');
    } catch (e: any) {
      Toast.error(e?.message ?? 'Could not add customer.');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-platinum-700 dark:bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <View>
          <Text className="text-xl font-bold text-black dark:text-platinum">Customers</Text>
          <Text className="text-xs text-black-800 dark:text-black-800">
            {customers?.length ?? 0} registered
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <ThemeToggle />
          <AppMenu />
        </View>
      </View>

      {/* Search + Sort */}
      <View className="flex-row items-center px-4 gap-2 mb-3">
        <View className="flex-1">
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search name, phone, NIC..." />
        </View>
        <TouchableOpacity
          onPress={() => setShowSort(true)}
          className="w-11 h-11 bg-platinum-700 dark:bg-black-600 rounded-xl items-center justify-center"
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
          keyExtractor={(c) => c.id}
          contentContainerClassName="px-4 pb-24"
          renderItem={({ item }) => <CustomerListItem customer={item} />}
          ListEmptyComponent={
            <EmptyState
              icon={<Users size={48} color={isDark ? '#eeeeee' : '#666666'} />}
              title={search ? 'No customers match your search' : 'No customers yet'}
              subtitle={search ? 'Try a different search term.' : 'Tap + to add your first customer.'}
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

      {/* Add Customer Modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <View className="flex-1 bg-platinum-700 dark:bg-black px-5 pt-6">
            <Text className="text-lg font-bold text-black dark:text-platinum mb-5">New Customer</Text>
            <CustomerForm onSubmit={handleAddCustomer} onCancel={() => setShowAdd(false)} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
