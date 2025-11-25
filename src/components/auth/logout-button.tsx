"use client"

import { Button, type ButtonProps } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

type LogoutButtonProps = ButtonProps & {
  redirectTo?: string
}

export function LogoutButton({
  redirectTo = "/login",
  children = "Log out",
  ...props
}: LogoutButtonProps) {
  const router = useRouter()
  const { logout } = useAuth()

  const handleClick = () => {
    logout()
    router.push(redirectTo)
  }

  return (
    <Button type="button" onClick={handleClick} {...props}>
      {children}
    </Button>
  )
}


