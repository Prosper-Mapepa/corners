"use client"

import { useMemo } from "react"
import { BrowseLocationPicker } from "@/components/browse-location-picker"
import { ProximityRadiusBar } from "@/components/proximity-radius-bar"
import { haversineKm } from "@/lib/geo"
import { getCoordsForPlace, type PlaceLike } from "@/lib/place-coords"
import { useLocationExplore } from "@/providers/location-provider"
import { cn } from "@/lib/utils"

type Variant = "dark" | "light"

type Props = {
  variant?: Variant
  /** Tight single-row layout for hero (paired with search) or discover toolbar */
  layout?: "stacked" | "compact"
  /** Approved places used for nearby / live counts when no `placesForCounts` */
  places: PlaceLike[]
  /** When set (e.g. discover filtered list), counts match this list instead of radius-only math */
  placesForCounts?: PlaceLike[]
  className?: string
}

export function ExploreLocationBar({
  variant = "dark",
  layout = "stacked",
  places,
  placesForCounts,
  className,
}: Props) {
  const { searchCenter, radiusKm } = useLocationExplore()

  const { nearbyCount, experiencesLiveCount } = useMemo(() => {
    if (placesForCounts) {
      const n = placesForCounts.length
      if (searchCenter) {
        return { nearbyCount: n, experiencesLiveCount: Math.min(n, 80) }
      }
      return {
        nearbyCount: 0,
        experiencesLiveCount: Math.min(n, 80),
      }
    }
    if (!searchCenter) {
      return {
        nearbyCount: 0,
        experiencesLiveCount: Math.min(places.length, 80),
      }
    }
    const inRadius = places.filter((p) => haversineKm(searchCenter, getCoordsForPlace(p)) <= radiusKm)
    const n = inRadius.length
    return {
      nearbyCount: n,
      experiencesLiveCount: Math.min(n, 80),
    }
  }, [places, placesForCounts, searchCenter, radiusKm])

  const dark = variant === "dark"
  const compact = layout === "compact"

  if (compact) {
    if (dark) {
      return (
        <div
          className={cn(
            "flex w-full flex-col items-stretch gap-3 rounded-2xl border border-orange-200/80 bg-white/90 px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:gap-x-4 sm:gap-y-0 sm:px-4",
            className,
          )}
        >
          <div className="min-w-0 sm:max-w-[min(46vw,250px)] sm:shrink-0">
            <BrowseLocationPicker variant="dark" compact embedded onOrangeSurface className="w-full" />
          </div>
          <div className="h-px w-full shrink-0 bg-orange-200/80 sm:hidden" aria-hidden />
          <div className="hidden w-px shrink-0 self-stretch bg-orange-200/80 sm:block" aria-hidden />
          <div className="min-w-0 flex-1">
            <ProximityRadiusBar
              variant="dark"
              compact
              onOrangeSurface
              nearbyCount={nearbyCount}
              experiencesLiveCount={experiencesLiveCount}
              className="w-full"
            />
          </div>
        </div>
      )
    }

    return (
      <div
        className={cn(
          "flex flex-col gap-2.5 overflow-hidden rounded-xl border sm:flex-row sm:items-stretch sm:gap-0 sm:rounded-xl",
          "border-orange-200/90 bg-gradient-to-br from-orange-50/95 to-amber-50/60 shadow-sm",
          className,
        )}
      >
        <div className="px-3 pt-2.5 sm:flex sm:min-w-0 sm:max-w-[min(42vw,240px)] sm:shrink-0 sm:px-4 sm:py-3">
          <BrowseLocationPicker variant="light" compact embedded className="w-full" />
        </div>
        <div
          className="mx-3 h-px w-[calc(100%-1.5rem)] shrink-0 sm:mx-0 sm:my-0 sm:h-auto sm:min-h-[2rem] sm:w-px sm:self-stretch sm:bg-orange-200/80"
          aria-hidden
        />
        <div className="min-w-0 flex-1 px-3 pb-2.5 pt-0 sm:flex sm:items-center sm:px-4 sm:py-3">
          <ProximityRadiusBar
            variant="light"
            compact
            nearbyCount={nearbyCount}
            experiencesLiveCount={experiencesLiveCount}
            className="w-full"
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 sm:p-5",
        dark ? "border-white/15 bg-black/30 backdrop-blur-md" : "border-slate-200 bg-white/95 shadow-sm",
        className,
      )}
    >
      <BrowseLocationPicker variant={variant} />
      <div className={cn("my-5 h-px", dark ? "bg-white/10" : "bg-slate-200")} />
      <ProximityRadiusBar
        variant={variant}
        nearbyCount={nearbyCount}
        experiencesLiveCount={experiencesLiveCount}
      />
    </div>
  )
}
