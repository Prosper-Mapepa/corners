"use client"

import Link from "next/link"
import Image from "next/image"
import { Calendar, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Footer } from "@/components/footer"
import Africaa from "@/assets/africaa.png"

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-[#C51A00] backdrop-blur-sm shadow-lg border-b border-orange-700/50 sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
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
                className="text-orange-100 hover:text-yellow-300 transition-all duration-200 font-semibold"
              >
                Discover
              </Link>
              <Link
                href="/businesses"
                className="text-orange-100 hover:text-yellow-300 transition-all duration-200 font-semibold"
              >
                For Business
              </Link>
              <Link
                href="/events"
                className="text-orange-100 hover:text-yellow-300 transition-all duration-200 font-semibold"
              >
                Events
              </Link>
              <Link
                href="/about"
                className="text-orange-100 hover:text-yellow-300 transition-all duration-200 font-semibold"
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

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-8xl mx-auto text-center">
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardContent className="p-12">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Events Coming Soon
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                We&apos;re working on bringing you the best cultural events, festivals, and celebrations across Africa. 
                Stay tuned for exciting updates!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600"
                  asChild
                >
                  <Link href="/discover">
                    Explore Places
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                  asChild
                >
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}

