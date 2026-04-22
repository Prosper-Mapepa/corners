"use client"

import { useCallback, useRef, useState } from "react"
import { MapPin, Navigation } from "lucide-react"
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLocationExplore } from "@/providers/location-provider"
import { geocodeQuery } from "@/lib/geocode-client"
import { getGoogleMapsApiKey, GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_SCRIPT_ID } from "@/lib/google-maps-config"

export function LocationPermissionModal() {
  const {
    promptOpen,
    setPromptOpen,
    setSearchArea,
    requestBrowserLocation,
    markPromptSeen,
  } = useLocationExplore()

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [fallbackQuery, setFallbackQuery] = useState("")
  const acRef = useRef<google.maps.places.Autocomplete | null>(null)

  const apiKey = getGoogleMapsApiKey()
  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_SCRIPT_ID,
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  const close = useCallback(() => {
    markPromptSeen()
    setPromptOpen(false)
    setErr(null)
  }, [markPromptSeen, setPromptOpen])

  const onGps = async () => {
    setBusy(true)
    setErr(null)
    const c = await requestBrowserLocation()
    setBusy(false)
    if (c) {
      setSearchArea(c, "Your location")
      close()
    } else {
      setErr("Could not read your location. Try searching below.")
    }
  }

  const onPlaceChanged = () => {
    const ac = acRef.current
    if (!ac) return
    const place = ac.getPlace()
    const loc = place.geometry?.location
    if (!loc) {
      setErr("Pick a suggestion from the list.")
      return
    }
    const label =
      place.formatted_address ??
      place.name ??
      place.vicinity ??
      `${loc.lat().toFixed(4)}, ${loc.lng().toFixed(4)}`
    setSearchArea({ lat: loc.lat(), lng: loc.lng() }, label)
    close()
  }

  const onFallbackSearch = async () => {
    setBusy(true)
    setErr(null)
    const r = await geocodeQuery(fallbackQuery)
    setBusy(false)
    if (r) {
      setSearchArea(r.coords, r.label)
      close()
    } else {
      setErr("No results. Enable Geocoding API for your key, or try another place.")
    }
  }

  return (
    <Dialog
      open={promptOpen}
      onOpenChange={(o) => {
        if (!o) close()
        else setPromptOpen(true)
      }}
    >
      <DialogContent
        showCloseButton
        className="border-amber-500/35 bg-gradient-to-b from-orange-950 via-orange-950 to-[oklch(0.17_0.055_42)] text-amber-50 shadow-2xl sm:max-w-md [&_button.absolute.right-4]:text-amber-200/80 [&_button.absolute.right-4]:hover:bg-white/10"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-amber-50">
            <MapPin className="h-5 w-5 text-amber-400" aria-hidden />
            Find experiences near you
          </DialogTitle>
          <DialogDescription className="text-left text-sm leading-relaxed text-amber-100/75">
            Allow location access or search for a city so we can show places and the map for your area (within your
            chosen radius).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <Button
            type="button"
            className="h-11 w-full rounded-full border-0 bg-gradient-to-r from-amber-500 to-orange-600 text-sm font-semibold text-white shadow-lg hover:from-amber-600 hover:to-orange-700"
            disabled={busy}
            onClick={onGps}
          >
            <Navigation className="mr-2 h-4 w-4" />
            Use my current location
          </Button>

          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/55">
              Search anywhere in the world
            </p>
            {apiKey && isLoaded && !loadError ? (
              <Autocomplete
                onLoad={(ac) => {
                  acRef.current = ac
                }}
                onUnmount={() => {
                  acRef.current = null
                }}
                options={{ fields: ["formatted_address", "geometry", "name", "vicinity"] }}
                onPlaceChanged={onPlaceChanged}
              >
                <input
                  className="h-10 w-full rounded-lg border border-amber-400/45 bg-orange-950/60 px-3 text-sm text-amber-50 placeholder:text-amber-200/35 outline-none focus:ring-2 focus:ring-amber-400/70"
                  placeholder="City, neighborhood, or address"
                />
              </Autocomplete>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={fallbackQuery}
                  onChange={(e) => setFallbackQuery(e.target.value)}
                  placeholder="City or address"
                  className="border-amber-500/40 bg-orange-950/50 text-amber-50"
                  onKeyDown={(e) => e.key === "Enter" && onFallbackSearch()}
                />
                <Button type="button" variant="secondary" disabled={busy || !fallbackQuery.trim()} onClick={onFallbackSearch}>
                  Go
                </Button>
              </div>
            )}
            {apiKey && !isLoaded && !loadError ? (
              <p className="mt-2 text-xs text-amber-200/55">Loading search...</p>
            ) : null}
            {loadError ? (
              <p className="mt-2 text-xs text-rose-300/90">Could not load Places. Check your Maps API key.</p>
            ) : null}
            {!apiKey ? (
              <p className="mt-2 text-xs text-amber-200/60">
                Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local for search and maps.
              </p>
            ) : null}
            {err ? <p className="mt-2 text-sm text-rose-300/95">{err}</p> : null}
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="ghost" className="text-amber-200/85 hover:bg-white/10 hover:text-amber-50" onClick={close}>
            Not now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
