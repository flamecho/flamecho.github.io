/**
 * 页脚养鱼（挂载器）
 *
 * 绘制引擎是同目录的 fish.js（canvas 画的鱼 + 水面波动），
 * 这里只负责：① 在 footer 里准备好画布容器；② 等 jQuery 就绪后加载引擎；
 * ③ 按当前昼夜把水色写进 window.__fishWater。
 *
 * 说明：fish.js 自身带 `$(function(){ RENDERER.init() })`，所以只要容器先于它存在，
 * 加载完就会自动开始绘制。PJAX 换页会重建 footer，画布要手动搬过去（见 rebindAfterPjax）。
 */
(function () {
  var CONTAINER_ID = 'jsi-flying-fish-container';
  var ENGINE_SRC = '/js/fish.js';
  // 画布顶部比页脚上沿多出的高度（px），与 custom.css 里容器的 top 值保持一致
  var AIR_HEIGHT = 120;
  var loaded = false;

  // 水色：直接从 CSS 变量读，昼夜各一套（见 custom.css 的 --fish-water）
  function syncWaterColor() {
    var v = getComputedStyle(document.documentElement).getPropertyValue('--fish-water');
    v = (v || '').trim();
    window.__fishWater = v || (document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'rgba(122, 143, 201, .40)'
      : 'rgba(58, 98, 160, .34)');
  }

  function ensureContainer() {
    var footer = document.getElementById('footer');
    if (!footer) return null;

    var box = document.getElementById(CONTAINER_ID);
    if (!box) {
      box = document.createElement('div');
      box.id = CONTAINER_ID;
      box.className = 'footer-fish-canvas';
      box.setAttribute('aria-hidden', 'true');
      footer.insertBefore(box, footer.firstChild);
    }
    return box;
  }

  function loadEngine() {
    if (loaded) return;
    var box = ensureContainer();
    if (!box) return;
    loaded = true;

    // 画布比页脚高出的这段（px）就是水面之上的「空气层」，引擎据此把水面正好对齐页脚上沿
    window.__fishAir = AIR_HEIGHT;

    var s = document.createElement('script');
    s.src = ENGINE_SRC;
    s.defer = true;
    s.onload = function () {
      // 引擎按容器宽高建立画布；换主题后需要重新 setup 才能吃到新水色
      syncWaterColor();
      // fish.js 里的 init 可能还在等 DOM ready，canvas 晚一点才出现 → 轮询记下它
      var n = 0;
      (function grab() {
        var cv = document.querySelector('#' + CONTAINER_ID + ' canvas');
        if (cv) { window.__fishCanvas = cv; return; }
        if (++n < 20) setTimeout(grab, 100);
      })();
    };
    document.body.appendChild(s);
  }

  // 容器里没有 canvas 就造一个（PJAX 会把旧 canvas 连同 DOM 一起丢掉）
  function ensureCanvas(box) {
    var cv = box.querySelector('canvas');
    if (cv) return cv;
    if (window.__fishCanvas && window.__fishCanvas.parentNode === null) {
      box.appendChild(window.__fishCanvas);
      return window.__fishCanvas;
    }
    cv = document.createElement('canvas');
    box.appendChild(cv);
    return cv;
  }

  /**
   * PJAX 换页会把 #body-wrap（含 footer）整块替换 → 原来的 canvas 和容器一起被丢掉，
   * 引擎的 $container 还指着已脱离文档的旧节点，于是页脚空白。
   * 这里重建/搬回 canvas，重绑引擎引用并按新尺寸重新 setup；footer 还没挂上就重试。
   */
  function rebindAfterPjax() {
    var tries = 0;
    (function go() {
      var box = ensureContainer();
      var footer = document.getElementById('footer');
      if (!box || !footer || !footer.offsetHeight) {
        if (++tries < 12) setTimeout(go, 120);   // 等 PJAX 把 DOM 换完
        return;
      }

      var cv = ensureCanvas(box);
      window.__fishCanvas = cv;

      var R = window.RENDERER;
      if (!R || !window.jQuery) return;
      try {
        R.$container = window.jQuery('#' + CONTAINER_ID);
        R.$canvas = window.jQuery(cv);
        R.context = cv.getContext('2d');
        R.setup();            // 重算宽高、水面点、鱼群
      } catch (e) {
        // 拿不到就下次换页再试，不抛错打断页面
      }
    })();
  }

  function boot() {
    if (!ensureContainer()) return;
    syncWaterColor();

    // jQuery 是 defer 加载的，可能还没就绪；轮询等它（最多 ~5s）
    var tries = 0;
    (function waitJQ() {
      if (window.jQuery) return loadEngine();
      if (++tries > 50) return; // 放弃，别在控制台刷错
      setTimeout(waitJQ, 100);
    })();
  }

  // 昼夜切换时只更新水色（引擎每帧都读这个值），并让水面按新尺寸重算一次
  var themeObserver = new MutationObserver(function () {
    syncWaterColor();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  if (document.documentElement) {
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  // PJAX 换页：footer 可能被整块重建，需要把画布搬回去并重绑引擎
  document.addEventListener('pjax:complete', function () {
    rebindAfterPjax();
    syncWaterColor();
  });
  // 有的主题走 turbolinks / instant.page，一并兜住
  document.addEventListener('turbolinks:load', function () {
    rebindAfterPjax();
    syncWaterColor();
  });
})();
