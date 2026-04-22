/** Shared search helpers for landing + discover */

export function normalizeSearchTokens(raw: string): string[] {
  return raw
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0)
}

type PlaceLike = {
  name: string
  description?: string | null
  category?: { name?: string | null; slug?: string | null } | null
  location?: {
    name?: string | null
    slug?: string | null
    city?: string | null
    country?: string | null
  } | null
  tags?: string[] | null
}

export function buildPlaceHaystack(place: PlaceLike): string {
  return [
    place.name,
    place.description,
    place.category?.name,
    place.category?.slug,
    place.location?.name,
    place.location?.slug,
    place.location?.city,
    place.location?.country,
    ...(place.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

export function haystackMatchesTokens(haystack: string, tokens: string[]): boolean {
  if (tokens.length === 0) return true
  const h = haystack.toLowerCase()
  return tokens.every((t) => h.includes(t))
}

export function scorePlaceRelevance(place: PlaceLike & { rating?: number; featured?: boolean }, tokens: string[]): number {
  if (tokens.length === 0) return 0
  let score = 0
  const name = (place.name ?? "").toLowerCase()
  const desc = (place.description ?? "").toLowerCase()
  const cat = `${place.category?.name ?? ""} ${place.category?.slug ?? ""}`.toLowerCase()
  const loc = `${place.location?.name ?? ""} ${place.location?.slug ?? ""} ${place.location?.city ?? ""} ${place.location?.country ?? ""}`.toLowerCase()
  const tagStr = (place.tags ?? []).join(" ").toLowerCase()

  for (const t of tokens) {
    if (!t) continue
    if (name === t) score += 30
    else if (name.startsWith(t)) score += 20
    else if (name.includes(t)) score += 14
    else if (name.split(/\s+/).some((w) => w.startsWith(t))) score += 10
    if (cat.includes(t)) score += 9
    if (loc.includes(t)) score += 8
    if (tagStr.includes(t)) score += 7
    if (desc.includes(t)) score += 5
  }

  if (place.featured) score += 6
  score += (typeof place.rating === "number" ? place.rating : 0) * 0.75
  return score
}

type CategoryLike = { id: string; name: string; slug: string }
type LocationLike = {
  id: string
  name: string
  slug: string
  city?: string | null
  country?: string | null
}

export function scoreCategoryMatch(category: CategoryLike, tokens: string[]): number {
  if (tokens.length === 0) return 0
  const h = `${category.name} ${category.slug}`.toLowerCase()
  if (!haystackMatchesTokens(h, tokens)) return -1
  let score = 8
  for (const t of tokens) {
    if (category.name.toLowerCase().includes(t)) score += 12
    if (category.slug.toLowerCase().includes(t)) score += 6
  }
  return score
}

export function scoreLocationMatch(location: LocationLike, tokens: string[]): number {
  if (tokens.length === 0) return 0
  const h = `${location.name} ${location.slug} ${location.city ?? ""} ${location.country ?? ""}`.toLowerCase()
  if (!haystackMatchesTokens(h, tokens)) return -1
  let score = 8
  for (const t of tokens) {
    if (location.name.toLowerCase().includes(t)) score += 12
    if ((location.city ?? "").toLowerCase().includes(t)) score += 10
    if ((location.country ?? "").toLowerCase().includes(t)) score += 10
  }
  return score
}
