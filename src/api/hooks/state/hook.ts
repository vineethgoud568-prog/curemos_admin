'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { StateQueryEnum } from './key';
import { TState } from './schema';

import { TTableParams } from '@/@core/utils/supabase-query';
import { TStateFormValues } from '@/module/states/zod/state.schema';
import { createClient } from '@/utils/supabase/client';

const MEDICAL_COUNCILS_TABLE = 'medical_councils';

export const useGetStates = (params: TTableParams) => {
  const supabase = createClient();

  return useQuery<{ data: TState[]; total: number }, Error>({
    queryKey: [StateQueryEnum.StateAll, params],
    queryFn: async () => {
      let query = supabase.from(MEDICAL_COUNCILS_TABLE).select('*', { count: 'exact' });

      if (params.search) {
        query = query.or(`name.ilike.%${params.search}%`);
      }

      const from = (params.page - 1) * params.limit;
      const to = from + params.limit - 1;

      query = query.range(from, to);

      const { data, count, error } = await query.order('name', { ascending: true });

      if (error) throw new Error(error.message);
      return {
        data: (data || []) as TState[],
        total: count || 0,
      };
    },
  });
};

export const useGeTStateById = (id: string) => {
  const supabase = createClient();

  return useQuery<TState, Error>({
    queryKey: [StateQueryEnum.StateGet, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(MEDICAL_COUNCILS_TABLE)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      return data as TState;
    },
    enabled: !!id,
  });
};

export const useAddState = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TState, Error, TStateFormValues>({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from(MEDICAL_COUNCILS_TABLE)
        .insert([
          {
            name: payload.name,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);

      return data as TState;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [StateQueryEnum.StateAll] });
    },
  });
};

export const useUpdateState = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TState, Error, { id: string; data: TStateFormValues }>({
    mutationFn: async ({ id, data }) => {
      const { data: updatedState, error } = await supabase
        .from(MEDICAL_COUNCILS_TABLE)
        .update({
          name: data.name,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return updatedState as TState;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [StateQueryEnum.StateAll] });
      queryClient.invalidateQueries({
        queryKey: [StateQueryEnum.StateGet, variables.id],
      });
    },
  });
};

export const useChangeStatusState = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TState, Error, { id: string; status: string }>({
    mutationFn: async ({ id, status }) => {
      const { data: updatedState, error } = await supabase
        .from(MEDICAL_COUNCILS_TABLE)
        .update({
          status,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return updatedState as TState;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [StateQueryEnum.StateAll] });
      queryClient.invalidateQueries({
        queryKey: [StateQueryEnum.StateGet, variables.id],
      });
    },
  });
};

export const useDeleteState = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(MEDICAL_COUNCILS_TABLE).delete().eq('id', id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [StateQueryEnum.StateAll] });
    },
  });
};

export const useGetAllState = () => {
  const supabase = createClient();

  return useQuery<Array<Pick<TState, 'id' | 'name'>>, Error>({
    queryKey: [StateQueryEnum.StateAllOptions],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(MEDICAL_COUNCILS_TABLE)
        .select('id, name')
        .order('name', { ascending: true });

      if (error) throw new Error(error.message);

      return (data || []) as Array<Pick<TState, 'id' | 'name'>>;
    },
  });
};
