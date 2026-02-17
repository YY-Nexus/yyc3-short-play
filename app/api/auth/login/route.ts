import { type NextRequest, NextResponse } from "next/server"
import { sign } from "jsonwebtoken"
import { findUserByPhone, updateLastLogin } from "@/lib/models/user.model"
import { verifyCode } from "@/lib/models/verification-code.model"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code } = body

    console.log("[v0] 登录API收到请求:", { phone, code: code ? "***" : undefined })

    // 验证输入
    if (!phone || !code) {
      console.log("[v0] 登录验证失败：缺少必要参数")
      return NextResponse.json(
        { success: false, error: "请填写手机号和验证码" },
        { status: 400 }
      )
    }

    // 验证验证码
    console.log("[v0] 开始验证验证码...")
    const isCodeValid = await verifyCode(phone, code, "login")
    console.log("[v0] 验证码验证结果:", isCodeValid)

    if (!isCodeValid) {
      console.log("[v0] 验证码无效或已过期")
      return NextResponse.json(
        { success: false, error: "验证码错误或已过期" },
        { status: 400 }
      )
    }

    // 查找用户
    console.log("[v0] 查找用户信息...")
    const user = await findUserByPhone(phone)
    console.log("[v0] 用户查找结果:", user ? "找到用户" : "用户不存在")

    if (!user) {
      return NextResponse.json(
        { success: false, error: "用户不存在，请先注册" },
        { status: 404 }
      )
    }

    // 更新最后登录时间
    console.log("[v0] 更新最后登录时间...")
    await updateLastLogin(user.id)

    // 生成JWT token
    console.log("[v0] 生成JWT token...")
    const token = sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" })

    // 移除敏感信息
    const { password, ...userWithoutPassword } = user

    console.log("[v0] 登录成功，准备返回响应")

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

    console.log("[v0] 登录完成，已设置认证cookie")

    return response
  } catch (error: any) {
    console.error("[v0] 登录API异常:", error.message)
    return NextResponse.json(
      { success: false, error: "登录失败，请稍后重试" },
      { status: 500 }
    )
  }
}

