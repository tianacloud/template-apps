import { createTianaFetch } from '@tianacloud/serverless';

(function(){
  var $=function(s){return document.querySelector(s)};
  var state={mins:25,task:'',endAt:0,timer:0,escAt:0,running:false};
  async function execute(sql,args){
    const c=await window.tiana.connection(), auth=window.tiana.auth;
    if(!auth || typeof auth.getAccessToken!=='function' || c.sql_api!=='hrana-v3') throw Error('数据库连接不可用');
    const fetchSQL=createTianaFetch({origin:c.origin,auth,requestBodyMode:'buffered'});
    const response=await fetchSQL(c.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args:args||[],want_rows:true}},{type:'close'}]})});
    if(!response.ok) throw Error('数据库响应不可用');
    const data=await response.json(), result=data.results?.[0];
    if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('数据库操作未确认');
    return result.response.result.rows;
  }
  function dayKey(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  async function peek(){
    var rows=await execute('SELECT day, count FROM focus_days ORDER BY day DESC');
    var counts={}; rows.forEach(function(row){counts[row[0].value]=Number(row[1].value)});
    var now=new Date(), today=dayKey(now), streak=0;
    if(!counts[today]) now.setDate(now.getDate()-1);
    while(counts[dayKey(now)]){streak++;now.setDate(now.getDate()-1)}
    return {today:counts[today]||0,streak:streak};
  }
  async function bump(){
    var today=dayKey();
    await execute('INSERT INTO focus_days(day,count) VALUES (?,1) ON CONFLICT(day) DO UPDATE SET count=count+1',[{type:'text',value:today}]);
    return peek();
  }
  function pad(n){return (n<10?'0':'')+n}

  /* ---------- 工具 ---------- */
  function toast(msg){
    var el=$('#toast');el.textContent=msg;el.classList.add('on');
    clearTimeout(el._t);el._t=setTimeout(function(){el.classList.remove('on')},2000);
  }
  function setStep(t){$('#step').textContent=t}

  /* ---------- 落笔 ---------- */
  var taskInput=$('#task'),enterBtn=$('#enter');

  function syncEnter(){
    enterBtn.disabled=!taskInput.value.trim();
  }
  taskInput.addEventListener('input',syncEnter);
  syncEnter();

  $('#durs').addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    Array.prototype.forEach.call(this.children,function(x){x.classList.remove('on')});
    b.classList.add('on');
    state.mins=+b.dataset.min;
  });

  enterBtn.addEventListener('click',start);
  taskInput.addEventListener('keydown',function(e){
    if(e.key==='Enter'){e.preventDefault();start()}
  });

  function start(){
    var v=taskInput.value.trim();
    if(!v){taskInput.focus();return}
    state.task=v;
    state.running=true;
    state.endAt=Date.now()+state.mins*60*1000;

    $('#who').textContent=v;
    $('#stage-input').hidden=true;
    $('#stage-focus').hidden=false;
    $('#stage-done').hidden=true;
    document.body.classList.remove('done');
    setStep('02 / 入定');
    $('#rip').classList.remove('go');
    void $('#rip').offsetWidth;
    $('#rip').classList.add('go');
    tick();
    state.timer=setInterval(tick,1000);
    taskInput.blur();
  }

  var C=2*Math.PI*238;
  function tick(){
    var left=Math.max(0,state.endAt-Date.now());
    if(left<=0){finish();return}
    var total=state.mins*60*1000;
    var p=left/total;
    var s=Math.ceil(left/1000);
    $('#clock').textContent=pad(Math.floor(s/60))+':'+pad(s%60);
    var prog=$('#prog');
    prog.style.strokeDasharray=(C*p).toFixed(1)+' '+C.toFixed(1);
  }

  /* ---------- 放弃 ---------- */
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&state.running){
      var now=Date.now();
      if(now-state.escAt<600){abort();state.escAt=0}else{
        state.escAt=now;toast('再按一次 ESC 出定');
      }
    }
  });
  function abort(){
    clearInterval(state.timer);state.running=false;
    $('#stage-focus').hidden=true;$('#stage-input').hidden=false;
    document.body.classList.remove('done');
    setStep('01 / 落笔');
    taskInput.focus();
    toast('已出定。念头还在，下次再敲。');
  }

  /* ---------- 出关 ---------- */
  async function finish(){
    clearInterval(state.timer);state.running=false;
    var m;
    try { m=await bump(); } catch(e) { toast("记录未确认，请刷新后查看统计"); m={today:0,streak:0}; }
    $('#s1').textContent=pad(state.mins)+':00';
    $('#s2').textContent=pad(m.today||0);
    $('#s3').textContent=pad(m.streak||0);
    $('#sub').textContent=state.mins+' 分钟，只做了一件事。';
    $('#stage-focus').hidden=true;
    $('#stage-input').hidden=true;
    $('#stage-done').hidden=false;
    document.body.classList.add('done');
    setStep('03 / 出关');
    taskInput.value='';
    syncEnter();
  }

  $('#again').addEventListener('click',function(){
    document.body.classList.remove('done');
    $('#stage-done').hidden=true;
    $('#stage-input').hidden=false;
    setStep('01 / 落笔');
    taskInput.focus();
  });

  $('#share').addEventListener('click',function(){
    var txt='「一万个念头，一个回车。」\n「一念 · ENTER」是一个只允许你做一件事的应用：写下唯一要做的事，按下回车，世界就只剩这一件事。';
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(function(){toast('文案已复制，去发一条吧')},
        function(){toast('复制失败，请手动选择')});
    }else{toast('文案：'+txt)}
  });

  /* ---------- 初始化 ---------- */
  peek().then(function(p){$('#foot').textContent='一日一念'+(p.today?' · 今日已了 '+p.today:'')}).catch(function(){toast('统计读取失败，请检查连接')});
  taskInput.focus();
})();
