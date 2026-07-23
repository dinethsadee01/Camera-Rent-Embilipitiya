import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const EXPIRY_SECONDS = 60 * 60; // 1 hour

// The id-photos bucket is private (see 005_private_id_photos.sql), so the
// stored path can't be used directly as an <Image> source — it has to be
// exchanged for a short-lived signed URL first.
export function useSignedPhotoUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ['signed-photo-url', path],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('id-photos')
        .createSignedUrl(path as string, EXPIRY_SECONDS);
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!path,
    staleTime: (EXPIRY_SECONDS - 5 * 60) * 1000, // re-sign a few minutes before it expires
    gcTime: EXPIRY_SECONDS * 1000,
  });
}
