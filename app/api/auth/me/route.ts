import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { findUserById } from "@/lib/models/user.model"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    console.log("[v0] /api/auth/me - Token present:", !!token)

    if (!token) {
      console.log("[v0] /api/auth/me - No token found")
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const decoded = verify(token, JWT_SECRET) as { userId: number }
    console.log("[v0] /api/auth/me - Token valid, userId:", decoded.userId)
    
    const user = await findUserById(decoded.userId)
    console.log("[v0] /api/auth/me - User found:", user ? user.id : "null")

    if (!user) {
      console.log("[v0] /api/auth/me - User not found in database")
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    // 移除敏感信息
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("[v0] /api/auth/me - Error:", error)
    const errorMessage = error instanceof Error ? error.message : "未知错误"
    return NextResponse.json({ 
      error: "认证失败",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }, { status: 401 })
  }
}
