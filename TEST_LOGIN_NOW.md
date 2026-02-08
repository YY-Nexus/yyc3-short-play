# 快速测试登录功能

## 立即测试

### 第一步：清除状态
在浏览器开发者工具中：
- 打开 Application 标签
- 清除所有 Cookies
- 清除 Local Storage
- 关闭开发者工具

### 第二步：登录
1. 访问：`http://localhost:3000/auth`
2. 输入手机号：`13800138000`
3. 点击"发送验证码"
4. 输入验证码：`123456`
5. 点击"登录"

### 第三步：验证成功
预期结果：
- ✅ 显示"登录成功"提示
- ✅ 1.5秒后自动跳转
- ✅ 看到主页面（文化轮播等内容）
- ✅ 地址栏显示：`http://localhost:3000/main`

## 如果还是失败

### 打开开发者工具Console查看日志

应该看到类似：
```
[v0] Auth context login called
[v0] Login attempt
[v0] Code valid: true
[v0] User found: yes
[v0] Login successful
[v0] Redirecting to /main via window.location
[v0] Middleware checking: /main
[v0] Token present: true
[v0] Token valid, allowing access
```

### 检查Cookie

1. 打开 Application → Cookies → localhost:3000
2. 查找 `auth_token`
3. 应该有一个JWT token值

### 测试Token

在新标签页访问：`http://localhost:3000/api/auth/me`
- 成功：返回用户JSON数据
- 失败：返回401错误

## 核心修复

关键修改是使用 `window.location.href` 而不是 `router.push`，确保cookie在页面跳转时被正确发送和验证。

## 需要帮助？

查看详细文档：`LOGIN_COMPLETE_FIX.md`
