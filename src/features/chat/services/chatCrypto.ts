const CIPHER_PREFIX = 'e2ee:';
const PBKDF2_ITERATIONS = 100_000;
const keyCache = new Map<string, CryptoKey>();

function getCrypto() {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.subtle || !cryptoApi.getRandomValues) {
    throw new Error('WebCrypto AES-GCM indisponivel neste runtime. Instale um polyfill nativo antes de habilitar E2EE no mobile.');
  }

  return cryptoApi;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function deriveKey(roomId: string) {
  const cached = keyCache.get(roomId);
  if (cached) return cached;

  const cryptoApi = getCrypto();
  const enc = new TextEncoder();
  const rawKey = await cryptoApi.subtle.importKey(
    'raw',
    enc.encode(roomId),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  const key = await cryptoApi.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('ilumniz-chat-e2ee-v1'),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    rawKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );

  keyCache.set(roomId, key);
  return key;
}

export function isEncryptedMessage(content: string | null | undefined) {
  return Boolean(content?.startsWith(CIPHER_PREFIX));
}

export async function encryptMessage(roomId: string, plaintext: string) {
  const cryptoApi = getCrypto();
  const key = await deriveKey(roomId);
  const iv = cryptoApi.getRandomValues(new Uint8Array(12));
  const cipherBuffer = await cryptoApi.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext),
  );

  return `${CIPHER_PREFIX}${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(cipherBuffer))}`;
}

export async function decryptMessage(roomId: string, content: string) {
  if (!isEncryptedMessage(content)) return content;

  try {
    const cryptoApi = getCrypto();
    const payload = content.slice(CIPHER_PREFIX.length);
    const [ivB64, cipherB64] = payload.split('.');
    if (!ivB64 || !cipherB64) return content;

    const plainBuffer = await cryptoApi.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBytes(ivB64) },
      await deriveKey(roomId),
      base64ToBytes(cipherB64),
    );

    return new TextDecoder().decode(plainBuffer);
  } catch {
    return content;
  }
}
