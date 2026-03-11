import { PRICING_TIERS } from '@/constants/branches'

/**
 * Redondea hacia arriba al múltiplo de 500 más cercano
 */
function roundToNearest500(price: number): number {
  return Math.ceil(price / 500) * 500
}

/**
 * Calcula el precio de delivery usando modelo escalonado acumulativo
 * - Tramo 1 (0-2km): 10.000 Gs fijos
 * - Tramo 2 (2-4km): +7.000 Gs/km
 * - Tramo 3 (4-8km): +8.000 Gs/km
 * - Tramo 4 (8km+): +10.000 Gs/km
 */
export function calculateDeliveryPrice(distanceInMeters: number): number {
  const distanceKm = distanceInMeters / 1000

  // Edge case: distancia 0 o negativa
  if (distanceKm <= 0) {
    return PRICING_TIERS.base.price
  }

  // Tramo 1: Base fija (0-2km)
  if (distanceKm <= PRICING_TIERS.base.limit) {
    return PRICING_TIERS.base.price
  }

  let totalCost = PRICING_TIERS.base.price
  let remainingKm = distanceKm - PRICING_TIERS.base.limit

  // Tramo 2: 2-4km (+7.000 Gs/km)
  const tier2Distance = Math.min(remainingKm, PRICING_TIERS.tier2.limit)
  totalCost += tier2Distance * PRICING_TIERS.tier2.rate
  remainingKm -= tier2Distance

  if (remainingKm <= 0) {
    return roundToNearest500(totalCost)
  }

  // Tramo 3: 4-8km (+8.000 Gs/km)
  const tier3Distance = Math.min(remainingKm, PRICING_TIERS.tier3.limit)
  totalCost += tier3Distance * PRICING_TIERS.tier3.rate
  remainingKm -= tier3Distance

  if (remainingKm <= 0) {
    return roundToNearest500(totalCost)
  }

  // Tramo 4: 8km+ (+10.000 Gs/km)
  totalCost += remainingKm * PRICING_TIERS.tier4.rate

  return roundToNearest500(totalCost)
}

export function formatDuration(durationInSeconds: number): string {
  const minutes = Math.round(durationInSeconds / 60)

  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}min`
}

export function formatDistance(distanceInMeters: number): string {
  const distanceInKm = distanceInMeters / 1000

  if (distanceInKm < 1) {
    return `${Math.round(distanceInMeters)}m`
  }

  return `${distanceInKm.toFixed(1)}km`
}

export function calculateEstimatedDeliveryTime(durationInSeconds: number): {
  startTime: string
  endTime: string
  rangeText: string
} {
  const now = new Date()

  // Convertir duración de segundos a minutos y redondear hacia arriba
  const routeDurationMinutes = Math.ceil(durationInSeconds / 60)

  // Mínimo 5 minutos de tiempo base (preparación + trayecto)
  const minDeliveryMinutes = Math.max(routeDurationMinutes + 5, 5)

  // Agregar solo 15 minutos de rango (no 20 encima del mínimo)
  const maxDeliveryMinutes = minDeliveryMinutes + 15

  // Calcular tiempos de entrega sumando minutos a la hora actual
  const deliveryStart = new Date(now.getTime() + minDeliveryMinutes * 60000)
  const deliveryEnd = new Date(now.getTime() + maxDeliveryMinutes * 60000)

  // Formatear horas
  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

  const startTime = formatTime(deliveryStart)
  const endTime = formatTime(deliveryEnd)
  const rangeText = `${startTime} - ${endTime}`

  return {
    startTime,
    endTime,
    rangeText
  }
}
