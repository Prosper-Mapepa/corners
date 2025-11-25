"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  MapPin,
  Star,
  Heart,
  Camera,
  Edit,
  Settings,
  Trophy,
  Calendar,
  MessageSquare,
  Share2,
  Globe,
  Phone,
  Mail,
  MapIcon,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  const user = {
    name: "Amara Okafor",
    username: "@amaraokafor",
    email: "amara@example.com",
    phone: "+234 123 456 7890",
    location: "Lagos, Nigeria",
    bio: "Food enthusiast and travel lover exploring the best of Africa. Always looking for authentic experiences and hidden gems across the continent.",
    joinDate: "March 2023",
    avatar: "A",
    stats: {
      reviews: 47,
      photos: 156,
      saved: 23,
      followers: 89,
      following: 134,
    },
    badges: [
      { name: "Local Expert", icon: "🏆", description: "50+ reviews in Lagos" },
      { name: "Photo Contributor", icon: "📸", description: "100+ photos uploaded" },
      { name: "Early Adopter", icon: "⭐", description: "Joined in first month" },
      { name: "Helpful Reviewer", icon: "👍", description: "Reviews marked helpful 100+ times" },
    ],
  }

  const recentActivity = [
    {
      type: "review",
      place: "Mama Africa Restaurant",
      action: "left a 5-star review",
      time: "2 hours ago",
      image: "/placeholder.svg?height=60&width=60",
    },
    {
      type: "photo",
      place: "Kente Cultural Center",
      action: "uploaded 3 photos",
      time: "1 day ago",
      image: "/placeholder.svg?height=60&width=60",
    },
    {
      type: "save",
      place: "Safari Lodge Retreat",
      action: "saved to favorites",
      time: "3 days ago",
      image: "/placeholder.svg?height=60&width=60",
    },
    {
      type: "review",
      place: "The Rooftop Lounge",
      action: "left a 4-star review",
      time: "1 week ago",
      image: "/placeholder.svg?height=60&width=60",
    },
  ]

  const reviews = [
    {
      id: 1,
      place: "Mama Africa Restaurant",
      rating: 5,
      comment:
        "Absolutely amazing! The jollof rice was the best I've ever had. The atmosphere is so authentic and the staff are incredibly friendly.",
      date: "2 days ago",
      helpful: 12,
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 2,
      place: "Kente Cultural Center",
      rating: 5,
      comment:
        "This place feels like home! The traditional decorations and authentic flavors make it special. Perfect for family dinners.",
      date: "2 weeks ago",
      helpful: 15,
      image: "/placeholder.svg?height=100&width=100",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Corners
              </span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/discover" className="text-gray-700 hover:text-orange-600 transition-colors">
                Discover
              </Link>
              <Link href="/profile" className="text-orange-600 font-medium">
                Profile
              </Link>
              <Link href="/saved" className="text-gray-700 hover:text-orange-600 transition-colors">
                Saved
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user.avatar}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                      <MapIcon className="w-4 h-4 mr-1" />
                      {user.location}
                      <span className="mx-2">•</span>
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {user.joinDate}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={() => setIsEditing(!isEditing)}
                      className={
                        isEditing
                          ? "bg-orange-500 hover:bg-orange-600"
                          : "border-orange-200 text-orange-700 hover:bg-orange-50"
                      }
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </Button>
                    <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">{user.bio}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  {Object.entries(user.stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{value}</div>
                      <div className="text-sm text-gray-600 capitalize">{key}</div>
                    </div>
                  ))}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {user.badges.map((badge, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gradient-to-r from-amber-100 to-orange-100 text-orange-800 border-orange-200 px-3 py-1"
                    >
                      <span className="mr-2">{badge.icon}</span>
                      {badge.name}
                    </Badge>
                  ))}
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
              <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-xl p-1">
                <TabsTrigger value="activity" className="rounded-lg">
                  Recent Activity
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg">
                  My Reviews
                </TabsTrigger>
                <TabsTrigger value="photos" className="rounded-lg">
                  My Photos
                </TabsTrigger>
              </TabsList>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <Image
                            src={activity.image || "/placeholder.svg"}
                            alt={activity.place}
                            width={60}
                            height={60}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="text-gray-900">
                              <span className="font-medium">{activity.action}</span> at{" "}
                              <Link href="#" className="text-orange-600 hover:underline font-medium">
                                {activity.place}
                              </Link>
                            </p>
                            <p className="text-sm text-gray-500">{activity.time}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {activity.type === "review" && <MessageSquare className="w-5 h-5 text-blue-500" />}
                            {activity.type === "photo" && <Camera className="w-5 h-5 text-green-500" />}
                            {activity.type === "save" && <Heart className="w-5 h-5 text-red-500" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>My Reviews ({user.stats.reviews})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0">
                          <div className="flex items-start space-x-4">
                            <Image
                              src={review.image || "/placeholder.svg"}
                              alt={review.place}
                              width={100}
                              height={100}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">{review.place}</h4>
                                <span className="text-sm text-gray-500">{review.date}</span>
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
                              <div className="flex items-center text-sm text-gray-500">
                                <Trophy className="w-4 h-4 mr-1" />
                                {review.helpful} people found this helpful
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Photos Tab */}
              <TabsContent value="photos">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>My Photos ({user.stats.photos})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[...Array(9)].map((_, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          <Image
                            src={`/placeholder.svg?height=200&width=200&text=Photo${index + 1}`}
                            alt={`Photo ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Edit Profile Form */}
            {isEditing && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" defaultValue={user.bio} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" defaultValue={user.location} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" placeholder="https://yourwebsite.com" />
                  </div>
                </CardContent>
              </Card>
            )}

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
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-700">{user.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-700">www.amaraokafor.com</span>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.badges.map((badge, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-orange-100"
                    >
                      <div className="text-2xl">{badge.icon}</div>
                      <div>
                        <h4 className="font-medium text-gray-900">{badge.name}</h4>
                        <p className="text-sm text-gray-600">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Following */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Following</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Lagos Food Guide", followers: "2.3k", avatar: "L" },
                    { name: "African Adventures", followers: "1.8k", avatar: "A" },
                    { name: "Culture Explorer", followers: "956", avatar: "C" },
                  ].map((follow, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold">
                            {follow.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-gray-900">{follow.name}</h4>
                          <p className="text-sm text-gray-600">{follow.followers} followers</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-200 text-orange-700 hover:bg-orange-50"
                      >
                        Following
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
