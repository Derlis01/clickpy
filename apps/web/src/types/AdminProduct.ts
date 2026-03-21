export type { ProductOption, OptionValue, ProductAddon } from '@clickpy/shared'
import type { ProductOption, ProductAddon } from '@clickpy/shared'

export interface AdminProduct {
  id: string
  imageUrl: string
  productName: string
  price: number
  description: string
  category: string
  categoryId: string
  categorySortOrder: number
  sortOrder: number
  options?: ProductOption[]
  addons?: ProductAddon[]
  hasAddonLimits: boolean
  isActive: boolean
  isHidden: boolean
  minAddons?: number
  maxAddons?: number
  selectedOptionId?: string
}

export interface AdminProductSummary {
  productId: string
  name: string
  price: number
  imageUrl: string
  category: string
}
