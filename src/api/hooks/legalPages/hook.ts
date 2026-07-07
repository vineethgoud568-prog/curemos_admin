'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { LegalPageQueryEnum, TLegalPage, TLegalPagePayload, TLegalPageSlug } from './schema';

import { createClient } from '@/utils/supabase/client';

export const useGetLegalPageBySlug = (slug: TLegalPageSlug) => {
  const supabase = createClient();

  return useQuery<TLegalPage | null, Error>({
    queryKey: [LegalPageQueryEnum.LegalPageBySlug, slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_pages')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data as TLegalPage | null;
    },
    enabled: !!slug,
  });
};

export const useUpsertLegalPage = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TLegalPage, Error, TLegalPagePayload>({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from('legal_pages')
        .upsert(payload, { onConflict: 'slug' })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as TLegalPage;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [LegalPageQueryEnum.LegalPageBySlug, variables.slug],
      });
    },
  });
};
