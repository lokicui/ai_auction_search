import AssetCard from './AssetCard'

export default function AssetCardList({ assets }) {
  if (!assets || assets.length === 0) return null

  return (
    <div className="mt-3">
      <p className="text-sm font-medium text-gray-700 mb-2">为您推荐以下标的：</p>
      <div className="flex flex-col gap-3 md:flex-row md:overflow-x-auto md:pb-2">
        {assets.map((asset, i) => (
          <div key={asset.asset_id || i} className="md:min-w-[300px] md:max-w-[350px] flex-shrink-0">
            <AssetCard asset={asset} />
          </div>
        ))}
      </div>
    </div>
  )
}
