import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging, Messaging } from 'firebase/messaging';

import { firebaseConfig } from './keys';

// ============================================
// Firebase Init
// ============================================

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const messaging: Messaging | null = typeof window !== 'undefined' ? getMessaging(app) : null;
