import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';
import { useSignedPhotoUrl } from '@/hooks/useSignedPhotoUrl';
import { compressForUpload } from '@/lib/image';
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
  const [photoPath, setPhotoPath] = useState(initial?.id_photo_path ?? '');
  const [localPreview, setLocalPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();
  // Only needed to display a photo that already existed before this form
  // session opened — a freshly picked photo shows via localPreview instead,
  // so no signed URL round trip is needed right after uploading.
  const { data: existingSignedUrl } = useSignedPhotoUrl(localPreview ? null : photoPath || null);
  const displayUri = localPreview || existingSignedUrl || '';

  async function pickPhoto(fromCamera: boolean) {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setLocalPreview(asset.uri);
    setUploadingPhoto(true);
    try {
      const compressed = await compressForUpload(asset.uri, asset.width, asset.height);
      const filename = `id-${Date.now()}.jpg`;
      const response = await fetch(compressed.uri);
      const arrayBuffer = await response.arrayBuffer();
      const { data, error } = await supabase.storage
        .from('id-photos')
        .upload(filename, arrayBuffer, { contentType: 'image/jpeg' });
      if (error) throw error;
      setPhotoPath(data.path);
    } catch (e: any) {
      setLocalPreview('');
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
        id_photo_path: photoPath || null,
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
      {(localPreview || photoPath) ? (
        <View className="mb-4">
          {displayUri ? (
            <Image
              source={{ uri: displayUri }}
              className="w-full h-40 rounded-xl"
              contentFit="cover"
              transition={150}
              cachePolicy="disk"
            />
          ) : (
            <View className="w-full h-40 rounded-xl bg-platinum-600 dark:bg-black-500 items-center justify-center">
              <ActivityIndicator color="#d61e30" />
            </View>
          )}
          {uploadingPhoto && displayUri && (
            <View className="absolute inset-0 items-center justify-center bg-black/30 rounded-xl">
              <ActivityIndicator color="#ffffff" />
            </View>
          )}
          <TouchableOpacity onPress={() => { setPhotoPath(''); setLocalPreview(''); }} className="mt-2">
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
        {initial ? (
          <Button variant="outline" onPress={onCancel} className="flex-1">Cancel</Button>
        ) : (
          <Button variant="outline" onPress={() => {
            setFullName('');
            setPhone('');
            setPhoneSecondary('');
            setNic('');
            setAddress('');
            setPhotoPath('');
            setLocalPreview('');
          }} className="flex-1">Reset</Button>
        )}
        <Button onPress={handleSubmit} loading={loading} className="flex-1">{submitLabel}</Button>
      </View>
    </ScrollView>
  );
}
