export interface EncryptedData {
  version: number
  salt: string
  iv: string
  ciphertext: string
  authTag: string
}

export interface KeyDerivationParams {
  memory: number
  time: number
  parallelism: number
}

const CURRENT_VERSION = 1
const DEFAULT_ARGON2_PARAMS: KeyDerivationParams = {
  memory: 65536,
  time: 3,
  parallelism: 4
}

export async function deriveKey(
  password: string,
  salt: Uint8Array,
  params: KeyDerivationParams = DEFAULT_ARGON2_PARAMS
): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  const importedKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer,
      iterations: params.time * 100000,
      hash: 'SHA-256'
    } as Pbkdf2Params,
    importedKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function generateSalt(): Promise<Uint8Array> {
  return crypto.getRandomValues(new Uint8Array(16))
}

export async function generateIV(): Promise<Uint8Array> {
  return crypto.getRandomValues(new Uint8Array(12))
}

export async function encrypt(
  plaintext: string,
  password: string,
  salt?: Uint8Array,
  iv?: Uint8Array
): Promise<EncryptedData> {
  const usedSalt = salt || await generateSalt()
  const usedIV = iv || await generateIV()
  const key = await deriveKey(password, usedSalt)

  const encoder = new TextEncoder()
  const plaintextBuffer = encoder.encode(plaintext)

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: usedIV.buffer as ArrayBuffer },
    key,
    plaintextBuffer
  )

  const encryptedArray = new Uint8Array(encryptedBuffer)
  const ciphertext = encryptedArray.slice(0, -16)
  const authTag = encryptedArray.slice(-16)

  return {
    version: CURRENT_VERSION,
    salt: arrayBufferToBase64(usedSalt),
    iv: arrayBufferToBase64(usedIV),
    ciphertext: arrayBufferToBase64(ciphertext),
    authTag: arrayBufferToBase64(authTag)
  }
}

export async function decrypt(
  encryptedData: EncryptedData,
  password: string
): Promise<string> {
  const salt = base64ToArrayBuffer(encryptedData.salt)
  const iv = base64ToArrayBuffer(encryptedData.iv)
  const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext)
  const authTag = base64ToArrayBuffer(encryptedData.authTag)

  const key = await deriveKey(password, new Uint8Array(salt))

  const combined = new Uint8Array(ciphertext.byteLength + authTag.byteLength)
  combined.set(new Uint8Array(ciphertext), 0)
  combined.set(new Uint8Array(authTag), ciphertext.byteLength)

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    combined
  )

  const decoder = new TextDecoder()
  return decoder.decode(decryptedBuffer)
}

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export function serializeEncryptedData(data: EncryptedData): string {
  return JSON.stringify(data)
}

export function parseEncryptedData(json: string): EncryptedData {
  return JSON.parse(json) as EncryptedData
}
