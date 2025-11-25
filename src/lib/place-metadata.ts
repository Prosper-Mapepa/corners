export type PlaceMenuItem = {
  name: string
  price?: string
  description?: string
  imageUrl?: string
}

export type PlaceMetadata = {
  gallery?: string[]
  amenities?: string[]
  highlights?: string[]
  contact?: {
    phone?: string
    website?: string
    address?: string
  }
  hours?: Record<string, string>
  menu?: PlaceMenuItem[]
}

export type MetadataInputs = {
  gallery: string
  amenities: string[]
  highlights: string[]
  tags: string[]
  hours: Record<string, { day: string; openTime: string; closeTime: string }>
  menu: Array<{ name: string; price: string; description: string; imageUrl: string }>
  contactPhone: string
  contactWebsite: string
  contactAddress: string
}

export const emptyMetadataInputs: MetadataInputs = {
  gallery: "",
  amenities: [],
  highlights: [],
  tags: [],
  hours: {},
  menu: [],
  contactPhone: "",
  contactWebsite: "",
  contactAddress: "",
}

const splitAndClean = (value: string, splitter: RegExp | string) =>
  value
    .split(splitter)
    .map((item) => item.trim())
    .filter(Boolean)

export function metadataFromInputs(inputs: MetadataInputs): PlaceMetadata | undefined {
  const metadata: PlaceMetadata = {}

  const gallery = splitAndClean(inputs.gallery, /\n+/)
  if (gallery.length) metadata.gallery = gallery

  if (inputs.amenities.length) metadata.amenities = inputs.amenities
  if (inputs.highlights.length) metadata.highlights = inputs.highlights

  const hoursEntries = Object.entries(inputs.hours)
    .filter(([_, value]) => value.openTime && value.closeTime)
    .map(([day, value]) => [day, `${value.openTime} - ${value.closeTime}`] as [string, string])
  if (hoursEntries.length) metadata.hours = Object.fromEntries(hoursEntries)

  const menuItems = inputs.menu
    .filter((item) => item.name.trim())
    .map((item) => ({
      name: item.name.trim(),
      price: item.price.trim() || undefined,
      description: item.description.trim() || undefined,
      imageUrl: item.imageUrl.trim() || undefined,
    }))
  if (menuItems.length) metadata.menu = menuItems

  const contact = {
    phone: inputs.contactPhone.trim() || undefined,
    website: inputs.contactWebsite.trim() || undefined,
    address: inputs.contactAddress.trim() || undefined,
  }
  if (contact.phone || contact.website || contact.address) {
    metadata.contact = contact
  }

  return Object.keys(metadata).length ? metadata : undefined
}

export function inputsFromMetadata(metadata?: PlaceMetadata): MetadataInputs {
  if (!metadata) {
    return { ...emptyMetadataInputs }
  }
  
  const hours: Record<string, { day: string; openTime: string; closeTime: string }> = {}
  if (metadata.hours) {
    Object.entries(metadata.hours).forEach(([day, timeStr]) => {
      const [openTime, closeTime] = timeStr.split(" - ").map((t) => t.trim())
      hours[day] = { day, openTime: openTime || "", closeTime: closeTime || "" }
    })
  }

  return {
    gallery: (metadata.gallery ?? []).join("\n"),
    amenities: metadata.amenities ?? [],
    highlights: metadata.highlights ?? [],
    tags: [],
    hours,
    menu: metadata.menu
      ? metadata.menu.map((item) => ({
          name: item.name,
          price: item.price || "",
          description: item.description || "",
          imageUrl: item.imageUrl || "",
        }))
      : [],
    contactPhone: metadata.contact?.phone ?? "",
    contactWebsite: metadata.contact?.website ?? "",
    contactAddress: metadata.contact?.address ?? "",
  }
}

