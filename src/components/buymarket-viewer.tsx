import { useState } from 'react'
import { ProcessedBuyOffer } from '../entities/buy-offer'
import { useBuymarketData } from '../hooks/use-buymarket-data'

function groupItemsByProfit(items: ProcessedBuyOffer[]) {
  return {
    'Ultra Profit (100k+)': items.filter((item) => item.totalProfit >= 100000),
    'High Profit (10k+)': items.filter((item) => item.totalProfit >= 10000),
    'Medium Profit (5k-10k)': items.filter(
      (item) => item.totalProfit >= 5000 && item.totalProfit < 10000
    ),
    'Low Profit (1k-5k)': items.filter(
      (item) => item.totalProfit >= 1000 && item.totalProfit < 5000
    ),
    'Minimal Profit (<1k)': items.filter((item) => item.totalProfit < 1000)
  }
}

export function BuymarketViewer() {
  const {
    data,
    isLoading,
    error,
    lastUpdate,
    updateData,
    setLoading,
    setErrorMessage,
    clearData
  } = useBuymarketData()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return

    try {
      setLoading(true)
      setErrorMessage(null)
      const fileContent = await files[0].text()
      const json = JSON.parse(fileContent) as ProcessedBuyOffer[]
      updateData(json)
    } catch (err) {
      console.error(`Invalid JSON in file: ${files[0].name}`, err)
      setErrorMessage(`Invalid JSON in file: ${files[0].name}`)
    } finally {
      setLoading(false)
    }
  }

  const grouped = groupItemsByProfit(data.slice(0, 100))

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName]
    }))
  }

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never'
    return date.toLocaleString()
  }

  const [copied, setCopied] = useState(false)
  const [copiedBuy, setCopiedBuy] = useState<number | null>(null)
  const [copiedSell, setCopiedSell] = useState<number | null>(null)

  const handleCopy = (
    type: 'market' | 'buymarket',
    coords: { x: number; y: number },
    setCopiedFn: React.Dispatch<React.SetStateAction<number | null>>,
    idx: number
  ) => {
    const prefix = type === 'market' ? '@market' : '@buymarket'
    navigator.clipboard.writeText(`${prefix} ${coords.x}/${coords.y}`)
    setCopiedFn(idx)
    setTimeout(() => setCopiedFn(null), 1500)
  }

  return (
    <div className="bg-slate-900 text-slate-100 py-8 px-4">
      <main className="max-w-3xl mx-auto">
        <div className="mb-6 flex flex-col gap-2 items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-100">
            Buymarket Data Viewer
          </h1>
          <div className="flex gap-2 items-center">
            <input
              type="file"
              accept=".json"
              onChange={(e) => handleFiles(e.target.files)}
              className="p-2 text-sm file:bg-blue-600 file:text-white file:px-3 file:py-1.5 file:rounded-md file:border-0 file:cursor-pointer bg-slate-800 text-slate-300 rounded-md"
            />
            <button
              onClick={clearData}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-4 text-blue-400">Loading data...</div>
        )}

        {error && (
          <div className="text-center py-4 text-red-400">Error: {error}</div>
        )}

        {lastUpdate && (
          <div className="text-center py-2 text-slate-400 text-sm">
            Last updated: {formatLastUpdate(lastUpdate)}
          </div>
        )}

        {data.length > 0 && (
          <div className="mb-4 text-center text-slate-300">
            Total items: {data.length}
          </div>
        )}

        {Object.entries(grouped).map(([profitRange, items]) => {
          if (!items.length) return null

          const isOpen = openGroups[profitRange]

          return (
            <div
              key={profitRange}
              className="mb-4 border border-slate-700 rounded-lg"
            >
              <button
                className="w-full text-left px-4 py-2 bg-slate-800 hover:bg-slate-700 font-semibold rounded-t-lg"
                onClick={() => toggleGroup(profitRange)}
              >
                {profitRange} ({items.length} items)
              </button>

              {isOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-slate-800 rounded-b-lg">
                  {items.map((item, index) => (
                    <div key={index} className="bg-slate-700 p-3 rounded-md">
                      <div className="font-semibold text-slate-200">
                        {item.itemName}
                      </div>
                      <div className="text-sm text-slate-300">
                        <div>Price: {item.price.toLocaleString()} Z</div>
                        <div>Amount: {item.amount}</div>
                        <div className="text-green-400">
                          Profit: {item.totalProfit.toLocaleString()} Z
                        </div>
                        <button
                          onClick={() =>
                            handleCopy(
                              'market',
                              {
                                x: item.buyLocation.map_x,
                                y: item.buyLocation.map_y
                              },
                              setCopiedBuy,
                              index
                            )
                          }
                          className="px-2 py-1 rounded-lg bg-blue-600 text-blue-100 hover:bg-blue-800 transition cursor-pointer mr-2"
                        >
                          {copiedBuy === index ? 'Copied! ✅' : 'Copy Buy 📍'}
                        </button>
                        <button
                          onClick={() =>
                            handleCopy(
                              'buymarket',
                              {
                                x: item.sellLocation.map_x,
                                y: item.sellLocation.map_y
                              },
                              setCopiedSell,
                              index
                            )
                          }
                          className="px-2 py-1 rounded-lg bg-yellow-600 text-yellow-100 hover:bg-yellow-800 transition cursor-pointer"
                        >
                          {copiedSell === index ? 'Copied! ✅' : 'Copy Sell 💰'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {data.length === 0 && !isLoading && !error && (
          <div className="text-center py-8 text-slate-400">
            No data loaded. Please upload a buymarket JSON file.
          </div>
        )}
      </main>
    </div>
  )
}
