import { Item } from './item'

export interface BuyOffer {
  item: Item
  price: number
  amount_remain: number
  store: Store
  is_sub: boolean
}

export interface ProcessedBuyOffer {
  itemName: string
  amount: number
  totalProfit: number
  price: number
  buyLocation: MarketOffer
  sellLocation: MarketOffer
}

interface MarketOffer {
  map_x: number
  map_y: number
  price: number
  quantity: number
}

export interface Store {
  char_id: number
  char_name: string
  shop_name: string
  map_name: string
  map_x: number
  map_y: number
  expires_at: Date
}
