import { useState, useEffect } from 'react'
import { useApp } from '../App'
import { getVaultItem } from '../storage/storage'
import { t } from '../i18n/locales'

export function LockScreen() {
  const { unlock, setupVault, darkMode } = useApp()
  const [mode, setMode] = useState<'setup' | 'unlock'>('setup')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)

  useEffect(() => {
    const checkVault = async () => {
      const hasVault = await getVaultItem('vaultInitialized')
      setMode(hasVault ? 'unlock' : 'setup')
    }
    checkVault()
  }, [])

  const checkPasswordStrength = (pwd: string): 'weak' | 'medium' | 'strong' => {
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^a-zA-Z0-9]/.test(pwd)) score++

    if (score <= 2) return 'weak'
    if (score <= 4) return 'medium'
    return 'strong'
  }

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd)
    if (mode === 'setup') {
      setPasswordStrength(checkPasswordStrength(pwd))
    }
  }

  const getStrengthLabel = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'weak': return '弱 - 建议使用更复杂的密码'
      case 'medium': return '中 - 可以更好'
      case 'strong': return '强 - 安全性良好'
    }
  }

  const getStrengthColor = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'weak': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'strong': return 'bg-green-500'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (mode === 'setup') {
        if (password.length < 8) {
          setError('密码长度至少需要 8 个字符')
          setIsLoading(false)
          return
        }
        if (password !== confirmPassword) {
          setError(t('lock.error.passwordMismatch'))
          setIsLoading(false)
          return
        }
        if (passwordStrength === 'weak') {
          setError('密码强度太弱，请使用更复杂的密码')
          setIsLoading(false)
          return
        }
        const success = await setupVault(password)
        if (!success) {
          setError(t('lock.error.setupFailed'))
        }
      } else {
        const success = await unlock(password)
        if (!success) {
          setError(t('lock.error.wrongPassword'))
        }
      }
    } catch {
      setError(t('toast.error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('app.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'setup' ? t('lock.subtitle') : t('lock.unlockTitle')}
          </p>
        </div>

        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 ${darkMode ? 'dark' : ''}`}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            {mode === 'setup' ? t('lock.setupTitle') : t('lock.unlockTitle')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {mode === 'setup' ? t('lock.setupTitle') : t('lock.unlockTitle')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                autoFocus
              />
              {mode === 'setup' && password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'weak' ? getStrengthColor('weak') : 'bg-gray-200'}`} />
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'medium' || passwordStrength === 'strong' ? getStrengthColor('medium') : 'bg-gray-200'}`} />
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? getStrengthColor('strong') : 'bg-gray-200'}`} />
                  </div>
                  <p className={`text-xs ${passwordStrength === 'weak' ? 'text-red-500' : passwordStrength === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                    {passwordStrength ? getStrengthLabel(passwordStrength) : ''}
                  </p>
                </div>
              )}
            </div>

            {mode === 'setup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('lock.confirmPassword')}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs">
                  <p className="font-medium mb-1">密码建议：</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>至少 8 位字符（推荐 16 位以上）</li>
                    <li>包含大写字母、小写字母</li>
                    <li>包含数字和特殊字符</li>
                    <li>不要使用常见密码或个人信息</li>
                  </ul>
                </div>
              </>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (mode === 'setup' && password.length < 8)}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              {isLoading ? '...' : (mode === 'setup' ? t('lock.setupButton') : t('lock.unlockButton'))}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {mode === 'setup'
            ? '设置主密码后，请务必妥善保管，忘记将无法恢复数据'
            : '输入主密码解锁您的密码库'}
        </p>
      </div>
    </div>
  )
}
