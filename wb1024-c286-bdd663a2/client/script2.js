
/* 网页版引导层：首次访问自动出现；同一组件兼作「使用说明」 */
(function(){
  var WELCOME='wb_ledger_web_welcome';
  var mask=document.getElementById('wbw-mask');
  if(!mask)return;
  var open=function(){mask.classList.add('on');};
  var close=function(){mask.classList.remove('on');};
  var seen=function(){try{return localStorage.getItem(WELCOME)==='1'}catch(e){return false}};
  var markSeen=function(){try{localStorage.setItem(WELCOME,'1')}catch(e){}};

  document.getElementById('wbw-x').addEventListener('click',function(){markSeen();close();});
  document.getElementById('wbw-demo').addEventListener('click',function(){markSeen();close();});
  mask.addEventListener('click',function(e){if(e.target===mask){markSeen();close();}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&mask.classList.contains('on')){markSeen();close();}});

  /* 清空示例：只删本应用的记录键，不动其它 localStorage 内容；置 demo 标记避免刷新后又自动载入示例 */
  document.getElementById('wbw-start').addEventListener('click',function(){
    try{
      var rm=[];
      for(var i=0;i<localStorage.length;i++){
        var k=localStorage.key(i);
        if(k&&k.indexOf('wb_ledger_records_')===0)rm.push(k);
      }
      rm.forEach(function(k){localStorage.removeItem(k)});
      localStorage.setItem('wb_ledger_demo_loaded','1');
      localStorage.setItem(WELCOME,'1');
    }catch(e){}
    location.reload();
  });

  ['wbw-help-link','wbw-help-btn'].forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.addEventListener('click',function(e){e.preventDefault();open();});
  });

  if(!seen())setTimeout(open,320);
})();
