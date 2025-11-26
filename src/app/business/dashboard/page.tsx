"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle,
  Edit,
  Globe,
  Loader2,
  MapPin,
  MessageSquare,
  Plus,
  Share2,
  Star,
  Trash2,
  Users,
  Clock,
  X,
  Send,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { DashboardNav } from "@/components/dashboard-nav"
import {
  MetadataInputs,
  PlaceMetadata,
  emptyMetadataInputs,
  inputsFromMetadata,
  metadataFromInputs,
} from "@/lib/place-metadata"
import {
  TAG_OPTIONS,
  AMENITY_OPTIONS,
  HIGHLIGHT_OPTIONS,
  DAYS_OF_WEEK,
  TIME_OPTIONS,
  PRICE_RANGE_OPTIONS,
} from "@/lib/form-options"
import { Checkbox } from "@/components/ui/checkbox"
import { BusinessMessagesSection } from "./messages-section"
import { BusinessReservationsSection } from "./reservations-section"

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

type BusinessPlace = {
  id: string
  name: string
  description: string
  category: ApiCategory
  location: ApiLocation
  priceLevel: string
  imageUrl?: string | null
  status: "pending" | "approved" | "rejected"
  rating: number
  reviews: number
  featured: boolean
  verified: boolean
  tags: string[]
  ownerName?: string | null
  metadata?: PlaceMetadata | null
}

type Reservation = {
  id: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  reservationDate: string
  reservationTime: string
  partySize: number
  user: { id: string; name: string; email: string }
  place: { id: string; name: string }
}

type NewPlaceFormState = {
  name: string
  description: string
  categoryId: string
  locationId: string
  priceLevel: string
  imageUrl: string
  tags: string[]
  ownerName: string
}

const initialForm: NewPlaceFormState = {
  name: "",
  description: "",
  categoryId: "",
  locationId: "",
  priceLevel: "$$",
  imageUrl: "",
  tags: [],
  ownerName: "",
}

const statusBadgeStyles: Record<BusinessPlace["status"], string> = {
  approved: "bg-green-500 text-white",
  pending: "bg-yellow-500 text-gray-900",
  rejected: "bg-red-500 text-white",
}

export default function BusinessDashboard() {
  const router = useRouter()
  const { token, user, loading, refreshProfile } = useAuth()
  const [listings, setListings] = useState<BusinessPlace[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [locations, setLocations] = useState<ApiLocation[]>([])
  const [form, setForm] = useState<NewPlaceFormState>({ ...initialForm, ownerName: "" })
  const [metadataInputs, setMetadataInputs] = useState<MetadataInputs>({ ...emptyMetadataInputs })
  const [editingListingId, setEditingListingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [profileSynced, setProfileSynced] = useState(false)
  const [totalReviews, setTotalReviews] = useState(0)
  const [totalFollowers, setTotalFollowers] = useState(0)
  const [totalReservations, setTotalReservations] = useState(0)
  const [pendingReservations, setPendingReservations] = useState(0)
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0)
  const [activeTab, setActiveTab] = useState("listings")
  const [showListingForm, setShowListingForm] = useState(false)

  useEffect(() => {
    if (loading) {
      return
    }
    if (!token) {
      router.replace("/login")
      return
    }
    if (!user && !profileSynced) {
      refreshProfile().finally(() => setProfileSynced(true))
      return
    }
    if (user && user.role !== "business" && user.role !== "admin" && user.role !== "super_admin") {
      router.replace("/discover")
    }
  }, [loading, token, user, router, refreshProfile, profileSynced])

  const fetchData = useCallback(async () => {
    if (!token || !user) return
    try {
      setIsLoading(true)
      setError(null)
      const [placesResponse, categoriesResponse, locationsResponse] = await Promise.all([
        api.get<BusinessPlace[]>(`/places?ownerEmail=${encodeURIComponent(user.email)}`, { auth: token }),
        api.get<ApiCategory[]>("/categories"),
        api.get<ApiLocation[]>("/locations"),
      ])
      const places = placesResponse.map((place) => ({
        ...place,
        rating: typeof place.rating === "string" ? parseFloat(place.rating as unknown as string) : place.rating,
      }))
      setListings(places)
      setCategories(categoriesResponse)
      setLocations(locationsResponse)

      // Calculate total reviews from listings
      const totalReviewsCount = places.reduce((sum, place) => sum + (place.reviews || 0), 0)
      setTotalReviews(totalReviewsCount)

      // Fetch followers count, reservations, and unread messages for all places
      const placeIds = places.map((p) => p.id)
      if (placeIds.length > 0) {
        try {
          const [followersResponse, reservationsResponse, conversationsResponse] = await Promise.all([
            api.post<{ count: number }>("/auth/places/followers-count", { placeIds }, { auth: token }).catch(() => ({ count: 0 })),
            api.get<Reservation[]>("/reservations", { auth: token }).catch(() => []),
            api.get<any[]>("/messages/conversations", { auth: token }).catch(() => []),
          ])
          setTotalFollowers(followersResponse.count || 0)
          
          // Calculate reservation stats
          const allReservations = reservationsResponse || []
          setTotalReservations(allReservations.length)
          setPendingReservations(allReservations.filter((r) => r.status === "pending").length)
          
          // Calculate total unread messages
          const conversations = conversationsResponse || []
          const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)
          setTotalUnreadMessages(totalUnread)
        } catch (err) {
          console.error("Failed to fetch additional data:", err)
          setTotalFollowers(0)
          setTotalReservations(0)
          setPendingReservations(0)
          setTotalUnreadMessages(0)
        }
      } else {
        setTotalFollowers(0)
        setTotalReservations(0)
        setPendingReservations(0)
        setTotalUnreadMessages(0)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load your listings.")
    } finally {
      setIsLoading(false)
    }
  }, [token, user])

  useEffect(() => {
    if (token && user) {
      fetchData()
    }
  }, [token, user, fetchData])

  useEffect(() => {
    if ((successMessage || error) && (successMessage !== null || error !== null)) {
      const timeout = setTimeout(() => {
        setSuccessMessage(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [successMessage, error])

  useEffect(() => {
    if (!editingListingId) {
      setForm((prev) => ({
        ...prev,
        ownerName: prev.ownerName || user?.name || "",
      }))
    }
  }, [user, editingListingId])

  const approvedCount = useMemo(() => listings.filter((listing) => listing.status === "approved").length, [listings])
  const pendingCount = useMemo(() => listings.filter((listing) => listing.status === "pending").length, [listings])
  const averageRating = useMemo(() => {
    const approvedListings = listings.filter((listing) => listing.status === "approved")
    if (!approvedListings.length) return 0
    const total = approvedListings.reduce((sum, listing) => sum + (Number.isFinite(listing.rating) ? listing.rating : 0), 0)
    return Number((total / approvedListings.length).toFixed(1))
  }, [listings])

  const isEditing = Boolean(editingListingId)

  const resetForm = useCallback(() => {
    setForm({
      ...initialForm,
      ownerName: user?.name ?? "",
    })
    setMetadataInputs({ ...emptyMetadataInputs })
    setEditingListingId(null)
    setShowListingForm(false)
  }, [user])

  const handleEditListing = (listing: BusinessPlace) => {
    setEditingListingId(listing.id)
    setForm({
      name: listing.name ?? "",
      description: listing.description ?? "",
      categoryId: listing.category?.id ?? "",
      locationId: listing.location?.id ?? "",
      priceLevel: listing.priceLevel ?? "$$",
      imageUrl: listing.imageUrl ?? "",
      tags: listing.tags ?? [],
      ownerName: listing.ownerName ?? user?.name ?? "",
    })
    const metadata = inputsFromMetadata(listing.metadata ?? undefined)
    setMetadataInputs(metadata)
    setActiveTab("listings")
    setShowListingForm(true)
    setTimeout(() => {
      const formElement = document.getElementById("new-listing-form")
      formElement?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!token) return
    const confirmed =
      typeof window === "undefined" ? true : window.confirm("Are you sure you want to remove this listing?")
    if (!confirmed) {
      return
    }
    try {
      setIsSubmitting(true)
      setError(null)
      await api.delete(`/places/${listingId}`, { auth: token })
      if (editingListingId === listingId) {
        resetForm()
      }
      setSuccessMessage("Listing removed.")
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete this listing.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitListing = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) return
    setIsSubmitting(true)
    setError(null)
    const payload = {
      name: form.name,
      description: form.description,
      categoryId: form.categoryId,
      locationId: form.locationId,
      priceLevel: form.priceLevel,
      imageUrl: form.imageUrl || undefined,
      tags: form.tags,
      ownerName: form.ownerName || user?.name,
      metadata: metadataFromInputs(metadataInputs),
    }
    try {
          if (isEditing && editingListingId) {
            await api.patch(`/places/${editingListingId}`, payload, { auth: token })
            setSuccessMessage("Listing updated successfully.")
          } else {
            await api.post("/places", payload, { auth: token })
            setSuccessMessage("Listing submitted for review. Our team will approve it shortly.")
          }
          resetForm()
          setShowListingForm(false)
          await fetchData()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditing
            ? "Unable to update your listing right now."
            : "Unable to submit your listing right now.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    resetForm()
  }

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? "B"

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav variant="business" />

      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {user ? (
                  <>
                    Business Dashboard
                    {/* <span className="text-orange-600">{user.name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there'}!</span> */}
                  </>
                ) : (
                  "Business Dashboard"
                )}
              </h1>
              <p className="text-sm text-gray-600">Monitor your business performance and manage your listings</p>
            </div>
            <Button
              type="button"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md"
              onClick={() => {
                setActiveTab("listings")
                setShowListingForm(true)
                setTimeout(() => {
                  const formSection = document.getElementById("new-listing-form")
                  formSection?.scrollIntoView({ behavior: "smooth", block: "start" })
                }, 100)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Listing
            </Button>
          </div>
        </div>

        {(error || successMessage) && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {error ?? successMessage}
          </div>
        )}

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border border-blue-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Active Listings</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{listings.length}</p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-green-600">{approvedCount}</span> approved
                    {pendingCount > 0 && <span className="text-gray-500"> • <span className="text-orange-600">{pendingCount}</span> pending</span>}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-purple-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Customer Reviews</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{totalReviews}</p>
                  <p className="text-sm text-gray-600">
                    Average rating: <span className="font-medium text-amber-600">{averageRating || "—"}</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-emerald-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-emerald-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Reservations</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{totalReservations}</p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-orange-600">{pendingReservations}</span> pending confirmation
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-pink-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-pink-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Followers</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{totalFollowers}</p>
                  <p className="text-sm text-gray-600">People following your places</p>
                </div>
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs for Listings, Messages, Reservations */}
            <Card className="border-0 shadow-xl overflow-hidden p-0 bg-white">
              <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); if (value !== "listings") setShowListingForm(false) }} className="w-full">
                <CardHeader className="bg-gray-50 border-b border-gray-200 m-0 px-6 py-4">
                  <TabsList className="inline-flex h-11 items-center justify-start rounded-lg bg-white p-1 w-full border border-gray-200">
                    <TabsTrigger 
                      value="listings" 
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
                    >
                      <Building2 className="w-5 h-5 mr-2.5" />
                      Listings
                      {listings.length > 0 && (
                        <Badge variant="secondary" className={`ml-2.5 h-5 px-2 text-xs font-semibold ${activeTab === "listings" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}>
                          {listings.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="messages" 
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
                    >
                      <MessageSquare className="w-5 h-5 mr-2.5" />
                      Messages
                      {totalUnreadMessages > 0 && (
                        <Badge className={`ml-2.5 h-5 px-2 text-xs font-semibold border-0 ${activeTab === "messages" ? "bg-white/20 text-white" : "bg-orange-500 text-white"}`}>
                          {totalUnreadMessages}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="reservations" 
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
                    >
                      <Calendar className="w-5 h-5 mr-2.5" />
                      Reservations
                      {pendingReservations > 0 && (
                        <Badge className={`ml-2.5 h-5 px-2 text-xs font-semibold border-0 ${activeTab === "reservations" ? "bg-white/20 text-white" : "bg-orange-500 text-white"}`}>
                          {pendingReservations}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <TabsContent value="listings" className="m-0">
                  <CardContent className="p-6">
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="h-28 animate-pulse rounded-xl border bg-white" />
                        ))}
                      </div>
                    ) : listings.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50 px-6 py-10 text-center text-orange-700">
                        You have not submitted any listings yet. Use the form below to get started.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {listings.map((listing) => (
                          <div
                            key={listing.id}
                            className="group flex flex-col gap-4 rounded-xl border-2 border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-orange-200 transition-all bg-white md:flex-row md:items-center"
                          >
                            <div className="flex flex-1 items-start gap-4">
                              {listing.imageUrl ? (
                                <div className="flex h-20 w-20 items-center justify-center rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                  <img
                                    src={listing.imageUrl}
                                    alt={listing.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex-shrink-0">
                                  <Building2 className="h-10 w-10 text-orange-600" />
                                </div>
                              )}
                              <div className="space-y-2 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <h3 className="text-xl font-bold text-gray-900">{listing.name}</h3>
                                      <Badge className={`${statusBadgeStyles[listing.status]} text-xs font-semibold`}>
                                        {listing.status === "approved" && <CheckCircle className="mr-1 h-3 w-3" />}
                                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                                      </Badge>
                                      {listing.featured && (
                                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold">
                                          ⭐ Featured
                                        </Badge>
                                      )}
                                      {listing.verified && (
                                        <Badge className="bg-green-500 text-white text-xs font-semibold">
                                          ✓ Verified
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                      <span className="font-medium">{listing.location?.name}</span> • {listing.category?.name} • {listing.priceLevel}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                  <span className="flex items-center gap-1.5 font-medium text-gray-700">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-bold">{listing.rating?.toFixed(1) ?? "New"}</span>
                                    <span className="text-gray-500">({listing.reviews ?? 0} reviews)</span>
                                  </span>
                                  {listing.tags?.length ? (
                                    <div className="flex flex-wrap gap-1.5">
                                      {listing.tags.slice(0, 3).map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs border-gray-300">
                                          {tag}
                                        </Badge>
                                      ))}
                                      {listing.tags.length > 3 && (
                                        <Badge variant="outline" className="text-xs border-gray-300">
                                          +{listing.tags.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-end md:self-center">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditListing(listing)}
                                className="border-gray-300 hover:bg-gray-50"
                              >
                                <Edit className="mr-1.5 h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleDeleteListing(listing.id)}
                                disabled={isSubmitting && editingListingId === listing.id}
                              >
                                <Trash2 className="mr-1.5 h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </TabsContent>

                <TabsContent value="messages" className="m-0 p-0">
                  <div className="p-6">
                    <BusinessMessagesSection token={token} user={user} />
                  </div>
                </TabsContent>

                <TabsContent value="reservations" className="m-0 p-0">
                  <div className="p-6">
                    <BusinessReservationsSection token={token} user={user} />
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* New Listing Form */}
            {(activeTab === "listings" && showListingForm) && (
            <Card id="new-listing-form" className="border-0 shadow-lg overflow-hidden p-0">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b m-0 px-6 py-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {isEditing ? "Update Listing" : "Submit a New Listing"}
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {isEditing
                    ? "Adjust the details below and resubmit to keep your listing fresh."
                    : "Share your business with the Corners community. We review every submission."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmitListing}>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Experience Name</label>
                    <Input
                      required
                      value={form.name}
                      onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Enter experience name"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <Textarea
                      required
                      rows={4}
                      value={form.description}
                      onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="Describe what makes this place special"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <Select
                      value={form.categoryId}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, categoryId: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.icon ?? "•"} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <Select
                      value={form.locationId}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, locationId: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Price Range</label>
                    <Select
                      value={form.priceLevel}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, priceLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select price range" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRICE_RANGE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Image URL</label>
                    <Input
                      value={form.imageUrl}
                      onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tags</label>
                    <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {TAG_OPTIONS.map((tag) => (
                          <div key={tag} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tag-${tag}`}
                              checked={form.tags.includes(tag)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
                                } else {
                                  setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
                                }
                              }}
                            />
                            <label
                              htmlFor={`tag-${tag}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {tag}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    {form.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Owner / Manager Name</label>
                    <Input
                      value={form.ownerName}
                      onChange={(event) => setForm((prev) => ({ ...prev, ownerName: event.target.value }))}
                      placeholder="Who should we contact?"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-900">Contact Information</h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-700">Phone number</label>
                        <Input
                          value={metadataInputs.contactPhone}
                          onChange={(event) =>
                            setMetadataInputs((prev) => ({ ...prev, contactPhone: event.target.value }))
                          }
                          placeholder="+234 123 456 7890"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-700">Website</label>
                        <Input
                          value={metadataInputs.contactWebsite}
                          onChange={(event) =>
                            setMetadataInputs((prev) => ({ ...prev, contactWebsite: event.target.value }))
                          }
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-700">Address</label>
                        <Input
                          value={metadataInputs.contactAddress}
                          onChange={(event) =>
                            setMetadataInputs((prev) => ({ ...prev, contactAddress: event.target.value }))
                          }
                          placeholder="123 Main Street"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Gallery image URLs <span className="text-xs text-gray-500">(one per line)</span>
                    </label>
                    <Textarea
                      value={metadataInputs.gallery}
                      onChange={(event) => setMetadataInputs((prev) => ({ ...prev, gallery: event.target.value }))}
                      rows={3}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Amenities</label>
                    <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {AMENITY_OPTIONS.map((amenity) => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox
                              id={`amenity-${amenity}`}
                              checked={metadataInputs.amenities.includes(amenity)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setMetadataInputs((prev) => ({ ...prev, amenities: [...prev.amenities, amenity] }))
                                } else {
                                  setMetadataInputs((prev) => ({
                                    ...prev,
                                    amenities: prev.amenities.filter((a) => a !== amenity),
                                  }))
                                }
                              }}
                            />
                            <label
                              htmlFor={`amenity-${amenity}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {amenity}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    {metadataInputs.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {metadataInputs.amenities.map((amenity) => (
                          <Badge key={amenity} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Highlights</label>
                    <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {HIGHLIGHT_OPTIONS.map((highlight) => (
                          <div key={highlight} className="flex items-center space-x-2">
                            <Checkbox
                              id={`highlight-${highlight}`}
                              checked={metadataInputs.highlights.includes(highlight)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setMetadataInputs((prev) => ({
                                    ...prev,
                                    highlights: [...prev.highlights, highlight],
                                  }))
                                } else {
                                  setMetadataInputs((prev) => ({
                                    ...prev,
                                    highlights: prev.highlights.filter((h) => h !== highlight),
                                  }))
                                }
                              }}
                            />
                            <label
                              htmlFor={`highlight-${highlight}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {highlight}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    {metadataInputs.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {metadataInputs.highlights.map((highlight) => (
                          <Badge key={highlight} variant="secondary" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Opening Hours</label>
                    <div className="space-y-3 border rounded-lg p-4">
                      {DAYS_OF_WEEK.map((day) => {
                        const dayLower = day.toLowerCase()
                        const currentHours = metadataInputs.hours[dayLower] || { day: dayLower, openTime: "", closeTime: "" }
                        return (
                          <div key={day} className="flex items-center gap-3">
                            <div className="w-24 text-sm font-medium text-gray-700">{day}</div>
                            <Select
                              value={currentHours.openTime || "closed"}
                              onValueChange={(value) => {
                                setMetadataInputs((prev) => ({
                                  ...prev,
                                  hours: {
                                    ...prev.hours,
                                    [dayLower]: { ...currentHours, openTime: value === "closed" ? "" : value },
                                  },
                                }))
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Open" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="closed">Closed</SelectItem>
                                {TIME_OPTIONS.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-sm text-gray-500">to</span>
                            <Select
                              value={currentHours.closeTime || "closed"}
                              onValueChange={(value) => {
                                setMetadataInputs((prev) => ({
                                  ...prev,
                                  hours: {
                                    ...prev.hours,
                                    [dayLower]: { ...currentHours, closeTime: value === "closed" ? "" : value },
                                  },
                                }))
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Close" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="closed">Closed</SelectItem>
                                {TIME_OPTIONS.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Menu Items</label>
                    <div className="space-y-3">
                      {metadataInputs.menu.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                              <label className="text-xs text-gray-600">Item Name</label>
                              <Input
                                value={item.name}
                                onChange={(e) => {
                                  const newMenu = [...metadataInputs.menu]
                                  newMenu[index] = { ...item, name: e.target.value }
                                  setMetadataInputs((prev) => ({ ...prev, menu: newMenu }))
                                }}
                                placeholder="e.g. Jollof Rice"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs text-gray-600">Price</label>
                              <Input
                                value={item.price}
                                onChange={(e) => {
                                  const newMenu = [...metadataInputs.menu]
                                  newMenu[index] = { ...item, price: e.target.value }
                                  setMetadataInputs((prev) => ({ ...prev, menu: newMenu }))
                                }}
                                placeholder="e.g. ₦2,500"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs text-gray-600">Description</label>
                            <Input
                              value={item.description}
                              onChange={(e) => {
                                const newMenu = [...metadataInputs.menu]
                                newMenu[index] = { ...item, description: e.target.value }
                                setMetadataInputs((prev) => ({ ...prev, menu: newMenu }))
                              }}
                              placeholder="e.g. Traditional Nigerian rice dish"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs text-gray-600">Image URL (optional)</label>
                            <Input
                              value={item.imageUrl}
                              onChange={(e) => {
                                const newMenu = [...metadataInputs.menu]
                                newMenu[index] = { ...item, imageUrl: e.target.value }
                                setMetadataInputs((prev) => ({ ...prev, menu: newMenu }))
                              }}
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setMetadataInputs((prev) => ({
                                ...prev,
                                menu: prev.menu.filter((_, i) => i !== index),
                              }))
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setMetadataInputs((prev) => ({
                            ...prev,
                            menu: [...prev.menu, { name: "", price: "", description: "", imageUrl: "" }],
                          }))
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Menu Item
                      </Button>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex flex-wrap items-center justify-end gap-3">
                    {isEditing && (
                      <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isSubmitting}>
                        Cancel editing
                      </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting || !token}>
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {isEditing ? "Saving..." : "Submitting..."}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          {isEditing ? "Update Listing" : "Submit for Review"}
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion Card */}
            <Card className="border-0 shadow-lg overflow-hidden p-0">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b m-0 px-6 py-4">
                <CardTitle className="text-xl font-bold text-gray-900">Profile Completion</CardTitle>
                <CardDescription className="text-base">Help explorers learn more about your business</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-700">Profile Progress</span>
                      <span className="text-lg font-bold text-gray-900">{listings.length ? "100%" : "67%"}</span>
                    </div>
                    <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          listings.length
                            ? "bg-gradient-to-r from-orange-500 to-red-500"
                            : "bg-gray-400"
                        }`}
                        style={{ width: `${listings.length ? 100 : 67}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-900">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0 shadow-md">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">Business info added</span>
                    </div>
                    <div className="flex items-center text-gray-900">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0 shadow-md">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">Photos uploaded</span>
                    </div>
                    <div className={`flex items-center ${listings.length ? "text-gray-900" : "text-orange-600"}`}>
                      {listings.length ? (
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0 shadow-md">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0 shadow-md">
                          <div className="w-2.5 h-2.5 bg-white rounded-full" />
                        </div>
                      )}
                      <span className="font-medium">Submit a listing</span>
                    </div>
                  </div>
                  {!listings.length && (
                    <Button 
                      variant="outline" 
                      className="w-full border-2 border-orange-200 text-orange-700 hover:bg-orange-50 font-semibold" 
                      onClick={() => router.push("/business/profile")}
                    >
                      Complete Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100/50">
              <CardHeader className="border-b">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Approval Rate</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {listings.length > 0 ? Math.round((approvedCount / listings.length) * 100) : 0}%
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Avg. Reviews/Listing</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {approvedCount > 0 ? (totalReviews / approvedCount).toFixed(1) : "0.0"}
                      </p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Engagement Rate</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {totalFollowers > 0 && listings.length > 0 
                          ? ((totalFollowers / listings.length) * 100).toFixed(0) 
                          : "0"}%
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-pink-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="border-0 shadow-lg overflow-hidden p-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b m-0 px-6 py-4">
                <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-2 hover:bg-orange-50 hover:border-orange-200 font-medium" 
                    onClick={() => {
                      setActiveTab("listings")
                      setShowListingForm(true)
                      setTimeout(() => {
                        const formSection = document.getElementById("new-listing-form")
                        formSection?.scrollIntoView({ behavior: "smooth" })
                      }, 100)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Listing
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-2 hover:bg-blue-50 hover:border-blue-200 font-medium" 
                    onClick={() => router.push("/business/promotions")}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Create Promotion
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-2 hover:bg-green-50 hover:border-green-200 font-medium" 
                    onClick={() => router.push("/events")}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-2 hover:bg-purple-50 hover:border-purple-200 font-medium"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: "Check out my business on Corners",
                          url: window.location.origin,
                        })
                      }
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Business Insights Card */}
            <Card className="border-0 shadow-lg overflow-hidden p-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b m-0 px-6 py-4">
                <CardTitle className="text-xl font-bold text-gray-900">Business Insights</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Review Response
                    </p>
                    <p className="text-sm text-blue-700">Engage with customers to build trust and improve ratings.</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Photo Updates
                    </p>
                    <p className="text-sm text-green-700">Fresh visuals increase customer engagement and bookings.</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <p className="font-semibold text-orange-900 mb-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Promotions
                    </p>
                    <p className="text-sm text-orange-700">Boost visibility with exclusive offers and timely promotions.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
