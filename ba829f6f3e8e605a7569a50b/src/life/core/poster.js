/**
 * core/poster.js —— 结局海报绘制
 * 一份代码，同时服务小程序 canvas 2d 和浏览器 canvas。
 *
 * 用法：
 *   drawPoster(ctx, 750, 1334, data)
 * data 由 buildPosterData(life, result) 生成。
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.LifePoster = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const W = 750
  const H = 1334
  const PAD = 64

  const C = {
    bg: '#f6f3ee',
    card: '#fffdfa',
    ink: '#1c1a17',
    ink2: '#4a443c',
    muted: '#8a837a',
    faint: '#b3a99b',
    line: '#e6ded1',
    line2: '#ece5d9',
    accent: '#a8442a'
  }

  const SERIF = '"Songti SC","SimSun","STSong","Noto Serif CJK SC",serif'
  const SANS = '-apple-system,"PingFang SC","Helvetica Neue","Microsoft YaHei",sans-serif'

  function font(size, weight, family) {
    return `${weight || 'normal'} ${size}px ${family || SANS}`
  }

  /* ---------------- 基础绘制 ---------------- */

  function spacedText(ctx, text, x, y, spacing) {
    let cx = x
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      ctx.fillText(ch, cx, y)
      cx += ctx.measureText(ch).width + spacing
    }
    return cx
  }

  /**
   * 自动换行，返回结束时的 y 坐标
   */
  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const chars = String(text).split('')
    let line = ''
    let lines = 0
    let lastY = y

    for (let i = 0; i < chars.length; i++) {
      const test = line + chars[i]
      if (ctx.measureText(test).width > maxWidth && line) {
        if (maxLines && lines >= maxLines - 1) {
          // 最后一行：截断并加省略号
          let cut = line
          while (cut.length > 1 && ctx.measureText(cut + '…').width > maxWidth) {
            cut = cut.slice(0, -1)
          }
          ctx.fillText(cut + '…', x, y)
          return y + lineHeight
        }
        ctx.fillText(line, x, y)
        y += lineHeight
        lastY = y
        lines++
        line = chars[i]
      } else {
        line = test
      }
    }
    if (line) {
      ctx.fillText(line, x, y)
      lastY = y + lineHeight
    }
    return lastY
  }

  function dashLine(ctx, x1, y, x2) {
    ctx.save()
    ctx.strokeStyle = C.line
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x1, y)
    ctx.lineTo(x2, y)
    ctx.stroke()
    ctx.restore()
  }

  /* ---------------- 主绘制 ---------------- */

  function drawPoster(ctx, width, height, data) {
    const w = width || W
    const h = height || H
    const inner = w - PAD * 2

    // 背景
    ctx.fillStyle = C.bg
    ctx.fillRect(0, 0, w, h)

    // 右侧装饰圆
    ctx.save()
    ctx.strokeStyle = '#e8e1d5'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(w + 30, 130, 150, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    let y = 96

    // ---- 档案号 ----
    ctx.fillStyle = C.accent
    ctx.fillRect(PAD, y - 13, 26, 1.5)
    ctx.fillStyle = C.accent
    ctx.font = font(15, 'normal', '"Courier New",monospace')
    ctx.fillText(`PERSONAL ARCHIVE · No.${data.archiveNo || '0000'}`, PAD + 38, y - 4)

    y += 76

    // ---- 标题（300 种结局里有 20 字以上的长标题，按长度缩字号）----
    const tLen = (data.title || '').length
    const tSize = tLen >= 22 ? 42 : tLen >= 18 ? 47 : 54
    ctx.fillStyle = C.ink
    ctx.font = font(tSize, '600', SERIF)
    const titleEnd = wrapText(ctx, data.title, PAD, y, inner - 10, tSize + 14, 2)
    y = titleEnd + 18

    // ---- 副标题 ----
    ctx.fillStyle = C.muted
    ctx.font = font(23, 'normal', SANS)
    y = wrapText(ctx, data.subtitle, PAD, y, inner, 36, 2)

    y += 26

    // ---- 红线 ----
    ctx.fillStyle = C.accent
    ctx.fillRect(PAD, y, 44, 2)
    y += 40

    // ---- 描述 ----
    ctx.fillStyle = C.ink2
    ctx.font = font(22, 'normal', SANS)
    y = wrapText(ctx, data.desc, PAD, y, inner, 39, 6)

    y += 24
    dashLine(ctx, PAD, y, w - PAD)
    y += 44

    // ---- 四维 ----
    const scores = data.scores || []
    scores.forEach(s => {
      ctx.fillStyle = C.ink2
      ctx.font = font(21, 'normal', SANS)
      ctx.fillText(s.label, PAD, y)

      ctx.fillStyle = C.muted
      ctx.font = font(19, 'normal', '"Courier New",monospace')
      const numW = ctx.measureText(String(s.value)).width
      ctx.fillText(String(s.value), w - PAD - numW, y)

      // 轨道
      const barY = y + 14
      const barW = inner - 6
      ctx.fillStyle = C.line2
      ctx.fillRect(PAD, barY, barW, 5)
      ctx.fillStyle = s.color || C.accent
      ctx.fillRect(PAD, barY, Math.max(4, (barW * Math.max(0, Math.min(100, s.value))) / 100), 5)

      y += 58
    })

    y += 4
    dashLine(ctx, PAD, y, w - PAD)
    y += 48

    // ---- 关键选择 ----
    ctx.fillStyle = C.faint
    ctx.font = font(15, 'normal', SANS)
    spacedText(ctx, '几个改变轨迹的选择', PAD, y, 2)
    y += 42

    const picks = (data.picks || []).slice(0, 3)
    picks.forEach(p => {
      ctx.fillStyle = C.accent
      ctx.font = font(18, 'normal', '"Courier New",monospace')
      ctx.fillText(`${p.age} 岁`, PAD, y)

      ctx.fillStyle = C.ink
      ctx.font = font(22, 'normal', SANS)
      ctx.fillText(p.title, PAD + 78, y)

      y += 30
      ctx.fillStyle = C.muted
      ctx.font = font(19, 'normal', SANS)
      const choiceEnd = wrapText(ctx, p.choice, PAD + 78, y, inner - 78, 30, 2)
      y = choiceEnd + 22
    })

    // ---- 底部 ----
    const baseY = h - 132
    dashLine(ctx, PAD, baseY, w - PAD)

    ctx.fillStyle = C.muted
    ctx.font = font(18, 'normal', SANS)
    const meta = `${data.genderLabel || ''} · ${data.birthTag || ''}出生 · 走完 ${data.age || 79} 年`
    ctx.fillText(meta, PAD, baseY + 42)

    // 右下角签名
    ctx.fillStyle = C.ink
    ctx.font = font(20, '600', SERIF)
    const brand = '人生模拟器'
    const bw = ctx.measureText(brand).width
    ctx.fillText(brand, w - PAD - bw, baseY + 42)

    return { width: w, height: h }
  }

  /* ---------------- 数据组装 ---------------- */

  function buildPosterData(life, result) {
    const sc = result.sc || {}
    const scores = [
      { label: '物质', value: sc.wealth || 0, color: '#a8442a' },
      { label: '心境', value: sc.happy || 0, color: '#5c6b52' },
      { label: '身体', value: sc.health || 0, color: '#4a5a6b' },
      { label: '成就', value: sc.achieve || 0, color: '#8a6a3f' }
    ]

    // 挑 3 个"有选择"的关键节点：优先中后段、文字有分量的
    const choices = (life.log || []).filter(l => l.kind === 'choice' && l.choice)
    const scored = choices.map(l => {
      let score = 0
      if (l.age >= 18) score += 2
      if (l.age >= 28) score += 2
      if (l.tone === 'good' || l.tone === 'bad') score += 2
      if (l.title && l.title.length >= 4) score += 1
      const id = String(l.title || '')
      if (['填志愿', '六月', '上车', '催婚', '选一边'].includes(id)) score += 3
      return { l, score }
    })
    scored.sort((a, b) => b.score - a.score)

    // 避免都集中在同一段年龄
    const picked = []
    const usedRanges = []
    for (const item of scored) {
      if (picked.length >= 3) break
      const range = Math.floor(item.l.age / 8)
      if (usedRanges.includes(range) && picked.length < 3) continue
      usedRanges.push(range)
      picked.push(item.l)
    }
    picked.sort((a, b) => a.age - b.age)

    const picks = picked.map(l => ({
      age: l.age,
      title: l.title,
      choice: l.choice
    }))

    return {
      archiveNo: String(Math.floor(Math.random() * 9000) + 1000),
      title: result.ending ? result.ending.title : '',
      subtitle: result.ending ? result.ending.subtitle : '',
      // AI 重写后的总结可能带多段，海报只放得下第一段
      desc: (function () {
        const raw = result.ending ? String(result.ending.desc || '') : ''
        if (!raw) return ''
        const paras = raw.split('\n').map(x => x.trim()).filter(Boolean)
        let d = paras.length > 1 ? paras[0] : raw
        if (d.length > 180) d = d.slice(0, 178) + '…'
        return d
      })(),
      age: life.finalAge || 79,
      birthTag: life.birth ? life.birth.tag : '',
      genderLabel: life.gender === 'f' ? '女性' : '男性',
      scores,
      picks
    }
  }

  return {
    W,
    H,
    drawPoster,
    buildPosterData
  }
})
