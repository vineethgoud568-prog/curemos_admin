'use client';

import { useMutation, UseMutationResult } from '@tanstack/react-query';

import { TAuthModel } from '../auth/schema';
import { TUseMutationOptions } from '../common/common';

import { TProfileSchema } from './schema';

import { createClient } from '@/utils/supabase/client';

export type TUseProfileChangeMutation = (
  options?: TUseMutationOptions<
    TProfileSchema['IProfileUpdateResponse'],
    Error,
    TProfileSchema['IProfileUpdatePayload']
  >,
) => UseMutationResult<
  TProfileSchema['IProfileUpdateResponse'],
  Error,
  TProfileSchema['IProfileUpdatePayload']
>;

export const useProfileChange: TUseProfileChangeMutation = () => {
  const supabase = createClient();

  return useMutation<
    TProfileSchema['IProfileUpdateResponse'],
    Error,
    TProfileSchema['IProfileUpdatePayload']
  >({
    mutationKey: ['profile_change'],
    mutationFn: async (payload) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error(userError?.message || 'User not found');

      const userId = userData.user.id;
      let avatarUrl = payload.profileImage as string;

      // Handle Image Upload if it's a File
      if (payload.profileImage instanceof File) {
        const file = payload.profileImage;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (uploadError) throw new Error(uploadError.message);

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      // 1. Update Auth Metadata
      const { data: updatedAuth, error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          full_name: payload.fullName,
          phone: payload.phone,
          avatar_url: avatarUrl,
        },
      });

      if (authUpdateError) throw new Error(authUpdateError.message);

      // 2. Update Public Profiles Table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: payload.fullName,
          phone: payload.phone,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) throw new Error(profileError.message);

      return { user: updatedAuth.user, error: null };
    },
  });
};

export type TUsePasswordChangeMutation = (
  options?: TUseMutationOptions<
    TProfileSchema['IPasswordUpdateResponse'],
    Error,
    TProfileSchema['IPasswordChangePayload']
  >,
) => UseMutationResult<
  TProfileSchema['IPasswordUpdateResponse'],
  Error,
  TProfileSchema['IPasswordChangePayload']
>;

export const useChangePassHook: TUsePasswordChangeMutation = () => {
  const supabase = createClient();

  return useMutation<
    TProfileSchema['IPasswordUpdateResponse'],
    Error,
    TProfileSchema['IPasswordChangePayload']
  >({
    mutationKey: ['change password'],
    mutationFn: async (payload) => {
      const { data, error } = await supabase.auth.updateUser({
        password: payload.password,
      });

      if (error) throw new Error(error.message);

      return { statusCode: 200, message: 'Password updated successfully', data: data.user };
    },
  });
};

export const fetchUserDetails = async () => {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new Error(error?.message || 'User not found');

  // Map supabase user to IUserData structure
  const formattedUser: TAuthModel['IUserData'] = {
    _id: user.id,
    fullName: user.user_metadata?.full_name || 'Admin',
    email: user.email || '',
    userName: user.user_metadata?.username || '',
    phone: user.user_metadata?.phone || '',
    profileImage: user.user_metadata?.avatar_url || '',
    status: 'ACTIVE',
    createdAt: user.created_at,
    role: {
      _id: 'role-1',
      role: user.user_metadata?.role || 'USER',
      roleDisplayName: user.user_metadata?.role || 'User',
    },
  };

  return { data: formattedUser };
};

export const profileService = {
  useProfileChange,
  useChangePassHook,
};
