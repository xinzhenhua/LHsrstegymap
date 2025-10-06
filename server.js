const express = require('express');
const path = require('path');
const AV = require('leanengine');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.LEANCLOUD_APP_PORT || 3000;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.leancloud.cn"]
    }
  }
}));

// CORS配置
app.use(cors());

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// LeanCloud初始化
AV.init({
  appId: process.env.LEANCLOUD_APP_ID || 'your-app-id',
  appKey: process.env.LEANCLOUD_APP_KEY || 'your-app-key',
  serverURL: process.env.LEANCLOUD_APP_SERVER_URL || 'https://your-app-id.api.lncldglobal.com'
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// API路由
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 用户认证API
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ error: '用户名、密码和邮箱都是必填项' });
    }

    const user = new AV.User();
    user.set('username', username);
    user.set('password', password);
    user.set('email', email);
    
    const result = await user.signUp();
    res.json({ 
      success: true, 
      user: {
        id: result.id,
        username: result.get('username'),
        email: result.get('email')
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码都是必填项' });
    }

    const result = await AV.User.logIn(username, password);
    res.json({ 
      success: true, 
      user: {
        id: result.id,
        username: result.get('username'),
        email: result.get('email'),
        sessionToken: result.get('sessionToken')
      }
    });
  } catch (error) {
    res.status(401).json({ error: '用户名或密码错误' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    await AV.User.logOut();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '登出失败' });
  }
});

// 战略数据API
app.get('/api/strategy/config', async (req, res) => {
  try {
    const query = new AV.Query('StrategyConfig');
    query.equalTo('user', AV.User.current());
    const configs = await query.find();
    
    if (configs.length > 0) {
      res.json({ success: true, config: configs[0].toJSON() });
    } else {
      // 返回默认配置
      const defaultConfig = {
        unitPrice: 300000,
        conversionRate: 22,
        visitRate: 40,
        grossMargin: 35,
        annualTarget: 12000000,
        seasonalDistribution: {
          Q1: { target: 3000000, weight: 25 },
          Q2: { target: 6000000, weight: 50 },
          Q3: { target: 4000000, weight: 33 },
          Q4: { target: 2400000, weight: 20 }
        }
      };
      res.json({ success: true, config: defaultConfig });
    }
  } catch (error) {
    res.status(500).json({ error: '获取配置失败' });
  }
});

app.post('/api/strategy/config', async (req, res) => {
  try {
    const configData = req.body;
    const query = new AV.Query('StrategyConfig');
    query.equalTo('user', AV.User.current());
    
    let config;
    const existingConfigs = await query.find();
    
    if (existingConfigs.length > 0) {
      config = existingConfigs[0];
    } else {
      config = new AV.Object('StrategyConfig');
      config.set('user', AV.User.current());
    }
    
    Object.keys(configData).forEach(key => {
      config.set(key, configData[key]);
    });
    
    await config.save();
    res.json({ success: true, config: config.toJSON() });
  } catch (error) {
    res.status(500).json({ error: '保存配置失败' });
  }
});

// 周度数据API
app.get('/api/performance/weekly', async (req, res) => {
  try {
    const query = new AV.Query('WeeklyPerformance');
    query.equalTo('user', AV.User.current());
    query.descending('createdAt');
    const performances = await query.find();
    
    res.json({ 
      success: true, 
      data: performances.map(p => p.toJSON())
    });
  } catch (error) {
    res.status(500).json({ error: '获取周度数据失败' });
  }
});

app.post('/api/performance/weekly', async (req, res) => {
  try {
    const performanceData = req.body;
    const performance = new AV.Object('WeeklyPerformance');
    performance.set('user', AV.User.current());
    
    Object.keys(performanceData).forEach(key => {
      performance.set(key, performanceData[key]);
    });
    
    await performance.save();
    res.json({ success: true, data: performance.toJSON() });
  } catch (error) {
    res.status(500).json({ error: '保存周度数据失败' });
  }
});

// 所有其他路由返回index.html（SPA支持）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`连宏整装战略管理系统运行在端口 ${PORT}`);
  console.log(`访问地址: http://localhost:${PORT}`);
});