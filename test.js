// 连宏整装战略管理系统 - 简单测试脚本

const express = require('express');
const path = require('path');

// 创建测试服务器
const app = express();
const PORT = 3001;

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 测试路由
app.get('/test', (req, res) => {
    res.json({
        status: 'OK',
        message: '连宏整装战略管理系统测试服务器运行正常',
        timestamp: new Date().toISOString(),
        features: [
            '用户认证系统',
            '战略仪表盘',
            '数据维护模块',
            '战略地图',
            '设置管理',
            '响应式设计'
        ]
    });
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// 启动测试服务器
app.listen(PORT, () => {
    console.log(`🧪 测试服务器运行在 http://localhost:${PORT}`);
    console.log(`📊 健康检查: http://localhost:${PORT}/health`);
    console.log(`🔍 功能测试: http://localhost:${PORT}/test`);
    console.log(`🌐 应用界面: http://localhost:${PORT}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('🛑 收到SIGTERM信号，正在关闭测试服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 收到SIGINT信号，正在关闭测试服务器...');
    process.exit(0);
});