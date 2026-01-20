import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react'
import { LockScreen } from './pages/LockScreen'
import { MainScreen } from './pages/MainScreen'
import { encrypt, decrypt } from './crypto/crypto'
import { getVaultItem, setVaultItem, saveEntry, getAllEntries, deleteEntry as deleteEntryFromStorage } from './storage/storage'
import { setLocale } from './i18n/locales'

export interface DecryptedEntry {
  id: string
  title: string
  url: string
  username: string
  password: string
  notes: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

interface AppContextType {
  isLocked: boolean
  unlocked: boolean
  masterPassword: string | null
  entries: DecryptedEntry[]
  isLoading: boolean
  autoLockTimeout: number
  clipboardClearTime: number
  darkMode: boolean
  locale: string
  lock: () => void
  unlock: (password: string) => Promise<boolean>
  setupVault: (password: string) => Promise<boolean>
  changePassword: (newPassword: string) => Promise<boolean>
  addEntry: (entry: Omit<DecryptedEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateEntry: (id: string, entry: Partial<DecryptedEntry>) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  searchEntries: (query: string) => DecryptedEntry[]
  setAutoLockTimeout: (timeout: number) => void
  setClipboardClearTime: (time: number) => void
  setDarkMode: (enabled: boolean) => void
  setLocale: (locale: string) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export function App() {
  const [isLocked, setIsLocked] = useState(true)
  const [unlocked, setUnlocked] = useState(false)
  const [masterPassword, setMasterPassword] = useState<string | null>(null)
  const [entries, setEntries] = useState<DecryptedEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [autoLockTimeout, setAutoLockTimeout] = useState(5)
  const [clipboardClearTime, setClipboardClearTimeState] = useState(30)
  const [darkMode, setDarkMode] = useState(false)
  const [locale, setLocaleState] = useState('zh-CN')
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clipboardTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current)
    }
    if (!isLocked && autoLockTimeout > 0) {
      idleTimer.current = setTimeout(() => {
        lock()
      }, autoLockTimeout * 60 * 1000)
    }
  }, [isLocked, autoLockTimeout])

  useEffect(() => {
    const handleActivity = () => resetIdleTimer()
    window.addEventListener('click', handleActivity)
    window.addEventListener('keypress', handleActivity)
    window.addEventListener('scroll', handleActivity)
    window.addEventListener('touchstart', handleActivity)

    return () => {
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('keypress', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      window.removeEventListener('touchstart', handleActivity)
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [resetIdleTimer])

  useEffect(() => {
    const init = async () => {
      try {
        const savedDarkMode = await getVaultItem('darkMode')
        const savedLocale = await getVaultItem('locale')
        const savedAutoLock = await getVaultItem('autoLockTimeout')
        const savedClipboardClear = await getVaultItem('clipboardClearTime')
        const hasVault = await getVaultItem('vaultInitialized')

        if (savedDarkMode === 'true') {
          setDarkMode(true)
          document.documentElement.classList.add('dark')
        }
        if (savedLocale) {
          setLocale(savedLocale as any)
          setLocaleState(savedLocale)
        }
        if (savedAutoLock) {
          setAutoLockTimeout(parseInt(savedAutoLock))
        }
        if (savedClipboardClear) {
          setClipboardClearTimeState(parseInt(savedClipboardClear))
        }

        if (hasVault) {
          setIsLocked(true)
        }
      } catch (error) {
        console.error('Init error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const lock = useCallback(() => {
    setIsLocked(true)
    setUnlocked(false)
    setMasterPassword(null)
    setEntries([])
    if (idleTimer.current) {
      clearTimeout(idleTimer.current)
    }
  }, [])

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    try {
      const encryptedTest = await getVaultItem('vaultTest')
      if (!encryptedTest) {
        return false
      }

      await decrypt(JSON.parse(encryptedTest), password)
      setMasterPassword(password)
      setIsLocked(false)
      setUnlocked(true)
      resetIdleTimer()

      const db = await getAllEntries()
      const decryptedEntries: DecryptedEntry[] = []

      for (const entry of db) {
        try {
          const decrypted = await decrypt(entry.encryptedData, password)
          decryptedEntries.push(JSON.parse(decrypted) as DecryptedEntry)
        } catch {
          console.error('Failed to decrypt entry:', entry.id)
        }
      }

      setEntries(decryptedEntries.sort((a, b) => b.updatedAt - a.updatedAt))
      return true
    } catch {
      return false
    }
  }, [resetIdleTimer])

  const setupVault = useCallback(async (password: string): Promise<boolean> => {
    try {
      const testData = 'vault-test'
      const encryptedTest = await encrypt(testData, password)

      await setVaultItem('vaultTest', JSON.stringify(encryptedTest))
      await setVaultItem('vaultInitialized', 'true')
      await setVaultItem('masterPasswordHash', await hashPassword(password))

      setMasterPassword(password)
      setIsLocked(false)
      setUnlocked(true)
      resetIdleTimer()

      return true
    } catch {
      return false
    }
  }, [resetIdleTimer])

  const changePassword = useCallback(async (newPassword: string): Promise<boolean> => {
    if (!masterPassword) return false

    try {
      const testData = 'vault-test'
      const encryptedTest = await encrypt(testData, newPassword)
      await setVaultItem('vaultTest', JSON.stringify(encryptedTest))

      for (const entry of entries) {
        const encrypted = await encrypt(JSON.stringify(entry), newPassword)
        await import('./storage/storage').then(m => m.saveEntry(entry.id, encrypted, entry.createdAt))
      }

      setMasterPassword(newPassword)
      return true
    } catch {
      return false
    }
  }, [masterPassword, entries])

  const addEntry = useCallback(async (entry: Omit<DecryptedEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('addEntry called, masterPassword:', masterPassword ? 'present' : 'null')
    if (!masterPassword) {
      console.error('masterPassword is null')
      return
    }

    const id = crypto.randomUUID?.() || `localpass-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const now = Date.now()
    const fullEntry: DecryptedEntry = {
      ...entry,
      id,
      createdAt: now,
      updatedAt: now
    }

    console.log('添加密码条目:', fullEntry.title)

    const encrypted = await encrypt(JSON.stringify(fullEntry), masterPassword)
    console.log('加密完成，保存到数据库...')
    
    await saveEntry(id, encrypted)
    console.log('保存成功，更新状态...')

    setEntries(prev => {
      const newEntries = [fullEntry, ...prev].sort((a, b) => b.updatedAt - a.updatedAt)
      console.log('状态更新，新条目数:', newEntries.length, '条目标题:', newEntries.map(e => e.title))
      return newEntries
    })
    
    console.log('addEntry 完成')
  }, [masterPassword])

  const updateEntry = useCallback(async (id: string, updates: Partial<DecryptedEntry>) => {
    if (!masterPassword) return

    const existing = entries.find(e => e.id === id)
    if (!existing) return

    const updated: DecryptedEntry = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: Date.now()
    }

    const encrypted = await encrypt(JSON.stringify(updated), masterPassword)
    await saveEntry(id, encrypted, existing.createdAt)

    setEntries(prev => prev.map(e => e.id === id ? updated : e).sort((a, b) => b.updatedAt - a.updatedAt))
  }, [masterPassword, entries])

  const deleteEntry = useCallback(async (id: string) => {
    await deleteEntryFromStorage(id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }, [])

  const searchEntries = useCallback((query: string): DecryptedEntry[] => {
    if (!query.trim()) return entries

    const lowerQuery = query.toLowerCase()
    return entries.filter(entry =>
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.url.toLowerCase().includes(lowerQuery) ||
      entry.username.toLowerCase().includes(lowerQuery) ||
      entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }, [entries])

  const setAutoLockTimeoutFn = useCallback(async (timeout: number) => {
    setAutoLockTimeout(timeout)
    await setVaultItem('autoLockTimeout', String(timeout))
    resetIdleTimer()
  }, [resetIdleTimer])

  const setClipboardClearTimeFn = useCallback(async (time: number) => {
    setClipboardClearTimeState(time)
    await setVaultItem('clipboardClearTime', String(time))
  }, [])

  const setDarkModeFn = useCallback(async (enabled: boolean) => {
    setDarkMode(enabled)
    await setVaultItem('darkMode', String(enabled))
    if (enabled) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const setLocaleFn = useCallback(async (newLocale: string) => {
    setLocaleState(newLocale)
    setLocale(newLocale as any)
    await setVaultItem('locale', newLocale)
  }, [])

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text)

    if (clipboardClearTime > 0) {
      if (clipboardTimer.current) {
        clearTimeout(clipboardTimer.current)
      }
      clipboardTimer.current = setTimeout(async () => {
        await navigator.clipboard.writeText('')
      }, clipboardClearTime * 1000)
    }
  }, [clipboardClearTime])

  const value: AppContextType = {
    isLocked,
    unlocked,
    masterPassword,
    entries,
    isLoading,
    autoLockTimeout,
    clipboardClearTime,
    darkMode,
    locale,
    lock,
    unlock,
    setupVault,
    changePassword,
    addEntry,
    updateEntry,
    deleteEntry,
    searchEntries,
    setAutoLockTimeout: setAutoLockTimeoutFn,
    setClipboardClearTime: setClipboardClearTimeFn,
    setDarkMode: setDarkModeFn,
    setLocale: setLocaleFn
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={value}>
      {isLocked ? <LockScreen /> : <MainScreen onCopy={copyToClipboard} />}
    </AppContext.Provider>
  )
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'localpass-salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return arrayBufferToBase64(hashBuffer)
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
