import type { Schedule, Hour, CheckoutConfiguration } from '@clickpy/shared'
export type { Schedule, Hour, CheckoutConfiguration } from '@clickpy/shared'

export interface CommerceModel {
  commerceBanner: string
  commerceLogo: string
  commerceName: string
  commerceAddress: string
  commercePhone: string
  commercePrimaryColor: string
  commerceSlug: string
  commerceInstagram: string
  commerceFacebook: string
  commerceTiktok: string
  commerceSchedule: Schedule[]
  askPaymentMethod: boolean
  checkoutConfiguration?: CheckoutConfiguration
}

export type CommerceInsightsResponse = {
  insightId: string
  insightType: 'positivo' | 'negativo' | 'neutral'
  title: string
  briefDescription: string
  problem: string
  recommendedAction: string
  expectedOutcome: string
  trackingMetric: string
  supportingData: {
    [key: string]: any
  }
  reviewInterval: string
  maxReviewDate: string
  // ...other fields from API
}
