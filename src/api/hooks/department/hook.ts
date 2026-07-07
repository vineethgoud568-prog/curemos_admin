'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { DepartmentQueryEnum } from './key';
import { TDepartment } from './schema';

import { TTableParams } from '@/@core/utils/supabase-query';
import { TDepartmentFormValues } from '@/module/department/zod/department.schema';
import { createClient } from '@/utils/supabase/client';

export const useGetDepartments = (params: TTableParams) => {
  const supabase = createClient();

  return useQuery<{ data: TDepartment[]; total: number }, Error>({
    queryKey: [DepartmentQueryEnum.DepartmentAll, params],
    queryFn: async () => {
      let query = supabase.from('departments').select('*', { count: 'exact' });

      // ✅ SEARCH (manual)
      if (params.search) {
        query = query.or(`name.ilike.%${params.search}%`);
      }

      // ✅ PAGINATION
      const from = (params.page - 1) * params.limit;
      const to = from + params.limit - 1;

      query = query.range(from, to);

      const { data, count, error } = await query
        .order('sequence_no', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return {
        data: (data || []) as TDepartment[],
        total: count || 0,
      };
    },
  });
};

export const useGeTDepartmentById = (id: string) => {
  const supabase = createClient();

  return useQuery<TDepartment, Error>({
    queryKey: [DepartmentQueryEnum.DepartmentGet, id],
    queryFn: async () => {
      const { data, error } = await supabase.from('departments').select('*').eq('id', id).single();

      if (error) throw new Error(error.message);
      return data as TDepartment;
    },
    enabled: !!id,
  });
};

export const useAddDepartment = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TDepartment, Error, TDepartmentFormValues>({
    mutationFn: async (payload) => {
      let imageUrl = '';

      // ✅ upload if file exists
      if (payload.image) {
        const file = payload.image as File;

        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `departments/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('departments')
          .upload(filePath, file);

        if (uploadError) throw new Error(uploadError.message);

        const { data } = supabase.storage.from('departments').getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      }

      // ✅ insert into DB
      const { data, error } = await supabase
        .from('departments')
        .insert([
          {
            name: payload.name,
            image: imageUrl,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);

      return data as TDepartment;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DepartmentQueryEnum.DepartmentAll] });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<
    TDepartment,
    Error,
    { id: string; data: { name: string; image?: File | string } }
  >({
    mutationFn: async ({ id, data }) => {
      let imageUrl = '';

      // ✅ CASE 1: new file selected
      if (data.image instanceof File) {
        const file = data.image;

        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `departments/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('departments')
          .upload(filePath, file);

        if (uploadError) throw new Error(uploadError.message);

        const { data: publicUrlData } = supabase.storage.from('departments').getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      // ✅ CASE 2: already a URL (no change)
      else if (typeof data.image === 'string') {
        imageUrl = data.image;
      }

      // ✅ CASE 3: no image
      else {
        imageUrl = '';
      }

      const { data: updatedDepartment, error } = await supabase
        .from('departments')
        .update({
          name: data.name,
          image: imageUrl, // ✅ always string
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return updatedDepartment as TDepartment;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [DepartmentQueryEnum.DepartmentAll] });
      queryClient.invalidateQueries({
        queryKey: [DepartmentQueryEnum.DepartmentGet, variables.id],
      });
    },
  });
};

export const useChangeStatusDepartment = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TDepartment, Error, { id: string; status: string }>({
    mutationFn: async ({ id, status }) => {
      const { data: updatedDepartment, error } = await supabase
        .from('departments')
        .update({
          status,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return updatedDepartment as TDepartment;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [DepartmentQueryEnum.DepartmentAll] });
      queryClient.invalidateQueries({
        queryKey: [DepartmentQueryEnum.DepartmentGet, variables.id],
      });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('departments').delete().eq('id', id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DepartmentQueryEnum.DepartmentAll] });
    },
  });
};

export const useUpdateDepartmentSequence = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<
    void,
    Error,
    { departments: Pick<TDepartment, 'id' | 'sequence_no'>[] }
  >({
    mutationFn: async ({ departments }) => {
      const results = await Promise.all(
        departments.map((dept) =>
          supabase.from('departments').update({ sequence_no: dept.sequence_no }).eq('id', dept.id),
        ),
      );
      const error = results.find((result) => result.error)?.error;

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DepartmentQueryEnum.DepartmentAll] });
    },
  });
};

export const useGetAllDepartment = () => {
  const supabase = createClient();

  return useQuery<Array<Pick<TDepartment, 'id' | 'name'>>, Error>({
    queryKey: [DepartmentQueryEnum.DepartmentAllOptions],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) throw new Error(error.message);

      return (data || []) as Array<Pick<TDepartment, 'id' | 'name'>>;
    },
  });
};
