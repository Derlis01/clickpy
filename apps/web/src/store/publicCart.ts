// useAuthStore.ts
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { Customer, OrderPreferences, ProductCart } from '@/types/PublicCommerceDataResponse'

interface SelectedOption {
  optionId: string
  valueId: string
  name: string
  price: number
}

interface SelectedAddon {
  addonId: string
  name: string
  price: number
}

export interface CartProductSelections {
  selectedOption?: SelectedOption
  selectedAddons: SelectedAddon[]
}

// Extender el tipo ProductCart existente
interface ExtendedProductCart extends ProductCart {
  selections: CartProductSelections
}

export interface PublicCartStore {
  products: ProductCart[] | null
  commerceCustomer: Customer | null
  orderPreferences: OrderPreferences | null
  temporarySelections: CartProductSelections
  workingSelections: CartProductSelections

  // Métodos
  setCommerceCustomer: (customer: Customer) => void
  removeCommerceCustomer: () => void
  clearProducts: () => void
  setProductToCart: (product: ProductCart) => void
  removeProduct: (product: ProductCart) => void

  // Métodos para selecciones temporales
  setTemporaryOption: (option: SelectedOption | undefined) => void
  addTemporaryAddon: (addon: SelectedAddon) => void
  removeTemporaryAddon: (addonId: string) => void
  clearTemporarySelections: () => void
  commitSelections: (unicCartId: number, quantity?: number) => void // Agregamos quantity opcional

  // Métodos para manejo de selecciones en proceso
  initializeWorkingSelections: (selections: CartProductSelections) => void
  setWorkingOption: (option: SelectedOption | undefined) => void
  commitWorkingSelections: () => void

  setOrderPreferences: (preferences: OrderPreferences) => void
}

interface PublicCartModel {
  products: ProductCart[] | null
  commerceCustomer: Customer | null
  orderPreferences: OrderPreferences | null
  setCommerceCustomer: (customer: Customer) => void
  removeCommerceCustomer: () => void
  setProductToCart: (product: ProductCart) => void
  removeProduct: (product: ProductCart) => void
  clearProducts: () => void
}

const usePublicCart = create<PublicCartStore>()(
  devtools(
    persist(
      (set, get) => ({
        products: null,
        commerceCustomer: null,
        orderPreferences: null,
        temporarySelections: {
          selectedOption: undefined,
          selectedAddons: []
        },
        workingSelections: {
          selectedOption: undefined,
          selectedAddons: []
        },

        setProductToCart: (product: ProductCart) => {
          set(state => {
            const temporarySelections = get().temporarySelections
            const currentProducts = state.products || []

            const extendedProduct: ExtendedProductCart = {
              ...product,
              selections: {
                selectedOption: temporarySelections.selectedOption,
                selectedAddons: temporarySelections.selectedAddons
              }
            }

            // Recalcular el precio total basado en las selecciones
            let totalPrice = product.price
            if (temporarySelections.selectedOption) {
              totalPrice = temporarySelections.selectedOption.price
            }
            if (temporarySelections.selectedAddons.length > 0) {
              totalPrice += temporarySelections.selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
            }
            extendedProduct.total = totalPrice * product.quantity

            return {
              products: [...currentProducts, extendedProduct]
            }
          })
        },

        // Métodos para manejar selecciones temporales
        setTemporaryOption: (option: SelectedOption | undefined) =>
          set(state => ({
            temporarySelections: {
              ...state.temporarySelections,
              selectedOption: option
            }
          })),

        removeProduct: (product: ProductCart) => {
          set(state => ({
            products: state.products?.filter(p => p.unicCartId !== product.unicCartId) || null
          }))
        },

        addTemporaryAddon: (addon: SelectedAddon) =>
          set(state => ({
            temporarySelections: {
              ...state.temporarySelections,
              selectedAddons: [...state.temporarySelections.selectedAddons, addon]
            }
          })),

        removeTemporaryAddon: (addonId: string) =>
          set(state => ({
            temporarySelections: {
              ...state.temporarySelections,
              selectedAddons: state.temporarySelections.selectedAddons.filter(addon => addon.addonId !== addonId)
            }
          })),

        clearTemporarySelections: () =>
          set({
            temporarySelections: {
              selectedOption: undefined,
              selectedAddons: []
            }
          }),

        commitSelections: (unicCartId: number, quantity?: number) =>
          set(state => {
            if (!state.products) return state

            return {
              products: state.products.map(product =>
                product.unicCartId === unicCartId
                  ? {
                      ...product,
                      quantity: quantity || product.quantity,
                      // Mantener las selecciones existentes si no hay temporales
                      selections:
                        state.temporarySelections.selectedOption || state.temporarySelections.selectedAddons.length > 0
                          ? { ...state.temporarySelections }
                          : product.selections || { selectedOption: undefined, selectedAddons: [] },
                      total: (() => {
                        // Usar selecciones temporales si existen, sino usar las del producto
                        const hasTemporarySelections =
                          state.temporarySelections.selectedOption ||
                          state.temporarySelections.selectedAddons.length > 0
                        const selections = hasTemporarySelections ? state.temporarySelections : product.selections

                        const basePrice = selections?.selectedOption?.price || product.price
                        const addonsPrice =
                          selections?.selectedAddons?.reduce((sum, addon) => sum + addon.price, 0) || 0
                        const finalQuantity = quantity || product.quantity
                        return (basePrice + addonsPrice) * finalQuantity
                      })()
                    }
                  : product
              )
            }
          }),

        // Métodos para manejo de selecciones en proceso
        initializeWorkingSelections: (selections: CartProductSelections) =>
          set({
            workingSelections: { ...selections }
          }),

        setWorkingOption: (option: SelectedOption | undefined) =>
          set(state => ({
            workingSelections: {
              ...state.workingSelections,
              selectedOption: option
            }
          })),

        commitWorkingSelections: () =>
          set(state => ({
            temporarySelections: { ...state.workingSelections }
          })),

        // Métodos existentes
        setCommerceCustomer: (customer: Customer) => set({ commerceCustomer: customer }),
        removeCommerceCustomer: () => set({ commerceCustomer: null }),
        clearProducts: () => set({ products: null }),

        setOrderPreferences: (preferences: OrderPreferences) => set({ orderPreferences: preferences })
      }),
      {
        name: 'Cart Store'
      }
    ),
    {
      name: 'CartStoreP75'
    }
  )
)

export default usePublicCart
