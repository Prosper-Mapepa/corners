"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Star, Search, Heart, Share2, Trash2, Grid, List, Calendar, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function SavedPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const savedPlaces = [
    {
      id: 1,
      name: "Mama Africa Restaurant",
      category: "Restaurant",
      location: "Lagos, Nigeria",
      rating: 4.8,
      reviews: 234,
      price: "$$",
      image: "/placeholder.svg?height=200&width=300",
      savedDate: "2 days ago",
      tags: ["Nigerian", "Traditional", "Family-friendly"],
      notes: "Perfect for family dinner, try the jollof rice!",
    },
    {
      id: 2,
      name: "Safari Lodge Retreat",
      category: "Hotel",
      location: "Nairobi, Kenya",
      rating: 4.9,
      reviews: 156,
      price: "$$$$",
      image: "/placeholder.svg?height=200&width=300",
      savedDate: "1 week ago",
      tags: ["Safari", "Luxury", "Wildlife"],
      notes: "Book for next vacation - amazing wildlife views",
    },
    {
      id: 3,
      name: "Kente Cultural Center",
      category: "Culture",
      location: "Accra, Ghana",
      rating: 4.7,
      reviews: 98,
      price: "$",
      image: "/placeholder.svg?height=200&width=300",
      savedDate: "2 weeks ago",
      tags: ["Cultural", "Educational", "Traditional"],
      notes: "Great for learning about Ghanaian culture",
    },
    {
      id: 4,
      name: "The Rooftop Lounge",
      category: "Nightlife",
      location: "Cape Town, South Africa",
      rating: 4.6,
      reviews: 189,
      price: "$$$",
      image: "/placeholder.svg?height=200&width=300",
      savedDate: "3 weeks ago",
      tags: ["Cocktails", "Views", "Upscale"],
      notes: "Best sunset views in Cape Town",
    },
  ]

  const collections = [
    { id: "all", name: "All Saved", count: savedPlaces.length },
    { id: "restaurants", name: "Restaurants", count: 1 },
    { id: "hotels", name: "Hotels", count: 1 },
    { id: "culture", name: "Culture", count: 1 },
    { id: "nightlife", name: "Nightlife", count: 1 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Corners
              </span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/discover" className="text-gray-700 hover:text-orange-600 transition-colors">
                Discover
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-orange-600 transition-colors">
                Profile
              </Link>
              <Link href="/saved" className="text-orange-600 font-medium">
                Saved
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {savedPlaces.map((place) => (
            <Card key={place.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={place.image || "/placeholder.svg"}
                    alt={place.name}
                    width={400}
                    height={200}
                    className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                      viewMode === "grid" ? "h-48" : "h-32"
                    }`}
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white rounded-full">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 hover:bg-white rounded-full text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-1">
                        {place.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {place.location}
                      </div>
                    </div>
                    <Badge variant="outline" className="border-orange-200 text-orange-700">
                      {place.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-lg font-bold ml-1">{place.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">({place.reviews} reviews)</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{place.price}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {place.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {place.notes && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-amber-800 italic">&ldquo;{place.notes}&rdquo;</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      Saved {place.savedDate}
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
          ))}
        </div>

        {/* Empty State */}
        {savedPlaces.length === 0 && (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No saved places yet</h3>
            <p className="text-gray-600 mb-6">Start exploring and save places you want to visit</p>
            <Link href="/discover">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                Discover Places
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
