'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { SubadminQueryEnum } from './key';
import { TSubadmin, TSubadminPermission } from './schema';

import { TTableParams } from '@/@core/utils/supabase-query';
import {
  subadminPermissionModules,
  TSubadminFormValues,
} from '@/module/subadmin/zod/subadmin.schema';
import { createClient } from '@/utils/supabase/client';

export const useGetSubadmins = (params: TTableParams) => {
  const supabase = createClient();

  return useQuery<{ data: TSubadmin[]; total: number }, Error>({
    queryKey: [SubadminQueryEnum.SubadminAll, params],
    queryFn: async () => {
      let query = supabase.from('admin_users').select('*', { count: 'exact' });

      // ✅ SEARCH (manual)
      if (params.search) {
        query = query.or(`full_name.ilike.%${params.search}%`);
      }

      // ✅ PAGINATION
      const from = (params.page - 1) * params.limit;
      const to = from + params.limit - 1;

      query = query.range(from, to);

      const { data, count, error } = await query.order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return {
        data: (data || []) as TSubadmin[],
        total: count || 0,
      };
    },
  });
};

export const useGeTSubadminById = (id: string) => {
  const supabase = createClient();

  return useQuery<TSubadmin, Error>({
    queryKey: [SubadminQueryEnum.SubadminGet, id],
    queryFn: async () => {
      const { data, error } = await supabase.from('admin_users').select('*').eq('id', id).single();

      if (error) throw new Error(error.message);
      return data as TSubadmin;
    },
    enabled: !!id,
  });
};

export const useGetSubadminPermissions = (id: string) => {
  const supabase = createClient();

  return useQuery<TSubadminPermission[], Error>({
    queryKey: [SubadminQueryEnum.SubadminPermissions, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_permission')
        .select('module, permission')
        .eq('admin_user_id', id);

      if (error) throw new Error(error.message);
      return (data || []) as TSubadminPermission[];
    },
    enabled: !!id,
  });
};

export const useAddSubadmin = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<{ success: boolean; userId: string }, Error, TSubadminFormValues>({
    mutationFn: async (payload) => {
      let imageUrl = '';

      // ✅ upload if file exists
      if (payload.image) {
        const file = payload.image as File;

        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')

          .upload(filePath, file);

        if (uploadError) throw new Error(uploadError.message);

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      }

      // ✅ Call server action to invite user and insert DB records
      // Import dynamically or ensure it's available
      const { inviteSubadminAction } = await import('@/api/actions/subadmin.actions');

      const result = await inviteSubadminAction({
        email: payload.email,
        full_name: payload.full_name,
        category: payload.category,
        image: imageUrl,
        permissions: payload.permissions,
        subadminPermissionModules,
      });

      return result;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SubadminQueryEnum.SubadminAll] });
    },
  });
};

export const useUpdateSubadmin = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<{ success: boolean }, Error, { id: string; data: TSubadminFormValues }>({
    mutationFn: async ({ id, data }) => {
      let imageUrl = '';

      // ✅ CASE 1: new file selected
      if (data.image instanceof File) {
        const file = data.image;

        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (uploadError) throw new Error(uploadError.message);

        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

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

      // ✅ Call server action to update user and DB records
      const { updateSubadminAction } = await import('@/api/actions/subadmin.actions');

      const result = await updateSubadminAction(id, {
        email: data.email,
        full_name: data.full_name,
        category: data.category,
        image: imageUrl,
        permissions: data.permissions,
        subadminPermissionModules,
      });
      const { data: updatedSubadmin, error } = await supabase
        .from('admin_users')
        .update({
          full_name: data.full_name,
          email: data.email,
          image: imageUrl,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      const { error: deletePermissionError } = await supabase
        .from('admin_permission')
        .delete()
        .eq('admin_user_id', id);

      if (deletePermissionError) throw new Error(deletePermissionError.message);

      const permissionRows = subadminPermissionModules
        .map((moduleName) => ({
          admin_user_id: id,
          module: moduleName,
          permission: data.permissions[moduleName] || [],
        }))
        .filter((row) => row.permission.length > 0);

      if (permissionRows.length > 0) {
        const { error: permissionError } = await supabase
          .from('admin_permission')
          .insert(permissionRows);

        if (permissionError) throw new Error(permissionError.message);
      }

      return result;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SubadminQueryEnum.SubadminAll] });
      queryClient.invalidateQueries({
        queryKey: [SubadminQueryEnum.SubadminGet, variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: [SubadminQueryEnum.SubadminPermissions, variables.id],
      });
    },
  });
};

export const useChangeStatusSubadmin = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TSubadmin, Error, { id: string; status: string }>({
    mutationFn: async ({ id, status }) => {
      const { data: updatedSubadmin, error } = await supabase
        .from('admin_users')
        .update({
          status,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return updatedSubadmin as TSubadmin;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SubadminQueryEnum.SubadminAll] });
      queryClient.invalidateQueries({
        queryKey: [SubadminQueryEnum.SubadminGet, variables.id],
      });
    },
  });
};

export const useDeleteSubadmin = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('admin_users').delete().eq('id', id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SubadminQueryEnum.SubadminAll] });
    },
  });
};

// export const useGetAllSubadmin = () => {
//   const supabase = createClient();

//   return useQuery<Array<Pick<TSubadmin, 'id' | 'name'>>, Error>({
//     queryKey: [SubadminQueryEnum.SubadminAllOptions],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from('admin_users')
//         .select('id, name')
//         .order('name', { ascending: true });

//       if (error) throw new Error(error.message);

//       return (data || []) as Array<Pick<TSubadmin, 'id' | 'name'>>;
//     },
//   });
// };

export const getSubadminsForExport = async (params: TTableParams) => {
  //   const supabase = createClient();
  //   const { data, error } = await buildReportsQuery(supabase, params, false);
  //   if (error) throw new Error(error.message);
  //   return (data || []) as TSubadmin[];
  return [];
};
