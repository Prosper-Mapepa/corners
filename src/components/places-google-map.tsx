"use client"

import { useMemo, useState } from "react"
import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from "@react-google-maps/api"
import { getGoogleMapsApiKey, GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_SCRIPT_ID } from "@/lib/google-maps-config"
import Link from "next/link"
import { Star } from "lucide-react"
import { buildDemoEventPins, getCoordsForPlace, type MapEventPin, type PlaceLike } from "@/lib/place-coords"
import type { LatLng } from "@/lib/geo"
import { cn } from "@/lib/utils"

const DEFAULT_CENTER: LatLng = { lat: 6.5244, lng: 3.3792 }
const EVENT_ICON = "http://maps.google.com/mapfiles/ms/icons/orange-dot.png"
const PLACE_ICON = "http://maps.google.com/mapfiles/ms/icons/red-dot.png"

export type MapPlaceInput = PlaceLike & {
  name: string
  imageUrl?: string | null
  rating?: number
}

type Props = {
  places: MapPlaceInput[]
  /** When set, map centers here (e.g. user search area) */
  mapCenter?: LatLng | null
  /** Zoom when mapCenter is user-provided */
  zoom?: number
  className?: string
  minHeight?: number
}

export function PlacesGoogleMap({ places, mapCenter, zoom = 5, className, minHeight = 380 }: Props) {
  const apiKey = getGoogleMapsApiKey()
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: GOOGLE_MAPS_SCRIPT_ID,
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  const [info, setInfo] = useState<{ kind: "place"; p: MapPlaceInput } | { kind: "event"; e: MapEventPin } | null>(
    null,
  )

  const eventPins = useMemo(() => buildDemoEventPins(places), [places])

  const center = useMemo(() => {
    if (mapCenter) return mapCenter
    if (places[0]) return getCoordsForPlace(places[0])
    return DEFAULT_CENTER
  }, [mapCenter, places])

  const effectiveZoom = mapCenter ? Math.min(zoom, 12) : zoom

  if (!apiKey.trim()) {
    return (
      <div
        className={cn(
          "flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-orange-300 bg-orange-50/80 p-6 text-center text-sm text-orange-900",
          className,
        )}
      >
        Add <code className="rounded bg-white px-1 py-0.5">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to{" "}
        <code className="rounded bg-white px-1 py-0.5">.env.local</code> to load the map.
      </div>
    )
  }

  if (loadError) {
    return (
      <div
        className={cn(
          "flex min-h-[280px] items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800",
          className,
        )}
      >
        Could not load Google Maps. Enable Maps JavaScript API, Places API, and Geocoding; check billing and key
        restrictions.
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div
        className={cn("animate-pulse rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100", className)}
        style={{ minHeight }}
      />
    )
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-orange-200/80 shadow-md", className)}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: minHeight }}
        center={center}
        zoom={effectiveZoom}
        options={{
          fullscreenControl: true,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {places.map((p) => {
          const pos = getCoordsForPlace(p)
          return (
            <Marker
              key={p.id}
              position={pos}
              icon={{ url: PLACE_ICON }}
              onClick={() => setInfo({ kind: "place", p })}
            />
          )
        })}
        {eventPins.map((e) => (
          <Marker
            key={e.id}
            position={{ lat: e.lat, lng: e.lng }}
            icon={{ url: EVENT_ICON }}
            onClick={() => setInfo({ kind: "event", e })}
          />
        ))}
        {info?.kind === "place" && (
          <InfoWindow position={getCoordsForPlace(info.p)} onCloseClick={() => setInfo(null)}>
            <div className="max-w-[220px] p-1 font-sans text-gray-900">
              {info.p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- InfoWindow renders outside React tree
                <img
                  src={info.p.imageUrl}
                  alt=""
                  className="mb-2 h-24 w-full rounded-lg object-cover"
                />
              ) : null}
              <p className="text-sm font-semibold leading-tight">{info.p.name}</p>
              {typeof info.p.rating === "number" && (
                <p className="mt-1 flex items-center gap-1 text-xs text-amber-700">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  {info.p.rating.toFixed(1)}
                </p>
              )}
              <Link
                href={`/place/${info.p.id}`}
                className="mt-2 inline-block text-sm font-medium text-orange-600 hover:underline"
              >
                View place
              </Link>
            </div>
          </InfoWindow>
        )}
        {info?.kind === "event" && (
          <InfoWindow
            position={{ lat: info.e.lat, lng: info.e.lng }}
            onCloseClick={() => setInfo(null)}
          >
            <div className="max-w-[220px] p-1 font-sans text-gray-900">
              <p className="text-xs font-medium uppercase tracking-wide text-orange-600">Experience</p>
              <p className="text-sm font-semibold leading-tight">{info.e.title}</p>
              <p className="mt-1 text-xs text-gray-600">{info.e.subtitle}</p>
              <Link
                href={`/place/${info.e.placeId}`}
                className="mt-2 inline-block text-sm font-medium text-orange-600 hover:underline"
              >
                View place
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      <p className="border-t border-orange-100 bg-white/95 px-3 py-2 text-center text-[11px] text-gray-500">
        Red pins: places · Orange pins: featured experiences (tap for preview)
      </p>
    </div>
  )
}
