import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAssetDetail } from '../services/api'

function formatPrice(price) {
  if (price >= 100000000) return `¥${(price / 100000000).toFixed(2)}亿`
  if (price >= 10000) return `¥${(price / 10000).toFixed(1)}万`
  return `¥${price.toFixed(0)}`
}

export default function AssetDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [asset, setAsset] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAssetDetail(id)
      .then(res => setAsset(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-center text-gray-400">加载中...</div>
  if (!asset) return <div className="p-8 text-center text-gray-400">资产不存在</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-1">
        ← 返回
      </button>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{asset.title}</h1>
          {asset.status && (
            <span className={`text-sm px-3 py-1 rounded-full ${
              asset.status === '正在拍卖' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>{asset.status}</span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {asset.asset_type && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">类别</p>
              <p className="font-medium">{asset.asset_type}</p>
            </div>
          )}
          {asset.region && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">所在地</p>
              <p className="font-medium">{asset.region}</p>
            </div>
          )}
          {asset.price > 0 && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">起拍价</p>
              <p className="font-medium text-red-500">{formatPrice(asset.price)}</p>
            </div>
          )}
          {asset.area > 0 && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">面积</p>
              <p className="font-medium">{asset.area}㎡</p>
            </div>
          )}
        </div>

        {asset.description && (
          <div>
            <h2 className="font-semibold text-gray-700 mb-2">详细描述</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{asset.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}
