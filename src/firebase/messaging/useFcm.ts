'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getNotificationPermission, initializeFcmSilently, requestFcmToken } from './sw-token';
import { useForegroundMessages } from './useForeground';

import { useUpdateFcmToken } from '@/api/hooks/profile/fcm';

/**
 * FCM hook — handles auto-init, permission prompt, and foreground notifications.
 * Only used by FCMPermission provider.
 */
export const useFcm = () => {
  const initRef = useRef(false);
  const queryClient = useQueryClient();
  const { mutate: updateToken } = useUpdateFcmToken();
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const [permission, setPermission] = useState<NotificationPermission | null>(() => {
    if (typeof window === 'undefined') return null;
    const p = getNotificationPermission();
    return p === 'unsupported' ? null : p;
  });

  // Auto-init on mount — silently refresh FCM token if permission already granted
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    (async () => {
      if (typeof window === 'undefined') return;
      const p = getNotificationPermission();
      if (p !== 'unsupported') setPermission(p);
      if (p === 'granted') {
        const token = await initializeFcmSilently();
        if (token) setFcmToken(token);
      }
    })();
  }, []);

  // Sync token with DB when it changes
  useEffect(() => {
    if (fcmToken) {
      updateToken(fcmToken);
    }
  }, [fcmToken, updateToken]);

  // Foreground message listener — delegated to dedicated hook
  useForegroundMessages(permission, queryClient);

  /** Request notification permission and register FCM token */
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const result = await requestFcmToken();
    setPermission(result.permission);
    if (result.token) setFcmToken(result.token);
  }, []);

  return { permission, requestPermission };
};
