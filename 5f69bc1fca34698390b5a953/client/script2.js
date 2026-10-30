
/* 网页版引导层：首次访问自动出现；同一组件兼作「使用说明」 */
(function(){
  var WELCOME='wb_ledger_web_welcome';
  var mask=document.getElementById('wbw-mask');
  if(!mask)return;
  var open=function(){mask.classList.add('on');};
  var close=function(){mask.classList.remove('on');};
  var seen=function(){try{return ledgerStorage.getItem(WELCOME)==='1'}catch(e){return false}};
  var markSeen=function(){try{ledgerStorage.setItem(WELCOME,'1')}catch(e){}};

  document.getElementById('wbw-x').addEventListener('click',function(){markSeen();close();});
  document.getElementById('wbw-demo').addEventListener('click',function(){markSeen();close();});
  mask.addEventListener('click',function(e){if(e.target===mask){markSeen();close();}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&mask.classList.contains('on')){markSeen();close();}});

  /* 清空示例：只删本应用的记录键，不动其它 ledgerStorage 内容；置 demo 标记避免刷新后又自动载入示例 */
  document.getElementById('wbw-start').addEventListener('click',function(){
    markSeen();
    window.clearLedgerExample();
    close();
  });

  ['wbw-help-link','wbw-help-btn'].forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.addEventListener('click',function(e){e.preventDefault();open();});
  });

  if(!seen())setTimeout(open,320);
})();
