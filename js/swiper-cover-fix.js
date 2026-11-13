/* 首页「文章轮播」（hexo-butterfly-swiper）封面修复
 *
 * 现象：第 5 篇 ↔ 第 1 篇循环切换时，看到的那张封面是空白的。
 *
 * 原因：该轮播的 Swiper 配置为 loop: true，Swipers 会在首尾各「克隆」一张幻灯片
 *   （DOM 里实际有 7 个 .blog-slider__item：5 张原始 + 1 张末篇克隆在开头 + 1 张首篇克隆在末尾）。
 *   而这些克隆片是插件脚本 swiper_init.js 在页面最后才创建出来的，
 *   主题的懒加载（vanilla-lazyload）只在初始化时扫描一次 DOM，
 *   之后新增的节点不在它的观察列表里 → 克隆片的 <img> 永远停在 1×1 占位 GIF 上。
 *   于是「5 → 1」时看到的是首篇的克隆片、「1 → 5」时看到的是末篇的克隆片，封面都是空的。
 *
 * 处理：轮播总共只有 5 张图，而且就在首屏，懒加载对它们没有任何意义 —— 直接让它们立即加载，
 *   并用 MutationObserver 覆盖 Swiper 之后再次克隆的情况（窗口尺寸变化等）。
 *   注意：这里只动 #swiper_container 里的图片，不影响页面其他懒加载。
 */
(function () {
    'use strict';

    function loadCarouselCovers() {
        var imgs = document.querySelectorAll('#swiper_container .blog-slider__item img[data-lazy-src]');
        for (var i = 0; i < imgs.length; i++) {
            var real = imgs[i].getAttribute('data-lazy-src');
            if (real && imgs[i].getAttribute('src') !== real) {
                imgs[i].setAttribute('src', real);
            }
        }
    }

    function watchCarousel() {
        var box = document.getElementById('swiper_container');
        if (!box || box.dataset.coverFixBound === '1') return;   // 同一个容器只绑一次
        box.dataset.coverFixBound = '1';
        // Swiper 克隆幻灯片时会往 .swiper-wrapper 里插入节点，这里补一次封面加载
        new MutationObserver(loadCarouselCovers).observe(box, { childList: true, subtree: true });
    }

    function init() {
        loadCarouselCovers();
        watchCarousel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    window.addEventListener('load', init);
    document.addEventListener('pjax:complete', init);
    window.addEventListener('resize', loadCarouselCovers);
})();
