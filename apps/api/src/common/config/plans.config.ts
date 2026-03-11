export type PlanName = 'free' | 'entrepreneur' | 'business' | 'enterprise';

export const PLANS_LIMITATIONS: Record<PlanName, { maxProducts: number }> = {
  free: { maxProducts: 10 },
  entrepreneur: { maxProducts: 100000 },
  business: { maxProducts: 100000 },
  enterprise: { maxProducts: 100000 },
};
