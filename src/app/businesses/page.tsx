"use client"

import Link from "next/link"
import { Building2, Users, BarChart3, CheckCircle, Star, Globe, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"

const services = [
  {
    icon: Building2,
    title: "Business Listings",
    description: "Showcase your business to thousands of explorers looking for authentic African experiences. Get verified and featured in search results.",
  },
  {
    icon: Users,
    title: "Customer Engagement",
    description: "Connect directly with customers through our messaging system. Respond to reviews, manage reservations, and build your community.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track your business performance with detailed analytics. See views, reviews, reservations, and customer engagement metrics.",
  },
  {
    icon: Star,
    title: "Review Management",
    description: "Build trust with authentic customer reviews. Respond to feedback and showcase your best ratings to attract more visitors.",
  },
  {
    icon: Globe,
    title: "Increased Visibility",
    description: "Reach a wider audience of travelers and locals. Get discovered by people searching for experiences in your area.",
  },
  {
    icon: CheckCircle,
    title: "Verified Badge",
    description: "Stand out with a verified badge that shows customers you&apos;re a trusted business. Build credibility and attract more bookings.",
  },
]

const benefits = [
  "Free business profile setup",
  "Easy listing management dashboard",
  "Direct customer messaging",
  "Reservation management system",
  "Performance analytics",
  "Marketing support",
]

export default function ForBusinessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Grow Your Business with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Corners</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Join thousands of businesses across Africa connecting with travelers and locals. 
              Showcase your authentic experiences and grow your customer base.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-base px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 mt-10"
              asChild
            >
              <Link href="/register">
                Register Your Business
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools you need to manage your business and connect with customers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {services.map((service, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-orange-500 to-red-500">
            <CardContent className="p-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Why Choose Corners?
                  </h2>
                  <p className="text-xl text-orange-100 mb-8">
                    Join a platform designed specifically for African businesses. 
                    We understand your needs and provide tools tailored to help you succeed.
                  </p>
                  <Button
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-orange-50 font-semibold"
                    asChild
                  >
                    <Link href="/register">
                      Get Started Today
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                      <p className="text-white font-medium">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ready to Grow Your Business?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join Corners today and start connecting with customers across Africa
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                asChild
              >
                <Link href="/register">
                  Register Your Business
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section> */}
    </div>
  )
}

