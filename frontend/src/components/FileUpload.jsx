import { useState, useRef } from 'react'

export default function FileUpload({ onUpload, loading }) {
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const handleFile = (file) => {
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      onUpload(file)
    }
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
      onClick={() => fileRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      }`}>
      <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
        onChange={e => handleFile(e.target.files[0])} />
      <div className="text-4xl mb-2">📥</div>
      <p className="text-gray-600 font-medium">
        {loading ? '上传中...' : '拖拽 Excel 文件到此处，或点击选择文件'}
      </p>
      <p className="text-gray-400 text-sm mt-1">支持 .xlsx / .xls 格式</p>
    </div>
  )
}
