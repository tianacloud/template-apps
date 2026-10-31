// ui/hud.js
// HUD（DOM/CSS）：当前天数、整体进度%、工具栏(擦拭/喷水/刷子)、道具按钮(清洁剂卡)、通关横幅、提示条。
// 触控目标 >= 44px（见 index.html CSS 的 --tap）。
// HUD 只负责展现与把用户操作转交 Game / 回调；不直接碰存档逻辑。

export class HUD {
  // game: Game 实例；callbacks: { onOpenCalendar, onResetView, onResetSave }
  constructor({ game, callbacks = {} }) {
    this.game = game;
    this.callbacks = callbacks;

    this.el = {
      dayNum: document.getElementById('dayNum'),
      dayDate: document.getElementById('dayDate'),
      progressBar: document.getElementById('progressBar'),
      streakNum: document.getElementById('streakNum'),
      cardCount: document.getElementById('cardCount'),
      toast: document.getElementById('toast'),
      complete: document.getElementById('complete'),
      completeSub: document.getElementById('completeSub'),
      toolWipe: document.getElementById('toolWipe'),
      toolSpray: document.getElementById('toolSpray'),
      toolBrush: document.getElementById('toolBrush'),
      cardBtn: document.getElementById('cardBtn'),
      dayBtn: document.getElementById('dayBtn'),
      resetViewBtn: document.getElementById('resetViewBtn'),
      modeWipe: document.getElementById('modeWipe'),
      modeRotate: document.getElementById('modeRotate'),
      resetBtn: document.getElementById('resetBtn'),
      shareBtn: document.getElementById('shareBtn'),
      completeShare: document.getElementById('completeShare'),
    };

    this._toastTimer = null;
    this._completeTimer = null;

    // 当前交互状态（用于驱动鼠标指针形态）
    this.tool = 'wipe';
    this.mode = 'wipe';
    this.cardArmed = false;

    this._wireTools();
    this._wireButtons();
    this.setModeUI('wipe');
  }

  _wireTools() {
    const TOOL_HINT = {
      wipe: '🧽 干擦：去水雾 / 灰尘 / 指纹',
      spray: '💧 喷水：打湿油污以便擦除，也能轻冲浮尘',
      brush: '🪥 刷子：大笔刷，专攻顽固渍和贴纸',
    };
    const tools = [
      ['wipe', this.el.toolWipe],
      ['spray', this.el.toolSpray],
      ['brush', this.el.toolBrush],
    ];
    for (const [tool, btn] of tools) {
      btn.addEventListener('click', () => {
        this.game.setTool(tool);
        this.setActiveTool(tool);
        // 旋转模式下点任意工具/道具都立即切回「擦拭」，确保立刻可操作
        this.setMode('wipe');
        this.showToast(TOOL_HINT[tool], 1300);
      });
    }
    this.setActiveTool('wipe');
  }

  _wireButtons() {
    this.el.cardBtn.addEventListener('click', () => {
      const armed = this.game.toggleCard();
      this.el.cardBtn.classList.toggle('armed', armed);
      // 旋转模式下点任意道具都立即切回「擦拭」，确保立刻可操作
      this.setMode('wipe');
    });
    this.el.dayBtn.addEventListener('click', () => {
      if (this.callbacks.onOpenCalendar) this.callbacks.onOpenCalendar();
    });
    this.el.resetViewBtn.addEventListener('click', () => {
      if (this.callbacks.onResetView) this.callbacks.onResetView();
    });
    // 旋转 / 擦拭 模式切换（与擦拭行为完全分离的独立旋转 UI）
    this.el.modeWipe.addEventListener('click', () => this.setMode('wipe'));
    this.el.modeRotate.addEventListener('click', () => this.setMode('rotate'));
    // 重置当前关：从头再擦
    this.el.resetBtn.addEventListener('click', () => {
      if (this.callbacks.onResetLevel) this.callbacks.onResetLevel();
    });
    // 分享按钮（工具栏常驻 + 通关横幅内 instant）：通关后可一键导出分享卡片
    if (this.el.shareBtn) {
      this.el.shareBtn.addEventListener('click', () => {
        if (this.callbacks.onShare) this.callbacks.onShare();
      });
    }
    if (this.el.completeShare) {
      this.el.completeShare.addEventListener('click', () => {
        if (this.callbacks.onShare) this.callbacks.onShare();
      });
    }
  }

  // 统一切换交互模式（通知控制器 + 更新 UI 高亮）
  setMode(mode) {
    if (this.callbacks.onSetMode) this.callbacks.onSetMode(mode);
    this.setModeUI(mode);
  }

  // 高亮当前模式（旋转/擦拭）
  setModeUI(mode) {
    if (this.el.modeWipe) this.el.modeWipe.classList.toggle('active', mode === 'wipe');
    if (this.el.modeRotate) this.el.modeRotate.classList.toggle('active', mode === 'rotate');
    document.body.classList.toggle('mode-rotate', mode === 'rotate');
    this.mode = mode;
    this._emitCursor();
  }

  setActiveTool(tool) {
    this.el.toolWipe.classList.toggle('active', tool === 'wipe');
    this.el.toolSpray.classList.toggle('active', tool === 'spray');
    this.el.toolBrush.classList.toggle('active', tool === 'brush');
    this.tool = tool;
    this._emitCursor();
  }

  // 清洁剂卡 armed 状态（由 Game 回调驱动，保证使用后自动取消高亮）
  setCardArmed(armed) {
    this.el.cardBtn.classList.toggle('armed', !!armed);
    this.cardArmed = !!armed;
    this._emitCursor();
  }

  // 通知外层（main）当前工具/模式/卡片状态变化，用于切换鼠标指针
  _emitCursor() {
    if (this.callbacks.onCursor) {
      this.callbacks.onCursor({ mode: this.mode, tool: this.tool, cardArmed: this.cardArmed });
    }
  }

  // 来自 Game 的状态回调
  update(state) {
    if (!state) return;
    if (this.el.dayNum) this.el.dayNum.textContent = state.dayIndex;
    if (this.el.dayDate) this.el.dayDate.textContent = state.dayDate;
    if (this.el.streakNum) this.el.streakNum.textContent = state.streak;
    if (this.el.cardCount) this.el.cardCount.textContent = state.cards;
    // 没有卡时按钮置灰
    this.el.cardBtn.style.opacity = state.cards > 0 ? '1' : '0.45';
    // 分享按钮：仅通关后可用
    if (this.el.shareBtn) {
      this.el.shareBtn.disabled = !state.completed;
      this.el.shareBtn.style.opacity = state.completed ? '1' : '0.4';
    }
  }

  setProgress(pct) {
    if (this.el.progressBar) this.el.progressBar.style.width = `${pct}%`;
  }

  showToast(msg, ms = 1600) {
    const t = this.el.toast;
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  }

  showComplete(info = {}) {
    const c = this.el.complete;
    if (!c) return;
    let sub = '今日金句已解锁';
    if (info.grantedCard) sub = '连续登录达成 · 获得 1 张清洁剂卡';
    else if (info.isToday === false) sub = '补卡完成 · 金句已解锁';
    if (this.el.completeSub) this.el.completeSub.textContent = sub;
    c.classList.add('show');
    clearTimeout(this._completeTimer);
    this._completeTimer = setTimeout(() => c.classList.remove('show'), 2400);
  }
}
