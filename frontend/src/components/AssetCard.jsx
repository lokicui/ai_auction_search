import { useNavigate } from 'react-router-dom'

function formatPrice(price) {
  if (price >= 100000000) return `¥${(price / 100000000).toFixed(2)}亿`
  if (price >= 10000) return `¥${(price / 10000).toFixed(1)}万`
  return `¥${price.toFixed(0)}`
}

const TYPE_COLORS = {
  '住宅': 'bg-blue-100 text-blue-700',
  '商铺': 'bg-orange-100 text-orange-700',
  '写字楼': 'bg-purple-100 text-purple-700',
  '车辆': 'bg-green-100 text-green-700',
  '土地': 'bg-yellow-100 text-yellow-700',
  '设备': 'bg-cyan-100 text-cyan-700',
  '知识产权': 'bg-pink-100 text-pink-700',
}

export default function AssetCard({ asset, showScore = true }) {
  const navigate = useNavigate()
  const colorClass = TYPE_COLORS[asset.asset_type] || 'bg-gray-100 text-gray-700'
  const score = asset.similarity_score || 0

  return (
    <div onClick={() => navigate(`/asset/${asset.asset_id || asset.id}`)}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800 text-base leading-tight flex-1 mr-2">{asset.title}</h3>
        {showScore && score > 0 && (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 ${
            score >= 70 ? 'border-green-400 text-green-600' : score >= 50 ? 'border-yellow-400 text-yellow-600' : 'border-red-400 text-red-600'
          }`}>
            {score}
          </div>
        )}
      </div>

      {(asset.summary || asset.description) && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{asset.summary || asset.description}</p>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        {asset.asset_type && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>{asset.asset_type}</span>
        )}
        {asset.region && (
          <span className="text-xs text-gray-500">📍 {asset.region}</span>
        )}
        {asset.price > 0 && (
          <span className="text-xs font-semibold text-red-500">💰 {formatPrice(asset.price)}</span>
        )}
      </div>

      {asset.match_reason && (
        <p className="text-xs text-blue-600 mt-2 bg-blue-50 px-2 py-1 rounded">💡 {asset.match_reason}</p>
      )}
    </div>
  )
}
