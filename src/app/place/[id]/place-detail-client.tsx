'use client'

import { useMemo, useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  MapPin,
  Star,
  Heart,
  Share2,
  Clock,
  Phone,
  Globe,
  Camera,
  MessageCircle,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Send,
  ThumbsUp,
  Flag,
  Wifi,
  Car,
  CreditCard,
  Utensils,
  Music,
  Shield,
  Building2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import type { PlaceMetadata } from "@/lib/place-metadata"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { MessageModal } from "@/components/messaging/message-modal"
import { ReservationModal } from "@/components/reservations/reservation-modal"
import { PlaceActions } from "@/components/place-actions"

const amenityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "free wifi": Wifi,
  wifi: Wifi,
  parking: Car,
  "card payment": CreditCard,
  "outdoor seating": Utensils,
  "live music": Music,
  "covid safe": Shield,
}

const fallbackReviews = [
  {
    id: 1,
    user: "Amara Okafor",
    avatar: "A",
    rating: 5,
    date: "2 days ago",
    comment:
      "Absolutely amazing! The jollof rice was the best I've ever had. The atmosphere is authentic and the staff are incredibly friendly.",
    helpful: 12,
    images: [],
  },
  {
    id: 2,
    user: "David Thompson",
    avatar: "D",
    rating: 4,
    date: "1 week ago",
    comment: "Great introduction to Nigerian cuisine for a tourist like me. Pepper soup was incredible (and spicy!).",
    helpful: 8,
    images: [],
  },
]

export type PlaceDetail = {
  id: string
  name: string
  description: string
  priceLevel: string
  priceRangeMin?: number
  priceRangeMax?: number
  rating: number
  reviews: number
  imageUrl?: string
  isOpen: boolean
  verified: boolean
  featured: boolean
  tags: string[]
  categoryName: string
  locationLabel?: string
  ownerEmail?: string
  metadata?: PlaceMetadata
}

export type Review = {
  id: string
  rating: number
  comment: string
  helpfulCount: number
  images: string[]
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    avatarUrl?: string
  }
}

type RelatedPlace = {
  id: string
  name: string
  rating: number
  imageUrl?: string
}

type Props = {
  place: PlaceDetail
  relatedPlaces?: RelatedPlace[]
  reviews?: Review[]
}

export default function PlaceDetailClient({ place, relatedPlaces = [], reviews = [] }: Props) {
  const router = useRouter()
  const { token, user } = useAuth()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [newReview, setNewReview] = useState("")
  const [rating, setRating] = useState(0)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [displayedReviews, setDisplayedReviews] = useState(reviews)
  const [placeData, setPlaceData] = useState(place)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)

  const gallery = useMemo(() => {
    const images = place.metadata?.gallery?.filter((value) => Boolean(value)) ?? []
    if (images.length) return images
    if (place.imageUrl) return [place.imageUrl]
    return ["/placeholder.svg"]
  }, [place.imageUrl, place.metadata?.gallery])

  const amenities = place.metadata?.amenities ?? []
  const highlights = place.metadata?.highlights ?? place.tags
  const menu = place.metadata?.menu ?? []
  const hours = place.metadata?.hours ?? {}
  const contact = place.metadata?.contact ?? {}

  const handlePrev = () => setCurrentImageIndex((index) => Math.max(0, index - 1))
  const handleNext = () => setCurrentImageIndex((index) => Math.min(gallery.length - 1, index + 1))

  const handleSubmitReview = useCallback(async () => {
    if (!token || !user) {
      router.push("/login")
      return
    }

    if (!rating || !newReview.trim()) {
      setReviewError("Please provide both a rating and a comment.")
      return
    }

    setIsSubmittingReview(true)
    setReviewError(null)
    setReviewSuccess(false)

    try {
      await api.post(
        "/reviews",
        {
          placeId: place.id,
          rating,
          comment: newReview.trim(),
        },
        { auth: token }
      )
      setReviewSuccess(true)
      setNewReview("")
      setRating(0)
      // Refresh the page to get updated reviews count
      router.refresh()
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Failed to submit review. Please try again.")
    } finally {
      setIsSubmittingReview(false)
    }
  }, [token, user, rating, newReview, place.id, router])

  const handleMarkHelpful = useCallback(async (reviewId: string) => {
    try {
      await api.post(`/reviews/${reviewId}/helpful`, {})
      setDisplayedReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
      )
    } catch {
      // Silently fail
    }
  }, [])

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

  // Update place data when props change
  useEffect(() => {
    setPlaceData(place)
    setDisplayedReviews(reviews)
  }, [place, reviews])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/discover" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Corners
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <PlaceActions placeId={place.id} showFollow={user?.role === "user"} />
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={gallery[currentImageIndex] || "/placeholder.svg"}
              alt={place.name}
              width={1200}
              height={400}
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            <Button
              variant="secondary"
              size="sm"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full"
              onClick={handlePrev}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full"
              onClick={handleNext}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
              {place.featured && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">⭐ Featured</Badge>
              )}
              {place.verified && <Badge className="bg-green-500 text-white border-0">✓ Verified</Badge>}
              <Badge className={`${place.isOpen ? "bg-green-500" : "bg-red-500"} text-white border-0`}>
                <Clock className="w-3 h-3 mr-1" />
                {place.isOpen ? "Open Now" : "Closed"}
              </Badge>
            </div>

            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {gallery.length}
            </div>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto">
            {gallery.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                  index === currentImageIndex ? "border-orange-500" : "border-gray-200"
                }`}
              >
                <Image src={image || "/placeholder.svg"} alt={`${place.name} ${index + 1}`} width={80} height={80} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{place.name}</h1>
                    {place.locationLabel && (
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-5 h-5 mr-2" />
                        {place.locationLabel}
                      </div>
                    )}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center">
                        <Star className="w-6 h-6 text-yellow-400 fill-current" />
                        <span className="text-2xl font-bold ml-2">{placeData.rating.toFixed(1)}</span>
                        <span className="text-gray-600 ml-2">({placeData.reviews} reviews)</span>
                      </div>
                      <Badge variant="outline" className="border-orange-200 text-orange-700 text-lg px-3 py-1">
                        {place.categoryName}
                      </Badge>
                      <div className="flex items-center text-xl font-bold text-gray-900">
                        <DollarSign className="w-5 h-5" />
                        <span>
                          {placeData.priceRangeMin !== undefined && placeData.priceRangeMax !== undefined
                            ? `$${placeData.priceRangeMin} - $${placeData.priceRangeMax}`
                            : placeData.priceLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 text-lg leading-relaxed mb-6">{place.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {highlights.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {amenities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {amenities.map((amenity) => {
                        const Icon = amenityIconMap[amenity.toLowerCase()] ?? Building2
                        return (
                          <div key={amenity} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Icon className="w-5 h-5 text-orange-600" />
                            <span className="text-gray-700">{amenity}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="reviews" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-xl p-1">
                <TabsTrigger value="reviews" className="rounded-lg">
                  Reviews ({placeData.reviews})
                </TabsTrigger>
                <TabsTrigger value="menu" className="rounded-lg">
                  Menu
                </TabsTrigger>
                <TabsTrigger value="photos" className="rounded-lg">
                  Photos ({gallery.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reviews">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Customer Reviews</span>
                      <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                        Write Review
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {user ? (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-semibold mb-4">Share your experience</h4>
                        {reviewError && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {reviewError}
                          </div>
                        )}
                        {reviewSuccess && (
                          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                            Review submitted! It will be visible after admin approval.
                          </div>
                        )}
                        <div className="flex items-center mb-4">
                          <span className="mr-3">Rating:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className="mr-1"
                              disabled={isSubmittingReview}
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <Textarea
                          placeholder="Tell others about your experience..."
                          value={newReview}
                          onChange={(event) => setNewReview(event.target.value)}
                          className="mb-4"
                          rows={4}
                          disabled={isSubmittingReview}
                        />
                        <Button
                          onClick={handleSubmitReview}
                          disabled={isSubmittingReview || !rating || !newReview.trim()}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {isSubmittingReview ? "Submitting..." : "Post Review"}
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <p className="text-gray-600 mb-4">Please sign in to write a review</p>
                        <Button
                          onClick={() => router.push("/login")}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        >
                          Sign In
                        </Button>
                      </div>
                    )}

                    {displayedReviews.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No reviews yet. Be the first to review this place!</p>
                      </div>
                    ) : (
                      displayedReviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0">
                          <div className="flex items-start space-x-4">
                            <Avatar className="w-12 h-12">
                              {review.user.avatarUrl ? (
                                <Image
                                  src={review.user.avatarUrl}
                                  alt={review.user.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold">
                                  {review.user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h5 className="font-semibold text-gray-900">{review.user.name}</h5>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Flag className="w-4 h-4" />
                                </Button>
                              </div>
                              <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
                              {review.images && review.images.length > 0 && (
                                <div className="flex gap-2 mb-4">
                                  {review.images.map((image, index) => (
                                    <div key={index} className="w-20 h-20 rounded-lg overflow-hidden">
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
                              <div className="flex items-center space-x-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-orange-600"
                                  onClick={() => handleMarkHelpful(review.id)}
                                >
                                  <ThumbsUp className="w-4 h-4 mr-1" />
                                  Helpful ({review.helpfulCount})
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600">
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  Reply
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="menu">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Menu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {menu.length === 0 ? (
                      <p className="text-gray-500 text-sm">Menu information will be available soon.</p>
                    ) : (
                      <div className="grid gap-4">
                        {menu.map((item, index) => (
                          <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                            {item.imageUrl && (
                              <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                <Image
                                  src={item.imageUrl}
                                  alt={item.name}
                                  width={96}
                                  height={96}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 flex justify-between items-center">
                              <div>
                                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                {item.description && <p className="text-gray-600 text-sm mt-1">{item.description}</p>}
                              </div>
                              {item.price && <span className="font-bold text-orange-600 text-lg ml-4">{item.price}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Photo Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {gallery.map((image, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden">
                          <Image src={image || "/placeholder.svg"} alt={`${place.name} photo ${index + 1}`} width={200} height={200} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contact.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-orange-600" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-orange-600" />
                    <a href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`} target="_blank" rel="noreferrer" className="text-orange-700 hover:underline">
                      {contact.website}
                    </a>
                  </div>
                )}
                {contact.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-orange-600 mt-1" />
                    <span>{contact.address}</span>
                  </div>
                )}
                <div className="pt-4">
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 mb-2"
                    onClick={() => {
                      if (!user) {
                        router.push("/login")
                      } else {
                        setIsMessageModalOpen(true)
                      }
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message Business
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                    onClick={() => {
                      if (!user) {
                        router.push("/login")
                      } else {
                        setIsReservationModalOpen(true)
                      }
                    }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Make Reservation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {Object.keys(hours).length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Opening Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(hours).map(([day, value]) => (
                      <div key={day} className="flex justify-between items-center">
                        <span className="capitalize font-medium">{day}</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {relatedPlaces.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Related Places</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {relatedPlaces.map((related) => (
                      <Link key={related.id} href={`/place/${related.id}`}>
                        <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                            {related.imageUrl ? (
                              <Image
                                src={related.imageUrl}
                                alt={related.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Building2 className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{related.name}</h4>
                            <div className="flex items-center text-sm text-gray-600">
                              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                              {related.rating.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {placeData.ownerEmail && (
        <MessageModal
          placeId={place.id}
          placeName={place.name}
          recipientEmail={placeData.ownerEmail}
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
        />
      )}

      <ReservationModal
        placeId={place.id}
        placeName={place.name}
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}

