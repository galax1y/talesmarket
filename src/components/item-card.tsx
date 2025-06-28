import { ProcessedItem } from '../entities/processed'

interface ItemCardProps {
  item: ProcessedItem
}

export function ItemCard({ item }: ItemCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(
      `@market ${item.offer.map_x}/${item.offer.map_y}`
    )
    alert('Market coordinates copied to clipboard!')
  }

  return (
    <div className="border rounded-lg p-2 text-sm text-gray-800 flex flex-col gap-1 bg-white shadow-sm hover:shadow-md transition">
      <div className="font-semibold capitalize">{item.name}</div>
      <div>
        <span className="font-medium">Zeny:</span> {item.price.toLocaleString()}
      </div>
      <div>
        <span className="font-medium">Coins:</span> {item.coins}
      </div>
      <div>
        <span className="font-medium">Z/C:</span> {item.zenyPerCoin}
      </div>
      <button
        onClick={handleCopy}
        className="mt-1 self-start text-blue-600 hover:underline"
      >
        Copy 📍
      </button>
    </div>
  )
}
