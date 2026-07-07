'use client';

import { getToken } from 'firebase/messaging';

import { messaging } from '@/firebase/core/config';
import { firebaseVapidKey } from '@/firebase/core/keys';

const serviceWorkerPath = '/firebase-messaging-sw.js';
export const fcmVAPIDKey = firebaseVapidKey;

// ============================================
// Browser Support Checks
// ============================================

function isBrowserWithSW(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// ============================================
// Service Worker Management
// ============================================

async function getOrRegisterSW(): Promise<ServiceWorkerRegistration | null> {
  if (!isBrowserWithSW()) return null;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();

    const existing = registrations.find(reg =>
      reg.active?.scriptURL?.includes('firebase-messaging-sw.js'),
    );

    if (existing?.active) {
      return existing;
    }

    await navigator.serviceWorker.register(serviceWorkerPath, { scope: '/' });

    // navigator.serviceWorker.ready resolves with the active registration
    // that has pushManager available — replaces the old `registration` ref
    const activeRegistration = await navigator.serviceWorker.ready;

    return activeRegistration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

// ============================================
// Token Management
// ============================================

async function getFcmToken(registration: ServiceWorkerRegistration): Promise<string | null> {
  if (!messaging) return null;

  try {
    const token = await getToken(messaging, {
      vapidKey: fcmVAPIDKey,
      serviceWorkerRegistration: registration,
    });

    return token || null;
  } catch (error) {
    console.error('FCM Token Retrieval Failed:', error);
    return null;
  }
}

// ============================================
// Public API
// ============================================

export interface IFcmTokenResult {
  token: string | null;
  permission: NotificationPermission;
  error?: string;
}

/**
 * Request notification permission and get FCM token
 */
export async function requestFcmToken(): Promise<IFcmTokenResult> {
  if (!isBrowserWithSW() || !messaging) {
    return { token: null, permission: 'default', error: 'Not supported' };
  }

  try {
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      return { token: null, permission, error: 'Permission denied' };
    }

    const registration = await getOrRegisterSW();
    if (!registration) {
      return { token: null, permission, error: 'SW registration failed' };
    }

    const token = await getFcmToken(registration);
    return { token, permission };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { token: null, permission: Notification.permission, error: message };
  }
}

/**
 * Initialize FCM silently (only if permission already granted)
 */
export async function initializeFcmSilently(): Promise<string | null> {
  if (getNotificationPermission() !== 'granted') {
    return null;
  }

  const result = await requestFcmToken();
  return result.token;
}

/**
 * Simple helper to request permission + get device token in one call.
 * Use this in places that just need a token (login, social auth, etc.)
 */
export async function getDeviceToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const result = await requestFcmToken();
  return result.token;
}
