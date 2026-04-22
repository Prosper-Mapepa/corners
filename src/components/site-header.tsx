"use client"

import { useCallback, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/auth/logout-button"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import Africaa from "@/assets/africaa.png"

export type SiteHeaderVariant = "explorer" | "business" | "admin"

type SiteHeaderProps = {
  /** explorer = public app (discover, profile, …); business / admin = dashboard shells */
  variant?: SiteHeaderVariant
}

const navLinkClass = (active: boolean) =>
  cn(
    "whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-semibold text-white/95 tracking-wide transition-all duration-200 sm:px-3 sm:text-[15px]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#C51A00]",
    active
      ? "bg-white/20 text-yellow-200 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]"
      : "hover:bg-white/15 hover:text-yellow-200"
  )

const iconCircleClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white/40 bg-white/15 text-white shadow-sm transition-all hover:border-yellow-200/70 hover:bg-white/22 hover:text-yellow-100"

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const active = pathname === href || (href !== "/" && pathname.startsWith(href))
  return (
    <Link href={href} className={navLinkClass(active)}>
      {children}
    </Link>
  )
}

export function SiteHeader({ variant = "explorer" }: SiteHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const showExplorerExtras =
    variant === "explorer" &&
    user &&
    !["business", "admin", "super_admin"].includes(user.role)

  const handleSearch = useCallback(() => {
    if (pathname === "/") {
      document.getElementById("hero-search")?.scrollIntoView({ behavior: "smooth", block: "center" })
      window.setTimeout(() => {
        document.getElementById("hero-search-input")?.focus({ preventScroll: true })
      }, 320)
      return
    }
    if (pathname.startsWith("/discover")) {
      document.getElementById("discover-search")?.scrollIntoView({ behavior: "smooth", block: "start" })
      window.setTimeout(() => {
        document.getElementById("discover-search-input")?.focus({ preventScroll: true })
      }, 320)
      return
    }
    router.push("/discover")
  }, [pathname, router])

  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? "U"

  const searchBtn = (mobile = false) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(iconCircleClass, "shadow-black/20", mobile && "h-10 w-10")}
      aria-label="Search places and experiences"
      onClick={() => {
        handleSearch()
        setMobileOpen(false)
      }}
    >
      <Search className={mobile ? "h-5 w-5" : "h-[1.15rem] w-[1.15rem]"} strokeWidth={2.75} />
    </Button>
  )

  const profileAvatar = () => (
    <Link
      href={variant === "business" ? "/business/profile" : "/profile"}
      className={cn(iconCircleClass, "bg-gradient-to-br from-amber-500 to-red-600 font-semibold shadow-black/20")}
      aria-label="Profile"
    >
      {userInitial}
    </Link>
  )

  const centerNav = () => {
    if (variant === "business") {
      return (
        <>
          <NavLink href="/business/dashboard">Dashboard</NavLink>
          <NavLink href="/business/profile">Profile</NavLink>
        </>
      )
    }
    if (variant === "admin") {
      return <NavLink href="/admin">Admin</NavLink>
    }
    return (
      <>
        <NavLink href="/discover">DISCOVER</NavLink>
        <NavLink href="/businesses">BUSINESS</NavLink>
        <NavLink href="/events">EVENTS</NavLink>
        <NavLink href="/about">ABOUT</NavLink>
        {showExplorerExtras && (
          <>
            <NavLink href="/profile">Profile</NavLink>
            <NavLink href="/saved">Saved</NavLink>
          </>
        )}
      </>
    )
  }

  const rightDesktop = () => {
    if (variant === "business" || variant === "admin") {
      return (
        <>
          {profileAvatar()}
          <LogoutButton
            variant="ghost"
            size="sm"
            className="h-10 shrink-0 rounded-full px-4 text-sm font-semibold text-white hover:bg-white/15 hover:text-yellow-200"
          />
        </>
      )
    }

    if (user) {
      return (
        <>
          {profileAvatar()}
          <LogoutButton
            variant="ghost"
            size="sm"
            className="h-10 shrink-0 rounded-full px-4 text-sm font-semibold text-white hover:bg-white/15 hover:text-yellow-200"
          />
        </>
      )
    }

    return (
      <>
        <Link href="/login">
          <Button
            variant="ghost"
            className="h-10 rounded-full px-4 text-sm font-semibold text-white hover:bg-white/15 hover:text-yellow-200 sm:text-[15px]"
          >
            Sign In
          </Button>
        </Link>
        <Link href="/register">
          <Button className="h-10 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-5 text-sm font-semibold shadow-md hover:from-amber-600 hover:via-orange-600 hover:to-red-700 sm:text-[15px]">
            Get Started
          </Button>
        </Link>
      </>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-orange-800/35 bg-[#C51A00] shadow-md backdrop-blur-sm">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-10">
        {/* Desktop: balanced columns so nav stays visually centered */}
        <div className="hidden h-16 items-center md:grid md:grid-cols-[1fr_auto_1fr] md:gap-x-6 lg:gap-x-8">
          <div className="flex min-w-0 items-center justify-self-start">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center sm:h-10 sm:w-10">
                <Image src={Africaa} alt="" width={40} height={40} className="object-contain" />
              </div>
              <div className="min-w-0 leading-none">
                <span className="block bg-gradient-to-r from-yellow-200 via-amber-200 to-yellow-300 bg-clip-text text-lg font-bold tracking-tight text-transparent sm:text-xl">
                  Corners
                </span>
                <span className="mt-0.5 hidden text-[11px] font-medium text-orange-100/90 sm:block">
                  African Lifestyle
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex items-center justify-center gap-0.5 sm:gap-1 justify-self-center">
            {centerNav()}
          </nav>

          <div className="flex items-center justify-end gap-2 justify-self-end lg:gap-2.5">
            {searchBtn(false)}
            {rightDesktop()}
          </div>
        </div>

        {/* Mobile */}
        <div className="flex h-16 items-center justify-between gap-3 md:hidden">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
              <Image src={Africaa} alt="" width={36} height={36} className="object-contain" />
            </div>
            <div className="leading-none">
              <span className="block bg-gradient-to-r from-yellow-200 via-amber-200 to-yellow-300 bg-clip-text text-lg font-bold text-transparent">
                Corners
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {searchBtn(true)}
            <Button
              variant="ghost"
              size="icon"
              className={cn(iconCircleClass, "border-white/35 bg-white/10")}
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" strokeWidth={2.5} /> : <Menu className="h-5 w-5" strokeWidth={2.5} />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/10 py-3 md:hidden">
            <nav className="flex flex-col gap-0.5">
              <Button
                type="button"
                variant="ghost"
                className="h-11 w-full justify-start gap-3 rounded-lg px-3 text-[15px] font-semibold text-white hover:bg-white/12"
                onClick={() => {
                  setMobileOpen(false)
                  handleSearch()
                }}
              >
                <span className={cn(iconCircleClass, "h-9 w-9 border-white/35")}>
                  <Search className="h-4 w-4" strokeWidth={2.75} aria-hidden />
                </span>
                Search
              </Button>
              {variant === "business" ? (
                <>
                  <Link
                    href="/business/dashboard"
                    className="rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white hover:bg-white/12"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/business/profile"
                    className="rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white hover:bg-white/12"
                    onClick={() => setMobileOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              ) : variant === "admin" ? (
                <Link
                  href="/admin"
                  className="rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white hover:bg-white/12"
                  onClick={() => setMobileOpen(false)}
                >
                  Admin
                </Link>
              ) : (
                <>
                  <Link
                    href="/discover"
                    className="rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white hover:bg-white/12"
                    onClick={() => setMobileOpen(false)}
                  >
                    Discover
                  </Link>
                  <Link
                    href="/businesses"
                    className="rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white hover:bg-white/12"
                    onClick={() => setMobileOpen(false)}
                  >
                    For Business
                  </Link>
                  <Link
                    href="/events"
                    className="rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white hover:bg-white/12"
                    onClick={() => setMobileOpen(false)}
                  >
                    Events
                  </Link>
                  <Link
                    href="/about"
                    className="rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white hover:bg-white/12"
                    onClick={() => setMobileOpen(false)}
                  >
                    About
                  </Link>
                  {showExplorerExtras && (
                    <>
                      <Link
                        href="/profile"
                        className="rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white hover:bg-white/12"
                        onClick={() => setMobileOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/saved"
                        className="rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white hover:bg-white/12"
                        onClick={() => setMobileOpen(false)}
                      >
                        Saved
                      </Link>
                    </>
                  )}
                </>
              )}

              <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
                {variant === "explorer" && user ? (
                  <LogoutButton
                    variant="ghost"
                    className="h-11 w-full justify-start rounded-lg px-3 text-[15px] font-semibold text-white hover:bg-white/12"
                  />
                ) : variant === "business" || variant === "admin" ? (
                  <LogoutButton
                    variant="ghost"
                    className="h-11 w-full justify-start rounded-lg px-3 text-[15px] font-semibold text-white hover:bg-white/12"
                  />
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <Button
                        variant="ghost"
                        className="h-11 w-full justify-start rounded-lg px-3 text-[15px] font-semibold text-white hover:bg-white/12"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      <Button className="h-11 w-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 font-semibold hover:from-amber-600 hover:via-orange-600 hover:to-red-700">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
