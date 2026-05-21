import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { generateItemSKU } from '@/lib/sku';
import type { Item, ItemCategory } from '@/lib/types';

export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Item[];
    },
  });
}

export function useAddItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Item, 'id' | 'sku' | 'created_at' | 'updated_at'> & { category: ItemCategory }) => {
      const { data: existing } = await supabase.from('items').select('sku');
      const existingSkus = (existing ?? []).map((i: { sku: string }) => i.sku);
      const sku = generateItemSKU(existingSkus, input.category);
      const { data, error } = await supabase
        .from('items')
        .insert({ ...input, sku })
        .select()
        .single();
      if (error) throw error;
      return data as Item;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Item> & { id: string }) => {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Item;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
