<script>
document.addEventListener('DOMContentLoaded', function() {
    // 使用更精确的选择器
    const tabContainers = document.querySelectorAll('.tabs');

    tabContainers.forEach(container => {
        // 使用Butterfly主题的实际类名
        const tabs = container.querySelectorAll('.tab');
        const contents = container.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);

                // 隐藏所有内容
                contents.forEach(content => {
                    content.style.display = 'none';
                });

                // 显示目标内容
                document.getElementById(targetId).style.display = 'block';

                // 更新tab状态
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // 存储状态
                if (container.id) {
                    localStorage.setItem(container.id, targetId);
                }
            });
        });
    });

    // 初始化函数
    function initializeTabs() {
        document.querySelectorAll('.tabs').forEach(container => {
            if (!container.id) return;

            const savedTab = localStorage.getItem(container.id);
            const tabs = container.querySelectorAll('.tab');
            const contents = container.querySelectorAll('.tab-content');

            if (savedTab && document.getElementById(savedTab)) {
                // 显示保存的tab
                contents.forEach(c => c.style.display = 'none');
                document.getElementById(savedTab).style.display = 'block';

                // 激活对应的tab按钮
                tabs.forEach(tab => {
                    tab.classList.toggle('active',
                        tab.getAttribute('href') === `#${savedTab}`);
                });
            } else if (contents.length > 0) {
                // 默认显示第一个
                contents[0].style.display = 'block';
                if (tabs.length > 0) tabs[0].classList.add('active');
            }
        });
    }

    initializeTabs();
});
</script>
