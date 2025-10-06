// 认证模块 - 处理用户登录、注册和权限管理
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.sessionToken = null;
        this.init();
    }
    
    init() {
        this.setupLeanCloud();
        this.checkAuthStatus();
    }
    
    setupLeanCloud() {
        // LeanCloud初始化
        AV.init({
            appId: 'your-app-id', // 这里需要替换为实际的App ID
            appKey: 'your-app-key', // 这里需要替换为实际的App Key
            serverURL: 'https://your-app-id.api.lncldglobal.com' // 这里需要替换为实际的Server URL
        });
    }
    
    async checkAuthStatus() {
        try {
            const user = AV.User.current();
            if (user) {
                this.currentUser = user;
                this.sessionToken = user.get('sessionToken');
                return true;
            }
            return false;
        } catch (error) {
            console.error('检查认证状态失败:', error);
            return false;
        }
    }
    
    async login(username, password) {
        try {
            const user = await AV.User.logIn(username, password);
            this.currentUser = user;
            this.sessionToken = user.get('sessionToken');
            
            // 保存到本地存储
            localStorage.setItem('user', JSON.stringify({
                id: user.id,
                username: user.get('username'),
                email: user.get('email'),
                sessionToken: this.sessionToken
            }));
            
            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.get('username'),
                    email: user.get('email'),
                    sessionToken: this.sessionToken
                }
            };
        } catch (error) {
            console.error('登录失败:', error);
            return {
                success: false,
                error: this.getErrorMessage(error)
            };
        }
    }
    
    async register(username, email, password) {
        try {
            const user = new AV.User();
            user.set('username', username);
            user.set('email', email);
            user.set('password', password);
            
            const result = await user.signUp();
            this.currentUser = result;
            this.sessionToken = result.get('sessionToken');
            
            // 保存到本地存储
            localStorage.setItem('user', JSON.stringify({
                id: result.id,
                username: result.get('username'),
                email: result.get('email'),
                sessionToken: this.sessionToken
            }));
            
            return {
                success: true,
                user: {
                    id: result.id,
                    username: result.get('username'),
                    email: result.get('email'),
                    sessionToken: this.sessionToken
                }
            };
        } catch (error) {
            console.error('注册失败:', error);
            return {
                success: false,
                error: this.getErrorMessage(error)
            };
        }
    }
    
    async logout() {
        try {
            await AV.User.logOut();
            this.currentUser = null;
            this.sessionToken = null;
            
            // 清除本地存储
            localStorage.removeItem('user');
            
            return { success: true };
        } catch (error) {
            console.error('退出登录失败:', error);
            return {
                success: false,
                error: '退出登录失败'
            };
        }
    }
    
    async changePassword(currentPassword, newPassword) {
        try {
            if (!this.currentUser) {
                throw new Error('用户未登录');
            }
            
            // 验证当前密码
            await AV.User.logIn(this.currentUser.get('username'), currentPassword);
            
            // 更新密码
            this.currentUser.set('password', newPassword);
            await this.currentUser.save();
            
            return { success: true };
        } catch (error) {
            console.error('修改密码失败:', error);
            return {
                success: false,
                error: this.getErrorMessage(error)
            };
        }
    }
    
    async updateProfile(updates) {
        try {
            if (!this.currentUser) {
                throw new Error('用户未登录');
            }
            
            Object.keys(updates).forEach(key => {
                this.currentUser.set(key, updates[key]);
            });
            
            await this.currentUser.save();
            
            return {
                success: true,
                user: {
                    id: this.currentUser.id,
                    username: this.currentUser.get('username'),
                    email: this.currentUser.get('email')
                }
            };
        } catch (error) {
            console.error('更新用户信息失败:', error);
            return {
                success: false,
                error: this.getErrorMessage(error)
            };
        }
    }
    
    isAuthenticated() {
        return this.currentUser !== null;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    getSessionToken() {
        return this.sessionToken;
    }
    
    async refreshUser() {
        try {
            if (!this.currentUser) return false;
            
            await this.currentUser.fetch();
            return true;
        } catch (error) {
            console.error('刷新用户信息失败:', error);
            return false;
        }
    }
    
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    validatePassword(password) {
        // 密码至少8位，包含字母和数字
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
        return passwordRegex.test(password);
    }
    
    validateUsername(username) {
        // 用户名3-20位，只能包含字母、数字和下划线
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    }
    
    getErrorMessage(error) {
        if (error.code) {
            switch (error.code) {
                case 210:
                    return '用户名或密码错误';
                case 202:
                    return '用户名已存在';
                case 203:
                    return '邮箱已被注册';
                case 125:
                    return '邮箱地址无效';
                case 200:
                    return '用户名不能为空';
                case 201:
                    return '密码不能为空';
                case 205:
                    return '找不到邮箱对应的用户';
                case 206:
                    return '无效的会话，请重新登录';
                case 207:
                    return '验证码错误';
                case 208:
                    return '第三方账号已绑定其他用户';
                case 209:
                    return '手机号码对应的用户不存在';
                case 211:
                    return '找不到用户';
                case 212:
                    return '手机号码不能为空';
                case 213:
                    return '手机号码对应的用户不存在';
                case 214:
                    return '手机号码已被注册';
                case 215:
                    return '手机号码未验证';
                case 216:
                    return '邮箱未验证';
                case 217:
                    return '用户名无效';
                case 218:
                    return '密码无效';
                case 219:
                    return '登录失败次数超过限制，请稍后再试';
                case 220:
                    return '用户名和密码不能为空';
                case 221:
                    return '用户名和密码不能为空';
                case 222:
                    return '用户名和密码不能为空';
                case 223:
                    return '用户名和密码不能为空';
                case 224:
                    return '用户名和密码不能为空';
                case 225:
                    return '用户名和密码不能为空';
                case 226:
                    return '用户名和密码不能为空';
                case 227:
                    return '用户名和密码不能为空';
                case 228:
                    return '用户名和密码不能为空';
                case 229:
                    return '用户名和密码不能为空';
                case 230:
                    return '用户名和密码不能为空';
                default:
                    return error.message || '操作失败';
            }
        }
        return error.message || '操作失败';
    }
    
    // 自动登录（从本地存储恢复）
    async autoLogin() {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) return false;
            
            const user = JSON.parse(userData);
            if (!user.sessionToken) return false;
            
            // 使用sessionToken登录
            AV.User.become(user.sessionToken);
            this.currentUser = AV.User.current();
            this.sessionToken = user.sessionToken;
            
            return true;
        } catch (error) {
            console.error('自动登录失败:', error);
            // 清除无效的本地存储
            localStorage.removeItem('user');
            return false;
        }
    }
    
    // 检查用户权限
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        const userRole = this.currentUser.get('role') || 'user';
        const permissions = {
            'user': ['read:own_data', 'write:own_data'],
            'admin': ['read:all_data', 'write:all_data', 'delete:all_data'],
            'super_admin': ['*']
        };
        
        const userPermissions = permissions[userRole] || permissions['user'];
        return userPermissions.includes('*') || userPermissions.includes(permission);
    }
    
    // 获取用户角色
    getUserRole() {
        if (!this.currentUser) return 'guest';
        return this.currentUser.get('role') || 'user';
    }
    
    // 检查是否为管理员
    isAdmin() {
        const role = this.getUserRole();
        return role === 'admin' || role === 'super_admin';
    }
    
    // 检查是否为超级管理员
    isSuperAdmin() {
        return this.getUserRole() === 'super_admin';
    }
}

// 创建全局认证管理器实例
window.authManager = new AuthManager();