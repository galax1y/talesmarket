import { useState } from 'react'
import { DumbSellItem } from '../entities/processed'

interface DumbSellItemCardProps {
  item: DumbSellItem
}

export function DumbSellItemCard({ item }: DumbSellItemCardProps) {
  const [copied, setCopied] = useState(false)
  const [hidden, setHidden] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `@market ${item.offer.map_x}/${item.offer.map_y}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (hidden) return null

  return (
    <div className="border border-slate-300 rounded-xl p-3 text-sm bg-white shadow-sm hover:shadow-md transition flex flex-col gap-1">
      <div className="font-bold text-slate-800 capitalize">{item.name}</div>

      <div className="flex justify-between text-slate-600">
        <span>Price:</span>
        <span>{item.price.toLocaleString()}</span>
      </div>

      <div className="flex justify-between text-slate-600">
        <span>Amount:</span>
        <span>{item.amount}</span>
      </div>

      <div className="flex justify-between text-slate-600">
        <span>NPC Value:</span>
        <span>{item.npcSellPrice.toString()}</span>
      </div>

      <div className="flex justify-between text-slate-600">
        <span>Total Profit:</span>
        <span className="text-green-700 font-medium">
          {item.totalProfit.toLocaleString()}
        </span>
      </div>

      <div className="flex justify-between items-center mt-2">
        <button
          onClick={handleCopy}
          className="px-2 py-1 rounded-lg bg-blue-600 text-blue-100 hover:bg-blue-800 transition cursor-pointer"
        >
          {copied ? 'Copied! ✅' : 'Copy 📍'}
        </button>

        <button
          onClick={() => setHidden(true)}
          className="px-2 py-1 rounded-lg bg-red-600 text-red-100 hover:bg-red-800 transition cursor-pointer"
        >
          Hide
        </button>
      </div>
    </div>
  )
}
