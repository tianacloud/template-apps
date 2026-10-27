/* 星星打卡 · 应用主逻辑
 * 账号模型：只有家长能注册登录；孩子是家长名下的档案
 * 家长登录后默认看孩子的看板；「任务」「我的」与所有确认操作都要家长密码
 */
(function () {
  'use strict';

  var S = Store, C = Charts;
  var app = document.getElementById('app');
  var modalRoot = document.getElementById('modal-root');
  var toastRoot = document.getElementById('toast-root');
  var fxRoot = document.getElementById('fx-root');

  var TASK_EMOJIS = ['👕', '🥛', '🍚', '🪥', '🛁', '📚', '🎹', '✍️', '🧮', '🏃', '⚽', '🎨', '🧸', '🧹', '🍽️', '🌙', '💤', '🙏', '🗣️', '💧', '🧴', '🎒', '🚿', '🥕', '🐶', '🌱', '🧩', '🎵', '🖍️', '⏰'];
  var REWARD_EMOJIS = ['📺', '🎮', '🍦', '🍫', '🌳', '🎡', '📖', '🧸', '🚲', '🎁', '🍕', '🐠', '🎠', '☀️', '🍰', '🎬'];
  var GOAL_EMOJIS = ['🔥', '🎯', '💰', '⭐', '🏆', '🌈', '🚀', '👑', '💎', '🍀'];
  var KID_AVATARS = ['🧒', '👦', '👧', '👶', '🐻', '🐰', '🐱', '🐶', '🦊', '🐼', '🦁', '🐯', '🦄', '🐧', '🐸', '🐨', '🐵', '🦖', '🐷', '🐮', '🐤'];

  var UI = { route: 'home', dateKey: S.todayKey(), loginMode: 'login', avatar: '👩', kidAvatar: '🧒' };
  var busy = false;

  var NAV = [
    { route: 'home', emoji: '🏠', label: '看板', lock: false },
    { route: 'tasks', emoji: '✅', label: '任务', lock: true },
    { route: 'rewards', emoji: '🎁', label: '奖励', lock: true },
    { route: 'me', emoji: '🐻', label: '我的', lock: true }
  ];

  /* ---------------- 基础工具 ---------------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function toast(msg, type) {
    var el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = msg;
    toastRoot.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .3s, transform .3s';
      el.style.opacity = '0'; el.style.transform = 'translateY(-8px)';
      setTimeout(function () { el.remove(); }, 320);
    }, 1900);
  }

  function confetti(emoji, n) {
    n = n || 18;
    for (var i = 0; i < n; i++) {
      (function (i) {
        var el = document.createElement('div');
        el.className = 'fx-item';
        el.textContent = emoji || '⭐';
        el.style.left = (Math.random() * 90 + 5) + '%';
        el.style.top = (30 + Math.random() * 30) + '%';
        el.style.setProperty('--dx', (Math.random() * 240 - 120) + 'px');
        el.style.setProperty('--dy', (120 + Math.random() * 260) + 'px');
        el.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
        el.style.animationDelay = (Math.random() * .25) + 's';
        fxRoot.appendChild(el);
        setTimeout(function () { el.remove(); }, 1700);
      })(i);
    }
  }

  function openModal(title, emoji, bodyHTML, footerHTML, onMount) {
    var mask = document.createElement('div');
    mask.className = 'modal-mask';
    mask.innerHTML =
      '<div class="modal">' +
      '<div class="modal-hd"><span style="font-size:24px">' + (emoji || '') + '</span><h3>' + esc(title) + '</h3>' +
      '<button class="close" data-act="closeModal">✕</button></div>' +
      '<div class="modal-body">' + bodyHTML + '</div>' +
      (footerHTML ? '<div class="modal-ft">' + footerHTML + '</div>' : '') +
      '</div>';
    modalRoot.appendChild(mask);
    mask.addEventListener('click', function (e) { if (e.target === mask) closeModal(); });
    if (onMount) onMount(mask);
  }
  function closeModal() { modalRoot.innerHTML = ''; }
  function modalVal(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }

  /* 统一写操作包装：防重复点击 + 错误提示 */
  function run(promise, okMsg, onDone) {
    if (busy) return;
    busy = true;
    return promise.then(function (j) {
      busy = false;
      if (!j || j.ok === false) {
        toast((j && j.msg) || '操作失败，请确认服务已启动', 'warn');
        return null;
      }
      if (okMsg) toast(okMsg);
      if (onDone) onDone(j);
      return j;
    }).catch(function (e) {
      busy = false;
      toast('网络异常：' + e.message, 'warn');
      return null;
    });
  }

  function playEvents() {
    var ev = S.events || { badges: [], goals: [] };
    if (ev.badges && ev.badges.length) {
      setTimeout(function () {
        confetti(ev.badges[0].emoji, 22);
        toast('🎉 解锁新徽章：' + ev.badges[0].name);
      }, 300);
    }
    if (ev.goals && ev.goals.length) {
      setTimeout(function () {
        confetti('🎁', 22);
        toast('🎯 目标达成：' + ev.goals[0].title + '！奖励：' + ev.goals[0].reward);
      }, ev.badges && ev.badges.length ? 1000 : 300);
    }
  }

  /* ---------------- 登录 / 注册（家长，云服务邮箱账号） ---------------- */
  function viewLogin() {
    UI.avatar = '👩'; UI.loginMode = 'login'; UI.otp = null;
    renderLoginCard(S.rememberEmail || '', '', true);
  }

  function segBtn(mode, label) {
    return '<button type="button" data-act="loginMode" data-mode="' + mode + '" class="' + (UI.loginMode === mode ? 'on' : '') + '">' + label + '</button>';
  }

  function renderLoginCard(email, pwd, checked) {
    var mode = UI.loginMode;
    app.innerHTML =
      '<div class="login-wrap">' +
      '<div class="login-card">' +
      '<div class="mascot">' + (mode === 'register' ? '🎈' : '👩') + '</div>' +
      '<div class="brand">⭐ 星星<span>打卡</span></div>' +
      '<div class="slogan">' + (mode === 'register' ? '注册家长账号 · 再添加宝宝档案' : '家长登录 · 管理孩子的每日打卡') + '</div>' +
      '<div class="seg">' + segBtn('login', '密码登录') + segBtn('otp', '验证码登录') + segBtn('register', '注册') + '</div>' +
      '<div id="login-area">' + loginArea(email, pwd, checked) + '</div>' +
      '</div></div>';
    bindStrength(document);
  }

  function loginArea(email, pwd, checked) {
    var mode = UI.loginMode;
    var html = '';
    if (mode === 'register') {
      html += '<div class="field"><label>选一个头像</label><div class="avatar-grid">' +
        S.AVATARS.map(function (a) {
          return '<button type="button" data-act="pickAvatar" data-avatar="' + a + '" class="' + (a === UI.avatar ? 'on' : '') + '">' + a + '</button>';
        }).join('') + '</div></div>';
      html += '<div class="field"><label>你的昵称</label>' +
        '<input id="f-nickname" class="input" placeholder="孩子看到的称呼，例如 妈妈" autocomplete="nickname"></div>';
    }

    html += '<div class="field"><label>邮箱</label>' +
      '<input id="f-email" class="input" type="email" inputmode="email" placeholder="请输入邮箱" value="' + esc(email) + '" autocomplete="email"></div>';

    if (mode === 'login') {
      html += '<div class="field"><label>密码</label>' +
        '<input id="f-pwd" class="input" type="password" placeholder="请输入密码" value="' + esc(pwd) + '" autocomplete="current-password"></div>' +
        '<label class="remember"><input type="checkbox" id="f-remember"' + (checked ? ' checked' : '') + '>记住我的邮箱</label>' +
        '<button type="button" class="btn block" data-act="doLogin">🚀 开始打卡</button>' +
        '<div style="text-align:center;margin-top:12px;display:flex;justify-content:center;gap:14px">' +
        '<button type="button" class="link-btn" data-act="forgotPwd">忘记密码？</button>' +
        '<button type="button" class="link-btn" data-act="loginMode" data-mode="register">还没有账号？去注册 →</button>' +
        '</div>';
    } else {
      html += '<div class="field"><label>邮箱验证码</label>' +
        '<div style="display:flex;gap:8px">' +
        '<input id="f-code" class="input" inputmode="numeric" placeholder="6 位验证码" style="flex:1">' +
        '<button type="button" class="btn sm" data-act="sendCode" style="white-space:nowrap">获取验证码</button>' +
        '</div><div id="code-tip" class="match-tip">' + (UI.otp && UI.otp.email === email ? '验证码已发送，10 分钟内有效' : '') + '</div></div>';
      if (mode === 'register') {
        html += '<div class="field"><label>登录密码</label>' +
          '<input id="f-pwd" class="input" type="password" placeholder="至少 ' + S.PWD_MIN + ' 位，字母+数字" autocomplete="new-password">' +
          strengthMeter() + '</div>' +
          '<div class="field"><label>确认密码</label>' +
          '<input id="f-pwd2" class="input" type="password" placeholder="再输入一次密码" autocomplete="new-password">' +
          '<div id="f-pwd2-tip" class="match-tip"></div></div>';
      }
      html += '<button type="button" class="btn block ' + (mode === 'register' ? 'green' : '') + '" data-act="' + (mode === 'register' ? 'doRegister' : 'doOtpLogin') + '">' +
        (mode === 'register' ? '🎉 创建账号并进入' : '📬 验证码登录') + '</button>' +
        '<div style="text-align:center;margin-top:12px">' +
        '<button type="button" class="link-btn" data-act="loginMode" data-mode="login">← 用密码登录</button>' +
        '</div>';
    }

    html += '<div class="tip-box">🔒 家长专属：孩子不需要账号，登录后在「我的」里添加宝宝档案即可</div>';
    return html;
  }

  /* 密码强度条（注册 / 改密码共用） */
  function strengthMeter() {
    return '<div class="pwd-meter"><div class="pm-bar"><i id="pm-fill"></i></div>' +
      '<div class="pm-text"><span id="pm-label">先输入密码</span><span id="pm-tips"></span></div></div>';
  }
  function bindStrength(mask) {
    var inp = $('#f-pwd', mask), inp2 = $('#f-pwd2', mask);
    if (!inp) return;
    function paint() {
      var v = inp.value;
      var st = S.pwdStrength(v);
      var fill = $('#pm-fill', mask), label = $('#pm-label', mask), tips = $('#pm-tips', mask);
      if (fill) {
        fill.style.width = (v ? st.percent : 0) + '%';
        fill.className = 'pm-' + st.score;
      }
      if (label) label.textContent = v ? '强度：' + st.label : '先输入密码';
      if (tips) tips.textContent = v && !st.ok ? st.tips.slice(0, 2).join(' · ') : '';
      var t2 = $('#f-pwd2-tip', mask);
      if (t2) {
        if (!inp2 || !inp2.value) t2.textContent = '';
        else if (inp2.value !== v) { t2.textContent = '✗ 两次输入不一致'; t2.className = 'match-tip bad'; }
        else { t2.textContent = '✓ 两次输入一致'; t2.className = 'match-tip good'; }
      }
    }
    inp.addEventListener('input', paint);
    if (inp2) inp2.addEventListener('input', paint);
    paint();
  }

  function rerenderLoginArea() {
    var emailEl = document.getElementById('f-email');
    var pwdEl = document.getElementById('f-pwd');
    var nickEl = document.getElementById('f-nickname');
    var remEl = document.getElementById('f-remember');
    if (!emailEl && !$('.login-card')) return viewLogin();
    renderLoginCard(
      emailEl ? emailEl.value : '',
      pwdEl ? pwdEl.value : '',
      remEl ? remEl.checked : false
    );
    var n = document.getElementById('f-nickname');
    if (n && nickEl) n.value = nickEl.value;
  }

  function afterSignIn(msg) {
    toast(msg);
    UI.route = 'home'; UI.dateKey = S.todayKey(); UI.otp = null;
    render();
    S.seedIfEmpty().then(function () {
      render();
      if (!S.child) setTimeout(function () { hintAddChild(); }, 600);
    });
  }

  function doLogin() {
    var email = modalVal('f-email'), pwd = modalVal('f-pwd');
    if (!email || !pwd) return toast('邮箱和密码都要填哦～', 'warn');
    var remember = document.getElementById('f-remember') && document.getElementById('f-remember').checked;
    run(S.login(email, pwd, remember), null, function (j) {
      if (!j.user) return;
      afterSignIn('欢迎回来！');
    });
  }

  /* 获取邮箱验证码（注册 / 验证码登录共用） */
  function sendCode() {
    var email = modalVal('f-email');
    if (!email) return toast('请先填写邮箱～', 'warn');
    run(S.sendOtp(email), null, function (j) {
      UI.otp = { email: email, verificationId: j.verificationId, isExistingUser: !!j.isExistingUser };
      var tip = document.getElementById('code-tip');
      if (tip) { tip.textContent = '验证码已发送，10 分钟内有效'; tip.className = 'match-tip good'; }
      toast('验证码已发送到邮箱，请查收 📬');
    });
  }

  function doOtpLogin() {
    var email = modalVal('f-email'), code = modalVal('f-code');
    if (!email || !code) return toast('邮箱和验证码都要填哦～', 'warn');
    if (!UI.otp || UI.otp.email !== email) return toast('请先获取邮箱验证码～', 'warn');
    if (!UI.otp.isExistingUser) return toast('这个邮箱还没注册过，去「注册」吧～', 'warn');
    run(S.verifyOtp({
      email: email, token: code, verificationId: UI.otp.verificationId, isExistingUser: true
    }), null, function (j) {
      if (!j.user) return;
      afterSignIn('登录成功！');
    });
  }

  function doRegister() {
    var email = modalVal('f-email'), code = modalVal('f-code');
    var pwd = modalVal('f-pwd'), pwd2 = modalVal('f-pwd2');
    var nick = modalVal('f-nickname');
    if (!email) return toast('请填写邮箱～', 'warn');
    if (!code) return toast('请填写邮箱验证码～', 'warn');
    if (!UI.otp || UI.otp.email !== email) return toast('请先获取邮箱验证码～', 'warn');
    if (pwd !== pwd2) return toast('两次输入的密码不一致～', 'warn');
    var st = S.pwdStrength(pwd);
    if (!st.ok) return toast('密码强度不够：' + (st.tips[0] || ('至少 ' + S.PWD_MIN + ' 位')), 'warn');
    run(S.register({
      email: email, code: code, password: pwd,
      nickname: nick || email.split('@')[0], avatar: UI.avatar,
      verificationId: UI.otp.verificationId
    }), null, function (j) {
      if (!j.user) return;
      afterSignIn('家长账号创建成功！');
    });
  }

  /* 忘记密码：邮箱验证码 → 设置新密码 */
  function forgotPwdModal() {
    openModal('找回密码', '📧',
      '<div style="font-size:13px;font-weight:700;color:var(--ink-2);line-height:1.8;margin-bottom:10px">' +
      '先填注册邮箱获取验证码，收到后把验证码和新密码一起提交，就能重新登录啦。</div>' +
      '<div class="field"><label>邮箱</label>' +
      '<div style="display:flex;gap:8px"><input id="f-email" class="input" type="email" placeholder="注册时用的邮箱" style="flex:1">' +
      '<button type="button" class="btn sm" id="fp-send" style="white-space:nowrap">发送验证码</button></div></div>' +
      '<div class="field"><label>邮箱验证码</label>' +
      '<input id="f-code" class="input" inputmode="numeric" placeholder="邮件里的验证码"></div>' +
      '<div class="field"><label>新密码</label>' +
      '<input id="f-pwd" class="input" type="password" placeholder="至少 ' + S.PWD_MIN + ' 位，字母+数字" autocomplete="new-password">' +
      strengthMeter() + '</div>' +
      '<div class="field"><label>确认新密码</label>' +
      '<input id="f-pwd2" class="input" type="password" autocomplete="new-password">' +
      '<div id="f-pwd2-tip" class="match-tip"></div></div>',
      '<button class="btn ghost" data-act="closeModal">取消</button>' +
      '<button class="btn green" id="fp-save">保存新密码</button>',
      function (mask) {
        bindStrength(mask);
        $('#fp-send', mask).addEventListener('click', function () {
          var email = $('#f-email', mask).value.trim();
          if (!email) return toast('请填写邮箱～', 'warn');
          run(S.forgotStart(email), null, function () { toast('验证码已发送到邮箱 📬'); });
        });
        $('#fp-save', mask).addEventListener('click', function () {
          var email = $('#f-email', mask).value.trim();
          var code = $('#f-code', mask).value.trim();
          var p1 = $('#f-pwd', mask).value, p2 = $('#f-pwd2', mask).value;
          if (!email || !code) return toast('邮箱和验证码都要填哦', 'warn');
          if (p1 !== p2) return toast('两次输入的新密码不一致', 'warn');
          var st = S.pwdStrength(p1);
          if (!st.ok) return toast('密码强度不够：' + (st.tips[0] || ('至少 ' + S.PWD_MIN + ' 位')), 'warn');
          run(S.forgotFinish(code, p1), null, function () {
            closeModal(); toast('密码已重设，请用新密码登录 ✅');
          });
        });
      });
  }

  /* 首次进入若还没有孩子，引导添加 */
  function hintAddChild() {
    if (S.children.length) return;
    openModal('添加宝宝档案', '🧒',
      '<div style="font-size:14px;font-weight:700;line-height:1.9;padding:4px 2px">' +
      '还没有宝宝档案哦～<br>给孩子起个名字、挑个头像，就能开始记录每天的打卡啦。</div>',
      '<button class="btn ghost" data-act="closeModal">稍后再说</button>' +
      '<button class="btn green" id="go-add">去添加</button>',
      function (mask) {
        $('#go-add', mask).addEventListener('click', function () {
          closeModal();
          withPwd(function () { UI.kidAvatar = '🧒'; childModal(null); });
        });
      });
  }

  /* ---------------- 主框架 ---------------- */
  function render() {
    var u = S.currentUser();
    if (!u) return viewLogin();
    var s = S.stats();
    app.innerHTML =
      '<div class="layout">' +
      '<div class="main">' +
      topbar(u, s) +
      childStrip() +
      '<div id="page">' + page() + '</div>' +
      '</div>' +
      tabbar() +
      '</div>';
    window.scrollTo({ top: 0 });
    bindSwipe();
  }

  function topbar(u, s) {
    var c = S.child;
    return '<header class="topbar">' +
      '<div class="tb-avatar">' + (c ? c.avatar : '👶') + '</div>' +
      '<div><div class="tb-name">' + (c ? esc(c.name) : '还没有宝宝') + '，' + greet() + '</div>' +
      '<div class="tb-sub">' + (c
        ? '今日完成 ' + s.todayDone + '/' + s.todayTotal + ' 项 · 连续 ' + s.streak + ' 天'
        : '去「我的」添加宝宝档案') + '</div></div>' +
      '<div class="tb-right">' +
      '<span class="chip y">⭐ ' + s.points + '</span>' +
      '<button type="button" class="chip b me-chip" data-act="accessLock" title="点击设置访问锁">' +
      u.avatar + ' ' + esc(u.name) + (S.pinSet ? ' 🔒' : ' ⚠️') + '</button>' +
      '</div></header>';
  }

  function greet() {
    var h = new Date().getHours();
    if (h < 6) return '夜深啦～';
    if (h < 11) return '早上好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    return '晚上好';
  }

  /* 孩子切换条：横向滑动，点击切换看板 */
  function childStrip() {
    var list = S.children;
    if (!list.length) return '';
    return '<div class="child-strip">' +
      list.map(function (c) {
        var on = S.child && c.id === S.child.id;
        return '<button type="button" class="child-chip ' + (on ? 'on' : '') + '" data-act="pickChild" data-id="' + c.id + '">' +
          '<span class="cc-avatar">' + c.avatar + '</span>' +
          '<span class="cc-name">' + esc(c.name) + '</span></button>';
      }).join('') +
      (list.length > 1 ? '<div class="cs-hint">← 左右滑动切换宝宝 →</div>' : '') +
      '</div>';
  }

  function tabbar() {
    return '<nav class="tabbar">' +
      NAV.map(function (n) {
        var on = n.route === UI.route;
        return '<button type="button" class="rail-item ' + (on ? 'on' : '') + '" data-act="nav" data-route="' + n.route + '">' +
          '<span class="ri-emoji">' + n.emoji + '</span>' +
          '<span>' + n.label + (n.lock ? ' 🔒' : '') + '</span></button>';
      }).join('') +
      '</nav>';
  }

  /* 受密码保护的页面 */
  function gotoRoute(r) {
    var item = NAV.filter(function (n) { return n.route === r; })[0];
    if (item && item.lock && !S.pinSet) return accessLockModal();
    if (!item) return;
    if (item.lock && !S.unlocked) {
      askLock('进入「' + item.label + '」', '🔒', '为了保护设置不被孩子乱改，请输入访问锁', function (v) {
        run(S.unlock(v), null, function (j) {
          closeModal();
          UI.route = r; UI.dateKey = S.todayKey(); render();
          toast('已解锁，30 分钟内不用再验证');
        });
      });
      return;
    }
    UI.route = r; UI.dateKey = S.todayKey(); render();
  }

  /* 需要访问锁的写操作 */
  function withPwd(cb) {
    if (!S.pinSet) return accessLockModal();
    if (S.unlocked) return cb('');
    askLock('家长验证', '🔒', '这项操作需要输入访问锁', function (v) {
      // 真实验证一次（访问锁，未设置时用登录密码），验证通过才继续
      run(S.unlock(v), null, function () { closeModal(); cb(v); });
    });
  }

  /* 访问锁输入框：已设访问锁 → 4~6 位数字；未设置 → 用登录密码代替 */
  function askLock(title, emoji, desc, cb) {
    var hasPin = S.pinSet;
    var hint = hasPin
      ? '访问锁是你单独设置的 ' + '4~6' + ' 位数字，和登录密码不同'
      : '还没有设置访问锁，先用登录密码验证，之后可在右上角设置';
    openModal(title, emoji || '🔒',
      '<div style="font-size:13px;font-weight:700;color:var(--ink-2);line-height:1.8;margin-bottom:10px">' + esc(desc) + '</div>' +
      '<div class="field"><label>' + (hasPin ? '访问锁' : '登录密码') + '</label>' +
      '<input id="f-pwd" class="input ' + (hasPin ? 'pin-input' : '') + '" type="password" ' +
      (hasPin ? 'inputmode="numeric" maxlength="6" pattern="[0-9]*" placeholder="请输入 4~6 位数字"' : 'placeholder="请输入登录密码"') +
      ' autocomplete="current-password"></div>' +
      '<div class="tip-box">' + esc(hint) + '</div>',
      '<button class="btn ghost" data-act="closeModal">取消</button>' +
      '<button class="btn" id="pw-ok">确定</button>',
      function (mask) {
        var ok = $('#pw-ok', mask), inp = $('#f-pwd', mask);
        ok.addEventListener('click', function () {
          var v = inp.value;
          if (!v) { toast(hasPin ? '请输入访问锁～' : '请输入登录密码～', 'warn'); return; }
          if (hasPin && !S.pinValid(v)) { toast('访问锁是 4~6 位数字哦～', 'warn'); return; }
          cb(v);
        });
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') ok.click(); });
        setTimeout(function () { inp.focus(); }, 120);
      });
  }

  /* 右上角账号名 → 访问锁设置 */
  function accessLockModal() {
    var has = S.pinSet;
    openModal(has ? '修改访问锁' : '设置家长访问锁', '🔒',
      '<div class="tip-box">设置 4~6 位数字，家长确认打卡和管理内容时使用。请妥善保管。</div>' +
      (has ? '<div class="field"><label>当前访问锁</label><input id="f-old-pin" class="input" type="password" inputmode="numeric" maxlength="6"></div>' : '') +
      '<div class="field"><label>新访问锁</label><input id="f-pin" class="input" type="password" inputmode="numeric" maxlength="6"></div>' +
      '<div class="field"><label>确认访问锁</label><input id="f-pin2" class="input" type="password" inputmode="numeric" maxlength="6"></div>',
      '<button class="btn ghost" data-act="closeModal">取消</button><button class="btn green" id="pin-save">保存</button>', function(mask) {
        $('#pin-save',mask).addEventListener('click',function(){
          var old=$('#f-old-pin',mask), p1=$('#f-pin',mask).value, p2=$('#f-pin2',mask).value;
          run(S.setPin(old ? old.value : '',p1,p2),null,function(){closeModal();render();toast('访问锁已保存 🔒');});
        });
      });
  }

  /* 我的 → 修改登录密码 */
  function changePwdModal() {
    openModal('修改登录密码', '🔑',
      '<div style="font-size:13px;font-weight:700;color:var(--ink-2);line-height:1.8;margin-bottom:10px">' +
      '改的是<b>登录密码</b>，访问锁不受影响（访问锁在右上角设置）。</div>' +
      '<div class="field"><label>当前登录密码</label>' +
      '<input id="f-old" class="input" type="password" placeholder="请输入现在的密码" autocomplete="current-password"></div>' +
      '<div class="field"><label>新密码</label>' +
      '<input id="f-pwd" class="input" type="password" placeholder="至少 ' + S.PWD_MIN + ' 位，字母+数字" autocomplete="new-password">' +
      strengthMeter() + '</div>' +
      '<div class="field"><label>确认新密码</label>' +
      '<input id="f-pwd2" class="input" type="password" autocomplete="new-password">' +
      '<div id="f-pwd2-tip" class="match-tip"></div></div>',
      '<button class="btn ghost" data-act="closeModal">取消</button>' +
      '<button class="btn green" id="pwd-save">保存</button>',
      function (mask) {
        bindStrength(mask);
        $('#pwd-save', mask).addEventListener('click', function () {
          var old = $('#f-old', mask).value, p1 = $('#f-pwd', mask).value, p2 = $('#f-pwd2', mask).value;
          if (!old) return toast('请输入当前密码', 'warn');
          if (!p1) return toast('请输入新密码', 'warn');
          if (p1 !== p2) return toast('两次输入的新密码不一致', 'warn');
          var st = S.pwdStrength(p1);
          if (!st.ok) return toast('密码强度不够：' + (st.tips[0] || ('至少 ' + S.PWD_MIN + ' 位')), 'warn');
          run(S.changePwd({ oldPassword: old, newPassword: p1 }), null, function () {
            closeModal(); toast('登录密码已修改，下次请用新密码登录 ✅');
          });
        });
      });
  }

  function page() {
    if (UI.route === 'home') return pageHome();
    if (UI.route === 'tasks') return pageTasks();
    if (UI.route === 'rewards') return pageRewards();
    return pageMe();
  }

  /* ---------------- 看板（默认页：孩子的看板） ---------------- */
  function pageHome() {
    if (!S.child) {
      return '<section class="card" style="text-align:center;padding:30px 18px">' +
        '<div style="font-size:56px">👶</div>' +
        '<div style="font-size:17px;font-weight:900;margin:8px 0 4px">还没有宝宝档案</div>' +
        '<div style="font-size:13px;color:var(--ink-3);font-weight:700;line-height:1.8;margin-bottom:16px">' +
        '孩子不用注册账号，由家长在「我的」里添加<br>可以添加多个宝宝，随时切换查看各自的看板</div>' +
        '<button class="btn green block" data-act="addChild">＋ 添加宝宝档案</button></section>';
    }

    var s = S.stats();
    var tasks = S.tasksOfDay(S.todayKey());
    var rec = S.dayRecords(S.todayKey());
    var week = s.week.map(function (d) { d.isToday = d.key === S.todayKey(); return d; });
    var badges = S.badgeList();
    var goals = S.state.goals || [];
    var rewards = S.state.rewards || [];
    var redeems = S.state.redeems || [];
    var doneCnt = tasks.filter(function (t) { return rec[t.id]; }).length;

    var html = '';
    /* 左列：今日概览 + 徽章墙 + 目标进度（徽章墙与目标进度同宽） */
    html += '<div class="dash-2col"><div class="dc-left">';

    html += '<section class="hero dc-hero">' +
      '<div class="hero-ring">' + C.ring(s.todayRate, { size: 124 }) + '</div>' +
      '<div class="hero-info">' +
      '<div class="hi-title">' + esc(S.child.name) + '今天完成 ' + s.todayDone + ' / ' + s.todayTotal + ' 项</div>' +
      '<div class="hi-sub">' + heroWord(s) + '</div>' +
      '<div style="margin-top:8px"><span class="chip g">🔥 连续 ' + s.streak + ' 天</span></div>' +
      '</div></section>';

    html += '<div class="stat-grid dc-stats">' +
      stat('⭐', s.points, '可用积分') +
      stat('📈', s.weekRate + '%', '本周完成率') +
      stat('🎯', s.monthRate + '%', '本月完成率') +
      '</div>';

    html += '<section class="card dc-week"><h3 class="card-title"><span class="ct-emoji">📊</span>最近 7 天完成情况' +
      '<span class="ct-more">共打卡 ' + s.totalChecks + ' 次</span></h3>' + C.bars(week) + '</section>';

    html += '<section class="card dc-badges"><h3 class="card-title"><span class="ct-emoji">🏅</span>徽章墙' +
      '<span class="ct-more">' + badges.filter(function (b) { return b.got; }).length + '/' + badges.length + '</span></h3>' +
      '<div class="badge-grid">' + badges.map(function (b) {
        return '<div class="badge-card ' + (b.got ? 'got' : '') + '" title="' + esc(b.desc) + '">' +
          '<div class="bc-emoji">' + b.emoji + '</div><div class="bc-name">' + esc(b.name) + '</div></div>';
      }).join('') + '</div></section>';

    html += '<section class="card dc-goals"><h3 class="card-title"><span class="ct-emoji">🎯</span>目标进度' +
      '<span class="ct-more">' + goals.filter(function (g) { return g.progress && g.progress.done; }).length + '/' + goals.length + '</span></h3>' +
      (goals.length
        ? goals.map(goalHTML).join('')
        : empty('还没有设定目标', '🎯')) +
      '</section>';

    html += '</div>';

    /* 右列：今日任务（按时间段分组完整展示） */
    html += '<div class="dc-right">';

    html += '<section class="card dc-tasks"><h3 class="card-title"><span class="ct-emoji">✅</span>今日任务' +
      '<span class="ct-more">已完成 ' + doneCnt + '/' + tasks.length + '</span>' +
      '<button type="button" class="btn sm ghost ct-more" data-act="nav" data-route="tasks" style="margin-left:auto">去确认 →</button></h3>' +
      taskListHTML(tasks, rec, false) + '</section>';

    /* 奖励商城：看板里也能直接给孩子兑换 */
    html += '<section class="card dc-shop"><h3 class="card-title"><span class="ct-emoji">🎁</span>奖励商城' +
      '<span class="ct-more">可用 ⭐ ' + s.points + '</span>' +
      '<button type="button" class="btn sm ghost ct-more" data-act="nav" data-route="rewards" style="margin-left:auto">管理 →</button></h3>' +
      (rewards.length
        ? '<div class="reward-grid">' + rewards.map(function (r) {
          var can = s.points >= r.cost;
          return '<div class="reward-card">' +
            '<div class="rw-emoji">' + r.emoji + '</div>' +
            '<div class="rw-name">' + esc(r.name) + '</div>' +
            '<div class="rw-desc">' + esc(r.desc || '') + '</div>' +
            '<div class="rw-cost"><span class="chip ' + (can ? 'y' : '') + '">⭐ ' + r.cost + '</span></div>' +
            '<div class="rw-btn">' +
            '<button type="button" class="btn sm ' + (can ? 'green' : 'ghost') + '" data-act="applyReward" data-id="' + r.id + '"' + (can ? '' : ' disabled') + '>' +
            (can ? '给' + esc(S.child.name) + '兑换' : '还差 ' + (r.cost - s.points)) + '</button>' +
            '</div></div>';
        }).join('') + '</div>'
        : empty('还没有奖励，去「奖励」页添加吧', '🎁')) +
      '</section>';

    html += '</div></div>';

    /* 兑换记录 */
    var rlist = redeems.slice(0, 5);
    html += '<section class="card"><h3 class="card-title"><span class="ct-emoji">🧾</span>兑换记录' +
      '<span class="ct-more">' + esc(S.child.name) + '共兑换 ' + redeems.length + ' 次</span></h3>';
    if (!rlist.length) html += empty('还没有兑换过奖励', '🧾');
    else {
      html += rlist.map(function (it) {
        return '<div class="row"><span class="r-emoji">' + it.emoji + '</span>' +
          '<div class="r-main"><div class="r-title">' + esc(it.name) + '</div>' +
          '<div class="r-sub">' + S.prettyDate(it.date) + ' · 花费 ⭐' + it.cost + '</div></div>' +
          '<span class="chip g">✔ 已发放</span></div>';
      }).join('');
      if (redeems.length > 5) {
        html += '<div style="text-align:center;margin-top:10px">' +
          '<button type="button" class="btn sm ghost" data-act="nav" data-route="rewards">还有 ' + (redeems.length - 5) + ' 条，去「奖励」页查看 →</button></div>';
      }
    }
    html += '</section>';

    return html;
  }

  /* 按早晨 / 下午 / 晚上分组，把一整天的任务完整列出来（含时间段） */
  function taskListHTML(tasks, rec, editable) {
    if (!tasks.length) return empty('这一天没有安排任务哦', '🗓️');
    var html = '';
    ['morning', 'afternoon', 'evening'].forEach(function (slot) {
      var group = tasks.filter(function (t) { return t.slot === slot; });
      if (!group.length) return;
      var done = group.filter(function (t) { return rec[t.id]; }).length;
      html += '<div class="slot-group-hd">' +
        '<span>' + S.SLOTS[slot].emoji + ' ' + S.SLOTS[slot].label + '</span>' +
        '<span class="sg-time">' + S.SLOTS[slot].time + '</span>' +
        '<span class="sg-count">' + done + '/' + group.length + '</span></div>';
      html += group.map(function (t) { return taskRow(t, !!rec[t.id], editable); }).join('');
    });
    return html;
  }

  function taskRow(t, done, editable) {
    return '<div class="task-item ' + (done ? 'done' : '') + '" style="margin-bottom:8px">' +
      '<div class="ti-emoji">' + t.emoji + '</div>' +
      '<div class="ti-body"><div class="ti-title">' + esc(t.title) + '</div>' +
      '<div class="ti-meta"><span class="chip y">+' + t.points + ' 分</span>' +
      '<span class="ti-slot">' + S.SLOTS[t.slot].emoji + ' ' + S.SLOTS[t.slot].label + ' ' + S.SLOTS[t.slot].time + '</span></div></div>' +
      (editable ? '<button class="btn sm ghost" data-act="editTask" data-id="' + t.id + '">✏️</button>' : '') +
      '<div class="tick ' + (done ? 'on' : '') + '" data-act="checkTask" data-id="' + t.id + '" title="家长确认">' + (done ? '✓' : '') + '</div>' +
      '</div>';
  }

  function stat(emoji, num, label) {
    return '<div class="stat"><div class="s-emoji">' + emoji + '</div>' +
      '<div class="s-num">' + num + '</div><div class="s-label">' + label + '</div></div>';
  }
  function heroWord(s) {
    if (s.todayTotal === 0) return '今天还没有任务，去「任务」页安排一下吧～';
    if (s.todayRate === 100) return '太棒啦！今天的任务全部完成 🎉';
    if (s.todayRate >= 60) return '已经完成一大半啦，继续加油！';
    if (s.todayRate > 0) return '开了个好头，接着冲鸭～';
    return '新的一天，从第一个小任务开始吧！';
  }
  function empty(text, emoji) {
    return '<div class="empty"><span class="e-emoji">' + (emoji || '📭') + '</span>' + esc(text) + '</div>';
  }

  function goalHTML(g) {
    var p = g.progress || { cur: 0, target: g.target, pct: 0, done: false };
    var t = S.GOAL_TYPES[g.type];
    return '<div class="goal-item ' + (p.done ? 'achieved' : '') + '">' +
      '<div class="gi-hd"><div class="gi-emoji">' + g.emoji + '</div>' +
      '<div class="gi-title">' + esc(g.title) + '</div>' +
      '<span class="chip ' + (p.done ? 'g' : 'y') + '">' + p.cur + '/' + p.target + ' ' + t.unit + '</span></div>' +
      '<div class="bar' + (p.done ? ' g' : '') + '"><i style="width:' + p.pct + '%"></i></div>' +
      '<div class="gi-reward">🎁 达成奖励：' + esc(g.reward) + (p.done ? '　<b style="color:#2f8f63">已达成！</b>' : '') + '</div>' +
      '</div>';
  }

  /* ---------------- 任务页（需家长密码） ---------------- */
  function pageTasks() {
    if (!S.child) return emptyPage('先添加宝宝档案，才能安排任务哦', '👶');
    var k = UI.dateKey;
    var rec = S.dayRecords(k);
    var tasks = S.tasksOfDay(k);
    var isToday = k === S.todayKey();
    var s = S.stats();

    var html = '';
    html += '<section class="card" style="background:linear-gradient(135deg,#fff1e0,#fff5e8);border-color:#ffe0c4">' +
      '<div style="font-size:13px;font-weight:800;line-height:1.8">🔒 <b>家长模式</b>：勾选一下，就代表你确认孩子完成了这项任务。<br>' +
      '孩子自己无法改动，防止乱点哦。</div></section>';

    html += '<section class="card"><h3 class="card-title"><span class="ct-emoji">📅</span>选择日期' +
      (isToday ? '<span class="ct-more">今天</span>'
        : '<button class="btn sm ghost ct-more" data-act="goToday" style="margin-left:auto">回到今天</button>') +
      '</h3><div class="date-strip">' +
      s.week.map(function (d) {
        var cls = d.key === k ? 'on' : '';
        if (d.total && d.done === d.total) cls += ' full';
        else if (d.done > 0) cls += ' part';
        return '<div class="date-cell ' + cls + '" data-act="pickDate" data-date="' + d.key + '">' +
          '<div class="dc-w">' + (d.key === S.todayKey() ? '今天' : '周' + d.label) + '</div>' +
          '<div class="dc-d">' + (+d.key.split('-')[2]) + '</div>' +
          '<div class="dc-dot"></div></div>';
      }).join('') +
      '</div></section>';

    var doneCnt = tasks.filter(function (t) { return rec[t.id]; }).length;
    html += '<section class="card"><h3 class="card-title"><span class="ct-emoji">✅</span>' +
      S.prettyDate(k) + ' 的任务' +
      '<span class="ct-more">已完成 ' + doneCnt + '/' + tasks.length + '</span></h3>' +
      taskListHTML(tasks, rec, true) + '</section>';

    html += '<section class="card"><h3 class="card-title"><span class="ct-emoji">⚙️</span>任务设定（家长）</h3>' +
      '<div style="font-size:12px;color:var(--ink-3);font-weight:700;margin-bottom:12px">本账号共 ' + S.state.tasks.length + ' 个任务，其中启用 ' + S.activeTasks().length + ' 个 · 只有你自己能看到和修改</div>' +
      '<button class="btn blue block" data-act="newTask">＋ 新增每日任务</button>' +
      '<div style="margin-top:14px">' +
      S.state.tasks.map(function (t) {
        return '<div class="row"><span class="r-emoji">' + t.emoji + '</span>' +
          '<div class="r-main"><div class="r-title">' + esc(t.title) + '</div>' +
          '<div class="r-sub">' + t.points + ' 分 · ' + S.SLOTS[t.slot].label + ' · ' + dayLabel(t) + '</div></div>' +
          '<span class="chip ' + (t.active !== false ? 'g' : '') + '">' + (t.active !== false ? '启用' : '停用') + '</span>' +
          '<button class="btn sm ghost" data-act="editTask" data-id="' + t.id + '">✏️</button>' +
          '</div>';
      }).join('') + '</div></section>';

    return html;
  }

  function emptyPage(text, emoji) {
    return '<section class="card" style="text-align:center;padding:30px 18px">' +
      '<div style="font-size:52px">' + (emoji || '📭') + '</div>' +
      '<div style="font-size:14px;font-weight:800;color:var(--ink-2);margin-top:6px">' + esc(text) + '</div></section>';
  }

  function dayLabel(t) {
    var d = t.days && t.days.length ? t.days : [0, 1, 2, 3, 4, 5, 6];
    if (d.length === 7) return '每天';
    if (d.length === 5 && d.indexOf(0) < 0 && d.indexOf(6) < 0) return '工作日';
    return d.slice().sort().map(function (x) { return '周' + S.WEEK_CN[x]; }).join('、');
  }

  /* ---------------- 奖励页 ---------------- */
  function pageRewards() {
    if (!S.child) return emptyPage('先添加宝宝档案，再来设置奖励吧', '👶');
    var s = S.stats();
    var html = '';

    html += '<section class="card" style="background:linear-gradient(135deg,#fff3d6,#fff0e4);border-color:#ffdfa8">' +
      '<div style="display:flex;align-items:center;gap:14px">' +
      '<div style="font-size:44px">🏦</div>' +
      '<div><div style="font-size:13px;font-weight:800;color:#7d7268">' + esc(S.child.name) + '的星星银行</div>' +
      '<div style="font-size:30px;font-weight:900">⭐ ' + s.points + '</div>' +
      '<div style="font-size:11px;color:var(--ink-3);font-weight:700">累计赚取 ' + s.totalPoints + ' · 累计打卡 ' + s.totalChecks + ' 次</div></div>' +
      '</div></section>';

    html += '<section class="card"><h3 class="card-title"><span class="ct-emoji">🎯</span>目标达成奖励' +
      '<button class="btn sm ghost ct-more" data-act="newGoal" style="margin-left:auto">＋ 新目标</button>' +
      '</h3>';
    var goals = S.state.goals;
    if (!goals.length) html += empty('还没有设定目标', '🎯');
    else html += goals.map(function (g) {
      return goalHTML(g) +
        '<div style="display:flex;gap:8px">' +
        '<button class="btn sm ghost" data-act="editGoal" data-id="' + g.id + '">✏️ 编辑</button>' +
        '<button class="btn sm ghost" data-act="delGoal" data-id="' + g.id + '">🗑 删除</button></div>';
    }).join('');
    html += '</section>';

    html += '<section class="card"><h3 class="card-title"><span class="ct-emoji">🎁</span>奖励商城' +
      '<button class="btn sm ghost ct-more" data-act="newReward" style="margin-left:auto">＋ 新奖励</button>' +
      '</h3><div class="reward-grid">' +
      S.state.rewards.map(function (r) {
        var can = s.points >= r.cost;
        return '<div class="reward-card">' +
          '<div class="rw-emoji">' + r.emoji + '</div>' +
          '<div class="rw-name">' + esc(r.name) + '</div>' +
          '<div class="rw-desc">' + esc(r.desc || '') + '</div>' +
          '<div class="rw-cost"><span class="chip ' + (can ? 'y' : '') + '">⭐ ' + r.cost + '</span></div>' +
          '<div class="rw-btn">' +
          '<button class="btn sm ghost" data-act="editReward" data-id="' + r.id + '">✏️</button>' +
          '<button class="btn sm ' + (can ? 'green' : 'ghost') + '" data-act="applyReward" data-id="' + r.id + '"' + (can ? '' : ' disabled') + '>' +
          (can ? '给' + esc(S.child.name) + '兑换' : '还差 ' + (r.cost - s.points)) + '</button>' +
          '</div></div>';
      }).join('') + '</div>' +
      (S.state.rewards.length ? '' : empty('还没有奖励，添加一个吧', '🎁')) + '</section>';

    var list = (S.state.redeems || []).slice(0, 12);
    html += '<section class="card"><h3 class="card-title"><span class="ct-emoji">🧾</span>兑换记录' +
      '<span class="ct-more">' + esc(S.child.name) + '共兑换 ' + (S.state.redeems || []).length + ' 次</span></h3>';
    if (!list.length) html += empty('还没有兑换过奖励', '🧾');
    else html += list.map(function (it) {
      return '<div class="row"><span class="r-emoji">' + it.emoji + '</span>' +
        '<div class="r-main"><div class="r-title">' + esc(it.name) + '</div>' +
        '<div class="r-sub">' + S.prettyDate(it.date) + ' · 花费 ⭐' + it.cost + '</div>' +
        '<div style="margin-top:8px"><button class="btn sm ghost" data-act="undoRedeem" data-id="' + it.id + '">↩︎ 撤销并退回积分</button></div></div>' +
        '<span class="chip g">✔ 已发放</span></div>';
    }).join('');
    html += '</section>';

    var badges = S.badgeList();
    html += '<section class="card"><h3 class="card-title"><span class="ct-emoji">🏅</span>徽章成就' +
      '<span class="ct-more">' + badges.filter(function (b) { return b.got; }).length + '/' + badges.length + '</span></h3>' +
      '<div class="badge-grid">' + badges.map(function (b) {
        return '<div class="badge-card ' + (b.got ? 'got' : '') + '">' +
          '<div class="bc-emoji">' + b.emoji + '</div><div class="bc-name">' + esc(b.name) + '</div></div>';
      }).join('') + '</div>' +
      '<div style="font-size:11px;color:var(--ink-3);font-weight:600;margin-top:10px;text-align:center">' +
      badges.filter(function (b) { return !b.got; }).map(function (b) { return b.emoji + ' ' + b.desc; }).join('　·　') + '</div>' +
      '</section>';

    return html;
  }

  /* ---------------- 我的（需家长密码） ---------------- */
  function pageMe() {
    var u = S.currentUser();
    var s = S.stats();
    var kids = S.children;

    var html = '';
    html += '<section class="card"><div class="me-head">' +
      '<div class="mh-avatar">' + u.avatar + '</div>' +
      '<div><div class="mh-name">' + esc(u.name) + '</div>' +
      '<div style="font-size:11px;color:var(--ink-3);font-weight:700;margin-top:2px">' + esc(u.email || '') + '</div>' +
      '<div style="margin-top:6px"><span class="chip b">👩 家长账号</span> ' +
      '<span class="chip ' + (S.unlocked ? 'g' : 'y') + '">' + (S.unlocked ? '🔓 已解锁' : '🔒 已上锁') + '</span></div></div>' +
      '</div></section>';

    html += '<section class="card"><h3 class="card-title"><span class="ct-emoji">🧒</span>宝宝档案' +
      '<button class="btn sm blue ct-more" data-act="addChild" style="margin-left:auto">＋ 添加</button></h3>' +
      (kids.length
        ? '<div class="switch-list">' + kids.map(function (c) {
          var on = S.child && c.id === S.child.id;
          return '<div class="switch-item ' + (on ? 'on' : '') + '" data-act="pickChild" data-id="' + c.id + '">' +
            '<span class="sw-emoji">' + c.avatar + '</span>' +
            '<div><div class="sw-name">' + esc(c.name) + '</div>' +
            '<div class="sw-role">' + (on ? '当前查看中' : '点击切换查看') + '</div></div>' +
            '<button class="btn sm ghost" data-act="editChild" data-id="' + c.id + '" style="margin-left:auto">✏️</button>' +
            '<button class="btn sm ghost" data-act="delChild" data-id="' + c.id + '">🗑</button>' +
            '</div>';
        }).join('') + '</div>'
        : empty('还没有宝宝档案，点右上角添加', '👶')) +
      '<div style="font-size:11px;color:var(--ink-3);font-weight:600;margin-top:10px">孩子不需要注册账号；每个家长的宝宝档案互相独立，只有自己能看到</div>' +
      '</section>';

    if (S.child) {
      html += '<section class="card"><h3 class="card-title"><span class="ct-emoji">📈</span>' + esc(S.child.name) + '的数据总览</h3>' +
        '<div class="row"><span class="r-emoji">📅</span><div class="r-main"><div class="r-title">今日完成</div>' +
        '<div class="r-sub">' + s.todayDone + ' / ' + s.todayTotal + ' 项 · ' + s.todayRate + '%</div></div>' +
        '<span class="chip ' + (s.todayRate === 100 ? 'g' : 'y') + '">' + s.todayRate + '%</span></div>' +
        '<div class="row"><span class="r-emoji">🗓️</span><div class="r-main"><div class="r-title">本周完成率</div>' +
        '<div class="r-sub">周一至今的平均表现</div></div><span class="chip b">' + s.weekRate + '%</span></div>' +
        '<div class="row"><span class="r-emoji">🌙</span><div class="r-main"><div class="r-title">本月完成率</div>' +
        '<div class="r-sub">' + (new Date().getMonth() + 1) + ' 月累计表现</div></div><span class="chip b">' + s.monthRate + '%</span></div>' +
        '<div class="row"><span class="r-emoji">🏅</span><div class="r-main"><div class="r-title">徽章成就</div>' +
        '<div class="r-sub">共 ' + S.badgeList().length + ' 枚徽章待收集</div></div>' +
        '<span class="chip g">' + (S.state.badges || []).length + ' 枚</span></div>' +
        '</section>';
    }

    html += '<section class="card"><h3 class="card-title"><span class="ct-emoji">🛠️</span>家长工具</h3>' +
      '<div style="font-size:11px;color:var(--ink-3);font-weight:700;margin:-4px 0 12px;line-height:1.7">' +
      '任务、目标、奖励都绑定在「' + esc(u.name) + '」这个家长账号下，每个家庭各自独立，互不影响</div>' +
      '<div style="display:flex;flex-direction:column;gap:10px">' +
      '<button class="btn blue block" data-act="newTask">＋ 添加每日任务</button>' +
      '<button class="btn purple block" data-act="newReward">＋ 添加奖励</button>' +
      '<button class="btn yellow block" data-act="newGoal">＋ 添加目标</button>' +
      '<button class="btn ghost block" data-act="exportData">💾 导出数据（JSON）</button>' +
      '<button class="btn ghost block" data-act="accessLock">' + (S.pinSet ? '🔒 修改访问锁' : '⚠️ 设置访问锁') + '</button>' +
      '<button class="btn ghost block" data-act="lockNow">🔒 立即上锁</button>' +
      '<button class="btn ghost block" data-act="resetData" style="color:#e0483c">🗑 重置全部数据</button>' +
      '</div></section>';

    html += '<section class="card" style="text-align:center">' +
      '<div style="font-size:11px;color:var(--ink-3);font-weight:600;margin-top:10px">数据保存在云端</div>' +
      '</section>';
    return html;
  }

  /* ---------------- 孩子档案弹窗 ---------------- */
  function childModal(id) {
    var c = id ? S.children.filter(function (x) { return x.id === id; })[0] : null;
    var d = c || { name: '', avatar: UI.kidAvatar };
    UI.kidAvatar = d.avatar;
    var body =
      '<div class="field"><label>宝宝头像</label><div class="avatar-grid" id="emoji-box">' +
      KID_AVATARS.map(function (e) {
        return '<button type="button" data-emoji="' + e + '" class="' + (e === d.avatar ? 'on' : '') + '">' + e + '</button>';
      }).join('') + '</div></div>' +
      '<div class="field"><label>宝宝名字</label>' +
      '<input id="f-kidname" class="input" value="' + esc(d.name) + '" placeholder="例如：小星星"></div>' +
      (c ? '<button class="btn ghost block" data-act="delChild" data-id="' + c.id + '" style="color:#e0483c">🗑 删除这个宝宝（含打卡记录）</button>' : '');
    var footer = '<button class="btn ghost" data-act="closeModal">取消</button>' +
      '<button class="btn green" id="kid-save">保存</button>';
    openModal(c ? '编辑宝宝' : '添加宝宝', c ? '✏️' : '🧒', body, footer, function (mask) {
      bindEmojiBox(mask);
      $('#kid-save', mask).addEventListener('click', function () { saveChild(c ? c.id : null); });
    });
  }
  function saveChild(id) {
    var name = modalVal('f-kidname');
    if (!name) return toast('给宝宝起个名字吧～', 'warn');
    var btn = $('#emoji-box button.on');
    var avatar = btn ? btn.dataset.emoji : UI.kidAvatar;
    var p = id ? S.updateChild({ id: id, name: name, avatar: avatar }) : S.addChild({ name: name, avatar: avatar });
    run(p, id ? '宝宝资料已更新 🧒' : '宝宝已添加，开始打卡吧 🧒', function () {
      closeModal(); render();
    });
  }
  function delChild(id) {
    var c = S.children.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    confirmBox('删除「' + c.name + '」会同时删除 TA 的全部打卡记录、积分和徽章，确定吗？', '⚠️', function () {
      closeModal();
      run(S.removeChild(id), '已删除 ' + c.name + ' 的档案', function () { UI.route = 'me'; render(); });
    });
  }

  /* ---------------- 任务 / 奖励 / 目标弹窗 ---------------- */
  function taskModal(id) {
    var t = id ? S.state.tasks.filter(function (x) { return x.id === id; })[0] : null;
    var d = t || { title: '', emoji: '📚', points: 5, slot: 'morning', days: [0, 1, 2, 3, 4, 5, 6], active: true };
    var body =
      '<div class="field"><label>任务图标</label><div class="avatar-grid" id="emoji-box">' +
      TASK_EMOJIS.map(function (e) {
        return '<button type="button" data-emoji="' + e + '" class="' + (e === d.emoji ? 'on' : '') + '">' + e + '</button>';
      }).join('') + '</div></div>' +
      '<div class="field"><label>任务名称</label><input id="f-title" class="input" value="' + esc(d.title) + '" placeholder="例如：自己穿衣服"></div>' +
      '<div class="field"><label>奖励积分</label><input id="f-points" class="input" type="number" min="1" max="100" value="' + d.points + '"></div>' +
      '<div class="field"><label>时间段</label><select id="f-slot" class="input">' +
      Object.keys(S.SLOTS).map(function (k) {
        return '<option value="' + k + '"' + (k === d.slot ? ' selected' : '') + '>' + S.SLOTS[k].emoji + ' ' + S.SLOTS[k].label + '</option>';
      }).join('') + '</select></div>' +
      '<div class="field"><label>重复日</label><div style="display:flex;gap:6px;flex-wrap:wrap">' +
      [1, 2, 3, 4, 5, 6, 0].map(function (w) {
        var on = d.days.indexOf(w) >= 0;
        return '<button type="button" class="btn sm ' + (on ? 'yellow' : 'ghost') + '" data-day="' + w + '">周' + S.WEEK_CN[w] + '</button>';
      }).join('') + '</div></div>' +
      '<label class="remember"><input type="checkbox" id="f-active"' + (d.active !== false ? ' checked' : '') + '>启用这个任务</label>' +
      (t ? '<button class="btn ghost block" data-act="delTask" data-id="' + t.id + '" style="color:#e0483c">🗑 删除任务</button>' : '');

    var footer = '<button class="btn ghost" data-act="closeModal">取消</button>' +
      '<button class="btn green" data-act="saveTask" data-id="' + (t ? t.id : '') + '">保存</button>';

    openModal(t ? '编辑任务' : '新增任务', t ? '✏️' : '✨', body, footer, function (mask) {
      bindEmojiBox(mask);
      mask.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-day]'); if (!b) return;
        var on = b.classList.toggle('yellow');
        b.classList.toggle('ghost', !on);
      });
    });
  }

  function saveTask(id) {
    var title = modalVal('f-title');
    if (!title) return toast('给任务起个名字吧～', 'warn');
    var emojiBtn = $('#emoji-box button.on');
    var days = $$('button[data-day].yellow').map(function (b) { return +b.dataset.day; });
    if (!days.length) return toast('至少选择一个重复日～', 'warn');
    withPwd(function (pwd) {
      run(S.upsertTask({
        id: id || null, title: title, pwd: pwd,
        emoji: emojiBtn ? emojiBtn.dataset.emoji : '📚',
        points: Math.max(1, Math.min(100, parseInt(modalVal('f-points'), 10) || 5)),
        slot: modalVal('f-slot') || 'morning',
        days: days,
        active: document.getElementById('f-active').checked
      }), '任务已存进数据库 ✨', function () { closeModal(); render(); });
    });
  }

  function rewardModal(id) {
    var r = id ? S.state.rewards.filter(function (x) { return x.id === id; })[0] : null;
    var d = r || { name: '', emoji: '🎁', cost: 50, desc: '' };
    var body =
      '<div class="field"><label>奖励图标</label><div class="avatar-grid" id="emoji-box">' +
      REWARD_EMOJIS.map(function (e) {
        return '<button type="button" data-emoji="' + e + '" class="' + (e === d.emoji ? 'on' : '') + '">' + e + '</button>';
      }).join('') + '</div></div>' +
      '<div class="field"><label>奖励名称</label><input id="f-name" class="input" value="' + esc(d.name) + '" placeholder="例如：周末去公园"></div>' +
      '<div class="field"><label>需要多少积分</label><input id="f-cost" class="input" type="number" min="1" value="' + d.cost + '"></div>' +
      '<div class="field"><label>说明（可选）</label><input id="f-desc" class="input" value="' + esc(d.desc) + '" placeholder="兑换后可以做什么"></div>' +
      (r ? '<button class="btn ghost block" data-act="delReward" data-id="' + r.id + '" style="color:#e0483c">🗑 删除奖励</button>' : '');
    var footer = '<button class="btn ghost" data-act="closeModal">取消</button>' +
      '<button class="btn green" data-act="saveReward" data-id="' + (r ? r.id : '') + '">保存</button>';
    openModal(r ? '编辑奖励' : '新增奖励', r ? '✏️' : '🎁', body, footer, bindEmojiBox);
  }
  function bindEmojiBox(mask) {
    var box = $('#emoji-box', mask);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-emoji]'); if (!b) return;
      $$('button', box).forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
    });
  }
  function saveReward(id) {
    var name = modalVal('f-name');
    if (!name) return toast('给奖励起个名字吧～', 'warn');
    var emojiBtn = $('#emoji-box button.on');
    withPwd(function (pwd) {
      run(S.upsertReward({
        id: id || null, name: name, pwd: pwd,
        emoji: emojiBtn ? emojiBtn.dataset.emoji : '🎁',
        cost: Math.max(1, parseInt(modalVal('f-cost'), 10) || 50),
        desc: modalVal('f-desc')
      }), '奖励已存进数据库 🎁', function () { closeModal(); render(); });
    });
  }

  function goalModal(id) {
    var g = id ? S.state.goals.filter(function (x) { return x.id === id; })[0] : null;
    var d = g || { title: '', emoji: '🎯', type: 'streak', target: 7, reward: '' };
    var body =
      '<div class="field"><label>目标图标</label><div class="avatar-grid" id="emoji-box">' +
      GOAL_EMOJIS.map(function (e) {
        return '<button type="button" data-emoji="' + e + '" class="' + (e === d.emoji ? 'on' : '') + '">' + e + '</button>';
      }).join('') + '</div></div>' +
      '<div class="field"><label>目标名称</label><input id="f-title" class="input" value="' + esc(d.title) + '" placeholder="例如：连续打卡一周"></div>' +
      '<div class="field"><label>目标类型</label><select id="f-type" class="input">' +
      Object.keys(S.GOAL_TYPES).map(function (k) {
        return '<option value="' + k + '"' + (k === d.type ? ' selected' : '') + '>' + S.GOAL_TYPES[k].label + '</option>';
      }).join('') + '</select></div>' +
      '<div class="field"><label>目标数值</label><input id="f-target" class="input" type="number" min="1" value="' + d.target + '"></div>' +
      '<div class="field"><label>达成后的奖励</label><input id="f-reward" class="input" value="' + esc(d.reward) + '" placeholder="例如：去游乐场玩半天"></div>' +
      (g ? '<button class="btn ghost block" data-act="delGoal" data-id="' + g.id + '" style="color:#e0483c">🗑 删除目标</button>' : '');
    var footer = '<button class="btn ghost" data-act="closeModal">取消</button>' +
      '<button class="btn green" data-act="saveGoal" data-id="' + (g ? g.id : '') + '">保存</button>';
    openModal(g ? '编辑目标' : '新增目标', g ? '✏️' : '🎯', body, footer, bindEmojiBox);
  }
  function saveGoal(id) {
    var title = modalVal('f-title');
    if (!title) return toast('给目标起个名字吧～', 'warn');
    var emojiBtn = $('#emoji-box button.on');
    withPwd(function (pwd) {
      run(S.upsertGoal({
        id: id || null, title: title, pwd: pwd,
        emoji: emojiBtn ? emojiBtn.dataset.emoji : '🎯',
        type: modalVal('f-type') || 'streak',
        target: Math.max(1, parseInt(modalVal('f-target'), 10) || 7),
        reward: modalVal('f-reward') || '一个大大的拥抱 🤗'
      }), '目标已存进数据库 🎯', function () { closeModal(); render(); });
    });
  }

  /* ---------------- 家长确认打卡 ---------------- */
  function askCheck(taskId) {
    if (!S.child) return;
    var t = S.state.tasks.filter(function (x) { return x.id === taskId; })[0];
    if (!t) return;
    var k = UI.dateKey || S.todayKey();
    var done = S.isDone(k, taskId);
    var body =
      '<div class="confirm-box"><div class="cb-emoji">' + t.emoji + '</div>' +
      '<div class="cb-text">' + (done
        ? '要取消「' + esc(S.child.name) + '」的「' + esc(t.title) + '」吗？<br><b>会扣回 ' + t.points + ' 分</b>'
        : '确认「' + esc(S.child.name) + '」完成了「' + esc(t.title) + '」吗？<br><b>完成后 +' + t.points + ' 分</b>') + '</div>' +
      (S.unlocked ? '' :
        '<div class="field" style="margin-top:12px"><label>' + (S.pinSet ? '访问锁' : '登录密码') + '</label>' +
        '<input id="f-pwd" class="input ' + (S.pinSet ? 'pin-input' : '') + '" type="password" ' +
        (S.pinSet ? 'inputmode="numeric" maxlength="6" pattern="[0-9]*" placeholder="确认打卡需要 4~6 位访问锁"' : 'placeholder="确认打卡需要家长密码"') +
        ' autocomplete="current-password"></div>') +
      '</div>';
    openModal(done ? '取消确认' : '家长确认', done ? '🤔' : '✅', body,
      '<button class="btn ghost" data-act="closeModal">再想想</button>' +
      '<button class="btn ' + (done ? '' : 'green') + '" id="ck-ok">' + (done ? '确认取消' : '确认完成') + '</button>',
      function (mask) {
        var ok = $('#ck-ok', mask);
        ok.addEventListener('click', function () {
          var pwdEl = $('#f-pwd', mask);
          var pwd = pwdEl ? pwdEl.value : '';
          if (!S.unlocked && !pwd) { toast(S.pinSet ? '请输入访问锁～' : '请输入家长密码～', 'warn'); return; }
          doCheck(taskId, pwd);
        });
        var pwdEl = $('#f-pwd', mask);
        if (pwdEl) pwdEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') ok.click(); });
      });
  }

  function doCheck(taskId, pwd) {
    var go = function () {
      run(S.toggle(UI.dateKey, taskId), null, function (j) {
        var r = j.result;
        closeModal();
        if (r && r.done) { confetti('⭐', 14); toast('已确认完成！+' + r.delta + ' 积分 ' + r.task.emoji); }
        else if (r) toast('已取消，扣回 ' + Math.abs(r.delta) + ' 积分');
        render(); playEvents();
      });
    };
    // 未解锁时先真实验证一次访问锁（未设置访问锁则用登录密码），防止孩子自己乱点
    if (S.unlocked) return go();
    run(S.unlock(pwd), null, go);
  }

  /* ---------------- 孩子切换 + 滑动手势 ---------------- */
  function pickChild(id) {
    if (S.child && id === S.child.id) return;
    run(S.selectChild(id), null, function () {
      UI.route = 'home'; UI.dateKey = S.todayKey(); render();
    });
  }
  function shiftChild(dir) {
    var list = S.children;
    if (list.length < 2) return;
    var i = 0;
    for (var k = 0; k < list.length; k++) { if (S.child && list[k].id === S.child.id) i = k; }
    pickChild(list[(i + dir + list.length) % list.length].id);
  }
  function bindSwipe() {
    var pageEl = document.getElementById('page');
    if (!pageEl) return;
    var x0 = null, y0 = null;
    pageEl.addEventListener('touchstart', function (e) {
      var t = e.touches[0]; x0 = t.clientX; y0 = t.clientY;
    }, { passive: true });
    pageEl.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - x0, dy = t.clientY - y0;
      x0 = null;
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (UI.route !== 'home') return;
      shiftChild(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  /* ---------------- 通用确认框 ---------------- */
  function confirmBox(text, emoji, cb) {
    openModal('确认一下', emoji || '❓',
      '<div style="font-size:14px;font-weight:700;line-height:1.8;padding:6px 2px">' + esc(text) + '</div>',
      '<button class="btn ghost" data-act="closeModal">再想想</button><button class="btn" id="cf-yes">确定</button>',
      function (mask) { $('#cf-yes', mask).addEventListener('click', cb); });
  }

  /* ---------------- 事件委托 ---------------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el) return;
    var act = el.dataset.act;

    switch (act) {
      case 'loginMode':
        if (UI.loginMode === el.dataset.mode) break;
        UI.loginMode = el.dataset.mode; rerenderLoginArea(); break;
      case 'pickAvatar': UI.avatar = el.dataset.avatar; rerenderLoginArea(); break;
      case 'doLogin': doLogin(); break;
      case 'doRegister': doRegister(); break;
      case 'sendCode': sendCode(); break;
      case 'doOtpLogin': doOtpLogin(); break;
      case 'forgotPwd': forgotPwdModal(); break;

      case 'nav': gotoRoute(el.dataset.route); break;
      case 'goToday': UI.dateKey = S.todayKey(); render(); break;
      case 'pickDate': UI.dateKey = el.dataset.date; render(); break;

      case 'checkTask': askCheck(el.dataset.id); break;

      case 'pickChild': pickChild(el.dataset.id); break;
      case 'addChild':
        withPwd(function () { UI.kidAvatar = '🧒'; childModal(null); });
        break;
      case 'editChild': childModal(el.dataset.id); break;
      case 'delChild': delChild(el.dataset.id); break;

      case 'newTask': taskModal(null); break;
      case 'editTask': taskModal(el.dataset.id); break;
      case 'saveTask': saveTask(el.dataset.id || null); break;
      case 'delTask':
        confirmBox('删除这个任务会同时清除它的打卡记录，确定吗？', '⚠️', function () {
          withPwd(function (pwd) {
            run(S.removeTask($('[data-act="delTask"]').dataset.id, pwd), '任务已删除', function () { closeModal(); render(); });
          });
        });
        break;

      case 'newReward': rewardModal(null); break;
      case 'editReward': rewardModal(el.dataset.id); break;
      case 'saveReward': saveReward(el.dataset.id || null); break;
      case 'delReward':
        confirmBox('确定删除这个奖励吗？', '⚠️', function () {
          withPwd(function (pwd) {
            var id = $('[data-act="delReward"]').dataset.id;
            run(S.removeReward(id, pwd), '奖励已删除', function () { closeModal(); render(); });
          });
        });
        break;

      case 'newGoal': goalModal(null); break;
      case 'editGoal': goalModal(el.dataset.id); break;
      case 'saveGoal': saveGoal(el.dataset.id || null); break;
      case 'delGoal':
        confirmBox('确定删除这个目标吗？', '⚠️', function () {
          withPwd(function (pwd) {
            var id = $('[data-act="delGoal"]').dataset.id;
            run(S.removeGoal(id, pwd), '目标已删除', function () { closeModal(); render(); });
          });
        });
        break;

      case 'applyReward': {
        var rw = S.state.rewards.filter(function (x) { return x.id === el.dataset.id; })[0];
        if (!rw) break;
        confirmBox('用 ' + rw.cost + ' 积分为「' + S.child.name + '」兑换「' + rw.name + '」吗？', '🎁', function () {
          withPwd(function (pwd) {
            run(S.applyRedeem(rw.id, pwd), null, function (j) {
              closeModal();
              confetti('🎁', 20);
              toast('兑换成功：' + (j.redeemed ? j.redeemed.name : '') + '（-' + rw.cost + ' 分）');
              render();
            });
          });
        });
        break;
      }

      case 'undoRedeem': {
        var rid = el.dataset.id;
        confirmBox('撤销这次兑换并把积分退回到「' + S.child.name + '」的账户吗？', '↩︎', function () {
          withPwd(function (pwd) {
            run(S.undoRedeem(rid, pwd), null, function (j) {
              closeModal();
              toast('已撤销，退回 ' + (j.undone ? j.undone.cost : 0) + ' 积分');
              render();
            });
          });
        });
        break;
      }

      case 'lockNow':
        run(S.lock(), '已上锁 🔒', function () { render(); });
        break;

      case 'accessLock': accessLockModal(); break;
      case 'changePwd': changePwdModal(); break;

      case 'resetData':
        confirmBox('重置后数据库里的任务、打卡记录、积分都会被清空并恢复成初始示例数据，确定吗？', '⚠️', function () {
          run(S.reset(), '数据已重置', function () { closeModal(); UI.route = 'home'; render(); });
        });
        break;

      case 'exportData':
        S.exportJSON().then(function (txt) {
          var blob = new Blob([txt], { type: 'application/json' });
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = '星星打卡数据_' + S.todayKey() + '.json';
          document.body.appendChild(a); a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
          toast('数据已导出 💾');
        });
        break;

      case 'logout':
        run(S.logout(), null, function () { UI.route = 'home'; render(); toast('已退出登录'); });
        break;

      case 'closeModal': closeModal(); break;
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    if (document.getElementById('f-pwd') && !S.currentUser()) {
      UI.loginMode === 'register' ? doRegister() : doLogin();
    }
  });

  /* SDK 从 CDN 加载，可能比本地脚本慢一拍；先等它就绪再拉数据 */
  function waitSdk(cb, tries) {
    if (window.AppDatabase || (tries || 0) >= 20) return cb();
    setTimeout(function () { waitSdk(cb, (tries || 0) + 1); }, 250);
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    app.innerHTML = '<div class="login-wrap"><div class="login-card" style="text-align:center">' +
      '<div class="mascot">🐻</div><div class="brand">⭐ 星星<span>打卡</span></div>' +
      '<div class="slogan">正在连接云服务…</div></div></div>';
    waitSdk(function () {
      S.load().then(function (j) {
        if (!j || j.ok === false) {
          app.innerHTML = '<div class="login-wrap"><div class="login-card" style="text-align:center">' +
            '<div class="mascot">😿</div><div class="brand">连不上<span>云服务</span></div>' +
            '<div class="slogan" style="line-height:2">请检查网络后刷新本页重试。<br>' +
            '若一直失败，可能是云服务未开通或配置已过期。' +
            '<div style="font-size:11px;margin-top:8px">' + esc((j && j.msg) || '') + '</div></div></div></div>';
          return;
        }
        UI.route = 'home'; UI.dateKey = S.todayKey();
        render();
        if (!S.pinSet) accessLockModal();
      });
    });
  }
  boot();
})();
