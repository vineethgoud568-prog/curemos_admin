'use client';

import { useMutation } from '@tanstack/react-query';

import { createClient } from '@/utils/supabase/client';

interface IFcmTokenUpsert {
  user_id: string;
  token: string;
  device_type: string;
  last_seen: string;
}

export const useUpdateFcmToken = () => {
  const supabase = createClient();

  return useMutation<void, Error, string>({
    mutationKey: ['update_fcm_token'],
    mutationFn: async (token: string) => {
      const { data, error: userError } = await supabase.auth.getUser();
      const user = data?.user;

      if (userError || !user) throw new Error('User not authenticated');

      const payload: IFcmTokenUpsert = {
        user_id: user.id,
        token,
        device_type: 'web',
        last_seen: new Date().toISOString(),
      };

      const { error } = await supabase.from('fcm_tokens').upsert(payload, { onConflict: 'token' });

      if (error) {
        console.error('Failed to sync FCM token:', error.message);
        throw new Error(error.message);
      }
    },
  });
};
