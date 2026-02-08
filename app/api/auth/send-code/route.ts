import { type NextRequest, NextResponse } from "next/server"
import { createVerificationCode, checkRateLimit } from "@/lib/models/verification-code.model"
import { sendSmsCode } from "@/lib/services/sms.service"
import { sendVerificationCodeEmail } from "@/lib/services/email.service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, email, type } = body

    const contact = phone || email
    const contactType = phone ? "phone" : "email"

    console.log("[v0] Send code request:", { contact, type, contactType })

    // 验证输入
    if (!contact || !type) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 })
    }

    // 开发环境：测试账号直接返回固定验证码
    if (process.env.NODE_ENV === "development" && contact === "13800138000") {
      console.log("[v0] Using test verification code for default account")
      return NextResponse.json({
        message: "验证码发送成功",
        code: "123456",
      })
    }

    // 检查频率限制
    try {
      const canSend = await checkRateLimit(contact, type, contactType)
      if (!canSend) {
        return NextResponse.json({ error: "发送过于频繁，请1分钟后再试" }, { status: 429 })
      }
    } catch (error) {
      console.log("[v0] Rate limit check failed (non-critical):", error)
      // 在开发环境不阻止发送
      if (process.env.NODE_ENV !== "development") {
        throw error
      }
    }

    // 创建验证码
    let code: string
    try {
      code = await createVerificationCode(contact, type, contactType)
    } catch (error) {
      console.log("[v0] Could not create verification code in database:", error)
      // 开发环境：如果数据库失败，使用固定验证码
      if (process.env.NODE_ENV === "development") {
        code = "123456"
        console.log("[v0] Using fallback verification code")
      } else {
        throw error
      }
    }

    // 发送验证码
    if (contactType === "phone") {
      const result = await sendSmsCode(contact, code)
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 500 })
      }
    } else {
      await sendVerificationCodeEmail(contact, code, type)
    }

    console.log("[v0] Verification code sent successfully")
    return NextResponse.json({
      message: "验证码发送成功",
      // 开发环境返回验证码方便测试
      ...(process.env.NODE_ENV === "development" && { code }),
    })
  } catch (error) {
    console.error("[v0] Send code error:", error)
    const errorMessage = error instanceof Error ? error.message : "未知错误"
    return NextResponse.json({ 
      error: "发送验证码失败",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }, { status: 500 })
  }
}
