// 图表模块 - 专门处理各种数据可视化图表
class ChartManager {
    constructor() {
        this.charts = {};
        this.chartConfigs = {};
        this.colors = {
            primary: '#000000',
            secondary: '#666666',
            accent: '#333333',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        };
        this.init();
    }
    
    init() {
        this.setupChartConfigs();
        this.setupChartDefaults();
    }
    
    setupChartConfigs() {
        this.chartConfigs = {
            // 线图配置
            line: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#000000',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#666666',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        display: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#666666',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            },
            
            // 柱状图配置
            bar: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#000000',
                        borderWidth: 1,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#666666',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        display: true,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#666666',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            },
            
            // 饼图配置
            doughnut: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#000000',
                        borderWidth: 1,
                        cornerRadius: 8
                    }
                }
            },
            
            // 雷达图配置
            radar: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#000000',
                        borderWidth: 1,
                        cornerRadius: 8
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#666666',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            },
            
            // 面积图配置
            area: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#000000',
                        borderWidth: 1,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#666666',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        display: true,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#666666',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        };
    }
    
    setupChartDefaults() {
        // 设置Chart.js全局默认值
        Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        Chart.defaults.font.size = 12;
        Chart.defaults.color = '#666666';
        Chart.defaults.plugins.legend.display = true;
        Chart.defaults.plugins.tooltip.enabled = true;
    }
    
    // 创建月度趋势图
    createMonthlyTrendChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        this.destroyChart(canvasId);
        
        const config = {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '实际产值',
                    data: data.actual,
                    borderColor: this.colors.primary,
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: this.colors.primary,
                    pointBorderColor: this.colors.primary,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }, {
                    label: '目标产值',
                    data: data.target,
                    borderColor: this.colors.secondary,
                    backgroundColor: 'rgba(102, 102, 102, 0.1)',
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: false,
                    pointBackgroundColor: this.colors.secondary,
                    pointBorderColor: this.colors.secondary,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                ...this.chartConfigs.line,
                plugins: {
                    ...this.chartConfigs.line.plugins,
                    title: {
                        display: true,
                        text: '月度业绩趋势',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: this.colors.primary
                    }
                },
                scales: {
                    ...this.chartConfigs.line.scales,
                    y: {
                        ...this.chartConfigs.line.scales.y,
                        title: {
                            display: true,
                            text: '产值（万元）',
                            color: this.colors.primary,
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            ...this.chartConfigs.line.scales.y.ticks,
                            callback: function(value) {
                                return '¥' + value + '万';
                            }
                        }
                    }
                }
            }
        };
        
        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    }
    
    // 创建季度分解图
    createQuarterlyChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        this.destroyChart(canvasId);
        
        const config = {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '目标产值',
                    data: data.targets,
                    backgroundColor: this.colors.primary,
                    borderColor: this.colors.primary,
                    borderWidth: 1
                }, {
                    label: '实际产值',
                    data: data.actuals,
                    backgroundColor: this.colors.secondary,
                    borderColor: this.colors.secondary,
                    borderWidth: 1
                }]
            },
            options: {
                ...this.chartConfigs.bar,
                plugins: {
                    ...this.chartConfigs.bar.plugins,
                    title: {
                        display: true,
                        text: '季度目标分解',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: this.colors.primary
                    }
                },
                scales: {
                    ...this.chartConfigs.bar.scales,
                    y: {
                        ...this.chartConfigs.bar.scales.y,
                        title: {
                            display: true,
                            text: '产值（万元）',
                            color: this.colors.primary,
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            ...this.chartConfigs.bar.scales.y.ticks,
                            callback: function(value) {
                                return '¥' + value + '万';
                            }
                        }
                    }
                }
            }
        };
        
        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    }
    
    // 创建转化漏斗图
    createConversionFunnel(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        this.destroyChart(canvasId);
        
        const config = {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        this.colors.primary,
                        this.colors.secondary,
                        this.colors.accent
                    ],
                    borderColor: [
                        this.colors.primary,
                        this.colors.secondary,
                        this.colors.accent
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                ...this.chartConfigs.doughnut,
                plugins: {
                    ...this.chartConfigs.doughnut.plugins,
                    title: {
                        display: true,
                        text: '转化漏斗',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: this.colors.primary
                    }
                }
            }
        };
        
        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    }
    
    // 创建性能雷达图
    createPerformanceRadar(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        this.destroyChart(canvasId);
        
        const config = {
            type: 'radar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '目标值',
                    data: data.targets,
                    borderColor: this.colors.primary,
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    pointBackgroundColor: this.colors.primary,
                    pointBorderColor: this.colors.primary,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }, {
                    label: '实际值',
                    data: data.actuals,
                    borderColor: this.colors.secondary,
                    backgroundColor: 'rgba(102, 102, 102, 0.1)',
                    pointBackgroundColor: this.colors.secondary,
                    pointBorderColor: this.colors.secondary,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                ...this.chartConfigs.radar,
                plugins: {
                    ...this.chartConfigs.radar.plugins,
                    title: {
                        display: true,
                        text: '关键指标雷达图',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: this.colors.primary
                    }
                }
            }
        };
        
        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    }
    
    // 创建进度对比图
    createProgressComparison(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        this.destroyChart(canvasId);
        
        const config = {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '完成度',
                    data: data.progress,
                    backgroundColor: data.progress.map(p => 
                        p >= 100 ? this.colors.success : 
                        p >= 80 ? this.colors.warning : 
                        this.colors.error
                    ),
                    borderColor: data.progress.map(p => 
                        p >= 100 ? this.colors.success : 
                        p >= 80 ? this.colors.warning : 
                        this.colors.error
                    ),
                    borderWidth: 1
                }]
            },
            options: {
                ...this.chartConfigs.bar,
                plugins: {
                    ...this.chartConfigs.bar.plugins,
                    title: {
                        display: true,
                        text: '进度对比',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: this.colors.primary
                    }
                },
                scales: {
                    ...this.chartConfigs.bar.scales,
                    y: {
                        ...this.chartConfigs.bar.scales.y,
                        max: 100,
                        title: {
                            display: true,
                            text: '完成度（%）',
                            color: this.colors.primary,
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            ...this.chartConfigs.bar.scales.y.ticks,
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        };
        
        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    }
    
    // 创建趋势分析图
    createTrendAnalysis(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        this.destroyChart(canvasId);
        
        const config = {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: data.datasets.map((dataset, index) => ({
                    label: dataset.label,
                    data: dataset.data,
                    borderColor: this.getColorByIndex(index),
                    backgroundColor: this.getColorByIndex(index, 0.1),
                    tension: 0.4,
                    fill: dataset.fill || false,
                    pointBackgroundColor: this.getColorByIndex(index),
                    pointBorderColor: this.getColorByIndex(index),
                    pointRadius: 3,
                    pointHoverRadius: 5
                }))
            },
            options: {
                ...this.chartConfigs.line,
                plugins: {
                    ...this.chartConfigs.line.plugins,
                    title: {
                        display: true,
                        text: data.title || '趋势分析',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: this.colors.primary
                    }
                }
            }
        };
        
        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    }
    
    // 获取颜色
    getColorByIndex(index, alpha = 1) {
        const colors = [
            this.colors.primary,
            this.colors.secondary,
            this.colors.accent,
            this.colors.success,
            this.colors.warning,
            this.colors.error,
            this.colors.info
        ];
        
        const color = colors[index % colors.length];
        if (alpha < 1) {
            return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
        }
        return color;
    }
    
    // 销毁图表
    destroyChart(canvasId) {
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
            delete this.charts[canvasId];
        }
    }
    
    // 销毁所有图表
    destroyAllCharts() {
        Object.keys(this.charts).forEach(canvasId => {
            this.destroyChart(canvasId);
        });
    }
    
    // 更新图表数据
    updateChartData(canvasId, newData) {
        if (this.charts[canvasId]) {
            this.charts[canvasId].data = newData;
            this.charts[canvasId].update();
        }
    }
    
    // 导出图表为图片
    exportChartAsImage(canvasId, filename) {
        if (this.charts[canvasId]) {
            const canvas = this.charts[canvasId].canvas;
            const link = document.createElement('a');
            link.download = filename || `chart-${canvasId}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
    }
    
    // 导出所有图表为图片
    exportAllChartsAsImages() {
        Object.keys(this.charts).forEach(canvasId => {
            this.exportChartAsImage(canvasId, `chart-${canvasId}.png`);
        });
    }
    
    // 调整图表大小
    resizeChart(canvasId) {
        if (this.charts[canvasId]) {
            this.charts[canvasId].resize();
        }
    }
    
    // 调整所有图表大小
    resizeAllCharts() {
        Object.keys(this.charts).forEach(canvasId => {
            this.resizeChart(canvasId);
        });
    }
    
    // 获取图表数据
    getChartData(canvasId) {
        if (this.charts[canvasId]) {
            return this.charts[canvasId].data;
        }
        return null;
    }
    
    // 设置图表主题
    setTheme(theme) {
        if (theme === 'dark') {
            this.colors = {
                primary: '#ffffff',
                secondary: '#cccccc',
                accent: '#999999',
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
                info: '#3b82f6'
            };
        } else {
            this.colors = {
                primary: '#000000',
                secondary: '#666666',
                accent: '#333333',
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
                info: '#3b82f6'
            };
        }
        
        // 重新创建所有图表
        this.destroyAllCharts();
    }
}

// 创建全局图表管理器实例
window.chartManager = new ChartManager();