function waterfall(a) {
  function b(a, b) {
    var c = window.getComputedStyle(b);
    return parseFloat(c["margin" + a]) || 0;
  }
  function c(a) {
    return a + "px";
  }
  function d(a) {
    return parseFloat(a.style.top);
  }
  function e(a) {
    return parseFloat(a.style.left);
  }
  function f(a) {
    return a.clientWidth;
  }
  function g(a) {
    return a.clientHeight;
  }
  function h(a) {
    return d(a) + g(a) + b("Bottom", a);
  }
  function i(a) {
    return e(a) + f(a) + b("Right", a);
  }
  function j(a) {
    a = a.sort(function (a, b) {
      return h(a) === h(b) ? e(b) - e(a) : h(b) - h(a);
    });
  }
  function k(b) {
    f(a) != t && (b.target.removeEventListener(b.type, arguments.callee), waterfall(a));
  }

  "string" == typeof a && (a = document.querySelector(a));

  // 获取所有子元素
  var l = [].map.call(a.children, function (a) {
    return a;
  });

  a.style.position = "relative";

  // 记录每个元素的原始位置和目标位置
  var currentPositions = [];
  var targetPositions = [];

  // 记录当前实际位置
  l.forEach(function(item) {
    var rect = item.getBoundingClientRect();
    var parentRect = a.getBoundingClientRect();
    currentPositions.push({
      top: rect.top - parentRect.top,
      left: rect.left - parentRect.left
    });
  });

  // 重置所有元素的位置样式，准备重新计算
  l.forEach(function(item) {
    item.style.position = "absolute";
    item.style.top = "auto";
    item.style.left = "auto";
    item.style.transition = "";
  });

  var m = [];
  l.length && ((l[0].style.top = "0px"), (l[0].style.left = c(b("Left", l[0]))), m.push(l[0]));

  for (var n = 1; n < l.length; n++) {
    var o = l[n - 1],
      p = l[n],
      q = i(o) + f(p) <= f(a);
    if (!q) break;
    (p.style.top = o.style.top), (p.style.left = c(i(o) + b("Left", p))), m.push(p);
  }

  for (; n < l.length; n++) {
    j(m);
    var p = l[n],
      r = m.pop();
    (p.style.top = c(h(r) + b("Top", p))), (p.style.left = c(e(r))), m.push(p);
  }

  j(m);
  var s = m[0];
  a.style.height = c(h(s) + b("Bottom", s));
  var t = f(a);

  // 获取计算后的目标位置
  l.forEach(function(item, index) {
    var rect = item.getBoundingClientRect();
    var parentRect = a.getBoundingClientRect();
    targetPositions[index] = {
      top: rect.top - parentRect.top,
      left: rect.left - parentRect.left
    };
  });

  // 添加过渡动画
  l.forEach(function(item, index) {
    var current = currentPositions[index];
    var target = targetPositions[index];

    if (current && target) {
      // 先设置到当前位置
      item.style.transition = "none";
      item.style.top = c(current.top);
      item.style.left = c(current.left);

      // 强制重绘
      item.offsetHeight;

      // 设置过渡动画，移动到目标位置
      item.style.transition = "top 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), left 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)";
      item.style.top = c(target.top);
      item.style.left = c(target.left);
    }
  });

  window.addEventListener ? window.addEventListener("resize", k) : (document.body.onresize = k);
}
