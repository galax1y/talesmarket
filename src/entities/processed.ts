interface MarketOffer {
  map_x: number
  map_y: number
  price: number
  quantity: number
}

interface ProcessedItem {
  name: string
  coins: number
  offers: MarketOffer[]
}
