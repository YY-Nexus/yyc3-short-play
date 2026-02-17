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

  async function login(phone: string, code: string): Promise<boolean> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      })

      console.log("[v0] 登录API响应状态:", response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error("[v0] 登录API错误:", error)
        throw new Error(error.error || "登录失败")
      }

      const data = await response.json()
      console.log("[v0] 登录API成功返回用户数据:", data)

      if (data.user) {
        setUser(data.user)
        console.log("[v0] 用户状态已更新:", data.user)
        return true
      } else {
        throw new Error("未返回用户数据")
      }
    } catch (error: any) {
      console.error("[v0] Context登录异常:", error.message)
      throw error
    }
  }

  async function register(username: string, phone: string, code: string) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, phone, code }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "注册失败")
    }

    const data = await response.json()
    setUser(data.user)

    setTimeout(() => {
      router.push("/main")
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
