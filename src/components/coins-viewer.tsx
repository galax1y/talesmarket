import { useState } from 'react'
import { ProcessedItem } from '../entities/processed'
import { ItemCard } from './item-card'

function groupItemsByZenyPerCoin(items: ProcessedItem[]) {
  return {
    '2000–2499 Z/C': items.filter(
      (item) => item.zenyPerCoin >= 2000 && item.zenyPerCoin < 2500
    ),
    '2500–2999 Z/C': items.filter(
      (item) => item.zenyPerCoin >= 2500 && item.zenyPerCoin < 3000
    ),
    '3000+ Z/C': items.filter((item) => item.zenyPerCoin >= 3000)
  }
}

export function CoinsViewer() {
  const [results, setResults] = useState<ProcessedItem[]>([])
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return

    try {
      const fileContent = await files[0].text()
      const json = JSON.parse(fileContent) as ProcessedItem[]
      setResults(json)
    } catch (err) {
      console.error(`Invalid JSON in file: ${files[0].name}`, err)
    }
  }

  const grouped = groupItemsByZenyPerCoin(results.slice(0, 100))

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName]
    }))
  }

  return (
    <div className="bg-slate-900 text-slate-100 py-8 px-4">
      <main className="max-w-3xl mx-auto">
        <div className="mb-6 flex flex-col gap-2 items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-100">
            Upload instance coins result file
          </h1>
          <input
            type="file"
            accept=".json"
            onChange={(e) => handleFiles(e.target.files)}
            className="p-2 text-sm file:bg-blue-600 file:text-white file:px-3 file:py-1.5 file:rounded-md file:border-0 file:cursor-pointer bg-slate-800 text-slate-300 rounded-md"
          />
        </div>

        {Object.entries(grouped).map(([priceRange, items]) => {
          if (!items.length) return null

          const isOpen = openGroups[priceRange]

          return (
            <div
              key={priceRange}
              className="mb-4 border border-slate-700 rounded-lg"
            >
              <button
                className="w-full text-left px-4 py-2 bg-slate-800 hover:bg-slate-700 font-semibold rounded-t-lg"
                onClick={() => toggleGroup(priceRange)}
              >
                {priceRange} Zeny ({items.length} items)
              </button>

              {isOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-slate-800 rounded-b-lg">
                  {items.map((item, index) => (
                    <ItemCard key={index} item={item} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </main>
    </div>
  )
}
