"use client"

import { SiteHeader, type SiteHeaderVariant } from "@/components/site-header"

type DashboardNavProps = {
  variant?: SiteHeaderVariant
}

/** @deprecated Prefer importing `SiteHeader` directly; kept for existing pages. */
export function DashboardNav({ variant = "explorer" }: DashboardNavProps) {
  return <SiteHeader variant={variant} />
}
