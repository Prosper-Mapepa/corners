/** Single script id + libraries so map + Places Autocomplete share one loader. */
export const GOOGLE_MAPS_SCRIPT_ID = "corners-google-maps"
export const GOOGLE_MAPS_LIBRARIES: "places"[] = ["places"]

export function getGoogleMapsApiKey(): string {
  return (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "").trim()
}
