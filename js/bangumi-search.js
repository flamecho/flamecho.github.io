/* ============================================================
 *  /games/ · /cinema/ · /read/ 的搜索框
 *
 *  设计要点（2026-10-13 重写）：
 *   - **不重建卡片 DOM**。旧实现是「fetch JSON → 用模板克隆出卡片 → 整块 innerHTML 覆盖」，
 *     既重复了一套卡片渲染逻辑（外观容易和插件模板漂移），又会把分页条一起冲掉
 *     （搜索后页码样式失效的根因）。
 *   - 现在只做两件事：给不匹配的 `.bangumi-item` 打上 `.bg-search-hide`（CSS 隐藏），
 *     再让插件那套分页（`window.bgPager.refresh()`）按「过滤后的条目集合」重新分页。
 *     卡片节点始终是页面原有节点 → **外观不可能变化**，页码也始终是同一套。
 *   - 搜索字段直接从 DOM 取（标题 / 各信息项的值 / 简介 / 我的评价），
 *     即「所见即所搜」，不再依赖 JSON 抓取，也不会因为字段改名而失配。
 *   - 支持多个关键词（空格分隔，需全部命中，AND）。
 *
 *  外观相关的部分（搜索框 DOM、统计文案、「没有找到匹配的」提示）与旧版保持一致。
 * ============================================================ */
(function() {
    // init() 每次进来都会覆盖成「按当前输入重新应用搜索」，供下面只注册一次的 tab 监听调用
    var reapply = null;

    function init() {
        var path = window.location.pathname;

        // 只在三个页面执行
        if (!path.match(/^\/(read|cinema|games)\//)) return;

        var placeholderText = '搜索书籍...';
        var resultUnit = '本';
        var resultName = '书籍';
        if (path.match(/^\/cinema\//)) {
            placeholderText = '搜索番剧...';
            resultUnit = '部';
            resultName = '番剧';
        } else if (path.match(/^\/games\//)) {
            placeholderText = '搜索游戏...';
            resultUnit = '部';
            resultName = '游戏';
        }

        // 已经初始化过就退出（PJAX 时下面会先把旧搜索框移除再重建）
        if (document.querySelector('.bangumi-search-wrapper')) return;

        var tabs = document.querySelector('.bangumi-tabs');
        if (!tabs) return;

        var wrapper = document.createElement('div');
        wrapper.className = 'bangumi-search-wrapper';
        wrapper.innerHTML = `
            <div style="position:relative;">
                <i class="fas fa-search bangumi-search-icon"></i>
                <input class="bangumi-search-input" id="bangumiSearchInput" type="text" placeholder="${placeholderText}">
            </div>
            <div class="bangumi-search-stats" id="searchStats"></div>
        `;
        tabs.parentNode.insertBefore(wrapper, tabs.nextSibling);

        var input = document.getElementById('bangumiSearchInput');
        var stats = document.getElementById('searchStats');

        var KEYS = ['wantWatch', 'watching', 'watched'];
        var containers = {
            wantWatch: document.getElementById('bangumi-item1'),
            watching: document.getElementById('bangumi-item2'),
            watched: document.getElementById('bangumi-item3')
        };

        function pagerOf(container) {
            return container ? container.querySelector('.bangumi-pagination') : null;
        }

        // 参与搜索/分页的条目（原有节点，不重建）
        function itemsOf(container) {
            return container ? Array.prototype.slice.call(container.querySelectorAll('.bangumi-item')) : [];
        }

        // 单个条目的可搜索文本 —— 只取「页面上真实显示的内容」
        function searchTextOf(item) {
            if (item.__bgSearchText) return item.__bgSearchText;
            var parts = [];
            var title = item.querySelector('.bangumi-title');
            if (title) parts.push(title.textContent);
            var values = item.querySelectorAll('.bangumi-info-item em');
            for (var i = 0; i < values.length; i++) parts.push(values[i].textContent);
            var summary = item.querySelector('.bangumi-summary');
            if (summary) parts.push(summary.textContent);
            var comment = item.querySelector('.bangumi-my-comments');
            if (comment) parts.push(comment.textContent);
            item.__bgSearchText = parts.join(' ').replace(/\s+/g, ' ').toLowerCase();
            return item.__bgSearchText;
        }

        function setHidden(item, hidden) {
            if (hidden) item.classList.add('bg-search-hide');
            else item.classList.remove('bg-search-hide');
        }

        // 「没有找到匹配的」占位块：沿用旧版的 DOM 与内联样式（外观不变）
        function setNoResult(container, show) {
            var existing = container.querySelector('.bangumi-no-result');
            if (show && !existing) {
                var div = document.createElement('div');
                div.className = 'bangumi-no-result';
                div.setAttribute('style', 'text-align:center;padding:40px 20px;color:#999;font-size:16px;');
                div.innerHTML = '<i class="fas fa-search" style="display:block;font-size:32px;margin-bottom:12px;color:#ccc;"></i>' +
                                '<span>没有找到匹配的' + resultName + '</span>';
                container.insertBefore(div, pagerOf(container) || null);
            } else if (!show && existing) {
                existing.parentNode.removeChild(existing);
            }
        }

        function refreshPager(container) {
            var pager = pagerOf(container);
            if (pager && window.bgPager) window.bgPager.refresh(pager);
        }

        function applySearch(query) {
            var tokens = String(query || '').trim().toLowerCase().split(/[\s\u3000]+/)
                .filter(function(t) { return t; });

            if (tokens.length === 0) { clearSearch(); return; }

            var totalMatched = 0;

            KEYS.forEach(function(key) {
                var container = containers[key];
                if (!container) return;
                var items = itemsOf(container);
                var matched = 0;

                items.forEach(function(item) {
                    var text = searchTextOf(item);
                    var hit = tokens.every(function(t) { return text.indexOf(t) !== -1; });
                    setHidden(item, !hit);
                    if (hit) matched++;
                });

                totalMatched += matched;
                setNoResult(container, matched === 0);
                refreshPager(container);
            });

            stats.textContent = '找到 ' + totalMatched + ' ' + resultUnit + '匹配的' + resultName;

            if (window.lazyLoadInstance) window.lazyLoadInstance.update();
        }

        function clearSearch() {
            KEYS.forEach(function(key) {
                var container = containers[key];
                if (!container) return;
                itemsOf(container).forEach(function(item) { setHidden(item, false); });
                setNoResult(container, false);
                refreshPager(container);
            });
            stats.textContent = '';
            if (window.lazyLoadInstance) window.lazyLoadInstance.update();
        }

        function currentQuery() {
            return input.value.trim();
        }

        var timer;
        input.addEventListener('input', function() {
            clearTimeout(timer);
            var q = this.value;
            if (q.trim() === '') {
                clearSearch();
                return;
            }
            timer = setTimeout(function() { applySearch(q); }, 300);
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.blur();
            }
        });

        // 让上面那个「只注册一次」的 tab 监听能重新应用当前搜索
        // （正常切 tab 其实什么都不用做 —— 三个板块在建初始索引时就一起过滤了；
        //   这里主要是兜底：插件开启服务端分页时，index.js 会异步往板块里补条目，补进来的条目需要重新过滤）
        reapply = function() {
            var q = currentQuery();
            if (q !== '') applySearch(q);
        };

        // 进入页面时如果输入框里有值（例如前进/后退），立即生效
        if (currentQuery() !== '') applySearch(currentQuery());
    }

    // 切 tab 后重新应用搜索 —— 只注册一次（init 在 PJAX 后会被反复调用，否则监听器会累积）
    if (!window.__bgSearchTabHooked) {
        window.__bgSearchTabHooked = true;
        document.addEventListener('click', function(e) {
            if (!e.target.closest || !e.target.closest('.bangumi-tab')) return;
            setTimeout(function() { if (reapply) reapply(); }, 150);
        });
    }

    // 首次加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // PJAX 切换后重新执行，并移除旧的搜索框
    document.addEventListener('pjax:complete', function() {
        var old = document.querySelector('.bangumi-search-wrapper');
        if (old) {
            old.parentNode.removeChild(old);
        }
        setTimeout(init, 200);
    });

})();
