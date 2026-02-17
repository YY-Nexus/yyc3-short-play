import { type NextRequest, NextResponse } from "next/server"
import { sign } from "jsonwebtoken"
import { createUser, findUserByPhone } from "@/lib/models/user.model"
import { verifyCode } from "@/lib/models/verification-code.model"
import { sendWelcomeEmail } from "@/lib/services/email.service"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, phone, code, email } = body

    console.log("[v0] register: 收到注册请求 =", { username, phone, email })

    // 验证输入
    if (!username || !phone || !code) {
      console.log("[v0] register: 缺少必要参数")
      return NextResponse.json(
        { success: false, error: "请填写完整信息" },
        { status: 400 }
      )
    }

    // 验证验证码
    console.log("[v0] register: 验证验证码...")
    const isCodeValid = await verifyCode(phone, code, "register")
    if (!isCodeValid) {
      console.log("[v0] register: 验证码无效")
      return NextResponse.json(
        { success: false, error: "验证码错误或已过期" },
        { status: 400 }
      )
    }

    // 检查用户是否已存在
    console.log("[v0] register: 检查用户是否已存在...")
    const existingUser = await findUserByPhone(phone)
    if (existingUser) {
      console.log("[v0] register: 用户已存在")
      return NextResponse.json(
        { success: false, error: "该手机号已注册" },
        { status: 400 }
      )
    }

    // 创建用户
    console.log("[v0] register: 创建新用户...")
    const user = await createUser({
      username,
      phone,
      email,
    })

    console.log("[v0] register: 用户已创建 =", user.id)

    // 生成JWT token
    const token = sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" })

    // 发送欢迎邮件（如果有邮箱）
    if (email) {
      console.log("[v0] register: 发送欢迎邮件...")
      sendWelcomeEmail(email, username).catch(console.error)
    }

    // 移除敏感信息
    const { password, ...userWithoutPassword } = user

    const response = NextResponse.json(
      {
        success: true,
        message: "注册成功",
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

    console.log("[v0] register: 注册完成，已设置认证cookie")

    return response
  } catch (error: any) {
    console.error("[v0] register: 异常 =", error.message)
    return NextResponse.json(
      { success: false, error: "注册失败，请稍后重试" },
      { status: 500 }
    )
  }
}
