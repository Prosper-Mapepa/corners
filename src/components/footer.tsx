"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Africa from "@/assets/africa.png"

const quickLinks: { label: string; href: string }[] = [
  { label: "Discover", href: "/discover" },
  { label: "About Us", href: "/about" },
  { label: "For Business", href: "/businesses" },
  { label: "Events", href: "/events" },
]

/** Discover filters by search tokens; these terms match typical category names in the API. */
const categoryLinks: { label: string; q: string }[] = [
  { label: "Restaurants", q: "restaurants" },
  { label: "Hotels & Lodges", q: "hotels" },
  { label: "Cultural Sites", q: "cultural" },
  { label: "Nightlife", q: "nightlife" },
  { label: "Shopping", q: "shopping" },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-orange-900 via-red-900 to-yellow-900 py-12">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M0 0h40v40H0V0zm40 40h40v40H40V40zM0 40h20v20H0V40zm20 0h20v20H20V40zm40 0h20v20H60V40zm-20 0h20v20H40V40z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-10" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 shadow-lg">
                <Image src={Africa} alt="Africa" width={32} height={32} className="inline-block" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Corners</h3>
                <p className="text-sm text-orange-200">African Lifestyle</p>
              </div>
            </div>
            <p className="text-orange-200/80">
              Discover authentic African experiences, from local cuisine to cultural celebrations.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold text-white sm:mb-6">Quick Links</h4>
            <ul className="space-y-3 sm:space-y-4">
              {quickLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-orange-200 transition-colors duration-200 hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold text-white sm:mb-6">Categories</h4>
            <ul className="space-y-3 sm:space-y-4">
              {categoryLinks.map(({ label, q }) => (
                <li key={label}>
                  <Link
                    href={`/discover?q=${encodeURIComponent(q)}`}
                    className="text-orange-200 transition-colors duration-200 hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold text-white sm:mb-6">Stay Updated</h4>
            <p className="mb-4 text-orange-200/80">
              Subscribe to our newsletter for the latest African experiences and travel tips.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <Input
                type="email"
                placeholder="Enter your email"
                className="min-h-11 border-orange-400/20 bg-white/10 text-white placeholder:text-orange-200/50 focus-visible:border-orange-300 sm:min-w-0 sm:flex-1"
              />
              <Button
                type="button"
                className="h-11 shrink-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 sm:h-auto sm:px-5"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-orange-400/20 pt-8 sm:mt-12">
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
            <p className="text-sm text-orange-200/80">
              © {new Date().getFullYear()} Corners. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
