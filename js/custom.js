var percentFlag = false;

function essayScroll() {
  const e = (document.documentElement.scrollTop || window.pageYOffset) % document.documentElement.clientHeight;
  result <= 99 || (result = 99);
  if (!percentFlag && e + 100 >= document.documentElement.clientHeight && document.querySelector("#waterfall")) {
    setTimeout(() => {
      waterfall("#waterfall");
    }, 500);
  } else {
    setTimeout(() => {
      document.querySelector("#waterfall") && waterfall("#waterfall");
    }, 500);
  }
  const t = window.scrollY + document.documentElement.clientHeight;
  let n = document.getElementById("post-comment") || document.getElementById("footer");
  (n.offsetTop + n.offsetHeight / 2 < t || 90 < result) && (percentFlag = true);
}

function replaceAll(e, t, n) {
  return e.split(t).join(n);
}

var anzhiyu = {
  diffDate: function(e, t = false) {
    return typeof e === "string" ? e.split(" ")[0] : e;
  },

  changeTimeInEssay: function() {
    if (document.querySelector("#bber")) {
      document.querySelectorAll("#bber time").forEach(function(e) {
        var t = e;
        var n = t.getAttribute("datetime");
        if (n) {
          t.innerText = anzhiyu.diffDate(n, true);
          t.style.display = "inline";
        }
      });
    }
  },

  reflashEssayWaterFall: function() {
    if (document.querySelector("#waterfall")) {
      setTimeout(function() {
        if (typeof waterfall === "function") {
          waterfall("#waterfall");
        }
        var e = document.getElementById("waterfall");
        if (e) {
          e.classList.add("show");
        }
      }, 100);
    }
  },

  // 即刻短文轮播已改为纯 CSS 驱动（见 custom.css 的 scrollVertical），
  // 不再使用 Swiper：Swiper 的 loop 会克隆首尾幻灯片，导致位移索引错位、
  // 且其自动播放的方向与 CSS 动画不一致，循环回到第一条时会出现反向倒卷。
  // 这里只负责在 pjax 换页后把动画重置到第一条，避免沿用上一页的进度。
  restartEssayScroll: function() {
    var list = document.querySelector("#bber-talk");
    if (!list) return;
    list.style.animation = "none";
    void list.offsetHeight; // 强制重排，让动画从头开始
    list.style.animation = "";
  }
};

function handleWindowResize() {
  setTimeout(function() {
    if (typeof anzhiyu !== "undefined" && anzhiyu.reflashEssayWaterFall) {
      anzhiyu.reflashEssayWaterFall();
    }
  }, 200);
}

anzhiyu.changeTimeInEssay();
anzhiyu.reflashEssayWaterFall();

if (document.querySelector("#bber-talk")) {
  anzhiyu.restartEssayScroll();
}

window.addEventListener("resize", handleWindowResize);

document.addEventListener("pjax:complete", function() {
  setTimeout(function() {
    if (typeof anzhiyu !== "undefined" && anzhiyu.reflashEssayWaterFall) {
      anzhiyu.reflashEssayWaterFall();
    }
    if (typeof anzhiyu !== "undefined" && anzhiyu.changeTimeInEssay) {
      anzhiyu.changeTimeInEssay();
    }
    if (document.querySelector(".essay_bar_swiper_container") && typeof anzhiyu.refreshEssaySwiper === "function") {
      anzhiyu.restartEssayScroll();
    }
  }, 100);
});

document.addEventListener("DOMContentLoaded", function() {
  if (typeof anzhiyu !== "undefined" && anzhiyu.reflashEssayWaterFall) {
    anzhiyu.reflashEssayWaterFall();
  }
});

// 即刻短文轮播的位移完全由 keyframes 决定，条目高度固定为 30px，
// 不需要在窗口尺寸变化时重建动画（此前会在手机上因地址栏收缩触发 resize 而重置）。
function applyWgBtnGradient() {
  const scope = document.querySelector('.wg-scope[data-scope="worldview"]');
  if (!scope) return;

  const btns = scope.querySelectorAll('.wg-btn');
  const count = btns.length;
  if (count < 2) return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  // 日间： #6d84c0 → #3a62a0
  // 夜间： #5a6faa → #3c4f8b
  const start = isDark ? [90, 111, 170] : [109, 132, 192];
  const end = isDark ? [60, 79, 139] : [58, 98, 160];

  btns.forEach((btn, index) => {
    const t1 = index / count;
    const t2 = (index + 1) / count;

    const r1 = Math.round(start[0] + (end[0] - start[0]) * t1);
    const g1 = Math.round(start[1] + (end[1] - start[1]) * t1);
    const b1 = Math.round(start[2] + (end[2] - start[2]) * t1);

    const r2 = Math.round(start[0] + (end[0] - start[0]) * t2);
    const g2 = Math.round(start[1] + (end[1] - start[1]) * t2);
    const b2 = Math.round(start[2] + (end[2] - start[2]) * t2);

    btn.style.background = `linear-gradient(to right, rgb(${r1},${g1},${b1}), rgb(${r2},${g2},${b2}))`;
  });
}

// 监听主题切换（点击右上角暗色模式按钮）
document.addEventListener('click', function(e) {
  if (e.target.id === 'darkmode' || e.target.closest('#darkmode')) {
    setTimeout(applyWgBtnGradient, 80);
  }
});

// DOM 加载完成执行
document.addEventListener('DOMContentLoaded', applyWgBtnGradient);

// PJAX 完成后重新执行
document.addEventListener('pjax:complete', applyWgBtnGradient);

// 也监听属性变化（兜底）
const observer = new MutationObserver(function() {
  applyWgBtnGradient();
});
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme']
});
