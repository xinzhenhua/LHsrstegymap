# 连宏整装战略管理系统

## 项目概述

连宏整装战略管理系统是一个专为装修公司设计的完整业务管理平台，提供业绩追踪、战略规划和数据分析功能。系统采用现代简约的黑白色设计风格，支持响应式布局，可在桌面和移动设备上使用。

## 功能特性

### 🔐 用户认证系统
- 用户注册/登录功能
- 数据隔离（每个用户只能访问自己的数据）
- 密码加密存储
- 会话管理

### 📊 战略仪表盘
- 实时业绩完成度展示
- 关键指标追踪（转化率、到店率、毛利率）
- 目标vs实际对比可视化
- 月度业绩趋势图表
- 进度条和完成百分比

### 📝 数据维护模块
- 周度数据录入（量房、到店、签约、产值、毛利）
- 月度数据汇总和自动计算
- 数据验证和错误提示
- 历史数据查看和编辑

### 🗺️ 战略地图模块
- 年度战略目标分解
- 季度任务规划
- 关键指标计算（所需总客资、到店、签约）
- 进度追踪和可视化

### ⚙️ 设置管理模块
- 客单价调整
- 转化率目标设置
- 到店率目标设置
- 毛利率目标设置
- 年度业绩目标配置
- 季度目标分解设置

## 技术栈

- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **后端**: Node.js + Express
- **数据库**: LeanCloud
- **图表库**: Chart.js
- **样式**: 现代简约黑白色设计

## 默认业务参数

```javascript
const DEFAULT_CONFIG = {
  unitPrice: 300000,        // 客单价 30万
  conversionRate: 22,       // 转化率 22%
  visitRate: 40,            // 到店率 40%
  grossMargin: 35,          // 毛利率 35%
  annualTarget: 12000000,   // 年度目标 1200万
  
  // 季节性分解预设
  seasonalDistribution: {
    Q1: { target: 3000000, weight: 25 },  // 300万，25%
    Q2: { target: 6000000, weight: 50 },  // 600万，50%
    Q3: { target: 4000000, weight: 33 },  // 400万，33%
    Q4: { target: 2400000, weight: 20 }   // 240万，20%
  }
}
```

## 快速开始

### 1. 环境要求

- Node.js 18.x 或更高版本
- npm 8.x 或更高版本
- LeanCloud 账号

### 2. 安装依赖

```bash
npm install
```

### 3. 配置LeanCloud

1. 在 [LeanCloud控制台](https://console.leancloud.cn/) 创建应用
2. 获取应用的 App ID、App Key 和 Server URL
3. 在 `server.js` 中更新LeanCloud配置：

```javascript
AV.init({
  appId: 'YOUR_APP_ID',
  appKey: 'YOUR_APP_KEY',
  serverURL: 'YOUR_SERVER_URL'
});
```

### 4. 设置环境变量

创建 `.env` 文件：

```env
LEANCLOUD_APP_ID=your_app_id
LEANCLOUD_APP_KEY=your_app_key
LEANCLOUD_APP_SERVER_URL=your_server_url
LEANCLOUD_APP_PORT=3000
```

### 5. 启动应用

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 6. 访问应用

打开浏览器访问 `http://localhost:3000`

## 部署到LeanCloud

### 1. 安装LeanCloud CLI

```bash
npm install -g lean-cli
```

### 2. 登录LeanCloud

```bash
lean login
```

### 3. 初始化项目

```bash
lean init
```

### 4. 部署应用

```bash
lean deploy
```

## 数据表结构

### StrategyConfig (战略配置)
```javascript
{
  user: Pointer<_User>,     // 关联用户
  unitPrice: Number,        // 客单价
  conversionRate: Number,   // 转化率
  visitRate: Number,        // 到店率
  grossMargin: Number,      // 毛利率
  annualTarget: Number,     // 年度目标
  seasonalDistribution: Object // 季度分解
}
```

### WeeklyPerformance (周度业绩)
```javascript
{
  user: Pointer<_User>,     // 关联用户
  week: Number,             // 周次
  measurements: Number,     // 量房数
  visits: Number,           // 到店数
  signings: Number,         // 签约数
  outputValue: Number,      // 产值
  grossProfit: Number       // 毛利
}
```

## 核心算法

### 战略目标分解算法
```javascript
function calculateStrategicTargets(config) {
  const requiredSignings = config.annualTarget / config.unitPrice;
  const requiredVisits = requiredSignings / (config.conversionRate / 100);
  const requiredLeads = requiredVisits / (config.visitRate / 100);
  
  return {
    totalLeads: Math.ceil(requiredLeads),
    totalVisits: Math.ceil(requiredVisits),
    totalSignings: Math.ceil(requiredSignings)
  };
}
```

### 业绩完成度计算
```javascript
function calculateCompletion(actual, target) {
  return target > 0 ? (actual / target * 100).toFixed(1) : 0;
}
```

## 使用指南

### 1. 首次使用

1. 注册新账号或使用现有账号登录
2. 在"设置"页面配置业务参数
3. 开始录入周度数据

### 2. 数据录入

1. 进入"数据维护"页面
2. 点击"新增数据"按钮
3. 填写周度业绩数据
4. 保存数据

### 3. 查看仪表盘

1. 进入"仪表盘"页面
2. 查看关键指标和图表
3. 分析业绩完成情况

### 4. 战略规划

1. 进入"战略地图"页面
2. 查看年度目标分解
3. 跟踪季度进度

## 浏览器支持

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 移动端支持

系统采用响应式设计，支持以下设备：
- 手机 (320px+)
- 平板 (768px+)
- 桌面 (1024px+)

## 安全特性

- 用户数据隔离
- 密码加密存储
- API访问权限控制
- 输入数据验证和清理
- XSS和CSRF防护

## 性能优化

- 图表懒加载
- 数据分页加载
- 缓存策略
- 压缩静态资源

## 故障排除

### 常见问题

1. **无法登录**
   - 检查LeanCloud配置是否正确
   - 确认网络连接正常

2. **数据不显示**
   - 检查用户权限
   - 确认数据格式正确

3. **图表不渲染**
   - 检查Chart.js是否正确加载
   - 确认数据格式正确

### 日志查看

```bash
# 查看应用日志
lean logs

# 查看错误日志
lean logs --level error
```

## 开发指南

### 项目结构

```
project-root/
├── package.json
├── leanengine.yaml
├── server.js
└── public/
    ├── index.html
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── app.js
    │   ├── auth.js
    │   ├── dashboard.js
    │   └── charts.js
    └── assets/
```

### 添加新功能

1. 在相应的JS模块中添加功能
2. 更新HTML模板
3. 添加必要的CSS样式
4. 测试功能完整性

### 自定义样式

修改 `public/css/style.css` 中的CSS变量：

```css
:root {
    --primary-color: #000000;
    --secondary-color: #f5f5f5;
    --accent-color: #333333;
    /* 其他变量... */
}
```

## 许可证

MIT License

## 支持

如有问题或建议，请联系开发团队。

---

**连宏整装战略管理系统 v1.0.0**