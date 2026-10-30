// ui/share.js
// 通关后「一键导出分享卡片」：把 3D 截图 + 当日金句 + 一句悬疑口号，合成为竖版分享卡，
// 支持「保存图片」与「分享」（Web Share API，移动端可直接转发到微信等）。
// 纯前端、零外部依赖：卡片用 2D Canvas 离屏合成，离线可用。

// 悬疑口号池（按天确定性选取，部分含 {n} 占位当天天数）
const SLOGANS = [
  '你擦掉的，究竟是污渍，还是昨天的自己？',
  '玻璃干净了，镜子里的你，还认得吗？',
  '第 {n} 天，它一直在玻璃后面，等你发现。',
  '擦到最后，你真的敢直视那句话吗？',
  '有人每天替你留了一句，你却从未擦净看过。',
  '365 天，一天一句，只说给你一个人听。',
  '你以为在擦玻璃，其实在擦掉时间。',
  '有些话，只有把日子擦干净了，才看得见。',
  '今天这块玻璃后面，藏着一个不敢说的秘密。',
  '别急着划走——明天的那句话，看你今天擦不擦。',
];

// 按天确定性选取口号（同一天每次都一样）
export function sloganForDay(day) {
  const s = SLOGANS[((day % SLOGANS.length) + SLOGANS.length) % SLOGANS.length];
  return s.replace('{n}', String(day));
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = src;
  });
}

// 手动圆角路径（避免依赖 ctx.roundRect 的浏览器兼容问题）
function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function wrapText(ctx, text, maxWidth) {
  const chars = Array.from(text);
  const lines = [];
  let cur = '';
  for (const ch of chars) {
    if (ctx.measureText(cur + ch).width > maxWidth && cur) {
      lines.push(cur);
      cur = ch;
    } else {
      cur += ch;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// 合成竖版分享卡（1080×1350，适合朋友圈）。shotDataURL 为 WebGL 画布截图；

export async function buildShareCanvas({ shotDataURL, day, quote, slogan, qrURL }) {
  const W = 1080;
  const H = 1350;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');

  // 背景：深青渐变（让玻璃与金色金句更突出，且显「质感」）
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0e2533');
  bg.addColorStop(1, '#16323f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 顶部柔光
  const glow = ctx.createRadialGradient(W / 2, 360, 40, W / 2, 360, 520);
  glow.addColorStop(0, 'rgba(120,200,200,0.22)');
  glow.addColorStop(1, 'rgba(120,200,200,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 760);

  const serif = '"Songti SC", "STSong", "Noto Serif SC", Georgia, "Times New Roman", serif';
  const sans = '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';

  // 品牌（左上）
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.font = `600 30px ${sans}`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('GlassQuest · 365 擦玻璃', 60, 72);

  // 天数徽标（右上，药丸）
  const badgeText = `DAY ${day}`;
  ctx.font = `700 30px ${sans}`;
  const bw = ctx.measureText(badgeText).width + 44;
  const bx = W - 60 - bw;
  const by = 44;
  ctx.fillStyle = 'rgba(244,207,107,0.16)';
  roundRectPath(ctx, bx, by, bw, 48, 24);
  ctx.fill();
  ctx.fillStyle = '#f4cf6b';
  ctx.fillText(badgeText, bx + 22, by + 33);

  // 主视觉：3D 截图（圆角框、居中靠上）
  const img = await loadImage(shotDataURL);
  const margin = 80;
  const heroW = W - margin * 2;
  const heroTop = 150;
  const heroMaxH = 640;
  const scale = Math.min(heroW / img.width, heroMaxH / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const dx = (W - drawW) / 2;
  const dy = heroTop + (heroMaxH - drawH) / 2;
  ctx.save();
  roundRectPath(ctx, dx, dy, drawW, drawH, 28);
  ctx.clip();
  ctx.drawImage(img, dx, dy, drawW, drawH);
  ctx.restore();
  // 截图描边
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  roundRectPath(ctx, dx, dy, drawW, drawH, 28);
  ctx.stroke();

  // 金句（截图已含 3D 立体字，这里再落一行清晰可读的英文金句，便于朋友圈查看）
  if (quote) {
    ctx.fillStyle = '#f6d98a';
    ctx.font = `600 34px ${serif}`;
    ctx.textAlign = 'center';
    const qLines = wrapText(ctx, quote, W - margin * 2);
    const qStartY = heroTop + heroMaxH + 70;
    qLines.forEach((ln, i) => ctx.fillText(ln, W / 2, qStartY + i * 46));
    ctx.textAlign = 'left';
  }

  // 分隔金线
  const lineY = 980;
  const lg = ctx.createLinearGradient(60, 0, W - 60, 0);
  lg.addColorStop(0, 'rgba(244,207,107,0)');
  lg.addColorStop(0.5, 'rgba(244,207,107,0.7)');
  lg.addColorStop(1, 'rgba(244,207,107,0)');
  ctx.strokeStyle = lg;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(60, lineY);
  ctx.lineTo(W - 60, lineY);
  ctx.stroke();

  // 悬疑口号（核心要求）：大、居中、带氛围
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = `600 40px ${serif}`;
  const sLines = wrapText(ctx, slogan, W - 140);
  const sStartY = lineY + 70;
  sLines.forEach((ln, i) => ctx.fillText(ln, W / 2, sStartY + i * 56));
  ctx.textAlign = 'left';

  // 底部提示（居中）
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = `400 24px ${sans}`;
  ctx.textAlign = 'center';
  ctx.fillText('长按图片即可保存 · 分享给那个每天该看到这句话的人', W / 2, H - 34);
  ctx.textAlign = 'left';

  return c;
}

// 打开分享弹层：生成卡片预览，提供「保存图片 / 分享到朋友圈 / 关闭」
export async function openShareModal({ getShot, day, quote, slogan, qrURL }) {
  if (document.getElementById('shareOverlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'shareOverlay';
  overlay.className = 'share-overlay';
  overlay.innerHTML = '<div class="share-modal"><div class="share-loading">生成分享卡片…</div></div>';
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  try {
    const shot = getShot();
    const canvas = await buildShareCanvas({ shotDataURL: shot, day, quote, slogan, qrURL });
    const modal = overlay.querySelector('.share-modal');
    modal.innerHTML = '';

    const preview = document.createElement('div');
    preview.className = 'share-preview';
    canvas.className = 'share-canvas';
    preview.appendChild(canvas);

    const actions = document.createElement('div');
    actions.className = 'share-actions';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'share-btn primary';
    saveBtn.textContent = '保存图片';
    const shareBtn = document.createElement('button');
    shareBtn.className = 'share-btn';
    shareBtn.textContent = '分享到朋友圈';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'share-btn ghost';
    closeBtn.textContent = '关闭';
    actions.append(saveBtn, shareBtn, closeBtn);

    modal.append(preview, actions);

    const fileName = `GlassQuest-第${day}天.png`;

    saveBtn.addEventListener('click', () => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, 'image/png');
      if (!navigator.canShare) {
        // 桌面端无系统分享，提示去朋友圈手动发布
        window.alert('图片已保存到本地，可前往朋友圈发布～');
      }
    });

    shareBtn.addEventListener('click', async () => {
      try {
        const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
        const file = new File([blob], fileName, { type: 'image/png' });
        const nav = navigator;
        if (nav.canShare && nav.canShare({ files: [file] })) {
          await nav.share({
            files: [file],
            title: `GlassQuest · 第${day}天`,
            text: slogan,
          });
        } else {
          // 不支持系统分享：退回保存
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          window.alert('当前环境暂不支持直接分享，已为你保存图片，可前往朋友圈发布～');
        }
      } catch (e) {
        // 用户取消分享也会进 catch，不报错
        console.warn('[share] 分享取消或失败', e);
      }
    });

    closeBtn.addEventListener('click', close);
  } catch (err) {
    console.error('[share] 生成卡片失败', err);
    overlay.querySelector('.share-modal').innerHTML =
      '<div class="share-loading">生成失败，请重试</div>';
  }
}
