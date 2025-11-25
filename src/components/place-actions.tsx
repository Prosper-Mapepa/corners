"use client"

import { useState, useEffect } from "react"
import { Heart, Share2, UserPlus, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

type Props = {
  placeId: string
  variant?: "default" | "compact"
  showFollow?: boolean
}

export function PlaceActions({ placeId, variant = "default", showFollow = true }: Props) {
  const router = useRouter()
  const { token, user } = useAuth()
  const [isSaved, setIsSaved] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (token && placeId) {
      checkSavedStatus()
      if (showFollow) {
        checkFollowingStatus()
      }
    }
  }, [token, placeId, showFollow])

  const checkSavedStatus = async () => {
    if (!token) return
    try {
      const response = await api.get<{ isSaved: boolean }>(`/auth/is-place-saved/${placeId}`, { auth: token })
      setIsSaved(response.isSaved)
    } catch (err) {
      // Silently fail
    }
  }

  const checkFollowingStatus = async () => {
    if (!token) return
    try {
      const response = await api.get<{ isFollowing: boolean }>(`/auth/is-following-place/${placeId}`, { auth: token })
      setIsFollowing(response.isFollowing)
    } catch (err) {
      // Silently fail
    }
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!token) {
      router.push("/login")
      return
    }
    try {
      setIsLoading(true)
      if (isSaved) {
        await api.post(`/auth/unsave-place/${placeId}`, {}, { auth: token })
        setIsSaved(false)
      } else {
        await api.post(`/auth/save-place/${placeId}`, {}, { auth: token })
        setIsSaved(true)
      }
    } catch (err) {
      console.error("Failed to toggle save:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!token) {
      router.push("/login")
      return
    }
    if (user?.role !== "user") {
      // Only explorers can follow places
      return
    }
    try {
      setIsLoading(true)
      if (isFollowing) {
        await api.post(`/auth/unfollow-place/${placeId}`, {}, { auth: token })
        setIsFollowing(false)
      } else {
        await api.post(`/auth/follow-place/${placeId}`, {}, { auth: token })
        setIsFollowing(true)
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/place/${placeId}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this place on Corners",
          url,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        // You could show a toast here
      } catch (err) {
        console.error("Failed to copy:", err)
      }
    }
  }

  if (variant === "compact") {
    return (
      <div className="flex gap-1">
        {showFollow && user?.role === "user" && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full"
            onClick={handleFollow}
            disabled={isLoading}
            title={isFollowing ? "Unfollow" : "Follow"}
          >
            {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className={`h-8 w-8 p-0 rounded-full ${isSaved ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-white/90 hover:bg-white"}`}
          onClick={handleSave}
          disabled={isLoading}
          title={isSaved ? "Unsave" : "Save"}
        >
          <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full"
          onClick={handleShare}
          title="Share"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      {showFollow && user?.role === "user" && (
        <Button
          size="sm"
          variant={isFollowing ? "default" : "outline"}
          onClick={handleFollow}
          disabled={isLoading}
          className={isFollowing ? "bg-orange-500 hover:bg-orange-600" : ""}
        >
          {isFollowing ? <UserMinus className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
          {isFollowing ? "Following" : "Follow"}
        </Button>
      )}
      <Button
        size="sm"
        variant={isSaved ? "default" : "outline"}
        onClick={handleSave}
        disabled={isLoading}
        className={isSaved ? "bg-red-500 hover:bg-red-600" : ""}
      >
        <Heart className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
        {isSaved ? "Saved" : "Save"}
      </Button>
      <Button size="sm" variant="outline" onClick={handleShare}>
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
    </div>
  )
}


