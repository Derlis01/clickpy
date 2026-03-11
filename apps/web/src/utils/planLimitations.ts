import useProductStore from '@/store/productStore'
import { useUserPlan } from '@/hooks/useUserPlan'
import { PLANS_LIMITATIONS } from '@/constants/admin/planLimitations'

export type PlanType = keyof typeof PLANS_LIMITATIONS

export const useProductLimit = () => {
  const products = useProductStore(state => state.products)
  const { currentPlan } = useUserPlan()
  const maxProducts = currentPlan ? PLANS_LIMITATIONS[currentPlan].maxProducts : 0

  const isLimitReached = products.length >= maxProducts

  return { isLimitReached, maxProducts }
}
