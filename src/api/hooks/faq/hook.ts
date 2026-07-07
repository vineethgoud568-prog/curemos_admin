'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { FaqQueryEnum, TFaq, TFaqPayload } from './schema';

import { TTableParams } from '@/@core/utils/supabase-query';
import { createClient } from '@/utils/supabase/client';

export const useGetFaqs = (params: TTableParams & { type?: string }) => {
  const supabase = createClient();

  return useQuery<{ data: TFaq[]; total: number }, Error>({
    queryKey: [FaqQueryEnum.FaqAll, params],
    queryFn: async () => {
      let query = supabase.from('faqs').select('*', { count: 'exact' });

      if (params.type) {
        query = query.eq('type', params.type);
      }

      const searchValue = (params.search ?? '').trim().replace(/[%_]/g, (char) => `\\${char}`);

      if (searchValue) {
        query = query.ilike('question', `%${searchValue}%`);
      }

      const from = (params.page - 1) * params.limit;
      const to = from + params.limit - 1;

      query = query.range(from, to);

      const { data, count, error } = await query.order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      return {
        data: (data as TFaq[]) || [],
        total: count || 0,
      };
    },
  });
};

export const useGetFaqById = (id: string) => {
  const supabase = createClient();

  return useQuery<TFaq, Error>({
    queryKey: [FaqQueryEnum.FaqGet, id],
    queryFn: async () => {
      const { data, error } = await supabase.from('faqs').select('*').eq('id', id).single();

      if (error) throw new Error(error.message);
      return data as TFaq;
    },
    enabled: !!id,
  });
};

export const useAddFaq = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TFaq, Error, TFaqPayload>({
    mutationFn: async (payload) => {
      const { data, error } = await supabase.from('faqs').insert([payload]).select().single();

      if (error) throw new Error(error.message);
      return data as TFaq;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FaqQueryEnum.FaqAll] });
    },
  });
};

export const useUpdateFaq = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TFaq, Error, { id: string; data: Partial<TFaqPayload> }>({
    mutationFn: async ({ id, data }) => {
      const { data: updated, error } = await supabase
        .from('faqs')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return updated as TFaq;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [FaqQueryEnum.FaqAll] });
      queryClient.invalidateQueries({ queryKey: [FaqQueryEnum.FaqGet, variables.id] });
    },
  });
};

export const useDeleteFaq = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase.from('faqs').delete().eq('id', id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FaqQueryEnum.FaqAll] });
    },
  });
};
