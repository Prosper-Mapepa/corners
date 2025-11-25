"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  MapPin,
  Star,
  Search,
  Heart,
  Share2,
  Clock,
  DollarSign,
  Map as MapIcon,
  Grid,
  List,
  SlidersHorizontal,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { api } from "@/lib/api"

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
  imageUrl?: string | null
  isOpen: boolean
  tags: string[]
  distance?: string | null
  verified: boolean
  featured: boolean
  status: string
}

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [viewMode, setViewMode] = useState("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([1, 4])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [locations, setLocations] = useState<ApiLocation[]>([])
  const [places, setPlaces] = useState<ApiPlace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      if (selectedCategory !== "all" && place.category?.id !== selectedCategory) {
        return false
      }
      if (selectedLocation !== "all" && place.location?.id !== selectedLocation) {
        return false
      }
      const priceLevelValue = place.priceLevel?.length ?? 1
      if (priceLevelValue < priceRange[0] || priceLevelValue > priceRange[1]) {
        return false
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const haystack = [
          place.name,
          place.description,
          place.location?.name,
          place.category?.name,
          ...(place.tags ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        if (!haystack.includes(query)) {
          return false
        }
      }
      return true
    })
  }, [places, selectedCategory, selectedLocation, priceRange, searchQuery])


  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Corners
                </span>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/discover" className="text-orange-600 font-medium">
                Discover
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-orange-600 transition-colors">
                Profile
              </Link>
              <Link href="/saved" className="text-gray-700 hover:text-orange-600 transition-colors">
                Saved
              </Link>
              <Link href="/events" className="text-gray-700 hover:text-orange-600 transition-colors">
                Events
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="hover:bg-orange-50">
                <Heart className="w-4 h-4 mr-2" />
                Saved (3)
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Search */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover Amazing Places </h1>
          <p className="text-gray-600 mb-8">Find authentic experiences across Africa</p>

          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for restaurants, hotels, events, or experiences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-orange-400 rounded-xl"
              />
            </div>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full lg:w-64 h-14 border-2 border-gray-200 rounded-xl">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{location.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {location.count}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="h-14 px-8 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 rounded-xl shadow-lg"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 rounded-xl p-6 space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Level</label>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange([value[0] ?? 1, value[1] ?? value[0] ?? 4])}
                    min={1}
                    max={4}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{"$".repeat(priceRange[0]) || "$"}</span>
                    <span>{"$".repeat(priceRange[1]) || "$$$$"}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4.5">4.5+ stars</SelectItem>
                      <SelectItem value="4.0">4.0+ stars</SelectItem>
                      <SelectItem value="3.5">3.5+ stars</SelectItem>
                      <SelectItem value="any">Any rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Distance</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any distance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Within 1 km</SelectItem>
                      <SelectItem value="5">Within 5 km</SelectItem>
                      <SelectItem value="10">Within 10 km</SelectItem>
                      <SelectItem value="any">Any distance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

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
            <Button variant="outline" size="sm">
              <MapIcon className="w-4 h-4 mr-2" />
              Map View
            </Button>
          </div>
        </div>

        {/* Results Grid */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-600">
            {error}
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
            <Button variant="outline" onClick={() => setShowFilters(true)}>
              Adjust Filters
            </Button>
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
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white rounded-full">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white rounded-full">
                      <Share2 className="w-4 h-4" />
                    </Button>
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
                      <span>{place.priceLevel || "$$"}</span>
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
                    <Button variant="outline" className="px-4 rounded-xl border-orange-200 hover:bg-orange-50">
                      <Heart className="w-4 h-4" />
                    </Button>
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
