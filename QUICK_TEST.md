# 快速测试登录功能

## 方法 1：使用测试面板（推荐）

访问测试面板：
```
http://localhost:3000/test-login
```

按顺序点击三个测试按钮，查看结果。

## 方法 2：直接登录

1. 访问：`http://localhost:3000/auth`
2. 输入手机号：`13800138000`
3. 点击"发送验证码"
4. 输入验证码：`123456`
5. 点击"登录"

预期结果：登录成功，跳转到 `/main` 页面

## 方法 3：API 测试

### 测试数据库
```bash
curl http://localhost:3000/api/test-db
```

### 发送验证码
```bash
curl -X POST http://localhost:3000/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","type":"login"}'
```

### 登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","code":"123456"}'
```

## 查看日志

打开浏览器控制台，查找 `[v0]` 前缀的日志，可以追踪完整的登录流程。

## 常见问题

- **数据库未配置？** 没关系，开发环境会自动使用容错机制
- **验证码收不到？** 开发环境使用固定验证码 `123456`
- **登录失败？** 检查控制台的 `[v0]` 日志找到具体原因

## 详细文档

- 完整测试指南：`docs/LOGIN_TEST_GUIDE.md`
- 修复总结：`docs/LOGIN_FIX_SUMMARY.md`
