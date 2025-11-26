'use client'

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Eye,
  Filter,
  Globe2,
  Loader2,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Trash2,
  TrendingUp,
  Users,
  XCircle,
  ThumbsUp,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { DashboardNav } from "@/components/dashboard-nav"
import { MetadataInputs, PlaceMetadata, emptyMetadataInputs, metadataFromInputs } from "@/lib/place-metadata"
import {
  TAG_OPTIONS,
  AMENITY_OPTIONS,
  HIGHLIGHT_OPTIONS,
  DAYS_OF_WEEK,
  TIME_OPTIONS,
  PRICE_RANGE_OPTIONS,
} from "@/lib/form-options"
import { Checkbox } from "@/components/ui/checkbox"

type PlaceStatus = "pending" | "approved" | "rejected"

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

type AdminPlace = {
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
  status: PlaceStatus
  ownerName?: string | null
  ownerEmail?: string | null
  submittedAt?: string
  createdAt?: string
  metadata?: PlaceMetadata | null
}

type PlaceStats = {
  totalPlaces: number
  approved: number
  pending: number
  rejected: number
  featured: number
  recentSubmissions: AdminPlace[]
}

type ApiUser = {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
}

type NewPlaceFormState = {
  name: string
  description: string
  categoryId: string
  locationId: string
  priceLevel: string
  rating: number
  reviews: number
  imageUrl: string
  tags: string[]
  distance: string
  ownerName: string
  ownerEmail: string
}

function formatRelativeTimestamp(timestamp?: string | null) {
  if (!timestamp) return "Just now"
  const date = new Date(timestamp)
  const diff = Date.now() - date.getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`
  return date.toLocaleDateString()
}

const statusBadgeStyles: Record<PlaceStatus, string> = {
  approved: "bg-green-500 text-white",
  pending: "bg-yellow-500 text-gray-900",
  rejected: "bg-red-500 text-white",
}

export default function AdminDashboard() {
  const router = useRouter()
  const { token, user, loading, refreshProfile, logout } = useAuth()
  const [places, setPlaces] = useState<AdminPlace[]>([])
  const [stats, setStats] = useState<PlaceStats | null>(null)
  const [users, setUsers] = useState<ApiUser[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [locations, setLocations] = useState<ApiLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [businessSearch, setBusinessSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<PlaceStatus | "all">("all")
  const [newPlace, setNewPlace] = useState<NewPlaceFormState>({
    name: "",
    description: "",
    categoryId: "",
    locationId: "",
    priceLevel: "$$",
    rating: 4.5,
    reviews: 0,
    imageUrl: "",
    tags: [],
    distance: "",
    ownerName: "",
    ownerEmail: "",
  })
  const [metadataInputs, setMetadataInputs] = useState<MetadataInputs>({ ...emptyMetadataInputs })
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewStatusFilter, setReviewStatusFilter] = useState<"pending" | "approved" | "rejected" | "all">("all")
  const [activeTab, setActiveTab] = useState("businesses")
  const [showListingForm, setShowListingForm] = useState(false)

  const [hasLoadedProfile, setHasLoadedProfile] = useState(false)

  useEffect(() => {
    if (loading) {
      return
    }
    if (!token) {
      router.replace("/login")
      return
    }
    if (!user && !hasLoadedProfile) {
      refreshProfile().finally(() => setHasLoadedProfile(true))
    }
  }, [loading, token, user, router, refreshProfile, hasLoadedProfile])

  useEffect(() => {
    if (!loading && user && token) {
      if (user.role !== "admin" && user.role !== "super_admin") {
        router.replace("/discover")
      }
    }
  }, [loading, router, token, user])

  const fetchAdminData = useCallback(async () => {
    if (!token) return
    try {
      setIsLoading(true)
      setError(null)
      const [placesResponse, statsResponse, categoriesResponse, locationsResponse, usersResponse, reviewsResponse] = await Promise.all([
        api.get<AdminPlace[]>("/places", { auth: token }),
        api.get<PlaceStats>("/places/stats", { auth: token }),
        api.get<ApiCategory[]>("/categories"),
        api.get<ApiLocation[]>("/locations"),
        api.get<ApiUser[]>("/users", { auth: token }),
        api.get<any[]>("/reviews", { auth: token }).catch(() => []),
      ])
      setPlaces(
        placesResponse.map((place) => ({
          ...place,
          rating: typeof place.rating === "string" ? parseFloat(place.rating as unknown as string) : place.rating,
        })),
      )
      setStats(statsResponse)
      setCategories(categoriesResponse)
      setLocations(locationsResponse)
      setUsers(usersResponse)
      setReviews(reviewsResponse || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load admin data."
      setError(message)
      if (message.toLowerCase().includes("unauthorized")) {
        router.replace("/login")
      }
    } finally {
      setIsLoading(false)
    }
  }, [token, router])

  useEffect(() => {
    fetchAdminData()
  }, [fetchAdminData])

  const totalUsers = users.length
  const approvedBusinesses = useMemo(
    () => places.filter((place) => place.status === "approved").length,
    [places],
  )
  const totalReviews = useMemo(
    () => reviews.filter((review) => review.status === "approved").length,
    [reviews],
  )
  const pendingApprovals = useMemo(
    () => places.filter((place) => place.status === "pending").length,
    [places],
  )
  const approvalRate = useMemo(() => {
    if (!stats || stats.totalPlaces === 0) {
      return 0
    }
    return Math.round((stats.approved / stats.totalPlaces) * 100)
  }, [stats])

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const matchesStatus = statusFilter === "all" || place.status === statusFilter
      const matchesSearch =
        businessSearch.trim().length === 0 ||
        `${place.name} ${place.ownerName ?? ""} ${place.location?.name ?? ""}`.toLowerCase().includes(businessSearch.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [places, statusFilter, businessSearch])

  const handleStatusChange = async (placeId: string, status: PlaceStatus) => {
    if (!token) return
    try {
      setIsSubmitting(true)
      await api.patch(`/places/${placeId}`, { status }, { auth: token })
      await fetchAdminData()
      setSuccessMessage(`Listing ${status === "approved" ? "approved" : "updated"} successfully.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update listing status.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePlace = async (placeId: string) => {
    if (!token) return
    try {
      setIsSubmitting(true)
      await api.delete(`/places/${placeId}`, { auth: token })
      await fetchAdminData()
      setSuccessMessage("Listing deleted successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete listing.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReviewStatusChange = async (reviewId: string, status: "approved" | "rejected") => {
    if (!token) return
    try {
      setIsSubmitting(true)
      await api.patch(`/reviews/${reviewId}`, { status }, { auth: token })
      await fetchAdminData()
      setSuccessMessage(`Review ${status === "approved" ? "approved" : "rejected"} successfully.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update review status.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      if (reviewStatusFilter === "all") return true
      return review.status === reviewStatusFilter
    })
  }, [reviews, reviewStatusFilter])

  const handleCreatePlace = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) return
    try {
      setIsSubmitting(true)
      setError(null)
      const payload = {
        name: newPlace.name,
        description: newPlace.description,
        categoryId: newPlace.categoryId,
        locationId: newPlace.locationId,
        priceLevel: newPlace.priceLevel,
        rating: newPlace.rating,
        reviews: newPlace.reviews,
        imageUrl: newPlace.imageUrl || undefined,
        tags: newPlace.tags,
        distance: newPlace.distance || undefined,
        ownerName: newPlace.ownerName || undefined,
        ownerEmail: newPlace.ownerEmail || undefined,
        status: "pending" as PlaceStatus,
        metadata: metadataFromInputs(metadataInputs),
      }
      await api.post("/places", payload, { auth: token })
      setSuccessMessage("New listing submitted for review.")
      setNewPlace({
        name: "",
        description: "",
        categoryId: "",
        locationId: "",
        priceLevel: "$$",
        rating: 4.5,
        reviews: 0,
        imageUrl: "",
        tags: [],
        distance: "",
        ownerName: "",
        ownerEmail: "",
      })
      setMetadataInputs({ ...emptyMetadataInputs })
      setShowListingForm(false)
      await fetchAdminData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetMessages = () => {
    setError(null)
    setSuccessMessage(null)
  }

  useEffect(() => {
    if (successMessage || error) {
      const timeout = setTimeout(() => {
        resetMessages()
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [successMessage, error])

  const renderStatusBadge = (status: PlaceStatus) => (
    <Badge className={statusBadgeStyles[status]}>
      {status === "approved" && <CheckCircle className="mr-1 h-3 w-3" />}
      {status === "pending" && <AlertTriangle className="mr-1 h-3 w-3" />}
      {status === "rejected" && <XCircle className="mr-1 h-3 w-3" />}
      {status === "approved" && "Approved"}
      {status === "pending" && "Pending"}
      {status === "rejected" && "Rejected"}
    </Badge>
  )

  const userFirstName = user?.name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Admin'

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav variant="admin" />

      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {user ? (
                  <>
                    Admin Dashboard
                     {/* <span className="text-orange-600">{userFirstName}!</span> */}
                  </>
                ) : (
                  "Admin Dashboard"
                )}
              </h1>
              <p className="text-sm text-gray-600">Manage platform content, users, and listings</p>
            </div>
            <Button
              type="button"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md"
              onClick={() => {
                setActiveTab("businesses")
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
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{totalUsers}</p>
                  <p className="text-sm text-gray-600">Including explorers, businesses & admins</p>
                </div>
                <div className=" w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-green-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-green-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Active Businesses</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{approvedBusinesses}</p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-green-600">Approved</span> and visible on Discover
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-blue-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Total Reviews</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{totalReviews}</p>
                  <p className="text-sm text-gray-600">From all approved listings</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-orange-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-orange-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Pending Approvals</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{pendingApprovals}</p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-orange-600">Listings</span> awaiting review
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl overflow-hidden p-0 bg-white">
          <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); if (value !== "businesses") setShowListingForm(false) }} className="w-full">
            <CardHeader className="bg-gray-50 border-b border-gray-200 m-0 px-6 py-4">
              <TabsList className="inline-flex h-11 items-center justify-start rounded-lg bg-white p-1 w-full border border-gray-200">
                <TabsTrigger 
                  value="businesses" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-orange-200/50 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
                >
                  <Building2 className="w-5 h-5 mr-2.5" />
                  Business Listings
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-orange-200/50 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
                >
                  <Users className="w-5 h-5 mr-2.5" />
                  User Management
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-orange-200/50 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
                >
                  <Star className="w-5 h-5 mr-2.5" />
                  Content Moderation
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-orange-200/50 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
                >
                  <TrendingUp className="w-5 h-5 mr-2.5" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="businesses" className="m-0">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Business Listings</h2>
                        <p className="text-sm text-gray-600 mt-1">Review, approve and manage all submitted experiences.</p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            value={businessSearch}
                            onChange={(event) => setBusinessSearch(event.target.value)}
                            placeholder="Search businesses..."
                            className="pl-9 sm:w-64"
                          />
                        </div>
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PlaceStatus | "all")}>
                          <SelectTrigger className="sm:w-48">
                            <SelectValue placeholder="Filter status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              <div className="flex items-center">
                                <Filter className="mr-2 h-4 w-4" />
                                All statuses
                              </div>
                            </SelectItem>
                            <SelectItem value="pending">
                              <div className="flex items-center">
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Pending
                              </div>
                            </SelectItem>
                            <SelectItem value="approved">
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approved
                              </div>
                            </SelectItem>
                            <SelectItem value="rejected">
                              <div className="flex items-center">
                                <XCircle className="mr-2 h-4 w-4" />
                                Rejected
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="h-28 animate-pulse rounded-xl border bg-white" />
                    ))}
                  </div>
                ) : filteredPlaces.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50 px-6 py-10 text-center text-orange-700">
                    No listings found for your current filters.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPlaces.map((business) => (
                      <div
                        key={business.id}
                        className="flex flex-col justify-between gap-4 rounded-xl border p-4 shadow-sm md:flex-row md:items-center"
                      >
                        <div className="flex flex-1 items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                            <Building2 className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
                              {renderStatusBadge(business.status)}
                              {business.featured && (
                                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">Featured</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              Owned by <span className="font-medium text-gray-900">{business.ownerName ?? "—"}</span>
                              {business.ownerEmail ? ` • ${business.ownerEmail}` : ""}
                            </p>
                            <p className="text-sm text-gray-500">
                              {business.location?.name} • {business.category?.name} • {business.priceLevel}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                {business.rating.toFixed(1)} ({business.reviews} reviews)
                              </span>
                              {business.distance && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {business.distance}
                                </span>
                              )}
                              <span>Submitted {formatRelativeTimestamp(business.submittedAt ?? business.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end md:self-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                <Filter className="mr-2 h-4 w-4" />
                                Edit (coming soon)
                              </DropdownMenuItem>
                              {business.status !== "approved" && (
                                <DropdownMenuItem
                                  className="text-green-600"
                                  onClick={() => handleStatusChange(business.id, "approved")}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              {business.status !== "rejected" && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleStatusChange(business.id, "rejected")}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeletePlace(business.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {business.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(business.id, "approved")}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                </div>

                {(activeTab === "businesses" && showListingForm) && (
                <Card id="new-listing-form" className="border-0 shadow-lg overflow-hidden p-0 mt-6">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b m-0 px-6 py-4">
                    <CardTitle className="text-2xl font-bold text-gray-900">Submit a New Listing</CardTitle>
                    <CardDescription className="text-base mt-1">Create a new experience on behalf of a partner business.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreatePlace}>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Experience Name</label>
                    <Input
                      required
                      value={newPlace.name}
                      onChange={(event) => setNewPlace((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Enter experience name"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <Textarea
                      required
                      rows={4}
                      value={newPlace.description}
                      onChange={(event) => setNewPlace((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="Describe what makes this place special"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <Select
                      value={newPlace.categoryId}
                      onValueChange={(value) => setNewPlace((prev) => ({ ...prev, categoryId: value }))}
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
                      value={newPlace.locationId}
                      onValueChange={(value) => setNewPlace((prev) => ({ ...prev, locationId: value }))}
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
                      value={newPlace.priceLevel}
                      onValueChange={(value) => setNewPlace((prev) => ({ ...prev, priceLevel: value }))}
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
                    <label className="text-sm font-medium text-gray-700">Average Rating</label>
                    <Input
                      type="number"
                      min={0}
                      max={5}
                      step="0.1"
                      value={newPlace.rating}
                      onChange={(event) =>
                        setNewPlace((prev) => ({ ...prev, rating: Number(event.target.value) }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Total Reviews</label>
                    <Input
                      type="number"
                      min={0}
                      value={newPlace.reviews}
                      onChange={(event) =>
                        setNewPlace((prev) => ({ ...prev, reviews: Number(event.target.value) }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Image URL</label>
                    <Input
                      value={newPlace.imageUrl}
                      onChange={(event) => setNewPlace((prev) => ({ ...prev, imageUrl: event.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Distance (optional)</label>
                    <Input
                      value={newPlace.distance}
                      onChange={(event) => setNewPlace((prev) => ({ ...prev, distance: event.target.value }))}
                      placeholder="e.g. 1.5 km"
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
                              checked={newPlace.tags.includes(tag)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewPlace((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
                                } else {
                                  setNewPlace((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
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
                    {newPlace.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newPlace.tags.map((tag) => (
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
                      value={newPlace.ownerName}
                      onChange={(event) => setNewPlace((prev) => ({ ...prev, ownerName: event.target.value }))}
                      placeholder="Who should we contact?"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Owner Email</label>
                    <Input
                      type="email"
                      value={newPlace.ownerEmail}
                      onChange={(event) => setNewPlace((prev) => ({ ...prev, ownerEmail: event.target.value }))}
                      placeholder="contact@example.com"
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
                      placeholder="https://example.com/photo.jpg"
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
                    <Button type="submit" disabled={isSubmitting || !token}>
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Submit for Review
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
                  </CardContent>
                </Card>
                )}
              </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="users" className="m-0">
              <CardContent className="p-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">User Management</h2>
                  <p className="text-sm text-gray-600 mb-4">Overview of platform accounts and their roles.</p>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="h-16 animate-pulse rounded-xl border bg-white" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex flex-col justify-between gap-2 rounded-xl border p-4 md:flex-row md:items-center"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {user.role.replace("_", " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="reviews" className="m-0">
              <CardContent className="p-6">
                <div>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Review Moderation</h2>
                      <p className="text-sm text-gray-600 mt-1">Approve or reject customer reviews before they appear publicly.</p>
                    </div>
                    <Select value={reviewStatusFilter} onValueChange={(value) => setReviewStatusFilter(value as any)}>
                      <SelectTrigger className="sm:w-48">
                        <SelectValue placeholder="Filter status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Reviews</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-32 animate-pulse rounded-xl border bg-white" />
                    ))}
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50 px-6 py-10 text-center text-orange-700">
                    No reviews found for the selected filter.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReviews.map((review) => (
                      <div
                        key={review.id}
                        className="flex flex-col gap-4 rounded-xl border p-4 shadow-sm md:flex-row md:items-start"
                      >
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">{review.user?.name || "Anonymous"}</h4>
                                <Badge
                                  variant={
                                    review.status === "approved"
                                      ? "default"
                                      : review.status === "rejected"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {review.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">{review.user?.email || ""}</p>
                              <p className="text-xs text-gray-400">
                                {review.place?.name || "Unknown Place"} • {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-600">({review.rating}/5)</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2">
                              {review.images.map((image: string, index: number) => (
                                <div key={index} className="w-20 h-20 rounded-lg overflow-hidden border">
                                  <Image
                                    src={image}
                                    alt={`Review image ${index + 1}`}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{review.helpfulCount} helpful</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 md:flex-col md:items-end">
                          <div className="flex flex-col gap-2">
                            {review.status !== "approved" && (
                              <Button
                                size="sm"
                                onClick={() => handleReviewStatusChange(review.id, "approved")}
                                disabled={isSubmitting}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                            )}
                            {review.status !== "rejected" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReviewStatusChange(review.id, "rejected")}
                                disabled={isSubmitting}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                            )}
                            {review.status === "approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReviewStatusChange(review.id, "rejected")}
                                disabled={isSubmitting}
                                className="border-red-200 text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Change to Rejected
                              </Button>
                            )}
                            {review.status === "rejected" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReviewStatusChange(review.id, "approved")}
                                disabled={isSubmitting}
                                className="border-green-200 text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Change to Approved
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="analytics" className="m-0">
              <CardContent className="p-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Platform Analytics</h2>
                  <p className="text-sm text-gray-600 mb-4">High-level view of listing performance and growth.</p>
                  <div className="space-y-4">
                <div className="rounded-xl border bg-white p-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    <span>Approved listings represent {approvalRate}% of total submissions.</span>
                  </div>
                </div>
                <div className="rounded-xl border bg-white p-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent submissions</h3>
                  <div className="space-y-3">
                    {stats?.recentSubmissions?.length ? (
                      stats.recentSubmissions.map((submission) => (
                        <div
                          key={submission.id}
                          className="flex flex-col gap-1 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{submission.name}</p>
                            <p className="text-sm text-gray-500">
                              {submission.location?.name} • Submitted{" "}
                              {formatRelativeTimestamp(submission.submittedAt ?? submission.createdAt)}
                            </p>
                          </div>
                          {renderStatusBadge(submission.status)}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No submissions yet.</p>
                    )}
                  </div>
                </div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
