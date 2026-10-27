// core/save.js
// 存档抽象层（SaveStore）—— 全工程「唯一」直接触碰 localStorage 的地方（零 DOM 铁律的唯一合法例外）。
// core / ui 只依赖这里的类型与接口，不依赖任何平台 API；换平台/换引擎只改这一个文件。
//
// 物理键名约定：
//   - 逻辑键 "glass365"  =>  物理键 "glass365_save_v1"（与总设计案一致）
//   - 其它逻辑键         =>  物理键 "glass365_<key>"
//
// 接口（与 persona 存档规范一致）：
//   read<T>(key): T | null      读取；键不存在或解析失败返回 null（不抛异常）
//   write<T>(key, value): void  写入；序列化/持久化失败「抛错」让上层抉择
//   list(): string[]            返回全部逻辑键
//   migrate(from, to): void     版本迁移，不丢数据（当前仅 v1，留作扩展）

const PREFIX = 'glass365_';
const PHYS_OF = (key) => (key === 'glass365' ? 'glass365_save_v1' : `${PREFIX}${key}`);

// 判断是否为存储配额/容量超限错误（跨浏览器 name/code 不一，做宽匹配）
function isQuotaError(e) {
  if (!e) return false;
  const name = e.name || '';
  const code = e.code;
  return (
    name === 'QuotaExceededError' ||
    name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    code === 22 ||
    code === 1014
  );
}

export class SaveStore {
  // storage 可注入（便于 node 自测）；缺省用浏览器 localStorage
  constructor(storage) {
    this.storage =
      storage ||
      (typeof globalThis !== 'undefined' && globalThis.localStorage
        ? globalThis.localStorage
        : null);
    if (!this.storage) {
      throw new Error('[SaveStore] 无可用存储后端（localStorage 不存在且未注入）');
    }
  }

  read(key) {
    try {
      const raw = this.storage.getItem(PHYS_OF(key));
      if (raw == null) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[SaveStore] read 失败', key, e);
      return null;
    }
  }

  write(key, value) {
    // 序列化或持久化失败 -> 抛错，让上层决定重试/降级
    const raw = JSON.stringify(value);
    this.storage.setItem(PHYS_OF(key), raw);
  }

  // 配额/容量容错写入（§5.2）：捕获 QuotaExceededError，尝试省略非必要字段（settings）后重试；
  // 仍失败则上报并返回 false，绝不静默吞掉导致「看似存了其实没存」。
  safeWrite(key, value) {
    try {
      this.write(key, value);
      return true;
    } catch (e) {
      if (isQuotaError(e)) {
        try {
          const slim = { ...value };
          delete slim.settings; // settings 非通关必要，可牺牲以保住进度
          this.write(key, slim);
          console.warn('[SaveStore] 配额超限，已省略 settings 写入以保留进度');
          return true;
        } catch (e2) {
          console.error('[SaveStore] 配额仍超限，存档写入失败', e2);
          return false;
        }
      }
      console.error('[SaveStore] 写入失败', e);
      return false;
    }
  }


  list() {
    const out = [];
    for (let i = 0; i < this.storage.length; i++) {
      const phys = this.storage.key(i);
      if (phys && phys.startsWith(PREFIX)) {
        out.push(phys.slice(PREFIX.length).replace(/_save_v1$/, ''));
      }
    }
    return out;
  }

  // 版本迁移：读旧 -> 转 -> 写新成功才动旧 -> 失败回退 -> 幂等（重跑不产生脏数据）
  // from / to 均为逻辑键。transform(oldData) 可选，用于做结构升级。
  migrate(from, to, transform) {
    const oldData = this.read(from);
    if (oldData == null) return; // 没旧数据，无需迁移（幂等）
    const migrated = typeof transform === 'function' ? transform(oldData) : oldData;
    // 先成功写入新键，再删旧键；任一步失败都保留旧数据，不丢
    this.write(to, migrated);
    this.storage.removeItem(PHYS_OF(from));
  }

  remove(key) {
    try {
      this.storage.removeItem(PHYS_OF(key));
    } catch (e) {
      console.warn('[SaveStore] remove 失败', key, e);
    }
  }
}
