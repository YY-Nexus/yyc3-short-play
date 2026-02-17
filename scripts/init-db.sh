#!/bin/bash

# 初始化数据库 - 创建表和种子数据
# 使用方法: npm run init-db

cd "$(dirname "$0")"

echo "=== HaiLan Pro 数据库初始化 ==="
echo ""

# 1. 创建表
echo "1️⃣  创建数据库表..."
npx ts-node scripts/init-database.ts

if [ $? -eq 0 ]; then
  echo "✅ 数据库表创建成功"
else
  echo "❌ 数据库表创建失败"
  exit 1
fi

echo ""

# 2. 创建种子数据
echo "2️⃣  创建测试用户..."
npx ts-node scripts/seed-test-users.ts

if [ $? -eq 0 ]; then
  echo "✅ 测试用户创建成功"
else
  echo "❌ 测试用户创建失败"
  exit 1
fi

echo ""
echo "🎉 数据库初始化完成！"
echo ""
echo "测试账号信息："
echo "  管理员账号: 13800138000 / Admin@2024"
echo "  测试账号1: 13700000001 / User@123456"
echo "  测试账号2: 18600000002 / User@123456"
echo ""
