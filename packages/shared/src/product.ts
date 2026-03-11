export interface ProductOption {
  optionId: string
  name: string
  values: OptionValue[]
}

export interface OptionValue {
  optionValueId: string
  name: string
  price: number
  isExpanded?: boolean
}

export interface ProductAddon {
  addonId: string
  name: string
  description?: string
  price: number
}
