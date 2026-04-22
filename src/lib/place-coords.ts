import type { LatLng } from "@/lib/geo"

/** Approximate city centers for API locations without lat/lng */
const SLUG_COORDS: Record<string, LatLng> = {
  lagos: { lat: 6.5244, lng: 3.3792 },
  "cape-town": { lat: -33.9249, lng: 18.4241 },
  nairobi: { lat: -1.2921, lng: 36.8219 },
  accra: { lat: 5.6037, lng: -0.187 },
  cairo: { lat: 30.0444, lng: 31.2357 },
  johannesburg: { lat: -26.2041, lng: 28.0473 },
  "addis-ababa": { lat: 9.032, lng: 38.7469 },
  kigali: { lat: -1.9441, lng: 30.0619 },
  dakar: { lat: 14.7167, lng: -17.4677 },
  tunis: { lat: 36.8065, lng: 10.1815 },
  casablanca: { lat: 33.5731, lng: -7.5898 },
  marrakech: { lat: 31.6295, lng: -7.9811 },
  "dar-es-salaam": { lat: -6.7924, lng: 39.2083 },
  kampala: { lat: 0.3476, lng: 32.5825 },
  harare: { lat: -17.8252, lng: 31.0335 },
  lusaka: { lat: -15.3875, lng: 28.3228 },
  default: { lat: 6.5244, lng: 3.3792 },
}

function slugKey(raw: string) {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

/** Stable micro-offset so many listings in one city don’t stack on one pixel */
function jitter(id: string, base: LatLng): LatLng {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  const a = (h & 0xffff) / 0xffff
  const b = ((h >>> 16) & 0xffff) / 0xffff
  const rKm = 0.35
  const dLat = (a - 0.5) * (rKm / 111)
  const dLng = (b - 0.5) * (rKm / (111 * Math.cos((base.lat * Math.PI) / 180)))
  return { lat: base.lat + dLat, lng: base.lng + dLng }
}

export type PlaceLike = {
  id: string
  name?: string
  location?: {
    slug?: string | null
    name?: string | null
    city?: string | null
    country?: string | null
  } | null
  latitude?: number | null
  longitude?: number | null
}

export function getCoordsForPlace(place: PlaceLike): LatLng {
  if (place.latitude != null && place.longitude != null) {
    return { lat: place.latitude, lng: place.longitude }
  }
  const slug = place.location?.slug ? slugKey(place.location.slug) : ""
  const fromSlug = SLUG_COORDS[slug]
  if (fromSlug) return jitter(place.id, fromSlug)
  const name = place.location?.name ? slugKey(place.location.name) : ""
  const fromName = SLUG_COORDS[name]
  if (fromName) return jitter(place.id, fromName)
  const city = place.location?.city ? slugKey(place.location.city) : ""
  const fromCity = SLUG_COORDS[city]
  if (fromCity) return jitter(place.id, fromCity)
  return jitter(place.id, SLUG_COORDS.default)
}

export type MapEventPin = {
  id: string
  title: string
  subtitle: string
  lat: number
  lng: number
  placeId: string
  imageUrl?: string | null
  rating?: number
}

/** Demo “event” pins near each place (until a real /events API exists) */
export function buildDemoEventPins<T extends PlaceLike & { imageUrl?: string | null; rating?: number }>(
  places: T[],
): MapEventPin[] {
  return places.slice(0, 80).map((p) => {
    const c = getCoordsForPlace(p)
    const venue = p.name ?? p.location?.name ?? "Venue"
    return {
      id: `evt-${p.id}`,
      title: `Experience at ${venue}`,
      subtitle: "Tap to open this place",
      lat: c.lat + 0.004,
      lng: c.lng + 0.004,
      placeId: p.id,
      imageUrl: p.imageUrl ?? null,
      rating: typeof p.rating === "number" ? p.rating : undefined,
    }
  })
}
