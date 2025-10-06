#!/bin/bash

# 连宏整装战略管理系统部署脚本

echo "🚀 开始部署连宏整装战略管理系统..."

# 检查Node.js版本
echo "📋 检查环境..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "❌ 错误: 需要Node.js 18或更高版本，当前版本: $(node -v)"
    exit 1
fi

# 检查npm版本
npm_version=$(npm -v | cut -d'.' -f1)
if [ "$npm_version" -lt 8 ]; then
    echo "❌ 错误: 需要npm 8或更高版本，当前版本: $(npm -v)"
    exit 1
fi

echo "✅ 环境检查通过"

# 安装依赖
echo "📦 安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 检查环境变量
echo "🔧 检查配置..."
if [ ! -f ".env" ]; then
    echo "⚠️  警告: 未找到.env文件，请复制.env.example并配置"
    cp .env.example .env
    echo "📝 已创建.env文件，请编辑配置后重新运行部署脚本"
    exit 1
fi

# 检查LeanCloud配置
source .env
if [ -z "$LEANCLOUD_APP_ID" ] || [ "$LEANCLOUD_APP_ID" = "your_app_id_here" ]; then
    echo "❌ 错误: 请配置LEANCLOUD_APP_ID"
    exit 1
fi

if [ -z "$LEANCLOUD_APP_KEY" ] || [ "$LEANCLOUD_APP_KEY" = "your_app_key_here" ]; then
    echo "❌ 错误: 请配置LEANCLOUD_APP_KEY"
    exit 1
fi

echo "✅ 配置检查通过"

# 构建生产版本
echo "🔨 构建生产版本..."
npm run build 2>/dev/null || echo "⚠️  跳过构建步骤（未配置build脚本）"

# 检查LeanCloud CLI
echo "🔍 检查LeanCloud CLI..."
if ! command -v lean &> /dev/null; then
    echo "📥 安装LeanCloud CLI..."
    npm install -g lean-cli
    
    if [ $? -ne 0 ]; then
        echo "❌ LeanCloud CLI安装失败"
        exit 1
    fi
fi

echo "✅ LeanCloud CLI已就绪"

# 登录LeanCloud
echo "🔐 登录LeanCloud..."
lean login

if [ $? -ne 0 ]; then
    echo "❌ LeanCloud登录失败"
    exit 1
fi

# 初始化项目（如果需要）
echo "🏗️  初始化项目..."
lean init --force

# 部署到LeanCloud
echo "🚀 部署到LeanCloud..."
lean deploy

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo "🌐 应用地址: https://$(lean app | grep 'App ID' | awk '{print $3}').leanapp.cn"
    echo "📊 控制台: https://console.leancloud.cn/"
else
    echo "❌ 部署失败"
    exit 1
fi

echo "🎉 部署完成！"