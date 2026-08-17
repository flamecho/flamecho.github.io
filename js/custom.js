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

  initIndexEssay: function() {
    var e = document.querySelector(".essay_bar_swiper_container");
    if (!e) return;
    if (e.swiperInstance) return;
    setTimeout(() => {
      if (typeof Swiper === "undefined") {
        console.log("Swiper 未加载，跳过轮播初始化");
        return;
      }
      var t = document.querySelectorAll("#bber-talk .swiper-slide").length;
      var n = {
        direction: "vertical",
        autoplay: {
          disableOnInteraction: true,
          delay: 3000
        },
        mousewheel: true
      };
      n.loop = t > 1;
      var a = new Swiper(".essay_bar_swiper_container", n);
      e.swiperInstance = a;
      var i = document.getElementById("bbtalk");
      if (i !== null) {
        i.onmouseenter = function() {
          if (a && a.autoplay) {
            a.autoplay.stop();
          }
        };
        i.onmouseleave = function() {
          if (a && a.autoplay) {
            a.autoplay.start();
          }
        };
      }
    }, 50);
  },

  refreshEssaySwiper: function() {
    var e = document.querySelector(".essay_bar_swiper_container");
    if (!e) return;
    var t = e.swiperInstance;
    if (t && t.autoplay) {
      setTimeout(function() {
        t.autoplay.stop();
        t.autoplay.start();
      }, 50);
    } else {
      anzhiyu.initIndexEssay();
    }
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

if (document.querySelector(".essay_bar_swiper_container")) {
  anzhiyu.initIndexEssay();
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
      anzhiyu.refreshEssaySwiper();
    }
  }, 100);
});

document.addEventListener("DOMContentLoaded", function() {
  if (typeof anzhiyu !== "undefined" && anzhiyu.reflashEssayWaterFall) {
    anzhiyu.reflashEssayWaterFall();
  }
});

// ========== 添加：动态重建轮播动画（解决窗口大小改变时位置错乱）==========
function rebuildEssayAnimation() {
  var list = document.querySelector('#bber-talk');
  if (!list) return;

  // 获取当前动画
  var currentAnimation = list.style.animation;

  // 临时移除动画
  list.style.animation = 'none';

  // 强制重绘
  list.offsetHeight;

  // 重新添加动画
  if (currentAnimation) {
    list.style.animation = currentAnimation;
  } else {
    list.style.animation = 'scrollVertical 33s ease-in-out infinite';
  }
}

// 窗口大小改变时重建动画
window.addEventListener('resize', function() {
  setTimeout(rebuildEssayAnimation, 150);
});

// 监听单双栏切换按钮
document.addEventListener('click', function(e) {
  var target = e.target.closest('#hide-aside-btn');
  if (target) {
    setTimeout(rebuildEssayAnimation, 300);
  }
});

// PJAX 完成后重建动画
document.addEventListener('pjax:complete', function() {
  setTimeout(rebuildEssayAnimation, 150);
});
