"use client"

import { RADIUS_KM_PRESETS } from "@/lib/radius-presets"
import { useLocationExplore } from "@/providers/location-provider"
import { cn } from "@/lib/utils"

type Variant = "dark" | "light"

type Props = {
  variant?: Variant
  compact?: boolean
  /** Hero orange strip */
  onOrangeSurface?: boolean
  nearbyCount: number
  experiencesLiveCount: number
  className?: string
}

export function ProximityRadiusBar({
  variant = "dark",
  compact = false,
  onOrangeSurface = false,
  nearbyCount,
  experiencesLiveCount,
  className,
}: Props) {
  const { searchCenter, radiusKm, setRadiusKm } = useLocationExplore()
  const dark = variant === "dark"

  if (compact) {
    return (
      <div
        className={cn(
          "flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap sm:justify-between",
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
          <span
            className={cn(
              "shrink-0 text-[9px] font-semibold uppercase tracking-[0.14em]",
              dark
                ? onOrangeSurface
                  ? "text-gray-500"
                  : "text-amber-200/90"
                : "text-orange-800/75",
            )}
          >
            Radius
          </span>
          <div
            className={cn(
              "inline-flex max-w-full shrink-0 rounded-full border p-[3px]",
              dark
                ? onOrangeSurface
                  ? "border-orange-200 bg-orange-50 shadow-inner"
                  : "border-white/18 bg-black/30"
                : "border-orange-200/90 bg-white/95",
            )}
          >
            {RADIUS_KM_PRESETS.map((km) => {
              const active = radiusKm === km
              return (
                <button
                  key={km}
                  type="button"
                  onClick={() => setRadiusKm(km)}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums transition sm:min-w-[2rem] sm:px-2.5 sm:text-xs",
                    active
                      ? "bg-white text-orange-700 shadow-sm ring-1 ring-orange-200"
                      : dark
                        ? onOrangeSurface
                          ? "text-gray-600 hover:bg-white"
                          : "text-amber-50/90 hover:bg-white/10"
                        : "text-orange-900/85 hover:bg-orange-100/80",
                  )}
                >
                  {km}
                </button>
              )
            })}
          </div>
        </div>
        <p
          className={cn(
            "w-full shrink-0 text-left text-[11px] tabular-nums sm:ml-2 sm:w-auto sm:text-right sm:text-xs",
            dark
              ? onOrangeSurface
                ? "text-gray-500"
                : "text-amber-100/80"
              : "text-orange-900/70",
          )}
        >
          <span className={cn("font-semibold", dark ? (onOrangeSurface ? "text-gray-800" : "text-white") : "text-orange-700")}>{experiencesLiveCount} live</span>
          <span className={dark ? (onOrangeSurface ? "text-gray-300" : "text-amber-200/45") : "text-orange-600/45"}>
            {" "}
            ·{" "}
          </span>
          <span className={cn("font-medium", dark ? (onOrangeSurface ? "text-gray-800" : "text-white") : "text-orange-800")}>{searchCenter ? nearbyCount : "—"}</span>{" "}
          <span className={cn("font-normal", dark ? (onOrangeSurface ? "text-gray-500" : "text-amber-100/85") : "text-orange-800/65")}>nearby</span>
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.14em]",
              dark ? "text-amber-200/80" : "text-orange-800/70",
            )}
          >
            Proximity
          </span>
          <div
            className={cn(
              "inline-flex flex-wrap rounded-full border p-1",
              dark ? "border-white/25 bg-black/20" : "border-orange-200 bg-orange-50/80",
            )}
          >
            {RADIUS_KM_PRESETS.map((km) => {
              const active = radiusKm === km
              return (
                <button
                  key={km}
                  type="button"
                  onClick={() => setRadiusKm(km)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-3.5",
                    active
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm"
                      : dark
                        ? "text-amber-100/90 hover:bg-white/10"
                        : "text-orange-900 hover:bg-white",
                  )}
                >
                  {km} km
                </button>
              )
            })}
          </div>
        </div>
        <p className={cn("text-sm tabular-nums", dark ? "text-amber-100/90" : "text-orange-800")}>
          {experiencesLiveCount} experiences live
        </p>
      </div>
      <p className={cn("text-base font-medium tabular-nums sm:text-lg", dark ? "text-amber-50" : "text-gray-900")}>
        <span className={cn(dark ? "text-amber-200" : "text-orange-600")}>{searchCenter ? nearbyCount : "—"}</span>{" "}
        <span className={cn("font-normal", dark ? "text-amber-100/70" : "text-gray-600")}>nearby</span>
      </p>
      {!searchCenter ? (
        <p className={cn("text-xs", dark ? "text-amber-200/50" : "text-gray-500")}>
          Set your area to filter by distance (up to 100 km).
        </p>
      ) : null}
    </div>
  )
}
