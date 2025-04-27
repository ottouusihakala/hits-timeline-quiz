import { Session } from "@/app/types";

function getSessionEncryptionKey() {
  const key = process.env.SESSION_SECRET!;
  return crypto.subtle.importKey('raw', Buffer.from(key, 'base64'), { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function encryptSession(session: Session): Promise<string> {
  const enc = new TextEncoder();
  const encoded = enc.encode(JSON.stringify(session));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const secretKey = await getSessionEncryptionKey();
  const cipherText = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, secretKey, encoded);
  return Buffer.from(`${Buffer.from(iv).toString('base64')}:${Buffer.from(cipherText).toString('base64')}`).toString('base64');
}

export async function decryptSession(sessionStr: string): Promise<string> {
  const [iv, cipherText] = Buffer.from(sessionStr, 'base64').toString('utf8').split(':');
  const secretKey = await getSessionEncryptionKey();
  const clearText = await crypto.subtle.decrypt({
    name: 'AES-GCM',
    iv: Buffer.from(iv, 'base64'),
  }, secretKey, Buffer.from(cipherText, 'base64'));
  return new TextDecoder().decode(clearText);
}