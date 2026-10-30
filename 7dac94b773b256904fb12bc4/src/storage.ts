import { createTianaFetch } from '@tianacloud/serverless';
import { emptyWorkspace, uid, type Workspace } from './model';
import { validate } from './actions';

export interface Runtime {
  appId: string;
  auth: NonNullable<Parameters<typeof createTianaFetch>[0]['auth']>;
  connection(): Promise<{origin: string; sql_api: string}>;
}
export interface Snapshot { revision: number; data: Workspace }
export interface Repository {
  load(): Promise<Snapshot>;
  save(previous: Snapshot, next: Workspace): Promise<Snapshot>;
  verifyPending(): Promise<Snapshot>;
  readonly pending: boolean;
}
type Cell = {type: string; value?: string | number};
type SqlResult = {cols: {name:string}[]; rows: Cell[][]};
export class Conflict extends Error {
  constructor() {super('另一个页面已修改数据。本次草稿尚未保存，请关闭编辑窗口后重新打开。');}
}
export class Uncertain extends Error {
  constructor() {super('提交结果尚无法确认。请先核实结果，避免重复提交。');}
}
class SqlRejected extends Error {}
export class CloudRepository implements Repository {
  private sqlFetch: ReturnType<typeof createTianaFetch> | null = null;
  private origin = '';
  private operation: string | null;
  private pendingKey: string;
  constructor(private runtime: Runtime) {
    if (!runtime.appId || typeof runtime.auth?.getAccessToken !== 'function') throw new Error('需要 Tiana 登录和动态鉴权运行时');
    this.pendingKey = `riji:pending:${runtime.appId}`;
    this.operation = sessionStorage.getItem(this.pendingKey);
  }
  get pending() {return this.operation !== null;}
  private setPending(id: string | null) {
    this.operation = id;
    if (id) sessionStorage.setItem(this.pendingKey,id); else sessionStorage.removeItem(this.pendingKey);
  }
  private async execute(sql: string, values: (string|number)[] = []): Promise<Record<string,string|number|null>[]> {
    if (!this.sqlFetch) {
      const c = await this.runtime.connection();
      if (c.sql_api !== 'hrana-v3') throw new Error('此应用需要 Hrana v3 数据库连接');
      this.origin = c.origin;
      this.sqlFetch = createTianaFetch({origin:c.origin,auth:this.runtime.auth,requestBodyMode:'buffered'});
    }
    const response = await this.sqlFetch(`${this.origin}/v3/pipeline`, {
      method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify({requests:[
        {type:'execute',stmt:{sql,args:values.map(v => typeof v === 'number' ?
          {type:'integer',value:String(v)} : {type:'text',value:v}),want_rows:true}},
        {type:'close'},
      ]}),
    });
    if (!response.ok) throw new Error('数据库连接未返回有效结果');
    const body = await response.json();
    const result = body.results?.[0];
    if (result?.type === 'error') throw new SqlRejected('数据库拒绝了操作，请检查表结构与权限');
    if (result?.type !== 'ok' || result.response?.type !== 'execute') throw new Error('数据库结果不完整');
    const data = result.response.result as SqlResult;
    if (!Array.isArray(data.cols) || !Array.isArray(data.rows)) throw new Error('数据库结果格式不完整');
    // An execute success is authoritative even if the separate close response failed.
    return data.rows.map(row => Object.fromEntries(data.cols.map((col,i) => {
      const cell = row[i];
      if (cell.type === 'null') return [col.name,null];
      if (cell.type === 'integer') {
        const num = Number(cell.value);
        return [col.name,Number.isSafeInteger(num) ? num : String(cell.value)];
      }
      return [col.name,cell.value ?? null];
    })));
  }
  private async read(): Promise<Snapshot | null> {
    const rows = await this.execute('SELECT revision, document FROM riji_workspaces WHERE app_id = ?',[this.runtime.appId]);
    if (!rows.length) return null;
    const revision = rows[0].revision;
    if (typeof revision !== 'number' || !Number.isSafeInteger(revision)) throw new Error('数据版本无效');
    const data = JSON.parse(String(rows[0].document)) as Workspace;
    validate(data);
    return {revision,data};
  }
  async load() {
    if (this.pending) return this.verifyPending();
    const found = await this.read();
    if (found) return found;
    const data = emptyWorkspace(), operation = uid();
    this.setPending(operation);
    try {
      await this.execute('INSERT OR IGNORE INTO riji_workspaces(app_id, revision, document, operation_id, updated_at) VALUES (?, 0, ?, ?, ?)',
        [this.runtime.appId,JSON.stringify(data),operation,new Date().toISOString()]);
      this.setPending(null);
    } catch (error) {
      if (error instanceof SqlRejected) {this.setPending(null); throw error;}
      // Initialization is idempotent, but we still inspect rather than replay it.
      const created = await this.read().catch(() => null);
      if (created) {this.setPending(null); return created;}
      throw new Uncertain();
    }
    const created = await this.read();
    if (!created) throw new Error('工作区初始化后无法读取');
    return created;
  }
  async save(previous: Snapshot, next: Workspace): Promise<Snapshot> {
    if (this.pending) throw new Uncertain();
    validate(next);
    const document = JSON.stringify(next);
    if (new TextEncoder().encode(document).length > 6*1024*1024) throw new Error('工作区数据过大，请先导出并整理');
    const operation = uid();
    this.setPending(operation);
    try {
      const rows = await this.execute('UPDATE riji_workspaces SET document = ?, revision = revision + 1, operation_id = ?, updated_at = ? WHERE app_id = ? AND revision = ? RETURNING revision',
        [document,operation,new Date().toISOString(),this.runtime.appId,previous.revision]);
      this.setPending(null);
      if (!rows.length) throw new Conflict();
      return {revision:Number(rows[0].revision),data:next};
    } catch (error) {
      if (error instanceof Conflict) throw error;
      if (error instanceof SqlRejected) {this.setPending(null); throw error;}
      // Read the atomic receipt even if another tab has already advanced the workspace.
      return this.verifyPending();
    }
  }
  async verifyPending(): Promise<Snapshot> {
    if (!this.operation) {
      const found = await this.read();
      if (!found) throw new Error('工作区不存在');
      return found;
    }
    try {
      const rows = await this.execute('SELECT revision FROM riji_receipts WHERE app_id = ? AND operation_id = ?',[this.runtime.appId,this.operation]);
      if (!rows.length) throw new Uncertain();
      const latest = await this.read();
      if (!latest) throw new Uncertain();
      this.setPending(null);
      return latest;
    } catch {throw new Uncertain();}
  }
}
