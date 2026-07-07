import { encryptionKey } from '../constants';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
export const isBrowser = typeof window !== 'undefined';

// Must be exactly 32 bytes for AES-256
const secretKey = encoder.encode(encryptionKey.padEnd(32, '_'));

// Helper to import key
const getEncryptionKey = async (): Promise<CryptoKey> => {
  return crypto.subtle.importKey('raw', secretKey, 'AES-GCM', false, ['encrypt', 'decrypt']);
};

// Generate random IV for each encryption
const generateIV = () => crypto.getRandomValues(new Uint8Array(12));

// Encrypt function - accepts any serializable data
export const encrypt = async (payload: unknown): Promise<string> => {
  const key = await getEncryptionKey();
  const iv = generateIV();
  const encoded = encoder.encode(JSON.stringify(payload));

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoded,
  );

  // Return base64 string: iv + ciphertext
  const encryptedBytes = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  encryptedBytes.set(iv, 0);
  encryptedBytes.set(new Uint8Array(ciphertext), iv.byteLength);

  return btoa(String.fromCharCode(...encryptedBytes));
};

// Decrypt function
export const decrypt = async (encrypted: string): Promise<unknown | null> => {
  try {
    const encryptedBytes = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));

    // Validate minimum length (IV + some data)
    if (encryptedBytes.length < 13) {
      throw new Error('Invalid encrypted data length');
    }

    const iv = encryptedBytes.slice(0, 12);
    const data = encryptedBytes.slice(12);

    const key = await getEncryptionKey();
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      data,
    );

    return JSON.parse(decoder.decode(decrypted));
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};
