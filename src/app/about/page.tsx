"use client"

import Link from "next/link"
import { Heart, Globe, Users, MapPin, ArrowRight, Target, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"

const values = [
  {
    icon: Heart,
    title: "Authenticity",
    description: "We celebrate the real, unfiltered experiences that make Africa unique. Every listing is verified to ensure authenticity.",
  },
  {
    icon: Globe,
    title: "Community",
    description: "Built by locals, for everyone. We connect travelers with authentic experiences while supporting local businesses.",
  },
  {
    icon: Users,
    title: "Inclusivity",
    description: "Corners is for everyone - whether you're a local explorer or an international traveler discovering Africa for the first time.",
  },
  {
    icon: Shield,
    title: "Trust",
    description: "Verified businesses, authentic reviews, and secure bookings. Your safety and satisfaction are our top priorities.",
  },
]

const mission = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To make authentic African experiences accessible to everyone while supporting local businesses and preserving cultural heritage.",
  },
  {
    icon: Zap,
    title: "Our Vision",
    description: "To become the leading platform connecting people with the vibrant culture, rich history, and amazing experiences across Africa.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Corners</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We&apos;re on a mission to showcase the authentic beauty, culture, and experiences that make Africa extraordinary. 
              Join us in discovering the hidden gems and vibrant lifestyle across the continent.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {mission.map((item, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-600">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at Corners
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-600">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <MapPin className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Our Story
                </h2>
              </div>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Corners was born from a simple idea: to create a platform that celebrates the authentic experiences 
                  that make Africa unique. We noticed that travelers and locals alike were struggling to find genuine, 
                  verified places that truly represent the rich culture and vibrant lifestyle across the continent.
                </p>
                <p>
                  Today, Corners connects thousands of explorers with authentic restaurants, unique accommodations, 
                  cultural experiences, and local businesses. We&apos;re proud to support local entrepreneurs while 
                  helping people discover the hidden gems that make Africa extraordinary.
                </p>
                <p>
                  Whether you&apos;re a local looking to explore your own backyard or a traveler discovering Africa 
                  for the first time, Corners is your trusted companion for authentic experiences.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-orange-500 to-red-500">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Join the Corners Community
              </h2>
              <p className="text-xl text-orange-100 mb-8">
                Start exploring authentic African experiences today, or list your business and connect with thousands of explorers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-orange-50 font-semibold"
                  asChild
                >
                  <Link href="/discover">
                    Start Exploring
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 font-semibold"
                  asChild
                >
                  <Link href="/businesses">
                    For Business
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

