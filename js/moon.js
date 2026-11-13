// ============ 月相计算 ============
function getMoonPhase(date) {
    const reference = new Date(Date.UTC(2000, 0, 6, 18, 14));
    const diff = (date.getTime() - reference.getTime()) / (1000 * 60 * 60 * 24);
    const phase = (diff % 29.53058770576) / 29.53058770576;
    return phase < 0 ? phase + 1 : phase;
}

// ============ 获取月相图片和名称 ============
function getMoonImage(phase) {
    const p = Math.round(phase * 28) / 28;

    if (p < 0.03 || p >= 0.97) return { file: 'Moon_phase_0.png', name: '朔月' };
    if (p >= 0.03 && p < 0.22) return { file: 'Moon_phase_3.png', name: '蛾眉月' };
    if (p >= 0.22 && p < 0.28) return { file: 'Moon_phase_6.png', name: '上弦月' };
    if (p >= 0.28 && p < 0.47) return { file: 'Moon_phase_9.png', name: '盈凸月' };
    if (p >= 0.47 && p < 0.53) return { file: 'Moon_phase_12.png', name: '望月' };
    if (p >= 0.53 && p < 0.72) return { file: 'Moon_phase_15.png', name: '亏凸月' };
    if (p >= 0.72 && p < 0.78) return { file: 'Moon_phase_18.png', name: '下弦月' };
    if (p >= 0.78 && p < 0.97) return { file: 'Moon_phase_21.png', name: '残月' };

    return { file: 'Moon_phase_12.png', name: '望月' };
}

// ============ 固定位置：沈阳 ============
const LOCATION = {
    lat: 41.8057,
    lon: 123.4315,
    timezone: 'Asia/Shanghai'
};

// ============ 日出日落（本地计算，无需网络） ============
// NOAA 太阳位置近似算法 + 标准日出方程，误差约 ±1 分钟
const RAD = Math.PI / 180;

// 计算某日历日的日出/日落，返回 UTC 毫秒时间戳
function sunTimesForDate(y, m, d, lat, lon) {
    const jd0 = Date.UTC(y, m - 1, d) / 86400000 + 2440587.5;
    const n = Math.round(jd0 - 2451545.0 + 0.0008);
    const Jstar = n - lon / 360;                                  // 平太阳时
    const M = (357.5291 + 0.98560028 * Jstar) % 360;              // 平近点角
    const Mr = M * RAD;
    const C = 1.9148 * Math.sin(Mr) + 0.02 * Math.sin(2 * Mr) + 0.0003 * Math.sin(3 * Mr);
    const lambda = ((M + C + 180 + 102.9372) % 360) * RAD;        // 黄经
    const Jtransit = 2451545.0 + Jstar + 0.0053 * Math.sin(Mr) - 0.0069 * Math.sin(2 * lambda); // 过中天
    const sinDec = Math.sin(lambda) * Math.sin(23.4397 * RAD);
    const dec = Math.asin(sinDec);                                // 赤纬

    // 时角：-0.833° 已含大气折射与日面半径
    const cosOmega = (Math.sin(-0.833 * RAD) - Math.sin(lat * RAD) * sinDec) /
                     (Math.cos(lat * RAD) * Math.cos(dec));
    if (cosOmega > 1) return { polar: 'night' };   // 极夜
    if (cosOmega < -1) return { polar: 'day' };    // 极昼

    const omega = Math.acos(cosOmega) / RAD;       // 度
    return {
        rise: (Jtransit - omega / 360 - 2440587.5) * 86400000,
        set: (Jtransit + omega / 360 - 2440587.5) * 86400000
    };
}

// ============ 获取日出日落 ============
function getSunTimes(lat, lon, timezone) {
    const timeZone = timezone || LOCATION.timezone;
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date());
    const [y, m, d] = dateStr.split('-').map(Number);

    const t = sunTimesForDate(y, m, d, lat, lon);
    if (!t || t.polar) {
        return { sunrise: '--:--', sunset: '--:--' };
    }

    const fmt = (ms) => new Date(ms).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone
    });

    return { sunrise: fmt(t.rise), sunset: fmt(t.set) };
}

// ============ 更新卡片 ============
function updateMoonCard() {
    const now = new Date();
    const phase = getMoonPhase(now);
    const { file, name } = getMoonImage(phase);

    // 更新月相图片
    const imgEl = document.getElementById('moonImage');
    if (imgEl) {
        imgEl.src = `/img/moon/${file}`;
        imgEl.alt = name;
        imgEl.onload = function () {
            const textEl = document.querySelector('.moon-phase-text');
            if (textEl) textEl.textContent = name;
        };
        if (imgEl.complete) {
            const textEl = document.querySelector('.moon-phase-text');
            if (textEl) textEl.textContent = name;
        }
    }

    // 更新日期（沈阳时区）
    const timeZone = LOCATION.timezone;

    const dateDay = now.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        timeZone: timeZone
    });

    const dateWeekday = now.toLocaleDateString('zh-CN', {
        weekday: 'long',
        timeZone: timeZone
    });

    const dayEl = document.getElementById('moonDateDay');
    if (dayEl) {
        dayEl.textContent = dateDay;
    }

    const weekdayEl = document.getElementById('moonDateWeekday');
    if (weekdayEl) {
        weekdayEl.textContent = dateWeekday;
    }

    // 更新日出日落（本地计算）
    const sunTimes = getSunTimes(LOCATION.lat, LOCATION.lon, LOCATION.timezone);
    document.getElementById('sunriseTime').textContent = sunTimes.sunrise;
    document.getElementById('sunsetTime').textContent = sunTimes.sunset;
}

// ============ 执行：页面加载 + Pjax 切换 ============
function initMoonCard() {
    const textEl = document.querySelector('.moon-phase-text');
    if (textEl) textEl.textContent = '加载中...';
    document.getElementById('sunriseTime').textContent = '--:--';
    document.getElementById('sunsetTime').textContent = '--:--';
    updateMoonCard();
}

document.addEventListener('DOMContentLoaded', initMoonCard);
document.addEventListener('pjax:complete', initMoonCard);
document.addEventListener('turbolinks:load', initMoonCard);
