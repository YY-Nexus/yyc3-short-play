import { NextResponse } from "next/server"
import { testConnection } from "@/lib/db"

export async function GET() {
  // 仅在开发环境允许
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "仅开发环境可用" }, { status: 403 })
  }

  try {
    const connected = await testConnection()
    
    return NextResponse.json({
      status: connected ? "connected" : "disconnected",
      environment: process.env.NODE_ENV,
      config: {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || "3306",
        database: process.env.DB_NAME || "yyc3_my",
        user: process.env.DB_USER || "yyc3_dj",
      },
    })
  } catch (error) {
    console.error("Database test failed:", error)
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      fallbackMode: "Using development fallback for test account 13800138000",
    }, { status: 500 })
  }
}
