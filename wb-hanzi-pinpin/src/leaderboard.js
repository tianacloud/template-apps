import { esc, pct, fmtMs } from './ui.js';

export function leaderboardHtml(entries, { scope, period, roomCode, emptyText }) {
  const rows = entries.length ? entries.map((entry, index) => `
    <li class="lb-row">
      <span class="lb-rank rank-${index + 1}">${index + 1}</span>
      <span class="lb-name">${esc(entry.nickname)}</span>
      <span class="lb-score">${entry.score} 分</span>
      <span class="lb-meta">${pct(entry.accuracy)} 正确 · 用时 ${fmtMs(entry.elapsedMs)}<br>
        <span class="lb-sub">${entry.correctCount} 对 / ${entry.total} 次</span></span>
    </li>`).join('') : `<li class="lb-row"><span class="lb-name muted">${esc(emptyText || '还没有人作答')}</span></li>`;

  return `
    <div class="lb-controls">
      <div class="lb-group"><span class="muted">范围</span>
        <button class="lb-chip${scope === 'all' ? ' on' : ''}" data-lb-scope="all">全部课堂</button>
        <button class="lb-chip${scope === 'room' ? ' on' : ''}" data-lb-scope="room">本课堂</button>
      </div>
      <div class="lb-group"><span class="muted">周期</span>
        <button class="lb-chip${period === 'all' ? ' on' : ''}" data-lb-period="all">累计</button>
        <button class="lb-chip${period === 'week' ? ' on' : ''}" data-lb-period="week">本周</button>
        <button class="lb-chip${period === 'month' ? ' on' : ''}" data-lb-period="month">本月</button>
      </div>
    </div>
    <ol class="lb-list">${rows}</ol>`;
}

export function scoreRuleText() {
  return '每次提交都留痕并按窗口累计。计分：答对 +10 · 一次答对 +15 · 看过提示/求助后答对 +5 · 答错不扣分。';
}
