
  document.querySelectorAll('.tab-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.remove('active'); });
      btn.classList.add('active'); btn.setAttribute('aria-selected','true');
      var panel = document.getElementById('panel-' + btn.getAttribute('data-tab'));
      if (panel) panel.classList.add('active');
      // 行程页激活时加daynav标记，调整回到顶部按钮位置
      if (btn.getAttribute('data-tab') === 'itinerary') {
        document.body.classList.add('has-daynav');
      } else {
        document.body.classList.remove('has-daynav');
      }
      // 重置各面板二级导航高亮到首项
      var activePanel = document.querySelector('.tab-panel.active');
      if (activePanel) {
        var firstBtn = activePanel.querySelector('.sub-nav-btn, .day-nav-btn');
        if (firstBtn) {
          activePanel.querySelectorAll('.sub-nav-btn, .day-nav-btn').forEach(function(b){ b.classList.remove('active'); });
          firstBtn.classList.add('active');
        }
      }
      window.scrollTo({top:0, behavior:'auto'});
    });
  });


(function(){
  // ---- 每日行程折叠 ----
  document.querySelectorAll('.day-item').forEach(function(item){
    item.addEventListener('click', function(e){
      if (e.target.closest('button')) return;
      item.classList.toggle('open');
    });
  });

  // ---- 全部展开/收起 ----
  document.querySelectorAll('[data-expand]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var route = btn.getAttribute('data-expand');
      var container = document.querySelector('.itinerary[data-route="'+route+'"]');
      if (container) container.querySelectorAll('.day-item').forEach(function(item){ item.classList.add('open'); });
    });
  });
  document.querySelectorAll('[data-collapse]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var route = btn.getAttribute('data-collapse');
      var container = document.querySelector('.itinerary[data-route="'+route+'"]');
      if (container) container.querySelectorAll('.day-item').forEach(function(item){ item.classList.remove('open'); });
    });
  });

  // ---- 快速跳转导航 ----
  var navBtns = document.querySelectorAll('.day-nav-btn');
  var dayItems = document.querySelectorAll('.day-item[id]');
  var navBar = document.querySelector('.day-nav');
  var backTop = document.querySelector('.back-top');
  var suppressScrollUpdate = false;
  var suppressTimer = null;

  navBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      var day = btn.getAttribute('data-day');
      // 立即设置 active
      navBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      // 居中选中按钮
      centerNavBtn(btn);
      // 滚动到对应天
      var target = document.getElementById('day' + day);
      if (target) {
        target.classList.add('open');
        // 禁用滚动高亮
        suppressScrollUpdate = true;
        clearTimeout(suppressTimer);
        var top = target.getBoundingClientRect().top + window.scrollY - 10;
        window.scrollTo({top: top, behavior: 'smooth'});
        // 用 scrollend 检测完成，兼容降级用 1.5s 超时
        function onScrollEnd() {
          suppressScrollUpdate = false;
          if (window.removeEventListener) window.removeEventListener('scrollend', onScrollEnd);
        }
        if (window.addEventListener && 'scrollend' in window) {
          window.addEventListener('scrollend', onScrollEnd);
        }
        suppressTimer = setTimeout(function(){ 
          suppressScrollUpdate = false; 
          if (window.removeEventListener) window.removeEventListener('scrollend', onScrollEnd);
        }, 1500);
      }
    });
  });

  function centerNavBtn(btn) {
    if (!btn || !navBar) return;
    var btnLeft = btn.offsetLeft;
    var btnWidth = btn.offsetWidth;
    var navWidth = navBar.offsetWidth;
    var targetScroll = btnLeft - (navWidth - btnWidth) / 2;
    navBar.scrollTo({left: Math.max(0, targetScroll), behavior: 'smooth'});
  }

  // 滚动高亮当前天
  function updateActiveNav() {
    if (suppressScrollUpdate) return;
    var activeDay = null;
    dayItems.forEach(function(item){
      var rect = item.getBoundingClientRect();
      if (rect.top < 200) {
        activeDay = item.id.replace('day','');
      }
    });
    if (!activeDay) return;
    var currentActive = document.querySelector('.day-nav-btn.active');
    var currentDay = currentActive ? currentActive.getAttribute('data-day') : null;
    if (activeDay !== currentDay) {
      navBtns.forEach(function(btn){
        btn.classList.toggle('active', btn.getAttribute('data-day') === activeDay);
      });
      centerNavBtn(document.querySelector('.day-nav-btn.active'));
    }
  }
  var scrollTimer = null;
  window.addEventListener('scroll', function(){
    if (backTop) backTop.classList.toggle('show', window.scrollY > 700);
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function(){
      updateActiveNav();
      updateSubNav();
    }, 80);
  });
  updateActiveNav();

  // ---- 回到顶部 ----
  if (backTop) {
    backTop.addEventListener('click', function(){
      window.scrollTo({top:0, behavior:'smooth'});
    });
  }

  // ===== 通用二级导航：点击跳转 + 滚动高亮 =====
  var subSuppress = false;
  var subSuppressTimer = null;

  document.querySelectorAll('.sub-nav-btn[data-scroll]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var targetId = btn.getAttribute('data-scroll');
      var target = document.getElementById(targetId);
      if (!target) return;
      // 高亮当前按钮
      var panel = btn.closest('.tab-panel');
      if (panel) {
        panel.querySelectorAll('.sub-nav-btn').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
      }
      // 居中按钮
      var navBar = btn.closest('.sub-nav');
      if (navBar) {
        var btnLeft = btn.offsetLeft;
        var btnWidth = btn.offsetWidth;
        var navWidth = navBar.offsetWidth;
        navBar.scrollTo({left: Math.max(0, btnLeft - (navWidth - btnWidth) / 2), behavior: 'smooth'});
      }
      // 滚动到目标
      subSuppress = true;
      clearTimeout(subSuppressTimer);
      var top = target.getBoundingClientRect().top + window.scrollY - 10;
      window.scrollTo({top: top, behavior: 'smooth'});
      function onSubScrollEnd() {
        subSuppress = false;
        if (window.removeEventListener) window.removeEventListener('scrollend', onSubScrollEnd);
      }
      if (window.addEventListener && 'scrollend' in window) {
        window.addEventListener('scrollend', onSubScrollEnd);
      }
      subSuppressTimer = setTimeout(function(){
        subSuppress = false;
        if (window.removeEventListener) window.removeEventListener('scrollend', onSubScrollEnd);
      }, 1500);
    });
  });

  // 滚动高亮当前section（通用sub-nav）
  function updateSubNav() {
    if (subSuppress) return;
    var activePanel = document.querySelector('.tab-panel.active');
    if (!activePanel) return;
    var subBtns = activePanel.querySelectorAll('.sub-nav-btn[data-scroll]');
    if (!subBtns.length) return;
    var activeId = null;
    subBtns.forEach(function(btn){
      var target = document.getElementById(btn.getAttribute('data-scroll'));
      if (target && target.getBoundingClientRect().top < 200) {
        activeId = btn.getAttribute('data-scroll');
      }
    });
    if (!activeId) return;
    var currentActive = activePanel.querySelector('.sub-nav-btn.active');
    var currentId = currentActive ? currentActive.getAttribute('data-scroll') : null;
    if (activeId !== currentId) {
      subBtns.forEach(function(btn){
        btn.classList.toggle('active', btn.getAttribute('data-scroll') === activeId);
      });
    }
  }

  // 将sub-nav滚动高亮挂到已有的scroll事件上
  // （已合并到上方scroll监听中的updateSubNav调用）
// ===== 表格横向滑动提示：只在真的滑得动时加边框和文字 =====
  function markScrollables(){
    document.querySelectorAll('.table-scroll').forEach(function(el){
      var hint = el.nextElementSibling;
      if (!hint || !hint.classList.contains('scroll-hint')) {
        hint = document.createElement('div');
        hint.className = 'scroll-hint';
        hint.textContent = '← 可左右滑动查看 →';
        el.parentNode.insertBefore(hint, el.nextSibling);
      }
      el.classList.toggle('can-scroll', el.scrollWidth > el.clientWidth + 2);
    });
  }
  markScrollables();
  window.addEventListener('load', markScrollables);
  var rsTimer = null;
  window.addEventListener('resize', function(){
    clearTimeout(rsTimer);
    rsTimer = setTimeout(markScrollables, 150);
  });
  document.querySelectorAll('.tab-btn').forEach(function(b){
    b.addEventListener('click', function(){ setTimeout(markScrollables, 0); });
  });
})();
