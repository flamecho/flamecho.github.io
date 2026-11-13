/**
 * 侧边栏「系列文章 / 最新文章 / 最新评论」卡片折叠
 *
 * 默认只显示第一条，其余条目由 custom.css 的 :nth-child(n+2) 收起，
 * 列表底部由本脚本插入一条「(fa-angle-down) 更多」按钮；
 * 点标题或按钮展开全部，按钮变成「(fa-angle-up) 收起」，再点回到一条。
 *
 * 用 document 级事件委托，PJAX 换页、移动端克隆节点都无需重新绑定；
 * 按钮是 JS 插入的，所以换页后要在 pjax:complete 里补插。
 * 最新评论卡的内容是 twikoo 异步写入的，另外用 MutationObserver 兜住。
 */
(function () {
  if (window.__asideCollapseBound) return;
  window.__asideCollapseBound = true;

  var CARD_SELECTOR = '.card-widget.card-post-series, .card-widget.card-recent-post, #card-newest-comments';
  var HEAD_SELECTOR = '.card-post-series > .item-headline, .card-recent-post > .item-headline, #card-newest-comments > .item-headline';

  // 只在状态变化时写 DOM，避免 MutationObserver 自激
  function setBtnLabel(btn, expanded) {
    var state = expanded ? 'expanded' : 'collapsed';
    if (btn.dataset.state === state) return;
    btn.dataset.state = state;
    btn.innerHTML = expanded
      ? '<i class="fa-solid fa-angle-up"></i><span>收起</span>'
      : '<i class="fa-solid fa-angle-down"></i><span>更多</span>';
  }

  function ensureButtons() {
    var cards = document.querySelectorAll(CARD_SELECTOR);
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var list = card.querySelector(':scope > .aside-list');
      if (!list) continue;

      var itemCount = list.querySelectorAll('.aside-list-item').length;
      var btn = card.querySelector(':scope > .aside-more-btn');

      // 只有一条时没有「更多」可看
      if (itemCount <= 1) {
        if (btn) btn.parentNode.removeChild(btn);
        continue;
      }

      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'aside-more-btn';
        list.parentNode.insertBefore(btn, list.nextSibling);
      }
      setBtnLabel(btn, card.classList.contains('is-expanded'));
    }
  }

  function toggleCard(card) {
    var expanded = card.classList.toggle('is-expanded');
    var btn = card.querySelector(':scope > .aside-more-btn');
    if (btn) setBtnLabel(btn, expanded);

    // 收起时后面的条目是 display:none，展开后要让懒加载补图
    if (expanded && window.lazyLoadInstance && typeof window.lazyLoadInstance.update === 'function') {
      window.lazyLoadInstance.update();
    }
  }

  document.addEventListener('click', function (e) {
    var target = e.target;
    if (!target || typeof target.closest !== 'function') return;

    var btn = target.closest('.aside-more-btn');
    if (btn) {
      var card = btn.closest('.card-widget, #card-newest-comments');
      if (card) {
        e.preventDefault();
        toggleCard(card);
      }
      return;
    }

    var head = target.closest(HEAD_SELECTOR);
    if (head) {
      var c = head.closest('.card-widget, #card-newest-comments');
      if (c) toggleCard(c);
    }
  });

  // twikoo 的最新评论是 AJAX 填充 / 换页重建的，DOM 变了就补一次按钮。
  // 注意用 throttle 而不是 debounce：首页的懒加载/轮播/pangu 会持续产生 mutation，
  // debounce 会被无限推迟，导致按钮永远补不上。
  var timer = null;
  var observer = new MutationObserver(function () {
    if (timer) return;
    timer = setTimeout(function () {
      timer = null;
      ensureButtons();
    }, 200);
  });

  function start() {
    ensureButtons();
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  // 暴露给调试/兜底调用（例如某些异步渲染没触发 MutationObserver 时）
  window.__asideCollapseEnsure = ensureButtons;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
  document.addEventListener('pjax:complete', ensureButtons);
  document.addEventListener('turbolinks:load', ensureButtons);
})();
