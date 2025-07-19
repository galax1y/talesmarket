import { useAtom } from 'jotai'
import {
  coinsDataAtom,
  coinsLoadingAtom,
  coinsErrorAtom,
  coinsLastUpdateAtom
} from '../store/data-store'
import { ProcessedItem } from '../entities/processed'

export function useCoinsData() {
  const [data, setData] = useAtom(coinsDataAtom)
  const [isLoading, setIsLoading] = useAtom(coinsLoadingAtom)
  const [error, setError] = useAtom(coinsErrorAtom)
  const [lastUpdate, setLastUpdate] = useAtom(coinsLastUpdateAtom)

  const updateData = (newData: ProcessedItem[]) => {
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
