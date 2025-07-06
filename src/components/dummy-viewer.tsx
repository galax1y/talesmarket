import { useState } from 'react'
import { DumbSellItem } from '../entities/processed'
import { DumbSellItemCard } from './dummy-card'

export function DummyViewer() {
  const [results, setResults] = useState<DumbSellItem[]>([])

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return

    try {
      const fileContent = await files[0].text()
      const json = JSON.parse(fileContent) as DumbSellItem[]
      setResults(json)
    } catch (err) {
      console.error(`Invalid JSON in file: ${files[0].name}`, err)
    }
  }

  return (
    <div className="bg-slate-900 text-slate-100 py-8 px-4">
      <main className="max-w-3xl mx-auto rounded-lg px-2">
        <div className="mb-6 flex flex-col gap-2 items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-100">
            Upload dummy sells result file
          </h1>
          <input
            type="file"
            accept=".json"
            onChange={(e) => handleFiles(e.target.files)}
            className="p-2 text-sm file:bg-blue-600 file:text-white file:px-3 file:py-1.5 file:rounded-md file:border-0 file:cursor-pointer bg-slate-800 text-slate-300 rounded-md"
          />
        </div>

        {results.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="mb-4 border border-slate-700 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-slate-800 rounded-b-lg">
                {results.map((item, index) => (
                  <DumbSellItemCard key={index} item={item} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
