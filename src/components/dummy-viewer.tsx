import { useState } from 'react'
import { DumbSellItem } from '../entities/processed'
import { DumbSellItemCard } from './dummy-card'
import { useDummyData } from '../hooks/use-dummy-data'

export function DummyViewer() {
  const {
    data,
    isLoading,
    error,
    lastUpdate,
    updateData,
    setLoading,
    setErrorMessage,
    clearData
  } = useDummyData()

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return

    try {
      setLoading(true)
      setErrorMessage(null)
      const fileContent = await files[0].text()
      const json = JSON.parse(fileContent) as DumbSellItem[]
      updateData(json)
    } catch (err) {
      console.error(`Invalid JSON in file: ${files[0].name}`, err)
      setErrorMessage(`Invalid JSON in file: ${files[0].name}`)
    } finally {
      setLoading(false)
    }
  }

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never'
    return date.toLocaleString()
  }

  return (
    <div className="bg-slate-900 text-slate-100 py-8 px-4">
      <main className="max-w-3xl mx-auto rounded-lg px-2">
        <div className="mb-6 flex flex-col gap-2 items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-100">
            Dummy Data Viewer
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

        {data.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="mb-4 border border-slate-700 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-slate-800 rounded-b-lg">
                {data.map((item: DumbSellItem, index: number) => (
                  <DumbSellItemCard key={index} item={item} />
                ))}
              </div>
            </div>
          </div>
        )}

        {data.length === 0 && !isLoading && !error && (
          <div className="text-center py-8 text-slate-400">
            No data loaded. Please upload a dummy JSON file.
          </div>
        )}
      </main>
    </div>
  )
}
