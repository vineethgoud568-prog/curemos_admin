import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/navigation/sidebar/routes';

const LoginWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace(ROUTES.dashboard);
    }
  }, [router, user]);

  return children;
};

export default LoginWrapper;
