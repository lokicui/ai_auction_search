import { useState, useEffect, useCallback } from 'react'
import FileUpload from '../components/FileUpload'
import AssetTable from '../components/AssetTable'
import { getAssets, uploadAssets, deleteAsset, downloadTemplate } from '../services/api'

export default function AdminPage() {
  const [assets, setAssets] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })

  const loadAssets = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await getAssets(p, 10)
      setAssets(res.data.assets)
      setTotal(res.data.total)
      setPage(p)
    } catch { setMsg({ text: '加载失败', type: 'error' }) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadAssets() }, [loadAssets])

  const handleUpload = async (file) => {
    setUploading(true)
    setMsg({ text: '', type: '' })
    try {
      const res = await uploadAssets(file)
      setMsg({ text: res.message, type: 'success' })
      loadAssets(1)
    } catch (err) {
      setMsg({ text: err.response?.data?.detail || '上传失败', type: 'error' })
    } finally { setUploading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定删除此资产？')) return
    try {
      await deleteAsset(id)
      setMsg({ text: '删除成功', type: 'success' })
      loadAssets(page)
    } catch { setMsg({ text: '删除失败', type: 'error' }) }
  }

  const handleDownloadTemplate = async () => {
    try {
      const res = await downloadTemplate()
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url; a.download = 'asset_template.xlsx'; a.click()
      URL.revokeObjectURL(url)
    } catch { setMsg({ text: '下载模板失败', type: 'error' }) }
  }

  const totalPages = Math.ceil(total / 10)

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">📦 资产管理</h2>

      {/* Stats + Upload */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center gap-6 mb-4">
          <div>
            <p className="text-sm text-gray-400">资产总数</p>
            <p className="text-3xl font-bold text-gray-800">{total}</p>
          </div>
          <button onClick={handleDownloadTemplate}
            className="ml-auto px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            📄 下载模板
          </button>
        </div>
        <FileUpload onUpload={handleUpload} loading={uploading} />
      </div>

      {/* Messages */}
      {msg.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>{msg.text}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <AssetTable assets={assets} onDelete={handleDelete} loading={loading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-gray-500">共 {total} 条</span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => loadAssets(i + 1)}
                  className={`w-8 h-8 rounded text-sm ${
                    page === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                  }`}>{i + 1}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
