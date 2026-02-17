import { type NextRequest, NextResponse } from "next/server"
import { sign } from "jsonwebtoken"
import { findUserByPhone, updateLastLogin } from "@/lib/models/user.model"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

/**
 * 密码登录接口
 * POST /api/auth/login-with-password
 * 
 * 请求体:
 * {
 *   phone: string,
 *   password: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password } = body

    console.log("[v0] password-login: 收到密码登录请求 =", { phone, password: "***" })

    // 验证输入
    if (!phone || !password) {
      console.log("[v0] password-login: 缺少必要参数")
      return NextResponse.json(
        { success: false, error: "请输入手机号和密码" },
        { status: 400 }
      )
    }

    // 查找用户
    console.log("[v0] password-login: 查找用户...")
    const user = await findUserByPhone(phone)
    console.log("[v0] password-login: 用户查找结果 =", user ? "找到用户" : "用户不存在")

    if (!user) {
      return NextResponse.json(
        { success: false, error: "手机号或密码错误" },
        { status: 401 }
      )
    }

    // 验证密码
    if (!user.password) {
      console.log("[v0] password-login: 用户未设置密码")
      return NextResponse.json(
        { success: false, error: "用户未设置密码，请使用验证码登录" },
        { status: 400 }
      )
    }

    console.log("[v0] password-login: 验证密码...")
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log("[v0] password-login: 密码验证结果 =", isPasswordValid)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "手机号或密码错误" },
        { status: 401 }
      )
    }

    // 更新最后登录时间
    console.log("[v0] password-login: 更新最后登录时间...")
    await updateLastLogin(user.id)

    // 生成JWT token
    console.log("[v0] password-login: 生成JWT token...")
    const token = sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" })

    // 移除敏感信息
    const { password: _, ...userWithoutPassword } = user

    console.log("[v0] password-login: 登录成功，准备返回响应")

    const response = NextResponse.json(
      {
        success: true,
        message: "登录成功",
        user: userWithoutPassword,
      },
      { status: 200 }
    )

    // 设置cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7天
    })

    console.log("[v0] password-login: 登录完成，已设置认证cookie")

    return response
  } catch (error: any) {
    console.error("[v0] password-login: 异常 =", error.message)
    return NextResponse.json(
      { success: false, error: "登录失败，请稍后重试" },
      { status: 500 }
    )
  }
}
