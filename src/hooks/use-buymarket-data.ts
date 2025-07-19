import { useAtom } from 'jotai'
import {
  buymarketDataAtom,
  buymarketLoadingAtom,
  buymarketErrorAtom,
  buymarketLastUpdateAtom
} from '../store/data-store'
import { ProcessedBuyOffer } from '../entities/buy-offer'

export function useBuymarketData() {
  const [data, setData] = useAtom(buymarketDataAtom)
  const [isLoading, setIsLoading] = useAtom(buymarketLoadingAtom)
  const [error, setError] = useAtom(buymarketErrorAtom)
  const [lastUpdate, setLastUpdate] = useAtom(buymarketLastUpdateAtom)

  const updateData = (newData: ProcessedBuyOffer[]) => {
    setData(newData)
    setLastUpdate(new Date())
    setError(null)
  }

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  const setErrorMessage = (message: string | null) => {
    setError(message)
  }

  const clearData = () => {
    setData([])
    setLastUpdate(null)
    setError(null)
  }

  return {
    data,
    isLoading,
    error,
    lastUpdate,
    updateData,
    setLoading,
    setErrorMessage,
    clearData
  }
}
