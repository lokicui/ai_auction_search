function formatPrice(price) {
  if (price >= 10000) return `¥${(price / 10000).toFixed(1)}万`
  return `¥${price.toFixed(0)}`
}

export default function AssetTable({ assets, onDelete, loading }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">标题</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">类别</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">所在地</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">起拍价</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">状态</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody>
          {assets.map(a => (
            <tr key={a.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 max-w-xs truncate font-medium">{a.title}</td>
              <td className="px-4 py-3">
                {a.asset_type && <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{a.asset_type}</span>}
              </td>
              <td className="px-4 py-3 text-gray-600">{a.region || '-'}</td>
              <td className="px-4 py-3 text-red-500 font-medium">{a.price > 0 ? formatPrice(a.price) : '-'}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  a.status === '正在拍卖' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>{a.status}</span>
              </td>
              <td className="px-4 py-3">
                <button onClick={() => onDelete(a.id)} disabled={loading}
                  className="text-red-500 hover:text-red-700 text-sm">删除</button>
              </td>
            </tr>
          ))}
          {assets.length === 0 && (
            <tr><td colSpan={6} className="text-center py-8 text-gray-400">暂无数据</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
