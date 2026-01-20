import { useState } from 'react'
import { useApp } from '../App'
import { t } from '../i18n/locales'

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const {
    autoLockTimeout,
    clipboardClearTime,
    darkMode,
    locale,
    setAutoLockTimeout,
    setClipboardClearTime,
    setDarkMode,
    setLocale: setLocaleFn,
    changePassword
  } = useApp()

  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)

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

  const getStrengthLabel = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'weak': return '弱'
      case 'medium': return '中'
      case 'strong': return '强'
    }
  }

  const getStrengthColor = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'weak': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'strong': return 'bg-green-500'
    }
  }

  const handleNewPasswordChange = (pwd: string) => {
    setNewPassword(pwd)
    setPasswordStrength(checkPasswordStrength(pwd))
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    if (newPassword.length < 8) {
      setPasswordError('新密码长度至少需要 8 个字符')
      return
    }
    if (passwordStrength === 'weak') {
      setPasswordError('密码强度太弱，请使用更复杂的密码')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致')
      return
    }

    const success = await changePassword(newPassword)
    if (success) {
      setPasswordSuccess(true)
      setTimeout(() => {
        setShowChangePassword(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setPasswordSuccess(false)
        setPasswordStrength(null)
      }, 1500)
    } else {
      setPasswordError('修改失败，请检查当前密码是否正确')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('settings.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            title={t('entry.cancelButton')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              {t('settings.autoLock')}
            </h3>
            <select
              value={autoLockTimeout}
              onChange={(e) => setAutoLockTimeout(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={1}>{t('settings.autoLockOptions.1')}</option>
              <option value={5}>{t('settings.autoLockOptions.5')}</option>
              <option value={15}>{t('settings.autoLockOptions.15')}</option>
              <option value={30}>{t('settings.autoLockOptions.30')}</option>
              <option value={0}>{t('settings.autoLockOptions.never')}</option>
            </select>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              {t('settings.clipboardClear')}
            </h3>
            <select
              value={clipboardClearTime}
              onChange={(e) => setClipboardClearTime(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={10}>{t('settings.clipboardClearOptions.10')}</option>
              <option value={30}>{t('settings.clipboardClearOptions.30')}</option>
              <option value={60}>{t('settings.clipboardClearOptions.60')}</option>
              <option value={0}>{t('settings.clipboardClearOptions.never')}</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700 dark:text-gray-300">{t('settings.darkMode')}</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              title={darkMode ? '切换到浅色模式' : '切换到深色模式'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              {t('settings.language')}
            </h3>
            <select
              value={locale}
              onChange={(e) => setLocaleFn(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
            </select>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="w-full py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              title="修改主密码"
            >
              {t('settings.changePassword')}
            </button>

            {showChangePassword && (
              <div className="mt-4 space-y-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="当前密码"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => handleNewPasswordChange(e.target.value)}
                  placeholder="新密码（至少8位）"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {newPassword && (
                  <div className="flex gap-1 mb-2">
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'weak' ? getStrengthColor('weak') : 'bg-gray-200'}`} />
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'medium' || passwordStrength === 'strong' ? getStrengthColor('medium') : 'bg-gray-200'}`} />
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? getStrengthColor('strong') : 'bg-gray-200'}`} />
                    <span className={`text-xs ml-2 ${passwordStrength === 'weak' ? 'text-red-500' : passwordStrength === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                      {passwordStrength ? getStrengthLabel(passwordStrength) : ''}
                    </span>
                  </div>
                )}
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="确认新密码"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {passwordError && (
                  <p className="text-red-500 text-sm">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-green-500 text-sm">密码修改成功</p>
                )}
                <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-700 dark:text-blue-300">
                  <p className="font-medium">密码建议：</p>
                  <p>• 至少 8 位，推荐 16 位以上</p>
                  <p>• 包含大小写字母、数字、特殊字符</p>
                </div>
                <button
                  onClick={handleChangePassword}
                  className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  确认修改
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <p>LocalPass v1.0.0</p>
            <p className="mt-1">数据仅存储在本地设备，不会上传到任何服务器。</p>
          </div>
        </div>
      </div>
    </div>
  )
}
