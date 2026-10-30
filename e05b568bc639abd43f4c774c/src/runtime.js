let db,revision=0,saving=false,failed=false;
const cloudStatus=()=>document.querySelector('#cloudStatus');
function status(text){cloudStatus().textContent=text}
async function connect(){
 if(typeof window.tiana?.auth?.getAccessToken!=='function')throw Error('请在已登录的应用中打开');
 const c=await window.tiana.connection();
 if(c.sql_api!=='hrana-v3')throw Error('当前数据库协议不支持安全参数绑定');
 const transport=createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
 db=async(sql,values=[])=>{
  const args=values.map(v=>typeof v==='number'?{type:'integer',value:String(v)}:{type:'text',value:v});
  const res=await transport(c.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if(!res.ok)throw Error('连接中断，请重新读取确认数据');
  const b=await res.json(),first=b.results?.[0];
  if(first?.type!=='ok'||first.response?.type!=='execute')throw Error('数据库未确认结果，请重新读取');
  const result=first.response.result;
  return (result.rows||[]).map(row=>Object.fromEntries(result.cols.map((col,i)=>[col.name,row[i].type==='null'?null:row[i].value])));
 };
 await readStore();startUI();
}
async function readStore(){
 const rows=await db("SELECT payload,revision FROM weekly_store WHERE id='main'");
 if(rows.length!==1)throw Error('周报数据结构未初始化');
 const value=JSON.parse(rows[0].payload);validateBackup(value);store=value;revision=Number(rows[0].revision);failed=false;
 status('已从云端读取');
}
async function persistStore(){
 if(saving||failed)return;
 const payload=JSON.stringify(store);if(payload.length>2000000){showFailure('周报超过2MB，请导出备份并整理');return}
 saving=true;document.body.classList.add('busy');status('正在保存到云端…');
 try{
  const rows=await db("UPDATE weekly_store SET payload=?,revision=revision+1 WHERE id='main' AND revision=? RETURNING revision",[payload,revision]);
  if(rows.length!==1)throw Error('周报已在其他页面更新，请重新读取后编辑');
  revision=Number(rows[0].revision);status('已保存到云端 ✓');
 }catch(e){showFailure(e.message)}finally{saving=false;document.body.classList.remove('busy')}
}
function showFailure(message){
 failed=true;status(message+'。请先导出当前内容作为备份，再重新读取；不会自动重试写入。');
 const button=document.createElement('button');button.className='btn btn-outline';button.textContent='重新读取云端数据';
 button.onclick=async()=>{try{await readStore();render()}catch(e){showFailure(e.message)}};cloudStatus().append(button);
}
document.addEventListener('click',e=>{
 if((saving||failed)&&!e.target.closest('#cloudStatus')&&!e.target.closest('[onclick="exportJson()"]')){e.preventDefault();e.stopImmediatePropagation()}
},true);
document.addEventListener('keydown',e=>{if(saving||failed){e.preventDefault();e.stopImmediatePropagation()}},true);
const handlers={loadTemplate,confirmClear,copyMd,copyPlain,exportJson,importJson,openDrawer,closeDrawer,renderHistory,openWeek,delWeek,confirmYes,confirmNo,shiftWeek,goToday,addItem,delItem,editItem,saveEdit,move,dragStart,dropTo,toggleDone,render};
Object.assign(window,handlers);
function bindUI(){
 for(const input of document.querySelectorAll('input[type=text]'))input.maxLength=(input.id.startsWith('n-')||input.id==='e-note')?10000:1000;
 for(const element of document.querySelectorAll('*'))for(const attr of [...element.attributes]){
  if(!['onclick','onkeydown','oninput','onchange','ondragstart','ondragover','ondrop'].includes(attr.name))continue;
  const action=attr.value;
  element[attr.name]=event=>{
   let command=action;
   if(command.startsWith("if(event.key==='Enter')")){if(event.key!=='Enter')return;command=command.slice(23)}
   if(command.startsWith('event.stopPropagation();')){event.stopPropagation();command=command.slice(24)}
   if(command==='event.preventDefault()'){event.preventDefault();return}
   if(command==="document.getElementById('importFile').click()"){document.querySelector('#importFile').click();return}
   const match=/^(\w+)\((.*)\)$/.exec(command);if(!match||!handlers[match[1]])return;
   const args=match[2]?match[2].split(',').map(x=>{x=x.trim();if(x==='event')return event;if(x==='this')return element;if(/^'.*'$/.test(x))return x.slice(1,-1);if(/^-?\d+$/.test(x))return Number(x);throw Error('Invalid UI action')}):[];
   return handlers[match[1]](...args);
  };
 }
}
bindUI();
connect().catch(e=>showFailure(e.message));
