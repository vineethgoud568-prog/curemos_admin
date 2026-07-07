// Firebase Configuration
export const firebaseConfig = {
  apiKey: process.env.NEXT_APP_FIREBASE_API_KEY || 'AIzaSyAUtUhSzlNnRrx4qf-jqJYSIfJENKQ0xuU',
  authDomain: process.env.NEXT_APP_FIREBASE_AUTH_DOMAIN || 'curemos-admin.firebaseapp.com',
  projectId: process.env.NEXT_APP_FIREBASE_PROJECT_ID || 'curemos-admin',
  storageBucket: process.env.NEXT_APP_FIREBASE_STORAGE_BUCKET || 'curemos-admin.firebasestorage.app',
  messagingSenderId: process.env.NEXT_APP_FIREBASE_MESSAGING_SENDER_ID || '1098731833131',
  appId: process.env.NEXT_APP_FIREBASE_APP_ID || '1:1098731833131:web:2c78aeabc9649aea12e76e',
  measurementId: process.env.NEXT_APP_FIREBASE_MEASUREMENT_ID || '',
};

export const firebaseVapidKey = process.env.NEXT_APP_FIREBASE_VAP_ID_KEY || 'BINb2pvjDGEzUKj-nMMtf_XT1hkGBEWnmnZP28U3hc4kYwE5MWMmjwTktZCBEVp-nlCAN0I3QiamvTscHL8McTs';
