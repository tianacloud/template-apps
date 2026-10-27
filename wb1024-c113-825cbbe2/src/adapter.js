import {sql} from './db.js';
const choices = {
  '记录类型':['身体数据','饮食','运动'],
  '餐次':['早餐','午餐','加餐','晚餐'],
  '运动类型':['居家徒手跟练','小器械力量','跑步','快走','跳绳','骑行','拉伸放松','其他'],
  '精力':['元气满满','还不错','有点累','累瘫了'],
  '小成就':['喝水2000ml','早睡满7小时','步数8000+','没喝含糖饮料','拉伸10分钟'],
  '今日关照':['早餐','午餐','加餐','晚餐','散步完成','多维 + 益生菌','咖啡 9:30 前','喝水 1600ml','步数8000+','没喝含糖饮料','睡前拉伸','热敷小腹','早点睡','还不错','没感觉','有点难过','想被哄哄']
};
function unpack(properties) {
  return Object.fromEntries(Object.entries(properties).map(([k,v])=>[k,Object.values(v)[0]]));
}
export const db = {
  async getSchema() {return {properties:Object.entries(choices).map(([name,items])=>({name,config:{options:items.map(text=>({id:text,text}))}}))};},
  async query({startCursor}) {
    const offset=Number(startCursor || 0);
    const {rows}=await sql('SELECT id, payload FROM records ORDER BY json_extract(payload, \'$.日期\') DESC, created_at DESC LIMIT 201 OFFSET ?', [offset]);
    return {results:rows.slice(0,200).map(row=>({...JSON.parse(row.payload),_id:row.id})), hasMore:rows.length>200, nextCursor:rows.length>200 ? String(offset+200) : null};
  },
  async addRecord({properties}) {
    const id=crypto.randomUUID();
    await sql('INSERT INTO records(id,payload) VALUES (?,?)',[id,JSON.stringify(unpack(properties))]);
    return {id};
  },
  async updateRecord({recordId,properties}) {
    await sql('UPDATE records SET payload = json_patch(payload, ?) WHERE id = ?',[JSON.stringify(unpack(properties)),recordId]);
  },
  async deleteRecord({recordId}) {await sql('DELETE FROM records WHERE id = ?',[recordId]);}
};
