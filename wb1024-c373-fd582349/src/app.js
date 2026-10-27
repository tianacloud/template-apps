
(function(){
  var $=function(s){return document.querySelector(s)};
  var KEY='yinian.v1';
  var state={mins:25,task:'',endAt:0,timer:0,escAt:0,running:false};

  /* ---------- 本地记忆 ---------- */
  function load(){
    try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}
  }
  function save(o){
    try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}
  }
  function dayKey(d){d=d||new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
  function bump(){
    var m=load(),t=dayKey();
    if(m.lastDay===t){m.today=(m.today||0)+1}
    else{
      var y=new Date();y.setDate(y.getDate()-1);
      m.streak=(m.lastDay===dayKey(y))?(m.streak||0)+1:1;
      m.today=1;m.lastDay=t;
    }
    m.total=(m.total||0)+1;
    save(m);return m;
  }
  function peek(){
    var m=load(),t=dayKey();
    if(m.lastDay!==t)return{streak:m.lastDay?(m.streak||0):0,today:0};
    return{streak:m.streak||1,today:m.today||0};
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
  function finish(){
    clearInterval(state.timer);state.running=false;
    var m=bump();
    $('#s1').textContent=pad(state.mins)+':00';
    $('#s2').textContent=pad(m.today||1);
    $('#s3').textContent=pad(m.streak||1);
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
  var p=peek();
  $('#foot').textContent='一日一念'+(p.today?' · 今日已了 '+p.today:'');
  taskInput.focus();
})();
