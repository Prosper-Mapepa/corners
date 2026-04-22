"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Star,
  Heart,
  Share2,
  Clock,
  DollarSign,
  Map as MapIcon,
  Grid,
  List,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { api } from "@/lib/api"
import { buildPlaceHaystack, haystackMatchesTokens, normalizeSearchTokens } from "@/lib/search-utils"
import { useAuth } from "@/hooks/use-auth"
import { DashboardNav } from "@/components/dashboard-nav"
import { PlaceActions } from "@/components/place-actions"
import { useLocationExplore } from "@/providers/location-provider"
import { LandingSearch } from "@/components/landing-search"
import { PlacesGoogleMap } from "@/components/places-google-map"
import { haversineKm } from "@/lib/geo"
import { getCoordsForPlace } from "@/lib/place-coords"

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

type ApiPlace = {
  id: string
  name: string
  description: string
  category: ApiCategory
  location: ApiLocation
  rating: number
  reviews: number
  priceLevel: string
  priceRangeMin?: number | null
  priceRangeMax?: number | null
  imageUrl?: string | null
  isOpen: boolean
  tags: string[]
  distance?: string | null
  verified: boolean
  featured: boolean
  status: string
}

function DiscoverContent() {
  const { user } = useAuth()
  const { searchCenter, radiusKm } = useLocationExplore()
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get("category") || "all")
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "all")
  const [viewMode, setViewMode] = useState("grid")
  const [priceRange, setPriceRange] = useState<[number, number]>([1, 4])
  const [minRating, setMinRating] = useState<string>("any")
  const [maxDistance, setMaxDistance] = useState<string>("any")
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [locations, setLocations] = useState<ApiLocation[]>([])
  const [places, setPlaces] = useState<ApiPlace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMapView, setShowMapView] = useState(false)

  const qParam = searchParams.get("q") ?? ""
  const categoryParam = searchParams.get("category") || "all"
  const locationParam = searchParams.get("location") || "all"

  useEffect(() => {
    setSelectedCategory(categoryParam)
    setSelectedLocation(locationParam)
  }, [qParam, categoryParam, locationParam])

  const searchQuery = qParam

  // Price level to range mapping
  const priceLevelToRange = {
    1: { min: 0, max: 25, label: "$0 - $25" },
    2: { min: 25, max: 50, label: "$25 - $50" },
    3: { min: 50, max: 100, label: "$50 - $100" },
    4: { min: 100, max: Infinity, label: "$100+" },
  }

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [categoriesResponse, locationsResponse, placesResponse] = await Promise.all([
          api.get<ApiCategory[]>("/categories"),
          api.get<ApiLocation[]>("/locations"),
          api.get<ApiPlace[]>("/places?status=approved"),
        ])
        if (!isMounted) return
        setCategories(categoriesResponse)
        setLocations(locationsResponse)
        setPlaces(
          placesResponse.map((place) => ({
            ...place,
            rating: typeof place.rating === "string" ? parseFloat(place.rating) : place.rating,
          })),
        )
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : "Failed to load discover data.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [])

  const categoryStats = useMemo(() => {
    const counts = new Map<string, number>()
    places.forEach((place) => {
      const key = place.category?.id
      if (!key) return
      counts.set(key, (counts.get(key) ?? 0) + 1)
    })
    return counts
  }, [places])

  const locationStats = useMemo(() => {
    const counts = new Map<string, number>()
    places.forEach((place) => {
      const key = place.location?.id
      if (!key) return
      counts.set(key, (counts.get(key) ?? 0) + 1)
    })
    return counts
  }, [places])

  const categoryOptions = useMemo(
    () => [
      {
        id: "all",
        name: "All Categories",
        icon: "🌍",
        count: places.length,
      },
      ...categories.map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon ?? "•",
        count: categoryStats.get(category.id) ?? 0,
      })),
    ],
    [categories, categoryStats, places.length],
  )

  const locationOptions = useMemo(
    () => [
      {
        id: "all",
        name: "All Locations",
        count: places.length,
      },
      ...locations.map((location) => ({
        id: location.id,
        name: location.name,
        count: locationStats.get(location.id) ?? 0,
      })),
    ],
    [locations, locationStats, places.length],
  )

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      // Category filter
      if (selectedCategory !== "all" && place.category?.id !== selectedCategory) {
        return false
      }
      
      // Location filter
      if (selectedLocation !== "all" && place.location?.id !== selectedLocation) {
        return false
      }
      
      // Price filter - check both priceLevel and priceRangeMin/Max
      let priceMatches = false
      
      // First, check if place has actual price range values
      if (place.priceRangeMin !== undefined && place.priceRangeMin !== null && 
          place.priceRangeMax !== undefined && place.priceRangeMax !== null) {
        const filterMinRange = priceLevelToRange[priceRange[0] as keyof typeof priceLevelToRange]
        const filterMaxRange = priceLevelToRange[priceRange[1] as keyof typeof priceLevelToRange]
        
        // Check if place's price range overlaps with filter range
        const placeMin = place.priceRangeMin
        const placeMax = place.priceRangeMax
        const filterMin = filterMinRange.min
        const filterMax = filterMaxRange.max === Infinity ? 10000 : filterMaxRange.max
        
        // Check if there's any overlap
        priceMatches = !(placeMax < filterMin || placeMin > filterMax)
      } else {
        // Fall back to price level matching
        const priceLevelValue = place.priceLevel?.length ?? 1
        priceMatches = priceLevelValue >= priceRange[0] && priceLevelValue <= priceRange[1]
      }
      
      if (!priceMatches) {
        return false
      }
      
      // Rating filter
      if (minRating !== "any") {
        const minRatingValue = parseFloat(minRating)
        if (place.rating < minRatingValue) {
          return false
        }
      }
      
      // Distance filter
      if (maxDistance !== "any" && place.distance) {
        const distanceValue = parseFloat(place.distance.replace(/[^0-9.]/g, ""))
        const maxDistanceValue = parseFloat(maxDistance)
        if (distanceValue > maxDistanceValue) {
          return false
        }
      }
      
      // Search query filter — each word must match somewhere (name, description, tags, location, category, slugs)
      if (searchQuery.trim()) {
        const tokens = normalizeSearchTokens(searchQuery)
        if (tokens.length > 0) {
          const haystack = buildPlaceHaystack(place)
          if (!haystackMatchesTokens(haystack, tokens)) {
            return false
          }
        }
      }

      if (searchCenter) {
        const d = haversineKm(searchCenter, getCoordsForPlace(place))
        if (d > radiusKm) return false
      }

      return true
    })
  }, [
    places,
    selectedCategory,
    selectedLocation,
    priceRange,
    minRating,
    maxDistance,
    searchQuery,
    priceLevelToRange,
    searchCenter,
    radiusKm,
  ])


  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <DashboardNav variant="explorer" />

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Search */}
        <div id="discover-search" className="mb-8 scroll-mt-28 bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover Amazing Places </h1>
          <p className="text-gray-600 mb-8">Find authentic experiences across Africa</p>

          <div className="mb-6">
            <LandingSearch
              places={places}
              locations={locations}
              categories={categories}
              isLoading={isLoading}
              initialQuery={searchQuery}
              className="max-w-none px-0"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-3 mt-6">
            {categoryOptions.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600"
                    : "hover:bg-orange-50 hover:border-orange-300"
                } rounded-xl`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{filteredPlaces.length} places found</h2>
            <p className="text-gray-600">
              {selectedCategory !== "all" && `in ${categoryOptions.find((c) => c.id === selectedCategory)?.name ?? ""}`}
              {selectedLocation !== "all" &&
                ` near ${locationOptions.find((l) => l.id === selectedLocation)?.name ?? ""}`}
              {searchCenter && (
                <span className="mt-1 block text-gray-600 sm:mt-0 sm:inline sm:before:mr-1 sm:before:content-['·']">
                  Within {radiusKm} km of your area
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-orange-500" : ""}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-orange-500" : ""}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={showMapView ? "default" : "outline"}
              size="sm"
              className={showMapView ? "bg-orange-500 hover:bg-orange-600" : ""}
              onClick={() => setShowMapView((v) => !v)}
            >
              <MapIcon className="mr-2 h-4 w-4" />
              {showMapView ? "Hide map" : "Map view"}
            </Button>
          </div>
        </div>

        {/* Results Grid */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-600">
            {error}
          </div>
        )}

        {showMapView && !isLoading && filteredPlaces.length > 0 && (
          <div className="mb-8">
            <PlacesGoogleMap
              places={filteredPlaces.slice(0, 150)}
              mapCenter={searchCenter}
              zoom={searchCenter ? 10 : 4}
              minHeight={440}
            />
          </div>
        )}

        {showMapView && !isLoading && filteredPlaces.length === 0 && (
          <div className="mb-8 rounded-2xl border border-dashed border-orange-200 bg-white p-8 text-center text-gray-600">
            No places match your filters for the map. Clear filters or widen your area radius.
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border-0 shadow-lg animate-pulse">
                <CardContent className="p-0">
                  <div className={`h-48 w-full bg-orange-100 ${viewMode === "list" ? "h-32" : "h-48"}`} />
                  <div className="space-y-3 p-6">
                    <div className="h-6 w-2/3 rounded bg-gray-200" />
                    <div className="h-4 w-1/2 rounded bg-gray-200" />
                    <div className="h-4 w-full rounded bg-gray-100" />
                    <div className="h-4 w-3/4 rounded bg-gray-100" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-12 text-center">
            <MapIcon className="mx-auto mb-4 h-10 w-10 text-orange-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No places match your filters yet</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search terms to discover more experiences across the continent.
            </p>
            <p className="text-sm text-orange-700">Try a different search, category, or location above.</p>
          </div>
        ) : (
        <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {filteredPlaces.map((place) => (
            <Card
              key={place.id}
              className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={place.imageUrl || "/placeholder.svg"}
                    alt={place.name}
                    width={400}
                    height={250}
                    className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                      viewMode === "grid" ? "h-48" : "h-32"
                    }`}
                  />
                  <div className="absolute top-3 right-3 z-10">
                    <PlaceActions placeId={place.id} variant="compact" showFollow={user?.role === "user"} />
                  </div>
                  <div className="absolute top-3 left-3 flex gap-2">
                    {place.featured && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                        ⭐ Featured
                      </Badge>
                    )}
                    {place.verified && <Badge className="bg-green-500 text-white border-0">✓ Verified</Badge>}
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge
                      variant={place.isOpen ? "default" : "secondary"}
                      className={`${place.isOpen ? "bg-green-500" : "bg-gray-500"} text-white`}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {place.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-1">
                        {place.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {place.location?.name}
                        {place.distance ? ` • ${place.distance}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center text-lg font-bold text-gray-900">
                      <DollarSign className="w-5 h-5" />
                      <span>
                        {place.priceRangeMin !== undefined && place.priceRangeMin !== null && 
                         place.priceRangeMax !== undefined && place.priceRangeMax !== null
                          ? `$${place.priceRangeMin} - $${place.priceRangeMax}`
                          : place.priceLevel || "$$"}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{place.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-lg font-bold ml-1">{place.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">({place.reviews} reviews)</span>
                    </div>
                    <Badge variant="outline" className="border-orange-200 text-orange-700">
                      {place.category?.name ?? "Experience"}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(place.tags ?? []).slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {(place.tags?.length ?? 0) > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{(place.tags?.length ?? 0) - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/place/${place.id}`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl">
                        View Details
                      </Button>
                    </Link>
                
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}

        {/* Load More */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="px-12 py-3 rounded-xl border-2 border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            Load More Places
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
          <p className="text-gray-600">Loading experiences...</p>
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  )
}
