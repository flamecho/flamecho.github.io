// Butterfly主题头像切换脚本
class AvatarSwitcher {
  constructor() {
    this.avatars = {
      day: document.getElementById('avatar-day'),
      night: document.getElementById('avatar-night'),
      daySidebar: document.getElementById('avatar-day-sidebar'),
      nightSidebar: document.getElementById('avatar-night-sidebar')
    };

    this.init();
  }

  // 初始化
  init() {
    // 检查是否所有头像元素都存在
    this.checkAvatars();

    // 设置初始状态
    this.updateAvatars();

    // 监听主题切换
    this.bindEvents();

    // 监听PJAX
    this.bindPjax();

    console.log('头像切换器已初始化');
  }

  // 检查头像元素
  checkAvatars() {
    const missing = Object.entries(this.avatars)
      .filter(([key, el]) => !el)
      .map(([key]) => key);

    if (missing.length > 0) {
      console.warn(`未找到以下头像元素: ${missing.join(', ')}`);
    }
  }

  // 获取当前主题
  getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme');
  }

  // 判断是否为夜间模式
  isDarkMode() {
    return this.getCurrentTheme() === 'dark';
  }

  // 更新所有头像显示状态
  updateAvatars() {
    const isDark = this.isDarkMode();

    // 主内容区头像
    if (this.avatars.day) {
      this.avatars.day.style.display = isDark ? 'none' : 'block';
    }
    if (this.avatars.night) {
      this.avatars.night.style.display = isDark ? 'block' : 'none';
    }

    // 侧边栏头像
    if (this.avatars.daySidebar) {
      this.avatars.daySidebar.style.display = isDark ? 'none' : 'block';
    }
    if (this.avatars.nightSidebar) {
      this.avatars.nightSidebar.style.display = isDark ? 'block' : 'none';
    }
  }

  // 绑定事件
  bindEvents() {
    // 主题切换按钮
    const darkmodeBtn = document.getElementById('darkmode');
    if (darkmodeBtn) {
      darkmodeBtn.addEventListener('click', () => {
        // Butterly主题切换有动画延迟，稍等片刻再更新
        setTimeout(() => this.updateAvatars(), 150);
      });
    }

    // 备用方案：监听主题属性变化
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setTimeout(() => this.updateAvatars(), 50);
        }
      });
    });

    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  // 绑定PJAX事件
  bindPjax() {
    document.addEventListener('pjax:send', () => {
      // PJAX开始前清理
      this.observer?.disconnect();
    });

    document.addEventListener('pjax:complete', () => {
      // PJAX完成后重新初始化
      setTimeout(() => {
        // 重新获取元素引用
        this.avatars = {
          day: document.getElementById('avatar-day'),
          night: document.getElementById('avatar-night'),
          daySidebar: document.getElementById('avatar-day-sidebar'),
          nightSidebar: document.getElementById('avatar-night-sidebar')
        };

        this.checkAvatars();
        this.updateAvatars();
        this.bindEvents();
      }, 100);
    });
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 延迟初始化，确保所有DOM元素都已加载
  setTimeout(() => {
    window.avatarSwitcher = new AvatarSwitcher();
  }, 100);
});

// 导出供调试使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AvatarSwitcher;
}
