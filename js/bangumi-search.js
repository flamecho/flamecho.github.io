(function() {
    function init() {
        var path = window.location.pathname;

        // 只在三个页面执行
        if (!path.match(/^\/(read|cinema|games)\//)) return;

        // 每次重新判断页面类型
        var pageType = 'read';
        var jsonFile = '/read.json';
        var typeLabel = '';
        var placeholderText = '搜索书籍...';
        var resultUnit = '本';
        var resultName = '书籍';
        if (path.match(/^\/cinema\//)) {
            pageType = 'cinema';
            jsonFile = '/cinemas.json';
            typeLabel = '影视';
            placeholderText = '搜索番剧...';
            resultUnit = '部';
            resultName = '番剧';
        } else if (path.match(/^\/games\//)) {
            pageType = 'game';
            jsonFile = '/games.json';
            typeLabel = '游戏';
            placeholderText = '搜索游戏...';
            resultUnit = '部';
            resultName = '游戏';
        }

        // 如果已经存在搜索框，先移除再重建，避免重复
        var existing = document.querySelector('.bangumi-search-wrapper');
        if (existing) {
            return;
        }

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

        var isSearching = false;
        var currentQuery = '';
        var currentPage = { wantWatch: 1, watching: 1, watched: 1 };
        var pageSize = 10;

        var containers = {
            wantWatch: document.getElementById('bangumi-item1'),
            watching: document.getElementById('bangumi-item2'),
            watched: document.getElementById('bangumi-item3')
        };

        var FULL_DATA = { wantWatch: [], watching: [], watched: [] };

        function loadData() {
            return fetch(jsonFile)
                .then(function(res) {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.json();
                })
                .then(function(data) {
                    if (pageType !== 'read') {
                        // 游戏/追剧：将 tags -> tag, collect -> follow
                        FULL_DATA.wantWatch = (data.wantWatch || []).map(function(item) {
                            return {
                                title: item.title || '',
                                tag: item.tags || '-',
                                follow: item.collect !== undefined ? String(item.collect) : '-',
                                score: item.score !== undefined ? String(item.score) : '-',
                                des: item.des || '',
                                link: item.id ? 'https://bangumi.tv/subject/' + item.id : '',
                                cover: item.cover || '',
                                totalCount: item.totalCount || 0,
                                ep_status: item.ep_status || 0,
                                myStars: item.myStars || '',
                                myComment: item.myComment || ''
                            };
                        });
                        FULL_DATA.watching = (data.watching || []).map(function(item) {
                            return {
                                title: item.title || '',
                                tag: item.tags || '-',
                                follow: item.collect !== undefined ? String(item.collect) : '-',
                                score: item.score !== undefined ? String(item.score) : '-',
                                des: item.des || '',
                                link: item.id ? 'https://bangumi.tv/subject/' + item.id : '',
                                cover: item.cover || '',
                                totalCount: item.totalCount || 0,
                                ep_status: item.ep_status || 0,
                                myStars: item.myStars || '',
                                myComment: item.myComment || ''
                            };
                        });
                        FULL_DATA.watched = (data.watched || []).map(function(item) {
                            return {
                                title: item.title || '',
                                tag: item.tags || '-',
                                follow: item.collect !== undefined ? String(item.collect) : '-',
                                score: item.score !== undefined ? String(item.score) : '-',
                                des: item.des || '',
                                link: item.id ? 'https://bangumi.tv/subject/' + item.id : '',
                                cover: item.cover || '',
                                totalCount: item.totalCount || 0,
                                ep_status: item.ep_status || 0,
                                myStars: item.myStars || '',
                                myComment: item.myComment || ''
                            };
                        });
                    } else {
                        // 阅读页面直接赋值
                        FULL_DATA.wantWatch = data.wantWatch || [];
                        FULL_DATA.watching = data.watching || [];
                        FULL_DATA.watched = data.watched || [];
                    }
                    return FULL_DATA;
                })
                .catch(function(err) {
                    loadFromDOM();
                });
        }

        function loadFromDOM() {
            Object.keys(containers).forEach(function(key) {
                var container = containers[key];
                if (!container) return;
                var items = container.querySelectorAll('.bangumi-item');
                items.forEach(function(item) {
                    var titleEl = item.querySelector('.bangumi-title a');
                    var title = titleEl ? titleEl.textContent.trim() : '';
                    if (!title) return;
                    var metaItems = item.querySelectorAll('.bangumi-info-item em');
                    var summaryEl = item.querySelector('.bangumi-summary p');
                    var commentEl = item.querySelector('.bangumi-my-comments');
                    var imgEl = item.querySelector('.bangumi-picture img');

                    var itemData = {
                        title: title,
                        link: titleEl ? titleEl.href : '',
                        cover: imgEl ? imgEl.src : '',
                        des: summaryEl ? summaryEl.textContent.replace(/^简介：/, '').trim() : '',
                        myStars: (function() {
                            var text = commentEl ? commentEl.textContent || '' : '';
                            var m = text.match(/我的评分：\s*(\d+)/);
                            return m ? m[1] : '';
                        })(),
                        myComment: (function() {
                            var text = commentEl ? commentEl.textContent || '' : '';
                            var m = text.match(/我的评价：(.+)/);
                            return m ? m[1].trim() : '';
                        })()
                    };

                    if (pageType === 'read') {
                        itemData.author = metaItems[0] ? metaItems[0].textContent.trim() : '';
                        itemData.platform = metaItems[1] ? metaItems[1].textContent.trim() : '';
                        itemData.perspective = metaItems[2] ? metaItems[2].textContent.trim() : '';
                        itemData.tag = metaItems[3] ? metaItems[3].textContent.trim() : '';
                    } else {
                        // 游戏/追剧：metaItems[0]=类型, [1]=标签, [2]=关注, [3]=评分
                        itemData.tag = metaItems[1] ? metaItems[1].textContent.trim() : '-';
                        itemData.follow = metaItems[2] ? metaItems[2].textContent.trim() : '-';
                        itemData.score = metaItems[3] ? metaItems[3].textContent.trim() : '-';
                        var progressText = item.querySelector('.bangumi-progress-text');
                        if (progressText) {
                            var match = progressText.textContent.match(/(\d+)\/(\d+)/);
                            if (match) {
                                itemData.ep_status = parseInt(match[1]);
                                itemData.totalCount = parseInt(match[2]);
                            }
                        }
                    }

                    FULL_DATA[key].push(itemData);
                });
            });
        }

        function getCoverUrl(cover) {
            if (!cover) return '/img/404.jpg';
            if (cover.startsWith('http://') || cover.startsWith('https://') || cover.startsWith('/')) {
                return cover;
            }
            return '/' + cover;
        }

        function escapeHtml(text) {
            if (!text) return '';
            var div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        var templates = {};

        function getTemplate(key) {
            if (templates[key]) return templates[key];
            var container = containers[key];
            if (!container) return null;
            var template = container.querySelector('.bangumi-item');
            if (!template) return null;
            templates[key] = template.cloneNode(true);
            return templates[key];
        }

        function renderCard(item, templateNode) {
            if (!templateNode) {
                return renderFallback(item);
            }

            var clone = templateNode.cloneNode(true);

            var titleLink = clone.querySelector('.bangumi-title a');
            if (titleLink) {
                titleLink.textContent = item.title || '未知';
                titleLink.href = item.link || '#';
            }

            var img = clone.querySelector('.bangumi-picture img');
            if (img) {
                var coverUrl = getCoverUrl(item.cover);
                if (img.hasAttribute('data-lazy-src')) {
                    img.setAttribute('data-lazy-src', coverUrl);
                }
                if (img.hasAttribute('data-src')) {
                    img.setAttribute('data-src', coverUrl);
                }
                if (img.src && !img.src.includes('data:image') && !img.src.includes('loading')) {
                    img.src = coverUrl;
                }
                img.onerror = function() { this.onerror = null; this.src = '/img/404.jpg'; };
            }

            var metaItems = clone.querySelectorAll('.bangumi-info-item em');

            if (pageType === 'read') {
                var readMeta = [item.author || '-', item.platform || '-', item.perspective || '-', item.tag || '-'];
                metaItems.forEach(function(el, index) {
                    if (index < readMeta.length) {
                        el.textContent = readMeta[index];
                    }
                });
            } else {
                var tagVal = item.tag || '-';
                var followVal = item.follow || '-';
                var scoreVal = item.score || '-';
                if (metaItems.length >= 4) {
                    if (metaItems[0]) metaItems[0].textContent = typeLabel;
                    if (metaItems[1]) metaItems[1].textContent = tagVal;
                    if (metaItems[2]) metaItems[2].textContent = followVal;
                    if (metaItems[3]) metaItems[3].textContent = scoreVal;
                }
            }

            var summaryP = clone.querySelector('.bangumi-summary p');
            if (summaryP) {
                summaryP.textContent = '简介：' + (item.des || '暂无简介');
            }

            var commentDiv = clone.querySelector('.bangumi-comments');
            var myCommentDiv = clone.querySelector('.bangumi-my-comments');

            var stars = item.myStars || '';
            var commentText = item.myComment || '';

            if (stars || commentText) {
                var scoreHtml = stars ? '<span class="bangumi-starstop"><span class="bangumi-starlight stars' + stars + '"></span></span>' : '暂无';

                if (myCommentDiv) {
                    var html = '我的评分：' + scoreHtml;
                    if (commentText) {
                        html += '<br>我的评价：' + escapeHtml(commentText);
                    }
                    myCommentDiv.innerHTML = html;
                    if (commentDiv) {
                        commentDiv.style.display = '';
                    }
                }
            } else {
                if (commentDiv) {
                    commentDiv.style.display = 'none';
                }
            }

            if (pageType !== 'read') {
                var progressDiv = clone.querySelector('.bangumi-progress');
                if (progressDiv) {
                    var progressText = progressDiv.querySelector('.bangumi-progress-text');
                    var progressBar = progressDiv.querySelector('.progress-bar');
                    if (progressText) {
                        var total = item.totalCount || 0;
                        var ep = item.ep_status || 0;
                        var progress = total > 0 ? Math.round((ep / total) * 100) : 0;
                        progressText.textContent = '追剧进度：' + ep + '/' + total;
                        if (progressBar) {
                            progressBar.style.width = Math.min(progress, 100) + '%';
                        }
                    }
                }
            }

            return clone.outerHTML;
        }

        function renderFallback(item) {
            var coverUrl = getCoverUrl(item.cover);
            var stars = item.myStars || '';
            var commentText = item.myComment || '';

            var scoreHtml = stars ? '<span class="bangumi-starstop"><span class="bangumi-starlight stars' + stars + '"></span></span>' : '暂无';

            var commentHtml = '';
            if (stars || commentText) {
                commentHtml = `
                    <div class="bangumi-comments" style="margin-top:5px;margin-left:0;clear:both;">
                        <div class="bangumi-my-comments">
                            我的评分：${scoreHtml}<br>
                            ${commentText ? '我的评价：' + escapeHtml(commentText) : ''}
                        </div>
                    </div>
                `;
            }

            var metaHtml = '';
            if (pageType === 'read') {
                metaHtml = `
                    <span class="bangumi-info-item"><span class="bangumi-info-label">作者</span><em>${escapeHtml(item.author || '-')}</em></span>
                    <span class="bangumi-info-item"><span class="bangumi-info-label">平台</span><em>${escapeHtml(item.platform || '-')}</em></span>
                    <span class="bangumi-info-item"><span class="bangumi-info-label">视角</span><em>${escapeHtml(item.perspective || '-')}</em></span>
                    <span class="bangumi-info-item"><span class="bangumi-info-label">标签</span><em>${escapeHtml(item.tag || '-')}</em></span>
                `;
            } else {
                metaHtml = `
                    <span class="bangumi-info-item bangumi-type"><span class="bangumi-info-label">类型</span><em>${typeLabel}</em></span>
                    <span class="bangumi-info-item bangumi-tag"><span class="bangumi-info-label">标签</span><em>${escapeHtml(item.tag || '-')}</em></span>
                    <span class="bangumi-info-item bangumi-info-item-follow"><span class="bangumi-info-label">关注</span><em>${escapeHtml(item.follow || '-')}</em></span>
                    <span class="bangumi-info-item bangumi-info-item-score"><span class="bangumi-info-label">评分</span><em>${escapeHtml(item.score || '-')}</em></span>
                `;
            }

            return `
                <div class="bangumi-item">
                    <div class="bangumi-picture">
                        <img src="${coverUrl}" referrerpolicy="no-referrer" loading="eager" width="110" style="width:110px;margin:20px auto;border-radius:8px;box-shadow:0px 0px 10px rgba(0,0,0,0.3);" onerror="this.onerror=null;this.src='/img/404.jpg'">
                    </div>
                    <div class="bangumi-info">
                        <div class="bangumi-title">
                            <a target="_blank" href="${item.link || '#'}" rel="external nofollow">${escapeHtml(item.title)}</a>
                        </div>
                        <div class="bangumi-meta">
                            <span class="bangumi-info-items">
                                ${metaHtml}
                            </span>
                        </div>
                        <div class="bangumi-summary"><p>简介：${escapeHtml(item.des || '暂无简介')}</p></div>
                    </div>
                    ${commentHtml}
                </div>
            `;
        }

        function renderContainer(key, items, page) {
            var container = containers[key];
            if (!container) return;

            var totalPages = Math.ceil(items.length / pageSize);
            var currentPageNum = Math.min(page || 1, totalPages || 1);
            var start = (currentPageNum - 1) * pageSize;
            var pageItems = items.slice(start, start + pageSize);

            var templateNode = getTemplate(key);

            var html = '';
            pageItems.forEach(function(item) {
                html += renderCard(item, templateNode);
            });

            if (totalPages > 1) {
                html += `
                    <div class="bangumi-pagination" style="margin-top:15px;text-align:center;margin-bottom:10px;">
                        <a class="bangumi-button bangumi-firstpage" href="javascript:;" onclick="window._bgGoPage('${key}', 1)"> 首页 </a>
                        <a class="bangumi-button bangumi-previouspage" href="javascript:;" onclick="window._bgGoPage('${key}', ${currentPageNum - 1})"> 上一页 </a>
                        <span class="bangumi-pagenum">${currentPageNum} / ${totalPages}</span>
                        <a class="bangumi-button bangumi-nextpage" href="javascript:;" onclick="window._bgGoPage('${key}', ${currentPageNum + 1})"> 下一页 </a>
                        <a class="bangumi-button bangumi-lastpage" href="javascript:;" onclick="window._bgGoPage('${key}', ${totalPages})"> 尾页 </a>
                    </div>
                `;
            }

            container.innerHTML = html;

            if (window.lazyLoadInstance) {
                window.lazyLoadInstance.update();
            }
        }

        function restoreAll() {
            Object.keys(FULL_DATA).forEach(function(key) {
                var items = FULL_DATA[key] || [];
                if (items.length > 0) {
                    renderContainer(key, items, 1);
                }
            });
            currentPage = { wantWatch: 1, watching: 1, watched: 1 };
            isSearching = false;
            stats.textContent = '';
            currentQuery = '';
            input.value = '';
        }

        function searchAndRender(q) {
            q = q.trim().toLowerCase();
            currentQuery = q;

            if (q === '') {
                if (isSearching) {
                    restoreAll();
                }
                return;
            }

            isSearching = true;

            var results = { wantWatch: [], watching: [], watched: [] };
            var totalMatched = 0;

            Object.keys(FULL_DATA).forEach(function(key) {
                var items = FULL_DATA[key] || [];
                var matched = items.filter(function(item) {
                    var searchText = '';
                    if (pageType === 'read') {
                        searchText = [item.title, item.author || '', item.platform || '', item.perspective || '', item.tag || '', item.des || '', item.myComment || '', item.myStars || ''].join(' ').toLowerCase();
                    } else {
                        searchText = [item.title, item.tag || '', item.follow || '', item.score || '', item.des || '', item.myComment || '', item.myStars || ''].join(' ').toLowerCase();
                    }
                    return searchText.indexOf(q) !== -1;
                });
                results[key] = matched;
                totalMatched += matched.length;
            });

            stats.textContent = '找到 ' + totalMatched + ' ' + resultUnit + '匹配的' + resultName;

            Object.keys(results).forEach(function(key) {
                var matched = results[key] || [];
                if (matched.length === 0) {
                    containers[key].innerHTML = `
                        <div class="bangumi-no-result" style="text-align:center;padding:40px 20px;color:#999;font-size:16px;">
                            <i class="fas fa-search" style="display:block;font-size:32px;margin-bottom:12px;color:#ccc;"></i>
                            <span>没有找到匹配的${resultName}</span>
                        </div>
                    `;
                    return;
                }
                var page = Math.min(currentPage[key] || 1, Math.ceil(matched.length / pageSize));
                renderContainer(key, matched, page);
            });
        }

        window._bgGoPage = function(key, page) {
            var q = currentQuery || input.value || '';
            q = q.trim().toLowerCase();

            var items;
            if (q === '') {
                items = FULL_DATA[key] || [];
            } else {
                items = (FULL_DATA[key] || []).filter(function(item) {
                    var searchText = '';
                    if (pageType === 'read') {
                        searchText = [item.title, item.author || '', item.platform || '', item.perspective || '', item.tag || '', item.des || '', item.myComment || '', item.myStars || ''].join(' ').toLowerCase();
                    } else {
                        searchText = [item.title, item.tag || '', item.follow || '', item.score || '', item.des || '', item.myComment || '', item.myStars || ''].join(' ').toLowerCase();
                    }
                    return searchText.indexOf(q) !== -1;
                });
            }

            var totalPages = Math.ceil(items.length / pageSize);
            if (page < 1) page = 1;
            if (page > totalPages) page = totalPages || 1;
            currentPage[key] = page;
            renderContainer(key, items, page);
        };

        var timer;
        input.addEventListener('input', function() {
            clearTimeout(timer);
            var q = this.value;
            if (q.trim() === '') {
                if (isSearching) {
                    restoreAll();
                }
                return;
            }
            currentPage = { wantWatch: 1, watching: 1, watched: 1 };
            timer = setTimeout(function() {
                searchAndRender(q);
            }, 300);
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.blur();
            }
        });

        // 移除了 focus/blur 的样式操作，完全由 CSS 控制

        document.addEventListener('click', function(e) {
            var tab = e.target.closest('.bangumi-tab');
            if (tab) {
                setTimeout(function() {
                    templates = {};
                    if (input.value.trim() !== '') {
                        searchAndRender(input.value);
                    } else if (isSearching) {
                        restoreAll();
                    }
                }, 150);
            }
        });

        loadData();
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
