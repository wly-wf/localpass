type Locale = 'zh-CN' | 'en-US'

interface TranslationValue {
  [key: string]: string | string[] | TranslationValue
}

const translations: Record<Locale, TranslationValue> = {
  'zh-CN': {
    app: { title: 'LocalPass', subtitle: '本地密码管理器' },
    lock: {
      title: '欢迎使用 LocalPass',
      subtitle: '请设置主密码以保护您的密码库',
      setupTitle: '设置主密码',
      unlockTitle: '解锁密码库',
      confirmPassword: '确认密码',
      setupButton: '创建密码库',
      unlockButton: '解锁',
      error: {
        passwordTooShort: '密码长度至少需要 8 个字符',
        passwordMismatch: '两次输入的密码不一致',
        wrongPassword: '密码错误',
        setupFailed: '密码库初始化失败'
      }
    },
    main: {
      searchPlaceholder: '搜索网站、账号、标签...',
      addButton: '添加密码',
      emptyTitle: '暂无密码',
      emptySubtitle: '点击右上角添加您的第一个密码',
      lockButton: '锁定',
      settingsButton: '设置'
    },
    entry: {
      title: '网站/应用名称',
      url: '网址',
      username: '账号',
      password: '密码',
      notes: '备注',
      tags: '标签（用逗号分隔）',
      createdAt: '创建时间',
      updatedAt: '更新时间',
      saveButton: '保存',
      cancelButton: '取消',
      deleteButton: '删除',
      copyUsername: '复制账号',
      copyPassword: '复制密码',
      showPassword: '显示密码',
      hidePassword: '隐藏密码',
      generatedPassword: '已生成强密码',
      confirmDelete: '确定要删除此密码吗？此操作不可恢复。'
    },
    export: {
      title: '导出密码',
      warning: '警告：导出文件包含明文密码，请妥善保管！',
      txt: '导出为 TXT',
      pdf: '导出为 PDF',
      json: '导出为 JSON（备份）',
      import: '导入 JSON',
      importButton: '导入',
      importWarning: '导入将覆盖现有数据，请确认！',
      success: '导出成功',
      importSuccess: '导入成功'
    },
    settings: {
      title: '设置',
      changePassword: '修改主密码',
      autoLock: '自动锁定时间',
      autoLockOptions: {
        '1': '1 分钟',
        '5': '5 分钟',
        '15': '15 分钟',
        '30': '30 分钟',
        never: '从不'
      },
      clipboardClear: '复制后自动清空剪贴板',
      clipboardClearTime: '清空时间',
      clipboardClearOptions: {
        '10': '10 秒',
        '30': '30 秒',
        '60': '60 秒',
        never: '从不'
      },
      darkMode: '深色模式',
      language: '语言',
      about: '关于'
    },
    toast: {
      copied: '已复制到剪贴板',
      cleared: '剪贴板已清空',
      saved: '已保存',
      deleted: '已删除',
      exported: '已导出',
      imported: '已导入',
      error: '操作失败'
    },
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  },
  'en-US': {
    app: { title: 'LocalPass', subtitle: 'Local Password Manager' },
    lock: {
      title: 'Welcome to LocalPass',
      subtitle: 'Set a master password to protect your vault',
      setupTitle: 'Set Master Password',
      unlockTitle: 'Unlock Vault',
      confirmPassword: 'Confirm Password',
      setupButton: 'Create Vault',
      unlockButton: 'Unlock',
      error: {
        passwordTooShort: 'Password must be at least 8 characters',
        passwordMismatch: 'Passwords do not match',
        wrongPassword: 'Incorrect password',
        setupFailed: 'Vault initialization failed'
      }
    },
    main: {
      searchPlaceholder: 'Search website, username, tags...',
      addButton: 'Add Password',
      emptyTitle: 'No Passwords',
      emptySubtitle: 'Tap the + button to add your first password',
      lockButton: 'Lock',
      settingsButton: 'Settings'
    },
    entry: {
      title: 'Website/App Name',
      url: 'URL',
      username: 'Username',
      password: 'Password',
      notes: 'Notes',
      tags: 'Tags (comma separated)',
      createdAt: 'Created',
      updatedAt: 'Updated',
      saveButton: 'Save',
      cancelButton: 'Cancel',
      deleteButton: 'Delete',
      copyUsername: 'Copy Username',
      copyPassword: 'Copy Password',
      showPassword: 'Show Password',
      hidePassword: 'Hide Password',
      generatedPassword: 'Strong password generated',
      confirmDelete: 'Are you sure you want to delete this password? This cannot be undone.'
    },
    export: {
      title: 'Export Passwords',
      warning: 'Warning: Export files contain plain text passwords, please keep them safe!',
      txt: 'Export as TXT',
      pdf: 'Export as PDF',
      json: 'Export as JSON (Backup)',
      import: 'Import JSON',
      importButton: 'Import',
      importWarning: 'Import will overwrite existing data, please confirm!',
      success: 'Export successful',
      importSuccess: 'Import successful'
    },
    settings: {
      title: 'Settings',
      changePassword: 'Change Master Password',
      autoLock: 'Auto-lock timeout',
      autoLockOptions: {
        '1': '1 minute',
        '5': '5 minutes',
        '15': '15 minutes',
        '30': '30 minutes',
        never: 'Never'
      },
      clipboardClear: 'Auto-clear clipboard after copy',
      clipboardClearTime: 'Clear time',
      clipboardClearOptions: {
        '10': '10 seconds',
        '30': '30 seconds',
        '60': '60 seconds',
        never: 'Never'
      },
      darkMode: 'Dark Mode',
      language: 'Language',
      about: 'About'
    },
    toast: {
      copied: 'Copied to clipboard',
      cleared: 'Clipboard cleared',
      saved: 'Saved',
      deleted: 'Deleted',
      exported: 'Exported',
      imported: 'Imported',
      error: 'Operation failed'
    },
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  }
}

let currentLocale: Locale = 'zh-CN'

export function setLocale(locale: Locale): void {
  currentLocale = locale
}

export function getLocale(): Locale {
  return currentLocale
}

export function t(key: string): string {
  const keys = key.split('.')
  let current: TranslationValue | string | string[] = translations[currentLocale]

  for (const k of keys) {
    if (current === undefined || typeof current === 'string' || Array.isArray(current)) {
      return key
    }
    current = current[k]
  }

  if (typeof current === 'string') {
    return current
  }
  return key
}

export function tMonths(): string[] {
  return translations[currentLocale].months as string[]
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
