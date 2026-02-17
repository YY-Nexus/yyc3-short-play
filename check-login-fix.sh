#!/bin/bash

# 🔍 登录系统完整性检查脚本
# 用于验证所有修复是否已正确应用

echo "================================"
echo "🔐 HaiLan Pro 登录系统检查"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数
TOTAL_CHECKS=0
PASSED_CHECKS=0

check_file() {
  local file=$1
  local pattern=$2
  local description=$3
  
  ((TOTAL_CHECKS++))
  
  if grep -q "$pattern" "$file" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} $description"
    ((PASSED_CHECKS++))
  else
    echo -e "${RED}❌${NC} $description"
    echo "   文件: $file"
    echo "   查找: $pattern"
  fi
}

# 1. 检查 API 响应格式
echo "📋 检查 API 响应格式..."
check_file "app/api/auth/login/route.ts" "success: true" "Login API - success 字段"
check_file "app/api/auth/login/route.ts" "\[v0\]" "Login API - 调试日志"
check_file "app/api/auth/send-code/route.ts" "success: true" "Send Code API - success 字段"
check_file "app/api/auth/register/route.ts" "success: true" "Register API - success 字段"
echo ""

# 2. 检查 Context 修复
echo "📋 检查认证上下文..."
check_file "contexts/auth-context.tsx" "Promise<boolean>" "Context - 返回类型声明"
check_file "contexts/auth-context.tsx" "return true" "Context - 返回值"
check_file "contexts/auth-context.tsx" "\[v0\]" "Context - 调试日志"
echo ""

# 3. 检查表单修复
echo "📋 检查登录表单..."
check_file "components/auth/auth-form.tsx" "fetch.*api/auth/login" "Form - 直接调用 API"
check_file "components/auth/auth-form.tsx" "apiData.success" "Form - 检查 success 字段"
check_file "components/auth/auth-form.tsx" "\[v0\]" "Form - 调试日志"
echo ""

# 4. 检查数据库查询修复
echo "📋 检查数据库查询..."
check_file "lib/models/user.model.ts" "Array.isArray(rows)" "User Model - 数组检查"
check_file "lib/models/user.model.ts" "rows\[0\]" "User Model - 数组取值"
check_file "lib/models/verification-code.model.ts" "Array.isArray(rows)" "Verification Model - 数组检查"
check_file "lib/models/verification-code.model.ts" "\[v0\]" "Database - 调试日志"
echo ""

# 5. 检查中间件
echo "📋 检查中间件..."
check_file "middleware.ts" "publicRoutes.*auth" "Middleware - 公开路由配置"
check_file "middleware.ts" "auth_token" "Middleware - Token 验证"
echo ""

# 6. 统计结果
echo "================================"
echo "检查结果: $PASSED_CHECKS / $TOTAL_CHECKS 通过"
echo "================================"

if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ]; then
  echo -e "${GREEN}✅ 所有检查通过！系统准备就绪。${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  有 $((TOTAL_CHECKS - PASSED_CHECKS)) 项检查未通过。${NC}"
  exit 1
fi
