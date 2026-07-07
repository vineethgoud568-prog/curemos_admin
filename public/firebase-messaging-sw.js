/* global firebase */

// ──────────────────────────────────────────────────────────────────────────────
// Register our push listener BEFORE importing Firebase so it runs first.
// This prevents FCM from auto-displaying a duplicate notification when the
// payload contains a "notification" field.
// ──────────────────────────────────────────────────────────────────────────────
self.addEventListener('push', event => {
  let payload;
  try {
    payload = event.data?.json() || {};
  } catch {
    return; // Not a JSON push event — ignore
  }

  // Only intercept FCM messages
  if (!payload.from && !payload.notification && !payload.data) {
    return;
  }

  // MUST be called synchronously to prevent Firebase's own handler from firing
  event.stopImmediatePropagation();

  const notif = payload.notification || {};
  const data = payload.data || {};

  const title = notif.title || data.title || 'New Notification';
  const options = {
    body: notif.body || data.body || '',
    icon: notif.icon || data.icon || '/favicon.ico',
    image: notif.image || data.image || undefined,
    badge: '/favicon.ico',
    data: { ...data, ...notif }, // merge so notificationclick can read data.type
  };

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      const focusedClients = windowClients.filter(client => client.visibilityState === 'visible');

      if (focusedClients.length > 0) {
        // App is in the foreground — send payload to ONE client only.
        // Posting to all focused clients causes duplicate toasts.
        console.info('[SW] App is in foreground, forwarding to client.');
        focusedClients[0].postMessage({
          type: 'FCM_FOREGROUND',
          payload: { notification: notif, data },
        });
        return;
      }

      // App is in the background — show notification from SW
      console.info('[SW] App is in background, showing notification:', title, options);
      return self.registration.showNotification(title, options);
    }),
  );
});

// ──────────────────────────────────────────────────────────────────────────────
// Firebase setup (still needed for token management / foreground messaging)
// ──────────────────────────────────────────────────────────────────────────────
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Activate immediately
self.addEventListener('install', _event => {
  console.info('[SW] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.info('[SW] Activating...');
  event.waitUntil(clients.claim());
});

firebase.initializeApp({
  apiKey: 'AIzaSyAThWnRGBeGgMF_bgG4XS8N_A6udNFJL0s',
  authDomain: 'pro-eleven-admin.firebaseapp.com',
  projectId: 'pro-eleven-admin',
  storageBucket: 'pro-eleven-admin.firebasestorage.app',
  messagingSenderId: '66313254256',
  appId: '1:66313254256:web:c7beb1025bc87a171a4bb5',
  measurementId: 'G-DZ65WZCFN4',
});

// Initialize messaging so the token lifecycle works for foreground messages.
// We do NOT use onBackgroundMessage — everything is handled in the push listener above.
firebase.messaging();

// ──────────────────────────────────────────────────────────────────────────────
// Notification click handler
// ──────────────────────────────────────────────────────────────────────────────
const redirectMap = {
  productOrderRequest: {
    path: '/dashboard/product-order/list',
    paramKeys: ['status'],
  },
  referralRequest: {
    path: '/dashboard/referral/list',
    paramKeys: ['status'],
  },
};

function getRedirectUrl(data) {
  const config = data.type ? redirectMap[data.type] : undefined;

  if (!config) return data.link || '/';

  const params = new URLSearchParams(config.defaultParams || {});
  (config.paramKeys || []).forEach(key => {
    if (data[key]) params.set(key, data[key]);
  });

  const query = params.toString();
  return query ? `${config.path}?${query}` : config.path;
}

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const data = event.notification.data || {};
  const redirectUrl = getRedirectUrl(data);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      const origin = windowClients[0]?.url
        ? new URL(windowClients[0].url).origin
        : self.location.origin;
      const fullUrl = redirectUrl.startsWith('http') ? redirectUrl : `${origin}${redirectUrl}`;

      // Find any existing tab on the same origin (e.g. an already-open dashboard tab)
      const existingClient = windowClients.find(client => {
        try {
          return new URL(client.url).origin === new URL(fullUrl).origin;
        } catch {
          return false;
        }
      });

      if (existingClient && 'navigate' in existingClient) {
        // Navigate the existing tab to the desired URL and focus it
        return existingClient.navigate(fullUrl).then(navigatedClient => {
          return (navigatedClient || existingClient).focus();
        });
      }

      // No existing tab — open a new window
      return clients.openWindow(fullUrl);
    }),
  );
});
