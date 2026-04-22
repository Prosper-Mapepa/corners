"use client"

import { useCallback, useRef, useState } from "react"
import { ChevronDown, ChevronUp, Navigation } from "lucide-react"
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLocationExplore } from "@/providers/location-provider"
import { geocodeQuery } from "@/lib/geocode-client"
import { getGoogleMapsApiKey, GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_SCRIPT_ID } from "@/lib/google-maps-config"
import { cn } from "@/lib/utils"

type Variant = "dark" | "light"

export function BrowseLocationPicker({
  variant = "dark",
  compact = false,
  embedded = false,
  onOrangeSurface = false,
  className,
}: {
  variant?: Variant
  /** Narrow single-line trigger for hero / toolbars */
  compact?: boolean
  /** Sit inside a shared toolbar — lighter chrome */
  embedded?: boolean
  /** Hero orange strip — inset control styling */
  onOrangeSurface?: boolean
  className?: string
}) {
  const { searchCenter, searchLabel, setSearchArea, requestBrowserLocation, clearSearchArea } = useLocationExplore()

  const [menuOpen, setMenuOpen] = useState(false)
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

  const onOpenChange = (open: boolean) => {
    setMenuOpen(open)
    if (!open) setErr(null)
  }

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    setErr(null)
  }, [])

  const onGps = async () => {
    setBusy(true)
    setErr(null)
    const c = await requestBrowserLocation()
    setBusy(false)
    if (c) {
      setSearchArea(c, "Your location")
      closeMenu()
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
    closeMenu()
  }

  const onFallbackSearch = async () => {
    setBusy(true)
    setErr(null)
    const r = await geocodeQuery(fallbackQuery)
    setBusy(false)
    if (r) {
      setSearchArea(r.coords, r.label)
      closeMenu()
    } else {
      setErr("No results. Enable Geocoding API for your key, or try another place.")
    }
  }

  const displayLabel = searchCenter ? searchLabel || "Saved area" : "Choose location"
  const dark = variant === "dark"

  const trigger = compact ? (
    <button
      type="button"
      className={cn(
        "flex min-h-[2.25rem] w-full min-w-0 items-center justify-between gap-2 rounded-lg border px-3 text-left text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-amber-400/90 sm:h-9 sm:min-h-0 sm:py-0",
        embedded
          ? dark
            ? onOrangeSurface
              ? "border-orange-200 bg-white text-gray-900 shadow-sm hover:bg-orange-50/80"
              : "border-white/12 bg-black/35 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-black/45"
            : "border-orange-200/70 bg-white/95 text-gray-900 shadow-sm hover:bg-orange-50/90"
          : dark
            ? "border-white/35 bg-white/12 text-white backdrop-blur-sm hover:bg-white/18"
            : "border-orange-200/90 bg-white text-gray-900 shadow-sm hover:bg-orange-50/80",
        className,
      )}
    >
      <span className="min-w-0 py-1 sm:py-0">
        <span
          className={cn(
            "block text-[9px] font-semibold uppercase tracking-[0.14em] leading-tight",
            dark ? (onOrangeSurface ? "text-gray-500" : "text-amber-200/90") : "text-orange-700/85",
          )}
        >
          {/* Near */}
        </span>
        <span
          className={cn(
            "block truncate text-[13px] font-semibold leading-tight sm:text-sm",
            dark ? (onOrangeSurface ? "text-gray-900" : "text-white") : "text-orange-900",
          )}
        >
          {displayLabel}
        </span>
      </span>
      {menuOpen ? (
        <ChevronUp className={cn("h-4 w-4 shrink-0 opacity-90", dark ? (onOrangeSurface ? "text-gray-500" : "text-amber-200") : "text-orange-600")} />
      ) : (
        <ChevronDown className={cn("h-4 w-4 shrink-0 opacity-90", dark ? (onOrangeSurface ? "text-gray-500" : "text-amber-200") : "text-orange-600")} />
      )}
    </button>
  ) : (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition outline-none focus-visible:ring-2 focus-visible:ring-amber-400/90",
        dark
          ? "border-white/35 bg-white/12 text-white backdrop-blur-sm hover:bg-white/18"
          : "border-orange-200/90 bg-white text-gray-900 shadow-sm hover:bg-orange-50/90",
        className,
      )}
    >
      <span className="min-w-0">
        <span
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.12em]",
            dark ? "text-amber-200/80" : "text-orange-800/70",
          )}
        >
          Browsing experiences in
        </span>
        <span className="mt-0.5 block truncate font-medium">
          <span className={cn(dark ? "text-amber-50" : "text-orange-700")}>{displayLabel}</span>
        </span>
      </span>
      {menuOpen ? (
        <ChevronUp className={cn("h-5 w-5 shrink-0 opacity-90", dark ? "text-amber-200" : "text-orange-600")} />
      ) : (
        <ChevronDown className={cn("h-5 w-5 shrink-0 opacity-90", dark ? "text-amber-200" : "text-orange-600")} />
      )}
    </button>
  )

  const panelDark = dark
    ? "border-amber-500/35 bg-orange-950/97 text-amber-50 shadow-2xl"
    : "border-orange-200 bg-white text-gray-900 shadow-xl"

  return (
    <DropdownMenu open={menuOpen} onOpenChange={onOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className={cn("z-[200] w-[min(calc(100vw-2rem),26rem)] gap-0 border p-3 sm:p-4", panelDark)}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Button
          type="button"
          className={cn(
            "mb-3 h-10 w-full rounded-full border-0 font-medium shadow-md",
            dark
              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
              : "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700",
          )}
          disabled={busy}
          onClick={onGps}
        >
          <Navigation className="mr-2 h-4 w-4" />
          Use my current location
        </Button>

        <p
          className={cn(
            "mb-1.5 text-[10px] font-semibold uppercase tracking-widest",
            dark ? "text-amber-200/50" : "text-gray-500",
          )}
        >
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
              className={cn(
                "h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/70",
                dark
                  ? "border-amber-400/50 bg-orange-950/50 text-amber-50 placeholder:text-amber-200/40"
                  : "border-orange-300 bg-white text-gray-900 placeholder:text-gray-400",
              )}
              placeholder="City, neighborhood, or address"
            />
          </Autocomplete>
        ) : (
          <div className="flex gap-2">
            <Input
              value={fallbackQuery}
              onChange={(e) => setFallbackQuery(e.target.value)}
              placeholder="City or address"
              className={cn(dark && "border-amber-500/40 bg-orange-950/40 text-amber-50")}
              onKeyDown={(e) => e.key === "Enter" && onFallbackSearch()}
            />
            <Button type="button" variant="secondary" disabled={busy || !fallbackQuery.trim()} onClick={onFallbackSearch}>
              Go
            </Button>
          </div>
        )}

        {apiKey && !isLoaded && !loadError ? (
          <p className={cn("mt-2 text-xs", dark ? "text-amber-200/60" : "text-gray-500")}>Loading search…</p>
        ) : null}
        {loadError ? (
          <p className="mt-2 text-xs text-red-400">Could not load Places. Check Maps JavaScript API + Places API.</p>
        ) : null}
        {!apiKey ? (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-300/90">
            Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local for live search and the map.
          </p>
        ) : null}

        {err ? <p className="mt-2 text-sm text-red-400">{err}</p> : null}

        {searchCenter ? (
          <div className={cn("mt-3 flex justify-end border-t pt-2", dark ? "border-amber-400/25" : "border-gray-200")}>
            <button
              type="button"
              className={cn(
                "text-xs font-medium underline-offset-2 hover:underline",
                dark ? "text-amber-200/80" : "text-orange-700",
              )}
              onClick={() => {
                clearSearchArea()
                closeMenu()
              }}
            >
              Clear area
            </button>
          </div>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
