// 仪表盘模块 - 处理数据可视化和指标展示
class DashboardManager {
    constructor() {
        this.charts = {};
        this.metrics = {};
        this.init();
    }
    
    init() {
        this.setupCharts();
        this.setupMetrics();
    }
    
    setupCharts() {
        // 初始化图表容器
        this.chartConfigs = {
            monthlyTrend: {
                type: 'line',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: '月度业绩趋势'
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: '月份'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: '产值（万元）'
                            },
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '¥' + value + '万';
                                }
                            }
                        }
                    }
                }
            },
            quarterlyBreakdown: {
                type: 'bar',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: '季度目标分解'
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: '季度'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: '产值（万元）'
                            },
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '¥' + value + '万';
                                }
                            }
                        }
                    }
                }
            },
            conversionFunnel: {
                type: 'doughnut',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: '转化漏斗'
                        }
                    }
                }
            },
            performanceRadar: {
                type: 'radar',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: '关键指标雷达图'
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            }
        };
    }
    
    setupMetrics() {
        // 初始化指标计算器
        this.metricCalculators = {
            annualCompletion: (actual, target) => {
                return target > 0 ? (actual / target * 100).toFixed(1) : 0;
            },
            conversionRate: (signings, visits) => {
                return visits > 0 ? (signings / visits * 100).toFixed(1) : 0;
            },
            visitRate: (visits, measurements) => {
                return measurements > 0 ? (visits / measurements * 100).toFixed(1) : 0;
            },
            grossMargin: (profit, output) => {
                return output > 0 ? (profit / output * 100).toFixed(1) : 0;
            }
        };
    }
    
    updateDashboard(data) {
        this.updateMetrics(data);
        this.updateCharts(data);
        this.updateProgressBars(data);
    }
    
    updateMetrics(data) {
        const { weeklyData, config, monthlyData } = data;
        
        // 计算年度完成度
        const totalActual = weeklyData.reduce((sum, week) => sum + (week.outputValue || 0), 0);
        const annualCompletion = this.metricCalculators.annualCompletion(totalActual, config.annualTarget);
        
        // 更新年度目标卡片
        this.updateMetricCard('annual-completion', {
            value: `${annualCompletion}%`,
            progress: Math.min(annualCompletion, 100),
            details: {
                actual: `¥${this.formatNumber(totalActual * 10000)}`,
                target: `¥${this.formatNumber(config.annualTarget)}`
            }
        });
        
        // 计算其他关键指标
        this.updateKeyMetrics(weeklyData, config);
    }
    
    updateKeyMetrics(weeklyData, config) {
        const totals = this.calculateTotals(weeklyData);
        
        // 转化率
        const actualConversionRate = this.metricCalculators.conversionRate(totals.signings, totals.visits);
        this.updateMetricCard('conversion-rate', {
            value: `${actualConversionRate}%`,
            details: {
                target: `${config.conversionRate}%`,
                actual: `${actualConversionRate}%`
            }
        });
        
        // 到店率
        const actualVisitRate = this.metricCalculators.visitRate(totals.visits, totals.measurements);
        this.updateMetricCard('visit-rate', {
            value: `${actualVisitRate}%`,
            details: {
                target: `${config.visitRate}%`,
                actual: `${actualVisitRate}%`
            }
        });
        
        // 毛利率
        const actualGrossMargin = this.metricCalculators.grossMargin(totals.profit, totals.output);
        this.updateMetricCard('gross-margin', {
            value: `${actualGrossMargin}%`,
            details: {
                target: `${config.grossMargin}%`,
                actual: `${actualGrossMargin}%`
            }
        });
    }
    
    calculateTotals(weeklyData) {
        return weeklyData.reduce((totals, week) => {
            return {
                measurements: totals.measurements + (week.measurements || 0),
                visits: totals.visits + (week.visits || 0),
                signings: totals.signings + (week.signings || 0),
                output: totals.output + (week.outputValue || 0),
                profit: totals.profit + (week.grossProfit || 0)
            };
        }, {
            measurements: 0,
            visits: 0,
            signings: 0,
            output: 0,
            profit: 0
        });
    }
    
    updateMetricCard(cardId, data) {
        const card = document.getElementById(cardId);
        if (!card) return;
        
        // 更新主值
        const valueElement = card.querySelector('.metric-value');
        if (valueElement && data.value) {
            valueElement.textContent = data.value;
        }
        
        // 更新进度条
        if (data.progress !== undefined) {
            const progressFill = card.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = `${data.progress}%`;
            }
        }
        
        // 更新详细信息
        if (data.details) {
            Object.keys(data.details).forEach(key => {
                const element = document.getElementById(`${cardId.replace('-completion', '')}-${key}`);
                if (element) {
                    element.textContent = data.details[key];
                }
            });
        }
    }
    
    updateCharts(data) {
        this.updateMonthlyTrendChart(data);
        this.updateQuarterlyChart(data);
        this.updateConversionFunnel(data);
        this.updatePerformanceRadar(data);
    }
    
    updateMonthlyTrendChart(data) {
        const { monthlyData } = data;
        const ctx = document.getElementById('monthly-trend-chart');
        if (!ctx) return;
        
        // 销毁现有图表
        if (this.charts.monthlyTrend) {
            this.charts.monthlyTrend.destroy();
        }
        
        const months = monthlyData.map(item => item.month);
        const actualData = monthlyData.map(item => item.actualOutput);
        const targetData = monthlyData.map(item => item.targetOutput);
        
        this.charts.monthlyTrend = new Chart(ctx, {
            type: this.chartConfigs.monthlyTrend.type,
            data: {
                labels: months,
                datasets: [{
                    label: '实际产值',
                    data: actualData,
                    borderColor: '#000000',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: '目标产值',
                    data: targetData,
                    borderColor: '#666666',
                    backgroundColor: 'rgba(102, 102, 102, 0.1)',
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: false
                }]
            },
            options: this.chartConfigs.monthlyTrend.options
        });
    }
    
    updateQuarterlyChart(data) {
        const { config, quarterlyData } = data;
        const ctx = document.getElementById('quarterly-chart');
        if (!ctx) return;
        
        // 销毁现有图表
        if (this.charts.quarterlyBreakdown) {
            this.charts.quarterlyBreakdown.destroy();
        }
        
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        const targets = quarters.map(q => config.seasonalDistribution[q].target / 10000);
        const actuals = quarters.map(q => (quarterlyData[q] || 0) / 10000);
        
        this.charts.quarterlyBreakdown = new Chart(ctx, {
            type: this.chartConfigs.quarterlyBreakdown.type,
            data: {
                labels: quarters,
                datasets: [{
                    label: '目标产值',
                    data: targets,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderColor: '#000000',
                    borderWidth: 1
                }, {
                    label: '实际产值',
                    data: actuals,
                    backgroundColor: 'rgba(102, 102, 102, 0.8)',
                    borderColor: '#666666',
                    borderWidth: 1
                }]
            },
            options: this.chartConfigs.quarterlyBreakdown.options
        });
    }
    
    updateConversionFunnel(data) {
        const { weeklyData } = data;
        const ctx = document.getElementById('conversion-funnel-chart');
        if (!ctx) return;
        
        const totals = this.calculateTotals(weeklyData);
        
        // 销毁现有图表
        if (this.charts.conversionFunnel) {
            this.charts.conversionFunnel.destroy();
        }
        
        this.charts.conversionFunnel = new Chart(ctx, {
            type: this.chartConfigs.conversionFunnel.type,
            data: {
                labels: ['量房', '到店', '签约'],
                datasets: [{
                    data: [totals.measurements, totals.visits, totals.signings],
                    backgroundColor: [
                        'rgba(0, 0, 0, 0.8)',
                        'rgba(102, 102, 102, 0.8)',
                        'rgba(51, 51, 51, 0.8)'
                    ],
                    borderColor: [
                        '#000000',
                        '#666666',
                        '#333333'
                    ],
                    borderWidth: 2
                }]
            },
            options: this.chartConfigs.conversionFunnel.options
        });
    }
    
    updatePerformanceRadar(data) {
        const { weeklyData, config } = data;
        const ctx = document.getElementById('performance-radar-chart');
        if (!ctx) return;
        
        const totals = this.calculateTotals(weeklyData);
        const actualConversionRate = this.metricCalculators.conversionRate(totals.signings, totals.visits);
        const actualVisitRate = this.metricCalculators.visitRate(totals.visits, totals.measurements);
        const actualGrossMargin = this.metricCalculators.grossMargin(totals.profit, totals.output);
        
        // 销毁现有图表
        if (this.charts.performanceRadar) {
            this.charts.performanceRadar.destroy();
        }
        
        this.charts.performanceRadar = new Chart(ctx, {
            type: this.chartConfigs.performanceRadar.type,
            data: {
                labels: ['转化率', '到店率', '毛利率', '完成度'],
                datasets: [{
                    label: '目标值',
                    data: [
                        config.conversionRate,
                        config.visitRate,
                        config.grossMargin,
                        100
                    ],
                    borderColor: '#000000',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    pointBackgroundColor: '#000000',
                    pointBorderColor: '#000000'
                }, {
                    label: '实际值',
                    data: [
                        parseFloat(actualConversionRate),
                        parseFloat(actualVisitRate),
                        parseFloat(actualGrossMargin),
                        this.calculateAnnualCompletion(totals.output, config.annualTarget)
                    ],
                    borderColor: '#666666',
                    backgroundColor: 'rgba(102, 102, 102, 0.1)',
                    pointBackgroundColor: '#666666',
                    pointBorderColor: '#666666'
                }]
            },
            options: this.chartConfigs.performanceRadar.options
        });
    }
    
    updateProgressBars(data) {
        const { weeklyData, config } = data;
        const totals = this.calculateTotals(weeklyData);
        
        // 更新年度进度条
        const annualCompletion = this.calculateAnnualCompletion(totals.output, config.annualTarget);
        this.updateProgressBar('annual-progress', annualCompletion);
        
        // 更新季度进度条
        this.updateQuarterlyProgressBars(data);
    }
    
    updateQuarterlyProgressBars(data) {
        const { quarterlyData, config } = data;
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        
        quarters.forEach(quarter => {
            const target = config.seasonalDistribution[quarter].target;
            const actual = quarterlyData[quarter] || 0;
            const completion = this.calculateAnnualCompletion(actual, target);
            
            this.updateProgressBar(`${quarter.toLowerCase()}-progress`, completion);
            this.updateProgressText(`${quarter.toLowerCase()}-text`, completion);
        });
    }
    
    updateProgressBar(elementId, percentage) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.width = `${Math.min(percentage, 100)}%`;
        }
    }
    
    updateProgressText(elementId, percentage) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = `${percentage}%`;
        }
    }
    
    calculateAnnualCompletion(actual, target) {
        return target > 0 ? (actual / target * 100).toFixed(1) : 0;
    }
    
    formatNumber(num) {
        return new Intl.NumberFormat('zh-CN').format(num);
    }
    
    // 导出数据功能
    exportDashboardData(data) {
        const exportData = {
            timestamp: new Date().toISOString(),
            metrics: this.calculateAllMetrics(data),
            charts: this.prepareChartData(data),
            summary: this.generateSummary(data)
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    calculateAllMetrics(data) {
        const { weeklyData, config } = data;
        const totals = this.calculateTotals(weeklyData);
        
        return {
            annualCompletion: this.calculateAnnualCompletion(totals.output, config.annualTarget),
            conversionRate: this.metricCalculators.conversionRate(totals.signings, totals.visits),
            visitRate: this.metricCalculators.visitRate(totals.visits, totals.measurements),
            grossMargin: this.metricCalculators.grossMargin(totals.profit, totals.output),
            totalOutput: totals.output,
            totalProfit: totals.profit,
            totalMeasurements: totals.measurements,
            totalVisits: totals.visits,
            totalSignings: totals.signings
        };
    }
    
    prepareChartData(data) {
        return {
            monthlyTrend: data.monthlyData,
            quarterlyBreakdown: data.quarterlyData,
            conversionFunnel: this.calculateTotals(data.weeklyData)
        };
    }
    
    generateSummary(data) {
        const metrics = this.calculateAllMetrics(data);
        
        return {
            status: metrics.annualCompletion >= 100 ? '已完成' : '进行中',
            completionRate: metrics.annualCompletion,
            keyAchievements: [
                `总签约数: ${metrics.totalSignings}`,
                `总产值: ¥${this.formatNumber(metrics.totalOutput * 10000)}`,
                `转化率: ${metrics.conversionRate}%`,
                `毛利率: ${metrics.grossMargin}%`
            ],
            recommendations: this.generateRecommendations(metrics)
        };
    }
    
    generateRecommendations(metrics) {
        const recommendations = [];
        
        if (metrics.conversionRate < 20) {
            recommendations.push('转化率偏低，建议优化销售流程和客户跟进');
        }
        
        if (metrics.visitRate < 35) {
            recommendations.push('到店率偏低，建议改进量房质量和客户沟通');
        }
        
        if (metrics.grossMargin < 30) {
            recommendations.push('毛利率偏低，建议优化成本控制和定价策略');
        }
        
        if (metrics.annualCompletion < 80) {
            recommendations.push('年度完成度偏低，建议增加营销投入和团队激励');
        }
        
        return recommendations;
    }
    
    // 实时数据更新
    startRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            this.refreshDashboardData();
        }, 30000); // 每30秒更新一次
    }
    
    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    async refreshDashboardData() {
        try {
            // 这里可以添加API调用来获取最新数据
            // const response = await fetch('/api/dashboard/refresh');
            // const data = await response.json();
            // this.updateDashboard(data);
        } catch (error) {
            console.error('刷新仪表盘数据失败:', error);
        }
    }
}

// 创建全局仪表盘管理器实例
window.dashboardManager = new DashboardManager();