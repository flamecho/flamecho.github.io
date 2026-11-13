/* ==========================================================================
   待办列表 /todo/
   --------------------------------------------------------------------------
   所有内容都来自下面这份 DATA：
     tasks = 想做的事（长期、每天做一点）
     logs  = 每天在日历上记的进度，格式 'YYYY-MM-DD': [[任务 id, 数量, 备注?], ...]
   任务的累计量 = base（可选）+ 该任务在 logs 里的数量总和。
   「新增游戏汉化」的数字整理自更新日志的「汉化更新」，
   已排除「校对 by 加盐」与「重新翻译」的条目。
   ========================================================================== */

(function () {
  'use strict';

  var app = document.getElementById('todo-app');
  if (!app) return;

  /* ---------------------------------- 数据 --------------------------------- */

  var DATA = {
    tasks: [
      {
        id: 'hanhua',
        short: '新增',
        name: '新增游戏汉化',
        color: '#2b8ec9',
        colorDark: '#6fb2d4',
        tags: ['汉化']
      },
      {
        id: 'update',
        short: '更新',
        name: '更新游戏汉化',
        color: '#d9872f',
        colorDark: '#d8a469',
        goal: 277,        // 178 部待更新 + 日志里 99 条「重新翻译」
        tags: ['汉化']
      },
      {
        id: 'extract',
        short: '提取',
        name: '提取游戏文本',
        color: '#3dad7c',
        colorDark: '#79bfa0',
        tags: ['汉化']
      },
      {
        id: 'download',
        short: '下载',
        name: '待汉化游戏下载',
        color: '#2ba9b3',
        colorDark: '#6fbfc6',
        tags: ['汉化']
      },
      {
        id: 'guide',
        short: '攻略',
        name: '核对游戏攻略整合',
        color: '#c9a52e',
        colorDark: '#cdb978',
        goal: 1541,       // 一共有 1541 个要核对
        base: 81,         // 开始统计前已完成 81 个
        tags: ['整理']
      },
      {
        id: 'otoame',
        short: '条目',
        name: 'Otoame 新增游戏条目',
        color: '#8670d6',
        colorDark: '#a79bd4',
        tags: ['整理']
      },
      {
        id: 'asset',
        short: '资源',
        name: 'Otoame 发布游戏资源',
        color: '#cf5f4e',
        colorDark: '#d09a8c',
        tags: ['整理']
      },
      {
        id: 'release',
        short: '发布',
        name: 'Otoame 发布汉化补丁',
        color: '#dd6892',
        colorDark: '#d495ae',
        goal: 672,        // 一共有 672 个待搬运
        tags: ['整理']
      }
    ],

    logs: {
      '2026-03-18': [['hanhua', 4]],
      '2026-03-29': [['hanhua', 2], ['update', 2]],
      '2026-04-05': [['hanhua', 1]],
      '2026-04-14': [['hanhua', 8]],
      '2026-05-03': [['hanhua', 11]],
      '2026-05-27': [['hanhua', 4]],
      '2026-06-02': [['hanhua', 1]],
      '2026-06-03': [['hanhua', 1]],
      '2026-06-15': [['hanhua', 9]],
      '2026-07-02': [['hanhua', 8]],
      '2026-07-06': [['hanhua', 3]],
      '2026-07-07': [['hanhua', 2]],
      '2026-07-08': [['hanhua', 1]],
      '2026-07-09': [['hanhua', 1]],
      '2026-07-11': [['hanhua', 2]],
      '2026-07-12': [['hanhua', 3]],
      '2026-07-13': [['hanhua', 1]],
      '2026-07-20': [['hanhua', 4]],
      '2026-07-23': [['hanhua', 1]],
      '2026-07-25': [['hanhua', 1]],
      '2026-07-31': [['hanhua', 4]],
      '2026-08-20': [['hanhua', 6], ['update', 1]],
      '2026-09-07': [['hanhua', 6]],
      '2026-09-09': [['hanhua', 8]],
      '2026-09-21': [['hanhua', 12]],
      '2026-09-23': [['hanhua', 1]],
      '2026-09-24': [['hanhua', 1]],
      '2026-10-01': [['hanhua', 16]],
      '2026-10-03': [['hanhua', 4]],
      '2026-10-04': [['hanhua', 7], ['update', 1]],
      '2026-10-08': [['hanhua', 16]],
      '2026-10-10': [['hanhua', 14]],
      '2026-10-12': [['hanhua', 34]],
      '2026-10-16': [['hanhua', 9], ['update', 1]],
      '2026-10-17': [['hanhua', 9]],
      '2026-10-18': [['hanhua', 25]],
      '2026-10-20': [['hanhua', 23]],
      '2026-10-21': [['hanhua', 61], ['update', 1]],
      '2026-10-22': [['hanhua', 14], ['update', 6]],
      '2026-10-23': [['hanhua', 18], ['update', 7]],
      '2026-10-24': [['hanhua', 32], ['update', 30]],
      '2026-10-25': [['hanhua', 20], ['update', 13]],
      '2026-10-27': [['hanhua', 13], ['update', 16]],
      '2026-10-28': [['hanhua', 16], ['update', 8]],
      '2026-10-29': [['hanhua', 12], ['update', 6]],
      '2026-10-31': [['hanhua', 20], ['update', 3]],
      '2026-11-01': [['hanhua', 10], ['update', 2]],
      '2026-11-02': [['hanhua', 16], ['update', 2], ['extract', 18]],
      '2026-11-03': [['download', 8], ['otoame', 10], ['extract', 21], ['asset', 20], ['release', 11]],
      '2026-11-04': [['extract', 22], ['guide', 119], ['otoame', 10], ['asset', 11], ['release', 10]],
      '2026-11-05': [['extract', 16], ['asset', 19], ['release', 12]],
      '2026-11-06': [['hanhua', 64], ['extract', 20], ['download', 21], ['guide', 30], ['otoame', 10], ['asset', 12], ['release', 10]],
      '2026-11-07': [['extract', 31]],
      '2026-11-08': [['extract', 43], ['download', 20], ['asset', 25]],
      '2026-11-09': [['extract', 8]],
      '2026-11-10': [['hanhua', 99], ['update', 5], ['extract', 12]],
      '2026-11-11': [['hanhua', 23]],
      '2026-11-12': [['download', 39], ['asset', 1]]
    }
  };

  /* --------------------------------- 工具 --------------------------------- */

  var WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  var WEEK_SHORT = ['一', '二', '三', '四', '五', '六', '日'];

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  function ymd(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function parseKey(k) {
    var p = k.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmt(n) { return Number(n).toLocaleString('en-US'); }

  function rgbOf(hex) {
    var h = String(hex || '#999999').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return parseInt(h.slice(0, 2), 16) + ', ' + parseInt(h.slice(2, 4), 16) + ', ' + parseInt(h.slice(4, 6), 16);
  }

  // 每个任务在浅色 / 深色下各有一个色值，靠 CSS 变量 --td-use 自动切换
  function colorStyle(t) {
    return '--td-c:' + t.color +
      ';--td-cd:' + (t.colorDark || t.color) +
      ';--td-rgb:' + rgbOf(t.color) +
      ';--td-rgbd:' + rgbOf(t.colorDark || t.color);
  }

  var TASK = {};
  var ORDER = {};
  DATA.tasks.forEach(function (t, i) { TASK[t.id] = t; ORDER[t.id] = i; });

  // 按任务汇总：累计量、记录天数、最后一次
  var statOf = {};
  DATA.tasks.forEach(function (t) {
    statOf[t.id] = { total: t.base || 0, days: 0, last: '' };
  });

  var dayTotal = {};
  Object.keys(DATA.logs).forEach(function (k) {
    var s = 0;
    DATA.logs[k].forEach(function (e) {
      s += e[1];
      var st = statOf[e[0]];
      if (!st) return;
      st.total += e[1];
      st.days += 1;
      if (k > st.last) st.last = k;
    });
    dayTotal[k] = s;
  });

  // 一天里多条记录按「底下条块」的顺序（DATA.tasks 的排列）展示，不按写入先后
  function orderOf(id) {
    return ORDER[id] == null ? DATA.tasks.length : ORDER[id];
  }

  function entriesOf(k) {
    var list = DATA.logs[k];
    if (!list || !list.length) return [];
    return list.slice().sort(function (a, b) { return orderOf(a[0]) - orderOf(b[0]); });
  }

  function sumOf(k) { return dayTotal[k] || 0; }

  var grandTotal = 0;
  DATA.tasks.forEach(function (t) { grandTotal += statOf[t.id].total; });

  var loggedDays = Object.keys(dayTotal).filter(function (k) { return dayTotal[k] > 0; }).length;

  /* --------------------------------- 状态 --------------------------------- */

  var now = new Date();
  var todayKey = ymd(now);
  var viewY = now.getFullYear();
  var viewM = now.getMonth();
  var selected = todayKey;

  /* ---------------------------- 去掉页面左上角标题 --------------------------- */

  var pageBox = app.parentNode;
  while (pageBox && pageBox.id !== 'page') pageBox = pageBox.parentNode;
  if (pageBox) {
    var h1 = pageBox.querySelector('h1.page-title');
    if (h1) h1.parentNode.removeChild(h1);
  }

  /* --------------------------------- 骨架 --------------------------------- */

  app.innerHTML =
    '<section class="td-panel td-sum" id="td-sum"></section>' +
    '<section class="td-panel">' +
      '<div class="td-cal-head">' +
        '<button type="button" class="td-nav" data-td-nav="prev" aria-label="上个月">‹</button>' +
        '<span class="td-mtitle" id="td-mtitle"></span>' +
        '<button type="button" class="td-nav" data-td-nav="next" aria-label="下个月">›</button>' +
        '<button type="button" class="td-today-btn" data-td-nav="today">回到今天</button>' +
      '</div>' +
      '<div class="td-legend" id="td-legend"></div>' +
      '<div class="td-week">' + WEEK_SHORT.map(function (w) { return '<span>' + w + '</span>'; }).join('') + '</div>' +
      '<div class="td-grid" id="td-grid"></div>' +
      '<div class="td-detail" id="td-detail"></div>' +
      '<div class="td-chart" id="td-chart"></div>' +
    '</section>' +
    '<div class="td-list" id="td-list"></div>';

  var ui = {
    sum: document.getElementById('td-sum'),
    mtitle: document.getElementById('td-mtitle'),
    legend: document.getElementById('td-legend'),
    grid: document.getElementById('td-grid'),
    detail: document.getElementById('td-detail'),
    chart: document.getElementById('td-chart'),
    list: document.getElementById('td-list')
  };

  /* ------------------------------- 顶部概览 ------------------------------- */

  function monthSum(y, m) {
    var days = new Date(y, m + 1, 0).getDate();
    var s = 0;
    for (var i = 1; i <= days; i++) s += sumOf(ymd(new Date(y, m, i)));
    return s;
  }

  function monthLoggedDays(y, m) {
    var days = new Date(y, m + 1, 0).getDate();
    var n = 0;
    for (var i = 1; i <= days; i++) if (sumOf(ymd(new Date(y, m, i))) > 0) n++;
    return n;
  }

  function streak() {
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var n = 0;
    if (sumOf(ymd(d)) === 0) d.setDate(d.getDate() - 1);
    while (n < 3650 && sumOf(ymd(d)) > 0) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  function mdLabel(d) { return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日'; }

  function stat(label, val, unit, sub) {
    return '<div class="td-stat">' +
      '<span class="td-stat-label">' + label + '</span>' +
      '<span class="td-stat-val">' + val + '<i>' + unit + '</i></span>' +
      '<span class="td-stat-sub">' + sub + '</span>' +
      '</div>';
  }

  function renderSummary() {
    var t = sumOf(todayKey);
    var mSum = monthSum(now.getFullYear(), now.getMonth());
    var mDays = monthLoggedDays(now.getFullYear(), now.getMonth());
    var st = streak();
    var stSub = t > 0 ? '今天已经记上了' : (st > 0 ? '今天还没记' : '今天记一条就开头');

    ui.sum.innerHTML =
      '<div class="td-stat is-main">' +
        '<span class="td-stat-label">今日已完成</span>' +
        '<span class="td-stat-val">' + t + '<i>条</i></span>' +
        '<span class="td-stat-sub">' + mdLabel(now) + ' · ' + WEEK[now.getDay()] + '</span>' +
      '</div>' +
      stat('本月', mSum, '条', '有记录的 ' + mDays + ' 天') +
      stat('连续', st, '天', stSub) +
      stat('累计', fmt(grandTotal), '条', '记录 ' + loggedDays + ' 天');
  }

  /* --------------------------------- 日历 --------------------------------- */

  function renderLegend() {
    if (DATA.tasks.length < 2) {
      ui.legend.style.display = 'none';
      ui.legend.innerHTML = '';
      return;
    }
    ui.legend.style.display = '';
    ui.legend.innerHTML = DATA.tasks.map(function (t) {
      return '<span class="td-lg"><i style="background:' + t.color + '"></i>' + esc(t.short) + '</span>';
    }).join('');
  }

  function renderCalendar() {
    ui.mtitle.textContent = viewY + ' 年 ' + (viewM + 1) + ' 月';

    var first = new Date(viewY, viewM, 1);
    var offset = (first.getDay() + 6) % 7;                    // 周一开头
    var daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
    var cells = Math.ceil((offset + daysInMonth) / 7) * 7;
    var start = new Date(viewY, viewM, 1 - offset);
    var html = '';

    for (var i = 0; i < cells; i++) {
      var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      var k = ymd(d);
      var list = entriesOf(k);
      var total = sumOf(k);

      var cls = 'td-cell';
      if (d.getMonth() !== viewM) cls += ' is-other';
      if (k === todayKey) cls += ' is-today';
      if (k === selected) cls += ' is-sel';
      if (total > 0) cls += ' has-log';

      var marks = '';
      var tips = [];
      list.forEach(function (e) {
        var t = TASK[e[0]] || { name: e[0], short: e[0], color: '#999' };
        tips.push(t.name + ' +' + e[1] + ' 条' + (e[2] ? '（' + e[2] + '）' : ''));
        marks += '<span class="td-mark" style="' + colorStyle(t) + '"><i></i><b>' + e[1] + '</b></span>';
      });


      html += '<button type="button" class="' + cls + '" data-date="' + k + '"' +
        (tips.length ? ' title="' + esc(tips.join(' / ')) + '"' : '') + '>' +
        '<span class="td-daynum">' + d.getDate() + '</span>' +
        '<span class="td-marks">' + marks + '</span>' +
        (total ? '<span class="td-daytotal">共 ' + total + ' 条</span>' : '') +
        '</button>';
    }

    ui.grid.innerHTML = html;
  }

  function renderDetail() {
    if (!selected) {
      ui.detail.innerHTML =
        '<div class="td-dhead"><strong>还没有选日期</strong></div>' +
        '<div class="td-empty">点日历上的某一天，看看那天记了什么。</div>';
      return;
    }

    var d = parseKey(selected);
    var list = entriesOf(selected);
    var total = sumOf(selected);
    var html = '<div class="td-dhead">' +
      '<strong>' + mdLabel(d) + '</strong>' +
      '<span>' + WEEK[d.getDay()] + '</span>' +
      (total ? '<em>共 ' + total + ' 条</em>' : '') +
      '</div>';

    if (!list.length) {
      html += '<div class="td-empty">这天没有记录。</div>';
    } else {
      list.forEach(function (e) {
        var t = TASK[e[0]] || { name: e[0], color: '#999', colorDark: '#bbb' };
        html += '<div class="td-drow" style="' + colorStyle(t) + '">' +
          '<i></i>' +
          '<div class="td-drow-name">' + esc(t.name) +
            (e[2] ? '<span class="td-drow-note">' + esc(e[2]) + '</span>' : '') +
          '</div>' +
          '<span class="td-drow-num">+ ' + e[1] + ' 条</span>' +
          '</div>';
      });
    }

    ui.detail.innerHTML = html;
  }

  /* ----------------------------- 每月条数柱状图 ---------------------------- */

  function renderChart() {
    var daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
    var max = 0;
    var total = 0;
    var rows = [];

    for (var i = 1; i <= daysInMonth; i++) {
      var k = ymd(new Date(viewY, viewM, i));
      var sum = sumOf(k);
      if (sum > max) max = sum;
      total += sum;
      rows.push({ d: i, k: k, sum: sum, list: entriesOf(k) });
    }

    var html = '<div class="td-chart-head">' +
      '<span>' + viewY + ' 年 ' + (viewM + 1) + ' 月 · 每天条数</span>' +
      '<em>共 ' + total + ' 条 · 单日最高 ' + max + ' 条</em>' +
      '</div>' +
      '<div class="td-chart-plot">';

    rows.forEach(function (r) {
      var segs = '';
      var tips = [];
      if (r.sum > 0) {
        r.list.forEach(function (e) {
          var t = TASK[e[0]] || { name: e[0], color: '#999', colorDark: '#bbb' };
          segs += '<span class="td-seg" style="' + colorStyle(t) + ';flex:' + e[1] + '"></span>';
          tips.push(t.name + ' ' + e[1]);
        });
      } else {
        segs = '<span class="td-stub"></span>';
      }

      var tip = r.sum
        ? (viewM + 1) + ' 月 ' + r.d + ' 日 · 共 ' + r.sum + ' 条（' + tips.join(' / ') + '）'
        : (viewM + 1) + ' 月 ' + r.d + ' 日 · 没有记录';

      html += '<div class="td-col' + (r.sum ? '' : ' is-empty') + '" data-date="' + r.k + '" title="' + esc(tip) + '">' +
        '<div class="td-stack" style="height:' + (r.sum ? Math.max(4, Math.round(r.sum / (max || 1) * 100)) + '%' : '2px') + '">' + segs + '</div>' +
        '</div>';
    });

    html += '</div><div class="td-chart-axis">';
    rows.forEach(function (r) {
      var major = (r.d === 1 || r.d % 5 === 0);
      html += '<i' + (major ? ' class="is-major"' : '') + '>' + r.d + '</i>';
    });
    html += '</div>';

    ui.chart.innerHTML = html;
  }

  /* ------------------------------- 任务清单 ------------------------------- */

  function deadlineText(dl) {
    if (!dl) return '';
    var p = dl.split('-');
    var d = parseKey(dl);
    var left = Math.ceil((d - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
    var txt = '截止 ' + (+p[1]) + '-' + p[2];
    if (left < 0) txt += '（已过）';
    else if (left <= 30) txt += '（还有 ' + left + ' 天）';
    return txt;
  }

  function shortDate(k) {
    var p = k.split('-');
    return (+p[1]) + '-' + p[2];
  }

  function sparkline(id) {
    var total = 0;
    var vals = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      var k = ymd(d);
      var v = 0;
      entriesOf(k).forEach(function (e) { if (e[0] === id) v += e[1]; });
      vals.push({ d: d, v: v });
      if (v > total) total = v;
    }
    return vals.map(function (x) {
      var h = total ? Math.max(3, Math.round(x.v / total * 24)) : 3;
      return '<b class="' + (x.v ? '' : 'is-zero') + '" style="height:' + h + 'px" title="' +
        (x.d.getMonth() + 1) + '-' + pad2(x.d.getDate()) + ' · ' + x.v + ' 条"></b>';
    }).join('');
  }

  function renderTasks() {
    var html = '';

    DATA.tasks.forEach(function (t) {
      var st = statOf[t.id];
      var tags = t.tags.map(function (g) { return '<span class="td-tag">' + esc(g) + '</span>'; }).join('');
      var head, body;

      if (t.goal) {
        var done = Math.min(st.total, t.goal);
        var remain = Math.max(t.goal - done, 0);
        var pct = Math.round(done / t.goal * 100);
        var eta = remain === 0 ? '已完成' : (t.daily > 0 ? '预计还需 ' + Math.ceil(remain / t.daily) + ' 天' : '');

        head = '<h3>' + esc(t.name) + '</h3>' + tags + '<span class="td-pct">' + pct + '%</span>';
        body = '<div class="td-bar"><span style="width:' + pct + '%"></span></div>' +
          '<div class="td-meta">' +
            '<span>已完成 ' + fmt(done) + ' / ' + fmt(t.goal) + ' 条</span>' +
            (t.daily ? '<span>每日 ' + t.daily + ' 条</span>' : '') +
            '<span>还剩 ' + fmt(remain) + ' 条</span>' +
            (eta ? '<span>' + eta + '</span>' : '') +
            (t.deadline ? '<span>' + deadlineText(t.deadline) + '</span>' : '') +
          '</div>';
      } else {
        // 不设目标：只记每天做了多少
        var todayN = 0;
        entriesOf(todayKey).forEach(function (e) { if (e[0] === t.id) todayN += e[1]; });
        var avg = st.days ? (st.total / st.days) : 0;

        head = '<h3>' + esc(t.name) + '</h3>' + tags +
          '<span class="td-pct">共 ' + fmt(st.total) + ' 条</span>';
        body = st.days
          ? '<div class="td-meta">' +
              '<span>' + (todayN ? '今天 + ' + todayN + ' 条' : '今天还没记') + '</span>' +
              '<span>记录 ' + st.days + ' 天</span>' +
              '<span>平均 ' + avg.toFixed(1) + ' 条 / 天</span>' +
              (st.last ? '<span>最近 ' + shortDate(st.last) + '</span>' : '') +
            '</div>'
          : '<div class="td-meta"><span>还没有记录</span><span>在日历上记一笔就会出现在这里</span></div>';
      }

      html += '<article class="td-task" style="' + colorStyle(t) + '">' +
        '<span class="td-task-bar"></span>' +
        '<div class="td-task-main">' +
          '<div class="td-task-head">' + head + '</div>' +
          body +
          '<div class="td-spark-row"><span>近 7 天</span><div class="td-spark">' + sparkline(t.id) + '</div></div>' +
        '</div>' +
      '</article>';
    });

    ui.list.innerHTML = html;
  }

  /* --------------------------------- 渲染 --------------------------------- */

  function renderAll() {
    renderSummary();
    renderLegend();
    renderCalendar();
    renderDetail();
    renderChart();
    renderTasks();
  }

  app.addEventListener('click', function (ev) {
    var nav = ev.target.closest('[data-td-nav]');
    if (nav) {
      var act = nav.getAttribute('data-td-nav');
      if (act === 'prev') viewM--;
      else if (act === 'next') viewM++;
      else {
        viewY = now.getFullYear();
        viewM = now.getMonth();
        selected = todayKey;
      }
      if (viewM < 0) { viewM = 11; viewY--; }
      if (viewM > 11) { viewM = 0; viewY++; }

      if (act !== 'today') {
        var selD = selected ? parseKey(selected) : null;
        if (!selD || selD.getMonth() !== viewM || selD.getFullYear() !== viewY) selected = null;
      }

      renderCalendar();
      renderDetail();
      renderChart();
      return;
    }

    var cell = ev.target.closest('.td-cell, .td-col');
    if (!cell) return;

    var k = cell.getAttribute('data-date');
    var d = parseKey(k);
    selected = k;
    if (d.getMonth() !== viewM || d.getFullYear() !== viewY) {
      viewY = d.getFullYear();
      viewM = d.getMonth();
    }
    renderCalendar();
    renderDetail();
  });

  renderAll();
})();
