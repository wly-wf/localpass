import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { EncryptedData } from '../crypto/crypto'

interface PasswordEntry {
  id: string
  encryptedData: EncryptedData
  createdAt: number
  updatedAt: number
}

interface LocalPassDB extends DBSchema {
  passwords: {
    key: string
    value: PasswordEntry
    indexes: { 'by-created': number, 'by-updated': number }
  }
  vault: {
    key: string
    value: {
      key: string
      value: string
    }
  }
}

const DB_NAME = 'localpass-db'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<LocalPassDB> | null = null

export async function getDB(): Promise<IDBPDatabase<LocalPassDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<LocalPassDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('passwords')) {
        const passwordStore = db.createObjectStore('passwords', { keyPath: 'id' })
        passwordStore.createIndex('by-created', 'createdAt')
        passwordStore.createIndex('by-updated', 'updatedAt')
      }
      if (!db.objectStoreNames.contains('vault')) {
        db.createObjectStore('vault', { keyPath: 'key' })
      }
    }
  })

  return dbInstance
}

export async function saveEntry(
  id: string,
  encryptedData: EncryptedData,
  createdAt?: number
): Promise<void> {
  const db = await getDB()
  const now = Date.now()
  const existing = await db.get('passwords', id)

  await db.put('passwords', {
    id,
    encryptedData,
    createdAt: createdAt ?? existing?.createdAt ?? now,
    updatedAt: now
  })
}

export async function getEntry(id: string): Promise<PasswordEntry | undefined> {
  const db = await getDB()
  return db.get('passwords', id)
}

export async function getAllEntries(): Promise<PasswordEntry[]> {
  const db = await getDB()
  return db.getAllFromIndex('passwords', 'by-created')
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('passwords', id)
}

export async function clearAllEntries(): Promise<void> {
  const db = await getDB()
  await db.clear('passwords')
}

export async function getVaultItem(key: string): Promise<string | undefined> {
  const db = await getDB()
  const item = await db.get('vault', key)
  return item?.value
}

export async function setVaultItem(key: string, value: string): Promise<void> {
  const db = await getDB()
  await db.put('vault', { key, value })
}

export async function getAllVaultItems(): Promise<Record<string, string>> {
  const db = await getDB()
  const items = await db.getAll('vault')
  const result: Record<string, string> = {}
  for (const item of items) {
    result[item.key] = item.value
  }
  return result
}
