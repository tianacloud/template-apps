/** Four-state Shell UI for `@tianacloud/dsh-remote` (.tweb hosted app). */

const SHELL_STYLES = ':root{color-scheme:light dark;--dsh-bg-l:#f1f5f9;--dsh-bg-d:#0b1120;--dsh-c-l:#fff;--dsh-c-d:rgba(19,27,46,.94);--dsh-t-l:#0f172a;--dsh-t-d:#f1f5f9;--dsh-m-l:#475569;--dsh-m-d:#94a3b8;--dsh-b-l:rgba(15,23,42,.12);--dsh-b-d:rgba(148,163,184,.22);--dsh-k-l:#f8fafc;--dsh-k-d:#0f172a;--dsh-bg:var(--dsh-bg-l);--dsh-card:var(--dsh-c-l);--dsh-text:var(--dsh-t-l);--dsh-muted:var(--dsh-m-l);--dsh-border:var(--dsh-b-l);--dsh-code:var(--dsh-k-l)}' +
  '@media (prefers-color-scheme:dark){:root{--dsh-bg:var(--dsh-bg-d);--dsh-card:var(--dsh-c-d);--dsh-text:var(--dsh-t-d);--dsh-muted:var(--dsh-m-d);--dsh-border:var(--dsh-b-d);--dsh-code:var(--dsh-k-d)}}' +
  '@supports (color:light-dark(white,black)){:root{--dsh-bg:light-dark(var(--dsh-bg-l),var(--dsh-bg-d));--dsh-card:light-dark(var(--dsh-c-l),var(--dsh-c-d));--dsh-text:light-dark(var(--dsh-t-l),var(--dsh-t-d));--dsh-muted:light-dark(var(--dsh-m-l),var(--dsh-m-d));--dsh-border:light-dark(var(--dsh-b-l),var(--dsh-b-d));--dsh-code:light-dark(var(--dsh-k-l),var(--dsh-k-d))}}' +
  '#dsh-remote-shell{position:fixed;inset:0;z-index:2147483640;overflow:auto;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--dsh-bg);color:var(--dsh-text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}' +
  '.dsh-shell-card{box-sizing:border-box;width:min(640px,100%);background:var(--dsh-card);border:1px solid var(--dsh-border);border-radius:18px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,.22);display:grid;grid-template-columns:minmax(0,1fr);gap:16px}' +
  '.dsh-shell-badge{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:#3b82f6;letter-spacing:.02em}' +
  '.dsh-shell-title{margin:0;font-size:22px;font-weight:650;line-height:1.3}.dsh-shell-sub{margin:0;font-size:14px;line-height:1.6;color:var(--dsh-muted)}' +
  '.dsh-shell-tabs{display:flex;gap:8px;flex-wrap:wrap}.dsh-shell-tab{padding:6px 12px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;border:1px solid var(--dsh-border);background:transparent;color:var(--dsh-muted)}.dsh-shell-tab[aria-selected="true"]{background:#2563eb;border-color:#2563eb;color:#fff}' +
  '.dsh-shell-codebox{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;min-width:0;max-width:100%;box-sizing:border-box;background:var(--dsh-code);border:1px solid var(--dsh-border)}' +
  '.dsh-shell-code{flex:1;min-width:0;overflow-x:auto;white-space:nowrap;font:13px ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}' +
  '.dsh-shell-btn{padding:9px 14px;border-radius:9px;font-size:13px;font-weight:500;cursor:pointer;border:1px solid var(--dsh-border);background:transparent;color:var(--dsh-text);white-space:nowrap}.dsh-shell-btn-primary{background:#2563eb;border-color:#2563eb;color:#fff}.dsh-shell-btn:hover{filter:brightness(1.06)}' +
  '.dsh-shell-input-row{display:flex;gap:8px;align-items:center}.dsh-shell-input{flex:1;min-width:0;padding:11px 13px;border-radius:9px;border:1px solid var(--dsh-border);background:var(--dsh-code);color:var(--dsh-text);font:13px ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}' +
  '.dsh-shell-err{padding:10px 12px;border-radius:9px;font-size:13px;line-height:1.45;background:rgba(220,38,38,.14);border:1px solid rgba(248,113,113,.45);color:#ef4444}' +
  '.dsh-shell-valid-hint{font-size:12px;line-height:1.4;min-height:18px}.dsh-shell-valid-hint.is-ok{color:#22c55e}.dsh-shell-valid-hint.is-err{color:#ef4444}' +
  '.dsh-shell-wait{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:10px;background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.25);font-size:13px}' +
  '.dsh-shell-pulse{width:9px;height:9px;border-radius:50%;background:#3b82f6;flex:none;animation:dsh-pulse 1.5s infinite}@keyframes dsh-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.8)}}' +
  '.dsh-shell-check{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--dsh-muted);cursor:pointer}.dsh-shell-details{font-size:13px;color:var(--dsh-muted);border-top:1px solid var(--dsh-border);padding-top:12px}.dsh-shell-details summary{cursor:pointer;font-weight:500;color:var(--dsh-text)}' +
  '#dsh-remote-reconnect-banner,#dsh-remote-no-sw-banner{position:fixed;left:50%;transform:translateX(-50%);z-index:2147483645;display:flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;font:13px system-ui,-apple-system,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.28);backdrop-filter:blur(10px)}' +
  '#dsh-remote-reconnect-banner{top:12px;background:rgba(15,23,42,.9);color:#f8fafc;border:1px solid rgba(148,163,184,.35)}#dsh-remote-no-sw-banner{top:12px;background:rgba(245,158,11,.94);color:#1c1917;border:1px solid rgba(217,119,6,.55);max-width:calc(100vw - 24px)}' +
  '@media (max-width:560px){#dsh-remote-shell{padding:14px}.dsh-shell-card{padding:20px}}';

const PAIRING_KEY_PATTERN = /^(?:dshk1_)?[A-Za-z0-9_-]{43}$/u;

export function validatePairingKeyInput(raw) {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) return { valid: false, empty: true, trimmed: '', message: '' };
  if (PAIRING_KEY_PATTERN.test(trimmed)) return { valid: true, empty: false, trimmed, message: '密钥格式有效（43 位 base64url）' };
  const bare = trimmed.startsWith('dshk1_') ? trimmed.slice(6) : trimmed;
  if (!/^[A-Za-z0-9_-]*$/u.test(bare)) {
    return { valid: false, empty: false, trimmed, message: '密钥包含非法字符，仅支持 43 位 base64url 或 dshk1_ 前缀格式。' };
  }
  return { valid: false, empty: false, trimmed, message: `密钥长度应为 43 位（当前 ${bare.length} 位，支持可选 dshk1_ 前缀）。` };
}

function el(tag, props, ...children) {
  const node = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (k === 'style') node.style.cssText = v;
      else if (k === 'attrs') { for (const [ak, av] of Object.entries(v)) node.setAttribute(ak, av); }
      else node[k] = v;
    }
  }
  if (children.length) node.append(...children);
  return node;
}

function ensureShellStyles() {
  if (typeof document === 'undefined') return;
  if (!document.querySelector('meta[name="color-scheme"]')) {
    document.head?.appendChild(el('meta', { name: 'color-scheme', content: 'light dark' }));
  }
  if (!document.getElementById('dsh-remote-shell-styles')) {
    document.head?.appendChild(el('style', { id: 'dsh-remote-shell-styles', textContent: SHELL_STYLES }));
  }
}

export function detectClientOS() {
  const ua = typeof navigator !== 'undefined'
    ? String(navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || '').toLowerCase()
    : '';
  return ua.includes('win') ? 'windows' : ua.includes('mac') ? 'macos' : 'linux';
}

export function buildConnectCommand({ webId, tenantId, rebind = false } = {}) {
  const parts = ['npx --yes @tianacloud/dsh-remote@latest connect', `--app ${webId || '<appId>'}`];
  if (tenantId) parts.push(`--space ${tenantId}`);
  if (rebind) parts.push('--rebind');
  return parts.join(' ');
}

export function createShellUI(rootEl) {
  ensureShellStyles();
  const card = el('div', { className: 'dsh-shell-card' });
  const overlay = el('div', { id: 'dsh-remote-shell' }, card);
  rootEl.replaceChildren(overlay);

  let reconnectBanner = null;
  let noSwBanner = null;
  let waitStatusEl = null;

  function renderCard(stateName, elements) {
    overlay.dataset.state = stateName;
    card.replaceChildren(...elements);
    if (!overlay.isConnected) {
      if (rootEl.isConnected) rootEl.replaceChildren(overlay);
      else document.body?.append(overlay);
    }
  }

  const makeHeader = (badgeText, titleText, subText) => [
    el('div', { className: 'dsh-shell-badge', textContent: badgeText }),
    el('h2', { className: 'dsh-shell-title', textContent: titleText }),
    el('p', { className: 'dsh-shell-sub', textContent: subText }),
  ];

  return {
    showLoading(title, subtitle) {
      renderCard('loading', makeHeader('Tiana · DSH Remote (E2EE)', title, subtitle));
    },

    showError(title, subtitle, onRetry) {
      const btn = el('button', { type: 'button', className: 'dsh-shell-btn dsh-shell-btn-primary', textContent: '重新加载' });
      btn.addEventListener('click', () => (onRetry ? onRetry() : location.reload()), { once: true });
      renderCard('error', [...makeHeader('Tiana · DSH Remote', title, subtitle), btn]);
    },

    showOnboarding({ webId, tenantId } = {}) {
      const baseCmd = buildConnectCommand({ webId, tenantId });
      const osCommands = {
        macos: { label: 'macOS / Linux', cmd: baseCmd, hint: '需要 Node.js >= 24.9.0（推荐 fnm / nvm）。未装 DSH 将自动安装并启用双插件。' },
        windows: { label: 'Windows PowerShell', cmd: baseCmd, hint: '需要 Node.js >= 24.9.0（推荐 winget install OpenJS.NodeJS.LTS）。' },
      };
      let activeOs = detectClientOS() === 'windows' ? 'windows' : 'macos';
      const tabs = el('div', { className: 'dsh-shell-tabs', attrs: { role: 'tablist' } });
      const codeEl = el('code', { className: 'dsh-shell-code', id: 'dsh-remote-onboarding-cmd' });
      const hintEl = el('p', { className: 'dsh-shell-sub', style: 'font-size:12px;' });
      const tabButtons = {};
      const selectOs = (key) => {
        activeOs = key;
        for (const [k, btn] of Object.entries(tabButtons)) btn.setAttribute('aria-selected', k === key ? 'true' : 'false');
        codeEl.textContent = osCommands[key].cmd;
        hintEl.textContent = osCommands[key].hint;
      };
      for (const [key, cfg] of Object.entries(osCommands)) {
        const btn = el('button', { type: 'button', className: 'dsh-shell-tab', textContent: cfg.label, attrs: { role: 'tab' } });
        btn.addEventListener('click', () => selectOs(key));
        tabButtons[key] = btn;
        tabs.append(btn);
      }
      const copyBtn = el('button', { type: 'button', id: 'dsh-remote-copy-cmd', className: 'dsh-shell-btn dsh-shell-btn-primary', textContent: '复制命令' });
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(osCommands[activeOs].cmd);
          copyBtn.textContent = '已复制';
          setTimeout(() => { copyBtn.textContent = '复制命令'; }, 1800);
        } catch { copyBtn.textContent = '请手动复制'; }
      });
      const codeBox = el('div', { className: 'dsh-shell-codebox' }, codeEl, copyBtn);
      waitStatusEl = el('span', { textContent: '正在等待你的电脑完成配置并上线…（上线后自动进入解锁页）' });
      const waitBar = el('div', { className: 'dsh-shell-wait', id: 'dsh-remote-onboarding-wait' }, el('span', { className: 'dsh-shell-pulse' }), waitStatusEl);
      const details = el('details', { className: 'dsh-shell-details' },
        el('summary', { textContent: '高级说明：本机已有 DSH 实例？' }),
        el('p', { style: 'margin:8px 0 0;', textContent: '上述命令会自动检测并复用已有 DSH、保留所有项目与对话记录，仅增量启用 @tianacloud/dsh-tiana 与 @tianacloud/dsh-remote 并免重编译写入云端策略。' }),
      );
      selectOs(activeOs);
      renderCard('onboarding', [
        ...makeHeader('Tiana · DSH Remote 首次配置向导', '连接你的个人电脑 DSH 工作台', '在个人电脑终端运行下方命令，即可自动完成环境配置、云端免重编译绑定并生成端到端加密配对密钥。'),
        tabs, codeBox, hintEl, waitBar, details,
      ]);
    },

    markHostOnlineDetected(hostName) {
      if (waitStatusEl) waitStatusEl.textContent = `已检测到主机 "${hostName || 'DSH'}" 上线！正在进入解锁界面…`;
    },

    showHostOffline({ webId, tenantId, hostName, hostId } = {}) {
      const display = hostName || hostId || '本地主机';
      const steps = el('div', { className: 'dsh-shell-sub' },
        el('div', { textContent: '1. 在该电脑终端运行 `dsh --profile web` 启动本地服务；' }),
        el('div', { textContent: '2. 或在已运行的本地 DSH 左侧边栏打开「Tiana Remote」开启远程访问开关。' }),
      );
      waitStatusEl = el('span', { textContent: `正在监听主机 "${display}" 上线信号，恢复后自动连接…` });
      const waitBar = el('div', { className: 'dsh-shell-wait' }, el('span', { className: 'dsh-shell-pulse' }), waitStatusEl);
      const details = el('details', { className: 'dsh-shell-details' },
        el('summary', { textContent: '需要将此应用换绑到另一台电脑？' }),
        el('div', { className: 'dsh-shell-codebox', style: 'margin-top:8px;' }, el('code', { className: 'dsh-shell-code', textContent: buildConnectCommand({ webId, tenantId, rebind: true }) })),
      );
      renderCard('offline', [
        ...makeHeader('Tiana · DSH Remote 主机离线', `主机 "${display}" 当前不在线`, '应用已完成绑定，但本地电脑的 DSH 远程桥尚未连接。'),
        steps, waitBar, details,
      ]);
    },

    promptUnlock({ hostName, hostId, errorMessage = '', defaultRemember = true } = {}) {
      const display = hostName || hostId || 'DSH 主机';
      return new Promise((resolve) => {
        const errBox = el('div', { id: 'dsh-remote-e2ee-error', className: 'dsh-shell-err', textContent: errorMessage, style: errorMessage ? '' : 'display:none;' });
        const input = el('input', {
          id: 'dsh-remote-e2ee-key-input', className: 'dsh-shell-input', type: 'password',
          autocomplete: 'off', spellcheck: false, maxLength: 80, placeholder: '粘贴配对密钥 (dshk1_... 或 43 位密钥)',
        });
        const validationEl = el('div', { id: 'dsh-remote-key-validation', className: 'dsh-shell-valid-hint', attrs: { 'aria-live': 'polite' } });
        const updateValidation = () => {
          const trimmed = input.value.trim();
          if (trimmed !== input.value) input.value = trimmed;
          const check = validatePairingKeyInput(trimmed);
          validationEl.textContent = check.empty ? '' : check.message;
          validationEl.className = check.empty ? 'dsh-shell-valid-hint' : `dsh-shell-valid-hint ${check.valid ? 'is-ok' : 'is-err'}`;
          validationEl.dataset.valid = check.empty ? '' : String(check.valid);
          return check;
        };
        input.addEventListener('paste', (ev) => {
          const pasted = ev.clipboardData?.getData('text');
          if (pasted !== undefined) { ev.preventDefault(); input.value = pasted.trim(); updateValidation(); }
        });
        input.addEventListener('input', updateValidation);

        const toggleBtn = el('button', { type: 'button', className: 'dsh-shell-btn', textContent: '显示' });
        toggleBtn.addEventListener('click', () => {
          const showing = input.type === 'text';
          input.type = showing ? 'password' : 'text';
          toggleBtn.textContent = showing ? '显示' : '隐藏';
        });

        const rememberBox = el('input', { type: 'checkbox', id: 'dsh-remote-remember-key', checked: Boolean(defaultRemember) });
        const rememberLabel = el('label', { className: 'dsh-shell-check' }, rememberBox, '在此受信任浏览器记住密钥（取消勾选后密钥仅驻留当前页面内存，刷新或关闭标签页立即销毁）');
        const hint = el('div', { className: 'dsh-shell-sub', style: 'font-size:12px;', textContent: '密钥仅在浏览器与你的电脑之间进行端到端加密校验，Tiana 云端无法解密任何内容。可从刚运行的 connect 剪贴板粘贴，或在本地 DSH 侧栏「Tiana Remote」复制。' });
        const submitBtn = el('button', { id: 'dsh-remote-e2ee-submit', type: 'submit', className: 'dsh-shell-btn dsh-shell-btn-primary', textContent: '解锁并进入工作台' });

        const form = el('form', { style: 'display:grid;gap:12px;' }, errBox, el('div', { className: 'dsh-shell-input-row' }, input, toggleBtn), validationEl, rememberLabel, hint, submitBtn);
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const check = updateValidation();
          if (!check.valid) {
            errBox.textContent = check.message || '请输入有效的 43 位配对密钥（支持可选 dshk1_ 前缀）。';
            errBox.style.display = 'block';
            input.focus();
            return;
          }
          input.value = '';
          resolve({ secret: check.trimmed, remember: rememberBox.checked });
        });

        renderCard('unlock', [
          ...makeHeader('Tiana · DSH Remote (E2EE)', '输入端到端配对密钥解锁', `目标主机 "${display}" 已在线。请粘贴主机端生成的配对密钥建立加密隧道。`),
          form,
        ]);
        queueMicrotask(() => input.focus());
      });
    },

    mountReconnectBanner({ hostName, onLock } = {}) {
      reconnectBanner?.remove();
      const text = el('span', { textContent: `正在重连至 ${hostName || '主机'}…` });
      const lockBtn = el('button', { type: 'button', className: 'dsh-shell-btn', style: 'padding:4px 10px;font-size:12px;color:#fff;border-color:rgba(255,255,255,0.3);', textContent: '立即锁定' });
      lockBtn.addEventListener('click', () => void onLock?.());
      reconnectBanner = el('div', { id: 'dsh-remote-reconnect-banner', role: 'status', style: 'display:none;' }, text, lockBtn);
      document.body.append(reconnectBanner);
      return {
        showReconnecting() { text.textContent = `正在重连至 ${hostName || '主机'}…`; reconnectBanner.style.display = 'flex'; },
        showRecovered() {
          text.textContent = '已恢复连接';
          reconnectBanner.style.display = 'flex';
          setTimeout(() => { if (reconnectBanner) reconnectBanner.style.display = 'none'; }, 1200);
        },
        hide() { if (reconnectBanner) reconnectBanner.style.display = 'none'; },
        remove() { reconnectBanner?.remove(); reconnectBanner = null; },
      };
    },

    mountNoSwBanner() {
      if (noSwBanner) return noSwBanner;
      const closeBtn = el('button', {
        type: 'button', id: 'dsh-remote-no-sw-dismiss', textContent: '关闭',
        attrs: { 'aria-label': '关闭提示' },
        style: 'background:rgba(0,0,0,0.12);border:none;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px;color:#1c1917;white-space:nowrap;',
      });
      closeBtn.addEventListener('click', () => { noSwBanner?.remove(); noSwBanner = null; });
      noSwBanner = el('div', { id: 'dsh-remote-no-sw-banner', role: 'status' },
        el('span', { textContent: '当前容器未启用 Service Worker，对话、文件上传与实时流可正常使用；如需完整媒体预览与流式下载，请在系统标准浏览器中打开。' }),
        closeBtn,
      );
      document.body.append(noSwBanner);
      return noSwBanner;
    },

    destroy() { overlay.remove(); },

    destroyAll() {
      overlay.remove();
      reconnectBanner?.remove();
      reconnectBanner = null;
      noSwBanner?.remove();
      noSwBanner = null;
    },
  };
}
