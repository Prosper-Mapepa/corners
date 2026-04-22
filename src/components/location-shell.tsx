"use client"

import type { ReactNode } from "react"
import { LocationPermissionModal } from "@/components/location-permission-modal"
import { LocationProvider } from "@/providers/location-provider"

export function AppLocationShell({ children }: { children: ReactNode }) {
  return (
    <LocationProvider>
      <LocationPermissionModal />
      {children}
    </LocationProvider>
  )
}
