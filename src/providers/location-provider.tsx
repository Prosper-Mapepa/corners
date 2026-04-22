"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { LatLng } from "@/lib/geo"
import { snapRadiusToPreset } from "@/lib/radius-presets"

const STORAGE = {
  center: "corners.searchCenter",
  label: "corners.searchLabel",
  radius: "corners.radiusKm",
  user: "corners.userCoords",
  prompted: "corners.locationPromptSeen",
} as const

type LocationExploreContextValue = {
  searchCenter: LatLng | null
  searchLabel: string
  radiusKm: number
  userCoords: LatLng | null
  setSearchArea: (coords: LatLng, label: string) => void
  setRadiusKm: (km: number) => void
  clearSearchArea: () => void
  requestBrowserLocation: () => Promise<LatLng | null>
  promptOpen: boolean
  setPromptOpen: (open: boolean) => void
  markPromptSeen: () => void
}

const LocationExploreContext = createContext<LocationExploreContextValue | null>(null)

function readStoredCenter(): { coords: LatLng; label: string } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE.center)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LatLng
    if (typeof parsed.lat !== "number" || typeof parsed.lng !== "number") return null
    const label = localStorage.getItem(STORAGE.label) ?? "Saved area"
    return { coords: parsed, label }
  } catch {
    return null
  }
}

function readRadius(): number {
  if (typeof window === "undefined") return 50
  const v = localStorage.getItem(STORAGE.radius)
  const n = v ? Number(v) : 50
  if (!Number.isFinite(n)) return 50
  return snapRadiusToPreset(n)
}

function readUserCoords(): LatLng | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE.user)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LatLng
    if (typeof parsed.lat !== "number" || typeof parsed.lng !== "number") return null
    return parsed
  } catch {
    return null
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [searchCenter, setSearchCenter] = useState<LatLng | null>(null)
  const [searchLabel, setSearchLabel] = useState("")
  const [radiusKm, setRadiusKmState] = useState(50)
  const [userCoords, setUserCoords] = useState<LatLng | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [promptOpen, setPromptOpen] = useState(false)

  useEffect(() => {
    const stored = readStoredCenter()
    if (stored) {
      setSearchCenter(stored.coords)
      setSearchLabel(stored.label)
    }
    setRadiusKmState(readRadius())
    setUserCoords(readUserCoords())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (searchCenter) {
      localStorage.setItem(STORAGE.center, JSON.stringify(searchCenter))
      localStorage.setItem(STORAGE.label, searchLabel)
    } else {
      localStorage.removeItem(STORAGE.center)
      localStorage.removeItem(STORAGE.label)
    }
  }, [hydrated, searchCenter, searchLabel])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE.radius, String(radiusKm))
  }, [hydrated, radiusKm])

  const setSearchArea = useCallback((coords: LatLng, label: string) => {
    setSearchCenter(coords)
    setSearchLabel(label)
  }, [])

  const setRadiusKm = useCallback((km: number) => {
    setRadiusKmState(snapRadiusToPreset(km))
  }, [])

  const clearSearchArea = useCallback(() => {
    setSearchCenter(null)
    setSearchLabel("")
    localStorage.removeItem(STORAGE.center)
    localStorage.removeItem(STORAGE.label)
  }, [])

  const requestBrowserLocation = useCallback((): Promise<LatLng | null> => {
    return new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        resolve(null)
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setUserCoords(c)
          localStorage.setItem(STORAGE.user, JSON.stringify(c))
          resolve(c)
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
      )
    })
  }, [])

  const markPromptSeen = useCallback(() => {
    sessionStorage.setItem(STORAGE.prompted, "1")
  }, [])

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return
    if (searchCenter) return
    if (sessionStorage.getItem(STORAGE.prompted)) return

    const t = window.setTimeout(() => setPromptOpen(true), 750)
    return () => clearTimeout(t)
  }, [hydrated, searchCenter])

  const value = useMemo<LocationExploreContextValue>(
    () => ({
      searchCenter,
      searchLabel,
      radiusKm,
      userCoords,
      setSearchArea,
      setRadiusKm,
      clearSearchArea,
      requestBrowserLocation,
      promptOpen,
      setPromptOpen,
      markPromptSeen,
    }),
    [
      searchCenter,
      searchLabel,
      radiusKm,
      userCoords,
      setSearchArea,
      setRadiusKm,
      clearSearchArea,
      requestBrowserLocation,
      promptOpen,
      markPromptSeen,
    ],
  )

  return <LocationExploreContext.Provider value={value}>{children}</LocationExploreContext.Provider>
}

export function useLocationExplore() {
  const ctx = useContext(LocationExploreContext)
  if (!ctx) throw new Error("useLocationExplore must be used within LocationProvider")
  return ctx
}
