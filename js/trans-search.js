/* ==========================================================================
   汉化检索器 trans-search
   仅在含 #trans-search 的页面生效；支持 pjax 重复进入
   ========================================================================== */
(function () {
    var DATA_URL = '/trans-games.json';
    var DL_FALLBACK = 'https://pan.huang1111.cn/s/aEGgnUG';   // 网盘总目录（huang1111）
    var PLATS = ['PC', 'PS2', 'PSP', 'PSV', 'NS'];
    var TYPES = ['补丁', '预翻译', '补丁/预翻译'];
    var ORIENTS = ['乙女向', '蔷薇向', '其他'];
    var LANGS = ['JP', 'EN', 'KR'];
    // 语言值为 zip 名里的 [平台-语言]，展示时转成中文
    var LANG_LABEL = { JP: '日语', EN: '英语', KR: '韩语' };

    var DATA = [];
    var ST = {
        q: '', orient: [], plat: [], type: [], lang: [], brand: '',
        sort: 'trans', dir: 'desc', page: 1, size: 10
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
    // 若不做，`MARGINAL#4` 这类名字里的 `#` 会被浏览器当成锚点 → 实际请求被截断、图片 404
    function encPath(p) {
        if (!p) return '';
        var i = p.lastIndexOf('/');
        return p.slice(0, i + 1) + encodeURIComponent(p.slice(i + 1));
    }

    function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

    // 取向列表：绝大多数条目是单个字符串；个别作品同时属于乙女向和蔷薇向时用数组，
    // 顺序即徽章显示顺序（乙女在左、蔷薇在右），勾选任一取向都能筛到
    function orientsOf(g) {
        var v = g.orient;
        if (!v) return [];
        return Object.prototype.toString.call(v) === '[object Array]' ? v : [v];
    }

    // 一个游戏的开发/品牌列表：优先用 brands 数组（可能有多个），回退到单个 brand
    function brandsOf(g) {
        if (g.brands && g.brands.length) return g.brands;
        return g.brand ? [g.brand] : [];
    }

    // 发行商列表：优先用 publishers 数组（可能不止一个，如 ネオ アンジェリーク 天使の涙
    // = Idea Factory + Otomate），回退到单个 publisher
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

    // 缺失值恒沉底
    function cmpDate(a, b, dir) {
        var am = !a, bm = !b;
        if (am && bm) return 0;
        if (am) return 1;
        if (bm) return -1;
        return dir === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
    }

    /* ---------------- URL 同步 ---------------- */

    function readUrl() {
        var p = new URLSearchParams(location.search);
        ST.q = p.get('q') || '';
        ST.orient = (p.get('orient') || '').split(',').filter(Boolean);
        ST.plat = (p.get('plat') || '').split(',').filter(Boolean);
        ST.type = (p.get('type') || '').split(',').filter(Boolean);
        ST.lang = (p.get('lang') || '').split(',').filter(Boolean);
        ST.brand = p.get('brand') || '';
        ST.sort = p.get('sort') === 'release' ? 'release' : 'trans';
        ST.dir = p.get('dir') === 'asc' ? 'asc' : 'desc';
        ST.size = parseInt(p.get('size'), 10) || 10;
        ST.page = parseInt(p.get('page'), 10) || 1;
    }

    function writeUrl() {
        var p = new URLSearchParams();
        if (ST.q) p.set('q', ST.q);
        if (ST.orient.length) p.set('orient', ST.orient.join(','));
        if (ST.plat.length) p.set('plat', ST.plat.join(','));
        if (ST.type.length) p.set('type', ST.type.join(','));
        if (ST.lang.length) p.set('lang', ST.lang.join(','));
        if (ST.brand) p.set('brand', ST.brand);
        if (ST.sort !== 'trans') p.set('sort', ST.sort);
        if (ST.dir !== 'desc') p.set('dir', ST.dir);
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
            if (ST.plat.length && ST.plat.indexOf(g.plat) < 0) return false;
            // type 是数组：勾选任一标签即命中
            if (ST.type.length && !(g.type || []).some(function (t) {
                    return ST.type.indexOf(t) >= 0;
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

    function sorted(list) {
        if (ST.sort === 'release') {                     // 纯按发售时间排序
            return list.slice().sort(function (a, b) {
                return cmpDate(a.release, b.release, ST.dir);
            });
        }
        return list.slice().sort(function (a, b) {       // 默认：汉化时间倒序
            var c = cmpDate(a.transDate, b.transDate, ST.dir);
            if (c !== 0) return c;
            return cmpDate(a.release, b.release, 'desc');
        });
    }

    /* ---------------- 渲染 ---------------- */

    /* 获取按钮：
       - 同一下载类型只有 1 个（绝大多数）-> 沿用「汉化获取」
       - 同时有「补丁 + 预翻译」两个文件（如 INNOCENT INCEST）-> 拆成两个按钮 */
    var GH_TIP = '从 GitHub 下载，部分地区可能无法直连；打不开请改用页面顶部的网盘';
    var NETDISK_TIP = '打开网盘总目录';

    function tipFor(u) {
        return /^https:\/\/github\.com\//.test(u || '') ? GH_TIP : NETDISK_TIP;
    }

    function dlButtons(g) {
        var dls = (g.dls || []).filter(function (d) { return d && d.u; });
        if (dls.length >= 2) {
            return dls.map(function (d) {
                return '<a class="ts-dl" href="' + esc(d.u) + '" target="_blank" rel="noopener"' +
                       ' title="' + esc(tipFor(d.u)) + '">' +
                       '<i class="fa fa-download"></i>' + esc((d.t || '汉化') + '获取') + '</a>';
            }).join('');
        }
        var url = dls.length === 1 ? dls[0].u : DL_FALLBACK;
        return '<a class="ts-dl" href="' + esc(url) + '" target="_blank" rel="noopener"' +
               ' title="' + esc(tipFor(url)) + '"><i class="fa fa-download"></i>汉化获取</a>';
    }

    function cardHtml(g) {
        var badges = '';
        if (g.plat) badges += '<span class="ts-badge plat">' + esc(g.plat) + '</span>';
        (g.type || []).forEach(function (t) {                 // type 是数组，渲染多个徽章
            if (t) badges += '<span class="ts-badge type">' + esc(t) + '</span>';
        });
        // 语言徽章（样式同「类型」，绿）：值取自 zip 名的 [平台-语言]
        var lk = g.lang || 'JP';
        badges += '<span class="ts-badge lang">' + esc(LANG_LABEL[lk] || lk) + '</span>';
        orientsOf(g).forEach(function (o) {
            badges += '<span class="ts-badge orient">' + esc(o) + '</span>';
        });

        // 开发/品牌、发行商都可能不止一个 —— 全部展示，任选其一都能筛到
        var bs = brandsOf(g);
        var maker = esc(bs.join(' / '));
        var ps = publishersOf(g).filter(function (p) { return bs.indexOf(p) < 0; });
        if (ps.length) {
            maker += ' <span class="ts-pub">/ 发行 ' + esc(ps.join(' / ')) + '</span>';
        }

        // 日期改成带小标签的胶囊，避免「纯文字 + 分隔点」的廉价感
        var meta =
            '<span class="ts-date"><i class="ts-date-k">发售</i>' +
              (g.release ? esc(g.release) : '—') + '</span>' +
            '<span class="ts-daterow">' +
              '<span class="ts-date"><i class="ts-date-k">汉化</i>' +
                (g.transDate ? esc(g.transDate) : '—') + '</span>' +
              (g.retrans ? '<span class="ts-new" title="重新翻译">NEW !</span>' : '') +
            '</span>';

        return '' +
            '<div class="ts-card">' +
              '<div class="ts-cover">' +
                '<img data-src="' + esc(encPath(g.cover)) + '" alt="' + esc(g.name) + '" loading="lazy" decoding="async">' +
              '</div>' +
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
                '<div class="ts-bottom">' +
                  '<div class="ts-meta">' + meta + '</div>' +
                  '<div class="ts-actions">' + dlButtons(g) + '</div>' +
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
            img.onerror = function () { img.removeAttribute('src'); };  // 加载失败：保持透明，不显示占位
            img.src = src;
        };
        if (typeof window.IntersectionObserver !== 'function') {   // 老浏览器降级
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
    }

    /* ---------------- 构建 UI ---------------- */

    function uniqSorted(vals) {
        return vals.filter(Boolean).filter(function (v, i, a) {
            return a.indexOf(v) === i;
        }).sort(function (a, b) { return a.localeCompare(b, 'ja'); });
    }

    function chipsHtml(name, values, selected, labels) {
        return values.map(function (v) {
            var lab = labels && labels[v] ? labels[v] : v;   // labels 可把值映射成展示文案
            return '<button class="ts-chip' + (selected.indexOf(v) >= 0 ? ' active' : '') +
                   '" data-f="' + name + '" data-v="' + esc(v) + '">' + esc(lab) + '</button>';
        }).join('');
    }

    /* 自绘下拉：原生 <select> 的弹层由浏览器绘制，滚动条配色/圆角都无法控制，
       所以品牌与每页数量改用自绘控件（顺带给品牌加了搜索框） */
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

    /* 弹层定位：默认贴触发器左缘；右侧空间不够就整体左移，始终留在视口内（左右都兜住）。
       窄屏下弹层还会先收窄到视口能容纳的宽度，避免出现横向溢出条。 */
    function placePanel(dd) {
        var btn = dd.querySelector('.ts-dd-btn');
        var panel = dd.querySelector('.ts-dd-panel');
        if (!btn || !panel) return;
        var GAP = 10;                                   // 与视口边缘的留白
        panel.style.left = '';
        panel.style.maxWidth = '';
        panel.style.minWidth = '';
        var vw = document.documentElement.clientWidth || window.innerWidth || 0;
        if (!vw) return;
        var avail = vw - GAP * 2;
        var r = btn.getBoundingClientRect();
        if (r.width > avail) panel.style.minWidth = '0';        // min-width:100% 会压过 max-width，先让位
        if (panel.offsetWidth > avail) panel.style.maxWidth = avail + 'px';
        var pw = panel.offsetWidth;
        var left = 0;                                   // 相对触发器左缘的偏移
        if (r.left + pw > vw - GAP) left = (vw - GAP) - (r.left + pw);   // 右侧越界 -> 左移
        if (r.left + left < GAP) left = GAP - r.left;                    // 左侧越界 -> 拉回
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
            return DATA.some(function (g) { return g.plat === v; });
        });
        if (!plats.length) plats = PLATS.slice();
        var orients = ORIENTS.filter(function (v) {
            return DATA.some(function (g) { return orientsOf(g).indexOf(v) >= 0; });
        });
        if (!orients.length) orients = ORIENTS.slice();
        var types = uniqSorted([].concat.apply([], DATA.map(function (g) { return g.type || []; })));
        if (!types.length) types = TYPES.slice();
        // 只保留数据里出现过的语言，顺序固定为 日语→英语→韩语
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
              '<span class="ts-label">平台</span>' + chipsHtml('plat', plats, ST.plat) +
            '</div>' +
            '<div class="ts-row ts-row-wrap">' +
              '<span class="ts-label">类型</span>' + chipsHtml('type', types, ST.type) +
              ddHtml('brand', [{ v: '', t: '全部品牌' }].concat(brands.map(function (b) {
                  return { v: b, t: b };
              })), ST.brand) +
            '</div>' +
            '<div class="ts-row ts-row-wrap">' +
              '<span class="ts-label">排序</span>' +
              '<button class="ts-btn ts-sort' + (ST.sort === 'trans' ? ' on' : '') + '" data-s="trans">汉化时间</button>' +
              '<button class="ts-btn ts-sort' + (ST.sort === 'release' ? ' on' : '') + '" data-s="release">发售时间</button>' +
              '<button class="ts-btn ts-dir" title="切换升降序">' +
                (ST.dir === 'desc' ? '新 → 旧' : '旧 → 新') + '</button>' +
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
                    inp.value = '';                     // 每次打开都清空并复位过滤
                    filterDd(dd, '');
                    // 触屏设备不自动聚焦（否则会立刻弹出输入法）；鼠标设备保留「打开即打字」的便利。
                    // 混合设备（触屏笔记本）按「本次交互方式」判断：手指/笔点的不聚焦。
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
        var s = t.closest('.ts-sort');
        if (s) {
            ST.sort = s.getAttribute('data-s');
            root.querySelectorAll('.ts-sort').forEach(function (b) {
                b.classList.toggle('on', b === s);
            });
            ST.page = 1; render();
            return;
        }
        var d = t.closest('.ts-dir');
        if (d) {
            ST.dir = ST.dir === 'desc' ? 'asc' : 'desc';
            d.textContent = ST.dir === 'desc' ? '新 → 旧' : '旧 → 新';
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
            ST.q = ''; ST.orient = []; ST.plat = []; ST.type = []; ST.lang = [];
            ST.brand = ''; ST.page = 1;
            ST.sort = 'trans'; ST.dir = 'desc';
            buildUi(); render();
        });

        // 委托只在容器上绑一次，避免重建 UI 时重复叠加
        if (!root.dataset.tsDeleg) {
            root.addEventListener('click', onRootClick);
            root.addEventListener('input', function (e) {
                var inp = e.target && e.target.closest ? e.target.closest('.ts-dd-search') : null;
                if (inp) filterDd(inp.closest('.ts-dd'), inp.value);
            });
            root.dataset.tsDeleg = '1';
        }
    }

    /* 排序完全由用户决定：筛选/搜索**不会**改动排序。
       （曾有过「一筛选就自动切发售时间」的逻辑，会让汉化时间新、发售时间老的作品
         沉到后面几页 —— 新加的游戏一筛就看不见，故移除。） */

    function bindGlobalKeys() {
        if (!window.__tsGlobal) {
            window.__tsGlobal = 1;
            // 点击下拉以外的地方 -> 收起
            document.addEventListener('click', function (e) {
                if (!e.target || !e.target.closest || !e.target.closest('.ts-dd')) closeAllDd();
            });
            // Esc 收起
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') closeAllDd();
            });
            // 视口尺寸变化（窗口缩放、手机横竖屏）后重新定位已展开的弹层
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
        root = document.getElementById('trans-search');
        if (!root || root.dataset.tsInited) return;
        root.dataset.tsInited = '1';
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
