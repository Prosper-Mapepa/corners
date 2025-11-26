"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Star, Search, Heart, Share2, Trash2, Grid, List, Calendar, Filter, Loader2, DollarSign } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { PlaceActions } from "@/components/place-actions"
import { DashboardNav } from "@/components/dashboard-nav"

type SavedPlace = {
  id: string
  note?: string | null
  createdAt: string
  place: {
    id: string
    name: string
    description: string
    rating: number
    reviews: number
    priceLevel: string
    priceRangeMin?: number | null
    priceRangeMax?: number | null
    imageUrl?: string | null
    tags: string[]
    category: {
      id: string
      name: string
    }
    location: {
      id: string
      name: string
      city?: string | null
      country?: string | null
    }
  }
}

export default function SavedPage() {
  const router = useRouter()
  const { token, user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    if (!token) {
      router.replace("/login")
      return
    }
    loadSavedPlaces()
    loadCategories()
  }, [token, router])

  const loadSavedPlaces = async () => {
    if (!token) return
    try {
      setIsLoading(true)
      const data = await api.get<SavedPlace[]>("/auth/saved-places", { auth: token })
      setSavedPlaces(data)
    } catch (err) {
      console.error("Failed to load saved places:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await api.get<Array<{ id: string; name: string }>>("/categories")
      setCategories(data)
    } catch (err) {
      console.error("Failed to load categories:", err)
    }
  }

  const handleUnsave = async (placeId: string) => {
    if (!token) return
    try {
      await api.post(`/auth/unsave-place/${placeId}`, {}, { auth: token })
      await loadSavedPlaces()
    } catch (err) {
      console.error("Failed to unsave place:", err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    if (days < 365) return `${Math.floor(days / 30)} months ago`
    return `${Math.floor(days / 365)} years ago`
  }

  const filteredPlaces = useMemo(() => {
    let filtered = savedPlaces

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((sp) => sp.place.category.id === selectedCategory)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((sp) => {
        const searchable = [
          sp.place.name,
          sp.place.description,
          sp.place.location.name,
          sp.place.category.name,
          ...(sp.place.tags ?? []),
          sp.note,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        return searchable.includes(query)
      })
    }

    return filtered
  }, [savedPlaces, selectedCategory, searchQuery])

  const collections = useMemo(() => {
    const all = { id: "all", name: "All Saved", count: savedPlaces.length }
    const byCategory = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      count: savedPlaces.filter((sp) => sp.place.category.id === cat.id).length,
    }))
    return [all, ...byCategory]
  }, [savedPlaces, categories])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <DashboardNav variant="explorer" />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Saved Places</h1>
          <p className="text-gray-600">Keep track of places you want to visit or remember</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search your saved places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 border-2 border-gray-200 focus:border-orange-400 rounded-xl"
              />
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
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* Collections */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="bg-gray-100 rounded-xl p-1">
              {collections.map((collection) => (
                <TabsTrigger
                  key={collection.id}
                  value={collection.id}
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  {collection.name}
                  <Badge variant="secondary" className="ml-2">
                    {collection.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {searchQuery || selectedCategory !== "all" ? "No saved places match your filters" : "No saved places yet"}
            </h3>
            <p className="text-gray-600 mb-6">Start exploring and save places you want to visit</p>
            <Link href="/discover">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                Discover Places
              </Button>
            </Link>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {filteredPlaces.map((savedPlace) => {
              const place = savedPlace.place
              return (
                <Card key={savedPlace.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-0">
                    <div className="relative">
                      <Link href={`/place/${place.id}`}>
                        <Image
                          src={place.imageUrl || "/placeholder.svg"}
                          alt={place.name}
                          width={400}
                          height={200}
                          className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer ${
                            viewMode === "grid" ? "h-48" : "h-32"
                          }`}
                        />
                      </Link>
                      <div className="absolute top-3 right-3 z-10">
                        <PlaceActions placeId={place.id} variant="compact" showFollow={false} />
                      </div>
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-green-500 text-white border-0">
                          <Heart className="w-3 h-3 mr-1 fill-current" />
                          Saved
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <Link href={`/place/${place.id}`}>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-1 cursor-pointer">
                              {place.name}
                            </h3>
                          </Link>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            {place.location.name}
                            {place.location.city && `, ${place.location.city}`}
                            {place.location.country && `, ${place.location.country}`}
                          </div>
                        </div>
                        <Badge variant="outline" className="border-orange-200 text-orange-700 ml-2">
                          {place.category.name}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="text-lg font-bold ml-1">{Number(place.rating).toFixed(1)}</span>
                          <span className="text-sm text-gray-500 ml-1">({place.reviews} reviews)</span>
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

                      {place.tags && place.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {place.tags.slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {place.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{place.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {savedPlace.note && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-amber-800 italic">"{savedPlace.note}"</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          Saved {formatDate(savedPlace.createdAt)}
                        </div>
                        <Link href={`/place/${place.id}`}>
                          <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
