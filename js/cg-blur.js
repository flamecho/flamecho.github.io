(function() {
    function initAll() {
        document.querySelectorAll('.cg:not([data-ready])').forEach(function(container) {
            var img = container.querySelector('img');
            if (!img) return;

            // 设置图片初始不可点击
            img.style.pointerEvents = 'none';

            // 如果已经有遮罩则跳过创建
            if (!container.querySelector('.cg-mask')) {
                var mask = document.createElement('div');
                mask.className = 'cg-mask';
                mask.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg><span>可能为未公开CG</span><span>点击查看</span>';
                container.appendChild(mask);
            }

            var mask = container.querySelector('.cg-mask');

            // 点击遮罩：解锁
            mask.addEventListener('click', function(e) {
                container.classList.add('unlocked');
                img.style.pointerEvents = 'auto';
                e.stopPropagation();
            });

            container.setAttribute('data-ready', 'true');
        });
    }

    initAll();

    var observer = new MutationObserver(initAll);
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('pjax:complete', initAll);
})();
