interface MarketOffer {
  map_x: number
  map_y: number
  price: number
  quantity: number
}

export interface ProcessedItem {
  name: string
  coins: number
  zenyPerCoin: number
  offers: MarketOffer[]
}
