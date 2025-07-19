import { atom } from 'jotai'
import { ProcessedBuyOffer } from '../entities/buy-offer'
import { ProcessedItem, DumbSellItem } from '../entities/processed'

// Store for buymarket data
export const buymarketDataAtom = atom<ProcessedBuyOffer[]>([])

// Store for dummy data
export const dummyDataAtom = atom<DumbSellItem[]>([])

// Store for coins data
export const coinsDataAtom = atom<ProcessedItem[]>([])

// Store for loading states (separate for each data type)
export const buymarketLoadingAtom = atom<boolean>(false)
export const dummyLoadingAtom = atom<boolean>(false)
export const coinsLoadingAtom = atom<boolean>(false)

// Store for error states (separate for each data type)
export const buymarketErrorAtom = atom<string | null>(null)
export const dummyErrorAtom = atom<string | null>(null)
export const coinsErrorAtom = atom<string | null>(null)

// Store for last update timestamp (separate for each data type)
export const buymarketLastUpdateAtom = atom<Date | null>(null)
export const dummyLastUpdateAtom = atom<Date | null>(null)
export const coinsLastUpdateAtom = atom<Date | null>(null)
