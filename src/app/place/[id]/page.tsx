import { notFound } from "next/navigation"

import PlaceDetailClient, { PlaceDetail } from "./place-detail-client"
import { PlaceMetadata } from "@/lib/place-metadata"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

type PlaceApiResponse = {
  id: string
  name: string
  description: string
  priceLevel: string
  priceRangeMin?: number | null
  priceRangeMax?: number | null
  rating: number
  reviews: number
  imageUrl?: string | null
  isOpen: boolean
  verified: boolean
  featured: boolean
  tags: string[]
  ownerEmail?: string | null
  category?: { id?: string; name?: string }
  location?: { id?: string; name?: string; city?: string | null; country?: string | null }
  metadata?: PlaceMetadata | null
}

type ReviewApiResponse = {
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
    avatarUrl?: string | null
  }
}

type RelatedPlace = {
  id: string
  name: string
  rating: number
  imageUrl?: string
}

async function fetchPlace(id: string): Promise<PlaceApiResponse | null> {
  const res = await fetch(`${API_BASE}/places/${id}`, {
    next: { revalidate: 0 },
    cache: 'no-store',
  })

  if (res.status === 404) {
    return null
  }

  if (!res.ok) {
    throw new Error(`Failed to load place ${id}`)
  }

  return res.json()
}

async function fetchRelatedPlaces(excludeId: string, categoryId?: string, locationId?: string): Promise<RelatedPlace[]> {
  if (!categoryId && !locationId) return []
  
  try {
    const params = new URLSearchParams()
    if (categoryId) params.append("categoryId", categoryId)
    if (locationId) params.append("locationId", locationId)
    params.append("status", "approved")
    params.append("limit", "3")
    
    const res = await fetch(`${API_BASE}/places?${params.toString()}`, {
      next: { revalidate: 60 },
    })
    
    if (!res.ok) return []
    
    const places: PlaceApiResponse[] = await res.json()
    return places
      .filter((p) => p.id !== excludeId)
      .slice(0, 3)
      .map((p) => ({
        id: p.id,
        name: p.name,
        rating: Number(p.rating ?? 0),
        imageUrl: p.imageUrl ? p.imageUrl : undefined,
      }))
  } catch {
    return []
  }
}

async function fetchReviews(placeId: string): Promise<ReviewApiResponse[]> {
  try {
    const res = await fetch(`${API_BASE}/reviews?placeId=${placeId}&status=approved`, {
      next: { revalidate: 0 },
      cache: 'no-store',
    })
    
    if (!res.ok) return []
    
    return res.json()
  } catch {
    return []
  }
}

type PlaceRouteParams = {
  id: string
}

export default async function PlaceDetailPage({ params }: { params: Promise<PlaceRouteParams> }) {
  const { id } = await params
  const place = await fetchPlace(id)

  if (!place) {
    notFound()
  }

  const [relatedPlaces, reviewsData] = await Promise.all([
    fetchRelatedPlaces(place.id, place.category?.id, place.location?.id),
    fetchReviews(place.id),
  ])

  const reviews = reviewsData.map((r) => ({
    ...r,
    user: {
      ...r.user,
      avatarUrl: r.user.avatarUrl ?? undefined,
    },
  }))

  const normalized: PlaceDetail = {
    id: place.id,
    name: place.name,
    description: place.description,
    priceLevel: place.priceLevel,
    priceRangeMin: place.priceRangeMin ?? undefined,
    priceRangeMax: place.priceRangeMax ?? undefined,
    rating: Number(place.rating ?? 0),
    reviews: Number(place.reviews ?? 0),
    imageUrl: place.imageUrl ?? undefined,
    isOpen: place.isOpen,
    verified: place.verified,
    featured: place.featured,
    tags: place.tags ?? [],
    categoryName: place.category?.name ?? "Experience",
    locationLabel:
      place.location?.name ||
      [place.location?.city, place.location?.country].filter((value) => value && value.length).join(", "),
    metadata: place.metadata ?? undefined,
    ownerEmail: place.ownerEmail ?? undefined,
  }

  return <PlaceDetailClient place={normalized} relatedPlaces={relatedPlaces} reviews={reviews} />
}

