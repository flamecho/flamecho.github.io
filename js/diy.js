//动态分类条
var pathInfo = window.location.pathname;
function categoriesBarActive() {
  pathInfo = decodeURIComponent(pathInfo)
  // console.log(pathInfo);
  //判断是否是首页
  if (pathInfo == '/') {
    if (document.querySelector('#category-bar')) {
      document.getElementById('首页').classList.add("select")
    }
  } else {
    // 验证是否是分类链接
    const pattern = /\/categories\/.*?\//;
    let patbool = pattern.test(pathInfo);
    let valuegroup = pathInfo.split("/");
    for (let n = 0; n <= valuegroup.length; n++) {
      n = valuegroup.length;
      var nowCategorie = valuegroup[n - 2];
    }
    // console.log(patbool);
    if (patbool) {
      // console.log(valuegroup[2]);
      if (document.getElementById(nowCategorie)) {
        document.getElementById(nowCategorie).classList.add("select");
      }
    } else {
      let id;
      switch (nowCategorie) {
        case 'game':
          id = '小游戏';
          break;
      }
      if (document.querySelector('#category-bar')) {
        document.getElementById(id).classList.add("select");
      }
    }
  }
  categoriesBarNext()
}
//翻页按钮
function scrollCategoryBarToRight() {
  var e = document.getElementById("category-bar-items")
    , t = document.getElementById("category-bar-next")
    , o = e.clientWidth;
  e && (e.scrollLeft + e.clientWidth >= e.scrollWidth ? (e.scroll({
    left: 0,
    behavior: "smooth"
  }),
    t.innerHTML = '<i class="fa-solid fa-chevrons-right"></i>') : e.scrollBy({
      left: o,
      behavior: "smooth"
    }))
}
//新增方法：动态插入翻页按钮
function categoriesBarNext() {
  if (document.getElementById("category-bar-items")) {
    let e = document.getElementById("category-bar-items")
    , t = document.getElementById("category-bar-next")
    if (e.scrollWidth > e.clientWidth) {
      t.innerHTML = '<i class="fa-solid fa-chevrons-right"></i>'
    } else if (t.children[0]) {
      const iElement = document.querySelector('.category-bar-next i');
      const parentElement = document.getElementById('category-bar-next');

      parentElement.removeChild(iElement);
    }
  }
}
//窗口改变就执行
window.onresize = function() {
  categoriesBarNext()
}

//鼠标控制横向滚动
function topCategoriesBarScroll() {
  if (document.getElementById("category-bar-items")) {
    let xscroll = document.getElementById("category-bar-items");
    xscroll.addEventListener("mousewheel", function (e) {
      //计算鼠标滚轮滚动的距离
      let v = -e.wheelDelta / 2;
      xscroll.scrollLeft += v;
      //阻止浏览器默认方法
      e.preventDefault();
    }, false);
  }
}
//方法调用
categoriesBarActive()
topCategoriesBarScroll()
document.addEventListener("pjax:complete", (function () {
  categoriesBarActive()
  topCategoriesBarScroll()
}))
