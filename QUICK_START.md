## 快速启动 - HaiLan Pro 登录修复

### 第1步：初始化数据库（如果首次运行）

```bash
# 一键创建表和测试数据
npm run db:init && npm run db:seed

# 或分步执行：
npm run db:init     # 创建users表
npm run db:seed     # 创建测试用户
```

### 第2步：启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000

### 第3步：测试登录

**使用密码登录（新增功能）**
1. 访问登录页面 `/auth`
2. 点击"密码登录"标签页
3. 手机号: `13800138000`
4. 密码: `Admin@2024`
5. 点击"立即登录"

应该成功登录并跳转到 `/main`

**或使用验证码登录（原有功能）**
1. 点击"验证码登录"标签页
2. 输入任意手机号（11位）
3. 点击"发送验证码"
4. 查看控制台 [v0] 日志获取验证码（开发模式）
5. 填入验证码并登录

### 调试技巧

#### 查看完整流程日志

打开浏览器F12 → Console选项卡，搜索 `[v0]` 标签：

```
[v0] handlePasswordLogin: 开始密码登录...
[v0] password-login: 收到密码登录请求
[v0] password-login: 查找用户...
[v0] password-login: 用户查找结果 = 找到用户
[v0] password-login: 验证密码...
[v0] password-login: 密码验证结果 = true
[v0] password-login: 生成JWT token...
[v0] password-login: 登录完成，已设置认证cookie
```

#### 常见问题

**Q: 显示"手机号或密码错误"**
- A: 检查输入的手机号是否为 `13800138000`
- A: 检查密码是否为 `Admin@2024`（区分大小写）

**Q: 显示"用户不存在"**
- A: 确保已执行 `npm run db:seed` 创建测试用户
- A: 检查数据库连接是否正确

**Q: 没有看到验证码**
- A: 验证码仅在开发模式显示在控制台
- A: 点击"验证码登录"标签，查看控制台 [v0] 日志

### 文件变更总结

| 文件 | 变更类型 | 说明 |
|-----|--------|------|
| `/components/auth/auth-form.tsx` | 修改 | +密码登录表单和逻辑 |
| `/app/api/auth/login-with-password/route.ts` | 新建 | 密码登录API |
| `/scripts/seed-test-users.ts` | 修改 | 修复数据库查询 |

### 验证修复成功

运行以下命令确认修复：

```bash
# 1. 检查API文件存在
ls -la app/api/auth/login-with-password/route.ts

# 2. 检查表单支持密码登录
grep -n "handlePasswordLogin" components/auth/auth-form.tsx

# 3. 检查种子脚本正确
grep -n "13800138000" scripts/seed-test-users.ts
```

### 部署到生产

1. 确保 `.env.local` 配置了数据库连接
2. 确保 `.env.local` 配置了 `JWT_SECRET`
3. 执行数据库初始化：`npm run db:init && npm run db:seed`
4. 构建项目：`npm run build`
5. 启动服务：`npm run start`
6. 访问应用测试登录

### 需要帮助？

- 查看完整诊断报告：`PASSWORD_LOGIN_SOLUTION.md`
- 查看原始问题修复：`LOGIN_ISSUE_FIX_REPORT.md`
- 查看隐私合规说明：`HAILAN_PRO_COMPLIANCE_REPORT.md`
