"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Search, MapPin, Star, Tag, ArrowRight, Loader2, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  buildPlaceHaystack,
  haystackMatchesTokens,
  normalizeSearchTokens,
  scoreCategoryMatch,
  scoreLocationMatch,
  scorePlaceRelevance,
} from "@/lib/search-utils"
import { ExploreLocationBar } from "@/components/explore-location-bar"
import { useLocationExplore } from "@/providers/location-provider"
import { cn } from "@/lib/utils"

type ApiCategory = {
  id: string
  name: string
  slug: string
  icon?: string | null
}

type ApiLocation = {
  id: string
  name: string
  slug: string
  city?: string | null
  country?: string | null
}

export type LandingPlace = {
  id: string
  name: string
  description?: string | null
  category?: ApiCategory
  location: ApiLocation
  rating: number
  reviews?: number
  imageUrl?: string | null
  tags?: string[]
  featured?: boolean
  status?: string
}

type LandingSearchProps = {
  places: LandingPlace[]
  locations: ApiLocation[]
  categories: ApiCategory[]
  isLoading?: boolean
  /** When true, compact location + radius strip sits under the search pill (hero) */
  embedLocationStrip?: boolean
  initialQuery?: string
  className?: string
}

const PLACE_PREVIEW = 6
const LOCATION_PREVIEW = 4
const CATEGORY_PREVIEW = 6

export function LandingSearch({
  places,
  locations,
  categories,
  isLoading,
  embedLocationStrip = true,
  initialQuery = "",
  className,
}: LandingSearchProps) {
  const router = useRouter()
  const { promptOpen } = useLocationExplore()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(initialQuery)
  const [showLocationFilters, setShowLocationFilters] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const tokens = useMemo(() => normalizeSearchTokens(query), [query])

  const locationPlaceCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of places) {
      const id = p.location?.id
      if (!id) continue
      m.set(id, (m.get(id) ?? 0) + 1)
    }
    return m
  }, [places])

  const rankedPlaces = useMemo(() => {
    if (tokens.length === 0) return []
    const scored = places
      .map((place) => {
        const haystack = buildPlaceHaystack(place)
        if (!haystackMatchesTokens(haystack, tokens)) return null
        return { place, score: scorePlaceRelevance(place, tokens) }
      })
      .filter((x): x is { place: LandingPlace; score: number } => x !== null)
      .sort((a, b) => b.score - a.score)
    return scored
  }, [places, tokens])

  const rankedLocations = useMemo(() => {
    if (tokens.length === 0) return []
    const scored = locations
      .map((loc) => {
        const s = scoreLocationMatch(loc, tokens)
        if (s < 0) return null
        return { loc, score: s, count: locationPlaceCounts.get(loc.id) ?? 0 }
      })
      .filter((x): x is { loc: ApiLocation; score: number; count: number } => x !== null)
      .sort((a, b) => b.score - a.score || b.count - a.count)
    return scored
  }, [locations, tokens, locationPlaceCounts])

  const rankedCategories = useMemo(() => {
    if (tokens.length === 0) return []
    const scored = categories
      .map((cat) => {
        const s = scoreCategoryMatch(cat, tokens)
        if (s < 0) return null
        return { cat, score: s }
      })
      .filter((x): x is { cat: ApiCategory; score: number } => x !== null)
      .sort((a, b) => b.score - a.score)
    return scored
  }, [categories, tokens])

  const hasResults =
    rankedPlaces.length > 0 || rankedLocations.length > 0 || rankedCategories.length > 0

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open])

  useEffect(() => {
    if (!embedLocationStrip || !promptOpen) return
    setShowLocationFilters(true)
  }, [embedLocationStrip, promptOpen])

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const goDiscoverAll = useCallback(() => {
    const q = query.trim()
    if (!q) {
      router.push("/discover")
      return
    }
    router.push(`/discover?q=${encodeURIComponent(q)}`)
    setOpen(false)
  }, [query, router])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
    }
    if (e.key === "Enter") {
      e.preventDefault()
      goDiscoverAll()
    }
  }

  const showPanel = open && query.trim().length > 0
  const locationFiltersOpen = embedLocationStrip && showLocationFilters

  return (
    <div
      id="hero-search"
      ref={rootRef}
      className={cn(
        "relative mx-auto mb-5 w-full scroll-mt-24 sm:mb-7",
        embedLocationStrip ? "max-w-4xl px-2" : "max-w-xl px-2",
        className,
      )}
    >
      <div
        className={cn(
          "overflow-hidden shadow-xl ring-1 backdrop-blur-md",
          embedLocationStrip
            ? "rounded-2xl border border-white/50 bg-white/95 ring-black/10"
            : "rounded-full border border-white/60 bg-white/95 shadow-lg ring-black/[0.04]",
        )}
        onFocus={() => setOpen(true)}
      >
        {/* Search row */}
        <div
          className={cn(
            "relative",
            embedLocationStrip &&
              (locationFiltersOpen
                ? "rounded-t-2xl border-b border-orange-100/60 bg-white/98 p-2 sm:p-2.5"
                : "rounded-2xl bg-white/98 p-2 sm:p-2.5"),
          )}
        >
          <div
            className={cn(
              "relative flex items-center gap-1 sm:gap-1.5",
              embedLocationStrip
                ? "rounded-full border border-orange-100/80 bg-white pl-3 pr-1.5 sm:pl-4 sm:pr-2 py-1 sm:py-1.5 shadow-inner"
                : "pl-3 pr-1.5 sm:pl-4 sm:pr-2 py-1 sm:py-1.5",
            )}
          >
            <Search className="h-4 w-4 shrink-0 text-orange-500 opacity-90 sm:h-[18px] sm:w-[18px]" aria-hidden />
            <Input
              id="hero-search-input"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Places, cities, categories…"
              className="h-8 min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-sm text-gray-900 shadow-none placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 sm:h-9 sm:text-[15px]"
              aria-expanded={showPanel}
              aria-controls="landing-search-results"
              autoComplete="off"
            />
            {embedLocationStrip ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowLocationFilters((v) => !v)}
                aria-pressed={showLocationFilters}
                aria-expanded={showLocationFilters}
                aria-controls="hero-location-filters"
                className={cn(
                  "h-8 shrink-0 gap-1 rounded-full px-2 sm:h-9 sm:px-3",
                  showLocationFilters
                    ? "bg-orange-100 text-orange-800 hover:bg-orange-100/90"
                    : "text-orange-700 hover:bg-orange-50 hover:text-orange-800",
                )}
              >
                <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden />
                <span className="hidden text-xs font-semibold sm:inline">Filters</span>
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={goDiscoverAll}
              className="h-8 shrink-0 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-3 text-xs font-semibold text-white shadow-sm hover:from-amber-600 hover:via-orange-600 hover:to-red-700 sm:h-9 sm:px-4 sm:text-sm"
            >
              {query.trim() ? "Search" : "Explore"}
            </Button>
            {isLoading && (
              <span
                className={cn(
                  "pointer-events-none absolute top-1/2 -translate-y-1/2",
                  embedLocationStrip ? "right-[6.75rem] sm:right-[7.75rem]" : "right-[4.25rem] sm:right-24",
                )}
                aria-hidden
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-400 sm:h-4 sm:w-4" />
              </span>
            )}
          </div>
        </div>

        {embedLocationStrip ? (
          <div
            id="hero-location-filters"
            className={cn(
              "overflow-hidden rounded-b-2xl border-t border-orange-200/70 bg-gradient-to-r from-orange-100 via-orange-50 to-amber-50 transition-[max-height,opacity,padding] duration-300 ease-out",
              showLocationFilters
                ? "max-h-[min(40vh,260px)] opacity-100 px-3 py-3 sm:px-4 sm:py-3.5"
                : "max-h-0 border-t-0 opacity-0 px-3 py-0 sm:px-4",
            )}
            aria-hidden={!showLocationFilters}
          >
            <div className={cn(!showLocationFilters && "pointer-events-none")}>
              <ExploreLocationBar
                variant="dark"
                layout="compact"
                places={places}
                className="border-0 bg-transparent p-0 shadow-none"
              />
            </div>
          </div>
        ) : null}
      </div>

      {showPanel && isLoading && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+0.375rem)] z-50 rounded-2xl border border-gray-200/80 bg-white/95 px-4 py-6 text-center text-sm text-gray-600 shadow-xl ring-1 ring-black/[0.04]"
          id="landing-search-results"
          role="listbox"
        >
          <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-orange-500" />
          Loading places…
        </div>
      )}

      {showPanel && !isLoading && (
        <div
          id="landing-search-results"
          className="absolute left-0 right-0 top-[calc(100%+0.375rem)] z-50 max-h-[min(70vh,420px)] overflow-y-auto overflow-x-hidden rounded-2xl border border-gray-200/80 bg-white/95 text-left shadow-xl ring-1 ring-black/[0.04]"
          role="listbox"
        >
            {tokens.length > 0 && !hasResults && (
              <div className="px-4 py-8 text-center text-gray-600">
                <p className="mb-1 font-medium text-gray-800">Nothing found</p>
                <p className="mb-4 text-sm">Try another phrase or search all listings with filters on Discover.</p>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-orange-200 text-orange-700 hover:bg-orange-50"
                  onClick={goDiscoverAll}
                >
                  Open Discover
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {rankedPlaces.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" />
                  Places & experiences
                </div>
                <ul className="divide-y divide-gray-50">
                  {rankedPlaces.slice(0, PLACE_PREVIEW).map(({ place }) => (
                    <li key={place.id}>
                      <Link
                        href={`/place/${place.id}`}
                        className="flex gap-3 px-4 py-3 hover:bg-orange-50/80 transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                          {place.imageUrl ? (
                            <Image src={place.imageUrl} alt="" fill className="object-cover" sizes="64px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl text-gray-400">
                              {place.category?.icon ?? "📍"}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">{place.name}</p>
                          <p className="text-sm text-gray-600 truncate">
                            {place.category?.name}
                            {place.location?.name ? ` · ${place.location.name}` : ""}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-amber-700">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>{place.rating?.toFixed(1) ?? "—"}</span>
                            {place.featured && (
                              <span className="text-orange-600 font-medium">Featured</span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 shrink-0 self-center" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {rankedLocations.length > 0 && (
              <div className="py-2 border-t border-gray-50">
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  Cities & regions
                </div>
                <ul>
                  {rankedLocations.slice(0, LOCATION_PREVIEW).map(({ loc, count }) => (
                    <li key={loc.id}>
                      <Link
                        href={`/discover?location=${encodeURIComponent(loc.id)}${query.trim() ? `&q=${encodeURIComponent(query.trim())}` : ""}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-orange-50/80 transition-colors text-gray-900"
                        onClick={() => setOpen(false)}
                      >
                        <span>
                          <span className="font-medium">{loc.name}</span>
                          {(loc.city || loc.country) && (
                            <span className="text-gray-500 text-sm">
                              {" "}
                              · {[loc.city, loc.country].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </span>
                        <span className="text-sm text-gray-500">{count} listing{count !== 1 ? "s" : ""}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {rankedCategories.length > 0 && (
              <div className="py-2 border-t border-gray-50">
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Categories
                </div>
                <ul className="grid sm:grid-cols-2 gap-1 px-2 pb-2">
                  {rankedCategories.slice(0, CATEGORY_PREVIEW).map(({ cat }) => (
                    <li key={cat.id}>
                      <Link
                        href={`/discover?category=${encodeURIComponent(cat.id)}${query.trim() ? `&q=${encodeURIComponent(query.trim())}` : ""}`}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-orange-50/80 transition-colors text-gray-900"
                        onClick={() => setOpen(false)}
                      >
                        <span className="text-lg" aria-hidden>
                          {cat.icon ?? "•"}
                        </span>
                        <span className="font-medium truncate">{cat.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasResults && query.trim() && (
              <div className="px-4 py-3 bg-gray-50/90 border-t border-gray-100">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-900 py-2"
                  onClick={goDiscoverAll}
                >
                  See all results for &quot;{query.trim()}&quot;
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
      )}

      {/* <p className="mt-3 text-center text-xs sm:text-sm text-orange-100/90 px-2">
        Searches names, descriptions, cities, countries, categories, and tags. Use a few keywords for best results.
      </p> */}
    </div>
  )
}
