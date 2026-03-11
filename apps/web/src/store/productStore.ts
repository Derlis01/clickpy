import { create } from 'zustand'
import { AdminProduct, ProductAddon, ProductOption } from '@/types/AdminProduct'
import productService from '@/services/productService'
import { devtools } from 'zustand/middleware'

interface ProductStoreModel {
  products: AdminProduct[]
  product: AdminProduct | null
  categories: string[]
  isLoading: boolean

  // Acciones para productos
  getProducts: () => Promise<void>
  getProduct: (id: string) => Promise<void>
  addProduct: (product: AdminProduct) => Promise<void>
  updateProduct: (product: AdminProduct) => Promise<void>
  duplicateProduct: (product: AdminProduct) => Promise<void>
  deleteProduct: (productSk: string) => Promise<void>
  setActualProduct: (product: AdminProduct | null) => void

  // Acciones para opciones
  addProductOption: (productSk: string, option: ProductOption) => Promise<void>
  updateProductOption: (productSk: string, option: ProductOption) => Promise<void>
  deleteProductOption: (productSk: string, optionId: string) => Promise<void>

  // Acciones para addons
  addProductAddon: (productSk: string, addon: ProductAddon) => Promise<void>
  updateProductAddon: (productSk: string, addon: ProductAddon) => Promise<void>
  deleteProductAddon: (productSk: string, addonId: string) => Promise<void>

  // Acciones para limites de addons
  toggleAddonLimits: (productSk: string, enabled: boolean) => Promise<void>
  updateAddonLimits: (productSk: string, min: number, max: number) => Promise<void>

  // Acciones para visibilidad
  updateProductsVisibility: (productIds: string[], isActive: boolean) => Promise<boolean>
  updateProductsHiddenStatus: (productIds: string[], isHidden: boolean) => Promise<boolean>

  // Acciones para categorías
  updateCategoryName: (productSks: string[], newCategoryName: string) => Promise<boolean>

  // Otras acciones
  fetchProducts: () => Promise<void>
  calculateCategories: (products: AdminProduct[]) => void
  resetStore: () => void
}

const useProductStore = create<ProductStoreModel>()(
  devtools(
    (set, get) => ({
      products: [],
      product: null,
      categories: [],
      isLoading: false,

      getProducts: async () => {
        const response = await productService.getProducts()

        if (response.success === false) {
          return
        }

        set({ products: response.products })
      },

      getProduct: async (id: string) => {
        const product = await productService.getProduct(id)
        set({ product })
      },

      addProduct: async (product: AdminProduct) => {
        const productToAdd = { ...product, imageBase64: product.imageUrl }

        const newProduct = await productService.addProduct(productToAdd)

        if (newProduct) {
          set(currentState => {
            const updatedProducts = [...currentState.products, newProduct]
            get().calculateCategories(updatedProducts)
            return { products: updatedProducts }
          })
        } else {
          return Promise.reject('Failed to add product')
        }
      },

      duplicateProduct: async (product: AdminProduct) => {
        const productToDuplicate = { ...product, imageBase64: product.imageUrl }

        const newProduct = await productService.duplicateProduct(productToDuplicate)

        if (newProduct) {
          set(currentState => {
            const updatedProducts = [...currentState.products, newProduct]
            get().calculateCategories(updatedProducts)
            return { products: updatedProducts }
          })
        } else {
          return Promise.reject('Failed to duplicate product')
        }
      },

      updateProduct: async (product: AdminProduct) => {
        const productUpdated = await productService.updateProduct(product)

        if (productUpdated) {
          set(currentState => {
            const updatedProducts = currentState.products.map(p => (p.sk === product.sk ? productUpdated : p))
            get().calculateCategories(updatedProducts)
            return { products: updatedProducts }
          })
        } else {
          return Promise.reject('Failed to update product')
        }
      },

      setActualProduct: (product: AdminProduct | null) => {
        set({ product })
      },

      deleteProduct: async (productSk: string) => {
        const response = await productService.deleteProduct(productSk)

        set(state => ({
          products: state.products.filter(p => p.sk !== productSk)
        }))
      },

      fetchProducts: async () => {
        try {
          set({ isLoading: true })
          const response = await productService.getProducts()

          if (response.success === false) {
            set({ isLoading: false })
            return
          }

          set({ products: response.products, isLoading: false })
        } catch (error) {
          console.error(error)
        }
      },

      addProductOption: async (productSk: string, option: ProductOption) => {
        const currentProduct = get().products.find(p => p.sk === productSk)
        if (!currentProduct) return

        const updatedProduct = {
          ...currentProduct,
          options: [...(currentProduct.options || []), option]
        }

        await get().updateProduct(updatedProduct)
      },

      updateProductOption: async (productSk: string, updatedOption: ProductOption) => {
        const currentProduct = get().products.find(p => p.sk === productSk)
        if (!currentProduct) return

        const updatedProduct = {
          ...currentProduct,
          options: currentProduct.options?.map(option =>
            option.optionId === updatedOption.optionId ? updatedOption : option
          )
        }

        await get().updateProduct(updatedProduct)
      },

      deleteProductOption: async (productSk: string, optionId: string) => {
        const currentProduct = get().products.find(p => p.sk === productSk)
        if (!currentProduct) return

        const updatedProduct = {
          ...currentProduct,
          options: currentProduct.options?.filter(option => option.optionId !== optionId)
        }

        await get().updateProduct(updatedProduct)
      },

      addProductAddon: async (productSk: string, addon: ProductAddon) => {
        const currentProduct = get().products.find(p => p.sk === productSk)
        if (!currentProduct) return

        const updatedProduct = {
          ...currentProduct,
          addons: [...(currentProduct.addons || []), addon]
        }

        await get().updateProduct(updatedProduct)
      },

      updateProductAddon: async (productSk: string, updatedAddon: ProductAddon) => {
        const currentProduct = get().products.find(p => p.sk === productSk)
        if (!currentProduct) return

        const updatedProduct = {
          ...currentProduct,
          addons: currentProduct.addons?.map(addon => (addon.addonId === updatedAddon.addonId ? updatedAddon : addon))
        }

        await get().updateProduct(updatedProduct)
      },

      deleteProductAddon: async (productSk: string, addonId: string) => {
        const currentProduct = get().products.find(p => p.sk === productSk)
        if (!currentProduct) return

        const updatedProduct = {
          ...currentProduct,
          addons: currentProduct.addons?.filter(addon => addon.addonId !== addonId)
        }

        await get().updateProduct(updatedProduct)
      },

      toggleAddonLimits: async (productSk: string, enabled: boolean) => {
        const currentProduct = get().products.find(p => p.sk === productSk)
        if (!currentProduct) return

        const updatedProduct = {
          ...currentProduct,
          hasAddonLimits: enabled,
          // Si se deshabilitan los límites, resetear min/max
          minAddons: enabled ? currentProduct.minAddons : undefined,
          maxAddons: enabled ? currentProduct.maxAddons : undefined
        }

        await get().updateProduct(updatedProduct)
      },

      updateAddonLimits: async (productSk: string, min: number, max: number) => {
        const currentProduct = get().products.find(p => p.sk === productSk)
        if (!currentProduct) return

        const updatedProduct = {
          ...currentProduct,
          hasAddonLimits: true,
          minAddons: min,
          maxAddons: max
        }

        await get().updateProduct(updatedProduct)
      },

      updateProductsVisibility: async (productIds: string[], isActive: boolean) => {
        const response = await productService.updateProductsVisibility(productIds, isActive)

        if (response.success) {
          // Actualizar productos en el store
          set(state => ({
            products: state.products.map(product =>
              productIds.includes(product.sk) ? { ...product, isActive } : product
            )
          }))
          return true
        }
        return false
      },

      updateProductsHiddenStatus: async (productIds: string[], isHidden: boolean) => {
        const response = await productService.updateProductsHiddenStatus(productIds, isHidden)

        if (response.success) {
          // Actualizar productos en el store
          set(state => ({
            products: state.products.map(product =>
              productIds.includes(product.sk) ? { ...product, isHidden } : product
            )
          }))
          return true
        }
        return false
      },

      updateCategoryName: async (productSks: string[], newCategoryName: string) => {
        const response = await productService.updateCategoryName(productSks, newCategoryName)

        if (response.success) {
          // Actualizar productos en el store
          set(state => ({
            products: state.products.map(product =>
              productSks.includes(product.sk) ? { ...product, category: newCategoryName } : product
            )
          }))
          return true
        }
        return false
      },

      calculateCategories: (products: AdminProduct[]) => {
        const categories = Array.from(new Set(products.map(product => product.category)))

        set({ categories })
      },

      resetStore: () => {
        set({ products: [], product: null, categories: [] })
      }
    }),
    {
      name: 'Product Store'
    }
  )
)

export default useProductStore
