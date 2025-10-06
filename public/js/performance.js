// 性能监控模块
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.startTime = performance.now();
        this.init();
    }
    
    init() {
        this.measurePageLoad();
        this.measureResourceLoading();
        this.setupPerformanceObserver();
    }
    
    measurePageLoad() {
        window.addEventListener('load', () => {
            const loadTime = performance.now() - this.startTime;
            this.metrics.pageLoadTime = loadTime;
            
            // 获取更多性能指标
            if (performance.timing) {
                const timing = performance.timing;
                this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
                this.metrics.firstPaint = this.getFirstPaint();
                this.metrics.firstContentfulPaint = this.getFirstContentfulPaint();
            }
            
            console.log('📊 页面加载性能指标:', this.metrics);
        });
    }
    
    measureResourceLoading() {
        const resources = performance.getEntriesByType('resource');
        const resourceMetrics = {
            totalResources: resources.length,
            totalSize: 0,
            loadTimes: []
        };
        
        resources.forEach(resource => {
            resourceMetrics.totalSize += resource.transferSize || 0;
            resourceMetrics.loadTimes.push(resource.duration);
        });
        
        this.metrics.resources = resourceMetrics;
        this.metrics.averageLoadTime = resourceMetrics.loadTimes.reduce((a, b) => a + b, 0) / resourceMetrics.loadTimes.length;
    }
    
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'measure') {
                        this.metrics[entry.name] = entry.duration;
                    }
                });
            });
            
            observer.observe({ entryTypes: ['measure'] });
        }
    }
    
    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : null;
    }
    
    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return firstContentfulPaint ? firstContentfulPaint.startTime : null;
    }
    
    measureFunction(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        this.metrics[`function_${name}`] = end - start;
        return result;
    }
    
    async measureAsyncFunction(name, fn) {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        
        this.metrics[`async_function_${name}`] = end - start;
        return result;
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            memoryUsage: this.getMemoryUsage(),
            connectionInfo: this.getConnectionInfo(),
            timestamp: new Date().toISOString()
        };
    }
    
    getMemoryUsage() {
        if (performance.memory) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }
    
    getConnectionInfo() {
        if (navigator.connection) {
            return {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            };
        }
        return null;
    }
    
    exportMetrics() {
        const metrics = this.getMetrics();
        const blob = new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // 监控特定操作
    monitorOperation(name, operation) {
        return this.measureFunction(name, operation);
    }
    
    // 监控异步操作
    monitorAsyncOperation(name, operation) {
        return this.measureAsyncFunction(name, operation);
    }
    
    // 检查性能是否达标
    checkPerformanceThresholds() {
        const thresholds = {
            pageLoadTime: 3000, // 3秒
            domContentLoaded: 1500, // 1.5秒
            firstPaint: 1000, // 1秒
            firstContentfulPaint: 1500, // 1.5秒
            averageLoadTime: 500 // 0.5秒
        };
        
        const results = {};
        Object.keys(thresholds).forEach(key => {
            if (this.metrics[key] !== undefined) {
                results[key] = {
                    value: this.metrics[key],
                    threshold: thresholds[key],
                    passed: this.metrics[key] <= thresholds[key]
                };
            }
        });
        
        return results;
    }
    
    // 生成性能报告
    generateReport() {
        const metrics = this.getMetrics();
        const thresholds = this.checkPerformanceThresholds();
        
        const report = {
            summary: {
                pageLoadTime: metrics.pageLoadTime,
                totalResources: metrics.resources?.totalResources || 0,
                totalSize: metrics.resources?.totalSize || 0,
                averageLoadTime: metrics.averageLoadTime
            },
            thresholds: thresholds,
            recommendations: this.generateRecommendations(thresholds),
            timestamp: metrics.timestamp
        };
        
        return report;
    }
    
    generateRecommendations(thresholds) {
        const recommendations = [];
        
        if (thresholds.pageLoadTime && !thresholds.pageLoadTime.passed) {
            recommendations.push('页面加载时间过长，建议优化资源加载和代码分割');
        }
        
        if (thresholds.domContentLoaded && !thresholds.domContentLoaded.passed) {
            recommendations.push('DOM内容加载时间过长，建议优化JavaScript执行');
        }
        
        if (thresholds.firstPaint && !thresholds.firstPaint.passed) {
            recommendations.push('首次绘制时间过长，建议优化关键渲染路径');
        }
        
        if (thresholds.averageLoadTime && !thresholds.averageLoadTime.passed) {
            recommendations.push('资源平均加载时间过长，建议优化资源大小和网络请求');
        }
        
        return recommendations;
    }
}

// 创建全局性能监控器实例
window.performanceMonitor = new PerformanceMonitor();