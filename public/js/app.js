// 连宏整装战略管理系统 - 主应用文件
class StrategyApp {
    constructor() {
        this.currentUser = null;
        this.config = null;
        this.weeklyData = [];
        this.monthlyData = [];
        
        // 默认配置
        this.defaultConfig = {
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
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }
    
    setupEventListeners() {
        // 认证相关事件
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        
        // 认证标签切换
        document.querySelectorAll('.auth-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchAuthTab(e.target.dataset.tab));
        });
        
        // 导航切换
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchPage(e.target.dataset.page));
        });
        
        // 数据维护标签切换
        document.querySelectorAll('.data-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchDataTab(e.target.dataset.tab));
        });
        
        // 周度数据表单
        document.getElementById('weekly-form').addEventListener('submit', (e) => this.handleWeeklySubmit(e));
        document.getElementById('add-weekly-btn').addEventListener('click', () => this.showWeeklyForm());
        document.getElementById('cancel-weekly').addEventListener('click', () => this.hideWeeklyForm());
        
        // 设置表单
        document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-settings').addEventListener('click', () => this.resetSettings());
        
        // 模态框事件
        document.querySelector('.modal-close').addEventListener('click', () => this.hideModal());
        document.getElementById('modal-cancel').addEventListener('click', () => this.hideModal());
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.hideModal();
        });
    }
    
    async checkAuthStatus() {
        try {
            const response = await fetch('/api/health');
            if (response.ok) {
                // 检查是否有当前用户
                const user = AV.User.current();
                if (user) {
                    this.currentUser = user;
                    this.showDashboard();
                    await this.loadUserData();
                } else {
                    this.showAuth();
                }
            } else {
                this.showAuth();
            }
        } catch (error) {
            console.error('检查认证状态失败:', error);
            this.showAuth();
        }
    }
    
    showAuth() {
        document.getElementById('auth-page').classList.add('active');
        document.getElementById('dashboard-page').classList.remove('active');
    }
    
    showDashboard() {
        document.getElementById('auth-page').classList.remove('active');
        document.getElementById('dashboard-page').classList.add('active');
        document.getElementById('current-user').textContent = this.currentUser.get('username');
    }
    
    switchAuthTab(tab) {
        document.querySelectorAll('.auth-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-form`).classList.add('active');
    }
    
    switchPage(page) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.page-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-page="${page}"]`).classList.add('active');
        document.getElementById(`${page}-content`).classList.add('active');
        
        // 页面特定逻辑
        if (page === 'dashboard') {
            this.updateDashboard();
        } else if (page === 'data') {
            this.loadWeeklyData();
        } else if (page === 'strategy') {
            this.updateStrategyMap();
        } else if (page === 'settings') {
            this.loadSettings();
        }
    }
    
    switchDataTab(tab) {
        document.querySelectorAll('.data-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.data-section').forEach(section => section.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-data`).classList.add('active');
    }
    
    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            this.showLoading();
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentUser = AV.User.current();
                this.showDashboard();
                await this.loadUserData();
                this.showNotification('登录成功', 'success');
            } else {
                this.showNotification(result.error || '登录失败', 'error');
            }
        } catch (error) {
            console.error('登录错误:', error);
            this.showNotification('登录失败，请检查网络连接', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        if (data.password !== data.confirmPassword) {
            this.showNotification('两次输入的密码不一致', 'error');
            return;
        }
        
        try {
            this.showLoading();
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.username,
                    email: data.email,
                    password: data.password
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('注册成功，请登录', 'success');
                this.switchAuthTab('login');
                e.target.reset();
            } else {
                this.showNotification(result.error || '注册失败', 'error');
            }
        } catch (error) {
            console.error('注册错误:', error);
            this.showNotification('注册失败，请检查网络连接', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async handleLogout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            this.currentUser = null;
            this.showAuth();
            this.showNotification('已退出登录', 'success');
        } catch (error) {
            console.error('退出登录错误:', error);
            this.showNotification('退出登录失败', 'error');
        }
    }
    
    async loadUserData() {
        try {
            await Promise.all([
                this.loadConfig(),
                this.loadWeeklyData()
            ]);
            this.updateDashboard();
        } catch (error) {
            console.error('加载用户数据失败:', error);
        }
    }
    
    async loadConfig() {
        try {
            const response = await fetch('/api/strategy/config');
            const result = await response.json();
            
            if (result.success) {
                this.config = result.config;
            } else {
                this.config = { ...this.defaultConfig };
            }
        } catch (error) {
            console.error('加载配置失败:', error);
            this.config = { ...this.defaultConfig };
        }
    }
    
    async loadWeeklyData() {
        try {
            const response = await fetch('/api/performance/weekly');
            const result = await response.json();
            
            if (result.success) {
                this.weeklyData = result.data;
                this.updateWeeklyTable();
                this.calculateMonthlyData();
            }
        } catch (error) {
            console.error('加载周度数据失败:', error);
        }
    }
    
    calculateMonthlyData() {
        // 按月份汇总周度数据
        const monthlyMap = new Map();
        
        this.weeklyData.forEach(week => {
            const date = new Date(week.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyMap.has(monthKey)) {
                monthlyMap.set(monthKey, {
                    month: monthKey,
                    targetOutput: 0,
                    actualOutput: 0,
                    targetProfit: 0,
                    actualProfit: 0,
                    grossMargin: 0
                });
            }
            
            const month = monthlyMap.get(monthKey);
            month.actualOutput += week.outputValue || 0;
            month.actualProfit += week.grossProfit || 0;
        });
        
        this.monthlyData = Array.from(monthlyMap.values());
        this.updateMonthlyTable();
    }
    
    updateDashboard() {
        if (!this.config) return;
        
        // 计算年度完成度
        const totalActual = this.weeklyData.reduce((sum, week) => sum + (week.outputValue || 0), 0);
        const annualCompletion = this.calculateCompletion(totalActual, this.config.annualTarget);
        
        // 更新年度目标卡片
        document.getElementById('annual-completion').textContent = `${annualCompletion}%`;
        document.getElementById('annual-progress').style.width = `${Math.min(annualCompletion, 100)}%`;
        document.getElementById('annual-actual').textContent = `¥${this.formatNumber(totalActual * 10000)}`;
        document.getElementById('annual-target').textContent = `¥${this.formatNumber(this.config.annualTarget)}`;
        
        // 更新其他指标
        this.updateMetrics();
        
        // 更新图表
        this.updateCharts();
    }
    
    updateMetrics() {
        if (!this.config || this.weeklyData.length === 0) return;
        
        // 计算实际转化率
        const totalVisits = this.weeklyData.reduce((sum, week) => sum + (week.visits || 0), 0);
        const totalSignings = this.weeklyData.reduce((sum, week) => sum + (week.signings || 0), 0);
        const actualConversionRate = totalVisits > 0 ? (totalSignings / totalVisits * 100) : 0;
        
        // 计算实际到店率
        const totalMeasurements = this.weeklyData.reduce((sum, week) => sum + (week.measurements || 0), 0);
        const actualVisitRate = totalMeasurements > 0 ? (totalVisits / totalMeasurements * 100) : 0;
        
        // 计算实际毛利率
        const totalOutput = this.weeklyData.reduce((sum, week) => sum + (week.outputValue || 0), 0);
        const totalProfit = this.weeklyData.reduce((sum, week) => sum + (week.grossProfit || 0), 0);
        const actualGrossMargin = totalOutput > 0 ? (totalProfit / totalOutput * 100) : 0;
        
        // 更新转化率
        document.getElementById('conversion-rate').textContent = `${actualConversionRate.toFixed(1)}%`;
        document.getElementById('conversion-target').textContent = `${this.config.conversionRate}%`;
        document.getElementById('conversion-actual').textContent = `${actualConversionRate.toFixed(1)}%`;
        
        // 更新到店率
        document.getElementById('visit-rate').textContent = `${actualVisitRate.toFixed(1)}%`;
        document.getElementById('visit-target').textContent = `${this.config.visitRate}%`;
        document.getElementById('visit-actual').textContent = `${actualVisitRate.toFixed(1)}%`;
        
        // 更新毛利率
        document.getElementById('gross-margin').textContent = `${actualGrossMargin.toFixed(1)}%`;
        document.getElementById('margin-target').textContent = `${this.config.grossMargin}%`;
        document.getElementById('margin-actual').textContent = `${actualGrossMargin.toFixed(1)}%`;
    }
    
    updateCharts() {
        // 月度趋势图表
        this.updateMonthlyTrendChart();
        
        // 季度分解图表
        this.updateQuarterlyChart();
    }
    
    updateMonthlyTrendChart() {
        const ctx = document.getElementById('monthly-trend-chart').getContext('2d');
        
        const months = this.monthlyData.map(item => item.month);
        const actualData = this.monthlyData.map(item => item.actualOutput);
        const targetData = this.monthlyData.map(item => item.targetOutput);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: '实际产值',
                    data: actualData,
                    borderColor: '#000000',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    tension: 0.4
                }, {
                    label: '目标产值',
                    data: targetData,
                    borderColor: '#666666',
                    backgroundColor: 'rgba(102, 102, 102, 0.1)',
                    borderDash: [5, 5],
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '¥' + value + '万';
                            }
                        }
                    }
                }
            }
        });
    }
    
    updateQuarterlyChart() {
        const ctx = document.getElementById('quarterly-chart').getContext('2d');
        
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        const targets = quarters.map(q => this.config.seasonalDistribution[q].target / 10000);
        const actuals = [0, 0, 0, 0]; // 这里需要根据实际数据计算
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: quarters,
                datasets: [{
                    label: '目标产值',
                    data: targets,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)'
                }, {
                    label: '实际产值',
                    data: actuals,
                    backgroundColor: 'rgba(102, 102, 102, 0.8)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '¥' + value + '万';
                            }
                        }
                    }
                }
            }
        });
    }
    
    updateStrategyMap() {
        if (!this.config) return;
        
        // 计算战略目标
        const targets = this.calculateStrategicTargets(this.config);
        
        // 更新年度目标显示
        document.getElementById('annual-target-display').textContent = `¥${this.formatNumber(this.config.annualTarget)}`;
        
        // 更新关键指标要求
        document.getElementById('total-leads').textContent = targets.totalLeads;
        document.getElementById('total-visits').textContent = targets.totalVisits;
        document.getElementById('total-signings').textContent = targets.totalSignings;
        
        // 更新季度目标
        this.updateQuarterlyTargets();
    }
    
    calculateStrategicTargets(config) {
        const requiredSignings = config.annualTarget / config.unitPrice;
        const requiredVisits = requiredSignings / (config.conversionRate / 100);
        const requiredLeads = requiredVisits / (config.visitRate / 100);
        
        return {
            totalLeads: Math.ceil(requiredLeads),
            totalVisits: Math.ceil(requiredVisits),
            totalSignings: Math.ceil(requiredSignings)
        };
    }
    
    updateQuarterlyTargets() {
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        
        quarters.forEach(quarter => {
            const target = this.config.seasonalDistribution[quarter].target;
            const actual = 0; // 这里需要根据实际数据计算
            const completion = this.calculateCompletion(actual, target);
            
            document.getElementById(`${quarter.toLowerCase()}-target`).textContent = `¥${this.formatNumber(target)}`;
            document.getElementById(`${quarter.toLowerCase()}-actual`).textContent = `¥${this.formatNumber(actual)}`;
            document.getElementById(`${quarter.toLowerCase()}-progress`).style.width = `${Math.min(completion, 100)}%`;
            document.getElementById(`${quarter.toLowerCase()}-text`).textContent = `${completion}%`;
        });
    }
    
    showWeeklyForm() {
        document.getElementById('weekly-form').style.display = 'block';
        document.getElementById('add-weekly-btn').style.display = 'none';
    }
    
    hideWeeklyForm() {
        document.getElementById('weekly-form').style.display = 'none';
        document.getElementById('add-weekly-btn').style.display = 'block';
        document.getElementById('weekly-form').reset();
    }
    
    async handleWeeklySubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // 数据验证
        if (!data.week || !data.measurements || !data.visits || !data.signings || !data.outputValue || !data.grossProfit) {
            this.showNotification('请填写所有必填字段', 'error');
            return;
        }
        
        try {
            this.showLoading();
            const response = await fetch('/api/performance/weekly', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    week: parseInt(data.week),
                    measurements: parseInt(data.measurements),
                    visits: parseInt(data.visits),
                    signings: parseInt(data.signings),
                    outputValue: parseFloat(data.outputValue),
                    grossProfit: parseFloat(data.grossProfit)
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('周度数据保存成功', 'success');
                this.hideWeeklyForm();
                await this.loadWeeklyData();
                this.updateDashboard();
            } else {
                this.showNotification(result.error || '保存失败', 'error');
            }
        } catch (error) {
            console.error('保存周度数据失败:', error);
            this.showNotification('保存失败，请检查网络连接', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    updateWeeklyTable() {
        const tbody = document.querySelector('#weekly-table tbody');
        tbody.innerHTML = '';
        
        this.weeklyData.forEach(week => {
            const row = document.createElement('tr');
            
            const conversionRate = week.visits > 0 ? (week.signings / week.visits * 100) : 0;
            const visitRate = week.measurements > 0 ? (week.visits / week.measurements * 100) : 0;
            const grossMargin = week.outputValue > 0 ? (week.grossProfit / week.outputValue * 100) : 0;
            
            row.innerHTML = `
                <td>第${week.week}周</td>
                <td>${week.measurements || 0}</td>
                <td>${week.visits || 0}</td>
                <td>${week.signings || 0}</td>
                <td>${week.outputValue || 0}</td>
                <td>${week.grossProfit || 0}</td>
                <td>${conversionRate.toFixed(1)}%</td>
                <td>${visitRate.toFixed(1)}%</td>
                <td>${grossMargin.toFixed(1)}%</td>
                <td>
                    <button class="btn btn-secondary" onclick="app.editWeeklyData('${week.objectId}')">编辑</button>
                    <button class="btn btn-secondary" onclick="app.deleteWeeklyData('${week.objectId}')">删除</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    updateMonthlyTable() {
        const tbody = document.querySelector('#monthly-table tbody');
        tbody.innerHTML = '';
        
        this.monthlyData.forEach(month => {
            const row = document.createElement('tr');
            const completionRate = this.calculateCompletion(month.actualOutput, month.targetOutput);
            const grossMargin = month.actualOutput > 0 ? (month.actualProfit / month.actualOutput * 100) : 0;
            
            row.innerHTML = `
                <td>${month.month}</td>
                <td>${month.targetOutput.toFixed(1)}</td>
                <td>${month.actualOutput.toFixed(1)}</td>
                <td>${completionRate}%</td>
                <td>${month.targetProfit.toFixed(1)}</td>
                <td>${month.actualProfit.toFixed(1)}</td>
                <td>${grossMargin.toFixed(1)}%</td>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    async loadSettings() {
        if (!this.config) await this.loadConfig();
        
        // 填充设置表单
        document.getElementById('unit-price').value = this.config.unitPrice;
        document.getElementById('conversion-rate').value = this.config.conversionRate;
        document.getElementById('visit-rate').value = this.config.visitRate;
        document.getElementById('gross-margin').value = this.config.grossMargin;
        document.getElementById('annual-target').value = this.config.annualTarget;
        
        // 填充季度设置
        Object.keys(this.config.seasonalDistribution).forEach(quarter => {
            const data = this.config.seasonalDistribution[quarter];
            document.getElementById(`${quarter.toLowerCase()}-target`).value = data.target;
            document.getElementById(`${quarter.toLowerCase()}-weight`).value = data.weight;
        });
    }
    
    async saveSettings() {
        const settings = {
            unitPrice: parseFloat(document.getElementById('unit-price').value),
            conversionRate: parseFloat(document.getElementById('conversion-rate').value),
            visitRate: parseFloat(document.getElementById('visit-rate').value),
            grossMargin: parseFloat(document.getElementById('gross-margin').value),
            annualTarget: parseFloat(document.getElementById('annual-target').value),
            seasonalDistribution: {
                Q1: {
                    target: parseFloat(document.getElementById('q1-target').value),
                    weight: parseFloat(document.getElementById('q1-weight').value)
                },
                Q2: {
                    target: parseFloat(document.getElementById('q2-target').value),
                    weight: parseFloat(document.getElementById('q2-weight').value)
                },
                Q3: {
                    target: parseFloat(document.getElementById('q3-target').value),
                    weight: parseFloat(document.getElementById('q3-weight').value)
                },
                Q4: {
                    target: parseFloat(document.getElementById('q4-target').value),
                    weight: parseFloat(document.getElementById('q4-weight').value)
                }
            }
        };
        
        try {
            this.showLoading();
            const response = await fetch('/api/strategy/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.config = result.config;
                this.showNotification('设置保存成功', 'success');
                this.updateDashboard();
                this.updateStrategyMap();
            } else {
                this.showNotification(result.error || '保存失败', 'error');
            }
        } catch (error) {
            console.error('保存设置失败:', error);
            this.showNotification('保存失败，请检查网络连接', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    resetSettings() {
        this.config = { ...this.defaultConfig };
        this.loadSettings();
        this.showNotification('已重置为默认设置', 'success');
    }
    
    showModal(title, body, onConfirm) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = body;
        document.getElementById('modal-overlay').classList.add('active');
        
        if (onConfirm) {
            document.getElementById('modal-confirm').onclick = () => {
                onConfirm();
                this.hideModal();
            };
        }
    }
    
    hideModal() {
        document.getElementById('modal-overlay').classList.remove('active');
    }
    
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    showLoading() {
        document.getElementById('loading').classList.add('active');
    }
    
    hideLoading() {
        document.getElementById('loading').classList.remove('active');
    }
    
    calculateCompletion(actual, target) {
        return target > 0 ? (actual / target * 100).toFixed(1) : 0;
    }
    
    formatNumber(num) {
        return new Intl.NumberFormat('zh-CN').format(num);
    }
}

// 初始化应用
const app = new StrategyApp();