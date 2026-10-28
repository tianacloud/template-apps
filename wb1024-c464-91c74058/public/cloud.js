let connection, sqlFetch;
async function initCloud() {
  if (!window.tiana?.auth?.getAccessToken || !window.tiana?.connection) throw new Error('数据库连接尚未就绪');
  connection = await window.tiana.connection();
  if (connection.sql_api !== 'hrana-v3') throw new Error('不支持的数据库协议');
  sqlFetch = window.createTianaFetch({origin:connection.origin, auth:window.tiana.auth, requestBodyMode:'buffered'});
}
function param(v) { if (v === null || v === undefined) return {type:'null'}; if(typeof v === 'number') return Number.isInteger(v)?{type:'integer',value:String(v)}:{type:'float',value:v}; return {type:'text',value:typeof v==='object'?JSON.stringify(v):String(v)}; }
async function sql(query, values=[]) {
  const response=await sqlFetch(`${connection.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:query,args:values.map(param),want_rows:true}},{type:'close'}]})});
  if(!response.ok) throw new Error('数据库请求失败，结果未知，请刷新后确认');
  const body=await response.json(), result=body.results?.[0];
  if(result?.type!=='ok' || result.response?.type!=='execute') throw new Error(result?.error?.message || '数据库请求失败');
  const rows=result.response.result; return rows.rows.map(row=>Object.fromEntries(rows.cols.map((col,i)=>[col.name,row[i].type==='null'?null:row[i].type==='integer'?Number(row[i].value):row[i].value])));
}
const tables = new Set(['app_user','message','todo','book','reading_note','idea_category','idea','time_log']);
class Query {
 constructor(table){if(!tables.has(table))throw new Error('Invalid table');this.table=table;this.kind='select';this.cols='*';this.filters=[];this.values=[];}
 select(cols='*'){this.cols=cols;return this} insert(v){this.kind='insert';this.body=v;return this} update(v){this.kind='update';this.body=v;return this}
 eq(k,v){this.filters.push(`${k} = ?`);this.values.push(v);return this} is(k,v){if(v!==null)throw new Error('Invalid filter');this.filters.push(`${k} IS NULL`);return this}
 order(k,o){this.sort=` ORDER BY ${k} ${o.ascending?'ASC':'DESC'}`;return this} limit(n){this.max=` LIMIT ${Number(n)}`;return this}
 then(resolve,reject){return this.run().then(resolve,reject)}
 async run(){try{let q, args=[];if(this.kind==='insert'){let keys=Object.keys(this.body);q=`INSERT INTO ${this.table} (${keys.join(',')}) VALUES (${keys.map(()=>'?').join(',')}) RETURNING *`;args=keys.map(k=>this.body[k]);}else if(this.kind==='update'){let keys=Object.keys(this.body);q=`UPDATE ${this.table} SET ${keys.map(k=>k+'=?').join(',')} WHERE ${this.filters.join(' AND ')} RETURNING *`;args=keys.map(k=>this.body[k]).concat(this.values);}else {q=`SELECT ${this.cols} FROM ${this.table}${this.filters.length?' WHERE '+this.filters.join(' AND '):''}${this.sort||''}${this.max||''}`;args=this.values;}return {data:await sql(q,args),error:null};}catch(error){return {data:null,error};}}
}
function db(){return {from:table=>new Query(table)}}
async function getSession(){return {session:{user:{name:'我'}}}};
async function tryRestoreSession(){return true};
async function ensureProfile(){};
function unwrap(res, label) {
  if (res.error) throw res.error;
  return res.data;
}

const iso = d => (d instanceof Date ? d.toISOString() : d);
const dayStr = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/* ---------- 行 → 视图模型 ---------- */
function rowToTodo(r) {
  return {
    id: r.id,
    text: r.content,
    plan: r.plan_date ? new Date(r.plan_date + 'T00:00:00') : null,
    createdAt: new Date(r.created_at),
    done: r.status === 'done',
    doneAt: r.completed_at ? new Date(r.completed_at) : null,
    seq: r.split_seq || 0,
  };
}
function rowToNote(r, bookMap) {
  return {
    id: r.id,
    bookId: r.book_id,
    book: r.book_id ? (bookMap[r.book_id] || null) : null,
    content: r.content,
    createdAt: new Date(r.created_at),
  };
}
function rowToIdea(r, catMap) {
  return {
    id: r.id,
    catId: r.category_id,
    cat: r.category_id ? (catMap[r.category_id] || null) : null,
    content: r.content,
    createdAt: new Date(r.created_at),
  };
}
function rowToLog(r) {
  return {
    id: r.id,
    cat: r.category,
    desc: r.content,
    crossDay: !!r.cross_day,
    start: new Date(r.start_at),
    end: new Date(r.end_at),
    dur: r.duration_min,
  };
}

/* ---------- 原始消息（原文全链路只读，用于「原始消息」视图与收件箱兜底） ---------- */
async function loadMessages() {
  const { data, error } = await db().from('message')
    .select('*').is('deleted_at', null)
    .order('created_at', { ascending: false }).limit(500);
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id,
    content: r.content,
    type: r.parse_type || 'inbox',
    channel: r.channel || 'web',
    at: new Date(r.created_at),
  }));
}

async function setMessageType(id, type) {
  const { error } = await db().from('message').update({ parse_type: type, type_edited: 1 }).eq('id', id);
  if (error) throw error;
}

/* ---------- 载入全部数据 ---------- */
async function loadAll() {
  const [todoRes, bookRes, noteRes, catRes, ideaRes, logRes] = await Promise.all([
    db().from('todo').select('*').is('deleted_at', null).order('created_at', { ascending: true }),
    db().from('book').select('*').order('created_at', { ascending: true }),
    db().from('reading_note').select('*').is('deleted_at', null).order('created_at', { ascending: true }),
    db().from('idea_category').select('*').order('created_at', { ascending: true }),
    db().from('idea').select('*').is('deleted_at', null).order('created_at', { ascending: true }),
    db().from('time_log').select('*').is('deleted_at', null).order('start_at', { ascending: true }),
  ]);
  for (const r of [todoRes, bookRes, noteRes, catRes, ideaRes, logRes]) {
    if (r.error) throw r.error;
  }

  const bookMap = {}, catMap = {};
  (bookRes.data || []).forEach(b => { bookMap[b.id] = b.name; });
  (catRes.data || []).forEach(c => { catMap[c.id] = c.name; });

  return {
    books: bookRes.data || [],
    cats: catRes.data || [],
    todos: (todoRes.data || []).map(rowToTodo),
    notes: (noteRes.data || []).map(r => rowToNote(r, bookMap)),
    ideas: (ideaRes.data || []).map(r => rowToIdea(r, catMap)),
    logs: (logRes.data || []).map(rowToLog),
  };
}

/* ---------- 原始消息（原文全链路只读） ---------- */
async function addMessage(content, parseType, snapshot, channel = 'web') {
  const { data, error } = await db().from('message').insert({
    content,
    channel,
    parse_type: parseType,
    parse_snapshot: snapshot || null,
    confidence: snapshot?.confidence ?? null,
  }).select();
  if (error) throw error;
  return data?.[0]?.id ?? null;
}

/* ---------- 书籍 / 分类：取或建 ---------- */
async function ensureBook(name) {
  const nm = String(name).trim();
  const { data: exist } = await db().from('book').select('id').eq('name', nm).limit(1);
  if (exist && exist.length) return exist[0].id;
  const { data, error } = await db().from('book').insert({ name: nm }).select();
  if (error) throw error;
  return data?.[0]?.id ?? null;
}

async function ensureCategory(name) {
  const nm = String(name).trim();
  const { data: exist } = await db().from('idea_category').select('id').eq('name', nm).limit(1);
  if (exist && exist.length) return exist[0].id;
  const { data, error } = await db().from('idea_category').insert({ name: nm }).select();
  if (error) throw error;
  return data?.[0]?.id ?? null;
}

async function renameBook(id, name) {
  const { error } = await db().from('book').update({ name: String(name).trim() }).eq('id', id);
  if (error) throw error;
}

async function renameCategory(id, name) {
  const { error } = await db().from('idea_category').update({ name: String(name).trim() }).eq('id', id);
  if (error) throw error;
}

/* ---------- 待办 ---------- */
async function addTodo({ text, plan, seq = 0, messageId = null }) {
  const { data, error } = await db().from('todo').insert({
    content: text,
    plan_date: plan ? dayStr(plan) : null,
    date_source: plan ? 'parsed' : 'none',
    status: 'pending',
    split_seq: seq,
    message_id: messageId,
  }).select();
  if (error) throw error;
  return rowToTodo(data[0]);
}

async function setTodoDone(id, done) {
  const now = new Date();
  const patch = done
    ? { status: 'done', completed_at: iso(now), week_key: weekKey(now) }
    : { status: 'pending', completed_at: null, week_key: null };
  const { data, error } = await db().from('todo').update(patch).eq('id', id).select();
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('没有改动任何待办，它可能已被删除');
}

async function updateTodo(id, patch) {
  const body = {};
  if (patch.text !== undefined) body.content = patch.text;
  if (patch.plan !== undefined) {
    body.plan_date = patch.plan ? dayStr(patch.plan) : null;
    body.date_source = patch.plan ? 'user' : 'none';
  }
  const { data, error } = await db().from('todo').update(body).eq('id', id).select();
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('没有改动任何待办，它可能已被删除');
}

async function softDelete(table, id) {
  const { data, error } = await db().from(table).update({ deleted_at: iso(new Date()) }).eq('id', id).select();
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('删除失败，记录可能已不存在');
}

/* ---------- 读书笔记 ---------- */
async function addNote({ content, bookName, messageId = null }) {
  const bookId = bookName ? await ensureBook(bookName) : null;
  const { data, error } = await db().from('reading_note').insert({
    content,
    book_id: bookId,
    message_id: messageId,
  }).select();
  if (error) throw error;
  return { id: data[0].id, bookId, book: bookName || null, content, createdAt: new Date(data[0].created_at) };
}

async function updateNote(id, patch) {
  const body = {};
  if (patch.content !== undefined) body.content = patch.content;
  if (patch.bookName !== undefined) body.book_id = patch.bookName ? await ensureBook(patch.bookName) : null;
  else if (patch.bookId !== undefined) body.book_id = patch.bookId;
  const { data, error } = await db().from('reading_note').update(body).eq('id', id).select();
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('没有改动任何笔记，它可能已被删除');
}

/* ---------- 灵感 ---------- */
async function addIdea({ content, catName, messageId = null }) {
  const categoryId = catName ? await ensureCategory(catName) : null;
  const { data, error } = await db().from('idea').insert({
    content,
    category_id: categoryId,
    message_id: messageId,
  }).select();
  if (error) throw error;
  return { id: data[0].id, catId: categoryId, cat: catName || null, content, createdAt: new Date(data[0].created_at) };
}

async function updateIdea(id, patch) {
  const body = {};
  if (patch.content !== undefined) body.content = patch.content;
  if (patch.catName !== undefined) body.category_id = patch.catName ? await ensureCategory(patch.catName) : null;
  else if (patch.catId !== undefined) body.category_id = patch.catId;
  const { data, error } = await db().from('idea').update(body).eq('id', id).select();
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('没有改动任何灵感，它可能已被删除');
}

/* ---------- 时间消耗 ---------- */
async function addTimeLog({ desc, start, end, dur, cat, crossDay, messageId = null }) {
  const { data, error } = await db().from('time_log').insert({
    content: desc,
    start_at: iso(start),
    end_at: iso(end),
    duration_min: dur,
    category: cat,
    cross_day: crossDay ? 1 : 0,
    belong_date: dayStr(start),
    message_id: messageId,
  }).select();
  if (error) throw error;
  return rowToLog(data[0]);
}

async function updateTimeLog(id, patch) {
  const body = {};
  if (patch.desc !== undefined) body.content = patch.desc;
  if (patch.cat !== undefined) body.category = patch.cat;
  if (patch.start !== undefined) {
    body.start_at = iso(patch.start);
    body.belong_date = dayStr(patch.start);
  }
  if (patch.end !== undefined) {
    body.end_at = iso(patch.end);
    body.duration_min = Math.round((patch.end - (patch.start || new Date())) / 60000);
  }
  const { data, error } = await db().from('time_log').update(body).eq('id', id).select();
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('没有改动任何时间记录，它可能已被删除');
}
