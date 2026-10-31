var CURSOR;

Math.lerp = (a, b, n) => (1 - n) * a + n * b;

const getStyle = (el, attr) => {
    try {
        return window.getComputedStyle
            ? window.getComputedStyle(el)[attr]
            : el.currentStyle[attr];
    } catch (e) {}
    return "";
};

// 是否处于可点击区域：自身或任一祖先为链接/按钮类元素，或显式 cursor:pointer。
// 实时判断（事件委托），覆盖「鼠标落在链接内部子元素」「pjax/懒加载后新增或替换的节点」。
// 注意：光标注入的 `* {cursor:url(...)}` 会把全部元素的计算值改成 svg，pointer 不再是可靠信号，
// 所以以语义选择器为主，cursor:pointer 仅作兜底（内联样式等特异性更高的规则）。
const CLICKABLE = 'a[href], button, [role="button"], summary, [onclick]';

const isInteractive = (el) => {
    if (!el || el.nodeType !== 1) return false;
    if (el.closest(CLICKABLE)) return true;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        if (getStyle(n, 'cursor') === 'pointer') return true;
    }
    return false;
};

class Cursor {
    constructor() {
        this.pos = {curr: null, prev: null};
        this.create();
        this.init();
        this.render();
    }

    move(left, top) {
        this.cursor.style["left"] = `${left}px`;
        this.cursor.style["top"] = `${top}px`;
    }

    create() {
        if (!this.cursor) {
            this.cursor = document.createElement("div");
            this.cursor.id = "cursor";
            this.cursor.classList.add("hidden");
            document.body.append(this.cursor);
        }

        document.body.appendChild((this.scr = document.createElement("style")));
        // 这里改变鼠标指针的颜色 由svg生成
        // 白天 #3a62a0 / 夜间 #3c4f8b：用 [data-theme="dark"] 覆盖，随主题切换自动生效，无需 refresh
        const dot = (fill) => `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' width='8px' height='8px'><circle cx='4' cy='4' r='4' opacity='1.0' fill='${fill}'/></svg>") 4 4, auto`;
        // 加 !important：自定义光标必须压过主题/页面里所有 cursor:pointer 声明（筛选器、按钮、链接等）
        this.scr.innerHTML = `*, *::before, *::after {cursor: ${dot("rgb(58, 98, 160)")} !important}
html[data-theme="dark"], html[data-theme="dark"] *, html[data-theme="dark"] *::before, html[data-theme="dark"] *::after {cursor: ${dot("rgb(60, 79, 139)")} !important}`;
    }

    refresh() {
        this.scr.remove();
        this.cursor.classList.remove("hover");
        this.cursor.classList.remove("active");
        this.pos = {curr: null, prev: null};

        this.create();
        this.init();
        this.render();
    }

    init() {
        document.onmouseover  = e => this.cursor.classList.toggle('hover', isInteractive(e.target));
        document.onmouseout   = e => { if (!e.relatedTarget) this.cursor.classList.remove('hover'); };
        document.onmousemove  = e => {(this.pos.curr == null) && this.move(e.clientX - 8, e.clientY - 8); this.pos.curr = {x: e.clientX - 8, y: e.clientY - 8}; this.cursor.classList.remove("hidden");};
        document.onmouseenter = e => this.cursor.classList.remove("hidden");
        document.onmouseleave = e => this.cursor.classList.add("hidden");
        document.onmousedown  = e => this.cursor.classList.add("active");
        document.onmouseup    = e => this.cursor.classList.remove("active");
    }

    render() {
        if (this.pos.prev) {
            this.pos.prev.x = Math.lerp(this.pos.prev.x, this.pos.curr.x, 0.15);
            this.pos.prev.y = Math.lerp(this.pos.prev.y, this.pos.curr.y, 0.15);
            this.move(this.pos.prev.x, this.pos.prev.y);
        } else {
            this.pos.prev = this.pos.curr;
        }
        requestAnimationFrame(() => this.render());
    }
}

(() => {
    CURSOR = new Cursor();
    // 需要重新获取列表时，使用 CURSOR.refresh()
})();
