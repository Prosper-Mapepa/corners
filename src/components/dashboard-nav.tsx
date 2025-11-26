"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, Building2, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/auth/logout-button"
import { useAuth } from "@/hooks/use-auth"

type DashboardNavProps = {
  variant?: "explorer" | "business" | "admin"
}

export function DashboardNav({ variant = "explorer" }: DashboardNavProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? "U"
  
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  const getRoleBadge = () => {
    switch (variant) {
      case "business":
        return <Badge variant="secondary">Business</Badge>
      case "admin":
        return <Badge variant="secondary">Admin</Badge>
      default:
        return null
    }
  }

  const getNavLinks = () => {
    switch (variant) {
      case "business":
        return (
          <>
            <Link 
              href="/business/dashboard" 
              className={isActive("/business/dashboard") ? "text-orange-600 font-semibold" : "text-gray-700 hover:text-orange-600 transition-colors font-semibold"}
            >
              Dashboard
            </Link>
            <Link 
              href="/business/profile" 
              className={isActive("/business/profile") ? "text-orange-600 font-semibold" : "text-gray-700 hover:text-orange-600 transition-colors font-semibold"}
            >
              Profile
            </Link>
          </>
        )
      case "admin":
        return (
          <>
            {/* <Link 
              href="/admin" 
              className={isActive("/admin") ? "text-orange-600 font-semibold" : "text-gray-700 hover:text-orange-600 transition-colors font-semibold"}
            >
              Dashboard
            </Link> */}
          </>
        )
      default: // explorer
        return (
          <>
            <Link 
              href="/discover" 
              className={isActive("/discover") ? "text-orange-600 font-semibold" : "text-gray-700 hover:text-orange-600 transition-colors font-semibold"}
            >
              Discover
            </Link>
            {user && (
              <>
                <Link 
                  href="/profile" 
                  className={isActive("/profile") ? "text-orange-600 font-semibold" : "text-gray-700 hover:text-orange-600 transition-colors font-semibold"}
                >
                  Profile
                </Link>
                <Link 
                  href="/saved" 
                  className={isActive("/saved") ? "text-orange-600 font-semibold" : "text-gray-700 hover:text-orange-600 transition-colors font-semibold"}
                >
                  Saved
                </Link>
              </>
            )}
            <Link 
              href="/events" 
              className={isActive("/events") ? "text-orange-600 font-semibold" : "text-gray-700 hover:text-orange-600 transition-colors font-semibold"}
            >
              Events
            </Link>
          </>
        )
    }
  }

  const getRightSideContent = () => {
    if (!user) {
      return (
        <>
          <Button variant="ghost" size="sm" className="hover:bg-orange-50" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            asChild
          >
            <Link href="/register">Join Corners</Link>
          </Button>
        </>
      )
    }

    if (variant === "explorer") {
      return (
        <>
          <Button variant="ghost" size="sm" className="hover:bg-orange-50" asChild>
            <Link href="/saved">
              <Heart className="w-4 h-4 mr-2" />
              Saved
            </Link>
          </Button>
          <Link
            href="/profile"
            className="w-9 h-9 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold"
          >
            {userInitial}
          </Link>
          <LogoutButton variant="ghost" size="sm" className="hover:bg-orange-50">
            Log out
          </LogoutButton>
        </>
      )
    }

    // Business and Admin
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
          {userInitial}
        </div>
        <LogoutButton variant="link" className="text-sm text-gray-600">
          Log out
        </LogoutButton>
      </div>
    )
  }

  const getIcon = () => {
    if (variant === "admin") {
      return <Building2 className="w-5 h-5 text-white" />
    }
    return <MapPin className="w-5 h-5 text-white" />
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              {getIcon()}
            </div>
            <span className="text-2xl font-bold text-gray-900">Corners</span>
            {getRoleBadge()}
          </Link>
          <nav className="hidden md:flex space-x-8">{getNavLinks()}</nav>
          <div className="flex items-center space-x-4">{getRightSideContent()}</div>
        </div>
      </div>
    </header>
  )
}

