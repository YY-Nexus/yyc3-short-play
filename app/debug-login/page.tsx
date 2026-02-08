"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function DebugLoginPage() {
  const [phone, setPhone] = useState("13800138000")
  const [code, setCode] = useState("123456")
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
    console.log("[v0]", message)
  }

  const testSendCode = async () => {
    addLog("发送验证码...")
    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, type: "login" }),
      })
      const data = await response.json()
      addLog(`发送验证码响应: ${JSON.stringify(data)}`)
    } catch (error) {
      addLog(`发送验证码失败: ${error}`)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    addLog("开始登录流程...")
    addLog(`手机号: ${phone}, 验证码: ${code}`)

    try {
      // 第1步：调用登录API
      addLog("第1步：调用 /api/auth/login")
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
        credentials: "include",
      })

      addLog(`登录API响应状态: ${response.status}`)

      if (!response.ok) {
        const error = await response.json()
        addLog(`登录失败: ${JSON.stringify(error)}`)
        setLoading(false)
        return
      }

      const data = await response.json()
      addLog(`登录成功! 用户: ${JSON.stringify(data.user)}`)

      // 第2步：检查cookie是否设置
      addLog("第2步：检查cookie")
      const cookies = document.cookie
      addLog(`当前cookies: ${cookies || "无cookie"}`)

      // 第3步：验证/api/auth/me
      addLog("第3步：验证 /api/auth/me")
      const meResponse = await fetch("/api/auth/me", {
        credentials: "include",
      })
      const meData = await meResponse.json()
      addLog(`/api/auth/me 响应: ${JSON.stringify(meData)}`)

      // 第4步：尝试访问/main
      addLog("第4步：等待1.5秒后跳转到 /main")
      setTimeout(() => {
        addLog("执行跳转: window.location.href = '/main'")
        window.location.href = "/main"
      }, 1500)
    } catch (error) {
      addLog(`登录过程出错: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testDirectAccess = () => {
    addLog("直接访问 /main 页面")
    window.location.href = "/main"
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>登录调试工具</CardTitle>
            <CardDescription>测试登录流程的每一步，查看详细日志</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">手机号</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="手机号" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">验证码</label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="验证码" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={testSendCode} variant="outline">
                1. 发送验证码
              </Button>
              <Button onClick={testLogin} disabled={loading}>
                2. 执行登录
              </Button>
              <Button onClick={testDirectAccess} variant="secondary">
                3. 直接访问/main
              </Button>
              <Button onClick={clearLogs} variant="ghost">
                清空日志
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>执行日志</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">等待操作...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-blue-400">测试说明</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>1. 点击"发送验证码"确认API正常工作（默认返回123456）</p>
            <p>2. 点击"执行登录"查看完整的登录流程和每一步的状态</p>
            <p>3. 观察日志输出，特别注意cookie设置和/api/auth/me的响应</p>
            <p>4. 如果登录成功但无法跳转，日志会显示具体在哪一步出现问题</p>
            <p className="text-yellow-400 mt-4">打开浏览器控制台查看更多[v0]前缀的调试信息</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
