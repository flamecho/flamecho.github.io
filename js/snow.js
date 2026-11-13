if (window.innerWidth < 768 || (navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
    // 移动端不显示雪花
} else {
    // 创建 canvas 元素
    var canvas = document.createElement('canvas');
    canvas.id = 'snow';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-2';
    document.body.appendChild(canvas);

    window && (() => {
        // 基础配置
        let e = {
            flakeCount: 35,
            minDist: 150,
            color: "255, 249, 245",
            size: 2.5,
            speed: 0.25,
            opacity: 0.55,
            stepsize: 0.2
        };

        // 根据主题获取透明度
        const getOpacity = () => {
            const theme = document.documentElement.getAttribute('data-theme');
            // 白天透明度调高（更明显），黑夜保持原样
            if (theme === 'light') {
                return 1.2;  // 白天更明显
            } else {
                return 0.6; // 黑夜保持原样
            }
        };

        // 更新全局透明度
        let currentOpacity = getOpacity();

        // 监听主题变化
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'data-theme') {
                    currentOpacity = getOpacity();
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });

        const t = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function(e) {
            window.setTimeout(e, 1e3 / 60)
        };
        window.requestAnimationFrame = t;

        const i = document.getElementById("snow"),
            n = i.getContext("2d"),
            o = e.flakeCount;
        let a = -100,
            d = -100,
            s = [];

        i.width = window.innerWidth;
        i.height = window.innerHeight;

        const h = () => {
            n.clearRect(0, 0, i.width, i.height);
            const r = e.minDist;
            for (let t = 0; t < o; t++) {
                let o = s[t];
                const h = a,
                    w = d,
                    m = o.x,
                    c = o.y,
                    p = Math.sqrt((h - m) * (h - m) + (w - c) * (w - c));
                if (p < r) {
                    const e = (h - m) / p,
                        t = (w - c) / p,
                        i = r / (p * p) / 2;
                    o.velX -= i * e;
                    o.velY -= i * t;
                } else {
                    o.velX *= .98;
                    if (o.velY < o.speed && o.speed - o.velY > .01) {
                        o.velY += .01 * (o.speed - o.velY);
                    }
                    o.velX += Math.cos(o.step += .05) * o.stepSize;
                }
                // 使用动态透明度
                n.fillStyle = "rgba(" + e.color + ", " + (o.opacity * currentOpacity) + ")";
                o.y += o.velY;
                o.x += o.velX;
                if (o.y >= i.height || o.y <= 0) l(o);
                if (o.x >= i.width || o.x <= 0) l(o);
                n.beginPath();
                n.arc(o.x, o.y, o.size, 0, 2 * Math.PI);
                n.fill();
            }
            t(h);
        };

        const l = e => {
            e.x = Math.floor(Math.random() * i.width);
            e.y = 0;
            e.size = 3 * Math.random() + 2;
            e.speed = 1 * Math.random() + .5;
            e.velY = e.speed;
            e.velX = 0;
            // 基础透明度范围 0.3 ~ 0.8
            e.opacity = .5 * Math.random() + .3;
        };

        document.addEventListener("mousemove", (e => {
            a = e.clientX;
            d = e.clientY;
        }));

        window.addEventListener("resize", (() => {
            i.width = window.innerWidth;
            i.height = window.innerHeight;
        }));

        (() => {
            for (let t = 0; t < o; t++) {
                const t = Math.floor(Math.random() * i.width);
                const n = Math.floor(Math.random() * i.height);
                const o = 3 * Math.random() + e.size;
                const a = 1 * Math.random() + e.speed;
                const d = .5 * Math.random() + .3;  // 基础透明度
                s.push({
                    speed: a,
                    velX: 0,
                    velY: a,
                    x: t,
                    y: n,
                    size: o,
                    stepSize: Math.random() / 30 * e.stepsize,
                    step: 0,
                    angle: 180,
                    opacity: d
                });
            }
            h();
        })();
    })();
}
