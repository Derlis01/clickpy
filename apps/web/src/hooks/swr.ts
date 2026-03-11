import useSWR from 'swr'
import instance from '../utils/axios'

export const useApi = (pathKey: string) => {
  const { data, isLoading, error } = useSWR(pathKey, instance, {
    refreshInterval: 10000
  })

  return { data, isLoading, error }
}
