"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Utensils, Hotel, Music, Camera, Shield, Star, ArrowRight, Download } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Africa from "@/assets/africa.png"
import Africaa from "@/assets/africaa.png"
import "./globals.css"
import Lagos from "@/assets/lagos.jpeg"
import Captown from "@/assets/cp.jpg"
import Nairobi from "@/assets/nairobi.jpg"
import Accra from "@/assets/accra.jpg"
import Drums from "@/assets/african-drums.png"
import Mask from "@/assets/mask.png"
import Globe from "@/assets/globe.png"
import Woman from "@/assets/woman.png"


export default function HomePage() {
  const features = [
    {
      icon: Utensils,
      title: "Authentic Cuisine",
      description: "From street food to fine dining, discover the flavors that define each region of Africa.",
      color: "bg-white",
      hoverColor: "hover:bg-orange-50",
      iconColor: "text-orange-500 group-hover:text-orange-600",
      features: ["Local restaurants", "Street food guides", "Traditional recipes"],
    },
    {
      icon: Hotel,
      title: "Unique Stays",
      description: "Find accommodations that tell a story, from eco-lodges to cultural heritage sites.",
      color: "bg-white",
      hoverColor: "hover:bg-orange-50",
      iconColor: "text-orange-500 group-hover:text-orange-600",
      features: ["Boutique hotels", "Safari lodges", "Cultural homestays"],
    },
    {
      icon: Music,
      title: "Vibrant Culture",
      description: "Experience the heartbeat of Africa through music, art, and community celebrations.",
      color: "bg-white",
      hoverColor: "hover:bg-orange-50",
      iconColor: "text-orange-500 group-hover:text-orange-600",
      features: ["Live music venues", "Art galleries", "Cultural festivals"],
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Connect with locals and fellow travelers through authentic reviews and recommendations.",
      color: "bg-white",
      hoverColor: "hover:bg-orange-50",
      iconColor: "text-orange-500 group-hover:text-orange-600",
      features: ["Verified reviews", "Local insights", "Travel communities"],
    },
    {
      icon: Camera,
      title: "Visual Discovery",
      description: "Browse stunning photography and virtual tours to find your perfect destination.",
      color: "bg-white",
      hoverColor: "hover:bg-orange-50",
      iconColor: "text-orange-500 group-hover:text-orange-600",
      features: ["Photo galleries", "Virtual tours", "Menu previews"],
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Travel with confidence using our verified listings and secure booking platform.",
      color: "bg-white",
      hoverColor: "hover:bg-orange-50",
      iconColor: "text-orange-500 group-hover:text-orange-600",
      features: ["Verified businesses", "Secure payments", "24/7 support"],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-yellow-800 relative overflow-hidden">
      {/* Pattern Overlay */}
      <div className="fixed inset-0 opacity-10 pointer-events-none mix-blend-soft-light">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M0 0h40v40H0V0zm40 40h40v40H40V40zM0 40h20v20H0V40zm20 0h20v20H20V40zm40 0h20v20H60V40zm-20 0h20v20H40V40z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* Animated Background Shapes */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-500/10 rotate-45 animate-float" />
          <div className="absolute top-3/4 right-1/4 w-40 h-40 bg-orange-500/10 rotate-12 animate-float-delayed" />
          <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-red-500/10 -rotate-12 animate-float" />
        </div>
      </div>

      {/* Header */}
      <header className="bg-[#C51A00] backdrop-blur-sm shadow-lg border-b border-orange-700/50 sticky top-0 z-50">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center ">
                <Image src={Africaa} alt="Africa" width={40} height={40} className="inline-block" />
              </div>
              <div>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-300 to-yellow-400">
                  Corners
                </span>
                <div className="text-xs text-orange-200 font-medium">African Lifestyle</div>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/discover"
                className="text-orange-100 hover:text-yellow-300 transition-all duration-200 font-medium"
              >
                Discover
              </Link>
              <Link
                href="/businesses"
                className="text-orange-100 hover:text-yellow-300 transition-all duration-200 font-medium"
              >
                For Business
              </Link>
              <Link
                href="/events"
                className="text-orange-100 hover:text-yellow-300 transition-all duration-200 font-medium"
              >
                Events
              </Link>
              <Link
                href="/about"
                className="text-orange-100 hover:text-yellow-300 transition-all duration-200 font-medium"
              >
                About
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-orange-100 hover:text-yellow-300 hover:bg-orange-800/50">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-200">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 w-full h-full">
          {/* Animated gradient backgrounds */}
          <div className="absolute inset-0 bg-gradient-radial from-amber-500 via-orange-600 to-red-700 animate-gradient-slow" />
          <div className="absolute inset-0 bg-gradient-conic from-yellow-500 via-orange-600 to-red-600 mix-blend-soft-light animate-gradient-rotate" />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 via-orange-500/30 to-red-600/30 animate-gradient-pulse" />
          
          {/* Floating Orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-float-delayed" />
            <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-red-500/20 rounded-full blur-3xl animate-float-2" />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            {/* <div className="inline-flex items-center px-6 py-3 bg-orange-800/80 backdrop-blur-sm rounded-full border border-yellow-400/50 mb-8 transform hover:scale-105 transition-all duration-300">
              <span className="text-yellow-300 font-medium flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
                🌍 Discover Africa&rsquo;s Hidden Gems
              </span>
            </div> */}

            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              <div className="text-white animate-typing flex items-center justify-center gap-2">
                Your <span className="inline-flex text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-300 to-yellow-400 items-center gap-2">African <Image src={Africa} alt="Africa" width={60} height={60} className="inline-block" /></span>
              </div>
              <div className="block text-white mt-2 animate-typing-delayed text-center">
                Lifestyle Companion
              </div>
            </h1>

            <p className="text-xl md:text-2xl text-orange-100 mb-12 max-w-4xl mx-auto leading-relaxed">
             Skip the tourist traps. Corners is your gateway to the best local experiences in Africa — From buzzing nightclubs to hidden gems, connect with local businesses, and explore vibrant culture, all from one app.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link href="/discover">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-lg px-10 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-medium relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center">
                    Start Exploring
                    <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-6 rounded-xl border-2 border-yellow-400/50 text-white bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 hover:from-yellow-500/30 hover:via-orange-500/30 hover:to-red-500/30 hover:border-yellow-300 transition-all duration-300 backdrop-blur-sm group shadow-lg hover:shadow-yellow-500/20"
              >
                <Download className="mr-2 w-5 h-5 transform group-hover:scale-110 transition-transform duration-300" />
                Download App
              </Button>
            </div>

            {/* Category Slider */}
            <div className="mt-16 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden relative group">
              {/* Gradient Overlays for Slider */}
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-orange-900 to-transparent z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-orange-900 to-transparent z-10"></div>
              
              <div className="flex animate-scroll-slow hover:pause">
                {[
                  {
                    id: "restaurants",
                    name: "Restaurants",
                    icon: "🍽️",
                    description: "Authentic local cuisine",
                    image: Lagos
                  },
                  {
                    id: "hotels",
                    name: "Hotels & Lodges",
                    icon: "🏨",
                    description: "Unique accommodations",
                    image: Captown
                  },
                  {
                    id: "nightlife",
                    name: "Nightlife",
                    icon: "🌙",
                    description: "Vibrant entertainment",
                    image: Nairobi
                  },
                  {
                    id: "culture",
                    name: "Cultural Sites",
                    icon: "🎭",
                    description: "Rich heritage experiences",
                    image: Accra
                  },
                  {
                    id: "shopping",
                    name: "Markets & Shopping",
                    icon: "🛍️",
                    description: "Local crafts & goods",
                    image: Mask
                  },
                  {
                    id: "outdoor",
                    name: "Outdoor Adventures",
                    icon: "🌳",
                    description: "Nature & wildlife",
                    image: Globe
                  },
                  {
                    id: "wellness",
                    name: "Wellness & Spa",
                    icon: "🧘",
                    description: "Relaxation & healing",
                    image: Woman
                  },
                  {
                    id: "events",
                    name: "Events & Festivals",
                    icon: "🎉",
                    description: "Cultural celebrations",
                    image: Drums
                  },
                ].map((category) => (
                  <div
                    key={`first-${category.id}`}
                    className="flex-shrink-0 w-72 p-8 mx-2 relative overflow-hidden bg-orange-800/60 backdrop-blur-md rounded-2xl border-2 border-transparent hover:border-yellow-400 transition-all duration-300 hover:scale-[0.98] cursor-pointer group hover:bg-orange-800/80"
                  >
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-orange-800/80 to-orange-900/90" />
                    </div>
                    <div className="text-center relative z-10">
                      <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                      <h4 className="text-white font-semibold mb-2 text-base group-hover:text-yellow-300 transition-colors duration-300">{category.name}</h4>
                      <p className="text-orange-200 text-sm">{category.description}</p>
                    </div>
                  </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {[
                  {
                    id: "restaurants",
                    name: "Restaurants",
                    icon: "🍽️",
                    description: "Authentic local cuisine",
                    image: Lagos
                  },
                  {
                    id: "hotels",
                    name: "Hotels & Lodges",
                    icon: "🏨",
                    description: "Unique accommodations",
                    image: Captown
                  },
                  {
                    id: "nightlife",
                    name: "Nightlife",
                    icon: "🌙",
                    description: "Vibrant entertainment",
                    image: Nairobi
                  },
                  {
                    id: "culture",
                    name: "Cultural Sites",
                    icon: "🎭",
                    description: "Rich heritage experiences",
                    image: Accra
                  },
                  {
                    id: "shopping",
                    name: "Markets & Shopping",
                    icon: "🛍️",
                    description: "Local crafts & goods",
                    image: Mask
                  },
                  {
                    id: "outdoor",
                    name: "Outdoor Adventures",
                    icon: "🌳",
                    description: "Nature & wildlife",
                    image: Globe
                  },
                  {
                    id: "wellness",
                    name: "Wellness & Spa",
                    icon: "🧘",
                    description: "Relaxation & healing",
                    image: Woman
                  },
                  {
                    id: "events",
                    name: "Events & Festivals",
                    icon: "🎉",
                    description: "Cultural celebrations",
                    image: Drums
                  },
                ].map((category) => (
                  <div
                    key={`second-${category.id}`}
                    className="flex-shrink-0 w-72 p-8 mx-2 relative overflow-hidden bg-orange-800/60 backdrop-blur-md rounded-2xl border-2 border-transparent hover:border-yellow-400 transition-all duration-300 hover:scale-[0.98] cursor-pointer group hover:bg-orange-800/80"
                  >
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-orange-800/80 to-orange-900/90" />
                    </div>
                    <div className="text-center relative z-10">
                      <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                      <h4 className="text-white font-semibold mb-2 text-base group-hover:text-yellow-300 transition-colors duration-300">{category.name}</h4>
                      <p className="text-orange-200 text-sm">{category.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge
              variant="secondary"
              className="mb-4 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-orange-700 border border-orange-200/50 backdrop-blur-sm"
            >
              ✨ Everything You Need
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Africa</span> Like Never Before
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover, connect, and experience the rich culture and vibrant lifestyle across the continent with our
              comprehensive platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`${feature.color} backdrop-blur-sm border-2 border-transparent rounded-3xl shadow-sm hover:shadow-lg hover:border-amber-400/50 transition-all duration-500 group animate-float ${feature.hoverColor}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300 group-hover:scale-110`}>
                    <feature.icon className={`w-8 h-8 ${feature.iconColor} transition-colors duration-300`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 text-center group-hover:text-orange-500 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600 text-center mb-6 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-500 group-hover:text-orange-600 transition-colors duration-300">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="mb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center">
            <Badge
              variant="secondary"
              className="mb-3 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-orange-700 border border-orange-200/50 backdrop-blur-sm text-sm"
            >
              🌟 Popular Destinations
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Amazing</span> Places
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Explore the most loved spots across Africa, curated by our community of explorers
            </p>
          </div>
        </div>

        {/* Full-width Destinations Slider */}
        <div className="relative overflow-hidden w-full">
          {/* Gradient Overlays - more subtle */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-amber-50 to-transparent z-10 opacity-30" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-amber-50 to-transparent z-10 opacity-30" />
          
          <div className="flex gap-6 animate-scroll-slow hover:pause px-4">
            {[
              {
                name: "Lagos",
                country: "Nigeria",
                spots: "2,847 spots",
                image: Lagos,
                rating: 4.8,
                highlight: "Vibrant nightlife & cuisine",
              },
              {
                name: "Cape Town",
                country: "South Africa",
                spots: "1,923 spots",
                image: Captown,
                rating: 4.9,
                highlight: "Stunning landscapes & wine",
              },
              {
                name: "Nairobi",
                country: "Kenya",
                spots: "1,456 spots",
                image: Nairobi,
                rating: 4.7,
                highlight: "Safari & urban culture",
              },
              {
                name: "Accra",
                country: "Ghana",
                spots: "987 spots",
                image: Accra,
                rating: 4.6,
                highlight: "Rich history & beaches",
              },
              // Duplicate destinations for continuous scroll
              {
                name: "Lagos",
                country: "Nigeria",
                spots: "2,847 spots",
                image: Lagos,
                rating: 4.8,
                highlight: "Vibrant nightlife & cuisine",
              },
              {
                name: "Cape Town",
                country: "South Africa",
                spots: "1,923 spots",
                image: Captown,
                rating: 4.9,
                highlight: "Stunning landscapes & wine",
              },
              {
                name: "Nairobi",
                country: "Kenya",
                spots: "1,456 spots",
                image: Nairobi,
                rating: 4.7,
                highlight: "Safari & urban culture",
              },
              {
                name: "Accra",
                country: "Ghana",
                spots: "987 spots",
                image: Accra,
                rating: 4.6,
                highlight: "Rich history & beaches",
              },
            ].map((destination, index) => (
              <Card
                key={index}
                className="flex-shrink-0 w-[400px] border-2 border-transparent shadow-md hover:shadow-lg hover:border-amber-400/50 transition-all duration-500 cursor-pointer group overflow-hidden transform hover:-translate-y-1"
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <Image
                      src={destination.image}
                      alt={destination.name}
                      width={400}
                      height={300}
                      className="w-full h-[400px] object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 text-gray-900 border-0 shadow-sm group-hover:bg-yellow-400 transition-colors duration-300 text-sm">
                        <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
                        {destination.rating}
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                        {destination.name}
                      </h3>
                      <p className="text-base text-orange-200 font-medium mb-2">{destination.country}</p>
                      <p className="text-sm text-white/90 mb-3">{destination.spots}</p>
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 px-3 py-1.5 text-sm">
                          {destination.highlight}
                        </Badge>
                        <Button size="sm" variant="secondary" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4">
                          Explore
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Link href="/discover">
            <Button
              size="lg"
              variant="outline"
              className="px-6 py-4 text-base border-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 rounded-xl"
            >
              Explore All Destinations
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      {/* <section className="py-24 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge
              variant="secondary"
              className="mb-4 px-4 py-2 bg-gray-100 text-gray-600 border-none font-medium"
            >
              💬 What People Say
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Loved by Explorers</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Amara Okafor",
                location: "Lagos, Nigeria",
                text: "Corners helped me discover amazing local restaurants I never knew existed in my own city!",
                rating: 5,
                avatar: "A",
              },
              {
                name: "David Thompson",
                location: "Tourist from UK",
                text: "The best travel companion for exploring Africa. Authentic recommendations from real locals.",
                rating: 5,
                avatar: "D",
              },
              {
                name: "Fatima Al-Rashid",
                location: "Cairo, Egypt",
                text: "As a business owner, Corners has connected me with so many new customers. Incredible platform!",
                rating: 5,
                avatar: "F",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-500 group animate-float"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-orange-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-gray-500 text-sm">{testimonial.location}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-16 left-16 w-64 h-64 bg-orange-100 rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 right-16 w-96 h-96 bg-orange-100 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <Badge
            variant="secondary"
            className="mb-3 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-orange-700 border border-orange-200/50 backdrop-blur-sm text-sm"
          >
            🚀 Get Started Today
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">African</span> Adventure
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Join thousands of explorers already using Corners to discover amazing places across Africa. Your journey starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-10 py-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
              >
                Join Free Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/businesses">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-4 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-300"
              >
                List Your Business
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gradient-to-br from-orange-900 via-red-900 to-yellow-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M0 0h40v40H0V0zm40 40h40v40H40V40zM0 40h20v20H0V40zm20 0h20v20H20V40zm40 0h20v20H60V40zm-20 0h20v20H40V40z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-xl flex items-center justify-center shadow-lg">
                  <Image src={Africa} alt="Africa" width={32} height={32} className="inline-block" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Corners</h3>
                  <p className="text-orange-200 text-sm">African Lifestyle</p>
                </div>
              </div>
              <p className="text-orange-200/80">
                Discover authentic African experiences, from local cuisine to cultural celebrations.
              </p>
              <div className="flex space-x-4">
                <Button size="icon" variant="ghost" className="rounded-full hover:bg-white/10 text-orange-200 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full hover:bg-white/10 text-orange-200 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full hover:bg-white/10 text-orange-200 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
              <ul className="space-y-4">
                {['Discover', 'About Us', 'For Business', 'Events'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-orange-200 hover:text-white transition-colors duration-200">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Categories</h4>
              <ul className="space-y-4">
                {['Restaurants', 'Hotels & Lodges', 'Cultural Sites', 'Nightlife', 'Shopping'].map((item) => (
                  <li key={item}>
                    <Link href={`/category/${item.toLowerCase().replace(' ', '-')}`} className="text-orange-200 hover:text-white transition-colors duration-200">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Stay Updated</h4>
              <p className="text-orange-200/80 mb-4">
                Subscribe to our newsletter for the latest African experiences and travel tips.
              </p>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/10 border-orange-400/20 text-white placeholder:text-orange-200/50 focus:border-orange-300"
                />
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-orange-400/20">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-orange-200/80 text-sm mb-4 md:mb-0">
                © 2024 Corners. Made with ❤️ for Africa.
              </p>
              <div className="flex space-x-6">
                <Link href="/privacy" className="text-orange-200 hover:text-white text-sm transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-orange-200 hover:text-white text-sm transition-colors duration-200">
                  Terms of Service
                </Link>
                <Link href="/contact" className="text-orange-200 hover:text-white text-sm transition-colors duration-200">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
