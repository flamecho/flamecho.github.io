/**
 * 补填「运行 / 更新」两格
 *
 * 背景：主题的 refreshFn 把这两项写在 `if (GLOBAL_CONFIG_SITE.isPost) {...} else { ...runtime / last-push... }`
 * 的 else 分支里 —— 也就是说**只有在首页、归档这类非文章页才会填**，
 * 文章页上它们会永远停在 fa-spinner 转圈。
 * 这个脚本在每种页面都补一次（初次加载 + PJAX 换页），格式与主题保持一致。
 */
(function () {
  var DAY = 86400000;

  function daysSince(iso) {
    var t = Date.parse(iso);
    if (isNaN(t)) return null;
    return Math.max(0, Math.floor((Date.now() - t) / DAY));
  }

  function relSince(iso) {
    var t = Date.parse(iso);
    if (isNaN(t)) return null;
    var s = Math.max(0, Math.floor((Date.now() - t) / 1000));
    if (s < 60) return '刚刚';
    var m = Math.floor(s / 60);
    if (m < 60) return m + ' 分钟前';
    var hh = Math.floor(m / 60);
    if (hh < 24) return hh + ' 小时前';
    var d = Math.floor(hh / 24);
    if (d < 31) return d + ' 天前';
    if (d < 365) return Math.floor(d / 30) + ' 个月前';
    return Math.floor(d / 365) + ' 年前';
  }

  function fill() {
    var rt = document.getElementById('runtimeshow');
    if (rt && rt.querySelector('.fa-spinner')) {
      var d = daysSince(rt.getAttribute('data-publishDate'));
      var unit = (window.GLOBAL_CONFIG && window.GLOBAL_CONFIG.runtime) || '天';
      if (d !== null) rt.textContent = d + ' ' + unit;
    }

    var lp = document.getElementById('last-push-date');
    if (lp && lp.querySelector('.fa-spinner')) {
      var r = relSince(lp.getAttribute('data-lastPushDate'));
      if (r !== null) lp.textContent = r;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fill);
  } else {
    fill();
  }

  // 换页后侧栏会被整块替换，转圈又会回来 → 每次 PJAX 完成再补一次
  document.addEventListener('pjax:complete', fill);
  document.addEventListener('turbolinks:load', fill);
})();
