import { MAPBOX_ACCESS_TOKEN } from '@/constants/branches'

export interface MapboxRoute {
  distance: number // en metros
  duration: number // en segundos
  summary?: string // nombre de la ruta principal
  branchStreet?: string // nombre de la calle de la sucursal
}

export interface MapboxResponse {
  routes: Array<{
    distance: number
    duration: number
    legs: Array<{
      summary?: string
    }>
  }>
  waypoints: Array<{
    name?: string
  }>
  code: string
}

export async function getRouteInfo(
  fromCoordinates: [number, number],
  toCoordinates: [number, number]
): Promise<MapboxRoute | null> {
  try {
    // Mapbox API espera [lng, lat], así que invertimos las coordenadas de Leaflet [lat, lng]
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${fromCoordinates[1]},${fromCoordinates[0]};${toCoordinates[1]},${toCoordinates[0]}?access_token=${MAPBOX_ACCESS_TOKEN}&overview=false&steps=false`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data: MapboxResponse = await response.json()

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return null
    }

    return {
      distance: data.routes[0].distance,
      duration: data.routes[0].duration,
      summary: data.routes[0].legs?.[0]?.summary,
      branchStreet: data.waypoints?.[0]?.name
    }
  } catch (error) {
    console.error('Error fetching route info:', error)
    return null
  }
}
