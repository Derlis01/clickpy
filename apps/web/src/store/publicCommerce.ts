// useAuthStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Commerce, Product } from '@/types/PublicCommerceDataResponse'
import productService from '@/services/productService'

interface publicCommerceStoreModel {
  commerce: Commerce | null
  products: Product[] | []
  isLoading: boolean
  isPrimaryColorLight: boolean
  isCommerceOpen: boolean
  setCommerce: (commerce: Commerce) => void
  setProducts: (products: Product[]) => void
  setCommerceOpen: (isCommerceOpen: boolean) => void
  getPublicProducts: (commercePk: string) => Promise<{ success: boolean; message: string; products?: Product[] }>
  setIsPrimaryColorLight: (isPrimaryColorLight: boolean) => void
}

const usePublicCommerceStore = create<publicCommerceStoreModel>()(
  devtools(
    set => ({
      commerce: null,
      isPrimaryColorLight: true,
      isLoading: false,
      isCommerceOpen: false,
      products: [],
      setCommerce: (commerce: Commerce) => {
        set({
          commerce
        })
      },

      setProducts: (products: Product[]) => {
        set({
          products
        })
      },

      setCommerceOpen: (isCommerceOpen: boolean) => {
        set({
          isCommerceOpen
        })
      },

      getPublicProducts: async (commercePk: string) => {
        set({ isLoading: true })
        const response = await productService.getPublicProducts(commercePk)
        set({ isLoading: false })

        if (response.success === false) {
          return { success: false, message: response.message }
        }

        return { success: true, message: response.message, products: response.products as Product[] }
      },

      setIsPrimaryColorLight: (isPrimaryColorLight: boolean) => {
        set({
          isPrimaryColorLight
        })
      }
    }),
    {
      name: 'publicCommerceStore'
    }
  )
)

export default usePublicCommerceStore
