/* ============================================================
   编辑 / 归档 / 批量导入
   所有写操作都走 cloud.js，失败一律回滚本地状态并提示
   ============================================================ */

function modalRoot() {
  let root = document.getElementById('modalRoot');
  if (!root) {
    root = document.createElement('div');
    root.id = 'modalRoot';
    root.className = 'modal-mask hidden';
    document.body.appendChild(root);
  }
  return root;
}

function closeModal() {
  const root = modalRoot();
  root.classList.add('hidden');
  root.innerHTML = '';
}

/**
 * 打开弹窗。onOk 可为 async，抛错时保留弹窗并显示错误。
 */
function openModal({ title, bodyHtml, okText = '保存', onOk }) {
  const root = modalRoot();
  root.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
    <div class="modal-head">
      <h3>${esc(title)}</h3>
      <button class="modal-x" data-close aria-label="关闭">×</button>
    </div>
    <div class="modal-body">${bodyHtml}<div class="modal-err" hidden></div></div>
    <div class="modal-foot">
      <button class="btn btn-ghost" data-close>取消</button>
      <button class="btn btn-primary" data-ok>${esc(okText)}</button>
    </div>
  </div>`;
  root.classList.remove('hidden');

  const errBox = root.querySelector('.modal-err');
  const okBtn = root.querySelector('[data-ok]');
  const showErr = m => { errBox.textContent = m; errBox.hidden = false; };

  root.querySelectorAll('[data-close]').forEach(b => b.onclick = closeModal);
  /* 点遮罩不关闭（手机和电脑同一个组件，两端一起生效）：
     手指稍微挪一下、鼠标想点空白处，弹窗和写了一截的内容都不该消失。
     关闭只走 × / 取消 / Esc。
     电脑上额外拦一层 pointerdown/mousedown：这样点空白处连焦点和光标位置都不会丢，
     接着打字还是接着原来的地方。触屏不拦，免得影响遮罩上的滑动。 */
  root.onclick = null;
  root.onpointerdown = e => {
    if (e.target !== root) return;
    if (e.pointerType && e.pointerType !== 'mouse') return;
    e.preventDefault();
  };
  root.onmousedown = e => { if (e.target === root) e.preventDefault(); };

  const submit = async () => {
    if (okBtn.disabled) return;
    okBtn.disabled = true;
    okBtn.textContent = '保存中…';
    errBox.hidden = true;
    try {
      await onOk();
      closeModal();
    } catch (err) {
      okBtn.disabled = false;
      okBtn.textContent = okText;
      showErr(failMsg(err, '保存'));
    }
  };
  okBtn.onclick = submit;

  // 键盘：Esc 关闭，⌘/Ctrl + Enter 保存（长笔记不用去够按钮）
  root.onkeydown = e => {
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); submit(); }
  };

  // 长笔记：边打字边撑高，并显示字数
  const ta = root.querySelector('textarea[data-autogrow]');
  if (ta) {
    const cnt = root.querySelector('[data-count]');
    const sync = () => {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight + 2, 420) + 'px';
      if (cnt) cnt.textContent = `${ta.value.length} 字`;
    };
    ta.addEventListener('input', sync);
    sync();
    setTimeout(() => {
      ta.focus();
      try { ta.setSelectionRange(ta.value.length, ta.value.length); } catch (e) { /* 忽略 */ }
    }, 60);
  } else {
    const first = root.querySelector('textarea, input, select');
    if (first) setTimeout(() => first.focus(), 60);
  }
  return root;
}

const toDateInput = d => (d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '');
const toDTInput = d => (d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}` : '');

/* ---------------- 待办 ---------------- */
function openEditTodo(t) {
  openModal({
    title: '修改待办',
    bodyHtml: `
      <label class="fld"><span>内容</span><textarea data-f="text" rows="3">${esc(t.text)}</textarea></label>
      <label class="fld"><span>计划日期（留空表示无日期）</span><input type="date" data-f="plan" value="${toDateInput(t.plan)}"></label>`,
    onOk: async () => {
      const root = modalRoot();
      const text = root.querySelector('[data-f="text"]').value.trim();
      const planVal = root.querySelector('[data-f="plan"]').value;
      if (!text) throw new Error('内容不能为空');
      const plan = planVal ? new Date(planVal + 'T00:00:00') : null;
      await updateTodo(t.id, { text, plan });
      t.text = text;
      t.plan = plan;
      refreshViews();
      toast('已保存');
    },
  });
}

/* ---------------- 读书笔记 ---------------- */
function openEditNote(n) {
  openModal({
    title: '修改笔记',
    okText: '保存',
    bodyHtml: `
      <label class="fld"><span>内容<span class="fld-count" data-count></span></span>
        <textarea data-f="content" data-autogrow rows="12">${esc(n.content)}</textarea>
      </label>
      <label class="fld"><span>书名（留空为未整理）</span>
        <input data-f="book" list="bookList" value="${esc(n.book || '')}" placeholder="例如：认知觉醒">
        <datalist id="bookList">${books.map(b => `<option value="${esc(b.name)}">`).join('')}</datalist>
      </label>
      <p class="modal-tip" style="margin:10px 0 0">按 ⌘/Ctrl + Enter 也能保存；书名改空即移出当前书籍。</p>`,
    onOk: async () => {
      const root = modalRoot();
      const content = root.querySelector('[data-f="content"]').value.trim();
      const bookName = root.querySelector('[data-f="book"]').value.trim();
      if (!content) throw new Error('内容不能为空');
      if (content === n.content && (bookName || null) === (n.book || null)) return; // 没改动，直接关掉
      await updateNote(n.id, { content, bookName: bookName || null });
      n.content = content;
      n.book = bookName || null;
      if (bookName && !books.some(b => b.name === bookName)) books.push({ id: null, name: bookName });
      refreshViews();
      toast('已保存');
    },
  });
}

function openFileNote(n) {
  const list = books.length
    ? `<div class="pick-list">${books.map(b => `<button class="pick-item ${b.name === n.book ? 'on' : ''}" data-pick="${esc(b.name)}">《${esc(b.name)}》</button>`).join('')}</div>`
    : `<p class="modal-tip">还没有书籍，先在下面输入一个书名。</p>`;

  const root = openModal({
    title: '归入书籍',
    bodyHtml: `${list}
      <label class="fld"><span>或新建书籍</span><input data-f="newbook" placeholder="输入书名"></label>`,
    okText: '归入',
    onOk: async () => {
      const inp = modalRoot().querySelector('[data-f="newbook"]');
      const name = (inp.value || '').trim() || (modalRoot().querySelector('.pick-item.on')?.dataset.pick);
      if (!name) throw new Error('请选择或输入一个书名');
      await updateNote(n.id, { bookName: name });
      n.book = name;
      if (!books.some(b => b.name === name)) books.push({ id: null, name });
      refreshViews();
      toast(`已归入《${esc(name)}》`);
    },
  });

  root.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => {
    root.querySelectorAll('[data-pick]').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    root.querySelector('[data-f="newbook"]').value = b.dataset.pick;
  });
}

/* ---------------- 灵感 ---------------- */
/* ---------------- 灵感分类 ---------------- */
/* 新建分类：建完自动选中它，之后记的灵感会直接归到这个分类 */
function openNewCategory(onDone) {
  openModal({
    title: '新建灵感分类',
    okText: '创建',
    bodyHtml: `
      <label class="fld"><span>分类名</span>
        <input data-f="name" maxlength="20" placeholder="例如：产品设计 / 读书方法 / 待验证">
      </label>
      <p class="meta" style="margin:2px 0 0;font-size:11.5px;color:var(--text-4)">
        建好后会自动选中这个分类，接下来记的灵感直接归到它；已有灵感的分类可以在编辑里改。
      </p>`,
    onOk: async () => {
      const root = modalRoot();
      const name = root.querySelector('[data-f="name"]').value.trim();
      if (!name) throw new Error('分类名不能为空');
      if (name.length > 20) throw new Error('分类名请控制在 20 字以内');
      if ((cats || []).some(c => c && c.name === name)) throw new Error('这个分类已经存在了');
      const id = await ensureCategory(name);
      cats.push({ id, name });
      if (onDone) onDone(name);
      refreshViews();
      toast(`已新建分类「${esc(name)}」`);
    },
  });
}

/* 分类用真正的下拉（不是 datalist）：datalist 要打字才出建议，iOS/Safari 上基本点不出，
   刚建好的分类常常看不见。下拉直接列出全部分类（含还没放灵感的空分类）。 */
function openEditIdea(n) {
  const cur = n.cat || '';
  const root = openModal({
    title: '修改灵感',
    okText: '保存',
    bodyHtml: `
      <label class="fld"><span>内容<span class="fld-count" data-count></span></span>
        <textarea data-f="content" data-autogrow rows="10">${esc(n.content)}</textarea>
      </label>
      <label class="fld"><span>分类</span>
        <select data-f="cat">${catOptionsHtml(cur)}</select>
      </label>
      <label class="fld" data-newcat-wrap hidden><span>新分类名</span>
        <input data-f="newcat" maxlength="20" placeholder="例如：产品设计 / 读书方法">
      </label>`,
    onOk: async () => {
      const r = modalRoot();
      const content = r.querySelector('[data-f="content"]').value.trim();
      const picked = r.querySelector('[data-f="cat"]').value;
      let catName = picked;
      if (picked === '__new__') {
        catName = (r.querySelector('[data-f="newcat"]').value || '').trim();
        if (!catName) throw new Error('请填写新分类名');
        if (catName.length > 20) throw new Error('分类名请控制在 20 字以内');
        if (!(cats || []).some(c => c && c.name === catName)) {
          const id = await ensureCategory(catName);
          cats.push({ id, name: catName });
        }
      }
      catName = catName || null;
      if (!content) throw new Error('内容不能为空');
      if (content === n.content && catName === (n.cat || null)) return;
      await updateIdea(n.id, { content, catName });
      n.content = content;
      n.cat = catName || null;
      refreshViews();
      toast('已保存' + (catName ? ` · 分类「${esc(catName)}」` : ''));
    },
  });
  // 选「新建分类」时才露出输入框
  if (root) {
    const sel = root.querySelector('[data-f="cat"]');
    const wrap = root.querySelector('[data-newcat-wrap]');
    if (sel && wrap) sel.addEventListener('change', () => { wrap.hidden = sel.value !== '__new__'; });
  }
}

/* ---------------- 时间记录 ---------------- */
function openEditLog(l) {
  openModal({
    title: '修改时间记录',
    bodyHtml: `
      <label class="fld"><span>做了什么</span><input data-f="desc" value="${esc(l.desc || '')}"></label>
      <label class="fld"><span>分类</span>
        <select data-f="cat">
          ${['study', 'work', 'leisure', 'life'].map(k => `<option value="${k}" ${l.cat === k ? 'selected' : ''}>${CAT[k].name}</option>`).join('')}
        </select>
      </label>
      <div class="fld-row">
        <label class="fld"><span>开始</span><input type="datetime-local" data-f="start" value="${toDTInput(l.start)}"></label>
        <label class="fld"><span>结束</span><input type="datetime-local" data-f="end" value="${toDTInput(l.end)}"></label>
      </div>`,
    onOk: async () => {
      const root = modalRoot();
      const desc = root.querySelector('[data-f="desc"]').value.trim();
      const cat = root.querySelector('[data-f="cat"]').value;
      const start = new Date(root.querySelector('[data-f="start"]').value);
      const end = new Date(root.querySelector('[data-f="end"]').value);
      if (isNaN(start) || isNaN(end)) throw new Error('请填写完整的开始与结束时间');
      if (end <= start) throw new Error('结束时间必须晚于开始时间');
      const dur = Math.round((end - start) / 60000);
      await updateTimeLog(l.id, { desc, cat, start, end });
      Object.assign(l, { desc, cat, start, end, dur, crossDay: !sameDay(start, end) });
      renderDesk();
      toast('已保存');
    },
  });
}

/* ============================================================
   批量导入：一段文字 → 多条笔记 / 灵感
   ============================================================ */

/** 把长文切成候选块：优先按空行，其次按「标题行:」 */
function splitImportBlocks(raw) {
  let t = raw.replace(/\r\n/g, '\n').trim();
  if (!t) return [];
  let blocks = t.split(/\n\s*\n+/).map(s => s.trim()).filter(Boolean);
  if (blocks.length <= 1) {
    // 没有空行分隔：尝试按「《书名》」或「分类：」起始切分
    const parts = t.split(/\n(?=《[^》]+》|#{1,3}\s|[\u4e00-\u9fa5]{2,6}[：:]\s*\n)/);
    if (parts.length > 1) blocks = parts.map(s => s.trim()).filter(Boolean);
  }
  return blocks;
}

/** 推断一个块的类型与元信息 */
function planImportBlock(block) {
  const r = classify(block);
  if (r.type === 'timelog') return null; // 时间流水不走批量导入

  // 有《书名》→ 笔记
  const bm = block.match(/《([^》]{1,40})》/);
  if (bm) return { type: 'note', book: bm[1], content: block };

  // 「短标题：」独占一行 → 该标题作为灵感分类
  const headCat = block.match(/^\s*([\u4e00-\u9fa5A-Za-z0-9]{2,10})\s*[：:]\s*\n/);
  if (headCat) return { type: 'idea', cat: headCat[1], content: block };

  // 长文本 → 笔记（未整理）
  if (r.type === 'note' || block.length >= LONG_TEXT) {
    return { type: 'note', book: null, content: block };
  }

  // 其余 → 灵感。导入场景里「写」「买」这类字不代表待办，不能据此丢弃内容
  return { type: 'idea', cat: null, content: block };
}

function openBatchImport() {
  openModal({
    title: '批量导入笔记 / 灵感',
    okText: '解析并预览',
    bodyHtml: `<p class="modal-tip">粘贴一段文字，按<b>空行</b>自动分条。带《书名》的归为读书笔记，其余归为灵感。下一步会先给你预览，确认后才写入。</p>
      <textarea data-f="raw" rows="10" placeholder="《认知觉醒》\n读完第三章，最大的感受是……&#10;&#10;关于写作：先写完整再写好看，顺序不能反。"></textarea>`,
    onOk: async () => {
      const raw = modalRoot().querySelector('[data-f="raw"]').value;
      const blocks = splitImportBlocks(raw);
      if (!blocks.length) throw new Error('没有解析到内容');
      const plans = blocks.map(planImportBlock).filter(Boolean);
      if (!plans.length) throw new Error('没有可导入的笔记或灵感');
      closeModal();
      setTimeout(() => previewImport(plans), 60);
    },
  });
}

function previewImport(plans) {
  const root = openModal({
    title: `导入预览（${plans.length} 条）`,
    okText: '确认导入',
    bodyHtml: `<p class="modal-tip">请确认分类。可逐条切换为「读书笔记 / 灵感」，或勾掉不要的。</p>
      <div class="imp-list">${plans.map((p, i) => `
        <div class="imp-row" data-i="${i}">
          <input type="checkbox" checked data-keep>
          <div class="imp-main">
            <div class="imp-meta">
              <button class="chip ${p.type === 'note' ? 'on' : ''}" data-set="note">读书笔记</button>
              <button class="chip ${p.type === 'idea' ? 'on' : ''}" data-set="idea">灵感</button>
              <input class="imp-extra" data-extra placeholder="${p.type === 'note' ? '书名（可空）' : '分类（可空）'}" value="${esc(p.type === 'note' ? (p.book || '') : (p.cat || ''))}">
            </div>
            <div class="imp-text">${esc(p.content.slice(0, 160))}${p.content.length > 160 ? '…' : ''}</div>
          </div>
        </div>`).join('')}</div>`,
    onOk: async () => {
      const rows = [...modalRoot().querySelectorAll('.imp-row')];
      const picked = rows.filter(r => r.querySelector('[data-keep]').checked).map(r => {
        const i = +r.dataset.i;
        const p = { ...plans[i] };
        const noteOn = r.querySelector('[data-set="note"]').classList.contains('on');
        p.type = noteOn ? 'note' : 'idea';
        const extra = r.querySelector('[data-extra]').value.trim();
        if (p.type === 'note') p.book = extra || null; else p.cat = extra || null;
        return p;
      });
      if (!picked.length) throw new Error('至少要保留一条');
      if (picked.length > 50) throw new Error('一次最多导入 50 条，请分批');

      const btn = modalRoot().querySelector('[data-ok]');
      let done = 0;
      for (const p of picked) {
        btn.textContent = `导入中 ${done + 1}/${picked.length}…`;
        const msgId = await addMessage(p.content, p.type, { source: 'batch_import' }, 'batch_import');
        if (p.type === 'note') {
          const item = await addNote({ content: p.content, bookName: p.book || null, messageId: msgId });
          notes.push(item);
        } else {
          const item = await addIdea({ content: p.content, catName: p.cat || null, messageId: msgId });
          ideas.push(item);
        }
        done++;
      }
      const nNote = picked.filter(p => p.type === 'note').length;
      state.nav = nNote >= picked.length - nNote ? 'note' : 'idea';
      renderDesk();
      toast(`已导入 ${done} 条（笔记 ${nNote} · 灵感 ${done - nNote}）`);
    },
  });

  root.querySelectorAll('.imp-row').forEach(row => {
    row.querySelectorAll('[data-set]').forEach(btn => btn.onclick = () => {
      row.querySelectorAll('[data-set]').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      const inp = row.querySelector('[data-extra]');
      inp.placeholder = btn.dataset.set === 'note' ? '书名（可空）' : '分类（可空）';
    });
  });
}
