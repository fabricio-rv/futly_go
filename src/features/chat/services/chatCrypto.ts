import { pbkdf2 } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha2';
import { gcm } from '@noble/ciphers/aes';

const CIPHER_PREFIX = 'e2ee:';
const PBKDF2_ITERATIONS = 100_000;
const keyCache = new Map<string, Uint8Array>();

function getRandomIV(): Uint8Array {
  const iv = new Uint8Array(12);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(iv);
  } else {
    const now = Date.now();
    for (let i = 0; i < 12; i++) {
      iv[i] = (Math.floor(Math.random() * 256) ^ ((now >> (i * 2)) & 0xff)) & 0xff;
    }
  }
  return iv;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

function deriveKey(roomId: string): Uint8Array {
  const cached = keyCache.get(roomId);
  if (cached) return cached;

  const enc = new TextEncoder();
  const key = pbkdf2(sha256, enc.encode(roomId), enc.encode('ilumniz-chat-e2ee-v1'), {
    c: PBKDF2_ITERATIONS,
    dkLen: 32,
  });

  keyCache.set(roomId, key);
  return key;
}

export function isEncryptedMessage(content: string | null | undefined): boolean {
  return Boolean(content?.startsWith(CIPHER_PREFIX));
}

export async function encryptMessage(roomId: string, plaintext: string): Promise<string> {
  const key = deriveKey(roomId);
  const iv = getRandomIV();
  const ciphertext = gcm(key, iv).encrypt(new TextEncoder().encode(plaintext));
  return `${CIPHER_PREFIX}${bytesToBase64(iv)}.${bytesToBase64(ciphertext)}`;
}

export async function decryptMessage(roomId: string, content: string): Promise<string> {
  if (!isEncryptedMessage(content)) return content;

  try {
    const key = deriveKey(roomId);
    const payload = content.slice(CIPHER_PREFIX.length);
    const [ivB64, cipherB64] = payload.split('.');
    if (!ivB64 || !cipherB64) return content;

    const plainBytes = gcm(key, base64ToBytes(ivB64)).decrypt(base64ToBytes(cipherB64));
    return new TextDecoder().decode(plainBytes);
  } catch (err) {
    console.error('[chatCrypto] decryptMessage failed:', err);
    return content;
  }
}
