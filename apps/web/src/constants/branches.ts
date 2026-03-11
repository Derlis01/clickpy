export const BRANCHES = {
  centro: {
    id: 'centro',
    name: 'Centro',

    coordinates: [-27.333, -55.868] as [number, number] // [lat, lng] para Leaflet
  },
  cambyreta: {
    id: 'cambyreta',
    name: 'Cambyretá',
    coordinates: [-27.342, -55.838] as [number, number] // [lat, lng] para Leaflet
  }
}

// GeoJSON para zona de cobertura de Pechugon (Polygon cerrado)
export const geoJsonForPechugon = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        coordinates: [
          [
            [-55.87521570033475, -27.320257209355184],
            [-55.877845469068774, -27.3228532138819],
            [-55.87567392250111, -27.34043278931386],
            [-55.868953402590634, -27.35311323720395],
            [-55.863151214296494, -27.362715302520726],
            [-55.858851751027345, -27.362715302520726],
            [-55.85834337646472, -27.347455774326917],
            [-55.857751626526124, -27.343270798748364],
            [-55.85314833667118, -27.343710108385906],
            [-55.855012478844145, -27.33157776375449],
            [-55.849952687734955, -27.32412706572503],
            [-55.85577337656002, -27.318381094927446],
            [-55.87517567264217, -27.320273918187297],
            [-55.87521570033475, -27.320257209355184] // Cerrar el polígono
          ]
        ],
        type: 'Polygon'
      }
    }
  ]
}

export const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoiZGVybGlzMDEiLCJhIjoiY21icHRlbnBxMDdxdzJtb3M1dWxvcnl1cCJ9.ESFUTVq9BP64bV-Z103DKw'

/**
 * Configuración de tramos de precios para delivery
 * Modelo acumulativo: se suma el costo de cada tramo recorrido
 */
export const PRICING_TIERS = {
  base: { limit: 2, price: 10000 }, // 0-2km: 10.000 Gs fijos
  tier2: { limit: 2, rate: 7000 }, // 2-4km: +7.000 Gs/km
  tier3: { limit: 4, rate: 8000 }, // 4-8km: +8.000 Gs/km
  tier4: { rate: 10000 } // 8km+: +10.000 Gs/km
}

// Whitelist de comercios que tienen el flujo avanzado de delivery
export const DELIVERY_WHITELIST = ['happysockspy', 'lander', 'grido-enc', 'restaurante-de-prueba']

// Whitelist de comercios con delivery GRATIS (solo necesitan ubicación, sin cálculo de precio)
// Usan validación de zona con GeoJSON pero siempre permiten el pedido
export const FREE_DELIVERY_WHITELIST = ['pechugon-enc']
