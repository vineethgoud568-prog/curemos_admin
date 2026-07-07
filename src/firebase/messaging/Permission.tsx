'use client';

import { useEffect } from 'react';

import { useFcm } from '@/firebase/messaging/useFcm';

export const FCMPermission = () => {
  const { requestPermission, permission } = useFcm();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (permission === 'default') {
        requestPermission();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [permission, requestPermission]);

  return null;
};
