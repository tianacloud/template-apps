// ui/calendar.js
// 关卡选择 / 365 日历：今天(可打卡) / 历史可补(已通关 or 未通关) / 未来锁定。
// 点击触发 onSelectDay(dayIndex, { makeup })。
//
//   today(未通关) -> 正常打卡 makeup:false
//   done(任意已通关) -> 回看 makeup:false
//   makeup(历史未通关) -> 补卡 makeup:true（仅记录通关，不推进连续登录/不赠卡）
//   locked(未来) -> 禁用

import { dayStatus } from '../core/progress.js';

export class Calendar {
  // game: Game；onSelectDay(dayIndex, opts)；onResetSave()
  constructor({ game, onSelectDay, onResetSave }) {
    this.game = game;
    this.onSelectDay = onSelectDay;
    this.onResetSave = onResetSave;

    this.overlay = document.getElementById('calendarOverlay');
    this.grid = document.getElementById('calGrid');
    this.info = document.getElementById('calInfo');
    this.closeBtn = document.getElementById('calClose');
    this.resetBtn = document.getElementById('resetSaveBtn');

    this.closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
    this.resetBtn.addEventListener('click', () => {
      if (this.onResetSave) this.onResetSave();
      this._render();
    });
  }

  open() {
    this._render();
    this.overlay.classList.add('show');
  }

  close() {
    this.overlay.classList.remove('show');
  }

  _render() {
    const state = this.game.state;
    const cur = this.game.currentDayIndex();
    this.grid.innerHTML = '';
    for (let d = 1; d <= 365; d++) {
      const status = dayStatus(state, d);
      const btn = document.createElement('button');
      btn.className = 'cell';
      btn.textContent = d;
      btn.dataset.day = d;
      if (status === 'today') {
        btn.classList.add('today');
        btn.title = '今天 · 点击正常打卡';
      } else if (status === 'done') {
        btn.classList.add('done');
        btn.title = '已通关';
      } else if (status === 'makeup') {
        btn.classList.add('makeup');
        btn.title = '可补卡（仅记录通关）';
      } else {
        btn.classList.add('locked');
        btn.disabled = true;
        btn.title = '未解锁';
      }
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const makeup = status === 'makeup';
        this.close();
        this.onSelectDay(d, { makeup });
      });
      this.grid.appendChild(btn);
    }
    if (this.info) {
      this.info.textContent = `今天 = 第 ${cur} 天 · 最长连续 ${state.streak.longest} 天 · 清洁剂卡 ${state.props.cleanerCards}`;
    }
  }
}
