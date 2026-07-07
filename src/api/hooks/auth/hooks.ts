'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { baseUrl } from '@/api/endpoints/endpoints';
import { TSubadminPermission } from '@/api/hooks/subadmin/schema';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/utils/supabase/client';

type LoginPayload = {
  email: string;
  password: string;
};

type UserRole = {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'editor' | 'doctor_a' | 'doctor_b' | 'sub_admin';
  created_at: string;
};

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

export const useAuthLoginHook = () => {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async ({ email, password }: LoginPayload) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return null;
      }

      const user = data.user;

      if (!user) {
        setError('User not found');
        return null;
      }

      // First, check if the user is in admin_users (for subadmins and new admins)
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (adminUser) {
        if (adminUser.status !== 'active') {
          await supabase.auth.signOut();
          setError('Your account is inactive. Please contact the administrator.');
          return null;
        }

        return {
          session: data.session,
          user,
          role: {
            id: adminUser.id,
            user_id: adminUser.id,
            role: adminUser.role,
            created_at: adminUser.created_at,
          },
        };
      }

      // Fallback to legacy user_roles check
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('id, user_id, role, created_at')
        .eq('user_id', user.id);

      if (roleError) {
        await supabase.auth.signOut();
        setError(roleError.message || 'Failed to fetch user role');
        return null;
      }

      if (!userRoles || userRoles.length === 0) {
        await supabase.auth.signOut();
        setError('You are not authorized to access admin panel');
        return null;
      }

      const hasAdminAccess = userRoles.some((r) =>
        ['super_admin', 'admin', 'sub_admin'].includes(r.role),
      );
      const adminRole = userRoles.find((r) =>
        ['super_admin', 'admin', 'sub_admin'].includes(r.role),
      );

      if (!hasAdminAccess) {
        await supabase.auth.signOut();
        setError('You do not have admin access');
        return null;
      }

      return {
        session: data.session,
        user,
        role: adminRole ?? userRoles[0],
      };
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Something went wrong'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    error,
  };
};

export const useAuthForgotPasswordHook = () => {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forgotPassword = async (email: string, redirectTo = `${baseUrl}/auth/reset-password`) => {
    try {
      setLoading(true);
      setError(null);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) {
        setError(resetError.message);
        return false;
      }

      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Something went wrong'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    forgotPassword,
    loading,
    error,
  };
};

export const useAuthResetPasswordHook = () => {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = async (newPassword: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: resetError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (resetError) {
        setError(resetError.message);
        return false;
      }

      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Something went wrong'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    resetPassword,
    loading,
    error,
  };
};

export const useAuthPermissionHook = () => {
  const supabase = createClient();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPermissions = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: permissionError } = await supabase
        .from('admin_permission')
        .select('module, permission')
        .eq('admin_user_id', id);

      if (permissionError) {
        setError(permissionError.message);
        return null;
      }

      const permissions = (data || []) as TSubadminPermission[];

      setUser((currentUser) => {
        if (!currentUser || currentUser._id !== id) return currentUser;

        return {
          ...currentUser,
          permissions,
        };
      });

      return permissions;
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch permissions'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getPermissions,
    loading,
    error,
  };
};
