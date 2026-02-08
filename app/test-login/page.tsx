"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function TestLoginPage() {
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [dbLoading, setDbLoading] = useState(false)
  const [codeResult, setCodeResult] = useState<any>(null)
  const [codeLoading, setCodeLoading] = useState(false)
  const [loginResult, setLoginResult] = useState<any>(null)
  const [loginLoading, setLoginLoading] = useState(false)

  async function testDatabase() {
    setDbLoading(true)
    try {
      const response = await fetch("/api/test-db")
      const data = await response.json()
      setDbStatus(data)
    } catch (error) {
      setDbStatus({ status: "error", error: String(error) })
    }
    setDbLoading(false)
  }

  async function testSendCode() {
    setCodeLoading(true)
    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "13800138000", type: "login" }),
      })
      const data = await response.json()
      setCodeResult({ status: response.status, data })
    } catch (error) {
      setCodeResult({ status: "error", error: String(error) })
    }
    setCodeLoading(false)
  }

  async function testLogin() {
    setLoginLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "13800138000", code: "123456" }),
      })
      const data = await response.json()
      setLoginResult({ status: response.status, data })
    } catch (error) {
      setLoginResult({ status: "error", error: String(error) })
    }
    setLoginLoading(false)
  }

  function getStatusIcon(status: string) {
    if (status === "connected" || status === 200) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    if (status === "error" || status >= 400) {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    return <AlertCircle className="h-5 w-5 text-yellow-500" />
  }

  function getStatusColor(status: string | number) {
    if (status === "connected" || status === 200) return "default"
    if (status === "error" || (typeof status === "number" && status >= 400)) return "destructive"
    return "secondary"
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">登录系统测试面板</h1>
          <p className="text-muted-foreground mt-2">测试默认账号登录功能</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>测试账号信息</CardTitle>
            <CardDescription>开发环境默认测试账号</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">手机号</span>
              <code className="bg-muted px-2 py-1 rounded">13800138000</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">验证码</span>
              <code className="bg-muted px-2 py-1 rounded">123456</code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              1. 数据库连接测试
              {dbStatus && getStatusIcon(dbStatus.status)}
            </CardTitle>
            <CardDescription>检查数据库连接状态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testDatabase} disabled={dbLoading}>
              {dbLoading ? "测试中..." : "测试数据库连接"}
            </Button>
            {dbStatus && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(dbStatus.status)}>{dbStatus.status}</Badge>
                </div>
                <pre className="bg-muted p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(dbStatus, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              2. 发送验证码测试
              {codeResult && getStatusIcon(codeResult.status)}
            </CardTitle>
            <CardDescription>测试发送验证码到 13800138000</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testSendCode} disabled={codeLoading}>
              {codeLoading ? "发送中..." : "发送验证码"}
            </Button>
            {codeResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(codeResult.status)}>
                    状态码: {codeResult.status}
                  </Badge>
                  {codeResult.data?.code && (
                    <Badge>验证码: {codeResult.data.code}</Badge>
                  )}
                </div>
                <pre className="bg-muted p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(codeResult.data, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              3. 登录测试
              {loginResult && getStatusIcon(loginResult.status)}
            </CardTitle>
            <CardDescription>使用 13800138000 / 123456 登录</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testLogin} disabled={loginLoading}>
              {loginLoading ? "登录中..." : "测试登录"}
            </Button>
            {loginResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(loginResult.status)}>
                    状态码: {loginResult.status}
                  </Badge>
                  {loginResult.data?.user && (
                    <Badge variant="default">
                      用户ID: {loginResult.data.user.id}
                    </Badge>
                  )}
                </div>
                <pre className="bg-muted p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(loginResult.data, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. 按顺序点击三个测试按钮</p>
            <p>2. 如果数据库连接失败，系统会自动使用开发模式容错机制</p>
            <p>3. 在开发环境下，即使数据库未配置，登录功能也应该正常工作</p>
            <p>4. 查看浏览器控制台可以看到详细的 [v0] 调试日志</p>
            <p className="font-bold text-blue-700 mt-4">
              预期结果：所有测试都应该成功（绿色图标）
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <a href="/auth">前往登录页面</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/docs/LOGIN_TEST_GUIDE.md" target="_blank">查看测试指南</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
