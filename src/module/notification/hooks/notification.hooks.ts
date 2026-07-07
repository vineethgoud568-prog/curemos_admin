import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export interface ISendNotificationPayload {
  role: string;
  title: string;
  message: string;
  image?: string | File;
}

export interface IBroadcastHistory {
  id: string;
  title: string;
  message: string;
  image_url: string | null;
  target_group: string;
  sent_by: string;
  created_at: string;
}

export const useSendNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: ISendNotificationPayload) => {
      let imageUrl = typeof payload.image === 'string' ? payload.image : null;

      // Handle file upload to Supabase Storage
      if (payload.image instanceof File) {
        const file = payload.image;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        const filePath = `broadcasts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('notifications')
          .upload(filePath, file);

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
          .from('notifications')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('broadcast_history')
        .insert({
          title: payload.title,
          message: payload.message,
          image_url: imageUrl,
          target_group: payload.role,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast_history'] });
    },
  });
};

export const useBroadcastHistory = (page: number = 1, pageSize: number = 5) => {
  return useQuery<{ data: IBroadcastHistory[]; count: number }>({
    queryKey: ['broadcast_history', page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('broadcast_history')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return {
        data: data as IBroadcastHistory[],
        count: count || 0,
      };
    },
  });
};
export const useDeleteBroadcast = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('broadcast_history').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast_history'] });
    },
  });
};

export const useClearAllBroadcasts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // In a real app, you might want to only delete the current user's broadcasts
      // but for "Clear All" in Admin we'll delete everything in the table.
      const { error } = await supabase.from('broadcast_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast_history'] });
    },
  });
};

export interface IAdminNotification {
  id: string;
  title: string;
  description: string;
  type: 'enquiry' | 'doctor' | 'patient' | 'referral';
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export const useAdminNotifications = (page: number = 1, pageSize: number = 10) => {
  return useQuery<{ data: IAdminNotification[]; count: number }>({
    queryKey: ['admin_notifications', page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('admin_notifications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return {
        data: data as IAdminNotification[],
        count: count || 0,
      };
    },
  });
};

export const useUnreadNotificationsCount = () => {
  return useQuery<number, Error>({
    queryKey: ['admin_notifications_unread_count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('admin_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin_notifications_unread_count'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin_notifications_unread_count'] });
    },
  });
};

export const useAdminNotificationsRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channelId = Math.random().toString(36).substring(7);
    const channel = supabase
      .channel(`admin-notifications-realtime-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_notifications',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin_notifications'] });
          queryClient.invalidateQueries({ queryKey: ['admin_notifications_unread_count'] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
