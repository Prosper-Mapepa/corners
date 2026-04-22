"use client"

import { Fragment, useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Utensils, Hotel, Music, Camera, Shield, Star, ArrowRight, Play, Download, Sparkles } from "lucide-react"
import { LandingSearch } from "@/components/landing-search"
import { AppComingSoonModal } from "@/components/app-coming-soon-modal"
import { SiteHeader } from "@/components/site-header"
import { AfricaIcon } from "@/components/AfricaIcon"
import Link from "next/link"
import Image from "next/image"
import Africa from "@/assets/africa.png"
import Africaa from "@/assets/africaa.png"
import "./globals.css"
import Lagos from "@/assets/lagos.jpeg"
import Captown from "@/assets/cp.jpg"
import Nairobi from "@/assets/nairobi.jpg"
import Accra from "@/assets/accra.jpg"
import Drums from "@/assets/african-drums.png"
import Mask from "@/assets/mask.png"
import Globe from "@/assets/globe.png"
import Woman from "@/assets/woman.png"
import Happy from "@/assets/happy.png"
import Shirt from "@/assets/shirt.png"
import AfricanDrum from "@/assets/african-drum.png"
import Djembe from "@/assets/djembe.png"
import { api } from "@/lib/api"
import { useLocationExplore } from "@/providers/location-provider"
import { PlacesGoogleMap } from "@/components/places-google-map"
import { haversineKm } from "@/lib/geo"
import { getCoordsForPlace } from "@/lib/place-coords"

type ApiLocation = {
  id: string
  name: string
  slug: string
  city?: string | null
  country?: string | null
}

type ApiCategory = {
  id: string
  name: string
  slug: string
  icon?: string | null
}

type ApiPlace = {
  id: string
  name: string
  description?: string | null
  category?: ApiCategory
  location: ApiLocation
  rating: number
  reviews: number
  imageUrl?: string | null
  tags?: string[]
  featured?: boolean
  status: string
}

const locationImageMap: Record<string, any> = {
  "lagos": Lagos,
  "cape-town": Captown,
  "nairobi": Nairobi,
  "accra": Accra,
}

export default function HomePage() {
  const { searchCenter, radiusKm } = useLocationExplore()
  const [locations, setLocations] = useState<ApiLocation[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [places, setPlaces] = useState<ApiPlace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAppComingSoon, setShowAppComingSoon] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [locationsResponse, categoriesResponse, placesResponse] = await Promise.all([
          api.get<ApiLocation[]>("/locations"),
          api.get<ApiCategory[]>("/categories"),
          api.get<ApiPlace[]>("/places?status=approved"),
        ])
        setLocations(locationsResponse)
        setCategories(categoriesResponse)
        setPlaces(
          placesResponse.map((place) => ({
            ...place,
            rating: typeof place.rating === "string" ? parseFloat(place.rating) : place.rating,
          })),
        )
      } catch (err) {
        console.error("Failed to load data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  /** Listings that match location + radius (all pages use this when an area is set) */
  const placesWithinPreferences = useMemo(() => {
    if (!searchCenter) return places
    return places.filter((p) => haversineKm(searchCenter, getCoordsForPlace(p)) <= radiusKm)
  }, [places, searchCenter, radiusKm])

  const placesForMap = useMemo(() => placesWithinPreferences.slice(0, 120), [placesWithinPreferences])

  const locationsForLandingSearch = useMemo(() => {
    if (!searchCenter) return locations
    const ids = new Set(
      placesWithinPreferences.map((p) => p.location?.id).filter((id): id is string => Boolean(id)),
    )
    if (ids.size === 0) return locations
    return locations.filter((l) => ids.has(l.id))
  }, [locations, placesWithinPreferences, searchCenter])

  const categoriesForLandingSearch = useMemo(() => {
    if (!searchCenter) return categories
    const ids = new Set(
      placesWithinPreferences.map((p) => p.category?.id).filter((id): id is string => Boolean(id)),
    )
    if (ids.size === 0) return categories
    return categories.filter((c) => ids.has(c.id))
  }, [categories, placesWithinPreferences, searchCenter])

  const popularDestinations = useMemo(() => {
    // Group places by location and calculate stats
    const locationStats = new Map<string, {
      location: ApiLocation
      places: ApiPlace[]
      totalSpots: number
      avgRating: number
      totalReviews: number
    }>()

    placesWithinPreferences.forEach((place) => {
      const locationId = place.location?.id
      if (!locationId) return

      if (!locationStats.has(locationId)) {
        locationStats.set(locationId, {
          location: place.location,
          places: [],
          totalSpots: 0,
          avgRating: 0,
          totalReviews: 0,
        })
      }

      const stats = locationStats.get(locationId)!
      stats.places.push(place)
      stats.totalSpots += 1
      stats.totalReviews += place.reviews || 0
    })

    // Calculate average ratings
    locationStats.forEach((stats) => {
      if (stats.places.length > 0) {
        const totalRating = stats.places.reduce((sum, p) => sum + (p.rating || 0), 0)
        stats.avgRating = totalRating / stats.places.length
      }
    })

    const groupedDestinations = Array.from(locationStats.values())
      .filter((stats) => stats.totalSpots > 0)
      .sort((a, b) => b.totalSpots - a.totalSpots)
      .slice(0, searchCenter ? 12 : 8)
      .map((stats) => {
        const locationSlug = stats.location.slug.toLowerCase()
        const image = locationImageMap[locationSlug] || locationImageMap[locationSlug.replace(/\s+/g, "-")] || Lagos
        
        // Generate highlight based on location name or category
        const highlights: Record<string, string> = {
          "lagos": "Vibrant nightlife & cuisine",
          "cape-town": "Stunning landscapes & wine",
          "nairobi": "Safari & urban culture",
          "accra": "Rich history & beaches",
        }
        const highlight = highlights[locationSlug] || highlights[locationSlug.replace(/\s+/g, "-")] || "Amazing experiences"

        return {
          id: stats.location.id,
          name: stats.location.name,
          country: stats.location.country || stats.location.city || "",
          spots: `${stats.totalSpots.toLocaleString()} spot${stats.totalSpots !== 1 ? "s" : ""}`,
          image,
          rating: Number(stats.avgRating.toFixed(1)),
          highlight,
          href: `/discover?location=${stats.location.id}`,
        }
      })

    if (groupedDestinations.length >= 2 || placesWithinPreferences.length <= 1) {
      return groupedDestinations
    }

    return placesWithinPreferences.slice(0, searchCenter ? 12 : 8).map((place) => ({
      id: place.id,
      name: place.name,
      country: place.location?.name || place.location?.country || "",
      spots: `${(place.reviews ?? 0).toLocaleString()} review${place.reviews === 1 ? "" : "s"}`,
      image: place.imageUrl || Lagos,
      rating: Number((place.rating || 0).toFixed(1)),
      highlight: place.description?.trim() || place.category?.name || "Amazing experiences",
      href: `/place/${place.id}`,
    }))
  }, [placesWithinPreferences, searchCenter])

  const shouldAutoScrollDestinations = popularDestinations.length >= 3

  const features = [
    {
      icon: Utensils,
      title: "Authentic Cuisine",
      description: "From street food to fine dining, discover the flavors that define each region of Africa.",
      color: "bg-white",
      hoverColor: "hover:bg-orange-50",
      iconColor: "text-orange-500 group-hover:text-orange-600",
      features: ["Local restaurants", "Street food guides", "Traditional recipes"],
    },
    {
      icon: Hotel,
      title: "Unique Stays",
      description: "Find accommodations that tell a story, from eco-lodges to cultural heritage sites.",
      color: "bg-white",
      hoverColor: "hover:bg-orange-50",
      iconColor: "text-orange-500 group-hover:text-orange-600",
      features: ["Boutique hotels", "Safari lodges", "Cultural homestays"],
    },
    {
      icon: Music,
      title: "Vibrant Culture",
      description: "Experience the heartbeat of Africa through music, art, and community celebrations.",
      color: "bg-white",
      hoverColor: "hover:bg-orange-50",
      iconColor: "text-orange-500 group-hover:text-orange-600",
      features: ["Live music venues", "Art galleries", "Cultural festivals"],
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Connect with locals and fellow travelers through authentic reviews and recommendations.",
      color: "bg-white",
      hoverColor: "hover:bg-orange-50",
      iconColor: "text-orange-500 group-hover:text-orange-600",
      features: ["Verified reviews", "Local insights", "Travel communities"],
    },
    {
      icon: Camera,
      title: "Visual Discovery",
      description: "Browse stunning photography and virtual tours to find your perfect destination.",
      color: "bg-white",
      hoverColor: "hover:bg-orange-50",
      iconColor: "text-orange-500 group-hover:text-orange-600",
      features: ["Photo galleries", "Virtual tours", "Menu previews"],
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Travel with confidence using our verified listings and secure booking platform.",
      color: "bg-white",
      hoverColor: "hover:bg-orange-50",
      iconColor: "text-orange-500 group-hover:text-orange-600",
      features: ["Verified businesses", "Secure payments", "24/7 support"],
    },
  ]

  const heroCategories = [
    { id: "restaurants", name: "Restaurants", icon: "🍽️", description: "Authentic local cuisine", image: Lagos },
    { id: "hotels", name: "Hotels & Lodges", icon: "🏨", description: "Unique accommodations", image: Captown },
    { id: "nightlife", name: "Nightlife", icon: "🌙", description: "Vibrant entertainment", image: Nairobi },
    { id: "culture", name: "Cultural Sites", icon: "🎭", description: "Rich heritage experiences", image: Accra },
    { id: "shopping", name: "Markets & Shopping", icon: "🛍️", description: "Local crafts & goods", image: Mask },
    { id: "outdoor", name: "Outdoor Adventures", icon: "🌳", description: "Nature & wildlife", image: Globe },
    { id: "wellness", name: "Wellness & Spa", icon: "🧘", description: "Relaxation & healing", image: Woman },
    { id: "events", name: "Events & Festivals", icon: "🎉", description: "Cultural celebrations", image: Drums },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-yellow-800 relative overflow-hidden">
      {/* Pattern Overlay */}
      <div className="fixed inset-0 opacity-10 pointer-events-none mix-blend-soft-light">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M0 0h40v40H0V0zm40 40h40v40H40V40zM0 40h20v20H0V40zm20 0h20v20H20V40zm40 0h20v20H60V40zm-20 0h20v20H40V40z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* Animated Background Shapes */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-500/10 rotate-45 animate-float" />
          <div className="absolute top-3/4 right-1/4 w-40 h-40 bg-orange-500/10 rotate-12 animate-float-delayed" />
          <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-red-500/10 -rotate-12 animate-float" />
        </div>
      </div>

      <SiteHeader />

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center py-10 sm:py-16 md:py-24 px-3 sm:px-6 lg:px-8">
        <div className="absolute inset-0 w-full h-full">
          {/* Animated gradient backgrounds */}
          <div className="absolute inset-0 bg-gradient-radial from-amber-500 via-orange-600 to-red-700 animate-gradient-slow" />
          <div className="absolute inset-0 bg-gradient-conic from-yellow-500 via-orange-600 to-red-600 mix-blend-soft-light animate-gradient-rotate" />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 via-orange-500/30 to-red-600/30 animate-gradient-pulse" />
          
          {/* Floating Orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-yellow-500/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-orange-500/20 rounded-full blur-3xl animate-float-delayed" />
            <div className="absolute top-3/4 left-1/3 w-48 h-48 sm:w-64 sm:h-64 bg-red-500/20 rounded-full blur-3xl animate-float-2" />
          </div>
        </div>

        {/* Content */}
        <div className="relative mx-auto w-full max-w-7xl">
          <div className="text-center">
            <h1 className="mb-5 w-full px-1 sm:mb-7 sm:px-4">
              <div className="mx-auto flex w-full max-w-7xl justify-center px-0 sm:px-4">
                <div className="flex w-full min-w-0 max-w-full justify-center overflow-x-clip overflow-y-visible">
                  <span className="animate-typing-hero gap-x-1 font-bold leading-[1.08] tracking-tight text-[clamp(1.45rem,5.2vw+0.15rem,2rem)] drop-shadow-md sm:gap-x-2 sm:text-[clamp(1.8rem,4.8vw+0.45rem,4.9rem)] md:gap-x-2.5 lg:gap-x-3">
                    <span className="text-white">Your</span>
                    <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent">
                      African
                    </span>
                  
                    <span className="text-white">Lifestyle Companion</span>  <Image
                      src={Africa}
                      alt="Africa"
                      width={112}
                      height={112}
                      sizes="(max-width: 640px) 36px, (max-width: 1024px) 56px, 72px"
                      className="h-[0.84em] w-[0.84em] shrink-0 object-contain"
                    />
                  </span>
                </div>
              </div>
            </h1>

            <div className="mx-auto mb-7 w-full max-w-5xl px-2 text-center sm:mb-10 sm:px-5 md:px-8">
              <p className="text-pretty text-base font-light leading-relaxed tracking-normal text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.18)] antialiased sm:text-lg md:text-xl md:leading-[1.7] lg:text-2xl">
                Skip the tourist traps. Corners is your gateway to the best local experiences in Africa, from buzzing nightclubs to hidden gems, local businesses, and vibrant culture.
              </p>
            </div>

            <div className="mx-auto w-full max-w-4xl px-3 sm:px-6">
              <LandingSearch
                places={placesWithinPreferences}
                locations={locationsForLandingSearch}
                categories={categoriesForLandingSearch}
                isLoading={isLoading}
              />
            </div>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 px-3 sm:mt-10 sm:flex-row sm:gap-6 sm:px-4 sm:mb-12 md:mb-14 lg:mb-16">
              <Link href="/discover" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-medium relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Start Exploring
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </Link>

              <Button
                type="button"
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 rounded-xl border-2 border-yellow-400/50 text-white bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 hover:from-yellow-500/30 hover:via-orange-500/30 hover:to-red-500/30 hover:border-yellow-300 transition-all duration-300 backdrop-blur-sm group shadow-lg hover:shadow-yellow-500/20"
                onClick={() => setShowAppComingSoon(true)}
              >
                <Download className="mr-2 w-4 h-4 sm:w-5 sm:h-5 transform group-hover:scale-110 transition-transform duration-300" />
                Download App
              </Button>
            </div>

            {/* Category Slider */}
            <div className="relative -mx-3 mt-6 overflow-hidden sm:-mx-6 sm:mt-12 md:mt-14 lg:-mx-8">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-amber-200/25 to-transparent sm:w-7 md:w-10" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-gradient-to-l from-amber-200/25 to-transparent sm:w-7 md:w-10" />

              <div className="flex animate-scroll-hero-categories gap-3 px-1 hover:pause sm:gap-4 md:gap-5 sm:px-2">
                {[...heroCategories, ...heroCategories].map((category, idx) => (
                  <div
                    key={`${category.id}-${idx}`}
                    className="group relative w-52 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-white/35 bg-black/20 p-5 shadow-lg shadow-orange-950/10 backdrop-blur-md transition-all duration-300 hover:scale-[0.99] hover:border-white/55 hover:bg-white/30 sm:w-60 sm:rounded-2xl sm:p-6 md:w-[17.5rem] min-h-[9.5rem] sm:min-h-[10.5rem]"
                  >
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={category.image}
                        alt=""
                        fill
                        className="object-cover opacity-[0.35] transition-opacity duration-300 group-hover:opacity-[0.48]"
                        aria-hidden
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-orange-600/25 via-orange-700/35 to-orange-900/50" />
                    </div>
                    <div className="relative z-10 flex min-h-[7.5rem] flex-col items-center justify-center text-center sm:min-h-[8rem]">
                      <span className="mb-3 text-3xl drop-shadow transition-transform duration-300 group-hover:scale-110 sm:mb-3.5 sm:text-4xl">
                        {category.icon}
                      </span>
                      <h4 className="mb-1.5 text-sm font-semibold leading-snug text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] sm:text-base">
                        {category.name}
                      </h4>
                      <p className="max-w-[13rem] text-xs leading-snug text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)] sm:text-sm">
                        {category.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            {/* <Badge
              variant="secondary"
              className="mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-orange-700 border border-orange-200/50 backdrop-blur-sm text-sm sm:text-base"
            >
              ✨ Everything You Need
            </Badge> */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 px-2">
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Africa</span> Like Never Before
            </h2>
            <p className="mx-auto max-w-2xl px-4 text-base leading-relaxed text-gray-700 sm:text-lg md:text-xl">
              Discover, connect, and experience the rich culture and vibrant lifestyle across the continent with our
              comprehensive platform.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`${feature.color} group flex h-full flex-col rounded-3xl border border-gray-200/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-200/80 hover:shadow-md ${feature.hoverColor} animate-float`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="flex flex-1 flex-col p-6 text-left sm:p-8">
                  <div className="mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 transition-transform duration-300 group-hover:scale-105 sm:h-14 sm:w-14">
                    <feature.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold leading-snug tracking-tight text-gray-900 sm:text-[1.35rem]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-gray-700 sm:text-[1.05rem]">{feature.description}</p>
                  <div className="mt-6 grow sm:mt-7" aria-hidden="true" />
                  <ul
                    className="space-y-2.5 border-t border-gray-200/80 pt-5 sm:space-y-3 sm:pt-6"
                    aria-label={`${feature.title} highlights`}
                  >
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm font-medium leading-snug text-gray-800 sm:text-[0.95rem]">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-red-500"
                          aria-hidden
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Map & nearby */}
      <section className="border-t border-orange-100/80 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-12 sm:py-16">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-10">
            <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
              See places on the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">map</span>
            </h2>
            <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg">
              {searchCenter
                ? `Showing listings within ${radiusKm} km of your area. Tap a pin for a preview and open the full place page.`
                : "Set your area above to filter by distance, or browse all pins across the continent."}
            </p>
          </div>
          <div className="mx-auto mb-8 max-w-5xl sm:mb-10">
            <LandingSearch
              places={placesWithinPreferences}
              locations={locationsForLandingSearch}
              categories={categoriesForLandingSearch}
              isLoading={isLoading}
            />
          </div>
          {!isLoading && places.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-orange-200 bg-white/80 py-12 text-center text-gray-600">
              No places to show on the map yet.
            </p>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,2.2fr)_minmax(340px,0.95fr)] lg:items-stretch">
              <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-2 shadow-[0_20px_60px_rgba(249,115,22,0.12)] backdrop-blur-sm">
                <div className="overflow-hidden rounded-[22px] border border-orange-100/80 bg-white">
                  <PlacesGoogleMap
                    places={placesForMap}
                    mapCenter={searchCenter}
                    zoom={searchCenter ? 10 : 4}
                    minHeight={460}
                  />
                </div>
              </div>

              {searchCenter ? (
                <div className="rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-[0_20px_60px_rgba(249,115,22,0.12)] backdrop-blur-sm sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3 border-b border-orange-100 pb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Nearby on Corners</h3>
                      <p className="text-sm text-gray-500">Top picks within your selected area</p>
                    </div>
                    <span className="rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                      {Math.min(placesForMap.length, 8)} spots
                    </span>
                  </div>

                  {placesForMap.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      {placesForMap.slice(0, 8).map((p) => (
                        <Link
                          key={p.id}
                          href={`/place/${p.id}`}
                          className="group flex items-center gap-3 overflow-hidden rounded-2xl border border-orange-100/80 bg-gradient-to-r from-white to-orange-50/60 p-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
                        >
                          <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-orange-50">
                            <Image
                              src={p.imageUrl || "/placeholder.svg"}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="96px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">{p.name}</p>
                            <p className="mt-1 text-xs text-gray-500">Open preview from the map or view full details</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-8 text-center">
                      <p className="text-sm font-semibold text-gray-800">No listings found</p>
                      <p className="mt-1 text-sm text-gray-500">Try a larger radius or choose a different area.</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="mb-8 sm:mb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center">
            {/* <Badge
              variant="secondary"
              className="mb-3 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-orange-700 border border-orange-200/50 backdrop-blur-sm text-sm"
            >
              🌟 Popular Destinations
            </Badge> */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Amazing</span> Places
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
              {searchCenter
                ? `Top areas among listings within ${radiusKm} km of your location - explore what is close to you.`
                : "Explore the most loved spots across Africa, curated by our community of explorers"}
            </p>
          </div>
        </div>

        {/* Full-width Destinations Slider */}
        <div className="relative w-full overflow-hidden py-2">
          {shouldAutoScrollDestinations ? (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-amber-50/55 to-transparent sm:w-7 md:w-10" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-gradient-to-l from-amber-50/55 to-transparent sm:w-7 md:w-10" />
            </>
          ) : null}

          <div
            className={`flex gap-5 px-4 sm:gap-7 sm:px-6 md:px-8 ${
              shouldAutoScrollDestinations
                ? "animate-scroll-destinations hover:pause"
                : "flex-wrap justify-center"
            }`}
          >
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card
                  key={index}
                  className="h-[300px] w-[260px] flex-shrink-0 overflow-hidden rounded-2xl border border-white/60 shadow-sm sm:h-[340px] sm:w-[300px] md:h-[380px] md:w-[340px]"
                >
                  <CardContent className="p-0">
                    <div className="h-full animate-pulse bg-gray-200" />
                  </CardContent>
                </Card>
              ))
            ) : popularDestinations.length === 0 ? (
              <div className="w-full px-4 py-12 text-center text-gray-500">
                <p>No destinations available yet. Check back soon!</p>
              </div>
            ) : (
              (shouldAutoScrollDestinations
                ? [...popularDestinations, ...popularDestinations]
                : popularDestinations
              ).map((destination, index) => (
                <Link
                  key={`${destination.id}-${index}`}
                  href={destination.href}
                  className="group flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50"
                >
                  <Card className="h-full w-[260px] overflow-hidden rounded-2xl border border-white/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300/60 hover:shadow-md sm:w-[300px] md:w-[340px]">
                    <CardContent className="flex h-full flex-col p-0">
                      <div className="relative h-[300px] sm:h-[340px] md:h-[380px]">
                        <Image
                          src={destination.image}
                          alt={destination.name}
                          width={680}
                          height={760}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10" />
                        <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
                          <Badge className="border-0 bg-black/55 px-2.5 py-0.5 text-xs text-white shadow-md backdrop-blur-sm sm:text-sm">
                            <Star className="mr-1 h-3 w-3 fill-amber-400 text-amber-400" />
                            {destination.rating}
                          </Badge>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 flex flex-col p-4 sm:p-5">
                          <h3 className="text-lg font-bold leading-tight text-white drop-shadow-sm sm:text-xl">
                            {destination.country
                              ? `${destination.name}, ${destination.country}`
                              : destination.name}
                          </h3>
                          <p className="mt-1 text-xs font-medium text-orange-100/95 sm:text-sm">{destination.spots}</p>
                          <div className="mt-4 flex min-h-[2.75rem] items-center justify-between gap-3 border-t border-white/15 pt-3">
                            <p className="line-clamp-2 min-w-0 flex-1 text-left text-xs leading-snug text-white/90 sm:text-sm">
                              {destination.highlight}
                            </p>
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-orange-800 shadow-sm transition-colors group-hover:bg-amber-300 group-hover:text-orange-950 sm:px-4 sm:text-sm">
                              Explore
                              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="text-center mt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Link href="/discover">
            <Button
              size="lg"
              variant="outline"
              className="px-6 py-4 text-base border-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 rounded-xl"
            >
              Explore All Destinations
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      {/* <section className="py-24 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge
              variant="secondary"
              className="mb-4 px-4 py-2 bg-gray-100 text-gray-600 border-none font-medium"
            >
              💬 What People Say
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Loved by Explorers</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Amara Okafor",
                location: "Lagos, Nigeria",
                text: "Corners helped me discover amazing local restaurants I never knew existed in my own city!",
                rating: 5,
                avatar: "A",
              },
              {
                name: "David Thompson",
                location: "Tourist from UK",
                text: "The best travel companion for exploring Africa. Authentic recommendations from real locals.",
                rating: 5,
                avatar: "D",
              },
              {
                name: "Fatima Al-Rashid",
                location: "Cairo, Egypt",
                text: "As a business owner, Corners has connected me with so many new customers. Incredible platform!",
                rating: 5,
                avatar: "F",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-500 group animate-float"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-orange-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-gray-500 text-sm">{testimonial.location}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-16 left-16 w-64 h-64 bg-orange-100 rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 right-16 w-96 h-96 bg-orange-100 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          {/* <Badge
            variant="secondary"
            className="mb-3 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-orange-700 border border-orange-200/50 backdrop-blur-sm text-sm"
          >
            🚀 Get Started Today
          </Badge> */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">African</span> Adventure
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Join thousands of explorers already using Corners to discover amazing places across Africa. Your journey starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-10 py-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
              >
                Join Free Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/businesses">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-4 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-300"
              >
                List Your Business
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <AppComingSoonModal open={showAppComingSoon} onOpenChange={setShowAppComingSoon} />
    </main>
  )
}
