/* 门户浮动导航（合并站点注入用）：在电梯/扶梯应用页左下角浮动胶囊
 * 仅合并站点（site/）下的应用拷贝注入本脚本；源应用目录不包含此文件
 *
 * 路径说明：应用页位于 site/elevator/ 或 site/escalator/（相对站点根恰为上一级），
 * 必须用 ../index.html（旧版 ../../ 会爬到站点根之外导致返回失败；http 与 file 双场景均适用）
 *
 * 本文件由站点服务注入：<script src="../portal-link.js"></script>
 * 注入两颗胶囊：
 *   #portal-back  → ../index.html（‹ 返回首页）  ← 历史行为，保持不变
 *   #portal-about → ../about.html（作品介绍）    ← 本轮新增
 * 两者纵向堆叠：返回在下（bottom:14px）、介绍在上（bottom:56px），互不重叠。
 * 文案沿用"作品介绍"而不用"关于"：应用内已有「关于」按钮弹出自身弹窗，避免混淆。
 */
(function () {
  function pill(id, href, text, bottom) {
    var el = document.createElement('a');
    el.id = id;
    el.href = href;
    el.textContent = text;
    /* 触屏/小屏补到 44px 最小点击区，桌面 ≥40px */
    var touch = false;
    try { touch = !!(window.matchMedia && window.matchMedia('(max-width:480px)').matches); } catch (e) { touch = false; }
    var minH = touch ? '44px' : '40px';
    el.setAttribute('style', [
      'position:fixed', 'left:14px', 'bottom:' + bottom + 'px', 'z-index:9999',
      'display:inline-flex', 'align-items:center', 'gap:6px',
      'padding:7px 14px', 'min-height:' + minH, 'box-sizing:border-box',
      'border-radius:999px',
      'background:rgba(15,23,42,.82)', 'color:#fff',
      'font:600 13px/1.4 "Microsoft YaHei","PingFang SC",system-ui,sans-serif',
      'text-decoration:none', 'box-shadow:0 2px 10px rgba(15,23,42,.25)',
      'backdrop-filter:blur(4px)', 'cursor:pointer'
    ].join(';'));
    el.addEventListener('mouseenter', function () { el.style.background = 'rgba(30,58,138,.92)'; });
    el.addEventListener('mouseleave', function () { el.style.background = 'rgba(15,23,42,.82)'; });
    document.body.appendChild(el);
  }

  function mount() {
    if (!document.body) return;
    if (!document.getElementById('portal-back')) pill('portal-back', '../index.html', '‹ 返回首页', 14);
    if (!document.getElementById('portal-about')) pill('portal-about', '../about.html', '作品介绍', 56);
  }

  try {
    /* DOM 已就绪（构建注入点位于 body 末尾）时直接挂载；否则用 DOMContentLoaded 兜底 */
    mount();
    if (!document.getElementById('portal-about')) {
      document.addEventListener('DOMContentLoaded', mount);
    }
  } catch (err) {
    /* 门户胶囊属于增强能力，失败不得影响应用本体运行 */
    if (window.console && console.warn) console.warn('portal-link:', err);
  }
})();
