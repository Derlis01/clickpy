import { CartProductSelections } from '@/store/publicCart'
import { ProductAddon, ProductOption } from './AdminProduct'
export type { Customer } from '@clickpy/shared'

export interface CommerceResponse {
  commerceInfo: Commerce
}

export interface Commerce {
  commerceLogo: string
  commerceName: string
  commercePhone: string
  commerceAddress: string
  commerceFacebook?: string
  commerceInstagram?: string
  commerceTiktok?: string
  commerceBanner: string
  commercePrimaryColor: string
  sk: string
  askPaymentMethod: boolean
  commerceSchedule: CommerceSchedule[]
  pk: string
  commerceSlug: string
  commerceCategory: string
  paymentMethods: {
    qr: boolean
    transfer: boolean
    paymentLink: boolean
    cash: boolean
  }
  shippingMethods: {
    pickup: boolean
    delivery: boolean
    dinein: boolean
  }
}

export interface CommerceSchedule {
  dayNumber: number
  active: boolean
  hours: Hour[]
  day: string
}

export interface Hour {
  endUtcDate: Date
  initUtcDate: Date
}

export interface Product {
  price: number
  imageUrl: string
  sk: string
  description: string
  pk: string
  category: string
  productName: string
  options?: ProductOption[]
  addons?: ProductAddon[]
  hasAddonLimits: boolean
  minAddons?: number
  maxAddons?: number
  selectedOptionId?: string
}

export interface ProductCart extends Product {
  unicCartId: number
  quantity: number
  total: number
  selections?: CartProductSelections
}

export interface OrderPreferences {
  serviceType: string
  paymentMethod: string
  deliveryType: string
}
