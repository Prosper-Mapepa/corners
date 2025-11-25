"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
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
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Add imports for images
import lagosImage from "@/assets/lagos.jpeg"
import lagossImage from "@/assets/lagoss.jpeg"
import africanDrums from "@/assets/african-drums.png"
import africanDrum from "@/assets/african-drum.png"
import djembe from "@/assets/djembe.png"
import mask from "@/assets/mask.png"
import woman from "@/assets/woman.png"
import african from "@/assets/african.png"
import africaa from "@/assets/africaa.png"

export default function PlaceDetailPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [newReview, setNewReview] = useState("")
  const [rating, setRating] = useState(0)
  

  const place = {
    id: 1,
    name: "Mama Africa Restaurant",
    category: "Restaurant",
    location: "Victoria Island, Lagos, Nigeria",
    rating: 4.8,
    reviews: 234,
    price: "$$",
    description:
      "Experience the authentic taste of Nigeria at Mama Africa Restaurant. Our traditional dishes are prepared with locally sourced ingredients and served in a warm, welcoming atmosphere that celebrates African culture. From our famous jollof rice to our signature pepper soup, every meal tells a story of heritage and flavor.",
    isOpen: true,
    verified: true,
    featured: true,
    phone: "+234 123 456 7890",
    website: "www.mamaafrica.ng",
    address: "123 Ahmadu Bello Way, Victoria Island, Lagos",
    hours: {
      monday: "11:00 AM - 10:00 PM",
      tuesday: "11:00 AM - 10:00 PM",
      wednesday: "11:00 AM - 10:00 PM",
      thursday: "11:00 AM - 10:00 PM",
      friday: "11:00 AM - 11:00 PM",
      saturday: "10:00 AM - 11:00 PM",
      sunday: "12:00 PM - 9:00 PM",
    },
    amenities: [
      { icon: Wifi, name: "Free WiFi" },
      { icon: Car, name: "Parking" },
      { icon: CreditCard, name: "Card Payment" },
      { icon: Utensils, name: "Outdoor Seating" },
      { icon: Music, name: "Live Music" },
      { icon: Shield, name: "COVID Safe" },
    ],
    tags: ["Nigerian", "Traditional", "Family-friendly", "Live Music", "Authentic", "Local Favorite"],
    images: [
      lagosImage.src,
      lagossImage.src,
      africanDrums.src,
      africanDrum.src,
      djembe.src,
      mask.src,
    ],
    menu: [
      { name: "Jollof Rice", price: "₦2,500", description: "Traditional Nigerian rice dish with spices" },
      { name: "Pepper Soup", price: "₦3,000", description: "Spicy Nigerian soup with fish or meat" },
      { name: "Suya", price: "₦1,500", description: "Grilled spiced meat skewers" },
      { name: "Pounded Yam", price: "₦2,000", description: "Traditional yam dish with soup" },
    ],
  }

  const reviews = [
    {
      id: 1,
      user: "Amara Okafor",
      avatar: "A",
      rating: 5,
      date: "2 days ago",
      comment:
        "Absolutely amazing! The jollof rice was the best I've ever had. The atmosphere is so authentic and the staff are incredibly friendly. Will definitely be coming back!",
      helpful: 12,
      images: [woman.src, african.src],
    },
    {
      id: 2,
      user: "David Thompson",
      avatar: "D",
      rating: 4,
      date: "1 week ago",
      comment:
        "Great introduction to Nigerian cuisine for a tourist like me. The pepper soup was incredible, though quite spicy! The live music on Friday nights is a nice touch.",
      helpful: 8,
      images: [],
    },
    {
      id: 3,
      user: "Fatima Al-Rashid",
      avatar: "F",
      rating: 5,
      date: "2 weeks ago",
      comment:
        "This place feels like home! The traditional decorations and authentic flavors make it special. Perfect for family dinners and celebrating Nigerian culture.",
      helpful: 15,
      images: [africaa.src, mask.src],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
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
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Saved
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={place.images[currentImageIndex] || "/placeholder.svg"}
              alt={place.name}
              width={1200}
              height={400}
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* Navigation Arrows */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full"
              onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full"
              onClick={() => setCurrentImageIndex(Math.min(place.images.length - 1, currentImageIndex + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white rounded-full"
                onClick={() => setIsSaved(!isSaved)}
              >
                <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white rounded-full">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white rounded-full">
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            {/* Status Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {place.featured && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">⭐ Featured</Badge>
              )}
              {place.verified && <Badge className="bg-green-500 text-white border-0">✓ Verified</Badge>}
              <Badge className={`${place.isOpen ? "bg-green-500" : "bg-red-500"} text-white border-0`}>
                <Clock className="w-3 h-3 mr-1" />
                {place.isOpen ? "Open Now" : "Closed"}
              </Badge>
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {place.images.length}
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {place.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                  index === currentImageIndex ? "border-orange-500" : "border-gray-200"
                }`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${place.name} ${index + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{place.name}</h1>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="w-5 h-5 mr-2" />
                      {place.location}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <Star className="w-6 h-6 text-yellow-400 fill-current" />
                        <span className="text-2xl font-bold ml-2">{place.rating}</span>
                        <span className="text-gray-600 ml-2">({place.reviews} reviews)</span>
                      </div>
                      <Badge variant="outline" className="border-orange-200 text-orange-700 text-lg px-3 py-1">
                        {place.category}
                      </Badge>
                      <div className="flex items-center text-xl font-bold text-gray-900">
                        <DollarSign className="w-5 h-5" />
                        <span>{place.price}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 text-lg leading-relaxed mb-6">{place.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {place.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-orange-50 text-orange-700 border-orange-200 px-3 py-1"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {place.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <amenity.icon className="w-5 h-5 text-orange-600" />
                        <span className="text-gray-700">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="reviews" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-xl p-1">
                <TabsTrigger value="reviews" className="rounded-lg">
                  Reviews ({place.reviews})
                </TabsTrigger>
                <TabsTrigger value="menu" className="rounded-lg">
                  Menu
                </TabsTrigger>
                <TabsTrigger value="photos" className="rounded-lg">
                  Photos ({place.images.length})
                </TabsTrigger>
              </TabsList>

              {/* Reviews Tab */}
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
                    {/* Write Review */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold mb-4">Share your experience</h4>
                      <div className="flex items-center mb-4">
                        <span className="mr-3">Rating:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} onClick={() => setRating(star)} className="mr-1">
                            <Star
                              className={`w-6 h-6 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                            />
                          </button>
                        ))}
                      </div>
                      <Textarea
                        placeholder="Tell others about your experience..."
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        className="mb-4"
                        rows={4}
                      />
                      <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                        <Send className="w-4 h-4 mr-2" />
                        Post Review
                      </Button>
                    </div>

                    {/* Reviews List */}
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold">
                              {review.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h5 className="font-semibold text-gray-900">{review.user}</h5>
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
                                  <span className="text-sm text-gray-500">{review.date}</span>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Flag className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
                            {review.images.length > 0 && (
                              <div className="flex gap-2 mb-4">
                                {review.images.map((image, index) => (
                                  <Image
                                    key={index}
                                    src={image || "/placeholder.svg"}
                                    alt={`Review image ${index + 1}`}
                                    width={100}
                                    height={100}
                                    className="w-20 h-20 object-cover rounded-lg"
                                  />
                                ))}
                              </div>
                            )}
                            <div className="flex items-center space-x-4">
                              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600">
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                Helpful ({review.helpful})
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Menu Tab */}
              <TabsContent value="menu">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Menu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {place.menu.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <p className="text-gray-600 text-sm">{item.description}</p>
                          </div>
                          <span className="font-bold text-orange-600 text-lg">{item.price}</span>
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
                    <CardTitle>Photo Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {place.images.map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`${place.name} photo ${index + 1}`}
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
            {/* Contact Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-orange-600" />
                  <span>{place.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-orange-600" />
                  <span>{place.website}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-orange-600 mt-1" />
                  <span>{place.address}</span>
                </div>
                <div className="pt-4">
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 mb-2">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message Business
                  </Button>
                  <Button variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50">
                    <Calendar className="w-4 h-4 mr-2" />
                    Make Reservation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Opening Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(place.hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center">
                      <span className="capitalize font-medium">{day}</span>
                      <span className="text-gray-600">{hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Similar Places */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Similar Places</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Lagos Kitchen", rating: 4.6, image: africanDrum.src },
                    { name: "Naija Flavors", rating: 4.4, image: djembe.src },
                    { name: "African Spice", rating: 4.7, image: mask.src },
                  ].map((similar, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <Image
                        src={similar.image || "/placeholder.svg"}
                        alt={similar.name}
                        width={60}
                        height={60}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{similar.name}</h4>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm ml-1">{similar.rating}</span>
                        </div>
                      </div>
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
