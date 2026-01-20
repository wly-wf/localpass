import { useRef } from 'react'
import { useApp } from '../App'
import { t } from '../i18n/locales'
import { encrypt } from '../crypto/crypto'
import { saveEntry } from '../storage/storage'

interface ImportPanelProps {
  onClose: () => void
}

export function ImportPanel({ onClose }: ImportPanelProps) {
  const { masterPassword, addEntry } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !masterPassword) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const result = event.target?.result
        if (typeof result !== 'string') {
          throw new Error('Invalid file')
        }
        const data = JSON.parse(result)
        if (!data.entries || !Array.isArray(data.entries)) {
          alert('无效的导入文件格式')
          return
        }

        const confirmed = window.confirm(t('export.importWarning'))
        if (!confirmed) return

        for (const entry of data.entries) {
          if (!entry.title || !entry.username || !entry.password) continue

          const id = crypto.randomUUID()
          const now = Date.now()

          const fullEntry = {
            id,
            ...entry,
            createdAt: now,
            updatedAt: now
          }

          const encrypted = await encrypt(JSON.stringify(fullEntry), masterPassword)
          await saveEntry(id, encrypted, now)

          addEntry(entry as any)
        }

        alert(t('export.importSuccess'))
        onClose()
      } catch {
        alert('导入失败，请检查文件格式')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            导入密码
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm">
            ⚠️ {t('export.warning')}
          </div>

          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm">
            📋 请选择之前导出的 JSON 备份文件进行导入
          </div>

          <div className="pt-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {t('export.import')}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                选择 JSON 备份文件
              </div>
            </button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 pt-2">
            <p>导入说明：</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>仅支持从本应用导出的 JSON 格式备份文件</li>
              <li>导入不会删除现有数据，只会添加新条目</li>
              <li>如果遇到相同标题的条目，将会同时保留</li>
              <li>导入过程中请勿关闭应用</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}