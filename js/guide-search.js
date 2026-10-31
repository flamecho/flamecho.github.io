/* ==========================================================================
   攻略检索器 guide-search
   —— 与汉化发布页（trans-search）同一套外观与交互，差异只有四处：
      1. 数据源 /guide-games.json（source/_data/guide-games.json）
      2. 没有「类型」筛选，也没有「汉化时间」排序 / 汉化日期胶囊
      3. 右下角按钮 = 攻略名 + 攻略链接（一个游戏可挂多篇：本篇 / FD / 支线…）
      4. 没有封面时留一个占位框，不显示破图
   仅在含 #guide-search 的页面生效；支持 pjax 重复进入
   ========================================================================== */
(function () {
    var DATA_URL = '/guide-games.json';
    var PLATS = ['PC', 'PS1', 'PS2', 'PS3', 'PS4', 'PSP', 'PSV', 'GBA', 'DS', '3DS', 'NS', 'AND/iOS'];
    var ORIENTS = ['乙女向', '蔷薇向', '其他'];
    var LANGS = ['JP', 'EN', 'KR'];
    // 语言值统一用短码（与汉化页一致），展示时转成中文
    var LANG_LABEL = { JP: '日语', EN: '英语', KR: '韩语' };
    // 平台显示名：值（data-v / URL 参数 / 数据）仍用短码，只有界面文字换写法
    var PLAT_LABEL = { 'AND/iOS': 'AND / iOS' };

    function platLabel(p) { return PLAT_LABEL[p] || p; }

    var DATA = [];
    var ST = {
        q: '', orient: [], plat: [], lang: [], brand: '',
        dir: 'asc', page: 1, size: 10
    };
    var io = null;
    var root = null;

    /* ---------------- 工具 ---------------- */

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // 封面路径 → 可安全放进 URL 的形式（只编码文件名那一段）：
    // 若不做，名字里的 `#` 会被浏览器当成锚点 → 请求被截断、图片 404
    function encPath(p) {
        if (!p) return '';
        var i = p.lastIndexOf('/');
        return p.slice(0, i + 1) + encodeURIComponent(p.slice(i + 1));
    }

    // 取向列表：绝大多数条目是单个字符串；同时属于多个取向时用数组
    function orientsOf(g) {
        var v = g.orient;
        if (!v) return [];
        return Object.prototype.toString.call(v) === '[object Array]' ? v : [v];
    }

    // 平台列表：同一游戏多平台版本合并成一条（如 PSP + PSV），徽章全部显示、勾选任一都能筛到
    function platsOf(g) {
        var v = (g.plats && g.plats.length) ? g.plats : (g.plat ? [g.plat] : []);
        return v;
    }

    function brandsOf(g) {
        if (g.brands && g.brands.length) return g.brands;
        return g.brand ? [g.brand] : [];
    }

    function publishersOf(g) {
        if (g.publishers && g.publishers.length) return g.publishers;
        return g.publisher ? [g.publisher] : [];
    }

    // 品牌筛选池：开发商 + 发行商（选任意一个都能筛到）
    function brandPool(g) {
        var a = brandsOf(g).slice();
        var ps = publishersOf(g);
        for (var i = 0; i < ps.length; i++) {
            if (a.indexOf(ps[i]) < 0) a.push(ps[i]);
        }
        return a;
    }

    // 按游戏名排（日文假名用 ja 排序规则，空名恒沉底）
    function cmpName(a, b, dir) {
        var an = a.name || '', bn = b.name || '';
        if (!an && !bn) return 0;
        if (!an) return 1;
        if (!bn) return -1;
        var c = an.localeCompare(bn, 'ja');
        return dir === 'desc' ? -c : c;
    }

    /* ---------------- URL 同步 ---------------- */

    function readUrl() {
        var p = new URLSearchParams(location.search);
        ST.q = p.get('q') || '';
        ST.orient = (p.get('orient') || '').split(',').filter(Boolean);
        ST.plat = (p.get('plat') || '').split(',').filter(Boolean);
        ST.lang = (p.get('lang') || '').split(',').filter(Boolean);
        ST.brand = p.get('brand') || '';
        ST.dir = p.get('dir') === 'desc' ? 'desc' : 'asc';
        ST.size = parseInt(p.get('size'), 10) || 10;
        ST.page = parseInt(p.get('page'), 10) || 1;
    }

    function writeUrl() {
        var p = new URLSearchParams();
        if (ST.q) p.set('q', ST.q);
        if (ST.orient.length) p.set('orient', ST.orient.join(','));
        if (ST.plat.length) p.set('plat', ST.plat.join(','));
        if (ST.lang.length) p.set('lang', ST.lang.join(','));
        if (ST.brand) p.set('brand', ST.brand);
        if (ST.dir !== 'asc') p.set('dir', ST.dir);
        if (ST.size !== 10) p.set('size', ST.size);
        if (ST.page > 1) p.set('page', ST.page);
        var qs = p.toString();
        var url = location.pathname + (qs ? '?' + qs : '') + location.hash;
        try { history.replaceState(null, '', url); } catch (e) {}
    }

    /* ---------------- 筛选 + 排序 ---------------- */

    function filtered() {
        var q = ST.q.trim().toLowerCase();
        return DATA.filter(function (g) {
            if (ST.orient.length && !orientsOf(g).some(function (o) {
                    return ST.orient.indexOf(o) >= 0;
                })) return false;
            if (ST.plat.length && !platsOf(g).some(function (p) {
                    return ST.plat.indexOf(p) >= 0;
                })) return false;
            if (ST.lang.length && ST.lang.indexOf(g.lang || 'JP') < 0) return false;
            // brand 可命中开发商或发行商
            if (ST.brand && brandPool(g).indexOf(ST.brand) < 0) return false;
            if (q) {
                var hay = ((g.name || '') + ' ' + (g.nameSrc || '') + ' ' +
                           brandPool(g).join(' ')).toLowerCase();
                if (hay.indexOf(q) < 0) return false;
            }
            return true;
        });
    }

    // 只有「游戏名」一个排序维度：排序完全由用户决定，筛选/搜索不动排序
    function sorted(list) {
        return list.slice().sort(function (a, b) {
            return cmpName(a, b, ST.dir);
        });
    }

    /* ---------------- 渲染 ---------------- */

    /* 攻略按钮：一个游戏可以有多篇攻略（本篇 / FD / 支线…）
       —— 按钮文案就是攻略名，点了直接去攻略页 */
    function guideButtons(g) {
        var gs = (g.guides || []).filter(function (d) { return d && d.u; });
        if (!gs.length) return '';
        return gs.map(function (d) {
            var t = d.t || '攻略';
            return '<a class="ts-dl" data-t="' + esc(t) + '" href="' + esc(d.u) +
                   '" target="_blank" rel="noopener"' +
                   ' title="打开攻略：' + esc(t) + '">' +
                   '<i class="fa fa-external-link"></i>' + esc(t) + '</a>';
        }).join('');
    }

    function cardHtml(g) {
        var badges = '';
        // 多平台版本：每个平台一枚徽章
        platsOf(g).forEach(function (p) {
            badges += '<span class="ts-badge plat">' + esc(platLabel(p)) + '</span>';
        });
        // 语言徽章（绿，样式与汉化页同）
        var lk = g.lang || 'JP';
        badges += '<span class="ts-badge lang">' + esc(LANG_LABEL[lk] || lk) + '</span>';
        orientsOf(g).forEach(function (o) {
            badges += '<span class="ts-badge orient">' + esc(o) + '</span>';
        });

        var bs = brandsOf(g);
        var maker = esc(bs.join(' / '));
        var ps = publishersOf(g).filter(function (p) { return bs.indexOf(p) < 0; });
        if (ps.length) {
            maker += ' <span class="ts-pub">/ 发行 ' + esc(ps.join(' / ')) + '</span>';
        }

        // 没找到封面的条目：封面元素整个不渲染（不留占位框）
        var cover = g.cover
            ? '<div class="ts-cover"><img data-src="' + esc(encPath(g.cover)) + '" alt="' +
              esc(g.name) + '" loading="lazy" decoding="async"></div>'
            : '';

        return '' +
            '<div class="ts-card">' +
              cover +
              '<div class="ts-body">' +
                (g.vndb
                    ? '<a class="ts-name" href="' + esc(g.vndb) + '" target="_blank" rel="noopener">' + esc(g.name) + '</a>'
                    : '<div class="ts-name">' + esc(g.name) + '</div>') +
                (maker ? '<div class="ts-maker">' + maker + '</div>' : '') +
                (g.note
                    ? '<div class="ts-note"><i class="fa fa-info-circle"></i>' +
                      '<span>' + esc(g.note) + '</span></div>'
                    : '') +
                (badges ? '<div class="ts-badges">' + badges + '</div>' : '') +
                '<div class="ts-bottom ts-bottom-end">' +
                  '<div class="ts-actions">' + guideButtons(g) + '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
    }

    function pagerHtml(total, pages) {
        if (pages <= 1) return '';
        var h = '';
        h += '<button class="ts-page' + (ST.page === 1 ? ' disabled' : '') +
             '" data-p="' + (ST.page - 1) + '">‹</button>';
        var nums = [];
        for (var i = 1; i <= pages; i++) {
            if (i === 1 || i === pages || Math.abs(i - ST.page) <= 1) nums.push(i);
            else if (nums[nums.length - 1] !== '...') nums.push('...');
        }
        nums.forEach(function (n) {
            if (n === '...') { h += '<span class="ts-page gap">…</span>'; return; }
            h += '<button class="ts-page' + (n === ST.page ? ' current' : '') +
                 '" data-p="' + n + '">' + n + '</button>';
        });
        h += '<button class="ts-page' + (ST.page === pages ? ' disabled' : '') +
             '" data-p="' + (ST.page + 1) + '">›</button>';
        return h;
    }

    function lazyLoad(scope) {
        if (io) { io.disconnect(); io = null; }
        var imgs = scope.querySelectorAll('img[data-src]');
        if (!imgs.length) return;
        var load = function (img) {
            var src = img.getAttribute('data-src');
            if (!src) return;
            img.removeAttribute('data-src');
            img.onload = function () { img.classList.add('ts-loaded'); };
            img.onerror = function () { img.removeAttribute('src'); };  // 失败：保持透明
            img.src = src;
        };
        if (typeof window.IntersectionObserver !== 'function') {
            Array.prototype.forEach.call(imgs, load);
            return;
        }
        io = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { load(e.target); obs.unobserve(e.target); }
            });
        }, { rootMargin: '200px 0px' });
        Array.prototype.forEach.call(imgs, function (img) { io.observe(img); });
    }

    /* pangu 会在「拉丁字母 ↔ 汉字」交界处插空格（BLで英会話 → BL で英会話），
       按钮文案是我们自己定的，必须原样显示：按 data-t 还原，并清掉它塞进来的 <pangu>。
       pangu 的 autoSpacingPage 是「DOMContentLoaded + 1s」一次性执行，卡片是异步渲染的，
       所以不能只在 render 后修 —— 要盯着列表的 DOM 变化。 */
    function fixDlLabels() {
        Array.prototype.forEach.call(root.querySelectorAll('.ts-dl[data-t]'), function (a) {
            var want = a.getAttribute('data-t') || '';
            Array.prototype.forEach.call(a.querySelectorAll('pangu'), function (n) {
                n.parentNode.removeChild(n);
            });
            var text = '';
            Array.prototype.forEach.call(a.childNodes, function (n) {
                if (n.nodeType === 3) text += n.nodeValue;
            });
            if (text === want) return;                 // 已经是对的，别动（避免观察器自激）
            Array.prototype.forEach.call(a.childNodes, function (n) {
                if (n.nodeType === 3) a.removeChild(n);
            });
            a.appendChild(document.createTextNode(want));
        });
    }

    var dlObserver = null;
    function watchDlLabels() {
        fixDlLabels();
        [300, 1300, 2200].forEach(function (ms) { setTimeout(fixDlLabels, ms); });
        if (dlObserver) return;
        if (typeof MutationObserver === 'undefined') return;
        dlObserver = new MutationObserver(function () { fixDlLabels(); });
        dlObserver.observe(root, { childList: true, subtree: true, characterData: true });
    }

    function render() {
        var list = sorted(filtered());
        var total = list.length;
        var pages = Math.max(1, Math.ceil(total / ST.size));
        if (ST.page > pages) ST.page = pages;
        var start = (ST.page - 1) * ST.size;
        var page = list.slice(start, start + ST.size);

        var listEl = root.querySelector('.ts-list');
        var pagerEl = root.querySelector('.ts-pager');
        var countEl = root.querySelector('.ts-count');

        listEl.innerHTML = total === 0
            ? '<div class="ts-empty">没有匹配的游戏，试试放宽筛选条件。</div>'
            : page.map(cardHtml).join('');
        pagerEl.innerHTML = pagerHtml(total, pages);
        countEl.textContent = '共 ' + total + ' 个游戏 ・ 第 ' + ST.page + ' / ' + pages + ' 页';

        lazyLoad(listEl);
        writeUrl();
        fixDlLabels();
    }

    /* ---------------- 构建 UI ---------------- */

    function uniqSorted(vals) {
        return vals.filter(Boolean).filter(function (v, i, a) {
            return a.indexOf(v) === i;
        }).sort(function (a, b) { return a.localeCompare(b, 'ja'); });
    }

    function chipsHtml(name, values, selected, labels) {
        return values.map(function (v) {
            var lab = labels && labels[v] ? labels[v] : v;
            return '<button class="ts-chip' + (selected.indexOf(v) >= 0 ? ' active' : '') +
                   '" data-f="' + name + '" data-v="' + esc(v) + '">' + esc(lab) + '</button>';
        }).join('');
    }

    /* 自绘下拉：原生 <select> 的弹层由浏览器绘制，滚动条配色/圆角都无法控制 */
    function ddHtml(name, items, selected) {
        var cur = items.filter(function (x) { return x.v === selected; })[0] || items[0];
        var search = items.length > 12
            ? '<input type="text" class="ts-dd-search" placeholder="搜索…">' : '';
        return '<div class="ts-dd" data-dd="' + name + '">' +
                 '<button type="button" class="ts-dd-btn">' +
                   '<span class="ts-dd-cur">' + esc(cur.t) + '</span>' +
                   '<i class="ts-dd-caret"></i>' +
                 '</button>' +
                 '<div class="ts-dd-panel">' + search +
                   '<div class="ts-dd-list">' +
                     items.map(function (x) {
                         return '<div class="ts-dd-item' + (x.v === selected ? ' on' : '') +
                                '" data-v="' + esc(x.v) + '">' + esc(x.t) + '</div>';
                     }).join('') +
                   '</div>' +
                 '</div>' +
               '</div>';
    }

    function closeAllDd() {
        if (!root) return;
        root.querySelectorAll('.ts-dd.open').forEach(function (d) { d.classList.remove('open'); });
    }

    /* 弹层定位：默认贴触发器左缘；右侧空间不够就整体左移，始终留在视口内 */
    function placePanel(dd) {
        var btn = dd.querySelector('.ts-dd-btn');
        var panel = dd.querySelector('.ts-dd-panel');
        if (!btn || !panel) return;
        var GAP = 10;
        panel.style.left = '';
        panel.style.maxWidth = '';
        panel.style.minWidth = '';
        var vw = document.documentElement.clientWidth || window.innerWidth || 0;
        if (!vw) return;
        var avail = vw - GAP * 2;
        var r = btn.getBoundingClientRect();
        if (r.width > avail) panel.style.minWidth = '0';
        if (panel.offsetWidth > avail) panel.style.maxWidth = avail + 'px';
        var pw = panel.offsetWidth;
        var left = 0;
        if (r.left + pw > vw - GAP) left = (vw - GAP) - (r.left + pw);
        if (r.left + left < GAP) left = GAP - r.left;
        panel.style.left = Math.round(left) + 'px';
    }

    function placeOpenPanel() {
        if (!root) return;
        var d = root.querySelector('.ts-dd.open');
        if (d) placePanel(d);
    }

    function filterDd(dd, q) {
        q = (q || '').trim().toLowerCase();
        dd.querySelectorAll('.ts-dd-item').forEach(function (it) {
            it.style.display = (!q || it.textContent.toLowerCase().indexOf(q) >= 0) ? '' : 'none';
        });
    }

    function buildUi() {
        var brands = uniqSorted([].concat.apply([], DATA.map(brandPool)));
        // 筛选项全部由数据动态提取，避免写死值与数据不一致
        var plats = PLATS.filter(function (v) {
            return DATA.some(function (g) { return platsOf(g).indexOf(v) >= 0; });
        });
        if (!plats.length) plats = PLATS.slice();
        var orients = ORIENTS.filter(function (v) {
            return DATA.some(function (g) { return orientsOf(g).indexOf(v) >= 0; });
        });
        if (!orients.length) orients = ORIENTS.slice();
        var present = uniqSorted(DATA.map(function (g) { return g.lang || 'JP'; }));
        var langs = LANGS.filter(function (v) { return present.indexOf(v) >= 0; });
        present.forEach(function (v) { if (langs.indexOf(v) < 0) langs.push(v); });
        if (!langs.length) langs = LANGS.slice();

        root.innerHTML = '' +
          '<div class="ts-toolbar">' +
            '<div class="ts-row">' +
              '<div class="ts-search"><input type="text" class="ts-q" placeholder="搜索游戏..." value="' + esc(ST.q) + '"></div>' +
              '<button class="ts-btn ts-clear">清空筛选</button>' +
            '</div>' +
            '<div class="ts-row ts-row-wrap">' +
              '<span class="ts-label">取向</span>' + chipsHtml('orient', orients, ST.orient) +
            '</div>' +
            '<div class="ts-row ts-row-wrap">' +
              '<span class="ts-label">语言</span>' + chipsHtml('lang', langs, ST.lang, LANG_LABEL) +
            '</div>' +
            '<div class="ts-row ts-row-wrap">' +
              '<span class="ts-label">平台</span>' + chipsHtml('plat', plats, ST.plat, PLAT_LABEL) +
            '</div>' +
            '<div class="ts-row ts-row-wrap">' +
              '<span class="ts-label">品牌</span>' +
              ddHtml('brand', [{ v: '', t: '全部品牌' }].concat(brands.map(function (b) {
                  return { v: b, t: b };
              })), ST.brand) +
            '</div>' +
            '<div class="ts-row ts-row-wrap">' +
              '<span class="ts-label">排序</span>' +
              // 只有一个排序维度：做成「已选中」的静态标签，避免出现点了没反应的按钮
              '<span class="ts-btn on ts-static">游戏名</span>' +
              '<button class="ts-btn ts-dir" title="切换升降序">' +
                (ST.dir === 'asc' ? 'A → Z' : 'Z → A') + '</button>' +
              ddHtml('size', [10, 20, 50].map(function (n) {
                  return { v: String(n), t: '每页 ' + n };
              }), String(ST.size)) +
            '</div>' +
            '<div class="ts-row"><span class="ts-count"></span></div>' +
          '</div>' +
          '<div class="ts-list"><div class="ts-loading">加载中…</div></div>' +
          '<div class="ts-pager"></div>';

        bindUi();
    }

    function onRootClick(e) {
        var t = e.target.closest ? e.target : null;
        if (!t) return;

        // ---- 自绘下拉 ----
        var ddBtn = t.closest('.ts-dd-btn');
        if (ddBtn) {
            var dd = ddBtn.parentNode;
            var wasOpen = dd.classList.contains('open');
            closeAllDd();
            if (!wasOpen) {
                dd.classList.add('open');
                placePanel(dd);                     // 先定位（此时才量得到弹层宽度）
                var inp = dd.querySelector('.ts-dd-search');
                if (inp) {
                    inp.value = '';
                    filterDd(dd, '');
                    // 触屏设备不自动聚焦（否则立刻弹输入法）；鼠标设备保留「打开即打字」
                    var pt = e.pointerType || '';
                    var touchByPointer = (pt === 'touch' || pt === 'pen');
                    var coarseDevice = !window.matchMedia ||
                        !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
                    if (!touchByPointer && !coarseDevice) {
                        setTimeout(function () { inp.focus(); }, 0);
                    }
                }
            }
            return;
        }
        var ddIt = t.closest('.ts-dd-item');
        if (ddIt) {
            var box = ddIt.closest('.ts-dd');
            var nm = box.getAttribute('data-dd');
            var val = ddIt.getAttribute('data-v');
            if (nm === 'brand') {
                ST.brand = val; ST.page = 1;
            } else if (nm === 'size') {
                ST.size = parseInt(val, 10) || 10; ST.page = 1;
            }
            box.querySelector('.ts-dd-cur').textContent = ddIt.textContent;
            box.querySelectorAll('.ts-dd-item').forEach(function (x) {
                x.classList.toggle('on', x === ddIt);
            });
            closeAllDd();
            render();
            return;
        }
        if (t.closest('.ts-dd-panel')) return;      // 面板内部点击不收起

        var chip = t.closest('.ts-chip');
        if (chip) {
            var f = chip.getAttribute('data-f'), v = chip.getAttribute('data-v');
            var arr = ST[f];
            var i = arr.indexOf(v);
            if (i >= 0) arr.splice(i, 1); else arr.push(v);
            ST.page = 1;
            chip.classList.toggle('active');
            render();
            return;
        }
        var d = t.closest('.ts-dir');
        if (d) {
            ST.dir = ST.dir === 'asc' ? 'desc' : 'asc';
            d.textContent = ST.dir === 'asc' ? 'A → Z' : 'Z → A';
            ST.page = 1; render();
            return;
        }
        var pg = t.closest('.ts-page[data-p]');
        if (pg && !pg.classList.contains('disabled') && !pg.classList.contains('current')) {
            ST.page = parseInt(pg.getAttribute('data-p'), 10) || 1;
            render();
            if (root.scrollIntoView) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function bindUi() {
        var q = root.querySelector('.ts-q');
        var timer = null;
        q.addEventListener('input', function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                ST.q = q.value; ST.page = 1; render();
            }, 200);
        });

        root.querySelector('.ts-clear').addEventListener('click', function () {
            ST.q = ''; ST.orient = []; ST.plat = []; ST.lang = [];
            ST.brand = ''; ST.page = 1;
            ST.dir = 'asc';
            buildUi(); render();
        });

        // 委托只在容器上绑一次，避免重建 UI 时重复叠加
        if (!root.dataset.gsDeleg) {
            root.addEventListener('click', onRootClick);
            root.addEventListener('input', function (e) {
                var inp = e.target && e.target.closest ? e.target.closest('.ts-dd-search') : null;
                if (inp) filterDd(inp.closest('.ts-dd'), inp.value);
            });
            root.dataset.gsDeleg = '1';
        }
    }

    function bindGlobalKeys() {
        if (!window.__gsGlobal) {
            window.__gsGlobal = 1;
            document.addEventListener('click', function (e) {
                if (!e.target || !e.target.closest || !e.target.closest('.ts-dd')) closeAllDd();
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') closeAllDd();
            });
            window.addEventListener('resize', placeOpenPanel);
            window.addEventListener('orientationchange', placeOpenPanel);
        }
        document.addEventListener('keydown', function (e) {
            if (e.key !== '/' || !root) return;
            var tag = (document.activeElement && document.activeElement.tagName) || '';
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            var q = root.querySelector('.ts-q');
            if (!q) return;
            e.preventDefault();
            q.focus();
        });
    }

    /* ---------------- 入口 ---------------- */

    function init() {
        root = document.getElementById('guide-search');
        if (!root || root.dataset.gsInited) return;
        root.dataset.gsInited = '1';
        readUrl();
        buildUi();
        bindGlobalKeys();

        fetch(DATA_URL, { cache: 'no-cache' })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (d) {
                DATA = Array.isArray(d) ? d : [];
                buildUi();
                render();
                watchDlLabels();
            })
            .catch(function (err) {
                root.querySelector('.ts-list').innerHTML =
                    '<div class="ts-empty">数据加载失败：' + esc(err.message) + '</div>';
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    document.addEventListener('pjax:complete', init);
})();
