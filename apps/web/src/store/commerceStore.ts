import { create } from 'zustand'
import { CommerceModel, CheckoutConfiguration } from '@/types/commerceModel'
import { devtools } from 'zustand/middleware'
import { getCommerce, putCommerce, updateCheckoutConfiguration } from '@/services/commerceService'
import { initialCommerceSchedule } from '@/constants/admin/businessSchedule'

interface CommerceModelStore extends CommerceModel {
  isLoading: boolean
  setCommerceName: (commerceName: string) => void
  setCommerceAddress: (address: string) => void
  setCommercePhone: (phone: string) => void
  setAskPaymentMethod: (askPaymentMethod: boolean) => Promise<{ error?: string }>
  setCommerceBanner: (commerceBanner: string) => void
  setCommerceSlug: (commercesSlug: string) => void
  setCommerceFacebook: (facebook: string) => void
  setCommerceInstagram: (instagram: string) => void
  setCommerceLogo: (commerceLogo: string) => void
  setCommerceTiktok: (tiktok: string) => void
  setCommerceSchedule: (commerceSchedule: any) => Promise<{ error?: string; success?: string }>
  setCommercePrimaryColor: (primaryColor: string) => void
  setCheckoutConfiguration: (
    checkoutConfiguration: CheckoutConfiguration
  ) => Promise<{ error?: string; success?: string }>
  resetStore: () => void

  // Esto es para poder setear cualquier campo del modelo
  setField: <K extends keyof CommerceModelStore>(
    field: K,
    value: CommerceModelStore[K]
  ) => Promise<{ error?: string; success?: string }>

  // Traer datos de la API
  fetchCommerce: () => Promise<void>
}

const useCommerceStore = create<CommerceModelStore>()(
  devtools(
    (set, get) => ({
      commerceBanner: '',
      commerceLogo: '',
      commerceName: '',
      commerceAddress: '',
      commercePhone: '',
      commercePrimaryColor: '',
      commerceSlug: '',
      commerceInstagram: '',
      commerceFacebook: '',
      commerceTiktok: '',
      commerceSchedule: initialCommerceSchedule,
      askPaymentMethod: false,
      checkoutConfiguration: {
        paymentMethods: {
          cash: true,
          qr: false,
          transfer: false,
          paymentLink: false
        },
        shippingMethods: {
          pickup: true,
          delivery: false,
          dinein: false
        }
      },
      isLoading: false,

      setField: async <K extends keyof CommerceModelStore>(field: K, value: CommerceModelStore[K]) => {
        // Guarda todo el estado antiguo
        const oldState = get()

        // Cambia el estado
        set({ [field]: value })

        try {
          set({ isLoading: true })
          // Intenta hacer la solicitud a la API
          const response = await putCommerce({ [field]: value })
          if (response.success) {
            set({ isLoading: false })
            return { error: undefined, success: 'Se guardó correctamente' }
          } else {
            set({ isLoading: false })
            return { error: response.error }
          }
        } catch (error) {
          // Si algo sale mal, muestra un mensaje de error y vuelve a poner el antiguo estado
          set(oldState)
          return { error: 'Algo salio mal' }
        }
      },

      setCommerceName: commerceName => set({ commerceName }),
      setCommerceAddress: commerceAddress => set({ commerceAddress }),
      setCommercePhone: commercePhone => set({ commercePhone }),
      setAskPaymentMethod: async (askPaymentMethod: boolean) => {
        // Guarda el estado antiguo
        const oldState = get()

        // Cambia el estado
        set({ askPaymentMethod })

        try {
          set({ isLoading: true })
          // Intenta hacer la solicitud a la API
          const response = await putCommerce({ askPaymentMethod })
          if (response.success) {
            set({ isLoading: false })
            return { error: undefined, success: 'Se guardó correctamente' }
          } else {
            set({ isLoading: false })
            return { error: response.error }
          }
        } catch (error) {
          // Si algo sale mal, muestra un mensaje de error y vuelve a poner el antiguo estado
          set(oldState)
          return { error: 'Algo salio mal' }
        }
      },

      setCommerceBanner: async (base64String: string) => {
        // Guarda el estado antiguo
        const oldState = get()

        try {
          set({ isLoading: true })
          // Intenta hacer la solicitud a la API
          const response = await putCommerce({ commerceBanner: base64String })
          if (response.success) {
            // Actualiza el estado de commerceBanner con la URL de la imagen devuelta por la API
            set({ commerceBanner: response.commerceInfo.commerceBanner, isLoading: false })
            return { error: undefined, success: 'Se guardó correctamente' }
          } else {
            set({ isLoading: false })
            return { error: response.error }
          }
        } catch (error) {
          // Si algo sale mal, muestra un mensaje de error y vuelve a poner el antiguo estado
          set(oldState)
          return { error: 'Algo salio mal' }
        }
      },

      setCommerceSlug: commerceSlug => set({ commerceSlug }),

      setCommerceFacebook: commerceFacebook => set({ commerceFacebook }),

      setCommerceInstagram: commerceInstagram => set({ commerceInstagram }),

      setCommerceLogo: async (base64String: string) => {
        // Guarda el estado antiguo
        const oldState = get()

        try {
          set({ isLoading: true })
          // Intenta hacer la solicitud a la API

          const payload = { commerceLogo: base64String }

          const response = await putCommerce(payload)
          if (response.success) {
            // Actualiza el estado de commerceLogo con la URL de la imagen devuelta por la API
            set({ commerceLogo: response.commerceInfo.commerceLogo, isLoading: false })
            return { error: undefined, success: 'Se guardó correctamente' }
          } else {
            set({ isLoading: false })
            return { error: response.error }
          }
        } catch (error) {
          // Si algo sale mal, muestra un mensaje de error y vuelve a poner el antiguo estado
          set(oldState)
          return { error: 'Algo salio mal' }
        }
      },

      setCommerceTiktok: commerceTiktok => set({ commerceTiktok }),
      setCommerceSchedule: async (commerceSchedule: any) => {
        const oldState = get()
        set({ commerceSchedule })

        try {
          set({ isLoading: true })
          const response = await putCommerce({ commerceSchedule })
          if (response.success) {
            set({ isLoading: false })
            return { success: 'Horario actualizado correctamente' }
          } else {
            set({ isLoading: false })
            return { error: response.error }
          }
        } catch (error) {
          set(oldState)
          return { error: 'Algo salió mal' }
        }
      },
      setCommercePrimaryColor: commercePrimaryColor => set({ commercePrimaryColor }),

      setCheckoutConfiguration: async (checkoutConfiguration: CheckoutConfiguration) => {
        const oldState = get()
        set({ checkoutConfiguration })

        try {
          set({ isLoading: true })
          const response = await updateCheckoutConfiguration(checkoutConfiguration)
          if (response.success) {
            set({ isLoading: false })
            return { success: 'Configuración actualizada correctamente' }
          } else {
            set({ isLoading: false })
            return { error: response.error }
          }
        } catch (error) {
          set(oldState)
          return { error: 'Algo salió mal' }
        }
      },

      fetchCommerce: async () => {
        set({ isLoading: true })
        const response = await getCommerce()
        const commerceInfo = response.commerceInfo

        set(prevState => ({
          ...prevState,
          commerceBanner: commerceInfo.commerceBanner ?? prevState.commerceBanner,
          commerceLogo: commerceInfo.commerceLogo ?? prevState.commerceLogo,
          commerceName: commerceInfo.commerceName ?? prevState.commerceName,
          commerceAddress: commerceInfo.commerceAddress ?? prevState.commerceAddress,
          commercePhone: commerceInfo.commercePhone ?? prevState.commercePhone,
          commercePrimaryColor: commerceInfo.commercePrimaryColor ?? prevState.commercePrimaryColor,
          commerceSlug: commerceInfo.commerceSlug ?? prevState.commerceSlug,
          commerceInstagram: commerceInfo.commerceInstagram ?? prevState.commerceInstagram,
          commerceFacebook: commerceInfo.commerceFacebook ?? prevState.commerceFacebook,
          commerceTiktok: commerceInfo.commerceTiktok ?? prevState.commerceTiktok,
          commerceSchedule: commerceInfo.commerceSchedule ?? prevState.commerceSchedule,
          askPaymentMethod: commerceInfo.askPaymentMethod ?? prevState.askPaymentMethod,
          checkoutConfiguration: {
            paymentMethods: commerceInfo.paymentMethods ??
              prevState.checkoutConfiguration?.paymentMethods ?? {
                cash: true,
                qr: false,
                transfer: false,
                paymentLink: false
              },
            shippingMethods: commerceInfo.shippingMethods ??
              prevState.checkoutConfiguration?.shippingMethods ?? {
                pickup: true,
                delivery: false,
                dinein: false
              }
          }
        }))
        set({ isLoading: false })
      },

      resetStore: () =>
        set({
          commerceBanner: '',
          commerceLogo: '',
          commerceName: '',
          commerceAddress: '',
          commercePhone: '',
          commercePrimaryColor: '',
          commerceSlug: '',
          commerceInstagram: '',
          commerceFacebook: '',
          commerceTiktok: '',
          commerceSchedule: initialCommerceSchedule,
          askPaymentMethod: false,
          checkoutConfiguration: {
            paymentMethods: {
              cash: true,
              qr: false,
              transfer: false,
              paymentLink: false
            },
            shippingMethods: {
              pickup: true,
              delivery: false,
              dinein: false
            }
          },
          isLoading: false
        })
    }),
    {
      name: 'Commerce Store'
    }
  )
)

export default useCommerceStore
