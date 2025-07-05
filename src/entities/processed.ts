interface MarketOffer {
  map_x: number
  map_y: number
  price: number
  quantity: number
}

export interface ProcessedItem {
  name: string
  coins: number
  price: number
  zenyPerCoin: number
  offer: MarketOffer
}

export interface DumbSellItem {
  name: string
  price: number
  amount: number
  npcSellPrice: number
  totalProfit: number
  offer: MarketOffer
}
