import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';
import type { Customer } from '@/lib/types';

interface CustomerFormProps {
  initial?: Partial<Customer>;
  onSubmit: (data: Omit<Customer, 'id' | 'customer_code' | 'registered_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function CustomerForm({ initial, onSubmit, onCancel, submitLabel = 'Add Customer' }: CustomerFormProps) {
  const [fullName, setFullName] = useState(initial?.full_name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [phoneSecondary, setPhoneSecondary] = useState(initial?.phone_secondary ?? '');
  const [nic, setNic] = useState(initial?.nic ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [photoUrl, setPhotoUrl] = useState(initial?.id_photo_url ?? '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  async function pickPhoto(fromCamera: boolean) {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, base64: false })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, base64: false });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setUploadingPhoto(true);
    try {
      const ext = asset.uri.split('.').pop() ?? 'jpg';
      const filename = `id-${Date.now()}.${ext}`;
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const { data, error } = await supabase.storage
        .from('id-photos')
        .upload(filename, blob, { contentType: `image/${ext}` });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('id-photos').getPublicUrl(data.path);
      setPhotoUrl(urlData.publicUrl);
    } catch (e: any) {
      Alert.alert('Upload failed', e?.message ?? 'Could not upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSubmit() {
    if (!fullName.trim()) { Alert.alert('Required', 'Full name is required.'); return; }
    if (!phone.trim()) { Alert.alert('Required', 'Phone number is required.'); return; }
    setLoading(true);
    try {
      await onSubmit({
        full_name: fullName.trim(),
        phone: phone.trim(),
        phone_secondary: phoneSecondary.trim() || null,
        nic: nic.trim() || null,
        address: address.trim() || null,
        id_photo_url: photoUrl || null,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Input label="Full Name" value={fullName} onChangeText={setFullName} placeholder="e.g. Kasun Perera" className="mb-4" />
      <Input label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="07XXXXXXXX" className="mb-4" />
      <Input label="Second Number (optional)" value={phoneSecondary} onChangeText={setPhoneSecondary} keyboardType="phone-pad" placeholder="07XXXXXXXX" className="mb-4" />
      <Input label="NIC / ID Number" value={nic} onChangeText={setNic} placeholder="XXXXXXXXX(V/X)" autoCapitalize="characters" className="mb-4" />
      <Input label="Address (optional)" value={address} onChangeText={setAddress} placeholder="Street, City" multiline numberOfLines={2} className="mb-4" />

      {/* ID Photo */}
      <Text className="text-xs font-medium text-black-700 dark:text-black-900 mb-2 uppercase tracking-wide">ID Photo</Text>
      {photoUrl ? (
        <View className="mb-4">
          <Image source={{ uri: photoUrl }} className="w-full h-40 rounded-xl" resizeMode="cover" />
          <TouchableOpacity onPress={() => setPhotoUrl('')} className="mt-2">
            <Text className="text-xs text-flag_red text-center">Remove photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={() => pickPhoto(true)}
            disabled={uploadingPhoto}
            className="flex-1 h-20 bg-platinum-700 dark:bg-black-500 rounded-xl border border-dashed border-platinum-400 dark:border-black-600 items-center justify-center"
          >
            {uploadingPhoto ? <ActivityIndicator color="#d61e30" /> : (
              <>
                <Camera size={20} color={isDark ? '#999999' : '#666666'} />
                <Text className="text-xs text-black-800 dark:text-black-800 mt-1">Camera</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => pickPhoto(false)}
            disabled={uploadingPhoto}
            className="flex-1 h-20 bg-platinum-700 dark:bg-black-500 rounded-xl border border-dashed border-platinum-400 dark:border-black-600 items-center justify-center"
          >
            <ImageIcon size={20} color={isDark ? '#999999' : '#666666'} />
            <Text className="text-xs text-black-800 dark:text-black-800 mt-1">Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="flex-row gap-3">
        <Button variant="outline" onPress={onCancel} className="flex-1">Cancel</Button>
        <Button onPress={handleSubmit} loading={loading} className="flex-1">{submitLabel}</Button>
      </View>
    </ScrollView>
  );
}
