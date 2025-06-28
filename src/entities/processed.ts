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
