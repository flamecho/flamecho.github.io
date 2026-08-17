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

// ============ 获取访客位置（多重备用） ============
async function getVisitorLocation() {
    try {
        const resp = await fetch('https://ipinfo.io/json');
        const data = await resp.json();
        if (data.loc && data.timezone) {
            const [lat, lon] = data.loc.split(',').map(Number);
            return { lat, lon, timezone: data.timezone };
        }
        if (data.loc) {
            const [lat, lon] = data.loc.split(',').map(Number);
            return { lat, lon };
        }
    } catch (e) {
        console.log('ipinfo.io 获取失败');
    }

    try {
        const resp = await fetch('https://ip-api.com/json/?fields=status,lat,lon,timezone');
        const data = await resp.json();
        if (data.status === 'success') {
            return { lat: data.lat, lon: data.lon, timezone: data.timezone };
        }
    } catch (e) {
        console.log('ip-api.com 获取失败');
    }

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                enableHighAccuracy: false
            });
        });
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            timezone: timezone
        };
    } catch (e) {
        console.log('浏览器定位失败');
    }

    return { lat: 41.80, lon: 123.43, timezone: 'Asia/Shanghai' };
}

// ============ 获取日出日落 ============
async function fetchSunTimes(lat, lon, timezone) {
    const now = new Date();
    let dateStr;

    if (timezone) {
        const localDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
        dateStr = localDate.toISOString().split('T')[0];
    } else {
        dateStr = now.toISOString().split('T')[0];
    }

    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${dateStr}&formatted=0`;

    try {
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.status === 'OK') {
            const sunrise = new Date(data.results.sunrise);
            const sunset = new Date(data.results.sunset);

            const options = { hour: '2-digit', minute: '2-digit' };
            let sunriseStr, sunsetStr;

            if (timezone) {
                sunriseStr = sunrise.toLocaleTimeString('zh-CN', { ...options, timeZone: timezone });
                sunsetStr = sunset.toLocaleTimeString('zh-CN', { ...options, timeZone: timezone });
            } else {
                sunriseStr = sunrise.toLocaleTimeString('zh-CN', options);
                sunsetStr = sunset.toLocaleTimeString('zh-CN', options);
            }

            return { sunrise: sunriseStr, sunset: sunsetStr };
        }
    } catch (e) {
        console.log('获取日出日落失败');
    }
    return { sunrise: '--:--', sunset: '--:--' };
}

// ============ 更新卡片 ============
async function updateMoonCard() {
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

    // 更新日期
    const location = await getVisitorLocation();
    const timeZone = location.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

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

    // 更新日出日落
    const sunTimes = await fetchSunTimes(location.lat, location.lon, location.timezone);
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
