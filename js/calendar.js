(function() {
  'use strict';

  // ========== 在这里维护你的事件数据 ==========
  // 格式：{ date: "YYYY-MM-DD", title: "事件标题", type: "game/update/activity/deadline/sale", desc: "描述", time: "时间" }
  const EVENTS_DATA = [
    // 游戏发售
    { date: "2026-03-26", title: "文字化化", type: "game", desc: "NS 简中 一般向"},
    { date: "2026-03-26", title: "ハンサムロンダリング -the mystic lover-", type: "game", desc: "NS 日文 乙女向"},
    { date: "2026-03-26", title: "DIABOLIK LOVERS LUNATIC FATE GRAND EDITION", type: "game", desc: "NS 日文 乙女向"},
    { date: "2026-03-26", title: "魔女と亡霊のヴォロンテ", type: "game", desc: "NS 日文 乙女向"},
    { date: "2026-03-27", title: "Salvus: Aries", type: "game", desc: "PC 英文 乙女向 抢先体验"},
    { date: "2026-04-23", title: "DYNAMIC CHORD 動態和弦 feat.[rêve parfait] Remaster edition", type: "game", desc: "NS 繁中 乙女向"},
    { date: "2026-04-23", title: "妖怪飯～大碗開動！～ for S", type: "game", desc: "NS 繁中 乙女向"},
    { date: "2026-04-23", title: "マツリカの炯-kEi- 天命華燭伝", type: "game", desc: "NS 日文 乙女向"},
    { date: "2026-04-30", title: "崩坏世界的指引之人", type: "game", desc: "PC 简中 乙女向"},
    { date: "2026-05-14", title: "9 R.I.P. sequel", type: "game", desc: "NS 繁中 乙女向"},
    { date: "2026-05-28", title: "Starry☆Sky ~Spring Memories~", type: "game", desc: "NS 日文 乙女向"},
    { date: "2026-06-11", title: "絕對階級學園", type: "game", desc: "NS 繁中 乙女向"},
    { date: "2026-06-25", title: "世界灭亡共有幻想MAMIYA", type: "game", desc: "NS 简中 一般向"},
    { date: "2026-06-25", title: "DIABOLIK LOVERS LUNATIC FATE 魔鬼戀人 狂亂命運 GRAND EDITION", type: "game", desc: "NS 繁中 乙女向"},
    { date: "2026-06-25", title: "麻煩清理專家咖啡店 -the mystic lover-", type: "game", desc: "NS 繁中 乙女向"},
    { date: "2026-06-25", title: "Blackish House ←sideZ -Retour-", type: "game", desc: "NS 日文 乙女向"},
    { date: "2026-07-02", title: "悠久的鋼刃列騎", type: "game", desc: "NS 繁中 乙女向"},
    { date: "2026-07-09", title: "魔法少女的魔女审判", type: "game", desc: "NS 简中 一般向"},
    { date: "2026-07-09", title: "CRAZY CHA!N -エルピスの鎖-", type: "game", desc: "NS 日文 乙女向"},
    { date: "2026-07-23", title: "ソラ*ユメ", type: "game", desc: "NS 日文 乙女向"},
    { date: "2026-07-30", title: "网球王子 心跳求生 Tie break ♡ game", type: "game", desc: "NS 简中 乙女向"},
    { date: "2026-07-30", title: "网球王子 学园祭的王子们 ♡-40 and more…", type: "game", desc: "NS 简中 乙女向"},
    { date: "2026-07-30", title: "君に惑い、君に溺れる。", type: "game", desc: "NS 日文 乙女向"},
    { date: "2026-08-20", title: "あやかしごはん ～おかわりっ！～ for S", type: "game", desc: "NS 日文 乙女向"},
    { date: "2026-08-27", title: "薄桜鬼異聞 ベレジンスキーの魔女", type: "game", desc: "NS 日文 乙女向"},
    { date: "2026-09-10", title: "BLACK WOLVES SAGA -Weiβ und Schwarz-", type: "game", desc: "NS 日文 乙女向"},
    { date: "2026-09-17", title: "空之轨迹 the 2nd", type: "game", desc: "Steam/NS 简中 JRPG"},
    { date: "2026-09-17", title: "Le Mirage Mystique", type: "game", desc: "NS 日文 乙女向"},
    { date: "2026-10-1", title: "Sullyland Nursery Rhyme", type: "game", desc: "NS 日文 乙女向"},
    { date: "2027-06-30", title: "The Second Reproduction～Reunion～", type: "game", desc: "PC 日文 乙女向"},

    // 游戏更新
    { date: "2026-03-26", title: "UN:LOGICAL After Episode Collection Vol.1", type: "update", desc: "NS 日文 乙女向"},
    { date: "2026-04-28", title: "FF14 7.5 版本 天际的行路", type: "update", desc: "", time: ""},

    // 游戏活动
    { date: "2026-04-24", title: "FF14 北美粉丝节", type: "activity", desc: "", time: ""},
    { date: "2026-07-25", title: "FF14 欧洲粉丝节", type: "activity", desc: "", time: ""},
    { date: "2026-10-31", title: "FF14 东京粉丝节", type: "activity", desc: "", time: ""},

    // 促销活动
    { date: "2026-03-20", title: "Steam 春季特卖", type: "sale", desc: "", time: "1:00"},
    { date: "2026-06-26", title: "Steam 夏季特卖", type: "sale", desc: "", time: "1:00"},
    { date: "2026-10-02", title: "Steam 秋季特卖", type: "sale", desc: "", time: "1:00"},
    { date: "2026-12-18", title: "Steam 冬季特卖", type: "sale", desc: "", time: "1:00"},

    // 活动截止
    { date: "2026-04-25", title: "FF14 北美粉丝节", type: "deadline", desc: "", time: ""},
    { date: "2026-07-26", title: "FF14 欧洲粉丝节", type: "deadline", desc: "", time: ""},
    { date: "2026-11-01", title: "FF14 东京粉丝节", type: "deadline", desc: "", time: ""},
    { date: "2026-03-27", title: "Steam 春季特卖", type: "deadline", desc: "", time: "1:00"},
    { date: "2026-07-10", title: "Steam 夏季特卖", type: "deadline", desc: "", time: "1:00"},
    { date: "2026-10-09", title: "Steam 秋季特卖", type: "deadline", desc: "", time: "1:00"},
    { date: "2027-01-05", title: "Steam 冬季特卖", type: "deadline", desc: "", time: "1:00"},
  ];
  // ==========================================

  // 日历主类
  class CalendarManager {
    constructor() {
      this.currentYear = new Date().getFullYear();
      this.currentMonth = new Date().getMonth();
      this.selectedDate = null;
      this.events = EVENTS_DATA;
      this.init();
    }

    init() {
      this.renderCalendar();
      this.bindEvents();
      this.selectDate(new Date());
    }

    // 获取本地日期字符串 YYYY-MM-DD
    getLocalDateString(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // 获取某天的事件类型列表
    getEventTypesByDate(date) {
      const dateStr = this.getLocalDateString(date);
      const events = this.events.filter(e => e.date === dateStr);
      return [...new Set(events.map(e => e.type))];
    }

    // 根据事件类型获取圆点颜色
    getDotColor(type) {
      const colors = {
        game: '#2e7d32',      // 绿色
        update: '#ed6c02',    // 橙色
        activity: '#0288d1',  // 蓝色
        deadline: '#c62828',  // 红色
        sale: '#7b1fa2'       // 紫色
      };
      return colors[type] || '#ff6b6b';
    }

    renderCalendar() {
      const container = document.getElementById('calendar-days');
      if (!container) return;

      const firstDay = new Date(this.currentYear, this.currentMonth, 1);
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
      const startDayOfWeek = firstDay.getDay();
      const daysInMonth = lastDay.getDate();
      const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();

      let html = '';

      // 上个月的日期
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const date = new Date(this.currentYear, this.currentMonth - 1, day);
        html += this.renderDayCell(day, date, 'other-month');
      }

      // 当月日期
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(this.currentYear, this.currentMonth, day);
        let classes = [];
        if (this.isToday(date)) classes.push('today');
        if (this.selectedDate && this.isSameDate(date, this.selectedDate)) classes.push('selected');
        if (this.hasEvent(date)) classes.push('has-event');
        html += this.renderDayCell(day, date, classes.join(' '));
      }

      // 下个月的日期
      const totalCells = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7;
      const nextMonthDays = totalCells - (startDayOfWeek + daysInMonth);
      for (let day = 1; day <= nextMonthDays; day++) {
        const date = new Date(this.currentYear, this.currentMonth + 1, day);
        html += this.renderDayCell(day, date, 'other-month');
      }

      container.innerHTML = html;
      document.getElementById('calendar-month-year').innerHTML = `${this.currentYear} 年 ${this.currentMonth + 1} 月`;
    }

    renderDayCell(day, date, className) {
      const localDateStr = this.getLocalDateString(date);
      const eventTypes = this.getEventTypesByDate(date);

      // 生成多色圆点
      let dotHtml = '';
      if (eventTypes.length > 0) {
        const dotColors = eventTypes.map(type => this.getDotColor(type));
        const uniqueColors = [...new Set(dotColors)];
        dotHtml = `<div class="event-dots">${uniqueColors.map(color => `<span class="event-dot" style="background: ${color};"></span>`).join('')}</div>`;
      }

      return `<div class="calendar-day ${className}" data-date="${localDateStr}">
        <span class="day-number">${day}</span>
        ${dotHtml}
      </div>`;
    }

    isToday(date) {
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    }

    isSameDate(date1, date2) {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate();
    }

    hasEvent(date) {
      return this.getEventTypesByDate(date).length > 0;
    }

    getEventsByDate(dateStr) {
      const uniqueEvents = [];
      const seen = new Set();

      this.events.filter(e => e.date === dateStr).forEach(event => {
        const key = `${event.title}|${event.time}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueEvents.push(event);
        }
      });

      return uniqueEvents;
    }

    updateSelectedDateDisplay() {
      let dateStr = null;
      if (this.selectedDate) {
        dateStr = this.getLocalDateString(this.selectedDate);
      }
      const events = dateStr ? this.getEventsByDate(dateStr) : [];

      const selectedDateElem = document.getElementById('selected-date');
      if (selectedDateElem) {
        selectedDateElem.textContent = dateStr ? `${dateStr} 的事件` : '请选择一个日期';
      }

      this.renderEventsList(events);
    }

    renderEventsList(events) {
      const container = document.getElementById('events-list');
      if (!container) return;

      if (events.length === 0) {
        container.innerHTML = `
          <div class="empty-events">
            <i class="fas fa-calendar-day"></i>
            <p>这一天没有安排任何事件</p>
          </div>
        `;
        return;
      }

      const typeMap = {
        game: '🎄 游戏发售',
        update: '🍹 游戏更新',
        activity: '🌊 游戏活动',
        deadline: '⏰ 活动截止',
        sale: '🍨 促销活动'
      };

      let html = '';
      events.forEach(event => {
        const cardClass = `${event.type}-card`;

        html += `
          <div class="event-item ${cardClass}">
            <span class="event-type ${event.type}">${typeMap[event.type]}</span>
            <div class="event-title">${this.escapeHtml(event.title)}</div>
            ${event.desc ? `<div class="event-desc">${this.escapeHtml(event.desc)}</div>` : ''}
            ${event.time ? `<div class="event-time"><i class="fas fa-clock"></i> ${this.escapeHtml(event.time)}</div>` : ''}
          </div>
        `;
      });

      container.innerHTML = html;
    }

    bindEvents() {
      const prevBtn = document.getElementById('prev-month');
      const nextBtn = document.getElementById('next-month');
      const todayBtn = document.getElementById('today-btn');

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          this.currentMonth--;
          if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
          }
          this.renderCalendar();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          this.currentMonth++;
          if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
          }
          this.renderCalendar();
        });
      }

      if (todayBtn) {
        todayBtn.addEventListener('click', () => {
          const today = new Date();
          this.currentYear = today.getFullYear();
          this.currentMonth = today.getMonth();
          this.renderCalendar();
          this.selectDate(today);
        });
      }

      const container = document.getElementById('calendar-days');
      if (container) {
        container.addEventListener('click', (e) => {
          const dayCell = e.target.closest('.calendar-day');
          if (dayCell && dayCell.dataset.date) {
            const dateParts = dayCell.dataset.date.split('-');
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;
            const day = parseInt(dateParts[2]);
            const date = new Date(year, month, day);
            this.selectDate(date);
          }
        });
      }

      const exportBtn = document.getElementById('export-events');
      const importBtn = document.getElementById('import-events');
      if (exportBtn) exportBtn.style.display = 'none';
      if (importBtn) importBtn.style.display = 'none';

      const addSection = document.querySelector('.add-event-section');
      if (addSection) addSection.style.display = 'none';
    }

    selectDate(date) {
      this.selectedDate = date;
      this.renderCalendar();
      this.updateSelectedDateDisplay();
    }

    escapeHtml(str) {
      if (!str) return '';
      return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new CalendarManager();
    });
  } else {
    new CalendarManager();
  }
})();
