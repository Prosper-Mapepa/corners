"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Loader2, CheckCircle, Circle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api"

type ProfileFormState = {
  name: string
  email: string
  avatarUrl: string
  password: string
  confirmPassword: string
}

const initialProfileState: ProfileFormState = {
  name: "",
  email: "",
  avatarUrl: "",
  password: "",
  confirmPassword: "",
}

type BusinessListingSummary = {
  id: string
  name: string
  reviews: number
  rating: number
}

export default function BusinessProfilePage() {
  const router = useRouter()
  const { token, user, loading, refreshProfile } = useAuth()
  const [profileForm, setProfileForm] = useState<ProfileFormState>(initialProfileState)
  const [listings, setListings] = useState<BusinessListingSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return
    if (!token) {
      router.replace("/login")
      return
    }
    loadProfile()
  }, [loading, token, router])

  const loadProfile = async () => {
    if (!token) return
    try {
      setIsLoading(true)
      setError(null)
      const profile = await api.get<{
        id: string
        name: string
        email: string
        avatarUrl?: string
      }>("/auth/profile", { auth: token })
      setProfileForm({
        name: profile.name ?? "",
        email: profile.email ?? "",
        avatarUrl: profile.avatarUrl ?? "",
        password: "",
        confirmPassword: "",
      })
      const listingsResponse = await api.get<BusinessListingSummary[]>(
        `/places?ownerEmail=${encodeURIComponent(profile.email)}`,
        { auth: token },
      )
      setListings(
        listingsResponse.map((listing) => ({
          ...listing,
          rating: typeof listing.rating === "string" ? parseFloat(listing.rating) : listing.rating,
        })),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load profile.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if ((error || successMessage) && (error !== null || successMessage !== null)) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccessMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, successMessage])

  const profileSteps = useMemo(() => {
    const hasBusinessInfo = Boolean(profileForm.name && profileForm.email)
    const hasPhotos = Boolean(profileForm.avatarUrl)
    const hasSubmittedListing = listings.length > 0
    return [
      { label: "Business info added", complete: hasBusinessInfo },
      { label: "Photos uploaded", complete: hasPhotos },
      { label: "Submit a listing", complete: hasSubmittedListing },
    ]
  }, [profileForm.name, profileForm.email, profileForm.avatarUrl, listings])

  const completionPercent = useMemo(() => {
    const completed = profileSteps.filter((step) => step.complete).length
    return Math.round((completed / profileSteps.length) * 100)
  }, [profileSteps])

  const handleProfileChange = (field: keyof ProfileFormState, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) return
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    try {
      setIsSaving(true)
      setError(null)
      await api.patch(
        "/auth/profile",
        {
          name: profileForm.name,
          email: profileForm.email,
          avatarUrl: profileForm.avatarUrl || undefined,
          password: profileForm.password || undefined,
        },
        { auth: token },
      )
      setSuccessMessage("Profile updated successfully.")
      await refreshProfile()
      await loadProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update profile right now.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Business Profile</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => router.push("/business/dashboard")}>
                Dashboard
              </Button>
              <Button variant="outline" onClick={() => router.push("/business/profile")}>
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {(error || successMessage) && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {error ?? successMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Keep your profile up to date so explorers know who they’re contacting.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSaveProfile}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Display Name</label>
                    <Input required value={profileForm.name} onChange={(event) => handleProfileChange("name", event.target.value)} placeholder="Your business name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(event) => handleProfileChange("email", event.target.value)}
                      placeholder="contact@business.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Profile Photo URL</label>
                  <Input value={profileForm.avatarUrl} onChange={(event) => handleProfileChange("avatarUrl", event.target.value)} placeholder="https://..." />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">New Password</label>
                    <Input type="password" value={profileForm.password} onChange={(event) => handleProfileChange("password", event.target.value)} placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                    <Input
                      type="password"
                      value={profileForm.confirmPassword}
                      onChange={(event) => handleProfileChange("confirmPassword", event.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={loadProfile} disabled={isSaving}>
                    Reset
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
              <CardDescription>Help explorers learn more about your business.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Profile Progress</span>
                  <span>{completionPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {profileSteps.map((step) => (
                  <div key={step.label} className="flex items-center gap-2 text-sm">
                    {step.complete ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-300" />
                    )}
                    <span className={step.complete ? "text-gray-700" : "text-gray-400"}>{step.label}</span>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  const target = document.getElementById("profile-form")
                  target?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Recent Listings</CardTitle>
            <CardDescription>Review and manage the experiences you have already published.</CardDescription>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50 px-6 py-10 text-center text-orange-700">
                You have not submitted any listings yet. Head to the dashboard to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {listings.slice(0, 5).map((listing) => (
                  <div key={listing.id} className="flex flex-col gap-1 rounded-xl border p-4 md:flex-row md:items-center">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{listing.name}</p>
                      <p className="text-xs text-gray-500">
                        Rating: {listing.rating?.toFixed(1) ?? "New"} • Reviews: {listing.reviews ?? 0}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-orange-600" onClick={() => router.push("/business/dashboard")}>
                      Manage
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

