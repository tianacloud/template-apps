import { sheet, toast, escapeHtml, confirmDialog } from './ui.js';
import { icon, CATEGORY_ICONS } from './icons.js';
import { state, setState } from './state.js';
import * as db from './db.js';
import { imgSrc, ensureImages } from './media.js';

const ICON_LABEL = {
  flame: '热菜', soup: '汤', rice: '主食', salad: '凉菜',
  drink: '饮品', bowl: '通用', tag: '其它', sparkle: '拿手',
};

/**
 * 新增 / 编辑菜品。图片会先上传到云存储，再把对象键写入菜品记录。
 */
export function openDishForm(dish = null, options = {}) {
  const isEdit = Boolean(dish && dish.id);
  const member = state.member;
  if (!member) {
    toast('请先登录', 'error');
    return null;
  }

  let imagePath = isEdit ? dish.image_path || null : null;
  let previewUrl = imgSrc(imagePath);
  let pendingFile = null;
  let categoryId = isEdit && dish.category_id != null
    ? dish.category_id
    : (options.categoryId != null ? options.categoryId : (state.categories[0] ? state.categories[0].id : null));
  let busy = false;

  const initialTags = isEdit && Array.isArray(dish.tags) ? dish.tags.join('，') : '';

  const catChips = () => state.categories.map((cat) => `
    <button type="button" class="chip ${Number(categoryId) === Number(cat.id) ? 'chip-brand' : 'chip-line'}"
      data-cat="${cat.id}">${icon(cat.icon_key || 'bowl', 13, 2)}${escapeHtml(cat.name)}</button>
  `).join('');

  const mediaHtml = () => {
    if (previewUrl) {
      return `<img id="dfPreview" src="${previewUrl}" alt="" /><button type="button" class="icon-btn" id="dfClear"
        style="position:absolute;top:6px;right:6px;background:rgba(0,0,0,.45);color:#fff" aria-label="移除图片">${icon('close', 16, 2)}</button>`;
    }
    return `
      <span style="color:var(--brand-deep)">${icon('camera', 26)}</span>
      <span>拍照或从相册选一张</span>
      <span class="muted" style="font-size:11.5px">可选，不传就用图标占位</span>
    `;
  };

  const body = `
    <input type="file" id="dfFile" accept="image/*" hidden />
    <div class="upload-box" id="dfBox">${mediaHtml()}</div>

    <label class="field">
      <span class="field-label">菜名</span>
      <input class="input" id="dfName" maxlength="30" placeholder="例如：糖醋排骨"
        value="${escapeHtml(isEdit ? dish.name : '')}" />
    </label>

    <div class="field">
      <span class="field-label">分类</span>
      <div class="inline" style="flex-wrap:wrap;gap:6px" id="dfCats">${catChips()}</div>
      <div class="field-hint">选中一个分类，家里的菜单会按分类展示</div>
    </div>

    <div class="field">
      <span class="field-label">简介</span>
      <textarea class="textarea" id="dfDesc" maxlength="120"
        placeholder="这道菜的口味、做法或你想说的一句话">${escapeHtml(isEdit ? dish.description : '')}</textarea>
    </div>

    <div class="inline" style="gap:12px;align-items:flex-start">
      <label class="field grow" style="margin-top:14px">
        <span class="field-label">参考价（元）</span>
        <input class="input" id="dfPrice" type="number" inputmode="decimal" min="0" step="0.5"
          placeholder="0" value="${escapeHtml(isEdit ? String(dish.price || 0) : '')}" />
      </label>
      <label class="field grow" style="margin-top:14px">
        <span class="field-label">标签</span>
        <input class="input" id="dfTags" placeholder="下饭，快手"
          value="${escapeHtml(initialTags)}" />
      </label>
    </div>
    <div class="field-hint">价格只用来估算这顿饭的开销，可以填 0；标签用逗号分隔</div>

    ${isEdit ? `<div class="field" id="dfDanger" style="margin-top:22px">
      <button type="button" class="btn btn-danger btn-block btn-sm" id="dfDelete">${icon('trash', 16, 2)}删除这道菜</button>
    </div>` : ''}
  `;

  const foot = `
    <button class="btn btn-plain" data-sheet-close>取消</button>
    <button class="btn btn-primary" id="dfSave">${isEdit ? '保存修改' : '加入菜单'}</button>
  `;

  return sheet({
    title: isEdit ? '编辑菜品' : '新增菜品',
    body,
    foot,
    onMount(panel, close) {
      const fileInput = panel.querySelector('#dfFile');
      const box = panel.querySelector('#dfBox');
      const nameInput = panel.querySelector('#dfName');
      const saveBtn = panel.querySelector('#dfSave');

      const repaintMedia = () => {
        box.innerHTML = mediaHtml();
        box.classList.remove('is-uploading');
        const clearBtn = box.querySelector('#dfClear');
        if (clearBtn) {
          clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            imagePath = null;
            pendingFile = null;
            previewUrl = null;
            repaintMedia();
          });
        }
      };

      box.addEventListener('click', (e) => {
        if (e.target.closest('#dfClear')) return;
        fileInput.click();
      });

      fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        if (!/^image\//.test(file.type || '')) {
          toast('请选择图片文件', 'error');
          fileInput.value = '';
          return;
        }
        pendingFile = file;
        previewUrl = URL.createObjectURL(file);
        repaintMedia();
        fileInput.value = '';
      });

      panel.querySelector('#dfCats').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-cat]');
        if (!btn) return;
        categoryId = Number(btn.dataset.cat);
        panel.querySelector('#dfCats').innerHTML = catChips();
      });

      const deleteBtn = panel.querySelector('#dfDelete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
          const ok = await confirmDialog({
            title: `删除「${dish.name}」？`,
            desc: '删除后家里的菜单里就看不到这道菜了，历史点单记录不受影响。',
            okText: '删除',
            danger: true,
          });
          if (!ok) return;
          deleteBtn.disabled = true;
          try {
            await db.deleteDish(dish.id);
            setState({ dishes: state.dishes.filter((d) => Number(d.id) !== Number(dish.id)) });
            if (dish.image_path) db.removeStorageObjects([dish.image_path]);
            toast('已删除', 'ok');
            close();
          } catch (err) {
            deleteBtn.disabled = false;
            toast(err.friendly || err.message || '删除失败', 'error');
          }
        });
      }

      const doSave = async () => {
        if (busy) return;
        const name = nameInput.value.trim();
        if (!name) {
          toast('给这道菜起个名字吧', 'error');
          nameInput.focus();
          return;
        }

        busy = true;
        saveBtn.innerHTML = `<span class="spinner"></span>保存中`;

        try {
          const tags = panel.querySelector('#dfTags').value
            .split(/[，,、\s]+/)
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 6);

          const payload = {
            family_id: member.family_id,
            name,
            category_id: categoryId,
            description: panel.querySelector('#dfDesc').value.trim(),
            price: Number(panel.querySelector('#dfPrice').value) || 0,
            tags,
            image_path: imagePath,
            is_active: true,
          };

          if (isEdit) {
            const updated = pendingFile ? await db.saveDishWithImage(pendingFile, payload, dish.id) : await db.updateDish(dish.id, payload);
            imagePath = updated.image_path; pendingFile = null;
            setState({
              dishes: state.dishes.map((d) => (Number(d.id) === Number(dish.id) ? updated : d)),
            });
          } else {
            const created = pendingFile ? await db.saveDishWithImage(pendingFile, payload) : await db.createDish(payload);
            imagePath = created.image_path; pendingFile = null;
            setState({ dishes: [created, ...state.dishes] });
          }

          if (imagePath) {
            await ensureImages([imagePath]);
            setState({});
          }

          toast(isEdit ? '已保存' : '已经加进菜单啦', 'ok');
          close();
        } catch (err) {
          box.classList.remove('is-uploading');
          saveBtn.innerHTML = isEdit ? '保存修改' : '加入菜单';
          busy = false;
          toast(err.friendly || err.message || '保存失败，请重试', 'error');
        }
      };

      saveBtn.addEventListener('click', doSave);
      setTimeout(() => nameInput.focus(), 220);
    },
  });
}

/* ---------------------------------------------------------------- 分类编辑 */

export function openCategoryForm(category = null) {
  const isEdit = Boolean(category && category.id);
  const member = state.member;
  if (!member) return null;

  let iconKey = isEdit ? category.icon_key || 'bowl' : 'bowl';

  const iconChips = () => CATEGORY_ICONS.map((key) => `
    <button type="button" class="chip ${iconKey === key ? 'chip-brand' : 'chip-line'}" data-icon="${key}">
      ${icon(key, 14, 2)}${escapeHtml(ICON_LABEL[key] || key)}
    </button>
  `).join('');

  const body = `
    <label class="field" style="margin-top:6px">
      <span class="field-label">分类名称</span>
      <input class="input" id="cfName" maxlength="12" placeholder="例如：家常热菜"
        value="${escapeHtml(isEdit ? category.name : '')}" />
    </label>
    <div class="field">
      <span class="field-label">图标</span>
      <div class="inline" style="flex-wrap:wrap;gap:6px" id="cfIcons">${iconChips()}</div>
    </div>
    ${isEdit ? `<div class="field" style="margin-top:22px">
      <button type="button" class="btn btn-danger btn-block btn-sm" id="cfDelete">${icon('trash', 16, 2)}删除分类</button>
      <div class="field-hint">删除分类后，原来属于它的菜品会变成「未分类」，不会被删除。</div>
    </div>` : ''}
  `;

  return sheet({
    title: isEdit ? '编辑分类' : '新建分类',
    body,
    foot: `
      <button class="btn btn-plain" data-sheet-close>取消</button>
      <button class="btn btn-primary" id="cfSave">${isEdit ? '保存' : '创建'}</button>
    `,
    onMount(panel, close) {
      const nameInput = panel.querySelector('#cfName');
      const saveBtn = panel.querySelector('#cfSave');

      panel.querySelector('#cfIcons').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-icon]');
        if (!btn) return;
        iconKey = btn.dataset.icon;
        panel.querySelector('#cfIcons').innerHTML = iconChips();
      });

      const delBtn = panel.querySelector('#cfDelete');
      if (delBtn) {
        delBtn.addEventListener('click', async () => {
          const ok = await confirmDialog({
            title: `删除「${category.name}」？`,
            desc: '该分类下的菜品会移到「未分类」，菜品本身不会删除。',
            okText: '删除',
            danger: true,
          });
          if (!ok) return;
          try {
            await db.deleteCategory(category.id);
            setState({
              categories: state.categories.filter((c) => Number(c.id) !== Number(category.id)),
              dishes: state.dishes.map((d) => (
                Number(d.category_id) === Number(category.id) ? { ...d, category_id: null } : d
              )),
            });
            toast('已删除', 'ok');
            close();
          } catch (err) {
            toast(err.friendly || err.message || '删除失败', 'error');
          }
        });
      }

      saveBtn.addEventListener('click', async () => {
        const name = nameInput.value.trim();
        if (!name) {
          toast('给分类起个名字', 'error');
          return;
        }
        saveBtn.disabled = true;
        try {
          if (isEdit) {
            const updated = await db.updateCategory(category.id, { name, icon_key: iconKey });
            setState({
              categories: state.categories.map((c) => (Number(c.id) === Number(category.id) ? updated : c)),
            });
          } else {
            const created = await db.createCategory({
              family_id: member.family_id,
              name,
              icon_key: iconKey,
              sort_order: state.categories.length,
            });
            setState({ categories: [...state.categories, created] });
          }
          toast('已保存', 'ok');
          close();
        } catch (err) {
          saveBtn.disabled = false;
          toast(err.friendly || err.message || '保存失败', 'error');
        }
      });

      setTimeout(() => nameInput.focus(), 220);
    },
  });
}
