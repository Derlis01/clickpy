export interface OptionValue {
  optionValueId: string
  name: string
  price_modifier: number
}

export interface ProductOption {
  optionId: string
  name: string
  required: boolean
  values: OptionValue[]
}

export interface ProductAddon {
  addonId: string
  name: string
  description?: string
  price: number
}

export interface ProductCategory {
  id: string
  branch_id: string
  name: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  branch_id: string
  category_id: string | null
  name: string
  description: string
  price: number
  cover_image: string
  images: string[]
  is_deleted: boolean
  is_active: boolean
  is_hidden: boolean
  sort_order: number
  options: ProductOption[]
  addons: ProductAddon[]
  has_addon_limits: boolean
  min_addons: number | null
  max_addons: number | null
  created_at: string
  updated_at: string
}
