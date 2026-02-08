"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  username: string
  phone: string
  email?: string
  avatar?: string
  level: string
  star_coins: number
  is_local_user: boolean
  user_type: "normal" | "creator" | "vip"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (phone: string, code: string) => Promise<void>
  register: (username: string, phone: string, code: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 初始化时获取用户信息
  useEffect(() => {
    fetchUser()
  }, [])

  async function fetchUser() {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("获取用户信息失败:", error)
    } finally {
      setLoading(false)
    }
  }

  async function login(phone: string, code: string) {
    console.log("[v0] Auth context login called:", { phone, code })
    
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
      credentials: "include", // 确保cookie被正确处理
    })

    console.log("[v0] Login response status:", response.status)

    if (!response.ok) {
      const error = await response.json()
      console.error("[v0] Login failed:", error)
      throw new Error(error.error || "登录失败")
    }

    const data = await response.json()
    console.log("[v0] Login successful, user:", data.user?.id)
    setUser(data.user)

    // 使用window.location.href进行完整的页面导航，确保cookie生效
    setTimeout(() => {
      console.log("[v0] Redirecting to /main via window.location")
      window.location.href = "/main"
    }, 1500)
  }

  async function register(username: string, phone: string, code: string) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, phone, code }),
      credentials: "include", // 确保cookie被正确处理
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "注册失败")
    }

    const data = await response.json()
    setUser(data.user)

    setTimeout(() => {
      window.location.href = "/main"
    }, 1500)
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    router.push("/auth")
  }

  async function refreshUser() {
    await fetchUser()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
