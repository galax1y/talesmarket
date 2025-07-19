import { useAtom } from 'jotai'
import {
  dummyDataAtom,
  dummyLoadingAtom,
  dummyErrorAtom,
  dummyLastUpdateAtom
} from '../store/data-store'
import { DumbSellItem } from '../entities/processed'

export function useDummyData() {
  const [data, setData] = useAtom(dummyDataAtom)
  const [isLoading, setIsLoading] = useAtom(dummyLoadingAtom)
  const [error, setError] = useAtom(dummyErrorAtom)
  const [lastUpdate, setLastUpdate] = useAtom(dummyLastUpdateAtom)

  const updateData = (newData: DumbSellItem[]) => {
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
