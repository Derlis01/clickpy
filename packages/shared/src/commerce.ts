export interface Schedule {
  dayNumber: number
  active: boolean
  day: string
  hours: Hour[]
}

export interface Hour {
  initUtcDate: string
  endUtcDate: string
}

export interface PaymentMethods {
  cash: boolean
  qr: boolean
  transfer: boolean
  paymentLink: boolean
}

export interface ShippingMethods {
  pickup: boolean
  delivery: boolean
  dinein: boolean
}

export interface CheckoutConfiguration {
  paymentMethods: PaymentMethods
  shippingMethods: ShippingMethods
}
