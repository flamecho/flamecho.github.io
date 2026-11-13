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
    if (document.querySelector("#bber-talk") && typeof anzhiyu.restartEssayScroll === "function") {
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





if (document.body.clientWidth > 992) {
    function getBasicInfo() {
        /* 窗口高度 */
        var ViewH = $(window).height();
        /* document高度 */
        var DocH = $("body")[0].scrollHeight;
        /* 滚动的高度 */
        var ScrollTop = $(window).scrollTop();
        /* 可滚动的高度 */
        var S_V = DocH - ViewH;
        var Band_H = ScrollTop / (DocH - ViewH) * 100;
        return {
            ViewH: ViewH,
            DocH: DocH,
            ScrollTop: ScrollTop,
            Band_H: Band_H,
            S_V: S_V
        }
    };
    function show(basicInfo) {
        if (basicInfo.ScrollTop > 0.001) {
            $(".neko").css('display', 'block');
        } else {
            $(".neko").css('display', 'none');
        }
    }
    (function ($) {
        $.fn.nekoScroll = function (option) {
            var defaultSetting = {
                top: '0',
                scroWidth: 6 + 'px',
                z_index: 9999,
                zoom: 0.9,
                borderRadius: 5 + 'px',
                right: 60 + 'px',
                nekoImg: '/img/0.头像 背景/艾因小狼.png',
                hoverMsg: "～(∠・ω< )⌒★",
                color: "#0563c1",
                during: 500,
                blog_body: "body",
            };
            var setting = $.extend(defaultSetting, option);
            var getThis = this.prop("className") !== "" ? "." + this.prop("className") : this.prop("id") !== "" ? "#" +
                this.prop("id") : this.prop("nodeName");
            if ($(".neko").length == 0) {
                this.after("<div class=\"neko\" id=" + setting.nekoname + " data-msg=\"" + setting.hoverMsg + "\"></div>");
            }
            let basicInfo = getBasicInfo();
            $(getThis)
                .css({
                    'position': 'fixed',
                    'width': setting.scroWidth,
                    'top': setting.top,
                    'height': basicInfo.Band_H * setting.zoom * basicInfo.ViewH * 0.01 + 'px',
                    'z-index': setting.z_index,
                    'background-color': setting.bgcolor,
                    "border-radius": setting.borderRadius,
                    'right': setting.right,
                    'background-image': 'url(' + setting.scImg + ')',
                    'background-image': '-webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.1) 75%, transparent 75%, transparent)', 'border-radius': '2em',
                    'background-size': 'contain'
                });
            $("#" + setting.nekoname)
                .css({
                    'position': 'fixed',
                    'top': basicInfo.Band_H * setting.zoom * basicInfo.ViewH * 0.01 - 50 + 'px',
                    'z-index': setting.z_index * 10,
                    'right': setting.right,
                    'background-image': 'url(' + setting.nekoImg + ')',
                });
            show(getBasicInfo());
            $(window)
                .scroll(function () {
                    let basicInfo = getBasicInfo();
                    show(basicInfo);
                    $(getThis)
                        .css({
                            'position': 'fixed',
                            'width': setting.scroWidth,
                            'top': setting.top,
                            'height': basicInfo.Band_H * setting.zoom * basicInfo.ViewH * 0.01 + 'px',
                            'z-index': setting.z_index,
                            'background-color': setting.bgcolor,
                            "border-radius": setting.borderRadius,
                            'right': setting.right,
                            'background-image': 'url(' + setting.scImg + ')',
                            'background-image': '-webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.1) 75%, transparent 75%, transparent)', 'border-radius': '2em',
                            'background-size': 'contain'
                        });
                    $("#" + setting.nekoname)
                        .css({
                            'position': 'fixed',
                            'top': basicInfo.Band_H * setting.zoom * basicInfo.ViewH * 0.01 - 50 + 'px',
                            'z-index': setting.z_index * 10,
                            'right': setting.right,
                            'background-image': 'url(' + setting.nekoImg + ')',
                        });
                    if (basicInfo.ScrollTop == basicInfo.S_V) {
                        $("#" + setting.nekoname)
                            .addClass("showMsg")
                    } else {
                        $("#" + setting.nekoname)
                            .removeClass("showMsg");
                        $("#" + setting.nekoname)
                            .attr("data-msg", setting.hoverMsg);
                    }
                });
            this.click(function (e) {
                btf.scrollToDest(0, 500)
            });
            $("#" + setting.nekoname)
                .click(function () {
                    btf.scrollToDest(0, 500)
                });
            return this;
        }
    })(jQuery);

    $(document).ready(function () {
        //部分自定义
        $("#myscoll").nekoScroll({
            bgcolor: 'rgb(0 0 0 / .5)', //背景颜色，没有绳子背景图片时有效
            borderRadius: '2em',
            zoom: 0.49
        }
        );
        //自定义（去掉以下注释，并注释掉其他的查看效果）
        /*
        $("#myscoll").nekoScroll({
            nekoname:'neko1', //nekoname，相当于id
            nekoImg:'img/猫咪.png', //neko的背景图片
            scImg:"img/绳1.png", //绳子的背景图片
            bgcolor:'#1e90ff', //背景颜色，没有绳子背景图片时有效
            zoom:0.9, //绳子长度的缩放值
            hoverMsg:'你好~喵', //鼠标浮动到neko上方的对话框信息
            right:'100px', //距离页面右边的距离
            fontFamily:'楷体', //对话框字体
            fontSize:'14px', //对话框字体的大小
            color:'#1e90ff', //对话框字体颜色
            scroWidth:'8px', //绳子的宽度
            z_index:100, //不用解释了吧
            during:1200, //从顶部到底部滑动的时长
        });
        */
    })
}
