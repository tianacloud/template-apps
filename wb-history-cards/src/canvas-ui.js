function mountCanvas(Core, Config, personal, assets) {
  var Game = function() {
    "use strict";
    var LW = 750, LH = 1334;
    var canvas = null, ctx = null;
    var scale = 1, offX = 0, offY = 0;
    var selCard = null;
    var utilityMode = null;
    var hoverTrait = null, hoverX = 0, hoverY = 0;
    var heroTraitRects = [], hdrTraitRects = [];
    var selFirst = -1;
    var screen = "scenario";
    var pickScenario = null;
    var pickHero = null;
    var toast = "";
    var toastUntil = 0;
    var resultOverlay = null;
    var heroOverlay = null;
    var BX = 50, BY = 140, CELL = 100, GAP = 10;
    var HY = 815, CW = 96, CH = 140, HGAP = 12;
    var BTY = 978, BTW = 94, BTH = 72;
    var BTN1 = { x: 22, y: BTY, w: BTW, h: BTH };
    var BTN2 = { x: 124, y: BTY, w: BTW, h: BTH };
    var BTN3 = { x: 226, y: BTY, w: BTW, h: BTH };
    var BTN4 = { x: 328, y: BTY, w: BTW, h: BTH };
    var BTN5 = { x: 430, y: BTY, w: BTW, h: BTH };
    var BTN6 = { x: 532, y: BTY, w: BTW, h: BTH };
    var BTN7 = { x: 634, y: BTY, w: BTW, h: BTH };
    var C = {
      bg: "#14110d",
      panel: "#1f1a14",
      cell: "#241f18",
      fog: "#100e0b",
      own: "#2f6b3a",
      ownHi: "#57a35f",
      enemy: "#8c2b2b",
      enemyHi: "#c45151",
      neutral: "#4a463f",
      text: "#e8dcc0",
      sub: "#9a8f7c",
      gold: "#e8b64c",
      line: "#3a332a",
      red: "#d9534f"
    };
    var TNAME = {
      POWER: "\u5B9E\u529B",
      DELUSION: "\u5984\u5FF5",
      HINDER: "\u63A3\u8098",
      WEAKNESS: "\u5F31\u70B9",
      TIMING: "\u5929\u65F6",
      TERRAIN: "\u5730\u5229",
      HUMAN: "\u4EBA\u548C",
      VOID: "\u7A7A\u4F4D"
    };
    var IMG = {};
    function imgOf(path) {
      if (!path) return null;
      if (Object.prototype.hasOwnProperty.call(IMG, path)) return IMG[path];
      var im = null;
      if (typeof wx !== "undefined" && wx.createImage) im = wx.createImage();
      else if (typeof Image !== "undefined") im = new Image();
      if (!im) return null;
      IMG[path] = im;
      im.__path = path;
      im.onload = function() {
        im.__ok = true;
      };
      im.onerror = function() {
        im.__bad = true;
      };
      try {
        im.src = assets[path] || path;
      } catch (e) {
        return null;
      }
      return im;
    }
    function drawImg(path, x, y, w, h, radius) {
      var im = imgOf(path);
      if (!im || !im.__ok) return false;
      ctx.save();
      if (radius) {
        roundRect(x, y, w, h, radius);
        ctx.clip();
      }
      ctx.drawImage(im, x, y, w, h);
      ctx.restore();
      return true;
    }
    function placeholder(x, y, w, h, radius, ch, color) {
      ctx.fillStyle = color || "#2a2419";
      roundRect(x, y, w, h, radius || 8);
      ctx.fill();
      ctx.fillStyle = "#6a6155";
      ctx.font = "bold " + Math.floor(Math.min(w, h) * 0.42) + 'px "Microsoft YaHei", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ch || "\uFF1F", x + w / 2, y + h / 2 + 1);
    }
    function wrapText(text, maxW, font) {
      ctx.font = font;
      var lines = [], cur = "";
      for (var i = 0; i < text.length; i++) {
        var t = cur + text.charAt(i);
        if (ctx.measureText(t).width > maxW && cur) {
          lines.push(cur);
          cur = text.charAt(i);
        } else cur = t;
      }
      if (cur) lines.push(cur);
      return lines;
    }
    function boot(cv, opts) {
      canvas = cv;
      ctx = canvas.getContext("2d");
      opts = opts || {};
      if (opts.logical) {
        LW = opts.logical[0];
        LH = opts.logical[1];
      }
      screen = "scenario";
      pickScenario = null;
      pickHero = null;
      bindInput();
      resize();
      requestAnimationFrame(loop);
    }
    function resize() {
      if (!canvas) return;
      if (typeof wx !== "undefined" && wx.getSystemInfoSync) {
        var info = wx.getSystemInfoSync();
        canvas.width = Math.floor(info.windowWidth * info.pixelRatio);
        canvas.height = Math.floor(info.windowHeight * info.pixelRatio);
        scale = Math.min(canvas.width / LW, canvas.height / LH);
        offX = (canvas.width - LW * scale) / 2;
        offY = (canvas.height - LH * scale) / 2;
        return;
      }
      var dpr = typeof window !== "undefined" && window.devicePixelRatio || 1;
      var w = canvas.parentElement?.clientWidth || (typeof window !== "undefined" ? window.innerWidth : LW);
      var h = canvas.parentElement?.clientHeight || (typeof window !== "undefined" ? window.innerHeight : LH);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      if (canvas.style) {
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
      }
      scale = Math.min(canvas.width / LW, canvas.height / LH);
      offX = (canvas.width - LW * scale) / 2;
      offY = (canvas.height - LH * scale) / 2;
    }
    function dprNow() {
      if (typeof wx !== "undefined" && wx.getSystemInfoSync) {
        return wx.getSystemInfoSync().pixelRatio || 1;
      }
      return typeof window !== "undefined" && window.devicePixelRatio || 1;
    }
    function toLogical(clientX, clientY) {
      var dpr = dprNow();
      var rect = canvas.getBoundingClientRect();
      var x = (clientX - rect.left) * dpr, y = (clientY - rect.top) * dpr;
      return { x: (x - offX) / scale, y: (y - offY) / scale };
    }
    function bindInput() {
      if (typeof wx !== "undefined" && wx.onTouchStart) {
        wx.onTouchStart(function(e) {
          var t = e.touches && e.touches[0];
          if (!t) return;
          var p = toLogical(t.clientX, t.clientY);
          tap(p.x, p.y, true);
        });
      } else if (canvas && canvas.addEventListener) {
        canvas.addEventListener("click", function(e) {
          var p = toLogical(e.clientX, e.clientY);
          tap(p.x, p.y, true);
        });
        canvas.addEventListener("mousemove", function(e) {
          var p = toLogical(e.clientX, e.clientY);
          move(p.x, p.y);
        });
        canvas.addEventListener("mouseleave", function() {
          hoverTrait = null;
        });
      }
    }
    function move(lx, ly) {
      hoverX = lx;
      hoverY = ly;
      if (heroOverlay || resultOverlay) {
        hoverTrait = null;
        return;
      }
      var pool = screen === "hero" ? heroTraitRects : screen === "game" ? hdrTraitRects : null;
      hoverTrait = null;
      if (!pool) return;
      for (var i = 0; i < pool.length; i++) {
        var r = pool[i];
        if (lx >= r.x1 && lx <= r.x2 && ly >= r.y1 && ly <= r.y2) {
          hoverTrait = r.name;
          return;
        }
      }
    }
    function tap(lx, ly, alreadyLogical) {
      if (personal.isPending()) return;
      if (!heroOverlay && !resultOverlay && personal.onTap(lx, ly)) return;
      if (heroOverlay) {
        heroOverlay = null;
        return;
      }
      if (screen === "scenario") {
        tapScenario(lx, ly);
        return;
      }
      if (screen === "hero") {
        tapHero(lx, ly);
        return;
      }
      if (resultOverlay) {
        tapResult(lx, ly);
        return;
      }
      if (hdrAvatarHit(lx, ly)) {
        openHeroCard(Core.hero.name);
        return;
      }
      for (var hi2 = 0; hi2 < hdrTraitRects.length; hi2++) {
        var hr2 = hdrTraitRects[hi2];
        if (lx >= hr2.x1 && lx <= hr2.x2 && ly >= hr2.y1 && ly <= hr2.y2) {
          openHeroCard(Core.hero.name);
          return;
        }
      }
      var stacks = handStacks();
      if (stacks.length) {
        var L = handLayout(stacks.length);
        for (var i = 0; i < stacks.length; i++) {
          var cx = L.startX + i * (L.cw + L.gap);
          if (lx >= cx && lx <= cx + L.cw && ly >= HY && ly <= HY + CH) {
            if (utilityMode) {
              var nm = stacks[i].name;
              var fn = utilityMode === "replace" ? Core.replaceCard : Core.destroyCard;
              var rr = fn(nm);
              utilityMode = null;
              if (rr.ok) afterAction();
              else say(rr.msg);
              return;
            }
            selCard = selCard === stacks[i].name ? null : stacks[i].name;
            selFirst = -1;
            if (selCard) {
              var chk = Core.canPlay(selCard);
              if (!chk.ok) {
                say(chk.msg);
                selCard = null;
              } else if (Core.CARDS[selCard] && Core.CARDS[selCard].need === "NONE") {
                var rn = Core.play(selCard, []);
                if (rn.ok) {
                  afterAction();
                } else {
                  say(rn.msg);
                  selCard = null;
                }
              } else if (Core.CARDS[selCard] && Core.CARDS[selCard].need !== "NONE") {
                say("\u8BF7\u9009\u62E9\u76EE\u6807\u683C");
              }
            }
            return;
          }
        }
      }
      if (utilityMode) {
        utilityMode = null;
        say("\u5DF2\u53D6\u6D88");
        return;
      }
      var b = Core.state.boardSize;
      var totalW = b * CELL + (b - 1) * GAP;
      var x0 = (LW - totalW) / 2;
      if (ly >= BY && ly <= BY + b * (CELL + GAP)) {
        var c0 = Math.floor((lx - x0) / (CELL + GAP));
        var r0 = Math.floor((ly - BY) / (CELL + GAP));
        if (c0 >= 0 && c0 < b && r0 >= 0 && r0 < b) {
          onCell(r0 * b + c0);
          return;
        }
      }
      if (hit(BTN1, lx, ly)) return actSurvey();
      if (hit(BTN2, lx, ly)) return actShowdown();
      if (hit(BTN3, lx, ly)) return personal.openRecords();
      if (hit(BTN4, lx, ly)) return actReplace();
      if (hit(BTN5, lx, ly)) return actDestroy();
      if (hit(BTN6, lx, ly)) return actRestart();
      if (hit(BTN7, lx, ly)) return actHome();
    }
    function hit(b, x, y) {
      return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
    }
    function onCell(i) {
      if (!selCard) {
        say("\u5148\u9009\u4E00\u5F20\u624B\u724C");
        return;
      }
      var card = selCard;
      if (Core.CARDS[card].need === "NONE") {
        var r0 = Core.play(card, []);
        if (r0.ok) {
          afterAction();
        } else {
          say(r0.msg);
        }
        return;
      }
      if (card === "\u7528\u95F4") {
        if (selFirst < 0) {
          selFirst = i;
          say("\u7528\u95F4\uFF1A\u8BF7\u518D\u9009\u7B2C\u4E8C\u4E2A\u683C\u5B50");
          return;
        }
        var rf = Core.play("\u7528\u95F4", [selFirst, i]);
        selFirst = -1;
        if (rf.ok) {
          afterAction();
        } else {
          say(rf.msg);
        }
        return;
      }
      var chk = Core.canPlay(card);
      if (!chk.ok) {
        say(chk.msg);
        return;
      }
      var legal = Core.legalTargets(card);
      if (legal.indexOf(i) < 0) {
        say("\u8FD9\u5F20\u724C\u4E0D\u80FD\u6253\u5728\u8FD9\u4E2A\u683C\u5B50\u4E0A");
        return;
      }
      var r = Core.play(card, [i]);
      if (r.ok) {
        afterAction();
      } else {
        say(r.msg);
      }
    }
    function afterAction() {
      selCard = null;
      say(Core.state.lastMsg || "");
      var s = Core.state;
      if (s.actionsLeft <= 0) {
        var tr = Core.endTurn();
        say("\u7B2C " + s.turn + " \u56DE\u5408");
        if (tr && tr.enemyShowdown) {
          showResult(tr.enemyShowdown);
          return;
        }
      }
      if (s.over) showResult(Core.state.result);
    }
    function actSurvey() {
      if (Core.state.over) return;
      var chk = Core.canPlay("\u8C03\u7814");
      if (!chk.ok) {
        say(chk.msg || "\u6CA1\u6709\u53EF\u8C03\u7814\u7684\u96FE\u683C");
        return;
      }
      selCard = "\u8C03\u7814";
      selFirst = -1;
      say("\u8BF7\u9009\u62E9\u8981\u8C03\u7814\u7684\u96FE\u683C");
    }
    function actShowdown() {
      if (Core.state.over) return;
      var r = Core.showdown();
      showResult(r);
    }
    function actReplace() {
      if (Core.state.over) return;
      if (Core.scenario && Core.scenario.isTutorial) {
        say("\u6559\u5B66\u5173\u4E0D\u80FD\u7528\u66FF\u6362");
        return;
      }
      if (!Core.state.hand.length) {
        say("\u6CA1\u6709\u624B\u724C\u53EF\u4EE5\u66FF\u6362");
        return;
      }
      if (utilityMode === "replace") {
        utilityMode = null;
        say("\u5DF2\u53D6\u6D88\u66FF\u6362");
        return;
      }
      utilityMode = "replace";
      selCard = null;
      selFirst = -1;
      say("\u8BF7\u9009\u62E9\u8981\u66FF\u6362\u7684\u624B\u724C\uFF08\u70B9\u7A7A\u767D\u5904\u53D6\u6D88\uFF09");
    }
    function actDestroy() {
      if (Core.state.over) return;
      if (Core.scenario && Core.scenario.isTutorial) {
        say("\u6559\u5B66\u5173\u4E0D\u80FD\u7528\u9500\u6BC1");
        return;
      }
      if (!Core.state.hand.length) {
        say("\u6CA1\u6709\u624B\u724C\u53EF\u4EE5\u9500\u6BC1");
        return;
      }
      if (utilityMode === "destroy") {
        utilityMode = null;
        say("\u5DF2\u53D6\u6D88\u9500\u6BC1");
        return;
      }
      utilityMode = "destroy";
      selCard = null;
      selFirst = -1;
      say("\u8BF7\u9009\u62E9\u8981\u9500\u6BC1\u7684\u624B\u724C\uFF08\u70B9\u7A7A\u767D\u5904\u53D6\u6D88\uFF09");
    }
    function actRestart() {
      var sid = Core.scenario ? Core.scenario.id : "northern_expedition";
      var hn = Core.hero ? Core.hero.name : "\u8BF8\u845B\u4EAE";
      startGame(sid, hn);
      say("\u91CD\u65B0\u5F00\u59CB\uFF1A" + Core.scenario.name + " \xB7 " + Core.hero.name);
    }
    function actHome() {
      screen = "scenario";
      resultOverlay = null;
      selCard = null;
      selFirst = -1;
    }
    function say(m) {
      toast = m;
      toastUntil = Date.now() + 2600;
    }
    function loop() {
      draw();
      requestAnimationFrame(loop);
    }
    function traitLineRects(names, cx, y, font, leftAligned) {
      ctx.font = font;
      var sep = " \xB7 ";
      var sepW = ctx.measureText(sep).width;
      var ws = [], total = 0, i;
      for (i = 0; i < names.length; i++) {
        ws.push(ctx.measureText(names[i]).width);
        total += ws[i];
      }
      total += sepW * Math.max(0, names.length - 1);
      var x = leftAligned ? cx : cx - total / 2, out = [];
      for (i = 0; i < names.length; i++) {
        out.push({ name: names[i], x1: x, x2: x + ws[i], y1: y - 17, y2: y + 8 });
        x += ws[i] + sepW;
      }
      return out;
    }
    function drawTraitTip() {
      if (!hoverTrait || heroOverlay || resultOverlay) return;
      var desc = Config.TRAITS[hoverTrait] || "\uFF08\u65E0\u8BF4\u660E\uFF09";
      var font = '17px "Microsoft YaHei", sans-serif';
      var lines = wrapText(desc, 300, font);
      var w = 340;
      var h = 58 + lines.length * 24;
      var x = Math.min(Math.max(10, hoverX + 18), LW - w - 10);
      var y = Math.min(Math.max(10, hoverY + 20), LH - h - 10);
      ctx.fillStyle = "rgba(16,14,11,0.96)";
      roundRect(x, y, w, h, 10);
      ctx.fill();
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 1;
      roundRect(x, y, w, h, 10);
      ctx.stroke();
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = C.gold;
      ctx.font = 'bold 19px "Microsoft YaHei", sans-serif';
      ctx.fillText(hoverTrait, x + 16, y + 30);
      ctx.fillStyle = C.sub;
      ctx.font = font;
      for (var i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x + 16, y + 58 + i * 24);
      }
    }
    function draw() {
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale, 0, 0, scale, offX, offY);
      if (screen === "scenario") {
        drawScenarioSelect();
        personal.drawEntry(ctx);
        return;
      }
      if (screen === "hero") {
        drawHeroSelect();
        personal.drawEntry(ctx);
        if (heroOverlay) drawHeroOverlay();
        drawTraitTip();
        return;
      }
      var s = Core.state;
      if (!s) return;
      drawHeader(s);
      drawBoard(s);
      drawHand(s);
      drawButtons(s);
      drawFooter(s);
      personal.drawEntry(ctx);
      if (resultOverlay) drawResultOverlay();
      if (heroOverlay) drawHeroOverlay();
      drawTraitTip();
    }
    function drawHeroOverlay() {
      var ov = heroOverlay;
      if (!ov) return;
      var W2 = 600, PAD = 44, BODY_FONT = '18px "Microsoft YaHei", sans-serif';
      var blocks = [], bodyH = 0;
      for (var bi = 0; bi < ov.traits.length; bi++) {
        var lines = wrapText(ov.traits[bi].d, W2 - PAD * 2, BODY_FONT);
        blocks.push({ n: ov.traits[bi].n, lines });
        bodyH += 30 + lines.length * 26 + 24;
      }
      var H2 = 76 + bodyH + 56;
      var x = (LW - W2) / 2, y = (LH - H2) / 2;
      ctx.fillStyle = "rgba(8,7,6,0.86)";
      ctx.fillRect(0, 0, LW, LH);
      ctx.fillStyle = C.panel;
      roundRect(x, y, W2, H2, 16);
      ctx.fill();
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 2;
      roundRect(x, y, W2, H2, 16);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = C.gold;
      ctx.font = 'bold 30px "Microsoft YaHei", sans-serif';
      ctx.fillText(ov.name, x + W2 / 2, y + 44);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      var ty = y + 100;
      for (var i = 0; i < blocks.length; i++) {
        var b = blocks[i];
        ctx.fillStyle = C.text;
        ctx.font = 'bold 22px "Microsoft YaHei", sans-serif';
        ctx.fillText(b.n, x + PAD, ty);
        ctx.fillStyle = C.sub;
        ctx.font = BODY_FONT;
        for (var k = 0; k < b.lines.length; k++) {
          ctx.fillText(b.lines[k], x + PAD, ty + 30 + k * 26);
        }
        ty += 30 + b.lines.length * 26 + 24;
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#5a5348";
      ctx.font = '16px "Microsoft YaHei", sans-serif';
      ctx.fillText("\u70B9\u4EFB\u610F\u5904\u5173\u95ED", x + W2 / 2, y + H2 - 28);
    }
    var SC_COLS = 3, SC_CW = 220, SC_IMG_H = 124, SC_NAME_H = 36, SC_CH = SC_IMG_H + SC_NAME_H;
    var SC_GAP = 14, SC_Y = 168;
    function scRect(i) {
      var x0 = (LW - (SC_COLS * SC_CW + (SC_COLS - 1) * SC_GAP)) / 2;
      var r = Math.floor(i / SC_COLS), c = i % SC_COLS;
      return { x: x0 + c * (SC_CW + SC_GAP), y: SC_Y + r * (SC_CH + SC_GAP), w: SC_CW, h: SC_CH };
    }
    function drawScenarioSelect() {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = C.text;
      ctx.font = 'bold 42px "Microsoft YaHei", sans-serif';
      ctx.fillText("\u5FAE \xB7 \u5371", LW / 2, 74);
      ctx.fillStyle = C.sub;
      ctx.font = '20px "Microsoft YaHei", sans-serif';
      ctx.fillText("\u9009\u62E9\u4E00\u4E2A\u5267\u672C", LW / 2, 118);
      var list = Config.SCENARIOS;
      for (var i = 0; i < list.length; i++) {
        var s = list[i], r = scRect(i);
        ctx.fillStyle = C.panel;
        roundRect(r.x, r.y, r.w, r.h, 12);
        ctx.fill();
        var okImg = drawImg(Config.scenarioImageOf(s.id), r.x, r.y, r.w, SC_IMG_H, 12);
        if (!okImg) placeholder(r.x, r.y, r.w, SC_IMG_H, 12, s.name.charAt(0), "#2f3a2c");
        ctx.save();
        roundRect(r.x, r.y, r.w, r.h, 12);
        ctx.clip();
        ctx.fillStyle = "#221d16";
        ctx.fillRect(r.x, r.y + SC_IMG_H, r.w, SC_NAME_H);
        ctx.restore();
        ctx.fillStyle = C.text;
        ctx.font = 'bold 19px "Microsoft YaHei", sans-serif';
        ctx.textAlign = "center";
        ctx.fillText(s.name, r.x + r.w / 2, r.y + SC_IMG_H + SC_NAME_H / 2 + 1);
        ctx.strokeStyle = C.line;
        ctx.lineWidth = 1;
        roundRect(r.x, r.y, r.w, r.h, 12);
        ctx.stroke();
      }
      ctx.fillStyle = "#5a5348";
      ctx.font = '16px "Microsoft YaHei", sans-serif';
      ctx.fillText("\u5171 " + list.length + " \u4E2A\u5267\u672C\u3000\xB7\u3000\u70B9\u5361\u7247\u8FDB\u5165", LW / 2, SC_Y + 5 * (SC_CH + SC_GAP) + 14);
      ctx.fillStyle = "#6a6155";
      ctx.font = '13px "Microsoft YaHei", sans-serif';
      ctx.fillText("\u53D6\u6750\u53F2\u4E66\uFF0C\u4EBA\u7269\u4E0E\u4E8B\u4EF6\u4E3A\u5386\u53F2\u6F14\u7ECE", LW / 2, SC_Y + 5 * (SC_CH + SC_GAP) + 42);
    }
    function tapScenario(x, y) {
      var list = Config.SCENARIOS;
      for (var i = 0; i < list.length; i++) {
        var r = scRect(i);
        if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
          pickScenario = list[i].id;
          pickHero = null;
          screen = "hero";
          return;
        }
      }
    }
    var HE_COLS = 4, HE_CW = 160, HE_CH = 160, HE_GAP = 10, HE_Y = 194;
    var HE_AVA = 56;
    function heRect(i) {
      var x0 = (LW - (HE_COLS * HE_CW + (HE_COLS - 1) * HE_GAP)) / 2;
      var r = Math.floor(i / HE_COLS), c = i % HE_COLS;
      return { x: x0 + c * (HE_CW + HE_GAP), y: HE_Y + r * (HE_CH + HE_GAP), w: HE_CW, h: HE_CH };
    }
    function heTraitHit(i, x, y) {
      var r = heRect(i);
      return x >= r.x && x <= r.x + r.w && y >= r.y + 104 && y <= r.y + 130;
    }
    function drawAvatar(name, x, y, size) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      var okA = drawImg(Config.avatarOf(name), x, y, size, size, 0);
      if (!okA) {
        ctx.fillStyle = "#2c2620";
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = "#7b7160";
        ctx.font = "bold " + Math.floor(size * 0.42) + 'px "Microsoft YaHei", sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(name.charAt(0), x + size / 2, y + size / 2 + 1);
      }
      ctx.restore();
    }
    function drawHeroSelect() {
      heroTraitRects = [];
      var sc = Config.scenarioById(pickScenario);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = C.text;
      ctx.font = 'bold 34px "Microsoft YaHei", sans-serif';
      ctx.fillText("\u9009\u62E9\u82F1\u96C4", LW / 2, 88);
      ctx.fillStyle = C.sub;
      ctx.font = '18px "Microsoft YaHei", sans-serif';
      ctx.fillText("\u5267\u672C\uFF1A" + (sc ? sc.name : ""), LW / 2, 128);
      ctx.fillStyle = "#2a2419";
      roundRect(24, 24, 120, 56, 10);
      ctx.fill();
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1;
      roundRect(24, 24, 120, 56, 10);
      ctx.stroke();
      ctx.fillStyle = C.gold;
      ctx.font = '20px "Microsoft YaHei", sans-serif';
      ctx.fillText("\u8FD4\u56DE", 84, 53);
      var list = Config.HEROES;
      for (var i = 0; i < list.length; i++) {
        var h = list[i], r = heRect(i);
        var allowed = Core.canPickHero(pickScenario, h.name);
        ctx.fillStyle = C.panel;
        roundRect(r.x, r.y, r.w, r.h, 12);
        ctx.fill();
        ctx.strokeStyle = C.line;
        ctx.lineWidth = 1;
        roundRect(r.x, r.y, r.w, r.h, 12);
        ctx.stroke();
        drawAvatar(h.name, r.x + (r.w - HE_AVA) / 2, r.y + 10, HE_AVA);
        if (!allowed) {
          ctx.fillStyle = "rgba(20,17,13,0.55)";
          ctx.beginPath();
          ctx.arc(r.x + r.w / 2, r.y + 10 + HE_AVA / 2, HE_AVA / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = !allowed ? "#4a443a" : C.text;
        ctx.font = 'bold 20px "Microsoft YaHei", sans-serif';
        ctx.fillText(h.name, r.x + r.w / 2, r.y + 90);
        var line = h.traits.join("\xB7");
        var fs = line.length > 11 ? 12 : 14;
        ctx.fillStyle = !allowed ? "#3f3a32" : "#8d8371";
        ctx.font = fs + 'px "Microsoft YaHei", sans-serif';
        ctx.fillText(line, r.x + r.w / 2, r.y + 118);
        var trRects = traitLineRects(h.traits, r.x + r.w / 2, r.y + 118, '15px "Microsoft YaHei", sans-serif');
        for (var ti = 0; ti < trRects.length; ti++) heroTraitRects.push(trRects[ti]);
        ctx.fillStyle = "#5f574a";
        ctx.font = '11px "Microsoft YaHei", sans-serif';
        ctx.fillText("\u70B9\u7279\u6027\u770B\u8BF4\u660E", r.x + r.w / 2, r.y + 142);
      }
      ctx.fillStyle = "#5a5348";
      ctx.font = '16px "Microsoft YaHei", sans-serif';
      ctx.fillText("\u5171 " + list.length + " \u4F4D\u82F1\u96C4\u3000\xB7\u3000\u70B9\u4E00\u4F4D\u8FDB\u5165", LW / 2, HE_Y + 6 * (HE_CH + HE_GAP) + 12);
    }
    function openHeroCard(name) {
      var h = Config.heroByName(name);
      if (!h) return;
      heroOverlay = {
        name: h.name,
        traits: h.traits.map(function(t) {
          return { n: t, d: Config.TRAITS[t] || "" };
        })
      };
    }
    function tapHero(x, y) {
      if (heroOverlay) {
        heroOverlay = null;
        return;
      }
      if (x >= 24 && x <= 144 && y >= 24 && y <= 80) {
        screen = "scenario";
        return;
      }
      var list = Config.HEROES;
      for (var i = 0; i < list.length; i++) {
        var r = heRect(i);
        if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
          if (!Core.canPickHero(pickScenario, list[i].name)) {
            say("\u6559\u5B66\u5173\u53EA\u80FD\u9009\u97E9\u4FE1");
            return;
          }
          if (heTraitHit(i, x, y)) {
            openHeroCard(list[i].name);
            return;
          }
          pickHero = list[i].name;
          startGame(pickScenario, pickHero);
          return;
        }
      }
    }
    function startGame(scenarioId, heroName) {
      Core.newGame(scenarioId, heroName);
  
      screen = "game";
      selCard = null;
      selFirst = -1;
      utilityMode = null;
      resultOverlay = null;
      say(Core.scenario.name + " \xB7 " + Core.hero.name);
    }
    var HDR_AVA = 60, HDR_AVA_X = 36, HDR_AVA_Y = 18;
    function hdrAvatarHit(x, y) {
      var dx = x - (HDR_AVA_X + HDR_AVA / 2), dy = y - (HDR_AVA_Y + HDR_AVA / 2);
      return dx * dx + dy * dy <= (HDR_AVA / 2 + 6) * (HDR_AVA / 2 + 6);
    }
    function drawHeader(s) {
      var rt = Core.realtime();
      ctx.textBaseline = "alphabetic";
      var heroName = Core.hero ? Core.hero.name : "";
      drawAvatar(heroName, HDR_AVA_X, HDR_AVA_Y, HDR_AVA);
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(HDR_AVA_X + HDR_AVA / 2, HDR_AVA_Y + HDR_AVA / 2, HDR_AVA / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.textAlign = "left";
      ctx.fillStyle = C.text;
      ctx.font = 'bold 26px "Microsoft YaHei", sans-serif';
      ctx.fillText(Core.SCENARIO.name, 112, 46);
      ctx.fillStyle = C.sub;
      ctx.font = '17px "Microsoft YaHei", sans-serif';
      ctx.fillText(heroName + "\u3000\xB7\u3000\u7B2C " + s.turn + " \u56DE\u5408\u3000\xB7\u3000\u724C\u5E93 " + s.deck.length, 112, 71);
      var trs = Core.hero && Core.hero.traits ? Core.hero.traits : [];
      ctx.fillStyle = "#8d8371";
      ctx.font = '15px "Microsoft YaHei", sans-serif';
      ctx.fillText(trs.join(" \xB7 "), 112, 95);
      hdrTraitRects = traitLineRects(trs, 112, 95, '15px "Microsoft YaHei", sans-serif', true);
      ctx.textAlign = "right";
      ctx.fillStyle = C.ownHi;
      ctx.font = 'bold 44px "Microsoft YaHei", sans-serif';
      ctx.fillText(rt.own.toFixed(1), 520, 66);
      ctx.fillStyle = C.sub;
      ctx.font = '20px "Microsoft YaHei", sans-serif';
      ctx.fillText("\u6211\u65B9", 520, 92);
      ctx.fillStyle = C.enemyHi;
      ctx.font = 'bold 44px "Microsoft YaHei", sans-serif';
      ctx.fillText(rt.enemy.toFixed(1), 700, 66);
      ctx.fillStyle = rt.enemyFoggedCount > 0 ? "#b08a4a" : C.sub;
      ctx.font = '20px "Microsoft YaHei", sans-serif';
      ctx.fillText(rt.enemyFoggedCount > 0 ? "\u654C\u65B9\xB7\u96FE\u4E2D\u672A\u8BA1" : "\u654C\u65B9", 700, 92);
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 112);
      ctx.lineTo(710, 112);
      ctx.stroke();
    }
    function drawBoard(s) {
      var legal = selCard && selCard !== "\u7528\u95F4" ? Core.legalTargets(selCard) : [];
      var b = s.boardSize;
      var totalW = b * CELL + (b - 1) * GAP;
      var x0 = (LW - totalW) / 2;
      for (var r = 0; r < b; r++) {
        for (var c = 0; c < b; c++) {
          drawCell(s, r * b + c, x0 + c * (CELL + GAP), BY + r * (CELL + GAP), legal);
        }
      }
    }
    function cellTone(cell) {
      if (!cell) return "neutral";
      if (cell.fog) return "fog";
      var t = cell.t, f = cell.f;
      if (f === "NEUTRAL") return "neutral";
      if (f === "OWN") {
        if (t === "HINDER") return "bad";
        if (t === "DELUSION" && cell.revealed) return "bad";
        return "good";
      }
      if (f === "ENEMY") {
        if (t === "WEAKNESS" || t === "DELUSION") return "good";
        return "bad";
      }
      return "neutral";
    }
    function cellColor(cell) {
      var tone = cellTone(cell);
      if (tone === "fog") return C.fog;
      if (tone === "good") return C.own;
      if (tone === "bad") return C.enemy;
      return C.neutral;
    }
    function drawCell(s, i, x, y, legal) {
      var cell = s.board[i];
      var sel = legal.indexOf(i) >= 0;
      ctx.fillStyle = cellColor(cell);
      roundRect(x, y, CELL, CELL, 10);
      ctx.fill();
      if (cell.t === "TIMING" && cell.shine && !cell.fog) {
        ctx.strokeStyle = C.gold;
        ctx.lineWidth = 3;
        roundRect(x, y, CELL, CELL, 10);
        ctx.stroke();
      } else if (sel) {
        ctx.strokeStyle = C.gold;
        ctx.lineWidth = 3;
        roundRect(x, y, CELL, CELL, 10);
        ctx.stroke();
      } else {
        ctx.strokeStyle = C.line;
        ctx.lineWidth = 1;
        roundRect(x, y, CELL, CELL, 10);
        ctx.stroke();
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (cell.fog) {
        ctx.fillStyle = "#3a332a";
        ctx.font = '36px "Microsoft YaHei", sans-serif';
        ctx.fillText("?", x + CELL / 2, y + CELL / 2);
        return;
      }
      if (cell.t === "VOID") {
        ctx.fillStyle = "#5a5449";
        ctx.font = '18px "Microsoft YaHei", sans-serif';
        ctx.fillText("\u7A7A\u4F4D", x + CELL / 2, y + CELL / 2);
        return;
      }
      var disguise = cell.t === "DELUSION" && cell.f === "OWN" && !cell.revealed;
      var showT = disguise ? "POWER" : cell.t;
      ctx.fillStyle = "rgba(238,228,204,0.94)";
      ctx.font = 'bold 22px "Microsoft YaHei", sans-serif';
      ctx.fillText(TNAME[showT] || "?", x + CELL / 2, y + 27);
      ctx.fillStyle = C.text;
      ctx.font = 'bold 36px "Microsoft YaHei", sans-serif';
      ctx.fillText(String(cell.lv), x + CELL / 2, y + 64);
      if (cell.t === "DELUSION" && cell.f === "OWN" && cell.revealed) {
        ctx.fillStyle = "#ffb3a0";
        ctx.font = '14px "Microsoft YaHei", sans-serif';
        ctx.fillText("\u5984", x + CELL / 2, y + 91);
      }
    }
    var SHORT = {
      "\u84C4\u529B": "+1\u6863",
      "\u5F15\u5BFC": "\u4E2D\u7ACB\u2192\u5DF1",
      "\u8F6C\u5316": "\u654C\u2192\u4E2D\u7ACB",
      "\u524A\u5F31": "\u654C-1",
      "\u4FEE\u5FC3": "\u6D88\u5984\u5FF5",
      "\u6311\u62E8": "\u654C\u5984+1",
      "\u6E05\u7406": "\u6E05\u63A3\u8098",
      "\u5229\u7528": "\u5F31\u70B9+1",
      "\u6B63\u9053": "\u751F\u724C",
      "\u5947\u8C0B": "\u5220\u724C",
      "\u7528\u95F4": "\u6362\u4F4D"
    };
    function handLayout(n) {
      var areaX = 40, areaW = 670, gap = 10;
      var cw = Math.min(CW, (areaW - gap * (n - 1)) / n);
      var totalW = cw * n + gap * (n - 1);
      return { cw, gap, startX: areaX + (areaW - totalW) / 2, totalW };
    }
    function handStacks() {
      var s = Core.state, order = [], map = {};
      for (var i = 0; i < s.hand.length; i++) {
        var c = s.hand[i];
        if (!map[c]) {
          map[c] = { name: c, count: 0 };
          order.push(map[c]);
        }
        map[c].count++;
      }
      return order;
    }
    function handPlayable(stacks) {
      var out = [];
      for (var i = 0; i < stacks.length; i++) out.push(Core.canPlay(stacks[i].name).ok);
      return out;
    }
    function drawHand(s) {
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = C.sub;
      ctx.font = '16px "Microsoft YaHei", sans-serif';
      ctx.fillText("\u624B\u724C " + s.hand.length + "/" + s.handLimit, 40, HY - 6);
      if (utilityMode) {
        ctx.textAlign = "right";
        ctx.fillStyle = C.gold;
        ctx.font = '16px "Microsoft YaHei", sans-serif';
        ctx.fillText((utilityMode === "replace" ? "\u9009\u4E00\u5F20\u724C\u66FF\u6362" : "\u9009\u4E00\u5F20\u724C\u9500\u6BC1") + "\uFF08\u70B9\u7A7A\u767D\u53D6\u6D88\uFF09", 710, HY - 6);
        ctx.textAlign = "left";
      }
      var stacks = handStacks();
      var n = stacks.length;
      if (n === 0) return;
      var L = handLayout(n);
      var can = handPlayable(stacks);
      for (var i = 0; i < n; i++) {
        var card = stacks[i].name;
        var x = L.startX + i * (L.cw + L.gap), y = HY;
        var on = card === selCard;
        var dead = !can[i] && !utilityMode;
        ctx.fillStyle = on ? "#3a2f1e" : dead ? "#1a1815" : C.panel;
        roundRect(x, y, L.cw, CH, 10);
        ctx.fill();
        ctx.strokeStyle = on ? C.gold : C.line;
        ctx.lineWidth = on ? 3 : 1;
        roundRect(x, y, L.cw, CH, 10);
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = on ? C.gold : dead ? "#5a5145" : C.text;
        ctx.font = "bold " + (n > 6 ? 24 : 26) + 'px "Microsoft YaHei", sans-serif';
        ctx.fillText(card.charAt(0), x + L.cw / 2, y + 44);
        ctx.fillText(card.charAt(1), x + L.cw / 2, y + 80);
        ctx.fillStyle = dead ? "#4a4238" : C.sub;
        ctx.font = (n > 6 ? 14 : 15) + 'px "Microsoft YaHei", sans-serif';
        ctx.fillText(SHORT[card] || "", x + L.cw / 2, y + 114);
        if (stacks[i].count > 1) {
          var bx = x + L.cw - 12, by = y + 12;
          ctx.fillStyle = C.gold;
          ctx.beginPath();
          ctx.arc(bx, by, 15, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#1a1510";
          ctx.font = 'bold 18px "Microsoft YaHei", sans-serif';
          ctx.fillText(stacks[i].count, bx, by + 1);
        }
      }
    }
    function drawButtons(s) {
      var tut = !!(Core.scenario && Core.scenario.isTutorial);
      button(BTN1, "\u8C03\u3000\u7814", "#5b8ec9", s.over);
      button(BTN2, "\u644A\u3000\u724C", C.gold, s.over);
      button(BTN3, "\u5B58\u3000\u6863", "#5b8ec9", false);
      button(BTN4, "\u66FF\u3000\u6362", utilityMode === "replace" ? C.gold : "#6b6b6b", s.over || tut);
      button(BTN5, "\u9500\u3000\u6BC1", utilityMode === "destroy" ? C.gold : "#6b6b6b", s.over || tut);
      button(BTN6, "\u91CD\u3000\u5F00", "#6b6b6b", false);
      button(BTN7, "\u4E3B\u754C\u9762", "#6b6b6b", false);
    }
    function button(b, label, color, disabled) {
      ctx.fillStyle = disabled ? "#2a2a2a" : color;
      roundRect(b.x, b.y, b.w, b.h, 12);
      ctx.fill();
      ctx.fillStyle = disabled ? "#666" : "#14110d";
      ctx.font = 'bold 26px "Microsoft YaHei", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, b.x + b.w / 2, b.y + b.h / 2);
    }
    function drawFooter(s) {
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = C.sub;
      ctx.font = '20px "Microsoft YaHei", sans-serif';
      var msgTime = Date.now() < toastUntil ? toast : "";
      var line1 = msgTime || "\u70B9\u624B\u724C \u2192 \u70B9\u68CB\u76D8\u76EE\u6807\u683C";
      ctx.fillText(line1, 40, 1090);
      var own = Core.calcSide("OWN", true);
      var parts = ["\u5B9E\u529B" + own.base, "\u8FDE\u63A5+" + own.conn, "\u5984\u5FF5-" + own.delusion, "\u63A3\u8098-" + own.debuff, "\u5730\u5229+" + own.terrain];
      var mult = "\xD7" + own.mult.toFixed(2) + (own.shine ? "\uFF08\u5929\u65F6\u95EA\u8000\uFF09" : "");
      ctx.fillStyle = "#7a7160";
      ctx.font = '18px "Microsoft YaHei", sans-serif';
      ctx.fillText(parts.join("\u3000"), 40, 1124);
      ctx.fillText(mult + "\u3000\uFF1D " + own.total.toFixed(1), 40, 1152);
      var remain = s.actionsLeft;
      ctx.fillStyle = remain > 0 ? C.ownHi : C.sub;
      ctx.fillText(remain > 0 ? "\u672C\u56DE\u5408\u8FD8\u53EF\u51FA " + remain + " \u5F20\u724C" : "\u672C\u56DE\u5408\u5DF2\u884C\u52A8\uFF0C\u654C\u65B9\u5DF2\u54CD\u5E94", 40, 1180);
    }
    function showResult(r) {
      if (!r) return;
      resultOverlay = {
        status: r.status,
        text: r.text,
        detail: r
      };
    }
    function resultGeom() {
      var r = resultOverlay;
      var hist = "";
      if (r && (r.status === "victory" || r.status === "decisive")) {
        hist = Config.historyOf(Core.SCENARIO.id) || "";
      }
      var lines = hist ? wrapText(hist, 500, '18px "Microsoft YaHei", sans-serif') : [];
      var panelH = lines.length ? 620 + 40 + lines.length * 24 : 620;
      var py = 950 - panelH;
      return { py, h: panelH, hist, lines };
    }
    function drawResultOverlay() {
      var r = resultOverlay;
      var d = r.detail || {};
      var g = resultGeom();
      var py = g.py;
      var hasNum = typeof d.ownFinal === "number" && typeof d.enemyFinal === "number";
      var good = r.status === "victory" || r.status === "decisive" || r.status === "enemySetback";
      ctx.fillStyle = "rgba(0,0,0,0.88)";
      ctx.fillRect(0, 0, LW, LH);
      ctx.fillStyle = C.panel;
      roundRect(80, py, 590, g.h, 20);
      ctx.fill();
      ctx.strokeStyle = good ? C.gold : C.red;
      ctx.lineWidth = 2;
      roundRect(80, py, 590, g.h, 20);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = good ? C.gold : C.red;
      ctx.font = 'bold 44px "Microsoft YaHei", sans-serif';
      ctx.fillText(r.text || "\u65E0\u6CD5\u644A\u724C", 375, py + 80);
      var sub = {
        victory: "\u644A\u724C\u80DC",
        decisive: "\u72C2\u80DC",
        setback: "\u644A\u724C\u53D7\u632B",
        defeat: "\u644A\u724C\u8D25",
        enemySetback: "\u654C\u65B9\u653B\u52BF\u53D7\u632B",
        blocked: "\u65E0\u6CD5\u644A\u724C"
      }[r.status] || "";
      ctx.fillStyle = C.sub;
      ctx.font = '22px "Microsoft YaHei", sans-serif';
      ctx.fillText(sub, 375, py + 122);
      if (hasNum) {
        ctx.fillStyle = C.text;
        ctx.font = '24px "Microsoft YaHei", sans-serif';
        ctx.fillText("\u6211\u65B9 " + d.ownFinal.toFixed(1) + "\u3000\uFF1A\u3000\u654C\u65B9 " + d.enemyFinal.toFixed(1), 375, py + 190);
        ctx.fillStyle = C.sub;
        ctx.font = '19px "Microsoft YaHei", sans-serif';
        if (d.own) {
          ctx.fillText("\u6211\u65B9\uFF1A\u57FA\u7840" + d.own.base + " \u8FDE\u63A5+" + d.own.conn + " \u5984\u5FF5-" + d.own.delusion + " \u63A3\u8098-" + d.own.debuff, 375, py + 230);
          ctx.fillText("\u3000\u3000\u3000\u5730\u5229+" + d.own.terrain + " \xD7" + d.own.mult.toFixed(2), 375, py + 258);
        }
        if (d.enemy) {
          ctx.fillText("\u654C\u65B9\uFF1A\u57FA\u7840" + d.enemy.base + " \u8FDE\u63A5+" + d.enemy.conn + " \u5984\u5FF5-" + d.enemy.delusion + " \u5F31\u70B9-" + d.enemy.debuff, 375, py + 294);
          ctx.fillText("\u3000\u3000\u3000\u5730\u5229+" + d.enemy.terrain + " \xD7" + d.enemy.mult.toFixed(2), 375, py + 322);
        }
        if (r.status === "setback" || r.status === "enemySetback") {
          ctx.fillStyle = "#e0894c";
          ctx.fillText("\u5DF1\u65B9\u635F\u5931 " + (d.ownLoss || 0) + " \u6863\u3000\u654C\u65B9\u635F\u5931 " + (d.enemyLoss || 0) + " \u6863", 375, py + 362);
        }
      } else {
        ctx.fillStyle = C.sub;
        ctx.font = '22px "Microsoft YaHei", sans-serif';
        ctx.fillText(d.msg || "\u672C\u5267\u672C\u4E0D\u80FD\u4E3B\u52A8\u644A\u724C", 375, py + 210);
      }
      if (g.lines.length) {
        ctx.fillStyle = C.gold;
        ctx.font = 'bold 20px "Microsoft YaHei", sans-serif';
        ctx.fillText("\u53F2\u6599", 375, py + 400);
        ctx.fillStyle = C.sub;
        ctx.font = '18px "Microsoft YaHei", sans-serif';
        for (var i = 0; i < g.lines.length; i++) {
          ctx.fillText(g.lines[i], 375, py + 432 + i * 24);
        }
      }
      if (r.status === "setback" || r.status === "enemySetback") {
        btn(250, 740, 220, 70, "\u7EE7\u7EED\u8FD0\u7B79", C.gold, function() {
          resultOverlay = null;
        });
      } else if (r.status === "blocked") {
        btn(250, 740, 220, 70, "\u77E5\u9053\u4E86", C.gold, function() {
          resultOverlay = null;
        });
      } else {
        btn(140, 740, 220, 70, "\u91CD\u65B0\u5F00\u59CB", C.gold, function() {
          actRestart();
        });
        btn(390, 740, 220, 70, "\u56DE\u770B\u68CB\u76D8", "#6b6b6b", function() {
          resultOverlay = null;
        });
      }
      ctx.fillStyle = "#7a7160";
      ctx.font = '18px "Microsoft YaHei", sans-serif';
      ctx.fillText("\u644A\u724C\u540E\u5168\u76D8\u53BB\u96FE\u3002\u4E2D\u7ACB\u5B9E\u529B 50% \u4E0D\u53D8 / 25% \u5F52\u5DF1 / 25% \u5F52\u654C\u3002", 375, 900);
    }
    function tapResult(lx, ly) {
      var r = resultOverlay;
      if (r.status === "setback" || r.status === "enemySetback") {
        if (inRect(lx, ly, 250, 740, 220, 70)) {
          resultOverlay = null;
        }
      } else if (r.status === "blocked") {
        if (inRect(lx, ly, 250, 740, 220, 70)) {
          resultOverlay = null;
        }
      } else {
        if (inRect(lx, ly, 140, 740, 220, 70)) {
          actRestart();
        } else if (inRect(lx, ly, 390, 740, 220, 70)) {
          resultOverlay = null;
        }
      }
    }
    function inRect(x, y, rx, ry, rw, rh) {
      return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
    }
    function btn(x, y, w, h, label, color, cb) {
      ctx.fillStyle = color;
      roundRect(x, y, w, h, 12);
      ctx.fill();
      ctx.fillStyle = "#14110d";
      ctx.font = 'bold 24px "Microsoft YaHei", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x + w / 2, y + h / 2);
    }
    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
    return { boot, resize, getView: () => ({ screen, selCard, resultOverlay: resultOverlay ? { status: resultOverlay.status, text: resultOverlay.text } : null, heroOverlay: heroOverlay ? { name: heroOverlay.name } : null, toast: Date.now() < toastUntil ? toast : "" }), resume: () => {
      screen = "game";
      selCard = null;
      selFirst = -1;
      utilityMode = null;
      heroOverlay = null;
      resultOverlay = null;
      say("\u5B58\u6863\u5DF2\u6062\u590D");
    } };
  }();
  return Game;
}
export {
  mountCanvas
};
