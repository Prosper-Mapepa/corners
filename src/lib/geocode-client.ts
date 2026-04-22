import type { LatLng } from "@/lib/geo"

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export async function geocodeQuery(address: string): Promise<{ coords: LatLng; label: string } | null> {
  if (!KEY?.trim()) return null
  const q = address.trim()
  if (!q) return null
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json")
  url.searchParams.set("address", q)
  url.searchParams.set("key", KEY)
  const res = await fetch(url.toString())
  if (!res.ok) return null
  const data = (await res.json()) as {
    status: string
    results?: { formatted_address: string; geometry: { location: LatLng } }[]
  }
  if (data.status !== "OK" || !data.results?.[0]) return null
  const r = data.results[0]
  return {
    coords: { lat: r.geometry.location.lat, lng: r.geometry.location.lng },
    label: r.formatted_address,
  }
}
