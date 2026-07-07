'use client';

import { useRouter } from 'next/navigation';
import { destroyCookie, parseCookies } from 'nookies';
import { createContext, ReactNode, useCallback, useEffect, useState } from 'react';

import { AuthValuesType } from './types';

import { getOAuthAppAccessToken, setOAuthAppAccessToken } from '@/api/axiosInstance/axiosInstance';
import { TAuthModel } from '@/api/hooks/auth/schema';
import { TSubadminPermission } from '@/api/hooks/subadmin/schema';
import { SessionTimeoutListener } from '@/components/auth/SessionTimeoutListener';
import { accessTokenKey, refreshTokenKey } from '@/lib/constants';
import { ROUTES } from '@/navigation/sidebar/routes';
import { createClient } from '@/utils/supabase/client';

// Extend AuthValuesType to include refreshUser
export type ExtendedAuthValuesType = AuthValuesType & {
  refreshUser: () => Promise<void>;
};

const defaultProvider: ExtendedAuthValuesType = {
  user: null,
  isLoading: true, // Start as true
  setUser: () => null,
  setHasToken: () => null,
  logout: () => Promise.resolve(),
  refreshUser: () => Promise.resolve(),
};

const AuthContext = createContext<ExtendedAuthValuesType>(defaultProvider);

type Props = {
  children: ReactNode;
};

const AuthProvider = ({ children }: Props) => {
  const router = useRouter();
  const [user, setUser] = useState<TAuthModel['IUserData'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const cookies = parseCookies();
  const [hasToken, setHasToken] = useState<string | null>(
    getOAuthAppAccessToken() || cookies[accessTokenKey] || null,
  );

  const refreshUser = useCallback(async () => {
    const supabase = createClient();
    setIsLoading(true);
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setUser(null);
        return;
      }

      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user.id)
        .single();

      let assignedRole = user.user_metadata?.role || user.user_metadata?.user_type || 'USER';

      if (adminUser) {
        if (adminUser.status !== 'active') {
          // If inactive, sign out immediately
          await supabase.auth.signOut();
          setUser(null);
          return;
        }
        assignedRole = adminUser.role;
      } else {
        // Fallback to user_roles
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        if (userRoles) {
          assignedRole = userRoles.role;
        }
      }

      let permissions: TSubadminPermission[] = [];

      if (assignedRole === 'sub_admin') {
        const { data: permissionRows, error: permissionError } = await supabase
          .from('admin_permission')
          .select('module, permission')
          .eq('admin_user_id', user.id);

        if (permissionError) throw new Error(permissionError.message);

        permissions = (permissionRows || []) as TSubadminPermission[];
      }

      const formattedUser: TAuthModel['IUserData'] = {
        _id: user.id,
        fullName: adminUser?.full_name || user.user_metadata?.full_name || 'Admin',
        email: user.email || '',
        userName: user.user_metadata?.username || '',
        phone: user.user_metadata?.phone || '',
        profileImage: adminUser?.image || user.user_metadata?.avatar_url || '',
        status: 'ACTIVE',
        createdAt: user.created_at,
        role: {
          _id: 'role-1',
          role: assignedRole,
          roleDisplayName: assignedRole.replace(/_/g, ' '),
        },
        permissions,
      };
      setUser(formattedUser);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Sync hasToken with session changes if necessary
  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.access_token) {
          setHasToken(session.access_token);
          // refreshUser is already called in the other effect or can be called here
          refreshUser();
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setHasToken(null);
        router.replace(ROUTES.auth.login);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUser, router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    destroyCookie(undefined, accessTokenKey, { path: '/' });
    destroyCookie(undefined, refreshTokenKey, { path: '/' });

    setOAuthAppAccessToken(null);
    setUser(null);
    setHasToken(null);

    router.replace(ROUTES.auth.login);
  };

  const values = {
    user,
    isLoading,
    setUser,
    logout: handleLogout,
    setHasToken,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={values}>
      {children}
      <SessionTimeoutListener />
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
