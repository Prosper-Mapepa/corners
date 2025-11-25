'use client'

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

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
} from "lucide-react"

const TOKEN_STORAGE_KEY = "corners.accessToken"

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
  tags: string
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
  const [token, setToken] = useState<string | null>(null)
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
    tags: "",
    distance: "",
    ownerName: "",
    ownerEmail: "",
  })

  useEffect(() => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null
    if (!storedToken) {
      router.replace("/login")
      return
    }
    setToken(storedToken)
  }, [router])

  const fetchAdminData = useCallback(async () => {
    if (!token) return
    try {
      setIsLoading(true)
      setError(null)
      const [placesResponse, statsResponse, categoriesResponse, locationsResponse, usersResponse] = await Promise.all([
        api.get<AdminPlace[]>("/places", { auth: token }),
        api.get<PlaceStats>("/places/stats", { auth: token }),
        api.get<ApiCategory[]>("/categories"),
        api.get<ApiLocation[]>("/locations"),
        api.get<ApiUser[]>("/users", { auth: token }),
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
    () => places.reduce((acc, place) => acc + (place.reviews ?? 0), 0),
    [places],
  )
  const pendingApprovals = stats?.pending ?? places.filter((place) => place.status === "pending").length
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
        tags: newPlace.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        distance: newPlace.distance || undefined,
        ownerName: newPlace.ownerName || undefined,
        ownerEmail: newPlace.ownerEmail || undefined,
        status: "pending" as PlaceStatus,
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
        tags: "",
        distance: "",
        ownerName: "",
        ownerEmail: "",
      })
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Corners Admin</span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">
              <Globe2 className="mr-1 h-3 w-3" />
              Africa Network
            </Badge>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white">
              A
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {(error || successMessage) && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {error ?? successMessage}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                  <p className="text-xs text-gray-500">Including explorers, businesses & admins</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Businesses</p>
                  <p className="text-2xl font-bold text-gray-900">{approvedBusinesses}</p>
                  <p className="text-xs text-green-600">Approved and visible on Discover</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
                  <p className="text-xs text-gray-500">From all approved listings</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingApprovals}</p>
                  <p className="text-xs text-orange-600">Listings awaiting review</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="businesses" className="mt-10 space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="businesses">Business Listings</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="reviews">Content Moderation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="businesses" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Business Listings</CardTitle>
                    <CardDescription>Review, approve and manage all submitted experiences.</CardDescription>
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
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submit New Listing</CardTitle>
                <CardDescription>Create a new experience on behalf of a partner business.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreatePlace}>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Name</label>
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
                      value={newPlace.description}
                      onChange={(event) => setNewPlace((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="Describe the experience"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <Select
                      value={newPlace.categoryId}
                      onValueChange={(value) => setNewPlace((prev) => ({ ...prev, categoryId: value }))}
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
                    <label className="text-sm font-medium text-gray-700">Price Level</label>
                    <Select
                      value={newPlace.priceLevel}
                      onValueChange={(value) => setNewPlace((prev) => ({ ...prev, priceLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Price level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="$">$ Budget</SelectItem>
                        <SelectItem value="$$">$$ Moderate</SelectItem>
                        <SelectItem value="$$$">$$$ Premium</SelectItem>
                        <SelectItem value="$$$$">$$$$ Luxury</SelectItem>
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
                    <Input
                      value={newPlace.tags}
                      onChange={(event) => setNewPlace((prev) => ({ ...prev, tags: event.target.value }))}
                      placeholder="Comma-separated tags (e.g. Luxury, Family-friendly)"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Owner Name</label>
                    <Input
                      value={newPlace.ownerName}
                      onChange={(event) => setNewPlace((prev) => ({ ...prev, ownerName: event.target.value }))}
                      placeholder="Business contact name"
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
                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit" disabled={isSubmitting || !token}>
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Submit Listing
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Overview of platform accounts and their roles.</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
                <CardDescription>Upcoming workflows for moderating user submissions.</CardDescription>
              </CardHeader>
              <CardContent className="py-12 text-center text-gray-500">
                <Star className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                Review moderation, flagging and automation tools will surface here soon.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>High-level view of listing performance and growth.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
