export type LatLng = { lat: number; lng: number }

const EARTH_KM = 6371

/** Haversine distance in kilometers */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = deg2rad(b.lat - a.lat)
  const dLng = deg2rad(b.lng - a.lng)
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(a.lat)) * Math.cos(deg2rad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  return EARTH_KM * c
}

function deg2rad(d: number) {
  return (d * Math.PI) / 180
}
