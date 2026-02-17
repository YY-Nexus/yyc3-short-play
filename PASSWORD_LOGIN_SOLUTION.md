## HaiLan Pro 登录系统 - 密码登录支持修复

### 问题诊断

原问题：测试账号登录失败，错误提示"登录失败，请稍后重试"

**根本原因**：
- 系统原本只支持**验证码登录**
- 测试账号文档提供的是**密码**
- 没有密码登录界面和API接口

### 修复方案

#### 1. 添加密码登录表单
**文件**: `/components/auth/auth-form.tsx`
- ✅ 添加密码状态变量 `password`
- ✅ 添加`handlePasswordLogin`函数处理密码登录逻辑
- ✅ 修改标签页从2个变为3个：验证码登录 | 密码登录 | 扫码登录
- ✅ 添加密码登录表单内容，包含手机号和密码输入框

#### 2. 创建密码登录API
**文件**: `/app/api/auth/login-with-password/route.ts`
- ✅ 验证手机号和密码输入
- ✅ 从数据库查找用户
- ✅ 使用bcrypt验证密码
- ✅ 生成JWT token并设置cookie
- ✅ 返回统一格式 `{ success: true, message, user }`

#### 3. 修复数据库种子脚本
**文件**: `/scripts/seed-test-users.ts`
- ✅ 修复mysql2数组查询解析错误
- ✅ 包含测试账号：13800138000 / Admin@2024

### 工作流程

#### 密码登录流程
```
用户输入 → handlePasswordLogin() → POST /api/auth/login-with-password
  ↓
验证账密 → bcrypt比对 → JWT生成 → Cookie设置
  ↓
成功响应 → 显示成功提示 → 跳转到/main
```

### 使用测试账号

**管理员账号**
- 手机: 13800138000
- 密码: Admin@2024
- 邮箱: admin@0379.email
- 角色: 超级管理员

**其他测试账号**
- 张三: 13700000001 / User@123456
- 李四: 18600000002 / User@123456

### 初始化数据库

```bash
# 方式1：分步执行
npm run db:init    # 创建表
npm run db:seed    # 创建测试用户

# 方式2：一键脚本
bash scripts/init-db.sh
```

### 登录验证

1. 打开应用，进入登录页面
2. 点击"密码登录"标签页
3. 输入手机号: 13800138000
4. 输入密码: Admin@2024
5. 点击"立即登录"按钮
6. 应该看到成功提示，并跳转到主页

### 隐私合规说明

✅ **HaiLan Pro 隐私保护措施**
- 密码使用bcryptjs加密存储
- 认证令牌使用JWT签名
- Cookies设置httpOnly和Secure标志
- 敏感信息不返回前端
- 支持密码和验证码双认证方式

### 调试信息

若登录失败，在浏览器F12控制台查看[v0]日志：
- `[v0] handlePasswordLogin: 开始密码登录...` - 请求发起
- `[v0] password-login: 查找用户...` - 用户查询
- `[v0] password-login: 密码验证结果` - 密码比对结果
- `[v0] password-login: 生成JWT token...` - Token生成
- `[v0] password-login: 登录完成` - 登录成功

### 可能的错误处理

| 错误信息 | 原因 | 解决方案 |
|--------|------|--------|
| 手机号或密码错误 | 用户不存在或密码错误 | 检查账号和密码 |
| 用户未设置密码 | 用户仅通过验证码登录创建 | 使用验证码登录 |
| 登录失败，请稍后重试 | 服务器错误 | 查看后端日志 |

### 已修复的文件

1. **表单组件**
   - `/components/auth/auth-form.tsx` - 添加密码登录表单和逻辑

2. **API接口**
   - `/app/api/auth/login-with-password/route.ts` - 新建密码登录API

3. **数据库脚本**
   - `/scripts/seed-test-users.ts` - 修复种子脚本查询

### 后续建议

1. 测试全部登录方式（验证码、密码、扫码）
2. 部署前执行 `npm run db:init && npm run db:seed`
3. 生产环境设置强密码策略
4. 定期审计认证日志
5. 实施2FA双因素认证（可选高级功能）
