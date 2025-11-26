"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MapPin,
  Star,
  Heart,
  Camera,
  Edit,
  Trophy,
  Calendar,
  MessageSquare,
  Share2,
  Globe,
  Phone,
  Mail,
  MapIcon,
  Send,
  Loader2,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"

type Conversation = {
  place: {
    id: string
    name: string
  }
  otherUser: {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
  }
  lastMessage: {
    id: string
    content: string
    createdAt: string
    sender: {
      id: string
      name: string
    }
  }
  unreadCount: number
}

type Message = {
  id: string
  content: string
  read: boolean
  createdAt: string
  sender: {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
  }
  recipient: {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
  }
}

type Reservation = {
  id: string
  reservationDate: string
  reservationTime: string
  partySize: number
  specialRequests?: string | null
  contactPhone?: string | null
  contactEmail?: string | null
  status: "pending" | "confirmed" | "cancelled" | "completed"
  createdAt: string
  place: {
    id: string
    name: string
    imageUrl?: string | null
  }
}

type Review = {
  id: string
  rating: number
  comment: string
  helpfulCount: number
  images: string[]
  createdAt: string
  place: {
    id: string
    name: string
    imageUrl?: string | null
  }
  status: "pending" | "approved" | "rejected"
}

type UserStats = {
  reviews: number
  photos: number
  saved: number
  followers: number
  following: number
}

type ActivityItem = {
  type: string
  id: string
  place: {
    id: string
    name: string
    imageUrl?: string | null
  }
  action: string
  time: string
  rating?: number
  hasImages?: boolean
}

type FollowingPlace = {
  id: string
  name: string
  imageUrl?: string | null
  category?: { name: string }
  location?: { name: string }
}

export default function ProfilePage() {
  const router = useRouter()
  const { token, user: authUser, refreshProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: "", email: "", bio: "", location: "" })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [userStats, setUserStats] = useState<UserStats>({ reviews: 0, photos: 0, saved: 0, followers: 0, following: 0 })
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editReviewForm, setEditReviewForm] = useState({ rating: 5, comment: "" })
  const [following, setFollowing] = useState<FollowingPlace[]>([])
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoadingReservations, setIsLoadingReservations] = useState(false)
  const [reservationStatusFilter, setReservationStatusFilter] = useState<Reservation["status"] | "all">("all")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (token && authUser) {
      loadProfileData()
      loadConversations()
      loadReservations()
      // Poll for updates
      const interval = setInterval(() => {
        loadProfileData()
        loadConversations()
        loadReservations()
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [token, authUser])

  const loadProfileData = async () => {
    if (!token || !authUser) return
    try {
      const [stats, activity, userReviews, followingList] = await Promise.all([
        api.get<UserStats>("/auth/profile/stats", { auth: token }),
        api.get<ActivityItem[]>("/auth/profile/activity", { auth: token }),
        api.get<Review[]>(`/reviews?userId=${authUser.id}`, { auth: token }),
        api.get<FollowingPlace[]>("/auth/following", { auth: token }),
      ])
      setUserStats(stats)
      setRecentActivity(activity)
      setReviews(userReviews)
      setFollowing(followingList)
      setProfileForm({
        name: authUser.name || "",
        email: authUser.email || "",
        bio: "",
        location: "",
      })
    } catch (err) {
      console.error("Failed to load profile data:", err)
    }
  }

  const handleSaveProfile = async () => {
    if (!token) return
    try {
      setIsSavingProfile(true)
      await api.patch("/auth/profile", { name: profileForm.name, email: profileForm.email, avatarUrl: authUser?.avatarUrl }, { auth: token })
      await refreshProfile()
      setIsEditing(false)
    } catch (err) {
      console.error("Failed to save profile:", err)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!token) return
    if (!confirm("Are you sure you want to delete this review?")) return
    try {
      await api.delete(`/reviews/${reviewId}`, { auth: token })
      await loadProfileData()
    } catch (err) {
      console.error("Failed to delete review:", err)
    }
  }

  const handleUpdateReview = async (reviewId: string) => {
    if (!token) return
    try {
      await api.patch(`/reviews/${reviewId}`, { rating: editReviewForm.rating, comment: editReviewForm.comment }, { auth: token })
      setEditingReviewId(null)
      await loadProfileData()
    } catch (err) {
      console.error("Failed to update review:", err)
    }
  }

  const handleUnfollow = async (placeId: string) => {
    if (!token) return
    try {
      await api.post(`/auth/unfollow-place/${placeId}`, {}, { auth: token })
      await loadProfileData()
    } catch (err) {
      console.error("Failed to unfollow place:", err)
    }
  }

  useEffect(() => {
    if (selectedConversation && token) {
      loadMessages()
      const interval = setInterval(loadMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedConversation, token])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadConversations = async () => {
    if (!token) return
    try {
      setIsLoadingMessages(true)
      const data = await api.get<Conversation[]>("/messages/conversations", { auth: token })
      setConversations(data)
    } catch (err) {
      console.error("Failed to load conversations:", err)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const loadMessages = async () => {
    if (!token || !selectedConversation || !authUser) return
    try {
      const data = await api.get<Message[]>(
        `/messages/conversation/${selectedConversation.place.id}/${selectedConversation.otherUser.id}`,
        { auth: token }
      )
      setMessages(data)
    } catch (err) {
      console.error("Failed to load messages:", err)
    }
  }

  const loadReservations = async () => {
    if (!token) return
    try {
      setIsLoadingReservations(true)
      const data = await api.get<Reservation[]>("/reservations", { auth: token })
      setReservations(data)
    } catch (err) {
      console.error("Failed to load reservations:", err)
    } finally {
      setIsLoadingReservations(false)
    }
  }

  const handleSendMessage = async () => {
    if (!token || !selectedConversation || !newMessage.trim()) return
    try {
      setIsSendingMessage(true)
      await api.post(
        "/messages",
        {
          placeId: selectedConversation.place.id,
          recipientId: selectedConversation.otherUser.id,
          content: newMessage.trim(),
        },
        { auth: token }
      )
      setNewMessage("")
      await loadMessages()
      await loadConversations()
    } catch (err) {
      console.error("Failed to send message:", err)
    } finally {
      setIsSendingMessage(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const formatReservationDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const convertTo12Hour = (time24h: string): string => {
    const [hours, minutes] = time24h.split(":")
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const user = {
    name: authUser?.name || "Explorer",
    username: `@${authUser?.email?.split("@")[0] || "user"}`,
    email: authUser?.email || "",
    avatar: authUser?.name?.charAt(0)?.toUpperCase() || authUser?.email?.charAt(0)?.toUpperCase() || "E",
    joinDate: authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Recently",
  }

  const filteredReservations = reservations.filter(
    (res) => reservationStatusFilter === "all" || res.status === reservationStatusFilter
  )

  const reservationStatusBadges: Record<Reservation["status"], string> = {
    pending: "bg-yellow-500 text-gray-900",
    confirmed: "bg-green-500 text-white",
    cancelled: "bg-red-500 text-white",
    completed: "bg-blue-500 text-white",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <DashboardNav variant="explorer" />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="border-0 shadow-xl mb-8 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>
          <CardContent className="relative px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6 -mt-16">
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-4xl font-bold">
                  {user.avatar}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 md:mt-16">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.name}</h1>
                    <p className="text-gray-600 mb-2">{user.username}</p>
                    <div className="flex items-center text-gray-600 mb-4">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {user.joinDate}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={() => {
                        if (isEditing) {
                          handleSaveProfile()
                        } else {
                          setIsEditing(true)
                        }
                      }}
                      disabled={isSavingProfile}
                      className={
                        isEditing
                          ? "bg-orange-500 hover:bg-orange-600"
                          : "border-orange-200 text-orange-700 hover:bg-orange-50"
                      }
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          {isEditing ? "Save Changes" : "Edit Profile"}
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {isEditing && (
                  <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{userStats.reviews}</div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{userStats.saved}</div>
                    <div className="text-sm text-gray-600">Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{userStats.following}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="activity" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 rounded-xl p-1">
                <TabsTrigger value="activity" className="rounded-lg">
                  Recent Activity
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg">
                  My Reviews ({userStats.reviews})
                </TabsTrigger>
                <TabsTrigger value="messages" className="rounded-lg">
                  Messages {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0) > 0 && (
                    <Badge className="ml-2 bg-orange-500 text-white text-xs">
                      {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="reservations" className="rounded-lg">
                  Reservations
                </TabsTrigger>
              </TabsList>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentActivity.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No recent activity yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                              {activity.place.imageUrl ? (
                                <Image
                                  src={activity.place.imageUrl}
                                  alt={activity.place.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <MapPin className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900">
                                <span className="font-medium">{activity.action}</span> at{" "}
                                <Link href={`/place/${activity.place.id}`} className="text-orange-600 hover:underline font-medium">
                                  {activity.place.name}
                                </Link>
                              </p>
                              <p className="text-sm text-gray-500">{formatDate(activity.time)}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {activity.type === "review" && <MessageSquare className="w-5 h-5 text-blue-500" />}
                              {activity.hasImages && <Camera className="w-5 h-5 text-green-500" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>My Reviews ({userStats.reviews})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reviews.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>You haven't written any reviews yet.</p>
                        <Link href="/discover">
                          <Button className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                            Browse Places
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b pb-6 last:border-b-0">
                            {editingReviewId === review.id ? (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <Link href={`/place/${review.place.id}`} className="font-semibold text-orange-600 hover:underline">
                                    {review.place.name}
                                  </Link>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingReviewId(null)
                                        setEditReviewForm({ rating: 5, comment: "" })
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateReview(review.id)}
                                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>Rating:</span>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} onClick={() => setEditReviewForm({ ...editReviewForm, rating: star })}>
                                      <Star
                                        className={`w-5 h-5 ${
                                          star <= editReviewForm.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                                <Textarea
                                  value={editReviewForm.comment}
                                  onChange={(e) => setEditReviewForm({ ...editReviewForm, comment: e.target.value })}
                                  rows={4}
                                />
                              </div>
                            ) : (
                              <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                  {review.place.imageUrl ? (
                                    <Image
                                      src={review.place.imageUrl}
                                      alt={review.place.name}
                                      width={64}
                                      height={64}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <MapPin className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <Link href={`/place/${review.place.id}`} className="font-semibold text-gray-900 hover:text-orange-600">
                                      {review.place.name}
                                    </Link>
                                    <div className="flex items-center gap-2">
                                      <Badge variant={review.status === "approved" ? "default" : "secondary"}>{review.status}</Badge>
                                      <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center mb-2">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-gray-700 mb-2">{review.comment}</p>
                                  {review.images && review.images.length > 0 && (
                                    <div className="flex gap-2 mb-2">
                                      {review.images.map((img, idx) => (
                                        <div key={idx} className="w-16 h-16 rounded overflow-hidden">
                                          <Image src={img} alt={`Review image ${idx + 1}`} width={64} height={64} className="w-full h-full object-cover" />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Trophy className="w-4 h-4 mr-1" />
                                      {review.helpfulCount} people found this helpful
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button size="sm" variant="outline" onClick={() => {
                                        setEditingReviewId(review.id)
                                        setEditReviewForm({ rating: review.rating, comment: review.comment })
                                      }}>
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:text-red-700"
                                        onClick={() => handleDeleteReview(review.id)}
                                      >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>


              {/* Messages Tab */}
              <TabsContent value="messages">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>My Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingMessages && conversations.length === 0 ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No messages yet. Start a conversation from a business listing!</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {conversations.map((conv) => (
                            <div
                              key={`${conv.place.id}-${conv.otherUser.id}`}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                selectedConversation?.place.id === conv.place.id &&
                                selectedConversation?.otherUser.id === conv.otherUser.id
                                  ? "bg-orange-50 border-orange-200"
                                  : "hover:bg-gray-50"
                              }`}
                              onClick={() => setSelectedConversation(conv)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-sm truncate">{conv.otherUser.name}</h4>
                                    {conv.unreadCount > 0 && (
                                      <Badge className="bg-orange-500 text-white text-xs">{conv.unreadCount}</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 truncate">{conv.place.name}</p>
                                  <p className="text-xs text-gray-500 mt-1 truncate">{conv.lastMessage.content}</p>
                                </div>
                                <span className="text-xs text-gray-400 ml-2">{formatDate(conv.lastMessage.createdAt)}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {selectedConversation && (
                          <div className="border rounded-lg flex flex-col h-96">
                            <div className="p-4 border-b flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">{selectedConversation.otherUser.name}</h4>
                                <p className="text-sm text-gray-600">
                                  <Link href={`/place/${selectedConversation.place.id}`} className="text-orange-600 hover:underline">
                                    {selectedConversation.place.name}
                                  </Link>
                                </p>
                              </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                              {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                  <div className="text-center">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No messages yet. Start the conversation!</p>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {messages.map((message) => {
                                    const isOwn = message.sender.id === authUser?.id
                                    return (
                                      <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                                        <div className={`flex items-start space-x-2 max-w-[80%] ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}>
                                          <Avatar className="w-8 h-8 flex-shrink-0">
                                            {message.sender.avatarUrl ? (
                                              <Image
                                                src={message.sender.avatarUrl}
                                                alt={message.sender.name}
                                                width={32}
                                                height={32}
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                                                {message.sender.name.charAt(0).toUpperCase()}
                                              </AvatarFallback>
                                            )}
                                          </Avatar>
                                          <div className={`rounded-lg px-3 py-2 ${isOwn ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-900"}`}>
                                            <p className="text-sm">{message.content}</p>
                                            <p className={`text-xs mt-1 ${isOwn ? "text-orange-100" : "text-gray-500"}`}>
                                              {formatDate(message.createdAt)}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                  <div ref={messagesEndRef} />
                                </>
                              )}
                            </div>
                            <div className="border-t p-4">
                              <div className="flex space-x-2">
                                <Textarea
                                  placeholder="Type your message..."
                                  value={newMessage}
                                  onChange={(e) => setNewMessage(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault()
                                      handleSendMessage()
                                    }
                                  }}
                                  className="min-h-[60px] resize-none"
                                  disabled={isSendingMessage}
                                />
                                <Button
                                  onClick={handleSendMessage}
                                  disabled={isSendingMessage || !newMessage.trim()}
                                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                                >
                                  {isSendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reservations Tab */}
              <TabsContent value="reservations">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>My Reservations</CardTitle>
                      <Select value={reservationStatusFilter} onValueChange={(value) => setReservationStatusFilter(value as Reservation["status"] | "all")}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingReservations && reservations.length === 0 ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                      </div>
                    ) : filteredReservations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No reservations {reservationStatusFilter !== "all" ? `with status "${reservationStatusFilter}"` : ""} yet.</p>
                        <Link href="/discover">
                          <Button className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                            Browse Places
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredReservations.map((reservation) => (
                          <div key={reservation.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Link href={`/place/${reservation.place.id}`} className="font-semibold text-orange-600 hover:underline">
                                    {reservation.place.name}
                                  </Link>
                                  <Badge className={reservationStatusBadges[reservation.status]}>
                                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>{formatReservationDate(reservation.reservationDate)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>{convertTo12Hour(reservation.reservationTime)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span>{reservation.partySize} {reservation.partySize === 1 ? "guest" : "guests"}</span>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    <span className="font-medium">Booked:</span> {formatDate(reservation.createdAt)}
                                  </div>
                                </div>
                                {reservation.specialRequests && (
                                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Special Requests:</p>
                                    <p className="text-sm text-gray-600">{reservation.specialRequests}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-700">{user.email}</span>
                </div>
              </CardContent>
            </Card>

            {/* Following */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Following ({userStats.following})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingFollowing ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                  </div>
                ) : following.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    <p>You're not following anyone yet.</p>
                    <p className="mt-2">Discover users to follow!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {following.map((place) => (
                      <div key={place.id} className="flex items-center justify-between">
                        <Link href={`/place/${place.id}`} className="flex items-center space-x-3 flex-1">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                            {place.imageUrl ? (
                              <Image src={place.imageUrl} alt={place.name} width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{place.name}</h4>
                            <p className="text-sm text-gray-600 truncate">
                              {place.category?.name} • {place.location?.name}
                            </p>
                          </div>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50 ml-2"
                          onClick={(e) => {
                            e.preventDefault()
                            handleUnfollow(place.id)
                          }}
                        >
                          Unfollow
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
