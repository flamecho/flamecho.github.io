document.addEventListener('DOMContentLoaded', function() {
  console.log('Tabs coordinator initialized');

  // Butterfly主题的tabs处理
  const handleTabs = () => {
    document.querySelectorAll('.tabs').forEach(group => {
      const tabs = group.querySelectorAll('.nav-tabs .tab');
      const contents = group.querySelectorAll('.tab-contents .tab-item-content');

      tabs.forEach(tab => {
        const btn = tab.querySelector('button');
        if (btn) {
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-href').substring(1);

            // 更新active状态
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(targetId)?.classList.add('active');

            // 存储状态
            if (group.id) {
              localStorage.setItem(`tabGroup_${group.id}`, targetId);
            }
          });
        }
      });
    });
  };

  // 初始执行
  handleTabs();

  // 监听pjax重新加载
  if (window.pjax) {
    document.addEventListener('pjax:complete', handleTabs);
  }
});
