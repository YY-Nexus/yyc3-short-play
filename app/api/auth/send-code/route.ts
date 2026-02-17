import { type NextRequest, NextResponse } from "next/server"
import { createVerificationCode, checkRateLimit } from "@/lib/models/verification-code.model"
import { sendSmsCode } from "@/lib/services/sms.service"
import { sendVerificationCodeEmail } from "@/lib/services/email.service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, email, purpose } = body

    const contact = phone || email
    const contactType = phone ? "phone" : "email"

    console.log("[v0] send-code: 收到请求 =", { contact: contact?.substring(0, 8) + "***", purpose })

    // 验证输入
    if (!contact || !purpose) {
      console.log("[v0] send-code: 缺少必要参数")
      return NextResponse.json(
        { success: false, error: "缺少必要参数" },
        { status: 400 }
      )
    }

    // 检查频率限制
    console.log("[v0] send-code: 检查频率限制...")
    const canSend = await checkRateLimit(contact, purpose, contactType)
    if (!canSend) {
      console.log("[v0] send-code: 触发频率限制")
      return NextResponse.json(
        { success: false, error: "发送过于频繁，请1分钟后再试" },
        { status: 429 }
      )
    }

    // 创建验证码
    console.log("[v0] send-code: 生成验证码...")
    const code = await createVerificationCode(contact, purpose, contactType)
    console.log("[v0] send-code: 验证码已生成 =", code)

    // 发送验证码
    console.log("[v0] send-code: 发送验证码...")
    if (contactType === "phone") {
      const result = await sendSmsCode(contact, code)
      if (!result.success) {
        console.error("[v0] send-code: SMS发送失败 =", result.message)
        return NextResponse.json(
          { success: false, error: result.message },
          { status: 500 }
        )
      }
    } else {
      await sendVerificationCodeEmail(contact, code, purpose)
    }

    console.log("[v0] send-code: 验证码发送成功")

    return NextResponse.json(
      {
        success: true,
        message: "验证码发送成功",
        // 开发环境返回验证码方便测试
        ...(process.env.NODE_ENV === "development" && { code }),
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("[v0] send-code: 异常 =", error.message)
    return NextResponse.json(
      { success: false, error: "发送验证码失败" },
      { status: 500 }
    )
  }
}
