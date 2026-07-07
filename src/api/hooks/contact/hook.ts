import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ContactQueryEnum } from './key';
import { TContact, TContactUpdatePayload } from './schema';

import { createClient } from '@/utils/supabase/client';

export const useGetContact = () => {
  const supabase = createClient();

  return useQuery<{ data: TContact[]; total: number }, Error>({
    queryKey: [ContactQueryEnum.ContactAll],
    queryFn: async () => {
      const query = supabase.from('contact').select('*', { count: 'exact' });

      const { data, count, error } = await query.order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return {
        data: (data || []) as TContact[],
        total: count || 0,
      };
    },
  });
};

export const useGetContactById = () => {
  const supabase = createClient();

  return useQuery<TContact, Error>({
    queryKey: [ContactQueryEnum.ContactGet],
    queryFn: async () => {
      const { data, error } = await supabase.from('contact').select('*').single();

      if (error) throw new Error(error.message);
      return data as TContact;
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TContact, Error, { id: string; data: TContactUpdatePayload }>({
    mutationFn: async ({ id, data }) => {
      const { data: updatedContact, error } = await supabase
        .from('contact')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return updatedContact as TContact;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ContactQueryEnum.ContactAll] });
      queryClient.invalidateQueries({
        queryKey: [ContactQueryEnum.ContactGet, variables.id],
      });
    },
  });
};
