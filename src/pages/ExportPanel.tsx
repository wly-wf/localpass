import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { useApp } from '../App'
import { t } from '../i18n/locales'

interface ExportPanelProps {
  onClose: () => void
}

export function ExportPanel({ onClose }: ExportPanelProps) {
  const { entries, masterPassword } = useApp()

  const generateFilename = (type: string) => {
    const date = new Date().toISOString().split('T')[0]
    return `localpass-export-${date}.${type}`
  }

  const exportTxt = () => {
    if (!masterPassword) return

    let content = `LocalPass 导出 - ${new Date().toLocaleString()}\n`
    content += '='.repeat(50) + '\n\n'

    entries.forEach((entry, idx) => {
      content += `[${idx + 1}] ${entry.title}\n`
      content += `  网址: ${entry.url || '-'}\n`
      content += `  账号: ${entry.username}\n`
      content += `  密码: ${entry.password}\n`
      if (entry.notes) content += `  备注: ${entry.notes}\n`
      if (entry.tags.length) content += `  标签: ${entry.tags.join(', ')}\n`
      content += `  更新时间: ${new Date(entry.updatedAt).toLocaleString()}\n`
      content += '\n' + '-'.repeat(30) + '\n\n'
    })

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = generateFilename('txt')
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPdf = async () => {
    if (!masterPassword) return

    const escapeHtml = (text: string) => {
      const div = document.createElement('div')
      div.textContent = text
      return div.innerHTML
    }

    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    tempDiv.style.top = '0'
    tempDiv.style.width = '800px'
    tempDiv.style.backgroundColor = 'white'
    tempDiv.style.color = 'black'
    tempDiv.style.fontFamily = 'Arial, sans-serif'
    tempDiv.style.padding = '20px'
    tempDiv.style.boxSizing = 'border-box'
    
    const content = `
      <div style="font-family: Arial, sans-serif; color: black;">
        <h1 style="font-size: 24px; margin-bottom: 20px;">LocalPass 导出 - ${new Date().toLocaleDateString()}</h1>
        ${entries.map((entry, idx) => `
          <div style="margin-bottom: 30px; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
            <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">[${idx + 1}] ${escapeHtml(entry.title ?? '')}</h2>
            <div style="font-size: 14px; line-height: 1.6;">
              <div><strong>网址:</strong> ${escapeHtml(entry.url || '-')}</div>
              <div><strong>账号:</strong> ${escapeHtml(entry.username)}</div>
              <div><strong>密码:</strong> ${escapeHtml(entry.password)}</div>
              ${entry.notes ? `<div><strong>备注:</strong> ${escapeHtml(entry.notes.length > 50 ? entry.notes.substring(0, 50) + '...' : entry.notes)}</div>` : ''}
              ${entry.tags.length ? `<div><strong>标签:</strong> ${escapeHtml(entry.tags.join(', '))}</div>` : ''}
              <div style="font-size: 12px; color: #666; margin-top: 8px;">
                <strong>更新时间:</strong> ${new Date(entry.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `
    
    tempDiv.innerHTML = content
    document.body.appendChild(tempDiv)
    
    try {
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      const imgWidth = pageWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      let heightLeft = imgHeight
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
      heightLeft -= pageHeight - 30
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= pageHeight - 30
      }
      
      pdf.save(generateFilename('pdf'))
    } catch (error) {
      console.error('PDF导出失败:', error)
      alert('PDF导出失败，请重试')
    } finally {
      document.body.removeChild(tempDiv)
    }
  }

  const exportJson = () => {
    if (!masterPassword) return

    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      entries: entries.map(e => ({
        title: e.title,
        url: e.url,
        username: e.username,
        password: e.password,
        notes: e.notes,
        tags: e.tags
      }))
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = generateFilename('json')
    a.click()
    URL.revokeObjectURL(url)
  }



  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('export.title')}
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

          <button
            onClick={exportTxt}
            className="w-full py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
          >
            <div className="font-medium text-gray-900 dark:text-white">
              {t('export.txt')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              人类可读的文本格式
            </div>
          </button>

          <button
            onClick={exportPdf}
            className="w-full py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
          >
            <div className="font-medium text-gray-900 dark:text-white">
              {t('export.pdf')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              适合打印和归档
            </div>
          </button>

          <button
            onClick={exportJson}
            className="w-full py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
          >
            <div className="font-medium text-gray-900 dark:text-white">
              {t('export.json')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              便于备份和迁移
            </div>
          </button>


        </div>
      </div>
    </div>
  )
}
