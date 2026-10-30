/* ============================================================
   摸鱼盒子 · 记忆翻牌
   4×4 共 8 对图形，点两张一样的配对。记录步数与用时，最佳步数保存在应用中。
   ============================================================ */
(function () {
  'use strict';

  var PAIRS = 8;
  var COLS = 4;
  var FLIP_BACK_MS = 620;

  /* 8 种图形 + 各自颜色，形状与颜色都不同，避免只看颜色记牌 */
  var SHAPES = [
    { c: '#f0a04b', p: '<path d="M12 3.2l2.6 5.5 6 .9-4.35 4.2 1.03 5.95L12 16.9l-5.28 2.85 1.03-5.95L3.4 9.6l6-.9z"/>' },
    { c: '#f2545b', p: '<path d="M12 20.3S4.7 15.6 4.7 10.7A4.5 4.5 0 0 1 12 7.2a4.5 4.5 0 0 1 7.3 3.5c0 4.9-7.3 9.6-7.3 9.6z"/>' },
    { c: '#5b6ef5', p: '<path d="M20.2 14.6A8.6 8.6 0 1 1 9.4 3.8a7 7 0 0 0 10.8 10.8z"/>' },
    { c: '#22a8cf', p: '<path d="M7 18.4h10.2a3.6 3.6 0 0 0 .3-7.2A5.1 5.1 0 0 0 7.9 9.6 4.3 4.3 0 0 0 7 18.4z"/>' },
    { c: '#2fbf8f', p: '<path d="M4.8 19.2C4.8 11 11 4.8 19.2 4.8c0 8.2-6.2 14.4-14.4 14.4z"/><path d="M6.6 17.4c2.7-2.7 5.4-4.5 8.4-5.7" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".75"/>' },
    { c: '#8b5cf6', p: '<path d="M12 3.6l8.4 14.8H3.6z"/>' },
    { c: '#e2569b', p: '<circle cx="12" cy="12" r="3.1"/><circle cx="12" cy="6.2" r="2.7"/><circle cx="17.8" cy="12" r="2.7"/><circle cx="12" cy="17.8" r="2.7"/><circle cx="6.2" cy="12" r="2.7"/>' },
    { c: '#0f9d9d', p: '<path d="M3.6 12C6.7 7.9 10.8 6 14.7 6c2.5 0 4.4 1.1 5.7 2.2L18 12l2.4 3.8c-1.3 1.1-3.2 2.2-5.7 2.2-3.9 0-8-1.9-11.1-6z"/><circle cx="16.4" cy="10.4" r="1.1" fill="#fff"/>' }
  ];

  var ICON_BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M3.5 10.5h17M9 5.5v13"/></svg>';

  var boardEl = document.getElementById('board');
  var movesEl = document.getElementById('moves');
  var timeEl = document.getElementById('time');
  var bestEl = document.getElementById('best');
  var leftEl = document.getElementById('left');
  var overlay = document.getElementById('overlay');
  var ovTitle = document.getElementById('ovTitle');
  var ovScore = document.getElementById('ovScore');
  var ovSub = document.getElementById('ovSub');

  var deck, open, matched, moves, lock, started, startAt, elapsed, tickId, paused;

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function fmtTime(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function bestMoves() {
    var b = FB.Store.get('memory.best', 0) || 0;
    return b > 0 ? b : 0;
  }

  function paintBest() {
    var b = bestMoves();
    bestEl.textContent = b > 0 ? b + ' 步' : '—';
  }

  function build() {
    deck = [];
    for (var i = 0; i < PAIRS; i++) {
      deck.push({ key: i, shape: SHAPES[i] });
      deck.push({ key: i, shape: SHAPES[i] });
    }
    shuffle(deck);

    boardEl.style.gridTemplateColumns = 'repeat(' + COLS + ', 1fr)';
    boardEl.innerHTML = deck.map(function (d, idx) {
      var s = d.shape;
      return '<button class="mem-card" data-i="' + idx + '" aria-label="卡片 ' + (idx + 1) + '">' +
        '<span class="mem-inner">' +
          '<span class="mem-face mem-back">' + ICON_BACK + '</span>' +
          '<span class="mem-face mem-front">' +
            '<svg viewBox="0 0 24 24" fill="' + s.c + '">' + s.p + '</svg>' +
          '</span>' +
        '</span>' +
      '</button>';
    }).join('');
  }

  function reset() {
    open = [];
    matched = 0;
    moves = 0;
    lock = false;
    started = false;
    paused = false;
    elapsed = 0;
    startAt = 0;
    clearInterval(tickId); tickId = null;
    movesEl.textContent = '0';
    timeEl.textContent = '0:00';
    leftEl.textContent = '还剩 ' + PAIRS + ' 对';
    overlay.classList.remove('on');
    build();
    paintBest();
  }

  function tick() {
    var sec = elapsed + (started && !paused ? Math.floor((Date.now() - startAt) / 1000) : 0);
    timeEl.textContent = fmtTime(sec);
  }

  function begin() {
    if (started) return;
    started = true;
    startAt = Date.now();
    tickId = setInterval(tick, 250);
  }

  function pause() {
    if (!started || paused) return;
    elapsed += Math.floor((Date.now() - startAt) / 1000);
    paused = true;
    tick();
  }

  function resume() {
    if (!started || !paused) return;
    paused = false;
    startAt = Date.now();
  }

  function usedSeconds() {
    return elapsed + (started && !paused ? Math.floor((Date.now() - startAt) / 1000) : 0);
  }

  function card(i) { return boardEl.querySelector('.mem-card[data-i="' + i + '"]'); }

  function flip(i) {
    if (lock || !deck) return;
    var el = card(i);
    if (!el || el.classList.contains('done') || el.classList.contains('flip')) return;

    begin();
    el.classList.add('flip');
    FB.Sound.play('pop');
    open.push(i);
    if (open.length < 2) return;

    moves++;
    movesEl.textContent = moves;
    var a = open[0], b = open[1];

    if (deck[a].key === deck[b].key) {
      lock = true;
      setTimeout(function () {
        card(a).classList.add('done');
        card(b).classList.add('done');
        matched++;
        leftEl.textContent = matched === PAIRS ? '全部配对完成' : '还剩 ' + (PAIRS - matched) + ' 对';
        FB.Sound.play('good');
        open = [];
        lock = false;
        if (matched === PAIRS) win();
      }, 260);
    } else {
      lock = true;
      card(a).classList.add('wrong');
      card(b).classList.add('wrong');
      FB.Sound.play('bad');
      setTimeout(function () {
        card(a).classList.remove('flip', 'wrong');
        card(b).classList.remove('flip', 'wrong');
        open = [];
        lock = false;
      }, FLIP_BACK_MS);
    }
  }

  function win() {
    clearInterval(tickId); tickId = null;
    var sec = usedSeconds();
    var prev = bestMoves();
    var isNew = prev === 0 || moves < prev;
    if (isNew) FB.Store.set('memory.best', moves);
    paintBest();

    ovTitle.textContent = '全部配对完成';
    ovScore.textContent = moves + ' 步';
    ovSub.textContent = '用时 ' + fmtTime(sec) + (isNew ? ' · 刷新了最佳步数' : ' · 最佳 ' + prev + ' 步');
    setTimeout(function () { overlay.classList.add('on'); }, 320);
    FB.Sound.play('win');
  }

  /* ----------------------- 事件 ----------------------- */

  boardEl.addEventListener('click', function (e) {
    var el = e.target.closest('.mem-card');
    if (!el) return;
    flip(parseInt(el.dataset.i, 10));
  });

  function newGame() {
    FB.Sound.play('click');
    reset();
  }

  document.getElementById('newBtn').addEventListener('click', newGame);
  document.getElementById('ovNew').addEventListener('click', newGame);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'n' || e.key === 'N') newGame();
  });

  FB.Boss.onToggle = function (on) { if (on) pause(); else resume(); };

  reset();
})();
