"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { api } from "@/lib/api"

export type AuthUser = {
  id: string
  email: string
  name: string
  role: string
  avatarUrl?: string | null
  createdAt?: string
  updatedAt?: string
}

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  loading: boolean
  setAuth: (token: string, user: AuthUser) => void
  logout: () => void
  refreshProfile: () => Promise<AuthUser | null>
}

const TOKEN_STORAGE_KEY = "corners.accessToken"
const USER_STORAGE_KEY = "corners.user"

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY)
    const storedUser = window.localStorage.getItem(USER_STORAGE_KEY)
    if (storedToken) {
      setToken(storedToken)
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        window.localStorage.removeItem(USER_STORAGE_KEY)
      }
    }
    setLoading(false)
  }, [])

  const persistAuth = useCallback((nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken)
    setUser(nextUser)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
    }
  }, [])

  const clearAuth = useCallback(() => {
    setToken(null)
    setUser(null)
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY)
      window.localStorage.removeItem(USER_STORAGE_KEY)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!token) {
      return null
    }
    try {
      const profile = await api.get<AuthUser>("/auth/profile", { auth: token })
      persistAuth(token, profile)
      return profile
    } catch {
      clearAuth()
      return null
    }
  }, [token, persistAuth, clearAuth])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      setAuth: persistAuth,
      logout: clearAuth,
      refreshProfile,
    }),
    [user, token, loading, persistAuth, clearAuth, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}


