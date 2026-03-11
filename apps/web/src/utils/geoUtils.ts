/**
 * Utilidades para operaciones geográficas
 */

/**
 * Verifica si un punto está dentro de un polígono usando el algoritmo Ray Casting
 * @param point [lng, lat] - Coordenadas del punto a verificar
 * @param polygon Array de coordenadas del polígono [[lng, lat], ...]
 * @returns true si el punto está dentro del polígono
 */
export function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi

    if (intersect) {
      inside = !inside
    }
  }

  return inside
}

/**
 * Verifica si una ubicación (lat, lng) está dentro de la zona de cobertura de Pechugon
 * @param lat Latitud del punto
 * @param lng Longitud del punto
 * @param geoJson GeoJSON con el polígono de cobertura
 * @returns true si está dentro de la zona
 */
export function isLocationInCoverageZone(
  lat: number,
  lng: number,
  geoJson: {
    type: string
    features: Array<{
      type: string
      properties: object
      geometry: {
        coordinates: number[][][]
        type: string
      }
    }>
  }
): boolean {
  // El GeoJSON usa formato [lng, lat], así que convertimos
  const point: [number, number] = [lng, lat]

  // Obtener las coordenadas del polígono del GeoJSON
  const feature = geoJson.features[0]
  if (!feature || feature.geometry.type !== 'Polygon') {
    console.warn('GeoJSON no tiene un polígono válido')
    return false
  }

  // Las coordenadas del polígono están en el primer anillo (exterior)
  const polygonCoordinates = feature.geometry.coordinates[0] as [number, number][]

  return isPointInPolygon(point, polygonCoordinates)
}
